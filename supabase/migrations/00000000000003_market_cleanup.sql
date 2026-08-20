-- ============================================================================
-- 1FASHION V3 CLEANUP MIGRATION
-- Mục tiêu: Loại bỏ tàn dư beauty/spa, chuẩn hóa cho thời trang/shopping
-- ============================================================================

-- 1. XÓA ENUM CŨ: Chuyển business_category từ ENUM sang TEXT
--    Điều này cho phép admin nhập bất kỳ danh mục nào (không bị giới hạn)

-- Drop views that depend on business_profiles.category before schema changes
DROP VIEW IF EXISTS public.active_landing_pages CASCADE;
DROP VIEW IF EXISTS public.shop_landing_page CASCADE;

DO $$
BEGIN
  -- Thêm cột text mới tạm thời
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='business_profiles' AND column_name='category_text'
  ) THEN
    ALTER TABLE public.business_profiles ADD COLUMN category_text TEXT;
    -- Copy dữ liệu từ cột enum sang text
    UPDATE public.business_profiles SET category_text = category::TEXT;
  END IF;
END $$;

-- Xóa cột enum cũ và đổi tên cột text mới (nếu chưa làm)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='business_profiles' AND column_name='category_text'
  ) AND EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='business_profiles' AND column_name='category'
  ) THEN
    ALTER TABLE public.business_profiles DROP COLUMN category;
    ALTER TABLE public.business_profiles RENAME COLUMN category_text TO category;
  END IF;
END $$;

-- Set NOT NULL và default sau khi chuyển đổi
ALTER TABLE public.business_profiles ALTER COLUMN category SET DEFAULT 'Thời Trang';


-- 2. THÊM CỘT theme_color vào business_profiles
--    Để chủ shop có thể đặt màu chủ đạo riêng cho trang
ALTER TABLE public.business_profiles 
  ADD COLUMN IF NOT EXISTS theme_color TEXT DEFAULT '#D4AF37';


-- 3. THÊM BẢNG operating_hours riêng biệt
--    Thay vì nhét vào content_json, ta lưu vào bảng chuẩn hơn
CREATE TABLE IF NOT EXISTS public.operating_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.business_profiles(id) ON DELETE CASCADE,
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  -- 0=Chủ nhật, 1=Thứ 2, ..., 6=Thứ 7
  open_time TEXT,    -- "08:00"
  close_time TEXT,   -- "22:00"
  is_closed BOOLEAN DEFAULT false,
  UNIQUE(business_id, day_of_week)
);

ALTER TABLE public.operating_hours ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Operating hours viewable by everyone"
  ON public.operating_hours FOR SELECT USING (true);

CREATE POLICY "Owners can manage their operating hours"
  ON public.operating_hours FOR ALL USING (
    business_id IN (SELECT id FROM public.business_profiles WHERE account_id = auth.uid())
  );


-- 4. CẬP NHẬT VIEW active_landing_pages
--    Thêm business_locations để bản đồ Leaflet có lat/lng
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
  -- Business Location (cho bản đồ Leaflet)
  bl.lat,
  bl.lng,
  bl.address_full,
  -- Account info
  acc.subscription_status,
  acc.expiry_date,
  acc.email AS email_owner
FROM public.landing_pages lp
JOIN public.business_profiles bp ON lp.business_id = bp.id
JOIN public.profiles acc ON bp.account_id = acc.id
LEFT JOIN public.business_locations bl ON bl.business_id = bp.id
WHERE lp.is_published = true;


-- 5. VIEW PHỤ: all_landing_pages (dùng cho editor - không cần is_published)
DROP VIEW IF EXISTS public.shop_landing_page;

CREATE OR REPLACE VIEW public.shop_landing_page AS
SELECT
  lp.id,
  lp.id AS landing_page_id,
  lp.business_id,
  lp.template_id,
  lp.content_json,
  lp.draft_json,
  lp.is_published,
  lp.status AS page_status,
  lp.updated_at,
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
  bl.lat,
  bl.lng,
  bl.address_full,
  acc.subscription_status,
  acc.expiry_date,
  acc.email AS email_owner
FROM public.landing_pages lp
JOIN public.business_profiles bp ON lp.business_id = bp.id
JOIN public.profiles acc ON bp.account_id = acc.id
LEFT JOIN public.business_locations bl ON bl.business_id = bp.id;


-- 6. RLS cho view shop_landing_page (nếu cần policy riêng)
-- Views kế thừa policy từ các bảng gốc nên không cần thêm


-- 7. ĐẢM BẢO site_categories CÓ ĐỦ 8 DANH MỤC THỜI TRANG
INSERT INTO public.site_categories (name, slug, icon, color, description, sort_order, is_active)
VALUES
  ('Thời Trang',  'fashion',     'Shirt', '#E91E8C', 'Quần áo nam nữ, local brand, boutique',   1, true),
  ('Túi Xách',    'accessories', 'ShoppingBag', '#FF9800', 'Túi xách tay, balo, ví da',           2, true),
  ('Giày Dép',    'shoes',       'Footprints', '#009688', 'Giày sneaker, giày cao gót, sandal',   3, true),
  ('Streetwear',  'streetwear',  'Flame', '#607D8B', 'Trang phục đường phố, đồ hypebeast',    4, true),
  ('Mẹ & Bé',     'kids',        'Baby', '#F44336', 'Đồ sơ sinh, thời trang trẻ em',          5, true),
  ('Trang Sức',   'luxury',      'Gem', '#9C27B0', 'Vòng tay, nhẫn, dây chuyền, khuyên tai',  6, true),
  ('Đồng Hồ',     'watches',     'Watch', '#795548', 'Đồng hồ thời trang, đồng hồ thông minh',  7, true),
  ('Phụ Kiện',    'eyewear',     'Glasses', '#3F51B5', 'Kính mắt, mũ nón, phụ kiện tóc',        8, true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  color = EXCLUDED.color,
  is_active = true;


-- 8. INDEX bổ sung cho hiệu năng
CREATE INDEX IF NOT EXISTS idx_operating_hours_business
  ON public.operating_hours(business_id);

CREATE INDEX IF NOT EXISTS idx_business_profiles_verified
  ON public.business_profiles(is_verified) WHERE is_verified = true;

CREATE INDEX IF NOT EXISTS idx_business_offers_active
  ON public.business_offers(business_id, status) WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_blogs_admin
  ON public.blogs(status, created_at DESC);

-- END OF MIGRATION
