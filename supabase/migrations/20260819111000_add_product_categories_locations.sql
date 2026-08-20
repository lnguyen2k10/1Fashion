-- Tạo bảng danh mục sản phẩm (product_categories)
CREATE TABLE IF NOT EXISTS public.product_categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    color TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Seed dữ liệu chuẩn
INSERT INTO public.product_categories (name, slug, icon, sort_order) VALUES
('Áo', 'ao', '👕', 1),
('Quần', 'quan', '👖', 2),
('Váy / Đầm', 'vay-dam', '👗', 3),
('Giày dép', 'giay-dep', '👟', 4),
('Túi xách', 'tui-xach', '👜', 5),
('Phụ kiện', 'phu-kien', '🕶️', 6),
('Mỹ phẩm', 'my-pham', '💄', 7)
ON CONFLICT (slug) DO NOTHING;

-- Tạo bảng địa điểm (system_locations)
CREATE TABLE IF NOT EXISTS public.system_locations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Seed TP.HCM
INSERT INTO public.system_locations (name, slug, sort_order) VALUES
('TP. Hồ Chí Minh', 'tp-ho-chi-minh', 1)
ON CONFLICT (slug) DO NOTHING;

-- Cấp quyền RLS (Public read, admin write)
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cho phép đọc công khai trên product_categories" 
  ON public.product_categories 
  FOR SELECT 
  USING (true);
  
CREATE POLICY "Super admin toàn quyền product_categories" 
  ON public.product_categories 
  FOR ALL 
  TO authenticated 
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin')
  );

CREATE POLICY "Cho phép đọc công khai trên system_locations" 
  ON public.system_locations 
  FOR SELECT 
  USING (true);

CREATE POLICY "Super admin toàn quyền system_locations" 
  ON public.system_locations 
  FOR ALL 
  TO authenticated 
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'super_admin')
  );
