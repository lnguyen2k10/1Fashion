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

const BLOG_CONTENT = `Từ khóa chính: thời trang 2026, xu hướng thời trang, phong cách Gen Z, street style, outfit đi chơi, thời trang bền vững

Năm 2026 đánh dấu sự trở lại của phong cách tối giản kết hợp cùng chất liệu bền vững và đường cắt hiện đại. Giới trẻ Việt đang dần chuyển dịch từ “mặc đẹp” sang “mặc có gu” – nơi mỗi bộ trang phục không chỉ thể hiện cá tính mà còn phản ánh giá trị sống.

Các xu hướng nổi bật gồm:

- Minimalism 2.0: Áo sơmi oversize, quần ống rộng, tông màu trung tính (be, xám khói, nâu đất).
- Y2K Revival: Áo croptop, chân váy ngắn, phụ kiện kim loại sáng bóng.
- Sustainable Fashion: Chất liệu tái chế, vải organic, thiết kế “slow fashion” – mặc lâu, ít nhưng chất.

Đừng quên mix & match thông minh: một chiếc blazer nam tính + quần jeans rách gối + sneaker trắng = outfit “chuẩn Instagram” cho mọi dịp.

“Thời trang không chỉ là quần áo – đó là ngôn ngữ không lời của bạn.”`

async function run() {
  // Get business id for a demo fashion shop
  const { data: shops } = await supabase.from('business_profiles').select('id').eq('slug', 'elegance-fashion')
  const businessId = shops && shops.length > 0 ? shops[0].id : null

  if (!businessId) {
    console.error('Không tìm thấy shop elegance-fashion')
    return
  }

  const { error } = await supabase.from('blogs').insert({
    business_id: businessId,
    title: 'Bắt Nhịp Xu Hướng 2026: Phong Cách Đỉnh Cao Cho Gen Z',
    slug: 'bat-nhip-xu-huong-2026-phong-cach-dinh-cao-cho-gen-z',
    category: 'Thời Trang',
    content: BLOG_CONTENT,
    image_url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800',
    status: 'published'
  })

  if (error) {
    console.error('Lỗi thêm blog:', error)
  } else {
    console.log('Đã thêm bài blog thành công!')
  }
}

run()
