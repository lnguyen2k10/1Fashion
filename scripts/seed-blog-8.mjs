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

const BLOG_CONTENT = `Từ khóa chính: phụ kiện thời trang 2026, mũ, kính mát, thắt lưng, khăn choàng, phụ kiện streetwear, phụ kiện tối giản

Phụ kiện 2026 là “vũ khí bí mật” của những tín đồ thời trang. Một chiếc kính mát, một chiếc mũ, hay thậm chí một chiếc thắt lưng – đều có thể “lật kèo” cả set đồ từ “bình thường” thành “xuất sắc”.

Top 5 phụ kiện “phải có” 2026:

- Oversized Sunglasses: Kính mát form to, viền kim loại – “che nắng” mà vẫn “che được sự nhàm chán”.
- Bucket Hat: Mũ bucket chất liệu canvas hoặc denim – phong cách streetwear “chuẩn chỉ”.
- Chain Belts: Thắt lưng xích kim loại – đeo ngoài váy hoặc quần jeans – “phá cách” đúng nghĩa.
- Silk Scarves: Khăn lụa nhỏ, buộc tóc, quàng cổ, hoặc buộc túi – “một món, nhiều cách”.
- Tech Pouches: Túi đựng phụ kiện công nghệ – vừa tiện, vừa “nghệ”, vừa “sống ảo”.

Phụ kiện không cần nhiều – chỉ cần “đúng”. Một món “đắt giá” hơn mười món “vô tri”.

“Phụ kiện là dấu chấm than – khiến câu chuyện thời trang của bạn trở nên đáng nhớ.”`

async function run() {
  // Get business id for vision-optics (Phụ Kiện / Kính Mắt)
  const { data: shops } = await supabase.from('business_profiles').select('id').eq('slug', 'vision-optics')
  const businessId = shops && shops.length > 0 ? shops[0].id : null

  if (!businessId) {
    console.error('Không tìm thấy shop vision-optics')
    return
  }

  const { error } = await supabase.from('blogs').insert({
    business_id: businessId,
    title: 'Phụ Kiện 2026: Chi Tiết Nhỏ – Ảnh Hưởng Lớn',
    slug: 'phu-kien-2026-chi-tiet-nho-anh-huong-lon',
    category: 'Phụ Kiện',
    content: BLOG_CONTENT,
    image_url: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=800',
    status: 'published'
  })

  if (error) {
    console.error('Lỗi thêm blog:', error)
  } else {
    console.log('Đã thêm bài blog thứ tám thành công!')
  }
}

run()
