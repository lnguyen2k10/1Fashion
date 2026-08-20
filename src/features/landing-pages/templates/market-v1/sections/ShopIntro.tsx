'use client'

import React from 'react'
import Image from 'next/image'
import { MapPin, Phone, CheckCircle, Globe, Mail, Clock, Share2 } from 'lucide-react'
import type { ContactInfo } from '@/types/landing-page'
import { optimizeImageUrl } from '@/lib/utils'


interface ShopIntroProps {
  businessName: string
  category: string
  district?: string
  city?: string
  logoUrl?: string
  isVerified?: boolean
  themeColor?: string
  introText?: string
  isEditing?: boolean
  onUpdate?: (path: string, value: any) => void
  onImagePick?: (path: string, currentUrl: string) => void
  contactInfo?: ContactInfo
}

export function ShopIntro({
  businessName,
  category,
  district,
  city,
  logoUrl,
  isVerified,
  themeColor = '#D4AF37',
  introText,
  isEditing,
  onUpdate,
  onImagePick,
  contactInfo
}: ShopIntroProps) {
  return (
    <section className="pb-16 px-4 bg-white" id="about">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-start gap-8 md:gap-12 relative z-10">
        
        {/* Logo - Overlaps Hero */}
        <div
          onClick={() => {
            if (isEditing && onImagePick) {
              onImagePick('logo_url', logoUrl || '')
            }
          }}
          className={`w-32 h-32 md:w-48 md:h-48 rounded-2xl overflow-hidden shrink-0 shadow-2xl border-4 border-white -mt-16 md:-mt-24 relative bg-white group ${isEditing ? 'cursor-pointer hover:ring-4 hover:ring-[#D4AF37]/50' : ''}`}
        >
          {isEditing && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
              <span className="text-white text-xs font-bold uppercase tracking-wider bg-black/50 px-3 py-1 rounded-full">Đổi Logo</span>
            </div>
          )}
          {logoUrl ? (
            <Image src={optimizeImageUrl(logoUrl)} alt={businessName} width={192} height={192} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl md:text-7xl font-serif font-bold text-white"
              style={{ background: `linear-gradient(135deg, ${themeColor}, #B8860B)` }}>
              {businessName?.charAt(0) || 'S'}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 w-full pt-2 md:pt-6">
          {/* Shop Name & Share Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
            <h1 className="text-3xl md:text-5xl font-bold text-[#1A1A1A] tracking-tight leading-tight font-serif pr-12 sm:pr-0" style={{ textShadow: `0 2px 10px ${themeColor}15` }}>
              {businessName}
            </h1>
            <button 
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: businessName, url: window.location.href })
                } else {
                  navigator.clipboard.writeText(window.location.href)
                  alert('Đã copy đường dẫn!')
                }
              }}
              className="absolute top-4 right-4 sm:static sm:top-auto sm:right-auto flex items-center justify-center gap-1.5 p-2.5 sm:px-4 sm:py-2 rounded-full text-xs font-bold transition-all border shadow-sm hover:shadow-md whitespace-nowrap bg-white/80 backdrop-blur-sm sm:bg-transparent"
              style={{ borderColor: themeColor, color: themeColor, backgroundColor: `${themeColor}0A` }}
              aria-label="Chia sẻ"
            >
              <Share2 size={16} /> <span className="hidden sm:inline">Chia sẻ</span>
            </button>
          </div>

          {/* Category tag */}
          <div className="inline-flex items-center gap-2 mb-6">
            <span
              className="text-[10px] font-bold tracking-[0.3em] uppercase px-3 py-1 rounded-full"
              style={{ background: themeColor + '15', color: themeColor }}
            >
              {category}
            </span>
            {isVerified && (
              <span className="flex items-center gap-1 text-[10px] font-semibold text-[#B8860B] bg-amber-50 px-2 py-1 rounded-full border border-amber-100">
                <CheckCircle size={11} />
                Đã Xác Minh
              </span>
            )}
          </div>

          {/* Intro text */}
          {(introText || isEditing) && (
            <div className="mb-8">
              {isEditing ? (
                <p
                  contentEditable
                  suppressContentEditableWarning
                  onBlur={e => onUpdate?.('about_us.intro_text', e.currentTarget.textContent)}
                  className="text-gray-600 leading-relaxed text-base outline-none border-b-2 border-dashed border-transparent focus:border-[#D4AF37] transition-colors"
                  data-placeholder="Nhập mô tả về cửa hàng..."
                >
                  {introText || 'Nhấn để thêm mô tả cửa hàng...'}
                </p>
              ) : (
                <p className="text-gray-600 leading-relaxed text-base">{introText}</p>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Divider */}
      <div className="max-w-5xl mx-auto mt-16">
        <div className="h-px w-full" style={{ background: `linear-gradient(to right, transparent, ${themeColor}40, transparent)` }} />
      </div>
    </section>
  )
}
