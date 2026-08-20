import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { ExploreClient, ExploreItem } from './ExploreClient'

export const metadata = {
  title: 'Ưu Đãi & Sản Phẩm | 1Fashion.asia',
  description: 'Tổng hợp các chương trình khuyến mãi, voucher và sản phẩm nổi bật nhất từ các đối tác thời trang, giày dép cao cấp trên toàn quốc.',
}

export default async function OffersPage() {
  const supabase = await createClient()

  // 1. Lấy dữ liệu Ưu Đãi
  const { data: offersData } = await supabase
    .from('business_offers')
    .select('id, title, description, image_url, discount_code, valid_until, created_at, status, business_profiles(business_name, logo_url, slug, theme_color)')
    .eq('status', 'active')
    .limit(200)

  // 2. Lấy dữ liệu Sản Phẩm
  const { data: productsData } = await supabase
    .from('shop_products')
    .select('id, name, description, price, price_original, image_url, category, is_featured, created_at, status, business_profiles(business_name, logo_url, slug, theme_color)')
    .eq('status', 'active')
    .limit(200)

  // 3. Lấy dữ liệu Danh mục Sản phẩm chuẩn
  const { data: categoriesData } = await supabase
    .from('product_categories')
    .select('id, name')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  // 3. Chuẩn hóa & gộp dữ liệu
  const mixedData: ExploreItem[] = []

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
        is_featured: false,
        category: 'Ưu Đãi',
        business: Array.isArray(offer.business_profiles) ? offer.business_profiles[0] : offer.business_profiles
      } as ExploreItem)
    })
  }

  if (productsData) {
    productsData.forEach((product) => {
      mixedData.push({
        type: 'product',
        id: product.id,
        title: product.name,
        description: product.description,
        price: product.price,
        price_original: product.price_original,
        image_url: product.image_url,
        category: product.category || 'Sản Phẩm',
        is_featured: product.is_featured,
        created_at: product.created_at,
        business: Array.isArray(product.business_profiles) ? product.business_profiles[0] : product.business_profiles
      } as ExploreItem)
    })
  }

  // 4. Sắp xếp: Nổi bật lên đầu (sản phẩm), sau đó ưu tiên ngày tạo mới nhất
  mixedData.sort((a, b) => {
    if (a.is_featured && !b.is_featured) return -1
    if (!a.is_featured && b.is_featured) return 1
    const timeA = new Date(a.created_at || 0).getTime()
    const timeB = new Date(b.created_at || 0).getTime()
    return timeB - timeA
  })

  return (
    <div className="flex flex-col min-h-screen bg-[#FDFBF7]">
      <main className="flex-grow pb-16 pt-24 sm:pb-24 sm:pt-32">
        <div className="mx-auto max-w-7xl space-y-10 px-4 sm:space-y-16 sm:px-6">
          
          {/* Header Section */}
          <div className="text-center max-w-3xl mx-auto">
            <span className="mb-4 block text-xs font-bold uppercase tracking-[0.25em] text-[#D4AF37] animate-fade-in-up sm:mb-6 sm:tracking-[0.4em]">
              Khám Phá Toàn Diện
            </span>
            <h1 className="font-playfair mb-5 text-4xl font-bold leading-tight text-[#2F2F2F] animate-fade-in-up animation-delay-100 sm:mb-8 sm:text-5xl md:text-7xl">
              Ưu Đãi & <span className="text-[#D4AF37]">Sản Phẩm.</span>
            </h1>
            <p className="text-base font-medium leading-relaxed text-[#2F2F2F]/60 animate-fade-in-up animation-delay-200 md:text-xl">
              Tận hưởng mã giảm giá và khám phá các sản phẩm nổi bật nhất từ các cửa hàng trên 1Fashion.asia.
            </p>
          </div>

          <ExploreClient initialData={mixedData} serverCategories={categoriesData || []} />
        </div>
      </main>
      
    </div>
  )
}
