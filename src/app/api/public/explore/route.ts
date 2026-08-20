import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const supabase = await createClient()

  // 1. Lấy dữ liệu Ưu Đãi
  const { data: offersData, error: offersError } = await supabase
    .from('business_offers')
    .select('id, title, description, image_url, discount_code, valid_until, created_at, status, business_profiles(business_name, logo_url, slug, theme_color)')
    .eq('status', 'active')

  if (offersError) {
    console.error('Lỗi khi tải ưu đãi:', offersError)
  }

  // 2. Lấy dữ liệu Sản Phẩm
  const { data: productsData, error: productsError } = await supabase
    .from('shop_products')
    .select('id, name, description, price, price_original, image_url, category, is_featured, created_at, status, business_profiles(business_name, logo_url, slug, theme_color)')
    .eq('status', 'active')

  if (productsError) {
    console.error('Lỗi khi tải sản phẩm:', productsError)
  }

  // 3. Chuẩn hóa & gộp dữ liệu
  const mixedData: any[] = []

  if (offersData) {
    offersData.forEach((offer) => {
      mixedData.push({
        type: 'offer',
        id: offer.id,
        title: offer.title,
        description: offer.description,
        image_url: offer.image_url,
        discount_code: offer.discount_code,
        valid_until: offer.valid_until,
        created_at: offer.created_at,
        is_featured: false, // Ưu đãi mặc định không có trạng thái nổi bật, nhưng có thể xếp riêng
        category: 'Ưu Đãi',
        business: Array.isArray(offer.business_profiles) ? offer.business_profiles[0] : offer.business_profiles
      })
    })
  }

  if (productsData) {
    productsData.forEach((product) => {
      mixedData.push({
        type: 'product',
        id: product.id,
        title: product.name, // Đồng bộ trường title
        description: product.description,
        price: product.price,
        price_original: product.price_original,
        image_url: product.image_url,
        category: product.category || 'Sản Phẩm',
        is_featured: product.is_featured,
        created_at: product.created_at,
        business: Array.isArray(product.business_profiles) ? product.business_profiles[0] : product.business_profiles
      })
    })
  }

  // 4. Sắp xếp: Nổi bật lên đầu (sản phẩm), sau đó ưu tiên ngày tạo mới nhất
  mixedData.sort((a, b) => {
    // Nếu 1 trong 2 là featured
    if (a.is_featured && !b.is_featured) return -1
    if (!a.is_featured && b.is_featured) return 1
    
    // Nếu cả 2 đều (có hoặc không có) featured, xếp theo thời gian mới nhất
    const timeA = new Date(a.created_at || 0).getTime()
    const timeB = new Date(b.created_at || 0).getTime()
    return timeB - timeA
  })

  return NextResponse.json({ data: mixedData })
}
