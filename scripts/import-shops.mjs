import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Papa from 'papaparse';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

function slugify(text) {
  return text.toString().toLowerCase()
    .replace(/đ/g, 'd')
    .normalize('NFD') // separate accent from letter
    .replace(/[\u0300-\u036f]/g, '') // remove all separated accents
    .replace(/\s+/g, '-') // replace spaces with -
    .replace(/[^\w\-]+/g, '') // remove all non-word chars
    .replace(/\-\-+/g, '-') // replace multiple - with single -
    .replace(/^-+/, '') // trim - from start of text
    .replace(/-+$/, ''); // trim - from end of text
}

function mapCategory(category) {
  const cat = (category || '').toLowerCase();
  if (cat.includes('trẻ em')) return 'kids';
  if (cat.includes('giày') || cat.includes('dép')) return 'shoes';
  if (cat.includes('túi') || cat.includes('ví')) return 'accessories';
  if (cat.includes('streetwear') || cat.includes('đường phố')) return 'streetwear';
  if (cat.includes('đồng hồ')) return 'watches';
  if (cat.includes('kính')) return 'eyewear';
  if (cat.includes('trang sức') || cat.includes('hàng hiệu')) return 'luxury';
  
  // Keyword filter for generic fashion
  const fashionKeywords = ['áo', 'quần', 'thời trang', 'đồ', 'mặc', 'boutique', 'váy', 'đầm'];
  if (fashionKeywords.some(kw => cat.includes(kw))) {
      return 'fashion';
  }
  
  // Not a fashion category -> return null to signal exclusion
  return null;
}

async function main() {
  const csvFile = fs.readFileSync(path.resolve(__dirname, '../shop_data.csv'), 'utf8');
  
  Papa.parse(csvFile, {
    header: true,
    skipEmptyLines: true,
    complete: async (results) => {
      const rows = results.data;
      console.log(`Parsed ${rows.length} rows.`);
      
      let successCount = 0;
      let errorCount = 0;

      for (const row of rows) {
        try {
          const rawName = row.business_name;
          if (!rawName) continue;
          
          const slug = slugify(rawName) + '-' + Math.random().toString(36).substring(2, 6);
          const email = `${slug}@1fashion.asia`;
          const password = '1fashion.asia';
          
          console.log(`Processing: ${rawName}`);
          
          let account_id;
          
          // 1. Create or Find Auth User
          const { data: existingUserRes } = await supabase.auth.admin.listUsers();
          // Filter by email instead of name to avoid conflicts if names change
          const matchedUser = existingUserRes?.users?.find(u => u.email === email || u.user_metadata?.full_name === rawName);
          
          if (matchedUser) {
              account_id = matchedUser.id;
          } else {
              const { data: userData, error: userError } = await supabase.auth.admin.createUser({
                email,
                password,
                email_confirm: true,
                user_metadata: {
                  full_name: rawName,
                  avatar_url: row.image_url || ''
                }
              });
              if (userError) {
                  console.error(`User create error: ${userError.message}`);
                  errorCount++;
                  continue;
              }
              account_id = userData.user.id;
              await new Promise(r => setTimeout(r, 500)); // wait for trigger
          }
          
          const trialExpiryDate = new Date();
          trialExpiryDate.setDate(trialExpiryDate.getDate() + 30);

          // Profile check
          const profileData = {
             email: email,
             full_name: rawName,
             avatar_url: row.image_url || '',
             subscription_status: 'trial',
             expiry_date: trialExpiryDate.toISOString()
          };
          const { data: profileCheck } = await supabase.from('profiles').select('id').eq('id', account_id).single();
          if (!profileCheck) {
             await supabase.from('profiles').insert({ id: account_id, ...profileData });
          } else {
             await supabase.from('profiles').update(profileData).eq('id', account_id);
          }
          
          // 2. Create or Update Business Profile
          const cat = mapCategory(row.category);
          if (!cat) {
              console.log(`Skipped (Not Fashion): ${rawName} - [${row.category}]`);
              continue; // Bỏ qua nếu không phải ngành thời trang
          }
          let business_id;
          
          const ratingScore = row.rating ? parseFloat(row.rating) : null;
          
          const businessProfileData = {
              account_id,
              business_name: rawName,
              slug,
              category: cat,
              is_verified: true,
              rating_score: ratingScore,
              social_links: [
                  { platform: 'facebook', url: '' },
                  { platform: 'instagram', url: '' },
                  { platform: 'tiktok', url: '' },
                  { platform: 'youtube', url: '' },
                  { platform: 'zalo', url: '' },
                  { platform: 'website', url: row.website || '' }
              ]
          };

          const { data: existingBusiness } = await supabase.from('business_profiles').select('id').eq('business_name', rawName).maybeSingle();
          
          if (existingBusiness) {
              business_id = existingBusiness.id;
              // Remove slug from update to prevent changing URL for existing
              const { slug: _, ...updateData } = businessProfileData;
              await supabase.from('business_profiles').update(updateData).eq('id', business_id);
          } else {
              const { data: newBusiness, error: bErr } = await supabase.from('business_profiles').insert(businessProfileData).select('id').single();
              if (bErr) {
                  console.error(`Business insert error:`, bErr);
                  errorCount++;
                  continue;
              }
              business_id = newBusiness.id;
          }
          
          // 3. Create or Update Business Location
          if (row.address) {
            const { data: locs } = await supabase.from('business_locations').select('id').eq('business_id', business_id);
            if (!locs || locs.length === 0) {
                await supabase.from('business_locations').insert({
                  business_id,
                  address_line1: row.address,
                  city: row.city || 'Hồ Chí Minh',
                  is_primary: true
                });
            } else {
                await supabase.from('business_locations').update({
                  address_line1: row.address,
                  city: row.city || 'Hồ Chí Minh'
                }).eq('id', locs[0].id);
            }
          }
          
          // 4. Create or Update Landing Page JSON
          let heroSlides = [];
          if (row.image_url) {
            heroSlides.push({ image_url: row.image_url, link: "" });
          }
          
          let galleryImages = [];
          if (row.image_urls) {
            const urls = row.image_urls.split(' | ');
            galleryImages = urls.map(u => ({ url: u.trim(), caption: "" }));
          }
          
          const ratingCount = row.reviews_count ? parseInt(row.reviews_count) : null;
          
          const contentJson = {
            contact_info: {
              address_full: row.address || '',
              hotline: row.phone || '',
              website: row.website || '',
              google_maps_url: row.google_maps_url || '',
              place_id: row.place_id || '',
              social_links: businessProfileData.social_links // Keep in sync
            },
            hero_section: {
              hero_slides: heroSlides
            },
            gallery: galleryImages,
            gallery_section: {
              title: "Lookbook & Ảnh Sản Phẩm"
            },
            social_trust: {
                rating_count: ratingCount,
                rating_score: ratingScore
            },
            metadata: {
                priority: row.priority || '',
                selection_rank: row.selection_rank || '',
                prospect_score: row.prospect_score || '',
                neighborhood: row.neighborhood || '',
                claim_this_business: row.claim_this_business || '',
                search_string: row.search_string || '',
                google_rank: row.google_rank || '',
                scraped_at: row.scraped_at || ''
            }
          };
          
          const { data: existingLp } = await supabase.from('landing_pages').select('id, content_json').eq('business_id', business_id).eq('template_id', 'market-v1').maybeSingle();
          
          if (existingLp) {
              // Here we upsert safely without deleting other properties if they exist
              const newContent = { ...existingLp.content_json, ...contentJson };
              await supabase.from('landing_pages').update({
                  content_json: newContent,
                  draft_json: newContent
              }).eq('id', existingLp.id);
          } else {
              const { error: landingError } = await supabase
                .from('landing_pages')
                .insert({
                  business_id,
                  template_id: 'market-v1',
                  content_json: contentJson,
                  draft_json: contentJson,
                  is_published: true,
                  status: 'Published'
                });
                
              if (landingError) {
                console.error(`Landing insert error:`, landingError);
                errorCount++;
                continue;
              }
          }
          
          successCount++;
        } catch (err) {
          console.error(`Unhandled error on row:`, err);
          errorCount++;
        }
      }
      
      console.log(`\nDONE. Success: ${successCount}. Errors: ${errorCount}.`);
    }
  });
}

main();
