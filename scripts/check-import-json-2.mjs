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

      // Find one that has landing pages
      for (const row of rows) {
          const { data: sampleBp } = await supabase
            .from('business_profiles')
            .select('*')
            .eq('business_name', row.business_name)
            .limit(1)
            .single();
            
          if (sampleBp) {
             const { data: locs } = await supabase.from('business_locations').select('*').eq('business_id', sampleBp.id);
             const { data: lps } = await supabase.from('landing_pages').select('content_json').eq('business_id', sampleBp.id);
             
             if (lps && lps.length > 0) {
                 console.log(`\nFound fully imported shop: ${sampleBp.business_name}`);
                 if (locs && locs.length > 0) {
                     console.log(`Location Address: ${locs[0].address_line1}`);
                 }
                 console.log(`Landing Page JSON Check:`);
                 console.log(JSON.stringify(lps[0].content_json, null, 2));
                 break;
             }
          }
      }
    }
  });
}

checkImport();
