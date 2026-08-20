-- Membership package entitlements and the one-year refund workflow.

create table if not exists public.refund_requests (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.business_profiles(id) on delete cascade,
  subscription_id uuid not null unique references public.subscriptions(id) on delete cascade,
  reason text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'refunded')),
  admin_note text,
  requested_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles(id) on delete set null
);

alter table public.refund_requests enable row level security;
drop policy if exists refund_requests_shop_read on public.refund_requests;
drop policy if exists refund_requests_shop_insert on public.refund_requests;
drop policy if exists refund_requests_admin_update on public.refund_requests;
create policy refund_requests_shop_read on public.refund_requests for select to authenticated
  using (business_id in (select id from public.business_profiles where account_id = (select auth.uid())) or (select private.is_super_admin()));
create policy refund_requests_shop_insert on public.refund_requests for insert to authenticated
  with check (business_id in (select id from public.business_profiles where account_id = (select auth.uid())));
create policy refund_requests_admin_update on public.refund_requests for update to authenticated
  using ((select private.is_super_admin())) with check ((select private.is_super_admin()));
grant select, insert on public.refund_requests to authenticated;
grant update on public.refund_requests to authenticated;
create index if not exists idx_refund_requests_status_requested on public.refund_requests(status, requested_at desc);

-- Product capacity is enforced at the database boundary. A package can set
-- `max_products` to null for unlimited products; valid trial shops are kept
-- unlimited until a product-limited package is activated.
create or replace function private.shop_product_limit(target_business_id uuid)
returns integer
language plpgsql
stable
security definer
set search_path = public, private, pg_temp
as $$
declare
  package_limit integer;
begin
  select case
    when package.limits ? 'max_products'
      and coalesce(package.limits ->> 'max_products', '') ~ '^[0-9]+$'
      then (package.limits ->> 'max_products')::integer
    when package.limits ? 'max_products' then -1
    else -1
  end
  into package_limit
  from public.subscriptions subscription
  join public.packages package on package.id = subscription.package_id
  where subscription.business_id = target_business_id
    and subscription.status = 'active'
    and subscription.verified = true
    and subscription.end_date > now()
  order by subscription.end_date desc
  limit 1;

  if package_limit is not null then return package_limit; end if;

  if exists (
    select 1
    from public.business_profiles business
    join public.profiles owner on owner.id = business.account_id
    where business.id = target_business_id
      and owner.subscription_status = 'trial'
      and owner.expiry_date > now()
  ) then return -1; end if;

  return 0;
end;
$$;

create or replace function private.enforce_product_quota()
returns trigger
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
declare
  allowed_products integer;
  current_products integer;
begin
  if private.is_super_admin() then return new; end if;
  allowed_products := private.shop_product_limit(new.business_id);
  if allowed_products < 0 then return new; end if;

  select count(*) into current_products
  from public.shop_products
  where business_id = new.business_id;
  if current_products >= allowed_products then
    raise exception 'product_quota_exceeded';
  end if;
  return new;
end;
$$;

drop trigger if exists shop_products_quota on public.shop_products;
create trigger shop_products_quota
before insert on public.shop_products
for each row execute function private.enforce_product_quota();

-- Membership packages are historical billing records. A package with a
-- subscription must be retained rather than cascading and deleting the shop's
-- billing history when an administrator removes it from the catalogue.
alter table public.subscriptions drop constraint if exists subscriptions_package_id_fkey;
alter table public.subscriptions
  add constraint subscriptions_package_id_fkey
  foreign key (package_id) references public.packages(id) on delete restrict;

-- Public-page benefit is package-configurable. Old active packages retain public access
-- until an explicit public_landing_page:false is configured.
create or replace function private.has_shop_publish_entitlement(target_business_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, private, pg_temp
as $$
  select exists (
    select 1 from public.business_profiles business
    join public.profiles owner on owner.id = business.account_id
    where business.id = target_business_id and (
      owner.role = 'super_admin'
      or (owner.subscription_status = 'trial' and owner.expiry_date > now())
      or exists (
        select 1 from public.subscriptions subscription
        join public.packages package on package.id = subscription.package_id
        where subscription.business_id = business.id and subscription.status = 'active'
          and subscription.verified = true and subscription.end_date > now()
          and case when package.limits ->> 'public_landing_page' in ('true', 'false')
            then (package.limits ->> 'public_landing_page')::boolean else true end
      )
    )
  );
$$;

drop view if exists public.active_landing_pages;
create view public.active_landing_pages with (security_barrier = true) as
select lp.id, lp.id as landing_page_id, lp.business_id, lp.template_id, lp.content_json,
  lp.is_published, lp.status as page_status, lp.updated_at, bp.business_name,
  bp.slug as business_slug, bp.category, bp.theme_color, bp.zalo_phone, bp.hotline,
  bp.logo_url, bp.is_verified, bp.rating_score, bp.location_city, bp.location_district,
  bp.social_links, bl.lat, bl.lng, bl.address_full
from public.landing_pages lp
join public.business_profiles bp on bp.id = lp.business_id
left join public.business_locations bl on bl.business_id = bp.id
where lp.is_published = true and lp.status = 'Published'
  and private.has_shop_publish_entitlement(bp.id);

revoke all on public.active_landing_pages from anon, authenticated, public;
grant select on public.active_landing_pages to anon, authenticated;
