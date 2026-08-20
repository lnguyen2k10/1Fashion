'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { Share2 } from 'lucide-react'

interface ProductGalleryProps {
  mainImage: string
  galleryImages?: string[]
  productName: string
  themeColor: string
}

export function ProductGallery({ mainImage, galleryImages = [], productName, themeColor }: ProductGalleryProps) {
  const [activeImage, setActiveImage] = useState(mainImage)
  
  const allImages = [mainImage, ...galleryImages].filter(Boolean)

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: productName,
          url: window.location.href
        })
      } catch (err) {}
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Đã copy đường dẫn!')
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image */}
      <div className="relative aspect-[3/4] sm:aspect-square w-full rounded-2xl md:rounded-3xl overflow-hidden bg-gray-50 shadow-sm">
        <Image 
          src={activeImage || '/placeholder.png'} 
          alt={productName}
          fill
          className="object-cover"
          priority
        />
        <button 
          onClick={handleShare}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-gray-700 hover:text-black shadow-sm transition-all hover:scale-105"
        >
          <Share2 size={18} />
        </button>
      </div>

      {/* Thumbnails */}
      {allImages.length > 1 && (
        <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
          {allImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setActiveImage(img)}
              className={`relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${activeImage === img ? 'opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
              style={{ borderColor: activeImage === img ? themeColor : 'transparent' }}
            >
              <Image src={img} alt={`${productName} - thumbnail ${idx + 1}`} fill className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
