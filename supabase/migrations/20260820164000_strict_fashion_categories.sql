-- MIGRATION: Làm sạch triệt để dữ liệu danh mục "nhà vườn" cũ
-- Chỉ giữ lại đúng các danh mục thuộc lĩnh vực thời trang & phụ kiện.

-- 1. Xóa các danh mục không hợp lệ trong site_categories
DELETE FROM public.site_categories
WHERE slug NOT IN (
    'fashion', 'accessories', 'shoes', 'streetwear', 
    'kids', 'luxury', 'watches', 'eyewear'
);

-- 2. Đưa các cửa hàng đang lỡ gán danh mục nhà vườn (nếu có) về mặc định "Thời Trang"
-- Tránh lỗi mất tích cửa hàng do mất danh mục
UPDATE public.business_profiles
SET category = 'Thời Trang'
WHERE category NOT IN (
    SELECT name FROM public.site_categories
);

-- 3. Xóa các danh mục sản phẩm không hợp lệ trong product_categories (nếu có)
DELETE FROM public.product_categories
WHERE slug NOT IN (
    'ao', 'quan', 'vay-dam', 'giay-dep', 'tui-xach', 'phu-kien', 'my-pham'
);

-- 4. Chuyển các sản phẩm bị gán danh mục nhà vườn về danh mục rỗng hoặc mặc định
UPDATE public.shop_products
SET category = 'Khác'
WHERE category NOT IN (
    SELECT name FROM public.product_categories
) AND category IS NOT NULL;
