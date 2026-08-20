-- Fix duplicate shops on homepage by updating the view to use DISTINCT ON

drop view if exists public.active_homepage_shop_features;

create view public.active_homepage_shop_features with (security_barrier = true) as
select DISTINCT ON (page.business_id) 
  feature.id, feature.starts_at, feature.expires_at, page.business_id, page.business_slug, page.business_name,
  page.category, page.location_district, page.location_city, page.is_verified, page.logo_url, page.content_json
from public.homepage_feature_activations feature
join public.active_landing_pages page on page.business_id = feature.business_id
where feature.feature_type = 'shop' and feature.expires_at > now()
order by page.business_id, feature.starts_at DESC;

-- Re-grant permissions
grant select on public.active_homepage_shop_features to anon, authenticated;
