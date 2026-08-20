-- Shop production hardening: enforce trial/paid entitlement, enable the inbox
-- delete action, and remove hard-coded bank instructions from the shop UI.

alter table public.site_settings
  add column if not exists manual_payment_instructions text not null default '';

-- A published shop must be within its 30-day trial or an approved active package.
-- The owner may still save a draft after expiry, but cannot publish new content.
create or replace function private.has_shop_publish_entitlement(target_business_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public, private, pg_temp
as $$
  select exists (
    select 1
    from public.business_profiles business
    join public.profiles owner on owner.id = business.account_id
    where business.id = target_business_id
      and (
        owner.role = 'super_admin'
        or (
          owner.subscription_status in ('trial', 'active')
          and owner.expiry_date is not null
          and owner.expiry_date > now()
        )
      )
  );
$$;

revoke all on function private.has_shop_publish_entitlement(uuid) from public;
grant execute on function private.has_shop_publish_entitlement(uuid) to authenticated;

create or replace function private.enforce_landing_page_publish_entitlement()
returns trigger
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
begin
  if new.is_published = true
     and new.status = 'Published'
     and (
       tg_op = 'INSERT'
       or old.is_published is distinct from new.is_published
       or old.status is distinct from new.status
       or old.content_json is distinct from new.content_json
     )
     and not private.is_super_admin()
     and not private.has_shop_publish_entitlement(new.business_id) then
    raise exception 'publish_entitlement_required';
  end if;
  return new;
end;
$$;

drop trigger if exists landing_pages_publish_entitlement on public.landing_pages;
create trigger landing_pages_publish_entitlement
before insert or update on public.landing_pages
for each row execute function private.enforce_landing_page_publish_entitlement();

-- A page disappears from every public read path immediately after expiry.
drop view if exists public.active_landing_pages;
create view public.active_landing_pages with (security_barrier = true) as
select
  lp.id,
  lp.id as landing_page_id,
  lp.business_id,
  lp.template_id,
  lp.content_json,
  lp.is_published,
  lp.status as page_status,
  lp.updated_at,
  bp.business_name,
  bp.slug as business_slug,
  bp.category,
  bp.theme_color,
  bp.zalo_phone,
  bp.hotline,
  bp.logo_url,
  bp.is_verified,
  bp.rating_score,
  bp.location_city,
  bp.location_district,
  bp.social_links,
  bl.lat,
  bl.lng,
  bl.address_full
from public.landing_pages lp
join public.business_profiles bp on bp.id = lp.business_id
join public.profiles owner on owner.id = bp.account_id
left join public.business_locations bl on bl.business_id = bp.id
where lp.is_published = true
  and lp.status = 'Published'
  and (
    owner.role = 'super_admin'
    or (
      owner.subscription_status in ('trial', 'active')
      and owner.expiry_date is not null
      and owner.expiry_date > now()
    )
  );

revoke all on public.active_landing_pages from anon, authenticated, public;
grant select on public.active_landing_pages to anon, authenticated;

-- The dashboard already presents a delete button; authorize that exact action
-- only for the owning shop or a super admin.
create policy messages_shop_or_admin_delete on public.shop_messages for delete to authenticated
  using (
    business_id in (select id from public.business_profiles where account_id = (select auth.uid()))
    or (select private.is_super_admin())
  );
grant delete on public.shop_messages to authenticated;

-- Offers are a paid/trial entitlement, not merely a number shown in the UI.
-- Trial shops receive three offers; an approved package supplies its configured limit.
create or replace function private.shop_offer_limit(target_business_id uuid)
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
    when (package.limits ->> 'max_offers') ~ '^[0-9]+$'
      then (package.limits ->> 'max_offers')::integer
    else 0
  end
  into package_limit
  from public.subscriptions subscription
  join public.packages package on package.id = subscription.package_id
  where subscription.business_id = target_business_id
    and subscription.status = 'active'
    and subscription.verified = true
    and subscription.end_date is not null
    and subscription.end_date > now()
  order by subscription.end_date desc
  limit 1;

  if package_limit is not null then return greatest(package_limit, 0); end if;

  if exists (
    select 1 from public.business_profiles business
    join public.profiles owner on owner.id = business.account_id
    where business.id = target_business_id
      and owner.subscription_status = 'trial'
      and owner.expiry_date is not null
      and owner.expiry_date > now()
  ) then return 3; end if;

  return 0;
end;
$$;

revoke all on function private.shop_offer_limit(uuid) from public;
grant execute on function private.shop_offer_limit(uuid) to authenticated;

create or replace function private.enforce_offer_quota()
returns trigger
language plpgsql
security definer
set search_path = public, private, pg_temp
as $$
declare
  allowed_offers integer;
  current_offers integer;
begin
  if private.is_super_admin() then return new; end if;
  allowed_offers := private.shop_offer_limit(new.business_id);
  select count(*) into current_offers
  from public.business_offers
  where business_id = new.business_id;
  if current_offers >= allowed_offers then
    raise exception 'offer_quota_exceeded';
  end if;
  return new;
end;
$$;

drop trigger if exists business_offers_quota on public.business_offers;
create trigger business_offers_quota
before insert on public.business_offers
for each row execute function private.enforce_offer_quota();
