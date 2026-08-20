import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://vnphrpimyqyzcgpyhzwy.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZucGhycGlteXF5emNncHloend5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjYyMzEzNCwiZXhwIjoyMTAyMTk5MTM0fQ.n2jk7bJqXDlS8p3_WiyYniCDV8VoFh-CsyU5-KD27Ds'
)

async function main() {
  const { data: bps } = await supabase.from('business_profiles').select('id, account_id').limit(10)
  const bpIds = bps.map(b => b.id)
  
  const { data: subs } = await supabase.from('subscriptions').select('*').in('business_id', bpIds)
  console.log('Subscriptions:', subs.length)
}

main().catch(console.error)
