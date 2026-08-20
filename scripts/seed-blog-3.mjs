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

const BLOG_CONTENT = `Từ khóa chính: giày sneaker 2026, giày cao gót, giày boots, giày thể thao, xu hướng giày dép, giày nam nữ

Giày dép 2026 không chỉ đẹp – mà còn “thông minh”. Từ chất liệu thân thiện môi trường đến thiết kế ergonomic (tối ưu cho bàn chân), mỗi đôi giày đều là một tuyên ngôn về lối sống hiện đại.

Top 4 kiểu giày “phải có” trong tủ đồ 2026:

- Chunky Sneaker: Đế dày, form to, phối cùng quần ống rộng – chuẩn street style.
- Square-Toe Heels: Giày cao gót mũi vuông – thanh lịch, hiện đại, phù hợp công sở.
- Combat Boots: Bụi bặm, mạnh mẽ, “cân” mọi outfit từ jeans đến váy hoa.
- Slide Sandals Cao Cấp: Dép lê nhưng “sang” – chất liệu da, đính kim loại, đi tiệc cũng được.

Đừng quên: giày sạch = phong cách sạch. Đầu tư vào hộp đựng và bộ vệ sinh giày – vì chi tiết nhỏ làm nên khác biệt lớn.

“Đôi giày bạn chọn hôm nay sẽ dẫn bạn đến nơi bạn muốn đến ngày mai.”`

async function run() {
  // Get business id for sole-step (Giày Dép)
  const { data: shops } = await supabase.from('business_profiles').select('id').eq('slug', 'sole-step')
  const businessId = shops && shops.length > 0 ? shops[0].id : null

  if (!businessId) {
    console.error('Không tìm thấy shop sole-step')
    return
  }

  const { error } = await supabase.from('blogs').insert({
    business_id: businessId,
    title: 'Giày Dép 2026: Bước Đi Tự Tin, Phong Cách Dẫn Đầu',
    slug: 'giay-dep-2026-buoc-di-tu-tin-phong-cach-dan-dau',
    category: 'Giày Dép',
    content: BLOG_CONTENT,
    image_url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800',
    status: 'published'
  })

  if (error) {
    console.error('Lỗi thêm blog:', error)
  } else {
    console.log('Đã thêm bài blog thứ ba thành công!')
  }
}

run()
