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

const BLOG_CONTENT = `Từ khóa chính: đồng hồ 2026, đồng hồ thông minh, đồng hồ cơ, đồng hồ nam nữ, phụ kiện thời trang, đồng hồ tối giản

Đồng hồ 2026 không còn là công cụ xem giờ – mà là “phụ kiện định hình phong cách”. Từ đồng hồ cơ cổ điển đến smartwatch hiện đại, mỗi chiếc đều kể một câu chuyện về người đeo.

Xu hướng đồng hồ 2026:

- Minimalist Dial: Mặt số đơn giản, không số, chỉ vạch – phong cách “clean & quiet”.
- Vintage Revival: Đồng hồ dây da, mặt tròn, kim vàng – mang hơi hướng thập niên 70-80.
- Smartwatch Fashion: Đồng hồ thông minh nhưng thiết kế như đồng hồ thời trang – “công nghệ nhưng không thô”.
- Unisex Watches: Đồng hồ trung tính, phù hợp cả nam lẫn nữ – “một chiếc cho cả hai”.

Đừng quên: đồng hồ là món trang sức duy nhất “chạy” – hãy chọn chiếc “chạy” cùng nhịp sống của bạn.

“Thời gian không chờ ai – nhưng bạn có thể chọn cách ‘đeo’ nó.”`

async function run() {
  // Get business id for chrono-timepieces (Đồng Hồ)
  const { data: shops } = await supabase.from('business_profiles').select('id').eq('slug', 'chrono-timepieces')
  const businessId = shops && shops.length > 0 ? shops[0].id : null

  if (!businessId) {
    console.error('Không tìm thấy shop chrono-timepieces')
    return
  }

  const { error } = await supabase.from('blogs').insert({
    business_id: businessId,
    title: 'Đồng Hồ 2026: Không Chỉ Là Thời Gian – Mà Là Phong Cách Sống',
    slug: 'dong-ho-2026-khong-chi-la-thoi-gian-ma-la-phong-cach-song',
    category: 'Đồng Hồ',
    content: BLOG_CONTENT,
    image_url: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=800',
    status: 'published'
  })

  if (error) {
    console.error('Lỗi thêm blog:', error)
  } else {
    console.log('Đã thêm bài blog thứ bảy thành công!')
  }
}

run()
