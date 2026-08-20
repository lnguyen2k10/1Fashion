import { createClient } from '@/lib/supabase/server'
import { extractIdFromSlug } from '@/lib/utils/slugify'
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, ShoppingBag, Store, MapPin, CheckCircle } from 'lucide-react'
import { ProductGallery } from './ProductGallery'

export async function generateMetadata(props: { params: Promise<{ slug: string, productSlug: string }> }): Promise<Metadata> {
  const params = await props.params;
  const id = extractIdFromSlug(params.productSlug)
  if (!id) return {}

  const supabase = await createClient()
  
  const { data: products } = await supabase
    .from('shop_products')
    .select('name, description, image_url, business_profiles(business_name, slug)')
    .eq('id', id)
    .limit(1)

  if (!products || products.length === 0) return {}
  const product = products[0]
  const shopName = (product.business_profiles as any)?.business_name || '1Fashion.asia'

  return {
    title: `${product.name} | ${shopName}`,
    description: product.description || `Mua ${product.name} chính hãng tại ${shopName} trên 1Fashion.asia`,
    openGraph: {
      title: product.name,
      description: product.description || `Mua ${product.name} tại ${shopName}`,
      images: product.image_url ? [product.image_url] : [],
      type: 'website'
    }
  }
}

export default async function ProductPage(props: { params: Promise<{ slug: string, productSlug: string }> }) {
  const params = await props.params;
  const id = extractIdFromSlug(params.productSlug)
  if (!id) notFound()

  const supabase = await createClient()
  
  const { data: products } = await supabase
    .from('shop_products')
    .select(`
      *,
      business_profiles!inner (
        id, business_name, slug, theme_color, is_verified, 
        location_district, location_city, logo_url
      )
    `)
    .eq('id', id)
    .eq('business_profiles.slug', params.slug)
    .limit(1)

  if (!products || products.length === 0) {
    notFound()
  }

  const product = products[0]
  const shop = product.business_profiles as any
  const themeColor = shop.theme_color || '#D4AF37'

  // Structured Data (JSON-LD) for Google
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: product.image_url ? [product.image_url] : [],
    description: product.description || product.name,
    offers: {
      '@type': 'Offer',
      price: product.price ? product.price.replace(/\D/g, '') : '0', // Extract numbers only if possible
      priceCurrency: 'VND',
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: shop.business_name
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link 
            href={`/${shop.slug}`} 
            className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors font-medium text-sm"
          >
            <ChevronLeft size={18} />
            Quay lại cửa hàng
          </Link>
          <div className="flex items-center gap-2">
            <span className="font-bold text-lg hidden sm:block" style={{ color: themeColor }}>
              {shop.business_name}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 md:py-10">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col md:flex-row">
          
          {/* Left: Gallery */}
          <div className="md:w-1/2 p-4 md:p-6 bg-gray-50/50">
            <ProductGallery 
              mainImage={product.image_url} 
              galleryImages={product.image_gallery} 
              productName={product.name}
              themeColor={themeColor}
            />
          </div>

          {/* Right: Info */}
          <div className="md:w-1/2 p-6 md:p-10 flex flex-col">
            <div className="mb-6">
              {product.category && (
                <span 
                  className="text-[10px] uppercase tracking-widest font-bold mb-3 inline-block px-3 py-1 rounded-full" 
                  style={{ backgroundColor: `${themeColor}15`, color: themeColor }}
                >
                  {product.category}
                </span>
              )}
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-4">
                {product.name}
              </h1>
              
              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-3xl font-bold" style={{ color: themeColor }}>
                  {product.price}
                </span>
                {product.price_original && (
                  <span className="text-gray-400 line-through text-lg">
                    {product.price_original}
                  </span>
                )}
              </div>
            </div>

            <div className="flex-1">
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-4">Thông tin chi tiết</h3>
              <div className="prose prose-sm max-w-none text-gray-600 whitespace-pre-line leading-relaxed">
                {product.description || 'Sản phẩm này chưa có mô tả chi tiết.'}
              </div>
            </div>

            {/* Shop Info Card */}
            <div className="mt-10 p-5 rounded-2xl border border-gray-100 bg-gray-50/50 flex items-center gap-4">
              {shop.logo_url ? (
                <Image src={shop.logo_url} alt={shop.business_name} width={56} height={56} className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-sm" />
              ) : (
                <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold text-white shadow-sm" style={{ backgroundColor: themeColor }}>
                  {shop.business_name.charAt(0)}
                </div>
              )}
              <div className="flex-1">
                <h4 className="font-bold text-gray-900 flex items-center gap-1.5">
                  {shop.business_name}
                  {shop.is_verified && <CheckCircle size={14} className="text-amber-500" />}
                </h4>
                <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                  <MapPin size={12} />
                  {shop.location_district}, {shop.location_city}
                </div>
              </div>
              <Link href={`/${shop.slug}`} className="px-4 py-2 bg-white rounded-lg text-sm font-bold border border-gray-200 hover:border-gray-300 transition-colors">
                Xem Shop
              </Link>
            </div>

            {/* CTA */}
            <div className="mt-8 pt-8 border-t border-gray-100 flex gap-4">
              <Link
                href={`/${shop.slug}#contact`}
                className="flex-1 py-4 rounded-xl flex items-center justify-center gap-2 text-white font-bold uppercase tracking-wide transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                style={{ background: `linear-gradient(135deg, ${themeColor}, #B8860B)` }}
              >
                <ShoppingBag size={18} />
                Liên Hệ Mua Ngay
              </Link>
            </div>
            
          </div>
        </div>
      </main>
    </div>
  )
}
