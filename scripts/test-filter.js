const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data, error } = await supabase.from('directory_shops').select('business_slug, category, categories').limit(10);
  console.log("Data:", data);
  console.log("Error:", error);
  
  const { data: d2, error: e2 } = await supabase.from('directory_shops').select('business_slug').contains('categories', ['Thời Trang']);
  console.log("Filtered Thời Trang:", d2);
  console.log("Filtered Error:", e2);

  const { data: d3, error: e3 } = await supabase.from('directory_shops').select('business_slug').contains('categories', ['Thời trang']);
  console.log("Filtered Thời trang (lowercase t):", d3);
}

check();
