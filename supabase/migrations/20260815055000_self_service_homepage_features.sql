-- Shop and product homepage placement is self-service. Blog and fanpage work
-- remain requests handled by the super-admin team.
alter table public.membership_benefit_requests
  drop constraint if exists membership_benefit_requests_benefit_type_check;
alter table public.membership_benefit_requests
  add constraint membership_benefit_requests_benefit_type_check
  check (benefit_type in ('admin_blog', 'facebook_post'));

create table if not exists public.homepage_feature_activations (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.business_profiles(id) on delete cascade,
  subscription_id uuid not null references public.subscriptions(id) on delete restrict,
  feature_type text not null check (feature_type in ('shop', 'product')),
  product_id uuid references public.shop_products(id) on delete restrict,
  starts_at timestamptz not null default now(),
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  check ((feature_type = 'shop' and product_id is null) or (feature_type = 'product' and product_id is not null))
);

create index if not exists idx_homepage_feature_activations_active
  on public.homepage_feature_activations(feature_type, expires_at desc);
create index if not exists idx_homepage_feature_activations_subscription
  on public.homepage_feature_activations(subscription_id, feature_type);

alter table public.homepage_feature_activations enable row level security;
drop policy if exists homepage_feature_activations_shop_read on public.homepage_feature_activations;
create policy homepage_feature_activations_shop_read on public.homepage_feature_activations for select to authenticated
  using (business_id in (select id from public.business_profiles where account_id = (select auth.uid())) or (select private.is_super_admin()));
revoke all on public.homepage_feature_activations from anon;
revoke insert, update, delete on public.homepage_feature_activations from authenticated;
grant select on public.homepage_feature_activations to authenticated;

create or replace function private.enforce_homepage_feature_activation()
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
  select subscription.business_id, coalesce(subscription.benefits_snapshot, package.limits, '{}'::jsonb),
      subscription.status, subscription.verified, subscription.end_date
    into selected_business, selected_limits, selected_status, selected_verified, selected_end_date
  from public.subscriptions subscription join public.packages package on package.id = subscription.package_id
  where subscription.id = new.subscription_id;
  if selected_business is null or selected_business <> new.business_id
    or selected_status <> 'active' or selected_verified <> true
    or selected_end_date is null or selected_end_date <= now() then
    raise exception 'homepage_feature_not_eligible';
  end if;

  if new.feature_type = 'product' and not exists (
    select 1 from public.shop_products product
    where product.id = new.product_id and product.business_id = new.business_id and product.status = 'active'
  ) then raise exception 'homepage_feature_product_not_owned'; end if;

  quota_key := case new.feature_type when 'shop' then 'homepage_shop_feature_count' else 'homepage_product_feature_count' end;
  allowed_count := case when coalesce(selected_limits ->> quota_key, '') ~ '^[0-9]+$' then (selected_limits ->> quota_key)::integer else 0 end;
  select count(*) into used_count from public.homepage_feature_activations activation
    where activation.subscription_id = new.subscription_id and activation.feature_type = new.feature_type;
  if used_count >= allowed_count then raise exception 'homepage_feature_quota_exceeded'; end if;

  new.starts_at := coalesce(new.starts_at, now());
  new.expires_at := new.starts_at + make_interval(days => case
    when new.feature_type = 'shop' and coalesce(selected_limits ->> 'homepage_shop_feature_duration_days', '') ~ '^[0-9]+$'
      then (selected_limits ->> 'homepage_shop_feature_duration_days')::integer
    when new.feature_type = 'product' and coalesce(selected_limits ->> 'homepage_product_feature_duration_days', '') ~ '^[0-9]+$'
      then (selected_limits ->> 'homepage_product_feature_duration_days')::integer
    else 7
  end);
  return new;
end;
$$;

drop trigger if exists homepage_feature_activations_quota on public.homepage_feature_activations;
create trigger homepage_feature_activations_quota
before insert on public.homepage_feature_activations
for each row execute function private.enforce_homepage_feature_activation();

drop view if exists public.active_homepage_shop_features;
create view public.active_homepage_shop_features with (security_barrier = true) as
select feature.id, feature.starts_at, feature.expires_at, page.business_id, page.business_slug, page.business_name,
  page.category, page.location_district, page.location_city, page.is_verified, page.logo_url, page.content_json
from public.homepage_feature_activations feature
join public.active_landing_pages page on page.business_id = feature.business_id
where feature.feature_type = 'shop' and feature.expires_at > now();

drop view if exists public.active_homepage_product_features;
create view public.active_homepage_product_features with (security_barrier = true) as
select feature.id, feature.starts_at, feature.expires_at, product.id as product_id, product.name, product.description,
  product.price, product.price_original, product.image_url, product.category, product.business_id,
  page.business_slug, page.business_name, page.logo_url
from public.homepage_feature_activations feature
join public.shop_products product on product.id = feature.product_id and product.status = 'active'
join public.active_landing_pages page on page.business_id = product.business_id
where feature.feature_type = 'product' and feature.expires_at > now();

revoke all on public.active_homepage_shop_features, public.active_homepage_product_features from public, anon, authenticated;
grant select on public.active_homepage_shop_features, public.active_homepage_product_features to anon, authenticated;
