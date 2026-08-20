const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('Updating site_settings to 1Fashion...');

  const { data, error } = await supabase
    .from('site_settings')
    .update({ app_name: '1Fashion' })
    .eq('id', 1);

  if (error) {
    console.error('Error updating site_settings:', error.message);
  } else {
    console.log('Success! Brand name updated to 1Fashion.');
  }
}

main();
