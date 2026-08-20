-- Add business_id to directory_shops view so we can filter demo vs real shops
CREATE OR REPLACE VIEW public.directory_shops AS
SELECT
  bp.id AS business_id,
  business_slug,
  business_name,
  category,
  location_district,
  location_city,
  is_verified,
  logo_url,
  rating_score,
  lp.updated_at,
  COALESCE(
    CASE
      WHEN jsonb_typeof(content_json #> '{hero_section,hero_slides,0}') = 'string'
        THEN trim(both '"' from (content_json #>> '{hero_section,hero_slides,0}'))
      WHEN jsonb_typeof(content_json #> '{hero_section,hero_slides,0}') = 'object'
        THEN content_json #>> '{hero_section,hero_slides,0,image_url}'
      WHEN jsonb_typeof(content_json #> '{hero_slides,0}') = 'object'
        THEN content_json #>> '{hero_slides,0,image_url}'
      ELSE NULL
    END,
    ''
  ) AS cover_image,
  categories,
  location_ward
FROM public.landing_pages lp
JOIN public.business_profiles bp ON bp.id = lp.business_id
WHERE lp.is_published = TRUE AND lp.status = 'Published'
  AND private.has_shop_publish_entitlement(bp.id);

GRANT SELECT ON public.directory_shops TO anon, authenticated, service_role;
