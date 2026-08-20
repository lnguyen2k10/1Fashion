require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const corrections = {
  "Chung toi mang den san pham chat luong nhat.": "Chúng tôi mang đến sản phẩm chất lượng nhất.",
  "Shop thoi trang chinh hang, chat luong cao": "Shop thời trang chính hãng, chất lượng cao",
  "Luxury Bags - Dang Cap": "Luxury Bags - Đẳng Cấp",
  "SneakerVille - De Vuong Giay": "SneakerVille - Đế Vương Giày",
  "Urban Street - Chat Duong Pho": "Urban Street - Chất Đường Phố",
  "Kids Fashion - Yeu Thuong Tung Bo Do": "Kids Fashion - Yêu Thương Từng Bộ Đồ",
  "Royal Watch - Thoi Gian La Dang Cap": "Royal Watch - Thời Gian Là Đẳng Cấp",
  "Phong Cach Cua Ban": "Phong Cách Của Bạn"
};

async function fixText() {
  const { data: pages } = await supabase.from('landing_pages').select('id, content_json');
  
  for (const page of pages) {
    let content = JSON.stringify(page.content_json);
    let modified = false;
    
    for (const [bad, good] of Object.entries(corrections)) {
      if (content.includes(bad)) {
        content = content.replace(new RegExp(bad, 'g'), good);
        modified = true;
      }
    }

    if (modified) {
      await supabase
        .from('landing_pages')
        .update({ content_json: JSON.parse(content) })
        .eq('id', page.id);
      console.log('Fixed page:', page.id);
    }
  }

  // Also fix active_landing_pages view if it's materialized or if we need to update profiles
  console.log('Done fixing landing pages');
}

fixText();
