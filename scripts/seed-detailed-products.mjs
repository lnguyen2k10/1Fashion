import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const DETAILED_PRODUCTS = {
  'elegance-fashion': { // fashion
    name: 'Đầm Dạ Hội Lụa Satin Xẻ Đùi Cao Cấp',
    price: '1.250.000đ',
    price_original: '1.800.000đ',
    category: 'Váy Đầm',
    description: 'Đầm dạ hội lụa satin bóng mượt với thiết kế xẻ đùi quyến rũ, cúp ngực tinh tế giúp tôn lên vóc dáng hoàn hảo của phái đẹp. Chất liệu lụa cao cấp mềm mại, thoáng mát, mang lại cảm giác thoải mái khi mặc trong các sự kiện sang trọng.',
    image_url: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?q=80&w=800',
    image_gallery: JSON.stringify([
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800',
      'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=800',
      'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?q=80&w=800'
    ]),
    is_featured: true
  },
  'lumina-accessories': { // accessories
    name: 'Túi Xách Nữ Da Bò Thật Khóa Đồng Xu Hướng',
    price: '1.500.000đ',
    price_original: '2.200.000đ',
    category: 'Túi Xách',
    description: 'Túi xách da bò thật 100% nhập khẩu, thiết kế khóa đồng cổ điển sang trọng. Ngăn chứa rộng rãi, đường may thủ công tỉ mỉ. Phù hợp cho cả đi làm công sở lẫn những buổi tiệc trà chiều.',
    image_url: 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=800',
    image_gallery: JSON.stringify([
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=800',
      'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?q=80&w=800',
      'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=800'
    ]),
    is_featured: true
  },
  'sole-step': { // shoes
    name: 'Sneaker Thể Thao Nam Năng Động Đế Boost',
    price: '1.200.000đ',
    price_original: '1.500.000đ',
    category: 'Sneaker',
    description: 'Đôi sneaker nam với công nghệ đế Boost siêu êm, giảm chấn hiệu quả. Phần upper sử dụng vải mesh thoáng khí, thiết kế ôm chân giúp bạn thoải mái vận động cả ngày dài mà không lo đau nhức.',
    image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800',
    image_gallery: JSON.stringify([
      'https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=800',
      'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?q=80&w=800',
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800'
    ]),
    is_featured: true
  },
  'baby-smile': { // kids
    name: 'Váy Công Chúa Chấm Bi Bé Gái Đáng Yêu',
    price: '350.000đ',
    price_original: '450.000đ',
    category: 'Váy Bé Gái',
    description: 'Váy công chúa xòe bồng bềnh với họa tiết chấm bi đáng yêu. Chất vải voan mềm mại, lớp lót cotton 100% thấm hút mồ hôi, tuyệt đối an toàn cho làn da nhạy cảm của bé.',
    image_url: 'https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?q=80&w=800',
    image_gallery: JSON.stringify([
      'https://images.unsplash.com/photo-1519241047957-be31d7379a5d?q=80&w=800',
      'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?q=80&w=800',
      'https://images.unsplash.com/photo-1522771930-78848d9293e8?q=80&w=800'
    ]),
    is_featured: true
  },
  'urban-hype': {
    name: 'Áo Hoodie Oversize Trắng In Graphic Nổi Bật',
    price: '650.000đ',
    price_original: '800.000đ',
    category: 'Hoodie',
    description: 'Áo hoodie form oversize rộng rãi đậm chất streetwear. Chất liệu nỉ bông dày dặn, giữ ấm cực tốt. Hình in graphic sắc nét với công nghệ in pet chuyển nhiệt không bong tróc sau nhiều lần giặt.',
    image_url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800',
    image_gallery: JSON.stringify([
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=800',
      'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?q=80&w=800',
      'https://images.unsplash.com/photo-1614676471928-2ed0ad1061a4?q=80&w=800'
    ]),
    is_featured: true
  },
  'prestige-boutique': {
    name: 'Túi Xách Chanel Classic Flap Bag Đen Nhám',
    price: '250.000.000đ',
    price_original: '280.000.000đ',
    category: 'Túi Xách',
    description: 'Biểu tượng của sự xa xỉ vượt thời gian - Chanel Classic Flap Bag. Phiên bản da caviar đen nhám chống xước cùng phần cứng logo CC mạ vàng lấp lánh. Hàng chính hãng 100% kèm bill và box, bảo hành toàn cầu.',
    image_url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=800',
    image_gallery: JSON.stringify([
      'https://images.unsplash.com/photo-1591561954557-26941169b49e?q=80&w=800',
      'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=800',
      'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?q=80&w=800'
    ]),
    is_featured: true
  },
  'chrono-timepieces': {
    name: 'Đồng Hồ Rolex Submariner Date Mặt Đen',
    price: '320.000.000đ',
    price_original: '350.000.000đ',
    category: 'Rolex',
    description: 'Đồng hồ lặn huyền thoại Rolex Submariner Date. Vỏ thép Oystersteel chống gỉ sét, mặt số màu đen đặc trưng với dạ quang Chromalight. Khả năng chịu nước 300 mét, bộ máy cơ tự động Calibre 3235 chính xác tuyệt đối.',
    image_url: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?q=80&w=800',
    image_gallery: JSON.stringify([
      'https://images.unsplash.com/photo-1548032885-b5e38734688a?q=80&w=800',
      'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?q=80&w=800',
      'https://images.unsplash.com/photo-1495856458515-0637185db551?q=80&w=800'
    ]),
    is_featured: true
  },
  'vision-optics': {
    name: 'Kính Râm Ray-Ban Aviator Classic Xanh G-15',
    price: '4.200.000đ',
    price_original: '5.500.000đ',
    category: 'Kính Râm',
    description: 'Kính râm Ray-Ban Aviator Classic - mẫu kính phi công kinh điển. Gọng kim loại vàng kim kết hợp cùng tròng kính xanh lá G-15 đặc trưng, chặn 99% tia UV và chống lóa hiệu quả, mang lại tầm nhìn chân thực nhất.',
    image_url: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=800',
    image_gallery: JSON.stringify([
      'https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=800',
      'https://images.unsplash.com/photo-1508296695146-257a814070b4?q=80&w=800',
      'https://images.unsplash.com/photo-1555529733-0e670560f8e1?q=80&w=800'
    ]),
    is_featured: true
  }
}

const OFFERS = {
  'elegance-fashion': {
    title: 'Sale Giữa Mùa Hè - Giảm 30% Đầm Lụa',
    description: 'Cơ hội sở hữu những mẫu đầm dạ hội sang trọng nhất với mức giá giảm đến 30%. Chỉ áp dụng đến hết tuần này.',
    discount_code: 'SUMMER30',
    image_url: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?q=80&w=800'
  },
  'lumina-accessories': {
    title: 'Tặng Ví Cầm Tay Cho Hóa Đơn 2 Triệu',
    description: 'Sở hữu ngay ví cầm tay da bò cao cấp trị giá 500K cho mỗi hóa đơn mua túi xách từ 2 triệu đồng.',
    discount_code: 'GIFT2M',
    image_url: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=800'
  },
  'sole-step': {
    title: 'Mua 1 Tặng 1 Giày Thể Thao Nam',
    description: 'Chương trình khuyến mãi cực sốc: Mua 1 đôi sneaker tặng ngay 1 đôi dép quai ngang mùa hè thoải mái.',
    discount_code: 'BOGO',
    image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800'
  },
  'baby-smile': {
    title: 'Back To School - Giảm 20% Thời Trang Bé',
    description: 'Chuẩn bị cho bé yêu trở lại trường học với ưu đãi giảm giá 20% toàn bộ bộ sưu tập.',
    discount_code: 'SCHOOL20',
    image_url: 'https://images.unsplash.com/photo-1519241047957-be31d7379a5d?q=80&w=800'
  },
  'urban-hype': {
    title: 'Freeship Mọi Đơn Hàng Áo Hoodie',
    description: 'Đón gió mùa với ưu đãi miễn phí vận chuyển toàn quốc cho mọi đơn hàng áo khoác và hoodie.',
    discount_code: 'FREESHIP',
    image_url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800'
  },
  'prestige-boutique': {
    title: 'Private Sale Thương Hiệu Xa Xỉ',
    description: 'Sự kiện giảm giá riêng tư dành cho khách VIP. Giảm 5% cho đơn hàng Chanel, Gucci.',
    discount_code: 'VIP5',
    image_url: 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?q=80&w=800'
  },
  'chrono-timepieces': {
    title: 'Tặng Dây Da Thay Thế Trị Giá 2M',
    description: 'Tặng ngay 01 dây da cá sấu thay thế khi mua bất kỳ đồng hồ Rolex hoặc Omega.',
    discount_code: 'FREEBAND',
    image_url: 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?q=80&w=800'
  },
  'vision-optics': {
    title: 'Đo Khám Mắt Miễn Phí & Giảm 15% Tròng',
    description: 'Đo mắt với máy quang học điện tử miễn phí. Nhận voucher giảm 15% khi mua kính râm Ray-Ban.',
    discount_code: 'EYECARE',
    image_url: 'https://images.unsplash.com/photo-1555529733-0e670560f8e1?q=80&w=800'
  }
}

async function run() {
  console.log('Bắt đầu seed sản phẩm chi tiết và ưu đãi cho DEMO SHOPS...')

  const { data: shops, error: shopError } = await supabase.from('business_profiles').select('id, slug, business_name')
  if (shopError || !shops) {
    console.error('Không tìm thấy shops', shopError)
    return
  }

  for (const shop of shops) {
    if (!DETAILED_PRODUCTS[shop.slug]) continue
    
    const prodData = DETAILED_PRODUCTS[shop.slug]
    const offerData = OFFERS[shop.slug]

    // 1. Delete old products with the same name to avoid duplicates
    await supabase.from('shop_products').delete().eq('business_id', shop.id).eq('name', prodData.name)

    // Insert new detailed product
    const { error: pError } = await supabase.from('shop_products').insert({
      business_id: shop.id,
      name: prodData.name,
      price: prodData.price,
      price_original: prodData.price_original,
      category: prodData.category,
      description: prodData.description,
      image_url: prodData.image_url,
      image_gallery: JSON.parse(prodData.image_gallery),
      is_featured: true
    })
    
    if (pError) console.error(`Lỗi tạo sản phẩm cho ${shop.business_name}:`, pError)
    else console.log(`Đã tạo sản phẩm chi tiết cho ${shop.business_name}`)

    // 2. Insert Offer
    // Xóa offer cũ nếu có
    await supabase.from('business_offers').delete().eq('business_id', shop.id)
    
    const validUntil = new Date()
    validUntil.setDate(validUntil.getDate() + 30) // 30 days from now

    const { error: oError } = await supabase.from('business_offers').insert({
      business_id: shop.id,
      title: offerData.title,
      description: offerData.description,
      discount_code: offerData.discount_code,
      image_url: offerData.image_url,
      valid_until: validUntil.toISOString(),
      status: 'active'
    })

    if (oError) console.error(`Lỗi tạo ưu đãi cho ${shop.business_name}:`, oError)
    else console.log(`Đã tạo ưu đãi cho ${shop.business_name}`)
  }

  console.log('Hoàn tất seed!')
}

run()
