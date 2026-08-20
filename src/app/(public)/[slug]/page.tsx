import React from 'react'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LandingPageWrapper from '@/features/landing-pages/templates/LandingPageWrapper'
import { ClaimBanner } from '@/components/ui/ClaimBanner'

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ edit?: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()
  const { data: business } = await supabase
    .from('active_landing_pages')
    .select('business_name, category, location_district, logo_url')
    .eq('business_slug', slug)
    .maybeSingle()

  if (!business) return { title: 'Không tìm thấy trang | 1Fashion.asia' }
  return {
    title: `${business.business_name} | 1Fashion.asia`,
    description: `Khám phá các sản phẩm và dịch vụ từ ${business.business_name} trên 1Fashion.asia`,
    openGraph: {
      title: `${business.business_name} | 1Fashion.asia`,
      description: `Khám phá các sản phẩm và dịch vụ từ ${business.business_name}`,
      images: [business.logo_url || ''],
      siteName: '1Fashion.asia',
      locale: 'vi_VN',
      type: 'website',
    },
  }
}

export default async function BusinessLandingPage({ params, searchParams }: PageProps) {
  const { slug } = await params
  const { edit } = await searchParams
  const isEditMode = edit === 'true'
  const supabase = await createClient()

  let business: Record<string, unknown> | null = null
  let isSuperAdmin = false

  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
    if (profile?.role === 'super_admin') {
      isSuperAdmin = true
    }
  }

  if (isEditMode) {
    if (!user) return notFound()

    const { data: profile } = await supabase
      .from('business_profiles')
      .select('*')
      .eq('slug', slug)
      .maybeSingle()
      
    if (!profile) return notFound()
    
    if (profile.account_id !== user.id && !isSuperAdmin) {
      return notFound()
    }

    const { data: landingPage } = await supabase
      .from('landing_pages')
      .select('*')
      .eq('business_id', profile.id)
      .maybeSingle()
    if (!landingPage) return notFound()

    business = {
      business_id: profile.id,
      landing_page_id: landingPage.id,
      business_name: profile.business_name,
      business_slug: profile.slug,
      category: profile.category,
      theme_color: profile.theme_color,
      zalo_phone: profile.zalo_phone,
      hotline: profile.hotline,
      logo_url: profile.logo_url,
      location_city: profile.location_city,
      location_district: profile.location_district,
      social_links: profile.social_links,
      is_verified: profile.is_verified,
      content_json: landingPage.draft_json || landingPage.content_json,
    }
  } else {
    const { data } = await supabase
      .from('active_landing_pages')
      .select('*')
      .eq('business_slug', slug)
      .maybeSingle()
    business = data
  }

  if (!business) return notFound()
  const businessId = business.business_id as string

  const [{ data: serverOffers }, { data: serverProducts }, { data: serverOperatingHours }] = await Promise.all([
    supabase.from('business_offers').select('id, title, description, image_url, discount_code, valid_until, status').eq('business_id', businessId).eq('status', 'active').order('created_at', { ascending: false }).limit(6),
    supabase.from('shop_products').select('*').eq('business_id', businessId).eq('status', 'active').order('sort_order', { ascending: true }).order('created_at', { ascending: false }).limit(20),
    supabase.from('operating_hours').select('*').eq('business_id', businessId).order('day_of_week', { ascending: true }),
  ])

  return (
    <div className="min-h-screen bg-background">
      <LandingPageWrapper
        business={business}
        isEditMode={isEditMode}
        serverOffers={serverOffers || []}
        serverProducts={serverProducts || []}
        serverOperatingHours={serverOperatingHours || []}
      />
      {!isEditMode && business.is_claimed !== true && (
        <ClaimBanner shopSlug={business.business_slug as string} />
      )}
      {isSuperAdmin && !isEditMode && (
        <a 
          href={`/${slug}?edit=true`} 
          className="fixed bottom-6 right-6 z-[9999] bg-black text-[#D4AF37] px-6 py-3 rounded-full shadow-2xl font-bold flex items-center gap-2 border-2 border-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
          Sửa (Admin)
        </a>
      )}
    </div>
  )
}
