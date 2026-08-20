const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const category = 'Thời Trang';
  const slug = 'fashion';
  
  const requestQuery = supabase.from('directory_shops').select('business_slug, category, categories').or(`categories.cs.{${category}},categories.cs.{${slug}},category.eq.${category},category.eq.${slug}`);
  
  const { data, error } = await requestQuery;
  console.log("Filtered Data length:", data.length);
  if (data.length > 0) {
    console.log("Sample:", data[0]);
  }
}

check();
