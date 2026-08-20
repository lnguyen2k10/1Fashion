'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { ArrowRight, MapPin, Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { fetchCategories } from '@/lib/services/categories'
import { ALL_DISTRICTS } from '@/lib/constants'
import type { SiteCategory } from '@/types/landing-page'

export type HeroContent = {
  eyebrow?: string
  title?: string
  subtitle?: string
  image_url?: string | null
  hero_slides?: string[]
}

type Props = {
  content?: HeroContent | null
  accentColor?: string | null
  tagline?: string | null
  shopCount: number
}

const ALL = 'Tất cả'

export function HeroSection({ content, accentColor, tagline, shopCount }: Props) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [district, setDistrict] = useState(ALL)
  const [categories, setCategories] = useState<SiteCategory[]>([])
  const [currentSlide, setCurrentSlide] = useState(0)

  const color = accentColor || '#D4AF37'
  const title = content?.title || 'Khám phá thời trang\nbạn yêu thích'
  const subtitle = content?.subtitle || 'Tìm shop, thương hiệu và sản phẩm thời trang tại TP.HCM.'

  const slides = content?.hero_slides?.length ? content.hero_slides : [
    content?.image_url || 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=1920',
    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1920',
    'https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=1920'
  ]

  useEffect(() => {
    void fetchCategories().then(setCategories).catch(() => setCategories([]))
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [slides.length])

  const search = () => {
    const params = new URLSearchParams()
    if (query.trim()) params.set('q', query.trim())
    if (district !== ALL) params.set('district', district)
    router.push(`/directory${params.size ? `?${params}` : ''}`)
  }

  return (
    <section className="relative isolate min-h-[640px] overflow-hidden bg-zinc-950 sm:min-h-[720px]">
      {slides.map((slide, index) => (
        <div 
          key={slide}
          className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
        >
          <Image src={slide} alt="" fill priority={index === 0} sizes="100vw" className="object-cover opacity-80" />
        </div>
      ))}
      <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-zinc-900/30 to-transparent" />
      <div className="relative mx-auto flex min-h-[640px] max-w-7xl items-center px-4 py-24 sm:min-h-[720px] sm:px-6 sm:py-28">
        <div className="max-w-3xl">
          <div className="mb-7 flex flex-wrap items-center gap-4">
            <p className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.38em]" style={{ color }}>
              <span className="h-px w-10" style={{ backgroundColor: color }} />
              {content?.eyebrow || 'Danh bạ thời trang'}
            </p>
            <Link href="/about" className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur transition hover:bg-white/20">
              Dành cho Chủ Shop <ArrowRight size={12} />
            </Link>
          </div>
          <h1 className="whitespace-pre-line text-4xl font-bold leading-tight text-white sm:text-5xl md:text-7xl">{title}</h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/75 md:text-lg">{subtitle}</p>
          {tagline && tagline !== subtitle && <p className="mt-3 text-sm font-medium text-white/55">{tagline}</p>}

          <div className="mt-8 flex flex-col gap-2 rounded-2xl border border-white/20 bg-white/10 p-2 shadow-2xl backdrop-blur md:mt-10 md:flex-row md:items-center md:rounded-3xl">
            <label className="flex min-w-0 flex-1 items-center gap-3 px-4 py-3">
              <Search size={18} style={{ color }} />
              <input value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => event.key === 'Enter' && search()} placeholder="Tên shop, danh mục hoặc sản phẩm" className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/55" />
            </label>
            <label className="flex items-center gap-2 border-y border-white/15 px-4 py-3 md:border-x md:border-y-0">
              <MapPin size={17} style={{ color }} />
              <select value={district} onChange={(event) => setDistrict(event.target.value)} className="max-w-44 bg-transparent text-sm font-medium text-white outline-none">
                {ALL_DISTRICTS.map((item) => <option key={item} value={item} className="text-zinc-900">{item === ALL ? 'Toàn TP. Hồ Chí Minh' : item}</option>)}
              </select>
            </label>
            <button onClick={search} className="flex min-h-12 items-center justify-center gap-2 rounded-xl px-6 py-3 text-xs font-bold uppercase tracking-widest text-white transition hover:brightness-110 md:min-h-0 md:rounded-2xl" style={{ backgroundColor: color }}>
              Tìm kiếm <ArrowRight size={15} />
            </button>
          </div>

          <div className="mt-6 flex flex-wrap gap-x-4 gap-y-2 text-xs">
            {categories.slice(0, 5).map((category) => <button key={category.slug} onClick={() => router.push(`/directory?category=${encodeURIComponent(category.name)}`)} className="text-white/70 transition hover:text-white">#{category.name}</button>)}
          </div>
        </div>
      </div>
      <div className="absolute bottom-6 right-4 text-right sm:bottom-10 sm:right-10"><p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/45 sm:text-[10px] sm:tracking-[0.3em]">Danh bạ đang hoạt động</p><p className="mt-1 text-base font-bold text-white sm:text-lg">{shopCount.toLocaleString('vi-VN')} cửa hàng</p></div>
    </section>
  )
}
