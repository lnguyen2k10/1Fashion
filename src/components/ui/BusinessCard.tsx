'use client'

import React from 'react'
import Image from 'next/image';
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Star } from 'lucide-react'
import { optimizeImageUrl } from '@/lib/utils'

interface BusinessCardProps {
  slug: string
  business_name: string
  category: string
  location_district: string
  location_city?: string
  rating_score: number
  cover_image?: string
  logo_url?: string
  isFeatured?: boolean
  is_verified?: boolean
}

export const BusinessCard: React.FC<BusinessCardProps> = ({ 
  slug, 
  business_name, 
  category, 
  location_district, 
  location_city,
  rating_score,

  cover_image = 'https://images.unsplash.com/photo-1519415387722-a1c3bbef716c?auto=format&fit=crop&q=80', // Fallback
  logo_url,
  isFeatured = false,
  is_verified = false
}) => {
  return (
    <Link href={`/${slug}`}>
      <motion.div 
        className={`group relative overflow-hidden rounded-xl bg-gray-100 border border-gray-200 transition-all duration-300 hover:border-[#D4AF37] hover:shadow-[0_8px_30px_rgb(212,175,55,0.15)] ${isFeatured ? 'h-[350px] sm:h-[400px] md:h-[500px]' : 'h-[280px] sm:h-[320px] md:h-[400px]'}`}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        {/* Cover Image */}
        <div className="absolute inset-0 z-0 overflow-hidden bg-gray-200">
          <Image width={600} height={600} src={optimizeImageUrl(cover_image) || 'https://images.unsplash.com/photo-1519415387722-a1c3bbef716c?auto=format&fit=crop&q=80'}   
            alt={business_name}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
           />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        </div>

        <div className="absolute top-4 left-4 z-20">
          <span className="px-3 py-1.5 rounded-md bg-white/90 backdrop-blur-sm shadow-sm text-[11px] font-bold text-[#D4AF37] uppercase tracking-wide">
            {category}
          </span>
        </div>

        {/* Rating Badge */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 px-2.5 py-1.5 bg-black/60 backdrop-blur-sm rounded-md border border-white/10">
          <Star size={12} className="fill-amber-400 text-[#F5E0A3]" />
          <span className="text-xs font-bold text-white">{rating_score.toFixed(1)}</span>
        </div>

        {/* Content */}
        <div className="absolute inset-0 z-10 p-6 flex flex-col justify-end space-y-4">
          <div className="flex items-center gap-4">
            {logo_url && (
              <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-white/20 bg-white flex-shrink-0 shadow-md">
                <Image width={100} height={100} src={logo_url} alt={business_name} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-medium text-gray-300 uppercase tracking-wider mb-1 truncate">
                {location_city ? `${location_district}, ${location_city}` : location_district}
              </p>
              <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white leading-tight truncate flex items-center gap-2">
                <span className="truncate">{business_name}</span>
                {is_verified && (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" className="text-[#D4AF37] shrink-0" stroke="black" strokeWidth="1">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                )}
              </h3>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
            <span className="text-xs font-bold text-white group-hover:text-[#D4AF37] transition-colors">Xem cửa hàng</span>
            <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center transition-transform hover:scale-110 group-hover:bg-[#D4AF37] group-hover:text-white">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 11L11 1M11 1H1M11 1V11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  )
}
