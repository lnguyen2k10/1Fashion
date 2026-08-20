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

const BLOG_CONTENT = `Từ khóa chính: trang sức 2026, dây chuyền, vòng tay, khuyên tai, trang sức bạc, trang sức tối giản, phụ kiện thời trang

Trang sức 2026 không cần “lấp lánh” để gây chú ý – mà cần “tinh tế” để ghi điểm. Xu hướng “less is more” lên ngôi, với những món trang sức nhỏ nhưng có “gu”, dễ phối, dễ “nâng cấp” outfit.

Top 5 món trang sức “must-have” 2026:

- Layered Necklaces: Dây chuyền mảnh, đeo lớp – tạo chiều sâu cho cổ và áo.
- Chunky Rings: Nhẫn to, hình học, kim loại mờ – phong cách “cool girl”.
- Hoop Earrings: Khuyên tai tròn, kích thước vừa – thanh lịch, phù hợp mọi dịp.
- Personalized Charms: Mặt dây chuyền khắc tên, ngày sinh – mang ý nghĩa cá nhân.
- Sustainable Jewelry: Trang sức làm từ kim loại tái chế – đẹp mà có trách nhiệm.

Đừng ngại mix kim loại: vàng + bạc + rose gold – nếu biết cách phối, sẽ cực “nghệ”.

“Trang sức không làm bạn đẹp hơn – mà giúp bạn tỏa sáng theo cách riêng.”`

async function run() {
  // Get business id for prestige-boutique (Luxury / Trang Sức)
  const { data: shops } = await supabase.from('business_profiles').select('id').eq('slug', 'prestige-boutique')
  const businessId = shops && shops.length > 0 ? shops[0].id : null

  if (!businessId) {
    console.error('Không tìm thấy shop prestige-boutique')
    return
  }

  const { error } = await supabase.from('blogs').insert({
    business_id: businessId,
    title: 'Trang Sức 2026: Điểm Nhấn Tinh Tế – Khẳng Định Cá Tính',
    slug: 'trang-suc-2026-diem-nhan-tinh-te-khang-dinh-ca-tinh',
    category: 'Trang Sức',
    content: BLOG_CONTENT,
    image_url: 'https://images.unsplash.com/photo-1599643478514-4a4e09d56330?q=80&w=800',
    status: 'published'
  })

  if (error) {
    console.error('Lỗi thêm blog:', error)
  } else {
    console.log('Đã thêm bài blog thứ sáu thành công!')
  }
}

run()
