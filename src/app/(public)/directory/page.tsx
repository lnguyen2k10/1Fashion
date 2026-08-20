'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { Grid, List, MapPin, ChevronLeft, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import { useSearchParams } from 'next/navigation'
import { BusinessCard } from '@/components/ui/BusinessCard'
import { SearchBar } from '@/components/ui/SearchBar'
import { CategoryIcon } from '@/components/ui/CategoryIcon'
import { fetchCategories } from '@/lib/services/categories'
import type { SiteCategory } from '@/types/landing-page'

const ALL = 'Tất cả'
const FALLBACK_COVER = 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&q=80'

function toCard(shop: any) {
  const firstSlide = shop.content_json?.hero_section?.hero_slides?.[0]
  return {
    slug: shop.business_slug,
    business_name: shop.business_name,
    category: shop.category || 'Thời Trang',
    location_district: shop.content_json?.contact_info?.address_full || [shop.location_ward, shop.location_district, shop.location_city].filter(Boolean).join(', ') || 'TP.HCM',
    location_city: shop.location_city,
    rating_score: shop.content_json?.social_trust?.rating_score || shop.rating_score || 5.0,
    cover_image: shop.cover_image || (typeof firstSlide === 'string' ? firstSlide || FALLBACK_COVER : firstSlide?.image_url || FALLBACK_COVER),
    logo_url: shop.logo_url || '', is_verified: Boolean(shop.is_verified), isFeatured: Boolean(shop.is_verified),
  }
}

function DirectoryPageContent() {
  const params = useSearchParams()
  const [categories, setCategories] = useState<SiteCategory[]>([])
  const [shops, setShops] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [loadingMore, setLoadingMore] = useState(false)
  const [searchTerm, setSearchTerm] = useState(params.get('q') || '')
  const [location, setLocation] = useState(params.get('location') || params.get('district') || params.get('loc') || ALL)
  const [category, setCategory] = useState(params.get('category') || ALL)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  useEffect(() => { void fetchCategories().then(setCategories) }, [])
  useEffect(() => { setPage(1) }, [searchTerm, location, category])

  useEffect(() => {
    const controller = new AbortController()
    const timeout = window.setTimeout(async () => {
      if (page === 1) setLoading(true)
      else setLoadingMore(true)
      
      try {
        const query = new URLSearchParams({ page: String(page) })
        if (searchTerm) query.set('q', searchTerm)
        if (location !== ALL) query.set('location', location)
        if (category !== ALL) query.set('category', category)
        const response = await fetch(`/api/public/shops?${query}`, { signal: controller.signal })
        const result = await response.json()
        if (!response.ok) throw new Error(result.error || 'Không thể tải danh bạ')
        
        const newShops = (result.shops || []).map(toCard)
        if (page === 1) {
          setShops(newShops)
        } else {
          setShops(prev => {
             const existingSlugs = new Set(prev.map(s => s.slug))
             return [...prev, ...newShops.filter((s: any) => !existingSlugs.has(s.slug))]
          })
        }
        setTotal(result.total || 0)
      } catch (error: any) {
        if (error.name !== 'AbortError') { 
          if (page === 1) setShops([])
          setTotal(0) 
        }
      } finally { 
        if (!controller.signal.aborted) {
          setLoading(false)
          setLoadingMore(false)
        }
      }
    }, searchTerm ? 300 : 0)
    return () => { controller.abort(); window.clearTimeout(timeout) }
  }, [page, searchTerm, location, category])

  const categoryItems = useMemo(() => [{ id: ALL, label: ALL, icon: 'Box' }, ...categories.map((item) => ({ id: item.name, label: item.name, icon: item.icon }))], [categories])
  const pageSize = 24
  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  return <main className="min-h-screen bg-white pb-16 pt-24 sm:pt-32"><div className="mx-auto max-w-7xl space-y-7 px-4 sm:space-y-10 sm:px-6">
    <header className="text-center"><h1 className="text-4xl font-bold text-[#2F2F2F] sm:text-5xl md:text-7xl">Danh bạ <span className="text-[#D4AF37]">Thời Trang.</span></h1><p className="mt-4 text-xs font-bold uppercase tracking-widest text-[#2F2F2F]/50 sm:mt-5">{total.toLocaleString('vi-VN')} shop phù hợp</p></header>
    <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} location={location} onLocationChange={setLocation} onSearch={() => setPage(1)} />
    <section className="flex flex-col gap-3 rounded-2xl border border-[#D4AF37]/10 bg-white p-3 shadow-sm sm:gap-4 sm:p-4 md:flex-row md:items-center md:justify-between"><div className="-mx-1 flex overflow-x-auto px-1 scrollbar-hide"><div className="flex gap-1">{categoryItems.map((item) => <button key={item.id} onClick={() => setCategory(item.id)} className={`flex items-center justify-center min-h-10 whitespace-nowrap rounded-full px-4 py-2 text-xs transition-colors ${category === item.id ? 'bg-[#D4AF37]/10 text-[#B8860B] font-bold' : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-700'}`}><CategoryIcon name={item.icon} size={14} /> <span className="ml-1.5">{item.label}</span></button>)}</div></div><div className="flex items-center gap-2 self-end md:self-auto"><MapPin size={14} className="text-[#D4AF37]" /><span className="max-w-36 truncate text-xs text-zinc-500">{location}</span><button aria-label="Dạng lưới" onClick={() => setViewMode('grid')} className={`ml-1 min-h-10 min-w-10 rounded p-2 transition-colors ${viewMode === 'grid' ? 'text-[#D4AF37] bg-[#D4AF37]/10' : 'text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50'}`}><Grid size={17} /></button><button aria-label="Dạng danh sách" onClick={() => setViewMode('list')} className={`min-h-10 min-w-10 rounded p-2 transition-colors ${viewMode === 'list' ? 'text-[#D4AF37] bg-[#D4AF37]/10' : 'text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50'}`}><List size={17} /></button></div></section>
    {loading && page === 1 ? <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-8 lg:grid-cols-3">{Array.from({ length: 6 }, (_, index) => <div key={index} className="h-[250px] sm:h-[300px] md:h-[400px] animate-pulse rounded-3xl bg-zinc-100" />)}</div> : shops.length === 0 ? <Empty clear={() => { setSearchTerm(''); setLocation(ALL); setCategory(ALL) }} /> : <section className={viewMode === 'grid' ? 'grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-8 lg:grid-cols-3' : 'space-y-5'}>{shops.map((shop) => viewMode === 'grid' ? <BusinessCard key={shop.slug} {...shop} /> : <article key={shop.slug} className="flex flex-col gap-5 rounded-3xl border p-4 md:flex-row"><Image src={shop.cover_image} alt={shop.business_name} width={400} height={300} sizes="(max-width: 768px) 100vw, 400px" className="aspect-video w-full rounded-2xl object-cover md:w-72 md:h-48" loading="lazy" /><div className="flex flex-1 flex-col justify-center"><p className="text-xs text-[#B8860B]">{shop.category}</p><h2 className="mt-2 text-xl sm:text-2xl font-bold">{shop.business_name}</h2><p className="mt-2 flex items-center gap-2 text-sm text-zinc-500"><MapPin size={15} />{shop.location_district}</p><a href={`/${shop.slug}`} className="mt-4 inline-flex min-h-11 w-fit items-center rounded-full border border-[#D4AF37] px-5 py-2 text-xs font-bold text-[#B8860B]">Xem chi tiết</a></div></article>)}</section>}
    {page < totalPages && shops.length > 0 && <nav className="flex items-center justify-center pt-8"><button disabled={loadingMore} onClick={() => setPage((current) => current + 1)} className="rounded-full bg-zinc-900 px-8 py-3 text-sm font-semibold text-white transition-all hover:bg-zinc-800 disabled:opacity-50">{loadingMore ? 'Đang tải...' : 'Xem thêm shop'}</button></nav>}
  </div></main>
}

function Empty({ clear }: { clear: () => void }) { return <div className="py-24 text-center"><p className="text-lg text-zinc-500">Không tìm thấy shop phù hợp.</p><button onClick={clear} className="mt-5 rounded-full bg-[#D4AF37] px-5 py-2 text-sm font-semibold text-white">Xóa bộ lọc</button></div> }

export default function DirectoryPage() { return <React.Suspense fallback={<div className="min-h-screen bg-white" />}><DirectoryPageContent /></React.Suspense> }
