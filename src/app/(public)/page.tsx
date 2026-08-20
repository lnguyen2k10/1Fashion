import type { CSSProperties } from 'react'
import { Suspense } from 'react'
import { createPublicClient } from '@/lib/supabase/public'
import { HeroSection, type HeroContent } from '@/components/home/HeroSection'

export const revalidate = 60;
import { HomeClientFilter } from '@/components/home/HomeClientFilter'
import { HomeOffersSection } from '@/components/home/HomeOffersSection'
import { BlogRibbon, type HomepagePost } from '@/components/home/BlogRibbon'
import { HomepageFeaturedProducts } from '@/components/home/HomepageFeaturedProducts'
import { DEMO_BUSINESS_IDS } from '@/lib/constants/demo'

const FALLBACK_COVER = 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=800'

type ShopRow = {
  business_slug: string
  business_name: string
  category?: string | null
  location_district?: string | null
  location_city?: string | null
  is_verified?: boolean | null
  logo_url?: string | null
  content_json?: any
}

type SiteSettingsRow = { tagline?: string | null; accent_color?: string | null; hero_content?: HeroContent | null }

function extractCoverImage(item: ShopRow): string {
  const slides = item.content_json?.hero_section?.hero_slides
  if (!slides?.length) return FALLBACK_COVER
  const first = slides[0]
  return typeof first === 'string' ? first || FALLBACK_COVER : first?.image_url || FALLBACK_COVER
}

async function FilterSection() {
  const supabase = createPublicClient()
  // 1. Fetch featured VIP shops
  const featuredResult = await supabase.from('active_homepage_shop_features')
    .select('business_slug, business_name, category, location_district, location_city, is_verified, logo_url, content_json')
    .not('business_id', 'in', `(${DEMO_BUSINESS_IDS.join(',')})`)
    .order('starts_at', { ascending: false })
    .limit(12)
    
  // 2. Fetch a pool of latest active shops
  const recentResult = await supabase.from('active_landing_pages')
    .select('business_slug, business_name, category, location_district, location_city, is_verified, logo_url, content_json, updated_at')
    .not('business_id', 'in', `(${DEMO_BUSINESS_IDS.join(',')})`)
    .order('updated_at', { ascending: false })
    .limit(50)
    
  // 3. Combine and randomize
  const featuredShops = featuredResult.data || []
  let otherShops = (recentResult.data || []).filter(
    shop => !featuredShops.some(f => f.business_slug === shop.business_slug)
  )
  
  // Random shuffle the non-featured latest shops
  otherShops = otherShops.sort(() => 0.5 - Math.random())
  
  const combined = [...featuredShops, ...otherShops].slice(0, 12)
  
  const businesses = combined.map((item) => {
    const json = item.content_json as any
    return {
      slug: item.business_slug || '',
      business_name: item.business_name || '',
      category: item.category || 'Thời trang',
      location_district: json?.contact_info?.address_full || [item.location_district, item.location_city].filter(Boolean).join(', ') || 'TP. Hồ Chí Minh',
      is_verified: Boolean(item.is_verified),
      rating_score: json?.social_trust?.rating_score || 5.0,
      rating_count: json?.social_trust?.rating_count || 0,
      logo_url: item.logo_url || '',
      cover_image: extractCoverImage(item as any),
      services: (json?.services_menu || []).slice(0, 3).map((service: any) => ({ name: service.name || 'Sản phẩm', price: service.price || 'Liên hệ' })),
    }
  })

  return <HomeClientFilter businesses={businesses} />
}

async function OffersSection() {
  const supabase = createPublicClient()
  const offersResult = await supabase.from('business_offers')
    .select('*, business_profiles!inner(business_name, logo_url, slug)')
    .eq('status', 'active')
    .not('business_id', 'in', `(${DEMO_BUSINESS_IDS.join(',')})`)
    .order('created_at', { ascending: false })
    .limit(3)
  
  if (!offersResult.data || offersResult.data.length === 0) return null
  return <HomeOffersSection offers={offersResult.data} />
}

async function FeaturedProductsSection() {
  const supabase = createPublicClient()
  const featuredProductsResult = await supabase.from('active_homepage_product_features')
    .select('id, product_id, name, description, price, image_url, category, business_slug, business_name, expires_at')
    .not('business_id', 'in', `(${DEMO_BUSINESS_IDS.join(',')})`)
    .order('starts_at', { ascending: false })
    .limit(12)
  
  if (!featuredProductsResult.data || featuredProductsResult.data.length === 0) return null
  return <HomepageFeaturedProducts products={featuredProductsResult.data} />
}

async function BlogsSection() {
  const supabase = createPublicClient()
  const postsResult = await supabase.from('blogs').select('id, slug, title, category, content, image_url, created_at').eq('status', 'published').order('created_at', { ascending: false }).limit(3)
  
  if (!postsResult.data || postsResult.data.length === 0) return null
  return <BlogRibbon posts={(postsResult.data || []) as HomepagePost[]} />
}

export default async function Home() {
  const supabase = createPublicClient()
  
  // Fetch settings and count first as they are needed for the Hero section (above the fold)
  const [settingsResult, countResult] = await Promise.all([
    supabase.from('site_settings').select('app_name, tagline, accent_color, logo_url, hero_content').eq('id', 'current').maybeSingle(),
    supabase.from('active_landing_pages').select('id', { count: 'exact', head: true }).not('business_id', 'in', `(${DEMO_BUSINESS_IDS.join(',')})`)
  ])

  const settings = settingsResult.data as SiteSettingsRow | null

  return (
    <main className="min-h-screen bg-gray-50" style={{ '--brand-accent': settings?.accent_color || '#D4AF37' } as CSSProperties}>
      <HeroSection 
        content={(settings?.hero_content || { subtitle: settings?.tagline }) as HeroContent} 
        accentColor={settings?.accent_color} 
        tagline={settings?.tagline} 
        shopCount={countResult.count || 0} 
      />
      
      <Suspense fallback={<div className="h-96 flex items-center justify-center text-zinc-400">Đang tải danh sách cửa hàng...</div>}>
        <FilterSection />
      </Suspense>

      <Suspense fallback={<div className="h-64 flex items-center justify-center text-zinc-400">Đang tải ưu đãi...</div>}>
        <OffersSection />
      </Suspense>

      <Suspense fallback={<div className="h-96 flex items-center justify-center text-zinc-400">Đang tải sản phẩm nổi bật...</div>}>
        <FeaturedProductsSection />
      </Suspense>

      <Suspense fallback={<div className="h-80 flex items-center justify-center text-zinc-400">Đang tải tin tức...</div>}>
        <BlogsSection />
      </Suspense>
      
      
    </main>
  )
}
