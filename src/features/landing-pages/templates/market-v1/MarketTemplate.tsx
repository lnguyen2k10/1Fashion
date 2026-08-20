import React from 'react'
import { MessageCircle } from 'lucide-react'
import { ShopHeader } from './sections/ShopHeader'
import { HeroSlider } from './sections/HeroSlider'
import { ShopIntro } from './sections/ShopIntro'
import { ProductGrid } from './sections/ProductGrid'
import { OffersSection } from './sections/OffersSection'
import { GallerySection } from './sections/GallerySection'
import { ContactSection } from './sections/ContactSection'
import type { LandingPageData, ProductItem, OperatingHoursEntry } from '@/types/landing-page'
import { DEFAULT_THEME_COLOR } from '@/lib/constants'

interface BusinessInfo {
  id?: string
  name: string
  category: string
  district?: string
  city?: string
  zalo?: string
  hotline?: string
  slug?: string
  logo_url?: string
  email_owner?: string
  is_verified?: boolean
  lat?: number | null
  lng?: number | null
  address_full?: string
}

interface MarketTemplateProps {
  data: LandingPageData
  businessInfo: BusinessInfo
  isEditing?: boolean
  onUpdate?: (path: string, value: any) => void
  onImagePick?: (path: string, currentUrl: string) => void
  serverProducts?: ProductItem[]
  serverOffers?: any[]
  serverOperatingHours?: OperatingHoursEntry[]
  defaults?: {
    heroTitle?: string
    heroSubtitle?: string
    themeColor?: string
  }
}

export function MarketTemplate({
  data,
  businessInfo,
  isEditing = false,
  onUpdate,
  onImagePick,
  serverProducts = [],
  serverOffers = [],
  serverOperatingHours = [],
  defaults
}: MarketTemplateProps) {
  const themeColor = data?.theme_color || businessInfo ? (defaults?.themeColor || DEFAULT_THEME_COLOR) : DEFAULT_THEME_COLOR

  const heroSlides = data?.hero_section?.hero_slides && data.hero_section.hero_slides.length > 0
    ? data.hero_section.hero_slides
    : []

  // Products: ưu tiên serverProducts từ DB, fallback sang content_json.services_menu
  const products: ProductItem[] = serverProducts.length > 0
    ? serverProducts
    : (data?.services_menu || [])

  // Gallery items (handle both array format and legacy object format from import script)
  const rawGallery = data?.gallery
  const galleryItems = Array.isArray(rawGallery) 
    ? rawGallery 
    : (rawGallery && typeof rawGallery === 'object' && Array.isArray((rawGallery as any).images))
      ? (rawGallery as any).images
      : []

  // Contact info merged với businessInfo
  const contactInfo = {
    ...(data?.contact_info || {}),
    hotline: data?.contact_info?.hotline || businessInfo.hotline || '',
    address_full: data?.contact_info?.address_full || businessInfo.address_full || '',
    zalo: data?.contact_info?.zalo || businessInfo.zalo || '',
  }
  const zaloNumber = contactInfo.zalo.replace(/[^0-9]/g, '')
  const zaloHref = zaloNumber ? `https://zalo.me/${zaloNumber}` : null
  const trackZaloClick = () => {
    if (!businessInfo.id || !businessInfo.slug) return
    void fetch('/api/analytics', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ businessId: businessInfo.id, eventType: 'zalo_click', pageSlug: businessInfo.slug }), keepalive: true })
  }

  // Lat/lng: ưu tiên từ businessInfo (business_locations table)
  const lat = businessInfo.lat || null
  const lng = businessInfo.lng || null

  return (
    <div className="min-h-screen bg-white font-sans" style={{ '--theme-color': themeColor } as React.CSSProperties}>

      <ShopHeader
        businessName={businessInfo.name}
        logoUrl={businessInfo.logo_url}
        themeColor={themeColor}
      />

      {/* 1. HERO SLIDER */}
      <HeroSlider
        slides={heroSlides}
        isEditing={isEditing}
        onPickImage={onImagePick}
        themeColor={themeColor}
      />

      {/* 2. SHOP INTRO: Logo, Tên, Danh mục, Mô tả */}
      <ShopIntro
        businessName={businessInfo.name}
        category={businessInfo.category}
        district={businessInfo.district}
        city={businessInfo.city}
        logoUrl={(data as any)?.logo_url || businessInfo.logo_url}
        isVerified={businessInfo.is_verified}
        onImagePick={onImagePick}
        themeColor={themeColor}
        introText={data?.about_us?.intro_text}
        isEditing={isEditing}
        onUpdate={onUpdate}
        contactInfo={contactInfo}
      />

      {/* 3. PRODUCT GRID (Sản phẩm nổi bật) */}
      <ProductGrid
        businessId={businessInfo.id}
        businessSlug={businessInfo.slug}
        products={products}
        sectionTitle={data?.services_section?.title}
        sectionSubtitle={data?.services_section?.subtitle}
        themeColor={themeColor}
        isEditing={isEditing}
        onUpdate={onUpdate}
        onImagePick={onImagePick}
      />

      {/* 4. OFFERS SECTION (Ưu đãi) */}
      <OffersSection
        businessId={businessInfo.id}
        offers={serverOffers}
        sectionTitle={data?.offers_list?.title}
        themeColor={themeColor}
        isEditing={isEditing}
      />

      {/* 5. GALLERY / LOOKBOOK */}
      <GallerySection
        items={galleryItems}
        sectionTitle={data?.gallery_section?.title}
        themeColor={themeColor}
        isEditing={isEditing}
        onPickImage={onImagePick}
      />

      {/* 6. CTA BANNER */}
      {data?.cta_banner?.title && (
        <section className="py-20 px-4 text-center" style={{ background: `linear-gradient(135deg, #0F0F0F, #1A1A1A)` }}>
          <div className="max-w-2xl mx-auto">
            <span className="block text-[10px] font-mono tracking-[0.4em] uppercase mb-4" style={{ color: themeColor }}>
              — Kết Nối Với Chúng Tôi
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{data.cta_banner.title}</h2>
            {data.cta_banner.subtitle && (
              <p className="text-white/60 mb-8 text-lg">{data.cta_banner.subtitle}</p>
            )}
            {data.cta_banner.cta_label && (
              <a
                href={zaloHref || (data.cta_banner.cta_phone ? `tel:${data.cta_banner.cta_phone}` : '#contact')}
                target={zaloHref ? '_blank' : undefined}
                rel={zaloHref ? 'noopener noreferrer' : undefined}
                onClick={zaloHref ? trackZaloClick : undefined}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-bold text-[#1A1A1A] hover:brightness-110 active:scale-95 transition-all shadow-lg text-sm"
                style={{ background: `linear-gradient(135deg, ${themeColor}, ${themeColor}CC)` }}
              >
                {data.cta_banner.cta_label}
              </a>
            )}
          </div>
        </section>
      )}

      {/* 7. CONTACT + MAP */}
      <ContactSection
        info={contactInfo}
        lat={lat}
        lng={lng}
        businessId={businessInfo.id}
        operatingHours={serverOperatingHours}
        themeColor={themeColor}
        isEditing={isEditing}
        onUpdate={onUpdate}
      />

      {!isEditing && zaloHref && <a href={zaloHref} target="_blank" rel="noopener noreferrer" onClick={trackZaloClick} aria-label="Chat với shop qua Zalo" className="fixed bottom-5 left-4 z-40 inline-flex min-h-13 items-center gap-2 rounded-full bg-[#0068FF] px-5 py-3 text-sm font-bold text-white shadow-[0_12px_30px_rgba(0,104,255,0.35)] transition hover:brightness-110 active:scale-95 sm:bottom-7 sm:left-7"><MessageCircle size={19} fill="currentColor" /> Chat Zalo</a>}
    </div>
  )
}
