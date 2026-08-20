import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const shopsToRemove = [
    "Thời Trang Nhanh | XƯỞNG MAY GIA CÔNG SỐ LƯỢNG ÍT",
    "MRHEO Shop Chuyên Sỉ Lẻ Quần Áo Nam Thiết Kế",
    "Kho Sỉ ANN chuyên sỉ mỹ phẩm & quần áo",
    "Mozaic Space"
];

async function removeShops() {
    for (const shopName of shopsToRemove) {
        console.log(`\n--- Đang xử lý: ${shopName} ---`);
        
        const { data: bp, error: err1 } = await supabase
            .from('business_profiles')
            .select('id, account_id, business_name')
            .eq('business_name', shopName)
            .maybeSingle();
            
        if (err1 || !bp) {
            console.error('Không tìm thấy shop trong database:', shopName);
            continue;
        }
        
        console.log(`Tìm thấy (ID: ${bp.id})`);
        
        // 2. Xóa landing_pages
        await supabase.from('landing_pages').delete().eq('business_id', bp.id);
        console.log('- Đã xóa landing_pages');
        
        // 3. Xóa business_locations
        await supabase.from('business_locations').delete().eq('business_id', bp.id);
        console.log('- Đã xóa business_locations');
        
        // 4. Xóa business_profiles
        await supabase.from('business_profiles').delete().eq('id', bp.id);
        console.log('- Đã xóa business_profiles');
        
        // 5. Xóa profile & auth user
        if (bp.account_id) {
            await supabase.from('profiles').delete().eq('id', bp.account_id);
            console.log('- Đã xóa profiles');
            
            await supabase.auth.admin.deleteUser(bp.account_id);
            console.log('- Đã xóa auth.users');
        }
        
        console.log(`=> Đã xóa hoàn toàn: ${bp.business_name}`);
    }
}

removeShops();
