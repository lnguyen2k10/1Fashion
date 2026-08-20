-- A shop may operate in more than one business category.  `category` remains
-- the primary display category for backward compatibility; `categories` is the
-- canonical filterable list.  District and ward are stored independently.
alter table public.business_profiles
  add column if not exists categories text[] not null default '{}'::text[],
  add column if not exists location_ward text;

update public.business_profiles
set categories = array[category]
where coalesce(cardinality(categories), 0) = 0
  and nullif(trim(category), '') is not null;

alter table public.business_profiles
  alter column category set default 'Chưa phân loại';

alter table public.business_profiles
  drop constraint if exists business_profiles_categories_max_items;
alter table public.business_profiles
  add constraint business_profiles_categories_max_items
  check (cardinality(categories) <= 12);

create index if not exists idx_business_profiles_categories_gin
  on public.business_profiles using gin (categories);
create index if not exists idx_business_profiles_location_district_ward
  on public.business_profiles(location_district, location_ward);

-- Shop owners can edit these two new fields, under the existing owner/admin RLS policy.
grant update (categories, location_ward) on public.business_profiles to authenticated;

-- Preserve the public entitlement gate while exposing the new search fields.
create or replace view public.active_landing_pages with (security_barrier = true) as
select lp.id, lp.id as landing_page_id, lp.business_id, lp.template_id, lp.content_json,
  lp.is_published, lp.status as page_status, lp.updated_at, bp.business_name,
  bp.slug as business_slug, bp.category, bp.theme_color, bp.zalo_phone, bp.hotline,
  bp.logo_url, bp.is_verified, bp.rating_score, bp.location_city, bp.location_district,
  bp.social_links, bl.lat, bl.lng, bl.address_full, bp.categories, bp.location_ward
from public.landing_pages lp
join public.business_profiles bp on bp.id = lp.business_id
left join public.business_locations bl on bl.business_id = bp.id
where lp.is_published = true and lp.status = 'Published'
  and private.has_shop_publish_entitlement(bp.id);

create or replace view public.directory_shops as
select
  business_slug,
  business_name,
  category,
  location_district,
  location_city,
  is_verified,
  logo_url,
  rating_score,
  updated_at,
  coalesce(
    case
      when jsonb_typeof(content_json #> '{hero_section,hero_slides,0}') = 'string'
        then trim(both '"' from (content_json #>> '{hero_section,hero_slides,0}'))
      when jsonb_typeof(content_json #> '{hero_section,hero_slides,0}') = 'object'
        then content_json #>> '{hero_section,hero_slides,0,image_url}'
      else null
    end,
    ''
  ) as cover_image,
  categories,
  location_ward
from public.active_landing_pages;

grant select on public.active_landing_pages, public.directory_shops to anon, authenticated, service_role;
