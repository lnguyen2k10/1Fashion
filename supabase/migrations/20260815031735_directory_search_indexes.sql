-- Server-side directory search for 500+ shops.
create extension if not exists pg_trgm with schema extensions;

create index if not exists idx_business_profiles_name_trgm
  on public.business_profiles using gin (business_name extensions.gin_trgm_ops);
create index if not exists idx_business_profiles_category_trgm
  on public.business_profiles using gin (category extensions.gin_trgm_ops);
create index if not exists idx_business_profiles_district_trgm
  on public.business_profiles using gin (location_district extensions.gin_trgm_ops);
create index if not exists idx_business_profiles_city_trgm
  on public.business_profiles using gin (location_city extensions.gin_trgm_ops);
