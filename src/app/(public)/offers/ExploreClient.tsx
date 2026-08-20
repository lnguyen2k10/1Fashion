'use client'

import React, { useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Clock, Zap, Search, Star, Tag, ShoppingBag, Filter } from 'lucide-react'
import { ClientCopyButton } from './ClientCopyButton'

export type ExploreItem = {
  type: 'offer' | 'product'
  id: string
  title: string
  description?: string
  price?: string
  price_original?: string
  image_url: string
  discount_code?: string
  valid_until?: string
  category?: string
  is_featured: boolean
  created_at: string
  business?: {
    business_name: string
    logo_url: string
    slug: string
    theme_color?: string
  }
}

export function ExploreClient({ initialData, serverCategories = [] }: { initialData: ExploreItem[], serverCategories?: any[] }) {
  const [activeTab, setActiveTab] = useState<'all' | 'offers' | 'products'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  
  const [currentPage, setCurrentPage] = useState(1)
  const ITEMS_PER_PAGE = 16

  React.useEffect(() => {
    setCurrentPage(1)
  }, [activeTab, searchQuery, selectedCategory])

  // Derive categories from serverCategories or fallback to data if missing
  const categories = useMemo(() => {
    if (serverCategories && serverCategories.length > 0) {
      return serverCategories.map(cat => cat.name)
    }
    const cats = new Set<string>()
    initialData.forEach(item => {
      if (item.type === 'product' && item.category) {
        cats.add(item.category)
      }
    })
    return Array.from(cats).sort()
  }, [initialData, serverCategories])

  // Filter and Search logic
  const filteredData = useMemo(() => {
    return initialData.filter(item => {
      // 1. Tab Filter
      if (activeTab === 'offers' && item.type !== 'offer') return false
      if (activeTab === 'products' && item.type !== 'product') return false

      // 2. Category Filter (Chỉ áp dụng cho products nếu tab là products hoặc all)
      if (selectedCategory !== 'all' && item.type === 'product') {
        if (item.category !== selectedCategory) return false
      }
      if (selectedCategory !== 'all' && item.type === 'offer') {
        return false // Hoặc có thể bỏ qua filter category cho offer
      }

      // 3. Search Filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const titleMatch = item.title?.toLowerCase().includes(query)
        const descMatch = item.description?.toLowerCase().includes(query)
        const shopMatch = item.business?.business_name?.toLowerCase().includes(query)
        
        if (!titleMatch && !shopMatch && !descMatch) return false
      }

      return true
    })
  }, [initialData, activeTab, searchQuery, selectedCategory])

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE)
  const paginatedData = filteredData.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 w-full">
      {/* Search & Filter Header */}
      <div className="mb-12 space-y-6">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          
          {/* Tabs */}
          <div className="flex bg-gray-50 p-1 rounded-xl w-full md:w-auto">
            <button
              onClick={() => { setActiveTab('all'); setSelectedCategory('all'); }}
              className={`flex-1 md:flex-none px-6 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'all' ? 'bg-white text-[#D4AF37] shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Tất Cả
            </button>
            <button
              onClick={() => { setActiveTab('offers'); setSelectedCategory('all'); }}
              className={`flex-1 md:flex-none px-6 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'offers' ? 'bg-white text-[#D4AF37] shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Ưu Đãi
            </button>
            <button
              onClick={() => { setActiveTab('products'); }}
              className={`flex-1 md:flex-none px-6 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'products' ? 'bg-white text-[#D4AF37] shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
            >
              Sản Phẩm
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-96 flex-shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="Tìm tên, ưu đãi hoặc tên shop..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-[#D4AF37]/30 transition-all outline-none"
            />
          </div>
        </div>

        {/* Categories (Only show if Products or All is active) */}
        {(activeTab === 'all' || activeTab === 'products') && categories.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <Filter size={16} className="text-gray-400 flex-shrink-0 mr-2" />
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors border ${selectedCategory === 'all' ? 'bg-[#2F2F2F] text-white border-[#2F2F2F]' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
            >
              Tất cả danh mục
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors border ${selectedCategory === cat ? 'bg-[#2F2F2F] text-white border-[#2F2F2F]' : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Grid Content */}
      {filteredData.length === 0 ? (
        <div className="rounded-3xl border border-[#D4AF37]/10 bg-white py-20 text-center shadow-sm sm:rounded-[3rem] sm:py-32 w-full">
          <Search size={48} className="mx-auto text-[#D4AF37]/20 mb-6" />
          <h3 className="text-2xl font-bold text-[#2F2F2F] mb-2 font-playfair">Không tìm thấy kết quả</h3>
          <p className="text-[#2F2F2F]/50">Vui lòng thử tìm kiếm với từ khóa hoặc bộ lọc khác.</p>
        </div>
      ) : (
        <>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 w-full">
          {paginatedData.map((item) => (
            <div key={`${item.type}-${item.id}`} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 group flex flex-col h-full relative">
              
              {/* Product Featured Badge */}
              {item.type === 'product' && item.is_featured && (
                <div className="absolute top-4 left-4 z-20 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                  <Star size={12} fill="currentColor" /> Nổi Bật
                </div>
              )}

              {/* Offer Hot Badge */}
              {item.type === 'offer' && (
                <div className="absolute top-4 left-4 z-20 bg-red-500 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                  <Zap size={12} fill="currentColor" /> HOT
                </div>
              )}

              {/* Image Section */}
              <div className="aspect-[4/3] overflow-hidden relative border-b border-gray-50">
                <Image 
                  src={item.image_url || 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80'} 
                  alt={item.title} 
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700" 
                />
              </div>

              {/* Business Meta (Overlapping) */}
              <div className="relative z-10 -mt-6 flex items-center justify-between px-5">
                <div className="w-12 h-12 rounded-full border-4 border-white bg-white shadow-md overflow-hidden relative">
                   <Image 
                     src={item.business?.logo_url || 'https://i.imgur.com/oIeQ21A.png'} 
                     alt="Logo" 
                     fill
                     className="object-cover" 
                   />
                </div>
                <Link href={`/${item.business?.slug}`} className="bg-[#2F2F2F] text-white text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full hover:bg-[#D4AF37] transition-colors shadow-sm">
                  Tới Cửa Hàng
                </Link>
              </div>

              {/* Body Content */}
              <div className="flex flex-1 flex-col p-5 pt-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[#D4AF37] text-[10px] font-bold tracking-widest uppercase">
                    {item.type === 'offer' ? 'Ưu Đãi' : item.category || 'Sản Phẩm'}
                  </span>
                  {item.type === 'offer' && item.valid_until && (
                    <span className="flex items-center gap-1 text-[10px] font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-md" suppressHydrationWarning>
                      <Clock size={10} />
                      Còn Hạn: {new Date(item.valid_until).toLocaleDateString('vi-VN')}
                    </span>
                  )}
                </div>

                <h3 className="font-playfair text-lg font-bold leading-snug text-[#2F2F2F] mb-3 group-hover:text-[#D4AF37] transition-colors line-clamp-2">
                  {item.title}
                </h3>
                
                {/* Price Display for Products */}
                {item.type === 'product' && (
                  <div className="mt-auto mb-4 flex items-baseline gap-2">
                    <span className="text-lg font-bold text-[#D4AF37]">{item.price || 'Liên hệ'}</span>
                    {item.price_original && (
                      <span className="text-xs text-gray-400 line-through">{item.price_original}</span>
                    )}
                  </div>
                )}

                {/* Offer Display for Offers */}
                {item.type === 'offer' && item.discount_code && (
                  <div className="mt-auto mb-4">
                    <ClientCopyButton code={item.discount_code} />
                  </div>
                )}

                {/* Shop Name Footer */}
                <div className="pt-4 mt-auto border-t border-gray-100 flex items-center justify-between">
                   <span className="text-xs font-semibold text-gray-600 line-clamp-1 flex-1">
                     {item.business?.business_name}
                   </span>
                </div>
              </div>

            </div>
          ))}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="mt-12 flex justify-center items-center gap-2">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors font-medium text-sm"
            >
              Trước
            </button>
            
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }).map((_, idx) => {
                const pageNumber = idx + 1;
                // Rút gọn các trang ở giữa nếu số lượng trang quá nhiều
                if (
                  totalPages > 7 && 
                  pageNumber !== 1 && 
                  pageNumber !== totalPages && 
                  Math.abs(pageNumber - currentPage) > 1
                ) {
                  if (pageNumber === 2 || pageNumber === totalPages - 1) {
                    return <span key={pageNumber} className="px-2 text-gray-400">...</span>
                  }
                  return null;
                }

                return (
                  <button
                    key={pageNumber}
                    onClick={() => setCurrentPage(pageNumber)}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm transition-colors ${
                      currentPage === pageNumber
                        ? 'bg-[#2F2F2F] text-white shadow-md'
                        : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {pageNumber}
                  </button>
                )
              })}
            </div>

            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors font-medium text-sm"
            >
              Sau
            </button>
          </div>
        )}
        </>
      )}
    </div>
  )
}
