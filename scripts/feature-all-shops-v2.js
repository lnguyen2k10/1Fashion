const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function run() {
  // Get packages
  let { data: pkg } = await supabase.from('packages').select('*').limit(1).single();
  
  if (!pkg) {
    console.log('No package found, creating one...');
    const { data: newPkg, error: pkgErr } = await supabase.from('packages').insert({
      name: 'Pro',
      type: 'lifetime',
      price: 0,
      limits: {
        homepage_shop_feature_count: 10,
        homepage_shop_feature_duration_days: 365,
        homepage_product_feature_count: 100,
        homepage_product_feature_duration_days: 365
      },
      is_active: true
    }).select().single();
    if (pkgErr) throw pkgErr;
    pkg = newPkg;
  }
  
  console.log('Using package:', pkg.id);

  // Get active shops
  const { data: shops } = await supabase.from('business_profiles').select('id, business_name');
  
  for (const shop of shops) {
    console.log(`Processing shop: ${shop.business_name}`);
    
    // Check if subscription exists
    let { data: sub } = await supabase.from('subscriptions').select('id, status').eq('business_id', shop.id).eq('status', 'active').limit(1).single();
    
    if (!sub) {
      console.log(`Creating subscription for ${shop.business_name}...`);
      const { data: newSub, error: subErr } = await supabase.from('subscriptions').insert({
        business_id: shop.id,
        package_id: pkg.id,
        status: 'active',
        verified: true,
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      }).select().single();
      if (subErr) {
         console.error('Failed to create sub:', subErr);
         continue;
      }
      sub = newSub;
    }
    
    // Insert feature activation
    const { data: exists } = await supabase.from('homepage_feature_activations')
       .select('id').eq('business_id', shop.id).eq('feature_type', 'shop').limit(1).single();
       
    if (!exists) {
      const { error: featErr } = await supabase.from('homepage_feature_activations').insert({
         business_id: shop.id,
         subscription_id: sub.id,
         feature_type: 'shop',
         starts_at: new Date().toISOString(),
         // expires_at is handled by trigger
      });
      if (featErr) {
        console.error(`Failed to feature ${shop.business_name}:`, featErr);
      } else {
        console.log(`Successfully featured ${shop.business_name}`);
      }
    } else {
      console.log(`${shop.business_name} is already featured.`);
    }
  }
}

run().catch(console.error);
