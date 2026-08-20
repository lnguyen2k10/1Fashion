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

const BLOG_CONTENT = `Từ khóa chính: thời trang mẹ và bé, outfit mẹ bé, đồ bầu 2026, đồ trẻ em, phong cách gia đình, thời trang bền vững cho bé

2026 là năm của “family matching” – khi mẹ và bé cùng diện đồ “tông-sur-ton”, tạo nên những bức ảnh gia đình “triệu like”. Nhưng không chỉ đẹp – đồ mẹ & bé 2026 còn phải an toàn, thoải mái và bền vững.

Xu hướng thời trang mẹ & bé 2026:

- Matching Sets: Áo mẹ – áo bé cùng họa tiết, cùng màu – dễ thương, dễ chụp ảnh.
- Organic Cotton: Chất liệu cotton hữu cơ, không hóa chất, an toàn cho da bé.
- Unisex Baby Wear: Đồ trung tính, màu pastel, phù hợp cả bé trai lẫn bé gái.
- Mommy Chic: Váy bầu dáng suông, áo sơmi oversize – vừa thoải mái, vừa thời thượng.

Đừng quên: thời trang cho bé không cần đắt – chỉ cần an toàn và đáng yêu.

“Mỗi cái ôm của mẹ là một bộ trang phục hoàn hảo nhất cho bé.”`

async function run() {
  // Get business id for baby-smile (Mẹ & Bé)
  const { data: shops } = await supabase.from('business_profiles').select('id').eq('slug', 'baby-smile')
  const businessId = shops && shops.length > 0 ? shops[0].id : null

  if (!businessId) {
    console.error('Không tìm thấy shop baby-smile')
    return
  }

  const { error } = await supabase.from('blogs').insert({
    business_id: businessId,
    title: 'Mẹ & Bé 2026: Phong Cách Từ Nhịp Tim – Thời Trang Cho Cả Gia Đình',
    slug: 'me-be-2026-phong-cach-tu-nhip-tim-thoi-trang-cho-ca-gia-dinh',
    category: 'Mẹ & Bé',
    content: BLOG_CONTENT,
    image_url: 'https://images.unsplash.com/photo-1519241047957-be31d7379a5d?q=80&w=800',
    status: 'published'
  })

  if (error) {
    console.error('Lỗi thêm blog:', error)
  } else {
    console.log('Đã thêm bài blog thứ năm thành công!')
  }
}

run()
