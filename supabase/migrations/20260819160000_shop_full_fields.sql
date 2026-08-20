-- ==============================================================================
-- Migration: Đảm bảo shop_products có đủ cột cần thiết
-- ==============================================================================

-- Thêm image_gallery nếu chưa có (danh sách ảnh thư viện, tối đa 5 ảnh)
ALTER TABLE public.shop_products ADD COLUMN IF NOT EXISTS image_gallery JSONB DEFAULT '[]'::jsonb;

-- Thêm tags nếu chưa có
ALTER TABLE public.shop_products ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Thêm sort_order nếu chưa có
ALTER TABLE public.shop_products ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0;

-- Cập nhật comment
COMMENT ON COLUMN public.shop_products.image_gallery IS 'Tối đa 5 ảnh thư viện bổ sung, lưu dạng JSON mảng URL string.';
COMMENT ON COLUMN public.shop_products.tags IS 'Nhãn/tags của sản phẩm để tìm kiếm và lọc.';
COMMENT ON COLUMN public.shop_products.sort_order IS 'Thứ tự hiển thị sản phẩm trong shop, số nhỏ hiển thị trước.';

-- Đảm bảo business_profiles có address_full (trường địa chỉ chi tiết)
ALTER TABLE public.business_profiles ADD COLUMN IF NOT EXISTS address_full TEXT;
ALTER TABLE public.business_profiles ADD COLUMN IF NOT EXISTS operating_hours_text TEXT;
ALTER TABLE public.business_profiles ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE public.business_profiles ADD COLUMN IF NOT EXISTS facebook_url TEXT;
ALTER TABLE public.business_profiles ADD COLUMN IF NOT EXISTS website_url TEXT;

-- Grant quyền update các cột mới của business_profiles cho authenticated (shop tự cập nhật)
GRANT UPDATE (
  address_full, operating_hours_text, description, facebook_url, website_url
) ON public.business_profiles TO authenticated;

-- Grant quyền update các cột mới của shop_products cho authenticated
GRANT UPDATE (
  image_gallery, tags, sort_order
) ON public.shop_products TO authenticated;
