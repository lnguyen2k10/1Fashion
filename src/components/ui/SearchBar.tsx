'use client'

import React, { useState } from 'react'
import { Search, MapPin, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { fetchLocations, SystemLocation } from '@/lib/services/locations'

interface SearchBarProps {
  searchTerm?: string
  onSearchChange?: (val: string) => void
  location?: string
  onLocationChange?: (val: string) => void
  onSearch?: () => void
}

function SearchAction({ onClick }: { onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void }) {
  return <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className="group flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl px-6 py-3 text-[11px] font-bold uppercase tracking-[0.2em] text-white shadow-[0_8px_20px_rgba(212,175,55,0.25)] transition-all duration-300 hover:shadow-[0_12px_25px_rgba(212,175,55,0.35)] sm:px-8 sm:py-4"
    style={{ background: 'linear-gradient(135deg, #D4AF37 0%, #F5E0A3 50%, #B8860B 100%)' }}
  >
    <span>Tìm kiếm</span>
    <Sparkles size={16} className="group-hover:animate-pulse" />
  </motion.button>
}

export const SearchBar = ({ 
  searchTerm, 
  onSearchChange,
  location,
  onLocationChange,
  onSearch 
}: SearchBarProps) => {
  const [isFocused, setIsFocused] = useState(false)
  
  // Local state fallback if not controlled
  const [localSearch, setLocalSearch] = useState('')
  const [localLocation, setLocalLocation] = useState('')

  const currentSearch = searchTerm !== undefined ? searchTerm : localSearch
  const currentLocation = location !== undefined ? location : localLocation

  const [locations, setLocations] = useState<SystemLocation[]>([])

  React.useEffect(() => {
    fetchLocations().then(setLocations).catch(() => setLocations([]))
  }, [])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onSearchChange) onSearchChange(e.target.value)
    else setLocalSearch(e.target.value)
  }

  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    if (onLocationChange) onLocationChange(e.target.value)
    else setLocalLocation(e.target.value)
  }

  const handleActionClick = (e: React.MouseEvent) => {
    if (onSearch) {
      e.preventDefault()
      onSearch()
    }
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.8 }}
      className="relative mx-auto w-full max-w-4xl px-0 sm:px-4"
    >
      <div className={`
        relative flex flex-col items-center gap-2 p-2 md:flex-row
        rounded-2xl sm:rounded-[1.5rem] transition-all duration-500
        ${isFocused ? 'border-[#D4AF37]/50 bg-white/90 shadow-[0_15px_40px_rgba(212,175,55,0.15)]' : 'border-[#D4AF37]/20 bg-white/70 shadow-lg'}
        backdrop-blur-md border
      `}>
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#2F2F2F]/40 group-focus-within:text-[#D4AF37]">
            <Search size={18} />
          </div>
          <input 
            type="text" 
            value={currentSearch}
            onChange={handleSearchChange}
            placeholder="Bạn đang tìm gì? (vd: Váy công sở, Túi xách...)"
            className="w-full bg-transparent border-none py-4 pl-12 pr-4 text-[#2F2F2F] placeholder:text-[#2F2F2F]/40 outline-none font-medium text-sm"
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
        </div>

        {/* Divider */}
        <div className="hidden md:block w-px h-8 bg-[#D4AF37]/20" />

        {/* Location Selector */}
        <div className="relative w-full md:w-64">
          <div className="absolute left-5 top-1/2 -translate-y-1/2 text-[#2F2F2F]/40">
            <MapPin size={18} />
          </div>
          <select 
            value={currentLocation}
            onChange={handleLocationChange}
            className="w-full bg-transparent border-none py-4 pl-12 pr-4 text-[#2F2F2F] appearance-none outline-none font-medium text-sm cursor-pointer"
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          >
            <option value="Tất cả">Khu vực (Tất cả)</option>
            {locations.map(d => (
              <option key={d.id} value={d.name}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        {/* Action Button */}
        {onSearch ? (
          <div className="w-full md:w-auto">
            <SearchAction onClick={handleActionClick} />
          </div>
        ) : (
          <Link href={`/directory?q=${encodeURIComponent(currentSearch)}&location=${encodeURIComponent(currentLocation)}`} className="w-full md:w-auto">
            <SearchAction />
          </Link>
        )}
      </div>

      {/* Decorative Tags */}
        <div className="mt-6 flex flex-wrap justify-center gap-x-4 gap-y-2 sm:mt-8 sm:gap-5">
        {['Thời Trang', 'Phụ Kiện', 'Khuyến mãi 50%', 'Gần bạn nhất'].map((tag) => (
          <span 
            key={tag} 
            onClick={() => {
               if(onSearchChange) onSearchChange(tag)
               else setLocalSearch(tag)
            }}
            className="text-[10px] font-bold text-[#2F2F2F]/40 uppercase tracking-[0.2em] hover:text-[#D4AF37] cursor-pointer transition-colors"
          >
            #{tag}
          </span>
        ))}
      </div>
    </motion.div>
  )
}
