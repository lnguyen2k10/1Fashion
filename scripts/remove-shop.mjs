import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function removeShop(slug) {
    console.log(`Bắt đầu xóa shop có slug: ${slug}`);
    
    // 1. Tìm business profile
    const { data: bp, error: err1 } = await supabase
        .from('business_profiles')
        .select('id, account_id, business_name')
        .eq('slug', slug)
        .single();
        
    if (err1 || !bp) {
        console.error('Không tìm thấy business_profile với slug này:', slug);
        return;
    }
    
    console.log(`Đã tìm thấy shop: ${bp.business_name} (ID: ${bp.id})`);
    
    // 2. Xóa landing_pages
    const { error: err2 } = await supabase.from('landing_pages').delete().eq('business_id', bp.id);
    if (err2) console.error('Lỗi xóa landing_pages:', err2);
    else console.log('- Đã xóa landing_pages');
    
    // 3. Xóa business_locations
    const { error: err3 } = await supabase.from('business_locations').delete().eq('business_id', bp.id);
    if (err3) console.error('Lỗi xóa business_locations:', err3);
    else console.log('- Đã xóa business_locations');
    
    // 4. Xóa business_profiles
    const { error: err4 } = await supabase.from('business_profiles').delete().eq('id', bp.id);
    if (err4) console.error('Lỗi xóa business_profiles:', err4);
    else console.log('- Đã xóa business_profiles');
    
    // 5. Xóa profile & auth user
    if (bp.account_id) {
        const { error: err5 } = await supabase.from('profiles').delete().eq('id', bp.account_id);
        if (err5) console.error('Lỗi xóa profiles:', err5);
        else console.log('- Đã xóa profiles');
        
        const { error: err6 } = await supabase.auth.admin.deleteUser(bp.account_id);
        if (err6) console.error('Lỗi xóa auth user:', err6);
        else console.log('- Đã xóa auth.users');
    }
    
    console.log(`Hoàn tất xóa shop: ${bp.business_name}`);
}

const targetSlug = process.argv[2];
if (!targetSlug) {
    console.log('Vui lòng truyền vào slug của shop. VD: node scripts/remove-shop.mjs slug-cua-shop');
} else {
    removeShop(targetSlug);
}
