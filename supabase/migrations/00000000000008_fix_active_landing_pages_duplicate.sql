-- Fix duplicate rows in active_landing_pages due to multiple business_locations

DROP VIEW IF EXISTS public.active_landing_pages CASCADE;
CREATE OR REPLACE VIEW public.active_landing_pages AS
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
    bp.theme_color,
    bp.zalo_phone,
    bp.hotline,
    bp.logo_url,
    bp.is_verified,
    bp.rating_score,
    bp.location_city,
    bp.location_district,
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

-- Phân quy?n l?i cho view
GRANT SELECT ON public.active_landing_pages TO anon, authenticated;
