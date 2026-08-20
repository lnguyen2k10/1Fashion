const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkAndFix() {
  console.log('Checking database...');
  
  // 1. Check/Update site settings
  const { data: settings } = await supabase.from('site_settings').select('*').eq('id', 'current').single();
  
  if (!settings || !settings.hero_content || !settings.hero_content.image_url) {
    console.log('Hero image is missing. Updating site_settings...');
    const defaultHero = {
      title: "Khám phá phong cách của bạn",
      subtitle: "Tìm cửa hàng thời trang phù hợp tại TP. Hồ Chí Minh.",
      eyebrow: "Danh bạ thời trang",
      image_url: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=2000"
    };
    
    await supabase.from('site_settings').upsert({
      id: 'current',
      app_name: '1Fashion',
      hero_content: defaultHero,
      accent_color: '#D4AF37'
    });
    console.log('Updated site_settings with hero image.');
  } else {
    console.log('Hero image already exists.');
  }

  // 2. Check shops
  const { data: shops } = await supabase.from('business_profiles').select('id, slug, business_name').limit(1);
  if (!shops || shops.length === 0) {
    console.log('No shops found. Checking for test user...');
    const { data: { users } } = await supabase.auth.admin.listUsers();
    let testUser = users.find(u => u.email === 'shop@1fashion.vn' || u.email === 'admin@1fashion.vn');
    
    if (!testUser && users.length > 0) {
      testUser = users[0];
    }
    
    if (testUser) {
      console.log('Creating demo shop for user', testUser.email);
      // Create a shop profile
      const shopId = testUser.id;
      await supabase.from('business_profiles').upsert({
        id: shopId,
        slug: 'demo-fashion-shop',
        business_name: 'Demo Fashion Shop',
        category: 'Thời trang nam',
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
      console.log('Demo shop created successfully!');
    } else {
      console.log('No users found to attach the demo shop to. Please create a user first.');
    }
  } else {
    console.log('Shops already exist:', shops);
  }
}

checkAndFix().catch(console.error);
