-- =============================================================================
-- 1FASHION - SEED DATA FOR DEMO
-- Purpose: Provide realistic demo shops so admins/new users can visualize
--          the platform. These are DEMO records with clear labeling.
--          They do NOT hardcode any business logic - purely data seeds.
-- Safe to run on fresh DB. Use ON CONFLICT DO NOTHING for idempotency.
-- =============================================================================

-- ─── STEP 0: Fix Schema Enums ──────────────────────────────────────────────────
-- Drop all views that depend on business_profiles.category before altering the column type
DROP VIEW IF EXISTS public.active_landing_pages CASCADE;
DROP VIEW IF EXISTS public.shop_landing_page CASCADE;
ALTER TABLE public.business_profiles ALTER COLUMN category TYPE TEXT USING category::text;

CREATE OR REPLACE VIEW public.active_landing_pages AS
SELECT 
    lp.id,
    lp.id AS landing_page_id,
    lp.business_id,
    lp.template_id,
    lp.content_json,
    lp.updated_at,
    bp.business_name,
    bp.slug AS business_slug,
    bp.category,
    bp.logo_url,
    bp.location_city,
    bp.location_district,
    bp.zalo_phone,
    bp.hotline,
    bp.rating_score,
    bp.account_id
FROM public.landing_pages lp
JOIN public.business_profiles bp ON lp.business_id = bp.id
WHERE lp.is_published = true AND lp.status = 'Published';

-- ─── STEP 1: Ensure site_settings exists ─────────────────────────────────────
INSERT INTO public.site_settings (id, app_name, tagline, accent_color)
VALUES (
    'current',
    '1Fashion',
    'Danh Bạ Thời Trang & Phụ Kiện Hàng Đầu Việt Nam',
    '#D4AF37'
)
ON CONFLICT (id) DO UPDATE SET
    app_name   = EXCLUDED.app_name,
    tagline    = EXCLUDED.tagline,
    updated_at = now();

-- ─── STEP 2: Seed Categories (Admin can edit these anytime) ──────────────────
INSERT INTO public.site_categories (name, slug, icon, color, description, sort_order, is_active)
VALUES
    ('Thời Trang',  'fashion',      'Shirt', '#E91E8C', 'Quần áo nam nữ, local brand, boutique',               1, true),
    ('Túi Xách',    'accessories',  'ShoppingBag', '#FF9800', 'Túi xách tay, balo, ví da, phụ kiện du lịch',           2, true),
    ('Giày Dép',    'shoes',        'Footprints', '#009688', 'Giày sneaker, giày cao gót, sandal, giày lười',         3, true),
    ('Streetwear',  'streetwear',   'Flame', '#607D8B', 'Trang phục đường phố, áo thun oversize, hoodie',       4, true),
    ('Mẹ & Bé',     'kids',         'Baby', '#F44336', 'Đồ sơ sinh, thời trang trẻ em, đồ bầu',                  5, true),
    ('Trang Sức',   'luxury',       'Gem', '#9C27B0', 'Vòng tay, nhẫn, dây chuyền, khuyên tai bạc/vàng',       6, true),
    ('Đồng Hồ',     'watches',      'Watch', '#795548', 'Đồng hồ thời trang nam nữ, smartwatch',                 7, true),
    ('Phụ Kiện',    'eyewear',      'Glasses', '#3F51B5', 'Kính râm, kính viễn/cận, nón, thắt lưng, phụ kiện tóc', 8, true)
ON CONFLICT (slug) DO UPDATE SET
    name        = EXCLUDED.name,
    icon        = EXCLUDED.icon,
    color       = EXCLUDED.color,
    description = EXCLUDED.description,
    sort_order  = EXCLUDED.sort_order;

-- ─── STEP 3: Create a demo system user for seed shops ────────────────────────
-- NOTE: Direct insertion into auth.users is not permitted on Supabase Cloud.
-- Demo shops are seeded with a fixed UUID. If the auth user does not exist,
-- the shop records will still be created but won't be linked to a real user.
-- To activate demo shops, create a user manually in Supabase Dashboard
-- with ID: a0000000-0000-0000-0000-000000000001
DO $$
DECLARE
    demo_user_id UUID := 'a0000000-0000-0000-0000-000000000001';
BEGIN
    -- Insert base profile only if the auth user already exists
    IF EXISTS (SELECT 1 FROM auth.users WHERE id = demo_user_id) THEN
        INSERT INTO public.profiles (id, email, role, subscription_status)
        VALUES (demo_user_id, 'demo@1fashion.vn', 'shop', 'trial')
        ON CONFLICT (id) DO NOTHING;
    END IF;
END $$;


-- ─── STEP 4: Seed Demo Business Profiles ─────────────────────────────────────
-- 6 demo shops across different categories
-- Each shop has a unique slug, category, and realistic data

INSERT INTO public.business_profiles (
    id, account_id, business_name, slug, category,
    location_city, location_district, hotline, zalo_phone, logo_url, is_verified, rating_score
)
VALUES
    (
        'b0000001-0000-0000-0000-000000000001',
        'a0000000-0000-0000-0000-000000000001',
        'Trendy Boutique Saigon', 'trendy-boutique-saigon', 'Thời Trang',
        'TP. Hồ Chí Minh', 'Quận 1', '028 1234 5678', '0901 111 111',
        'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=200&h=200&fit=crop&crop=center',
        true, 4.9
    ),
    (
        'b0000002-0000-0000-0000-000000000002',
        'a0000000-0000-0000-0000-000000000001',
        'Luxury Bags & Accessories HCM', 'luxury-bags-hcm', 'Phụ Kiện',
        'TP. Hồ Chí Minh', 'Quận 3', '028 9876 5432', '0902 222 222',
        'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=200&h=200&fit=crop&crop=center',
        true, 4.8
    ),
    (
        'b0000003-0000-0000-0000-000000000003',
        'a0000000-0000-0000-0000-000000000001',
        'SneakerVille Hà Nội', 'sneakerville-hanoi', 'Giày Dép',
        'Hà Nội', 'Hoàn Kiếm', '024 3344 5566', '0903 333 333',
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&h=200&fit=crop&crop=center',
        true, 4.7
    ),
    (
        'b0000004-0000-0000-0000-000000000004',
        'a0000000-0000-0000-0000-000000000001',
        'Urban Street Style', 'urban-street-style', 'Streetwear',
        'TP. Hồ Chí Minh', 'Bình Thạnh', '028 7766 5544', '0904 444 444',
        'https://images.unsplash.com/photo-1523398002811-999ca8dec234?w=200&h=200&fit=crop&crop=center',
        false, 4.6
    ),
    (
        'b0000005-0000-0000-0000-000000000005',
        'a0000000-0000-0000-0000-000000000001',
        'Royal Watch Collection', 'royal-watch-collection', 'Đồng Hồ',
        'TP. Hồ Chí Minh', 'Quận 1', '028 2233 4455', '0905 555 555',
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&h=200&fit=crop&crop=center',
        true, 5.0
    ),
    (
        'b0000006-0000-0000-0000-000000000006',
        'a0000000-0000-0000-0000-000000000001',
        'Kids Fashion Paradise', 'kids-fashion-paradise', 'Trẻ Em',
        'Hà Nội', 'Cầu Giấy', '024 8899 0011', '0906 666 666',
        'https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?w=200&h=200&fit=crop&crop=center',
        false, 4.5
    )
ON CONFLICT (slug) DO NOTHING;

-- ─── STEP 5: Seed Landing Pages for Demo Shops ───────────────────────────────
INSERT INTO public.landing_pages (business_id, template_id, is_published, status, content_json)
VALUES
    (
        'b0000001-0000-0000-0000-000000000001',
        'UniversalTemplate', true, 'Published',
        '{
            "hero_section": {
                "hero_title": "Phong Cách Của Bạn, Câu Chuyện Của Chúng Tôi",
                "hero_subtitle": "Bộ sưu tập thời trang nữ đương đại, cập nhật xu hướng mỗi tuần",
                "hero_slides": ["https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&q=80&w=1600"]
            },
            "about_us": {
                "intro_text": "Trendy Boutique Saigon mang đến những thiết kế thời trang nữ hiện đại, kết hợp phong cách Á Đông và phương Tây. Chúng tôi cam kết chất lượng và giá trị.",
                "experience_years": "8+"
            }
        }'::jsonb
    ),
    (
        'b0000002-0000-0000-0000-000000000002',
        'UniversalTemplate', true, 'Published',
        '{
            "hero_section": {
                "hero_title": "Luxury Accessories - Đẳng Cấp Trong Từng Chi Tiết",
                "hero_subtitle": "Túi xách, ví da, phụ kiện cao cấp từ các thương hiệu toàn cầu",
                "hero_slides": ["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=1600"]
            },
            "about_us": {
                "intro_text": "Chuyên phân phối túi xách và phụ kiện cao cấp chính hãng. Mỗi sản phẩm được kiểm định kỹ lưỡng trước khi đến tay khách hàng.",
                "experience_years": "5+"
            }
        }'::jsonb
    ),
    (
        'b0000003-0000-0000-0000-000000000003',
        'UniversalTemplate', true, 'Published',
        '{
            "hero_section": {
                "hero_title": "Sneaker Culture - Đi Đầu Xu Hướng",
                "hero_subtitle": "Nike, Adidas, New Balance, ON Running và hàng trăm thương hiệu sneaker chính hãng",
                "hero_slides": ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=1600"]
            },
            "about_us": {
                "intro_text": "SneakerVille là điểm đến hàng đầu cho cộng đồng sneakerhead tại Hà Nội. Chúng tôi cung cấp sneaker chính hãng 100% với dịch vụ check auth miễn phí.",
                "experience_years": "6+"
            }
        }'::jsonb
    ),
    (
        'b0000004-0000-0000-0000-000000000004',
        'UniversalTemplate', true, 'Published',
        '{
            "hero_section": {
                "hero_title": "Urban Street Style - Mặc Đường Phố, Sống Bản Sắc",
                "hero_subtitle": "Local brand streetwear, limited drops và collab độc quyền",
                "hero_slides": ["https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&q=80&w=1600"]
            },
            "about_us": {
                "intro_text": "Urban Street Style là local brand Việt Nam với tư duy thiết kế độc lập. Mỗi bộ sưu tập là câu chuyện về đường phố, văn hóa và bản sắc giới trẻ Sài Gòn.",
                "experience_years": "3+"
            }
        }'::jsonb
    ),
    (
        'b0000005-0000-0000-0000-000000000005',
        'UniversalTemplate', true, 'Published',
        '{
            "hero_section": {
                "hero_title": "Royal Watch Collection - Thời Gian Là Nghệ Thuật",
                "hero_subtitle": "Đồng hồ nam nữ chính hãng: Rolex, Omega, Seiko, Casio và hơn 50 thương hiệu",
                "hero_slides": ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=1600"]
            },
            "about_us": {
                "intro_text": "Với hơn 10 năm kinh nghiệm, Royal Watch Collection tự hào là địa chỉ tin cậy cho người yêu đồng hồ tại TP.HCM. Cam kết 100% chính hãng, đổi trả 30 ngày.",
                "experience_years": "10+"
            }
        }'::jsonb
    ),
    (
        'b0000006-0000-0000-0000-000000000006',
        'UniversalTemplate', true, 'Published',
        '{
            "hero_section": {
                "hero_title": "Kids Fashion Paradise - Thời Trang Trẻ Em Đáng Yêu",
                "hero_subtitle": "Quần áo, giày dép, phụ kiện cho bé từ 0-12 tuổi",
                "hero_slides": ["https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?auto=format&fit=crop&q=80&w=1600"]
            },
            "about_us": {
                "intro_text": "Kids Fashion Paradise cam kết cung cấp trang phục trẻ em an toàn, thoải mái và thời trang. Chất liệu 100% organic, không gây dị ứng cho làn da nhạy cảm của bé.",
                "experience_years": "4+"
            }
        }'::jsonb
    )
ON CONFLICT DO NOTHING;

-- ─── STEP 6: Seed Demo Products for first shop ───────────────────────────────
INSERT INTO public.shop_products (business_id, name, description, price, price_original, image_url, category, is_featured, sort_order, status)
VALUES
    (
        'b0000001-0000-0000-0000-000000000001',
        'Váy Maxi Hoa Cúc Vintage', 'Chất liệu lụa mềm mại, họa tiết hoa cúc vintage tinh tế. Phù hợp đi chơi, đi tiệc.',
        '480.000đ', '750.000đ',
        'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&q=80&w=800',
        'Váy', true, 1, 'active'
    ),
    (
        'b0000001-0000-0000-0000-000000000001',
        'Áo Sơ Mi Linen Trắng Basic', 'Áo sơ mi chất linen cao cấp, thoáng mát, phù hợp mọi hoàn cảnh.',
        '320.000đ', null,
        'https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?auto=format&fit=crop&q=80&w=800',
        'Áo', false, 2, 'active'
    ),
    (
        'b0000001-0000-0000-0000-000000000001',
        'Set Blazer + Quần Wide Leg Xanh Navy', 'Bộ blazer sang trọng, phù hợp công sở và các dịp đặc biệt.',
        '850.000đ', '1.200.000đ',
        'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&q=80&w=800',
        'Bộ', true, 3, 'active'
    ),
    (
        'b0000002-0000-0000-0000-000000000002',
        'Túi Xách Da Bò Cao Cấp', 'Thiết kế sang trọng, chất liệu da thật 100%.',
        '1.200.000đ', '1.500.000đ',
        'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&q=80&w=800',
        'Túi xách', true, 1, 'active'
    ),
    (
        'b0000002-0000-0000-0000-000000000002',
        'Ví Cầm Tay Đính Đá', 'Ví đi tiệc lấp lánh, phụ kiện không thể thiếu cho phái đẹp.',
        '450.000đ', null,
        'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?auto=format&fit=crop&q=80&w=800',
        'Ví', false, 2, 'active'
    ),
    (
        'b0000003-0000-0000-0000-000000000003',
        'Giày Sneaker Air Jordan', 'Phiên bản limited edition, bao check auth.',
        '4.500.000đ', null,
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800',
        'Giày Nam', true, 1, 'active'
    ),
    (
        'b0000003-0000-0000-0000-000000000003',
        'Giày Chạy Bộ Siêu Nhẹ', 'Công nghệ đệm êm ái, tối ưu cho chạy bộ đường dài.',
        '1.850.000đ', '2.200.000đ',
        'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?auto=format&fit=crop&q=80&w=800',
        'Giày Thể Thao', false, 2, 'active'
    )
ON CONFLICT DO NOTHING;

-- ─── STEP 7: Business Locations for demo shops ───────────────────────────────
INSERT INTO public.business_locations (business_id, city, district, address_full)
VALUES
    ('b0000001-0000-0000-0000-000000000001', 'TP. Hồ Chí Minh', 'Quận 1', '12 Nguyễn Huệ, Bến Nghé, Quận 1, TP.HCM'),
    ('b0000002-0000-0000-0000-000000000002', 'TP. Hồ Chí Minh', 'Quận 3', '45 Lê Quý Đôn, Võ Thị Sáu, Quận 3, TP.HCM'),
    ('b0000003-0000-0000-0000-000000000003', 'Hà Nội', 'Hoàn Kiếm', '88 Tràng Tiền, Tràng Tiền, Hoàn Kiếm, Hà Nội'),
    ('b0000004-0000-0000-0000-000000000004', 'TP. Hồ Chí Minh', 'Bình Thạnh', '200 Bạch Đằng, Phường 24, Bình Thạnh, TP.HCM'),
    ('b0000005-0000-0000-0000-000000000005', 'TP. Hồ Chí Minh', 'Quận 1', '99 Đồng Khởi, Bến Nghé, Quận 1, TP.HCM'),
    ('b0000006-0000-0000-0000-000000000006', 'Hà Nội', 'Cầu Giấy', '150 Cầu Giấy, Quan Hoa, Cầu Giấy, Hà Nội')
ON CONFLICT DO NOTHING;
