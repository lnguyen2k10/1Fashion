-- Operational queue for benefits fulfilled manually by the super-admin team.
alter table public.subscriptions
  add column if not exists benefits_snapshot jsonb;

update public.subscriptions subscription
set benefits_snapshot = package.limits
from public.packages package
where package.id = subscription.package_id
  and subscription.benefits_snapshot is null
  and subscription.status = 'active'
  and subscription.verified = true;

create table if not exists public.membership_benefit_requests (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.business_profiles(id) on delete cascade,
  subscription_id uuid not null references public.subscriptions(id) on delete restrict,
  benefit_type text not null check (benefit_type in ('admin_blog', 'homepage_shop_feature', 'homepage_product_feature', 'facebook_post')),
  details text not null default '',
  status text not null default 'pending' check (status in ('pending', 'in_progress', 'fulfilled', 'rejected')),
  admin_note text,
  requested_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles(id) on delete set null
);

create index if not exists idx_membership_benefit_requests_admin_queue
  on public.membership_benefit_requests(status, requested_at desc);
create index if not exists idx_membership_benefit_requests_subscription
  on public.membership_benefit_requests(subscription_id, benefit_type);

alter table public.membership_benefit_requests enable row level security;
drop policy if exists membership_benefit_requests_shop_read on public.membership_benefit_requests;
drop policy if exists membership_benefit_requests_admin_update on public.membership_benefit_requests;
create policy membership_benefit_requests_shop_read on public.membership_benefit_requests for select to authenticated
  using (business_id in (select id from public.business_profiles where account_id = (select auth.uid())) or (select private.is_super_admin()));
create policy membership_benefit_requests_admin_update on public.membership_benefit_requests for update to authenticated
  using ((select private.is_super_admin())) with check ((select private.is_super_admin()));
revoke all on public.membership_benefit_requests from anon;
revoke insert, update, delete on public.membership_benefit_requests from authenticated;
grant select on public.membership_benefit_requests to authenticated;

-- A server-side trigger makes quotas reliable even when requests are created
-- concurrently or outside the browser UI. Rejected requests do not consume a slot.
create or replace function private.enforce_membership_benefit_quota()
returns trigger
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
declare
  selected_business uuid;
  selected_limits jsonb;
  selected_status text;
  selected_verified boolean;
  selected_end_date timestamptz;
  quota_key text;
  allowed_count integer;
  used_count integer;
begin
  select subscription.business_id,
      coalesce(subscription.benefits_snapshot, package.limits, '{}'::jsonb),
      subscription.status, subscription.verified, subscription.end_date
    into selected_business, selected_limits, selected_status, selected_verified, selected_end_date
  from public.subscriptions subscription
  join public.packages package on package.id = subscription.package_id
  where subscription.id = new.subscription_id;

  if selected_business is null or selected_business <> new.business_id
    or selected_status <> 'active' or selected_verified <> true
    or selected_end_date is null or selected_end_date <= now() then
    raise exception 'membership_benefit_not_eligible';
  end if;

  quota_key := case new.benefit_type
    when 'admin_blog' then 'max_admin_blog_posts'
    when 'homepage_shop_feature' then 'homepage_shop_feature_count'
    when 'homepage_product_feature' then 'homepage_product_feature_count'
    when 'facebook_post' then 'facebook_post_count'
  end;
  allowed_count := case
    when coalesce(selected_limits ->> quota_key, '') ~ '^[0-9]+$'
      then (selected_limits ->> quota_key)::integer
    else 0
  end;

  select count(*) into used_count
  from public.membership_benefit_requests request
  where request.subscription_id = new.subscription_id
    and request.benefit_type = new.benefit_type
    and request.status in ('pending', 'in_progress', 'fulfilled');
  if used_count >= allowed_count then
    raise exception 'membership_benefit_quota_exceeded';
  end if;
  return new;
end;
$$;

drop trigger if exists membership_benefit_requests_quota on public.membership_benefit_requests;
create trigger membership_benefit_requests_quota
before insert on public.membership_benefit_requests
for each row execute function private.enforce_membership_benefit_quota();

-- Lock the package limits at activation, so a later catalogue edit cannot alter
-- an already purchased subscription's promised benefits.
create or replace function public.review_subscription(subscription_id uuid, approve boolean)
returns void
language plpgsql
security definer
set search_path = public, private, auth, pg_temp
as $$
declare
  selected_subscription public.subscriptions%rowtype;
  package_duration integer;
  package_limits jsonb;
begin
  if not private.is_super_admin() then raise exception 'forbidden'; end if;

  select * into selected_subscription from public.subscriptions where id = subscription_id for update;
  if not found then raise exception 'subscription_not_found'; end if;

  if approve then
    select coalesce(duration_days, 30), coalesce(limits, '{}'::jsonb)
      into package_duration, package_limits
    from public.packages where id = selected_subscription.package_id;
    update public.subscriptions
      set status = 'active', verified = true, start_date = now(),
        end_date = now() + make_interval(days => package_duration), benefits_snapshot = package_limits
    where id = subscription_id;
    update public.profiles
      set subscription_status = 'active', expiry_date = now() + make_interval(days => package_duration)
    where id = (select account_id from public.business_profiles where id = selected_subscription.business_id);
  else
    update public.subscriptions set status = 'rejected', verified = false where id = subscription_id;
  end if;

  insert into public.admin_audit_logs (admin_id, action, target_id, target_type, details)
  values (auth.uid(), case when approve then 'APPROVE_SUBSCRIPTION' else 'REJECT_SUBSCRIPTION' end, subscription_id, 'subscription', jsonb_build_object('approved', approve));
end;
$$;

revoke all on function public.review_subscription(uuid, boolean) from public;
grant execute on function public.review_subscription(uuid, boolean) to authenticated;
