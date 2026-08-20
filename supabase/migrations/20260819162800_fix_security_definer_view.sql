-- Fix SECURITY DEFINER warning on active_homepage_shop_features view
-- Recreate with security_invoker = true so RLS of the querying user is respected

DROP VIEW IF EXISTS public.active_homepage_shop_features;

CREATE VIEW public.active_homepage_shop_features
  WITH (security_barrier = true, security_invoker = true) AS
SELECT DISTINCT ON (page.business_id)
  feature.id, feature.starts_at, feature.expires_at,
  page.business_id, page.business_slug, page.business_name,
  page.category, page.location_district, page.location_city,
  page.is_verified, page.logo_url, page.content_json
FROM public.homepage_feature_activations feature
JOIN public.active_landing_pages page ON page.business_id = feature.business_id
WHERE feature.feature_type = 'shop' AND feature.expires_at > now()
ORDER BY page.business_id, feature.starts_at DESC;

GRANT SELECT ON public.active_homepage_shop_features TO anon, authenticated;

-- Fix SECURITY DEFINER warning on active_homepage_product_features view
DROP VIEW IF EXISTS public.active_homepage_product_features;

CREATE VIEW public.active_homepage_product_features
  WITH (security_barrier = true, security_invoker = true) AS
SELECT feature.id, feature.starts_at, feature.expires_at, product.id as product_id, product.name, product.description,
  product.price, product.price_original, product.image_url, product.category, product.business_id,
  page.business_slug, page.business_name, page.logo_url
FROM public.homepage_feature_activations feature
JOIN public.shop_products product ON product.id = feature.product_id AND product.status = 'active'
JOIN public.active_landing_pages page ON page.business_id = product.business_id
WHERE feature.feature_type = 'product' AND feature.expires_at > now();

GRANT SELECT ON public.active_homepage_product_features TO anon, authenticated;

-- Fix SECURITY DEFINER warning on active_landing_pages view
DROP VIEW IF EXISTS public.active_landing_pages CASCADE;
CREATE VIEW public.active_landing_pages
  WITH (security_barrier = true, security_invoker = true) AS
  SELECT
    lp.id,
    lp.id AS landing_page_id,
    lp.business_id,
    lp.template_id,
    lp.content_json,
    lp.is_published,
    lp.status AS page_status,
    lp.updated_at,
    -- Business Profile
    bp.account_id,
    bp.business_name,
    bp.slug AS business_slug,
    bp.category,
    bp.categories,
    bp.theme_color,
    bp.zalo_phone,
    bp.hotline,
    bp.logo_url,
    bp.is_verified,
    bp.rating_score,
    bp.location_city,
    bp.location_district,
    bp.location_ward,
    bp.social_links,
    -- Business Location (ch? l?y 1 d?a ch? d? hi?n th? b?n d?)
    (SELECT lat FROM public.business_locations WHERE business_id = bp.id LIMIT 1) as lat,
    (SELECT lng FROM public.business_locations WHERE business_id = bp.id LIMIT 1) as lng,
    (SELECT address_full FROM public.business_locations WHERE business_id = bp.id LIMIT 1) as address_full,
    -- Account info
    acc.subscription_status,
    acc.expiry_date,
    acc.email AS email_owner
  FROM public.landing_pages lp
  JOIN public.business_profiles bp ON lp.business_id = bp.id
  JOIN public.profiles acc ON bp.account_id = acc.id;

GRANT SELECT ON public.active_landing_pages TO anon, authenticated;

-- Fix SECURITY DEFINER warning on directory_shops view
DROP VIEW IF EXISTS public.directory_shops;
CREATE VIEW public.directory_shops
  WITH (security_barrier = true, security_invoker = true) AS
SELECT
  bp.id AS business_id,
  bp.slug AS business_slug,
  bp.business_name,
  bp.category,
  bp.location_district,
  bp.location_city,
  bp.is_verified,
  bp.logo_url,
  bp.rating_score,
  lp.updated_at,
  COALESCE(
    CASE
      WHEN jsonb_typeof(lp.content_json #> '{hero_section,hero_slides,0}') = 'string'
        THEN trim(both '"' from (lp.content_json #>> '{hero_section,hero_slides,0}'))
      WHEN jsonb_typeof(lp.content_json #> '{hero_section,hero_slides,0}') = 'object'
        THEN lp.content_json #>> '{hero_section,hero_slides,0,image_url}'
      WHEN jsonb_typeof(lp.content_json #> '{hero_slides,0}') = 'object'
        THEN lp.content_json #>> '{hero_slides,0,image_url}'
      ELSE NULL
    END,
    ''
  ) AS cover_image,
  bp.categories,
  bp.location_ward
FROM public.landing_pages lp
JOIN public.business_profiles bp ON bp.id = lp.business_id
WHERE lp.is_published = TRUE AND lp.status = 'Published'
  AND private.has_shop_publish_entitlement(bp.id);

GRANT SELECT ON public.directory_shops TO anon, authenticated, service_role;
