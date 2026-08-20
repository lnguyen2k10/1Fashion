-- ==============================================================================
-- Migration: Thêm cột hình ảnh phụ cho shop_products
-- ==============================================================================

-- 1. Thêm cột image_gallery dạng JSONB mảng
ALTER TABLE shop_products 
ADD COLUMN IF NOT EXISTS image_gallery JSONB DEFAULT '[]'::jsonb;

-- 2. Thêm comment cho cột để dễ hiểu
COMMENT ON COLUMN shop_products.image_gallery IS 'Danh sách các ảnh phụ của sản phẩm, lưu trữ dưới dạng mảng JSON các URL string.';
