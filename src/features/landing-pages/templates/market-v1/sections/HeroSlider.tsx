'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, ImageIcon } from 'lucide-react'
import type { HeroSlide } from '@/types/landing-page'
import { optimizeImageUrl } from '@/lib/utils'

interface HeroSliderProps {
  slides: HeroSlide[]
  isEditing?: boolean
  onPickImage?: (path: string, currentUrl: string) => void
  themeColor?: string
}

export function HeroSlider({ slides, isEditing, onPickImage, themeColor = '#D4AF37' }: HeroSliderProps) {
  const [current, setCurrent] = useState(0)

  // Normalize: handle both string[] (legacy) and HeroSlide[] (new format)
  const normalizeSlides = (raw: any[]): HeroSlide[] => {
    return raw.map(s => {
      if (typeof s === 'string') return { image_url: optimizeImageUrl(s), title: '' }
      return { ...s, image_url: optimizeImageUrl(s.image_url) } as HeroSlide
    }).filter(s => s.image_url)
  }

  const validSlides: HeroSlide[] = slides?.length > 0
    ? normalizeSlides(slides)
    : []

  // Auto-slide mỗi 6 giây
  useEffect(() => {
    if (isEditing) return
    const t = setInterval(() => setCurrent(p => (p + 1) % validSlides.length), 6000)
    return () => clearInterval(t)
  }, [isEditing, validSlides.length])

  const prev = () => setCurrent(p => (p - 1 + validSlides.length) % validSlides.length)
  const next = () => setCurrent(p => (p + 1) % validSlides.length)

  if (validSlides.length === 0) {
    return (
      <section className="relative flex flex-col items-center justify-center min-h-[300px] border-b-[3px] bg-zinc-950 px-4 text-center md:min-h-[400px]" style={{ borderColor: themeColor }}>
        {isEditing && (
          <button
            onClick={() => onPickImage?.(`hero_section.hero_slides[0].image_url`, '')}
            className="absolute top-4 right-4 z-30 flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-xs font-bold uppercase tracking-wider text-black shadow-xl transition-transform hover:scale-105"
          >
            <ImageIcon size={16} />
            Thêm Ảnh Bìa
          </button>
        )}
        <span className="block text-xs font-mono tracking-[0.4em] uppercase mb-4" style={{ color: themeColor }}>
          — Welcome —
        </span>
        <h2 className="max-w-2xl whitespace-pre-line text-2xl font-bold leading-tight text-white sm:text-3xl md:text-5xl">
          Chào mừng đến với cửa hàng của chúng tôi
        </h2>
        <p className="mt-4 max-w-md text-sm text-white/70 sm:text-base">
          Trải nghiệm mua sắm tuyệt vời với các sản phẩm chất lượng.
        </p>
      </section>
    )
  }

  return (
    <section className="relative h-[72svh] min-h-[350px] overflow-hidden border-b-[3px] bg-black md:h-[85vh] md:min-h-[520px]" style={{ borderColor: themeColor }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.06 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.6, ease: 'easeOut' }}
          className="absolute inset-0"
        >
          <Image
            src={validSlides[current].image_url}
            alt={validSlides[current].title || 'Hero slide'}
            fill
            sizes="100vw"
            className="object-cover brightness-[0.68] saturate-[1.05]"
            priority
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/50" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Slide Text */}
      {validSlides[current].title && (
        <div className="absolute inset-0 z-10 flex items-center px-4 sm:px-8 md:px-16">
          <motion.div
            key={`text-${current}`}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="rounded-2xl border border-white/10 bg-black/30 p-5 backdrop-blur-md md:rounded-3xl md:p-8"
          >
            <span className="block text-xs font-mono tracking-[0.4em] uppercase mb-4" style={{ color: themeColor }}>
              — New Collection
            </span>
            <h2 className="max-w-xl whitespace-pre-line text-3xl font-bold leading-tight text-white sm:text-4xl md:text-6xl">
              {validSlides[current].title}
            </h2>
            {validSlides[current].subtitle && (
              <p className="mt-3 max-w-md text-sm text-white/80 sm:mt-4 sm:text-lg">{validSlides[current].subtitle}</p>
            )}
          </motion.div>
        </div>
      )}

      {/* Edit mode: click to change image */}
      {isEditing && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/20 pointer-events-none gap-4">
          <button
            onClick={() => onPickImage?.(`hero_section.hero_slides[${current}].image_url`, validSlides[current].image_url)}
            className="pointer-events-auto flex min-h-11 items-center gap-2 rounded-full bg-white/90 px-5 py-3 text-xs font-bold uppercase tracking-wider text-black shadow-xl transition-transform hover:scale-105 sm:px-6 sm:text-sm"
          >
            <ImageIcon size={18} />
            Thay Đổi Ảnh Nền
          </button>
          
          <div className="flex gap-2 pointer-events-auto">
            {validSlides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrent(idx)}
                className="px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider text-white border border-white/40 backdrop-blur-sm transition-all"
                style={{ background: idx === current ? themeColor : 'rgba(0,0,0,0.6)' }}
              >
                Slide {idx + 1}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Prev / Next Arrows */}
      {!isEditing && validSlides.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition-all hover:bg-black/60 sm:left-4"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/30 text-white backdrop-blur-sm transition-all hover:bg-black/60 sm:right-4"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {/* Dot Indicators */}
      {validSlides.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {validSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className="rounded-full transition-all duration-500"
              style={{
                width: i === current ? 28 : 8,
                height: 8,
                background: i === current ? themeColor : 'rgba(255,255,255,0.4)'
              }}
            />
          ))}
        </div>
      )}
    </section>
  )
}
