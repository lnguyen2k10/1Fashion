import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const slugsToDelete = [
  'recircle-premium-quan-1-fx8p'
];

async function main() {
  console.log(`Starting deletion for ${slugsToDelete.length} shops...`);
  
  for (const slug of slugsToDelete) {
    console.log(`Deleting shop: ${slug}`);
    
    // Find the business profile
    const { data: business } = await supabase.from('business_profiles').select('id, account_id').eq('slug', slug).maybeSingle();
    
    if (business) {
      const { account_id } = business;
      
      // Delete business profile (which cascades to landing_pages and locations usually, but let's be safe)
      await supabase.from('business_profiles').delete().eq('id', business.id);
      console.log(`  - Deleted business_profile ${business.id}`);
      
      // Delete profile and user
      if (account_id) {
          await supabase.from('profiles').delete().eq('id', account_id);
          console.log(`  - Deleted profile ${account_id}`);
          const { error: userErr } = await supabase.auth.admin.deleteUser(account_id);
          if (!userErr) {
              console.log(`  - Deleted auth user ${account_id}`);
          }
      }
    } else {
      console.log(`  - Not found.`);
    }
  }
  console.log('DONE');
}

main();
