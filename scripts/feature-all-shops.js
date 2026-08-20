const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function featureAllShops() {
  console.log('Fetching all active shops...');
  const { data: shops, error: fetchError } = await supabase
    .from('business_profiles')
    .select('id, business_name');
    
  if (fetchError) {
    console.error('Error fetching shops:', fetchError);
    return;
  }

  console.log(`Found ${shops.length} shops.`);

  let featuredCount = 0;
  for (const shop of shops) {
    // Check if already featured
    const { data: existingFeature } = await supabase
      .from('homepage_features')
      .select('id')
      .eq('business_id', shop.id)
      .eq('feature_type', 'shop')
      .single();

    if (!existingFeature) {
      // Add to homepage features
      const { error: insertError } = await supabase
        .from('homepage_features')
        .insert({
          business_id: shop.id,
          feature_type: 'shop',
          starts_at: new Date().toISOString(),
          ends_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // Featured for 1 year
          is_active: true
        });
        
      if (insertError) {
        console.error(`Failed to feature shop ${shop.business_name}:`, insertError);
      } else {
        console.log(`Featured shop: ${shop.business_name}`);
        featuredCount++;
      }
    } else {
      console.log(`Shop already featured: ${shop.business_name}`);
    }
  }

  console.log(`Successfully featured ${featuredCount} new shops.`);
}

featureAllShops().catch(console.error);
