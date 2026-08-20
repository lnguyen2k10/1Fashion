import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Papa from 'papaparse';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkImport() {
  const csvFile = fs.readFileSync(path.resolve(__dirname, '../shop_data.csv'), 'utf8');
  
  Papa.parse(csvFile, {
    header: true,
    skipEmptyLines: true,
    complete: async (results) => {
      const rows = results.data;
      console.log(`Total rows in CSV: ${rows.length}`);

      const { count: bpCount, error: bpError } = await supabase
        .from('business_profiles')
        .select('*', { count: 'exact', head: true });

      const { count: lpCount, error: lpError } = await supabase
        .from('landing_pages')
        .select('*', { count: 'exact', head: true });

      console.log(`Total business_profiles in DB: ${bpCount}`);
      console.log(`Total landing_pages in DB: ${lpCount}`);

      // Let's check a sample shop to see if all fields are imported correctly
      const sampleRow = rows[0];
      console.log('\n--- Checking sample shop ---');
      console.log(`Business Name (CSV): ${sampleRow.business_name}`);
      
      const { data: sampleBp } = await supabase
        .from('business_profiles')
        .select('*, landing_pages(content_json), business_locations(*)')
        .eq('business_name', sampleRow.business_name)
        .limit(1)
        .single();
        
      if (!sampleBp) {
         console.log('Sample shop not found in DB!');
      } else {
         console.log(`Found in DB: ${sampleBp.business_name}`);
         console.log(`Category: ${sampleBp.category}`);
         if (sampleBp.business_locations && sampleBp.business_locations.length > 0) {
             console.log(`Location Address: ${sampleBp.business_locations[0].address_line1}`);
         }
         if (sampleBp.landing_pages && sampleBp.landing_pages.length > 0) {
             const lp = sampleBp.landing_pages[0];
             console.log(`Landing Page JSON Check:`);
             console.log(`- phone: ${lp.content_json?.contact_info?.hotline}`);
             console.log(`- website: ${lp.content_json?.contact_info?.website}`);
             console.log(`- address: ${lp.content_json?.contact_info?.address_full}`);
             console.log(`- gallery images count: ${lp.content_json?.gallery?.length || lp.content_json?.gallery?.images?.length || 0}`);
         }
      }
      
      console.log('\n--- Summary of missing fields in import ---');
      console.log('The following fields from CSV were NOT imported into the database by the import-shops.mjs script:');
      console.log('priority, selection_rank, prospect_score, neighborhood, google_maps_url, place_id, rating, reviews_count, claim_this_business, search_string, google_rank, scraped_at');
    }
  });
}

checkImport();
