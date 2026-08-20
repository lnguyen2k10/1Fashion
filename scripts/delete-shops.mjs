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
  'thenormal-thriftshop-q9a0',
  'tho-baby-thoi-trang-tre-em-cu-chi-uv3k',
  'blood-brother-streetwear-baex',
  'tiem-do-nha-lyn-7g7g',
  'cua-hang-thanh-linh-16dm',
  'tien-le-shop-x0zd',
  'truong-thon-lang-nhua-shop-mo-hinhao-thun-anime-uxas',
  'thoi-trang-cong-so-xuan-thom-xbmg',
  'nay-mai-qwsn',
  'qt-fashion-hikd',
  'aster-store-7s4n',
  'maker-80e1',
  'kl-boutique-thoi-trang-nu-cao-cap-t349',
  'cua-hang-thoi-trang-tre-em-new-top-n08d',
  'easy-n-fun-store-2jjr',
  'chou-chou-shop-m57b',
  'thoi-trang-khang-ni-khang-ni-boutique-wkap'
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
