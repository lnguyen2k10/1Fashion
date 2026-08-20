import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  console.log('--- Bắt đầu sửa dữ liệu import ---');

  // 1. Cập nhật logo_url cho business_profiles
  console.log('1. Đang cập nhật logo_url từ avatar_url...');
  const { data: profiles, error: profileErr } = await supabase
    .from('profiles')
    .select('id, avatar_url')
    .not('avatar_url', 'is', null)
    .neq('avatar_url', '');

  if (profileErr) {
    console.error('Lỗi khi lấy profiles:', profileErr);
    return;
  }

  let logoUpdated = 0;
  for (const profile of profiles) {
    const { error: bpErr } = await supabase
      .from('business_profiles')
      .update({ logo_url: profile.avatar_url })
      .eq('account_id', profile.id)
      .is('logo_url', null); // Chỉ cập nhật nếu logo_url đang trống

    if (!bpErr) {
      logoUpdated++;
    }
  }
  console.log(`=> Đã cập nhật logo cho ${logoUpdated} shop.`);

  // 2. Cập nhật JSON cấu trúc của landing_pages
  console.log('2. Đang chuẩn hóa content_json cho landing_pages...');
  const { data: pages, error: pageErr } = await supabase
    .from('landing_pages')
    .select('id, content_json')
    .eq('template_id', 'market-v1');

  if (pageErr) {
    console.error('Lỗi khi lấy landing pages:', pageErr);
    return;
  }

  let jsonUpdated = 0;
  for (const page of pages) {
    let content = page.content_json;
    if (!content) continue;
    
    let needsUpdate = false;

    // Sửa hero_slides bị đặt ngoài cùng
    if (content.hero_slides && !content.hero_section) {
      content.hero_section = {
        hero_slides: content.hero_slides
      };
      delete content.hero_slides;
      needsUpdate = true;
    }

    // Sửa gallery object thành mảng GalleryItem[]
    if (content.gallery && typeof content.gallery === 'object' && !Array.isArray(content.gallery)) {
      if (Array.isArray(content.gallery.images)) {
        const fixedGallery = content.gallery.images.map(img => ({
          url: img.url || img.image_url || '',
          caption: img.caption || ''
        }));
        
        const galleryTitle = content.gallery.title;
        content.gallery = fixedGallery;
        
        if (galleryTitle) {
          content.gallery_section = { title: galleryTitle };
        }
        needsUpdate = true;
      }
    } else if (Array.isArray(content.gallery)) {
       // Dù là mảng rồi nhưng có thể nó chứa { image_url } thay vì { url }
       let hasMalformedItems = false;
       const fixedGallery = content.gallery.map(item => {
          if (item.image_url && !item.url) {
             hasMalformedItems = true;
             return { url: item.image_url, caption: item.caption || '' };
          }
          return item;
       });
       if (hasMalformedItems) {
          content.gallery = fixedGallery;
          needsUpdate = true;
       }
    }

    if (needsUpdate) {
      const { error: updateErr } = await supabase
        .from('landing_pages')
        .update({ 
          content_json: content,
          draft_json: content // cập nhật luôn draft để khi vào editor không bị sai
        })
        .eq('id', page.id);
        
      if (!updateErr) {
        jsonUpdated++;
      }
    }
  }
  
  console.log(`=> Đã chuẩn hóa JSON cho ${jsonUpdated} landing pages.`);
  console.log('--- Hoàn tất ---');
}

main();
