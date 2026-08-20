'use client'
import { useState, useEffect } from 'react'
import { MapPin, ChevronDown } from 'lucide-react'
import { fetchCategories } from '@/lib/services/categories'
import type { SiteCategory } from '@/types/landing-page'
import { fetchLocations, SystemLocation } from '@/lib/services/locations'
import { CategoryIcon } from '@/components/ui/CategoryIcon'

interface Props {
  activeCategory: string
  activeLocation: string
  onCategory: (c: string) => void
  onLocation: (d: string) => void
}

export function FilterBar({ activeCategory, activeLocation, onCategory, onLocation }: Props) {
  const [showLocation, setShowLocation] = useState(false)
  const [categories, setCategories] = useState<SiteCategory[]>([])
  const [loadingCats, setLoadingCats] = useState(true)
  const [locations, setLocations] = useState<SystemLocation[]>([])

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch(() => setCategories([]))
      .finally(() => setLoadingCats(false))
    
    fetchLocations().then(setLocations).catch(() => setLocations([]))
  }, [])

  const categoryItems = [
    { id: 'Tất cả', label: 'Tất cả', icon: 'Box', color: '#D4AF37' },
    ...categories.map(c => ({ id: c.name, label: c.name, icon: c.icon, color: c.color }))
  ]

  return (
    <div className="bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Section label */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-gray-700 uppercase tracking-widest">Danh Mục</h2>
          {/* Location filter */}
          <div className="relative">
            <button
              onClick={() => setShowLocation(!showLocation)}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold text-gray-600 hover:text-[#D4AF37] transition-colors border border-gray-200 hover:border-[#D4AF37]/40 bg-white"
            >
              <MapPin size={13} className="text-[#D4AF37]" />
              {activeLocation === 'Tất cả' ? 'Toàn Quốc' : activeLocation}
              <ChevronDown size={13} className={`transition-transform ${showLocation ? 'rotate-180' : ''}`} />
            </button>

            {showLocation && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowLocation(false)} />
                <div className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 min-w-[200px] z-50 max-h-72 overflow-y-auto">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 px-3 py-1.5">Địa điểm</p>
                  
                  <button
                      onClick={() => { onLocation('Tất cả'); setShowLocation(false) }}
                      className={`w-full text-left px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                        activeLocation === 'Tất cả'
                          ? 'bg-[#D4AF37]/10 text-[#D4AF37] font-bold'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                      📍 Tất cả khu vực
                  </button>

                  {locations.map(d => (
                    <button
                      key={d.id}
                      onClick={() => { onLocation(d.name); setShowLocation(false) }}
                      className={`w-full text-left px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                        activeLocation === d.name
                          ? 'bg-[#D4AF37]/10 text-[#D4AF37] font-bold'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      {d.name}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Category grid */}
        {loadingCats ? (
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
            {categoryItems.map(cat => {
              const isActive = activeCategory === cat.id
              return (
                <button
                  key={cat.id}
                  onClick={() => onCategory(cat.id)}
                  className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl text-center transition-all duration-200 group ${
                    isActive
                      ? 'shadow-md scale-105'
                      : 'hover:bg-gray-50 hover:scale-102'
                  }`}
                  style={isActive ? {
                    background: `${cat.color}15`,
                    border: `1.5px solid ${cat.color}`,
                  } : {
                    background: '#f9f9f9',
                    border: '1.5px solid transparent',
                  }}
                >
                  <span className="mb-1" style={{ color: isActive ? cat.color : '#555' }}>
                    <CategoryIcon name={cat.icon} size={28} />
                  </span>
                  <span
                    className="text-[9px] font-bold uppercase tracking-wide leading-tight line-clamp-2"
                    style={{ color: isActive ? cat.color : '#555' }}
                  >
                    {cat.label}
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
