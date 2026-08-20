const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkAndFix() {
  console.log('Fetching test user...');
  const { data: { users } } = await supabase.auth.admin.listUsers();
  
  // Find shop@1fashion.vn or create it
  let testUser = users.find(u => u.email === 'shop@1fashion.vn');
  
  if (!testUser) {
    console.log('Test user shop@1fashion.vn not found, creating...');
    const { data: newUser, error } = await supabase.auth.admin.createUser({
      email: 'shop@1fashion.vn',
      password: 'password123',
      email_confirm: true
    });
    if (error) throw error;
    testUser = newUser.user;
  }
  
  console.log('Using user ID:', testUser.id);

  // Upsert the demo shop
  const shopId = testUser.id;
  await supabase.from('business_profiles').upsert({
    id: shopId,
    slug: 'demo-fashion-shop',
    business_name: 'Cửa hàng Demo Fashion',
    category: 'Thời trang nữ',
    location_city: 'Hồ Chí Minh',
    location_district: 'Quận 1',
    is_verified: true,
    logo_url: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=200',
    subscription_status: 'active',
    contact_phone: '0901234567'
  });
  
  // Create landing page
  await supabase.from('landing_pages').upsert({
    business_id: shopId,
    template_id: 'market-v1',
    status: 'published',
    published_at: new Date().toISOString(),
    content_json: {
      hero_section: {
        title: "Demo Fashion Shop",
        subtitle: "Thời trang cao cấp dành cho bạn",
        hero_slides: [
          { image_url: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=800" },
          { image_url: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?q=80&w=800" }
        ]
      }
    }
  });

  // Feature it on homepage
  const { data: featureExists } = await supabase.from('homepage_features').select('*').eq('business_id', shopId).eq('feature_type', 'shop').single();
  if (!featureExists) {
    await supabase.from('homepage_features').insert({
      business_id: shopId,
      feature_type: 'shop',
      starts_at: new Date().toISOString(),
      ends_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      is_active: true
    });
  }

  console.log('Demo shop created & featured on homepage successfully!');
}

checkAndFix().catch(console.error);
