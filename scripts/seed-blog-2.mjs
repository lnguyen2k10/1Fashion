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

const BLOG_CONTENT = `Từ khóa chính: túi xách 2026, xu hướng túi xách, túi tote, túi clutch, túi đeo chéo, túi hiệu giá tốt

Mùa Thu 2026 chứng kiến sự lên ngôi của những chiếc túi “có chiều sâu” – cả về thiết kế lẫn thông điệp. Không còn là món đồ đi kèm, túi xách giờ là điểm nhấn định hình toàn bộ outfit.

5 xu hướng túi xách hot nhất 2026:

- Oversized Tote: Túi lớn, chất liệu da mềm, phù hợp đi học, đi làm hay đi cafe.
- East-West Bag: Túi dáng ngang, thanh lịch, lý tưởng cho buổi hẹn hò hoặc sự kiện.
- Croc-Embossed: Họa tiết da cá sấu giả – sang mà không “lố”.
- Top-Handle Comeback: Túi quai xách cổ điển, mang hơi hướng quý phái.
- Unzipped Styling: Túi để hở khóa – phong cách “cố tình bất cần” đầy cuốn hút.

Màu sắc chủ đạo: Burgundy (đỏ rượu), nâu chocolate, xanh rêu – dễ phối, dễ “ăn điểm”.

“Chiếc túi bạn cầm trên tay nói lên nhiều hơn cả lời bạn nói.”`

async function run() {
  // Get business id for lumina-accessories (Túi xách/Phụ kiện)
  const { data: shops } = await supabase.from('business_profiles').select('id').eq('slug', 'lumina-accessories')
  const businessId = shops && shops.length > 0 ? shops[0].id : null

  if (!businessId) {
    console.error('Không tìm thấy shop lumina-accessories')
    return
  }

  const { error } = await supabase.from('blogs').insert({
    business_id: businessId,
    title: 'Túi Xách 2026: Không Chỉ Là Phụ Kiện, Mà Là Tuyên Ngôn Phong Cách',
    slug: 'tui-xach-2026-khong-chi-la-phu-kien-ma-la-tuyen-ngon-phong-cach',
    category: 'Túi Xách',
    content: BLOG_CONTENT,
    image_url: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=800',
    status: 'published'
  })

  if (error) {
    console.error('Lỗi thêm blog:', error)
  } else {
    console.log('Đã thêm bài blog thứ hai thành công!')
  }
}

run()
