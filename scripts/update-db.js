require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const iconMap = {
  'Hàng Hiệu': 'Gem',
  'Đồng Hồ': 'Watch',
  'Mắt Kính': 'Glasses',
  'Thời Trang': 'Shirt',
  'Phụ Kiện': 'ShoppingBag',
  'Giày Dép': 'Footprints',
  'Streetwear': 'Flame',
  'Trẻ Em': 'Baby'
};

async function updateDb() {
  console.log('--- Updating categories ---');
  const { data: cats, error: fetchErr } = await supabase.from('site_categories').select('*');
  if (fetchErr) {
    console.error('Fetch error:', fetchErr);
    return;
  }
  
  for (const cat of cats) {
    if (iconMap[cat.name]) {
      const { error: updateErr } = await supabase
        .from('site_categories')
        .update({ icon: iconMap[cat.name] })
        .eq('id', cat.id);
      
      if (updateErr) console.error('Failed to update', cat.name, updateErr);
      else console.log('Updated', cat.name, 'to', iconMap[cat.name]);
    }
  }

  console.log('--- Seeding offers ---');
  // Find a valid business_id
  const { data: profiles, error: profErr } = await supabase
    .from('business_profiles')
    .select('id, business_name')
    .eq('is_verified', true)
    .limit(3);
    
  if (profErr || !profiles || profiles.length === 0) {
    console.log('No verified business found for seeding offers. Searching any business...');
    const { data: anyProfiles } = await supabase.from('business_profiles').select('id').limit(1);
    if (!anyProfiles || anyProfiles.length === 0) {
      console.log('No businesses found at all!');
      return;
    }
    profiles.push(anyProfiles[0]);
  }

  const businessId = profiles[0].id;
  const businessId2 = profiles[1] ? profiles[1].id : businessId;
  const businessId3 = profiles[2] ? profiles[2].id : businessId;

  // Cleanup old mock offers
  await supabase.from('business_offers').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  const offers = [
    {
      business_id: businessId,
      title: 'Giảm 50% Toàn Bộ Giày Sneaker',
      description: 'Chương trình xả kho lớn nhất năm. Áp dụng cho mọi dòng Sneaker tại cửa hàng.',
      image_url: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=800',
      discount_code: 'SNEAKER50',
      status: 'active',
      valid_until: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      business_id: businessId2,
      title: 'Đồng Giá 199K Áo Thun Cổ Tròn',
      description: 'Cơ hội mua sắm thả ga không lo về giá. Cotton 100% thoáng mát.',
      image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=800',
      discount_code: 'TTEES199',
      status: 'active',
      valid_until: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      business_id: businessId3,
      title: 'Mua 1 Tặng 1 Phụ Kiện Kính Mát',
      description: 'Chào hè rực rỡ, bảo vệ đôi mắt với bộ sưu tập kính râm chống tia UV cao cấp.',
      image_url: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=800',
      discount_code: 'SUNNYBAG',
      status: 'active',
      valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    }
  ];

  const { error: insertErr } = await supabase.from('business_offers').insert(offers);
  if (insertErr) {
    console.error('Error inserting offers:', insertErr);
  } else {
    console.log('Seeded 3 offers successfully.');
  }
}

updateDb();
