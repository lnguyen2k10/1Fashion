import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const slugsToDelete = [
  'anh-2-thoi-trang-nam-quan-ao-co-du-gu-zvms',
  'hollis-w17u'
]

async function run() {
  console.log('Bắt đầu xóa shop:', slugsToDelete)
  
  const { data, error } = await supabase
    .from('business_profiles')
    .delete()
    .in('slug', slugsToDelete)
    .select('slug, business_name')

  if (error) {
    console.error('Lỗi khi xóa:', error)
  } else {
    console.log('Đã xóa thành công:', data)
  }
}

run()
