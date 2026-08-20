-- =============================================================================
-- 1FASHION V2 MIGRATION
-- Fashion & Accessories Directory
-- Fixes: account_id bug, dynamic categories, shop_products table, full-text search
-- =============================================================================

-- 1. FIX: Drop and recreate business_category enum to support fashion categories
-- NOTE: We use TEXT type for category in new flow (admin-configurable, not enum)
-- The old enum stays for backward compat but we allow ANY text via business_profiles.category

-- 2. ADD: site_categories table (Admin-configurable - NO HARDCODE)
CREATE TABLE IF NOT EXISTS public.site_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    icon TEXT DEFAULT '◈',
    color TEXT DEFAULT '#D4AF37',
    description TEXT,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. ADD: site_settings (Admin-configurable)
CREATE TABLE IF NOT EXISTS public.site_settings (
    id TEXT PRIMARY KEY DEFAULT 'current',
    app_name TEXT DEFAULT '1Fashion',
    tagline TEXT,
    accent_color TEXT DEFAULT '#D4AF37',
    logo_url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. ADD: shop_products table (replaces blog feature for shop owner)
CREATE TABLE IF NOT EXISTS public.shop_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID NOT NULL REFERENCES public.business_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price TEXT,                        -- TEXT not NUMERIC: allows "490.000đ", "Liên hệ", "200k-500k"
    price_original TEXT,               -- Giá gốc (để hiển thị gạch ngang)
    image_url TEXT,
    category TEXT,                     -- Product sub-category (e.g. "Áo", "Giày", "Túi")
    tags TEXT[],
    is_featured BOOLEAN DEFAULT false,
    sort_order INT DEFAULT 0,
    status TEXT DEFAULT 'active',      -- active | hidden
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. FIX: Recreate active_landing_pages view with account_id (CRITICAL BUG FIX)
-- Old view was missing account_id, causing edit-mode security check to always fail
DROP VIEW IF EXISTS public.active_landing_pages;

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
    bp.account_id,                     -- CRITICAL FIX: was missing
    bp.business_name,
    bp.slug AS business_slug,
    bp.category,
    bp.zalo_phone,
    bp.hotline,
    bp.logo_url,
    bp.is_verified,
    bp.rating_score,
    bp.location_city,
    bp.location_district,
    bp.social_links,
    acc.subscription_status,
    acc.expiry_date,
    acc.email AS email_owner
FROM public.landing_pages lp
JOIN public.business_profiles bp ON lp.business_id = bp.id
JOIN public.profiles acc ON bp.account_id = acc.id
WHERE lp.is_published = true;

-- 5. ADD: Full-text search index for performance at 500+ shops
-- GIN index on business_name for fast ILIKE queries
CREATE INDEX IF NOT EXISTS idx_business_profiles_name_gin 
ON public.business_profiles USING gin(to_tsvector('simple', business_name));

CREATE INDEX IF NOT EXISTS idx_business_profiles_category 
ON public.business_profiles(category);

CREATE INDEX IF NOT EXISTS idx_business_profiles_location 
ON public.business_profiles(location_city, location_district);

CREATE INDEX IF NOT EXISTS idx_landing_pages_business 
ON public.landing_pages(business_id) WHERE is_published = true;

CREATE INDEX IF NOT EXISTS idx_shop_products_business 
ON public.shop_products(business_id) WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_shop_products_featured 
ON public.shop_products(business_id, is_featured) WHERE status = 'active';

-- 6. ADD: site_settings upsert for 1Fashion branding
INSERT INTO public.site_settings (id, app_name, tagline, accent_color)
VALUES (
    'current',
    '1Fashion',
    'Danh Bạ Thời Trang & Phụ Kiện Hàng Đầu Việt Nam',
    '#D4AF37'
)
ON CONFLICT (id) DO UPDATE SET
    app_name = '1Fashion',
    tagline = 'Danh Bạ Thời Trang & Phụ Kiện Hàng Đầu Việt Nam',
    updated_at = now();

-- 7. SEED: Default fashion categories (Admin can edit/add more anytime)
INSERT INTO public.site_categories (name, slug, icon, color, description, sort_order, is_active)
VALUES
    ('Thời Trang', 'fashion', 'Shirt', '#E91E8C', 'Quần áo nam nữ, local brand, boutique', 1, true),
    ('Phụ Kiện', 'accessories', 'ShoppingBag', '#D4AF37', 'Túi xách, ví, trang sức, mũ nón', 2, true),
    ('Giày Dép', 'shoes', 'Footprints', '#FF6B35', 'Giày thể thao, giày cao gót, sandal', 3, true),
    ('Streetwear', 'streetwear', 'Flame', '#6B46C1', 'Thời trang đường phố, sneaker, hypebeast', 4, true),
    ('Trẻ Em', 'kids', 'Baby', '#10B981', 'Thời trang và phụ kiện trẻ em', 5, true),
    ('Hàng Hiệu', 'luxury', 'Gem', '#9B6B2B', 'Hàng hiệu authentic, luxury brands', 6, true),
    ('Đồng Hồ', 'watches', 'Watch', '#374151', 'Đồng hồ nam nữ các thương hiệu', 7, true),
    ('Mắt Kính', 'eyewear', 'Glasses', '#2563EB', 'Kính mắt thời trang, kính râm, gọng kính', 8, true)
ON CONFLICT (slug) DO NOTHING;

-- 8. RLS Policies for new tables
ALTER TABLE public.site_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shop_products ENABLE ROW LEVEL SECURITY;

-- site_categories: public read, admin write
CREATE POLICY "Categories are viewable by everyone" 
ON public.site_categories FOR SELECT USING (true);

-- Note: categories_admin_write policy is defined in 20260815024113_production_security_roles_manual_billing.sql
-- Placeholder policy (will be dropped and recreated by production migration)
CREATE POLICY "Only admins can manage categories" 
ON public.site_categories FOR ALL USING (
    (SELECT role::text FROM public.profiles WHERE id = auth.uid()) IN ('super_admin', 'Admin')
);

-- shop_products: public read active products, owner write
CREATE POLICY "Active products viewable by everyone" 
ON public.shop_products FOR SELECT USING (status = 'active');

CREATE POLICY "Owners can view all their products" 
ON public.shop_products FOR SELECT USING (
    business_id IN (SELECT id FROM public.business_profiles WHERE account_id = auth.uid())
);

CREATE POLICY "Owners can manage their products" 
ON public.shop_products FOR ALL USING (
    business_id IN (SELECT id FROM public.business_profiles WHERE account_id = auth.uid())
);

-- 9. Helper function: get categories for frontend (replaces hardcoded constants)
CREATE OR REPLACE FUNCTION public.get_active_categories()
RETURNS TABLE(name TEXT, slug TEXT, icon TEXT, color TEXT, description TEXT)
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
    SELECT name, slug, icon, color, description
    FROM public.site_categories
    WHERE is_active = true
    ORDER BY sort_order ASC, name ASC;
$$;
