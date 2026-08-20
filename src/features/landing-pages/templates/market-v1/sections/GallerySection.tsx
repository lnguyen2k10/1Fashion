'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { X, ZoomIn } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { GalleryItem } from '@/types/landing-page'
import { optimizeImageUrl } from '@/lib/utils'

interface GallerySectionProps {
  items: GalleryItem[]
  sectionTitle?: string
  themeColor?: string
  isEditing?: boolean
  onPickImage?: (path: string, currentUrl: string) => void
}

export function GallerySection({ items, sectionTitle, themeColor = '#D4AF37', isEditing, onPickImage }: GallerySectionProps) {
  const [lightbox, setLightbox] = useState<string | null>(null)

  if (!items || items.length === 0) {
    if (!isEditing) return null
    return (
      <section className="py-16 px-4 bg-[#FAFAF8]">
        <div className="max-w-5xl mx-auto text-center">
          <span className="text-xs font-mono tracking-[0.3em] uppercase" style={{ color: themeColor }}>Gallery</span>
          <h2 className="text-2xl font-bold mt-2 mb-8 text-gray-800">Lookbook & Ảnh Sản Phẩm</h2>
          <div className="border-2 border-dashed border-gray-200 rounded-2xl p-12 text-gray-400">
            <p className="text-sm">Thêm ảnh Lookbook từ section Gallery trong Editor</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <>
      <section className="py-16 px-4 bg-[#FAFAF8]">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <span className="block text-[10px] font-mono tracking-[0.4em] uppercase mb-3" style={{ color: themeColor }}>
              — Lookbook
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] tracking-tight">
              {sectionTitle || <>Bộ Sưu Tập <span className="italic font-light">Ảnh</span></>}
            </h2>
          </div>

          {/* Masonry Grid */}
          <div className="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
            {items.map((item, idx) => (
              <div
                key={idx}
                className="group relative break-inside-avoid rounded-xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500"
                onClick={() => !isEditing && setLightbox(item.url)}
              >
                <Image
                  src={optimizeImageUrl(item.url)}
                  alt={item.caption || `Gallery ${idx + 1}`}
                  width={400}
                  height={600}
                  className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700"
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                  <ZoomIn size={24} className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                {/* Edit mode overlay */}
                {isEditing && (
                  <button
                    onClick={e => {
                      e.stopPropagation()
                      onPickImage?.(`gallery[${idx}].url`, item.url)
                    }}
                    className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center text-white text-xs font-bold"
                  >
                    Đổi Ảnh
                  </button>
                )}
                {/* Caption */}
                {item.caption && (
                  <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/60 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-white text-xs font-medium">{item.caption}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center p-4"
            onClick={() => setLightbox(null)}
          >
            <button
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
              onClick={() => setLightbox(null)}
            >
              <X size={20} />
            </button>
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-3xl max-h-[85vh] w-full"
              onClick={e => e.stopPropagation()}
            >
              <Image
                src={optimizeImageUrl(lightbox)}
                alt="Gallery"
                width={800}
                height={1000}
                className="object-contain max-h-[85vh] mx-auto rounded-xl"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
