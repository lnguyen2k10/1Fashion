-- Đồng bộ category trong business_profiles với name trong site_categories
UPDATE public.business_profiles bp
SET category = sc.name
FROM public.site_categories sc
WHERE LOWER(bp.category) = LOWER(sc.slug);

-- Đồng bộ phần tử đầu tiên của mảng categories
UPDATE public.business_profiles bp
SET categories[1] = sc.name
FROM public.site_categories sc
WHERE array_length(bp.categories, 1) > 0
  AND LOWER(bp.categories[1]) = LOWER(sc.slug);
