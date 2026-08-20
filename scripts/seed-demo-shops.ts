import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

const CATEGORIES = [
  { slug: 'fashion', name: 'Thời Trang', icon: '👗', color: '#E91E8C' },
  { slug: 'accessories', name: 'Phụ Kiện', icon: '👜', color: '#D4AF37' },
  { slug: 'shoes', name: 'Giày Dép', icon: '👟', color: '#FF6B35' },
  { slug: 'streetwear', name: 'Streetwear', icon: '🧢', color: '#6B46C1' },
  { slug: 'kids', name: 'Trẻ Em', icon: '🌈', color: '#10B981' },
  { slug: 'luxury', name: 'Hàng Hiệu', icon: '💎', color: '#9B6B2B' },
  { slug: 'watches', name: 'Đồng Hồ', icon: '⌚', color: '#374151' },
  { slug: 'eyewear', name: 'Mắt Kính', icon: '👓', color: '#2563EB' }
]

const DEMO_DATA: Record<string, any> = {
  'fashion': {
    businessName: 'Elegance Fashion',
    slug: 'elegance-fashion',
    coverImage: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=1200',
    logoUrl: 'https://images.unsplash.com/photo-1560243563-062bfc001d68?q=80&w=200',
    description: 'Thương hiệu thời trang cao cấp dành cho phái đẹp.',
    products: [
      { name: 'Đầm Dạ Hội Lụa Satin', price: '1.250.000đ', price_original: '1.800.000đ', category: 'Váy Đầm', img: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?q=80&w=800', is_featured: true },
      { name: 'Áo Blazer Nữ Công Sở', price: '850.000đ', category: 'Áo Khoác', img: 'https://images.unsplash.com/photo-1591561954557-26941169b49e?q=80&w=800' },
      { name: 'Chân Váy Bút Chì', price: '450.000đ', price_original: '600.000đ', category: 'Chân Váy', img: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?q=80&w=800' },
      { name: 'Áo Sơ Mi Lụa Trắng', price: '350.000đ', category: 'Áo Sơ Mi', img: 'https://images.unsplash.com/photo-1551163943-3f6a855d1153?q=80&w=800', is_featured: true },
      { name: 'Quần Tây Ống Suông', price: '550.000đ', category: 'Quần', img: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=800' },
      { name: 'Đầm Maxi Đi Biển', price: '690.000đ', price_original: '950.000đ', category: 'Váy Đầm', img: 'https://images.unsplash.com/photo-1515347619253-081e1a5332f9?q=80&w=800' }
    ]
  },
  'accessories': {
    businessName: 'Lumina Accessories',
    slug: 'lumina-accessories',
    coverImage: 'https://images.unsplash.com/photo-1515562141207-7a8ea4114e17?q=80&w=1200',
    logoUrl: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=200',
    description: 'Trang sức và phụ kiện tinh tế, tôn vinh nét đẹp rạng rỡ.',
    products: [
      { name: 'Dây Chuyền Vàng Trắng 18K', price: '4.500.000đ', category: 'Dây Chuyền', img: 'https://images.unsplash.com/photo-1599643478524-fb66f4527182?q=80&w=800', is_featured: true },
      { name: 'Bông Tai Kim Cương Khâu', price: '2.800.000đ', price_original: '3.500.000đ', category: 'Bông Tai', img: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=800' },
      { name: 'Túi Xách Nữ Da Thật', price: '1.500.000đ', category: 'Túi Xách', img: 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=800', is_featured: true },
      { name: 'Vòng Cổ Ngọc Trai Tự Nhiên', price: '3.200.000đ', price_original: '4.000.000đ', category: 'Vòng Cổ', img: 'https://images.unsplash.com/photo-1515562141207-7a8ea4114e17?q=80&w=800' },
      { name: 'Nhẫn Bạc 925 Đính Đá', price: '650.000đ', category: 'Nhẫn', img: 'https://images.unsplash.com/photo-1605100804763-247f661c6e40?q=80&w=800' },
      { name: 'Lắc Tay Bạc Charm Hoa', price: '850.000đ', price_original: '1.200.000đ', category: 'Lắc Tay', img: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?q=80&w=800' }
    ]
  },
  'shoes': {
    businessName: 'Sole Step',
    slug: 'sole-step',
    coverImage: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=1200',
    logoUrl: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?q=80&w=200',
    description: 'Thế giới giày chính hãng với phong cách đa dạng.',
    products: [
      { name: 'Sneaker Thể Thao Nam Năng Động', price: '1.200.000đ', category: 'Sneaker', img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800', is_featured: true },
      { name: 'Giày Cao Gót Mũi Nhọn 7cm', price: '650.000đ', price_original: '850.000đ', category: 'Cao Gót', img: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?q=80&w=800', is_featured: true },
      { name: 'Giày Lười Da Bò Nam', price: '950.000đ', category: 'Giày Lười', img: 'https://images.unsplash.com/photo-1614252339460-e17635c41499?q=80&w=800' },
      { name: 'Sandal Nữ Mùa Hè Thoải Mái', price: '350.000đ', price_original: '500.000đ', category: 'Sandal', img: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?q=80&w=800' },
      { name: 'Giày Chạy Bộ Thoáng Khí', price: '1.500.000đ', category: 'Chạy Bộ', img: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614c3a?q=80&w=800' },
      { name: 'Boots Da Nữ Phong Cách', price: '850.000đ', price_original: '1.200.000đ', category: 'Boots', img: 'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?q=80&w=800' }
    ]
  },
  'streetwear': {
    businessName: 'Urban Hype',
    slug: 'urban-hype',
    coverImage: 'https://images.unsplash.com/photo-1523398002811-999aa8e9f5b9?q=80&w=1200',
    logoUrl: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=200',
    description: 'Thời trang đường phố cực chất, local brand độc quyền.',
    products: [
      { name: 'Áo Hoodie Oversize Trắng', price: '650.000đ', category: 'Hoodie', img: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800', is_featured: true },
      { name: 'Áo Thun Streetwear Graphic', price: '350.000đ', price_original: '450.000đ', category: 'T-Shirt', img: 'https://images.unsplash.com/photo-1529374255404-311a2a4f1fd9?q=80&w=800' },
      { name: 'Quần Cargo Rộng Phóng Khoáng', price: '550.000đ', category: 'Quần', img: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800', is_featured: true },
      { name: 'Mũ Lưỡi Trai Logo Thêu', price: '250.000đ', price_original: '350.000đ', category: 'Phụ Kiện', img: 'https://images.unsplash.com/photo-1588850561407-ed78c282e89b?q=80&w=800' },
      { name: 'Áo Khoác Bomber Kaki', price: '850.000đ', category: 'Áo Khoác', img: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=800' },
      { name: 'Giày Sneaker Chunky Cá Tính', price: '1.200.000đ', price_original: '1.600.000đ', category: 'Sneaker', img: 'https://images.unsplash.com/photo-1552346154-21d32810baa3?q=80&w=800' }
    ]
  },
  'kids': {
    businessName: 'Baby Smile',
    slug: 'baby-smile',
    coverImage: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?q=80&w=1200',
    logoUrl: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?q=80&w=200',
    description: 'Thế giới thời trang trẻ em an toàn, đáng yêu.',
    products: [
      { name: 'Váy Công Chúa Chấm Bi', price: '350.000đ', category: 'Váy Bé Gái', img: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?q=80&w=800', is_featured: true },
      { name: 'Bộ Quần Áo Bé Trai Năng Động', price: '250.000đ', price_original: '350.000đ', category: 'Đồ Bé Trai', img: 'https://images.unsplash.com/photo-1519241047957-be31d7379a5d?q=80&w=800' },
      { name: 'Giày Thể Thao Trẻ Em Siêu Nhẹ', price: '450.000đ', category: 'Giày Dép', img: 'https://images.unsplash.com/photo-1514989940723-e8e51635b782?q=80&w=800', is_featured: true },
      { name: 'Áo Thun Hình Thú Cưng', price: '150.000đ', price_original: '200.000đ', category: 'Áo Thun', img: 'https://images.unsplash.com/photo-1522771930-78848d9293e8?q=80&w=800' },
      { name: 'Mũ Vành Tròn Chống Nắng Bé Yêu', price: '120.000đ', category: 'Phụ Kiện', img: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?q=80&w=800' },
      { name: 'Bộ Đồ Bơi Trẻ Em Vui Nhộn', price: '280.000đ', price_original: '380.000đ', category: 'Đồ Bơi', img: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?q=80&w=800' }
    ]
  },
  'luxury': {
    businessName: 'Prestige Boutique',
    slug: 'prestige-boutique',
    coverImage: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200',
    logoUrl: 'https://images.unsplash.com/photo-1549439602-43ebca2327af?q=80&w=200',
    description: 'Phân phối hàng hiệu chính hãng từ các nhà mốt danh tiếng.',
    products: [
      { name: 'Túi Xách Chanel Classic Flap', price: '250.000.000đ', category: 'Túi Xách', img: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=800', is_featured: true },
      { name: 'Thắt Lưng Gucci Double G', price: '12.500.000đ', price_original: '14.000.000đ', category: 'Phụ Kiện', img: 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?q=80&w=800' },
      { name: 'Kính Râm Dior Stellaire', price: '11.000.000đ', category: 'Mắt Kính', img: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=800', is_featured: true },
      { name: 'Giày Lười Hermes Paris', price: '28.000.000đ', price_original: '32.000.000đ', category: 'Giày Dép', img: 'https://images.unsplash.com/photo-1549439602-43ebca2327af?q=80&w=800' },
      { name: 'Áo Khoác Burberry Trench Coat', price: '55.000.000đ', category: 'Áo Khoác', img: 'https://images.unsplash.com/photo-1550639525-c97d455acf70?q=80&w=800' },
      { name: 'Ví Nữ Louis Vuitton Monogram', price: '18.500.000đ', price_original: '22.000.000đ', category: 'Ví', img: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=800' }
    ]
  },
  'watches': {
    businessName: 'Chrono Timepieces',
    slug: 'chrono-timepieces',
    coverImage: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=1200',
    logoUrl: 'https://images.unsplash.com/photo-1508656968037-184581f148d4?q=80&w=200',
    description: 'Đồng hồ chính hãng từ Thụy Sĩ và Nhật Bản.',
    products: [
      { name: 'Đồng Hồ Rolex Submariner', price: '320.000.000đ', category: 'Rolex', img: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=800', is_featured: true },
      { name: 'Đồng Hồ Omega Speedmaster', price: '150.000.000đ', price_original: '180.000.000đ', category: 'Omega', img: 'https://images.unsplash.com/photo-1548032885-b5e38734688a?q=80&w=800' },
      { name: 'Đồng Hồ Tissot Le Locle', price: '18.500.000đ', category: 'Tissot', img: 'https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?q=80&w=800', is_featured: true },
      { name: 'Đồng Hồ Seiko Presage', price: '12.000.000đ', price_original: '15.000.000đ', category: 'Seiko', img: 'https://images.unsplash.com/photo-1548032885-b5e38734688a?q=80&w=800' },
      { name: 'Dây Đồng Hồ Da Cá Sấu Nâu', price: '1.200.000đ', category: 'Phụ Kiện', img: 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?q=80&w=800' },
      { name: 'Hộp Đựng Đồng Hồ Cơ Quay Tự Động', price: '3.500.000đ', price_original: '4.500.000đ', category: 'Hộp Đựng', img: 'https://images.unsplash.com/photo-1495856458515-0637185db551?q=80&w=800' }
    ]
  },
  'eyewear': {
    businessName: 'Vision Optics',
    slug: 'vision-optics',
    coverImage: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=1200',
    logoUrl: 'https://images.unsplash.com/photo-1577803645773-f96470509666?q=80&w=200',
    description: 'Kính mắt thời trang và đo khám thị lực chuẩn quốc tế.',
    products: [
      { name: 'Kính Râm Ray-Ban Aviator Classic', price: '4.200.000đ', category: 'Kính Râm', img: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=800', is_featured: true },
      { name: 'Gọng Kính Titan Mỏng Nhẹ', price: '1.800.000đ', price_original: '2.500.000đ', category: 'Gọng Kính', img: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=800' },
      { name: 'Kính Râm Nữ Dáng Mắt Mèo Gentle Monster', price: '6.500.000đ', category: 'Kính Râm Nữ', img: 'https://images.unsplash.com/photo-1508296695146-257a814070b4?q=80&w=800', is_featured: true },
      { name: 'Tròng Kính Chống Ánh Sáng Xanh Essilor', price: '1.500.000đ', price_original: '2.000.000đ', category: 'Tròng Kính', img: 'https://images.unsplash.com/photo-1555529733-0e670560f8e1?q=80&w=800' },
      { name: 'Kính Lão Gấp Gọn Bỏ Túi', price: '450.000đ', category: 'Kính Lão', img: 'https://images.unsplash.com/photo-1577803645773-f96470509666?q=80&w=800' },
      { name: 'Nước Rửa Kính Mắt Chuyên Dụng', price: '80.000đ', price_original: '120.000đ', category: 'Phụ Kiện', img: 'https://images.unsplash.com/photo-1599839619722-39751411ea63?q=80&w=800' }
    ]
  }
}

async function seed() {
  console.log('Seeding 8 demo shops for categories...')

  const { data: dbCategories, error: catError } = await supabase.from('site_categories').select('*')
  if (catError) {
    console.error('Error fetching categories:', catError)
    return
  }

  for (const cat of CATEGORIES) {
    const dbCat = dbCategories.find((c: any) => c.slug === cat.slug)
    if (!dbCat) {
      console.log(`Category ${cat.slug} not found in DB. Skipping.`)
      continue
    }

    const shopData = DEMO_DATA[cat.slug]
    if (!shopData) continue

    const email = `demo_v8_${cat.slug}@1fashion.vn`
    
    // Check if user already exists
    const { data: existingProfiles } = await supabase.from('profiles').select('id').eq('email', email)
    let userId = existingProfiles && existingProfiles.length > 0 ? existingProfiles[0].id : null

    if (!userId) {
      // Try to create auth user
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: email,
        password: 'Password123!',
        email_confirm: true,
        user_metadata: { role: 'shop', full_name: shopData.businessName }
      })
      if (createError) {
        console.error(`Error creating user ${email}:`, createError)
        continue
      }
      userId = newUser.user.id
      console.log(`Created user ${email} with ID ${userId}`)
    } else {
      console.log(`User ${email} already exists. ID: ${userId}`)
    }

    // 1. Check if profile exists, if not create
    const { data: profile } = await supabase.from('profiles').select('id').eq('id', userId).maybeSingle()
    if (!profile) {
      await supabase.from('profiles').insert({
        id: userId,
        email: email,
        full_name: shopData.businessName,
        role: 'shop',
        subscription_status: 'trial',
        expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      })
    }

    // Delete existing business profile if any
    await supabase.from('business_profiles').delete().eq('slug', shopData.slug)

    // 2. Create Business Profile
    const { data: business, error: bizError } = await supabase.from('business_profiles').insert({
      account_id: userId,
      business_name: shopData.businessName,
      slug: shopData.slug,
      categories: [cat.slug],
      category: cat.name,
      location_district: 'Quận 1',
      location_city: 'TP Hồ Chí Minh',
      hotline: '0901234567',
      logo_url: shopData.logoUrl,
      theme_color: cat.color,
      is_verified: true
    }).select().single()

    if (bizError) {
      console.error(`Error creating business for ${cat.slug}:`, bizError)
      continue
    }

    // 3. Create Landing Page
    const contentJson = {
      hero_section: {
        hero_title: shopData.businessName,
        hero_subtitle: shopData.description,
        hero_slides: [
          { image_url: shopData.coverImage, title: '' }
        ]
      },
      about_us: {
        section_title: 'Về Cửa Hàng',
        intro_text: shopData.description,
      },
      services_menu: shopData.products
    }

    const { error: pageError } = await supabase.from('landing_pages').insert({
      business_id: business.id,
      template_id: 'market-v1',
      content_json: contentJson,
      draft_json: contentJson,
      is_published: true
    })

    if (pageError) {
      console.error(`Error creating landing page for ${cat.slug}:`, pageError)
      continue
    }

    // 4. Create Products
    await supabase.from('shop_products').delete().eq('business_id', business.id)
    
    const productsToInsert = shopData.products.map((p: any) => ({
      business_id: business.id,
      name: p.name,
      price: p.price,
      price_original: p.price_original || null,
      category: p.category,
      description: 'Mô tả chi tiết đang cập nhật...',
      image_url: p.img,
      is_featured: p.is_featured || false
    }))

    const { error: productError } = await supabase.from('shop_products').insert(productsToInsert)
    if (productError) {
      console.error(`Error creating products for ${cat.slug}:`, productError)
    }

    // 5. Active Feature for Homepage
    // Only insert if not exists (or delete before insert)
    await supabase.from('active_homepage_shop_features').delete().eq('business_slug', shopData.slug)
    await supabase.from('active_homepage_shop_features').insert({
      business_slug: shopData.slug,
      business_name: shopData.businessName,
      category: cat.name,
      location_district: 'Quận 1',
      location_city: 'TP Hồ Chí Minh',
      logo_url: shopData.logoUrl,
      is_verified: true,
      content_json: contentJson,
      starts_at: new Date().toISOString()
    })

    console.log(`✅ Successfully seeded demo shop: ${shopData.businessName}`)
  }

  console.log('Finished seeding all demo shops!')
}

seed()
