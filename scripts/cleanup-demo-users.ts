import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function cleanupAll() {
  console.log('Fetching all users...')
  let page = 1
  while(true) {
    const { data: users } = await supabase.auth.admin.listUsers({ page, perPage: 100 })
    if (!users || !users.users || users.users.length === 0) break
    for (const u of users.users) {
      if (u.email?.startsWith('demo_')) {
        await supabase.auth.admin.deleteUser(u.id)
        console.log('Deleted Auth User', u.email)
      }
    }
    page++
  }
  
  const { data: profiles } = await supabase.from('profiles').select('*')
  if (profiles) {
    for (const p of profiles) {
      if (p.email?.startsWith('demo_')) {
        await supabase.from('profiles').delete().eq('id', p.id)
        console.log('Deleted Profile', p.email)
      }
    }
  }
  
  console.log('Cleanup Done')
}

cleanupAll()
