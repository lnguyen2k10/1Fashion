import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://vnphrpimyqyzcgpyhzwy.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZucGhycGlteXF5emNncHloend5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjYyMzEzNCwiZXhwIjoyMTAyMTk5MTM0fQ.n2jk7bJqXDlS8p3_WiyYniCDV8VoFh-CsyU5-KD27Ds'
)

async function main() {
  // Lấy vài slug thực tế để test
  const { data: shops } = await supabase.from('active_landing_pages').select('business_slug, business_name').limit(10)
  
  console.log('Test URLs (paste vào browser):')
  shops?.forEach(s => {
    console.log(`  http://localhost:3000/${s.business_slug}  (${s.business_name})`)
  })
}

main().catch(console.error)
