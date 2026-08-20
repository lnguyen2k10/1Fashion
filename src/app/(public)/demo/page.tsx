import { Suspense } from 'react'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { BusinessCard } from '@/components/ui/BusinessCard'
import { ExternalLink, Sparkles, Store, Eye } from 'lucide-react'

const DEMO_SLUGS = [
  'trendy-boutique-saigon',
  'luxury-bags-hcm',
  'sneakerville-hanoi',
  'urban-street-style',
  'royal-watch-collection',
  'kids-fashion-paradise',
]

const FALLBACK_COVER = 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&q=80&w=1600'

type Shop = {
  slug: string
  business_name: string
  category: string
  location_district: string
  is_verified: boolean
  logo_url: string
  cover_image: string
}

async function DemoShops() {
  const admin = createAdminClient()
  const { data } = await admin
    .from('directory_shops')
    .select('business_slug, business_name, category, location_district, location_city, is_verified, logo_url, cover_image')
    .in('business_slug', DEMO_SLUGS)

  const shops: Shop[] = (data || []).map((item: any) => ({
    slug: item.business_slug,
    business_name: item.business_name,
    category: item.category || 'Thời trang',
    location_district: [item.location_district, item.location_city].filter(Boolean).join(', ') || 'TP. HCM',
    is_verified: Boolean(item.is_verified),
    logo_url: item.logo_url || '',
    cover_image: item.cover_image || FALLBACK_COVER,
  }))

  if (!shops.length) {
    return (
      <p className="py-16 text-center text-zinc-400">Chưa có shop demo. Vui lòng liên hệ quản trị viên.</p>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {shops.map((shop) => (
        <div key={shop.slug} className="group relative">
          <BusinessCard {...shop} isFeatured={shop.is_verified} rating_score={4.9} />
          {/* Demo badge overlay */}
          <div className="pointer-events-none absolute left-4 top-4 z-10 flex items-center gap-1.5 rounded-full bg-amber-400/90 px-3 py-1 text-xs font-bold text-amber-900 shadow-sm backdrop-blur-sm">
            <Sparkles size={11} />
            DEMO
          </div>
        </div>
      ))}
    </div>
  )
}

export const metadata = {
  title: 'Demo — Xem trước Landing Page Thời Trang | 1Fashion',
  description: 'Khám phá các mẫu trang Landing Page chuẩn của 1Fashion. Đây là các shop demo để bạn hình dung đầy đủ tính năng trước khi đăng ký.',
  robots: 'noindex, nofollow',
}

export default function DemoPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-zinc-50 to-white pb-0 pt-24 sm:pt-32">
      {/* Hero banner */}
      <section className="mx-auto max-w-4xl px-6 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-xs font-semibold text-amber-700">
          <Sparkles size={13} />
          Trang Demo — Chỉ dùng để tham khảo
        </div>
        <h1 className="mt-5 text-4xl font-black tracking-tight text-zinc-900 sm:text-5xl md:text-6xl">
          Xem Landing Page <span className="text-[#D4AF37]">Thật Trông Như Thế Nào</span>
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-zinc-500 sm:text-lg">
          Dưới đây là 6 mẫu cửa hàng demo được chúng tôi xây dựng để bạn hình dung đầy đủ. Mỗi shop thật sẽ có đầy đủ hình ảnh, sản phẩm, thông tin liên hệ và nội dung riêng.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/signup"
            className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[#D4AF37] px-7 py-3 text-sm font-bold text-white shadow-lg shadow-amber-200 transition hover:bg-[#B8860B]"
          >
            <Store size={16} />
            Đăng ký shop miễn phí
          </Link>
          <Link
            href="/directory"
            className="inline-flex min-h-12 items-center gap-2 rounded-full border border-zinc-200 bg-white px-7 py-3 text-sm font-bold text-zinc-700 transition hover:border-zinc-300 hover:bg-zinc-50"
          >
            <Eye size={16} />
            Xem 200+ shop thật
          </Link>
        </div>
      </section>

      {/* Divider */}
      <div className="mx-auto mt-14 max-w-7xl px-6">
        <div className="mb-8 flex items-center gap-4">
          <div className="h-px flex-1 bg-zinc-100" />
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">6 shop demo mẫu</p>
          <div className="h-px flex-1 bg-zinc-100" />
        </div>

        <Suspense
          fallback={
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="h-80 animate-pulse rounded-3xl bg-zinc-100" />
              ))}
            </div>
          }
        >
          <DemoShops />
        </Suspense>

        {/* CTA bottom */}
        <div className="mt-16 rounded-3xl bg-gradient-to-br from-zinc-900 to-zinc-800 p-10 text-center text-white">
          <Sparkles className="mx-auto mb-4 text-[#D4AF37]" size={32} />
          <h2 className="text-2xl font-black sm:text-3xl">
            Shop thật của bạn sẽ đẹp hơn thế này
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-zinc-400">
            Hình ảnh thật, sản phẩm thật, câu chuyện thật của shop. Đăng ký ngay và có landing page đầu tiên trong vòng 5 phút.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/signup"
              className="inline-flex min-h-12 items-center gap-2 rounded-full bg-[#D4AF37] px-8 py-3 text-sm font-bold text-white transition hover:bg-[#B8860B]"
            >
              <Store size={16} />
              Tạo landing page miễn phí
            </Link>
            <Link
              href="/directory"
              className="inline-flex min-h-12 items-center gap-2 rounded-full border border-zinc-600 px-8 py-3 text-sm font-semibold text-zinc-300 transition hover:border-zinc-400 hover:text-white"
            >
              <ExternalLink size={15} />
              Khám phá cộng đồng 200+ shop
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-16">
        
      </div>
    </main>
  )
}
