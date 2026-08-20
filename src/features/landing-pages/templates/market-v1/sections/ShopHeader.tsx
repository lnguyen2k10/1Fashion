'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'

interface ShopHeaderProps {
  businessName: string
  logoUrl?: string
  themeColor?: string
}

export function ShopHeader({ businessName, logoUrl, themeColor = '#D4AF37' }: ShopHeaderProps) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <motion.header
      className={`fixed top-0 inset-x-0 z-50 transition-colors duration-500 ${
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100' : 'bg-transparent'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-3 sm:h-16 sm:px-4">
        <Link 
          href="/" 
          className={`flex items-center gap-2 text-sm font-semibold transition-colors ${
            scrolled ? 'text-gray-800 hover:text-[#D4AF37]' : 'text-white hover:text-gray-200'
          }`}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/20 backdrop-blur-sm transition-colors hover:bg-black/40 sm:h-8 sm:w-8">
            <ChevronLeft size={18} className="text-white" />
          </div>
          <span className="hidden sm:inline drop-shadow-md">Về 1Fashion</span>
        </Link>

        <div 
          className={`font-serif font-bold text-xl tracking-wide transition-opacity duration-300 ${
            scrolled ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ color: themeColor }}
        >
          {businessName}
        </div>

        <div className="flex items-center gap-4">
          <nav className={`hidden md:flex items-center gap-6 text-[11px] font-bold tracking-[0.2em] uppercase transition-colors ${
            scrolled ? 'text-gray-600' : 'text-white/90 drop-shadow-md'
          }`}>
            <a href="#about" className="hover:text-[#D4AF37] transition-colors">Giới thiệu</a>
            <a href="#products" className="hover:text-[#D4AF37] transition-colors">Sản phẩm</a>
            <a href="#contact" className="hover:text-[#D4AF37] transition-colors">Liên hệ</a>
          </nav>
        </div>
      </div>
    </motion.header>
  )
}
