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

const BLOG_CONTENT = `Từ khóa chính: streetwear 2026, áo hoodie, quần jogger, sneaker, phong cách đường phố, outfit streetwear, street style Việt

Streetwear 2026 không còn là “mặc cho thoải mái” – mà là “mặc để gây ấn tượng”. Với sự bùng nổ của văn hóa hip-hop, skateboarding và nghệ thuật đường phố, streetwear giờ là biểu tượng của sự tự do và bản lĩnh.

Xu hướng streetwear “cháy” nhất 2026:

- Blokecore: Áo đấu bóng đá + quần jeans + sneaker – phong cách “fan cứng” nhưng vẫn thời thượng.
- Boxy Fit: Áo form vuông, ngắn tay, phối cùng quần ống suông – tôn dáng, dễ mặc.
- Graphic Tee “Statement”: Áo thun in hình nghệ thuật, slogan cá tính – “mặc là phải có tiếng nói”.
- Layering Thông Minh: Áo khoác denim + hoodie + áo phông – lớp lớp nhưng không rối.

Streetwear không phân biệt giới tính – hãy mặc theo cách bạn cảm thấy “đúng nhất”.

“Đường phố không cần sàn catwalk – vì chính bạn là người mẫu.”`

async function run() {
  // Get business id for urban-hype (Streetwear)
  const { data: shops } = await supabase.from('business_profiles').select('id').eq('slug', 'urban-hype')
  const businessId = shops && shops.length > 0 ? shops[0].id : null

  if (!businessId) {
    console.error('Không tìm thấy shop urban-hype')
    return
  }

  const { error } = await supabase.from('blogs').insert({
    business_id: businessId,
    title: 'Streetwear 2026: Khi Đường Phố Trở Thành Sàn Catwalk',
    slug: 'streetwear-2026-khi-duong-pho-tro-thanh-san-catwalk',
    category: 'Streetwear',
    content: BLOG_CONTENT,
    image_url: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=800',
    status: 'published'
  })

  if (error) {
    console.error('Lỗi thêm blog:', error)
  } else {
    console.log('Đã thêm bài blog thứ tư thành công!')
  }
}

run()
