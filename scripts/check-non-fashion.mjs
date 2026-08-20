import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Papa from 'papaparse';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function check() {
  const csvFile = fs.readFileSync(path.resolve(__dirname, '../shop_data.csv'), 'utf8');
  Papa.parse(csvFile, {
    header: true,
    skipEmptyLines: true,
    complete: (results) => {
      const rows = results.data;
      
      const suspicious = rows.filter(row => {
          const name = (row.business_name || '').toLowerCase();
          const cat = (row.category || '').toLowerCase();
          
          // Conditions for what might NOT be a retail fashion shop
          const isWholesale = name.includes('sỉ') || name.includes('buôn') || name.includes('xưởng') || cat.includes('sỉ') || cat.includes('buôn');
          const isSpa = name.includes('spa') || cat.includes('spa');
          const isTech = name.includes('điện thoại') || name.includes('máy tính');
          const isFood = name.includes('cafe') || name.includes('quán') || name.includes('nhà hàng') || cat.includes('nhà hàng');
          const isTailor = name.includes('nhà may') || name.includes('thợ may'); // Maybe tailor is allowed, but let's list it.
          const isUniform = name.includes('đồng phục');
          
          return isWholesale || isSpa || isTech || isFood || isTailor || isUniform;
      });

      console.log(`Found ${suspicious.length} suspicious shops:`);
      suspicious.forEach(s => {
          console.log(`- Name: ${s.business_name} | Category: ${s.category}`);
      });
      
      // Print unique categories just to review
      const uniqueCats = [...new Set(rows.map(r => r.category))];
      console.log('\nAll categories in CSV:');
      console.log(uniqueCats.join(', '));
    }
  });
}
check();
