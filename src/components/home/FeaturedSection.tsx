'use client'
import Image from 'next/image'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { CheckCircle, MapPin, ArrowRight, Tag } from 'lucide-react'
import { optimizeImageUrl } from '@/lib/utils'

interface Shop {
  slug: string
  business_name: string
  category: string
  location_district?: string
  cover_image?: string
  logo_url?: string
  services?: { name: string; price: string }[]
  is_verified?: boolean
  rating_score?: number
  rating_count?: number
}

const FALLBACK_COVER = 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=800'

function ShopCard({ b, idx }: { b: Shop; idx: number }) {
  const products = b.services?.slice(0, 3) || []

  return (
    <Link href={`/${b.slug}`} className="block h-full transition-transform duration-200 active:scale-[0.98]">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: idx * 0.08, duration: 0.6 }}
        className="group relative bg-[#1a1a1a] rounded-[2rem] overflow-hidden cursor-pointer h-full flex flex-col aspect-[4/5] sm:aspect-auto sm:h-[450px]"
        style={{ boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)' }}
        whileHover={{ y: -8, boxShadow: '0 20px 50px -10px rgba(212,175,55,0.2)' }}
      >
        {/* Full Cover Image Background */}
        <div className="absolute inset-0">
          <Image
            width={800} height={1000}
            src={optimizeImageUrl(b.cover_image) || FALLBACK_COVER}
            alt={b.business_name}
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
          />
          {/* Gradient Overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent transition-opacity duration-500 group-hover:opacity-90" />
        </div>

        {/* Top Badges */}
        <div className="absolute top-5 left-5 z-10">
          <span
            className="px-4 py-1.5 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase text-white shadow-lg"
            style={{ background: 'rgba(212,175,55,0.85)', backdropFilter: 'blur(12px)' }}
          >
            {b.category}
          </span>
        </div>

        {/* Rating Badge */}
        {b.rating_score && (
          <div className="absolute top-5 right-5 z-20 flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-white/10 shadow-lg"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#F5E0A3" stroke="#D4AF37" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
            <span className="text-[11px] font-bold text-white">{b.rating_score.toFixed(1)}</span>
            {b.rating_count ? <span className="text-[9px] text-white/50 ml-0.5">({b.rating_count})</span> : null}
          </div>
        )}

        {/* Bottom Glass Panel */}
        <div className="absolute bottom-4 left-4 right-4 z-20 flex flex-col">
          {/* Floating Logo */}
          {b.logo_url && (
            <div className="mb-[-24px] ml-4 relative z-30 transition-transform duration-500 group-hover:-translate-y-2">
              <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white shadow-xl bg-white">
                <Image src={b.logo_url} alt={b.business_name} width={64} height={64} className="w-full h-full object-cover" />
              </div>
            </div>
          )}

          {/* Glass Card */}
          <div 
            className="pt-8 pb-5 px-5 rounded-2xl overflow-hidden relative border border-white/10 transition-all duration-500 group-hover:border-white/20 group-hover:bg-black/50"
            style={{ background: 'rgba(20, 20, 20, 0.65)', backdropFilter: 'blur(16px)' }}
          >
            <div className="flex justify-between items-start gap-3">
              <div className="min-w-0 flex-1">
                <h3 className="text-white font-bold text-xl leading-tight mb-1.5 truncate tracking-wide flex items-center gap-2">
                  <span className="truncate">{b.business_name}</span>
                  {b.is_verified && (
                    <CheckCircle size={18} className="text-[#D4AF37] shrink-0" fill="currentColor" stroke="black" strokeWidth={1} />
                  )}
                </h3>
                {b.location_district && (
                  <div className="flex items-center gap-1.5 text-white/70">
                    <MapPin size={12} className="text-[#D4AF37]" />
                    <span className="text-xs truncate font-medium">{b.location_district}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Products preview (Shows on hover or default) */}
            {products.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2 transition-all duration-500">
                {products.map(s => (
                  <span
                    key={s.name}
                    className="px-2.5 py-1 rounded-md text-[10px] tracking-wide text-white/90 font-medium whitespace-nowrap"
                    style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.05)' }}
                  >
                    {s.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </Link>
  )
}

export function FeaturedSection({ businesses }: { businesses: Shop[] }) {
  return (
    <section className="py-16 sm:py-28" style={{ background: '#ffffff' }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 flex flex-col justify-between gap-6 md:mb-16 md:flex-row md:items-end md:gap-10"
        >
          <div>
            <div className="flex items-center gap-3 mb-5">
              <span className="w-12 h-px bg-[#D4AF37]" />
              <span className="text-[11px] tracking-[0.5em] uppercase text-[#D4AF37] font-medium">Nổi Bật</span>
            </div>
            <h2
              className="text-4xl font-bold leading-tight text-[#2F2F2F] md:text-6xl"
            >
              Cửa hàng<br /><span className="text-[#D4AF37]">Nổi bật.</span>
            </h2>
          </div>
          <p className="max-w-xs text-[#2F2F2F]/50 text-sm leading-relaxed font-medium">
            Những cửa hàng thời trang và phụ kiện hàng đầu, được đội ngũ xác thực chất lượng.
          </p>
        </motion.div>

        {/* Grid */}
        {businesses.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
            {businesses.map((b, i) => <ShopCard key={b.slug} b={b} idx={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-3xl overflow-hidden animate-pulse"
                style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.06)' }}
              >
                <div className="h-64 bg-[#F0EBE3]" />
                <div className="p-6 space-y-3">
                  <div className="h-5 bg-[#F0EBE3] rounded-full w-3/4" />
                  <div className="h-4 bg-[#F0EBE3] rounded-full w-1/2" />
                  <div className="flex gap-2 pt-2">
                    <div className="h-6 bg-[#F0EBE3] rounded-full w-16" />
                    <div className="h-6 bg-[#F0EBE3] rounded-full w-16" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-10 flex justify-center md:mt-16">
          <Link
            href="/directory"
            className="group relative inline-flex min-h-12 max-w-full items-center gap-2 overflow-hidden rounded-full px-6 py-3 text-center text-[10px] font-bold uppercase tracking-[0.16em] text-white shadow-md transition-all active:translate-y-0 hover:-translate-y-0.5 hover:shadow-xl sm:gap-3 sm:px-10 sm:py-4 sm:text-[11px] sm:tracking-[0.25em]"
            style={{ background: '#D4AF37' }}
          >
            <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent" />
            Khám Phá Toàn Bộ Danh Bạ <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  )
}
