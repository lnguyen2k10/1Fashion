import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data: profiles, error } = await supabase.from('profiles').select('id, subscription_status, is_active');
  console.log("TOTAL PROFILES:", profiles?.length);
  console.log("ACTIVE SUBS:", profiles?.filter(p => p.subscription_status === 'active')?.length);
  console.log("ACTIVE FLAG:", profiles?.filter(p => p.is_active === true)?.length);
}
check();
