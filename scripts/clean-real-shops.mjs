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

const REAL_SHOPS = [
  'youon-boutique-e304',
  'her-declub-2h5a',
  'streestylevn-chuyen-order-sneakers-xkef',
  'shop-goc-be-yeu-shop-quan-ao-tre-em-xuat-nhap-khau-han-quoc-usa-7vsz'
]

const FAKE_PRODUCT_NAMES = [
  'Đầm Dạ Hội Lụa Satin Xẻ Đùi Cao Cấp',
  'Túi Xách Nữ Da Bò Thật Khóa Đồng Xu Hướng',
  'Sneaker Thể Thao Nam Năng Động Đế Boost',
  'Váy Công Chúa Chấm Bi Bé Gái Đáng Yêu'
]

const FAKE_OFFER_TITLES = [
  'Sale Giữa Mùa Hè - Giảm 30% Đầm Lụa',
  'Tặng Ví Cầm Tay Cho Hóa Đơn 2 Triệu',
  'Mua 1 Tặng 1 Giày Thể Thao Nữ',
  'Back To School - Giảm 20% Đồ Bé Trai'
]

async function clean() {
  const { data: shops, error: shopError } = await supabase.from('business_profiles').select('id, slug').in('slug', REAL_SHOPS)
  if (shopError || !shops) {
    console.error('Không tìm thấy shops', shopError)
    return
  }

  for (const shop of shops) {
    // Delete fake products
    await supabase.from('shop_products').delete().eq('business_id', shop.id).in('name', FAKE_PRODUCT_NAMES)
    
    // Delete fake offers
    await supabase.from('business_offers').delete().eq('business_id', shop.id).in('title', FAKE_OFFER_TITLES)
    
    console.log(`Đã dọn dẹp data ảo cho shop: ${shop.slug}`)
  }
}

clean()
