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

      const sampleRow = rows[0];
      
      const { data: sampleBp } = await supabase
        .from('business_profiles')
        .select('*')
        .eq('business_name', sampleRow.business_name)
        .limit(1)
        .single();
        
      if (!sampleBp) {
         console.log('Sample shop not found in DB!');
      } else {
         console.log(`Found in DB: ${sampleBp.business_name}`);
         
         const { data: locs } = await supabase.from('business_locations').select('*').eq('business_id', sampleBp.id);
         if (locs && locs.length > 0) {
             console.log(`Location Address: ${locs[0].address_line1}`);
         }
         
         const { data: lps } = await supabase.from('landing_pages').select('content_json').eq('business_id', sampleBp.id);
         if (lps && lps.length > 0) {
             const lp = lps[0];
             console.log(`Landing Page JSON Check:`);
             console.log(JSON.stringify(lp.content_json, null, 2));
         }
      }
    }
  });
}

checkImport();
