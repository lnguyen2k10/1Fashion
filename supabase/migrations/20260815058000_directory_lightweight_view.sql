-- Directory cards only need a cover image, not each landing page's full JSON.
-- Keeping this projection in the database bounds response size as shop content grows.
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
  ) as cover_image
from public.active_landing_pages;

grant select on public.directory_shops to anon, authenticated, service_role;
