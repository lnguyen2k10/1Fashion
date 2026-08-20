'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function RootNotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden" style={{ background: '#ffffff' }}>
      
      {/* Decorative Gold & White Circles */}
      <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] rounded-full blur-[160px] opacity-30 animate-pulse-slow" style={{ background: '#FFFFFF' }} />
      <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full blur-[120px] opacity-35" style={{ background: '#D4AF37' }} />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full max-w-xl text-center space-y-8"
      >
        <div className="flex justify-center">
          <motion.div 
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
            className="w-16 h-16 rounded-full border border-[#D4AF37]/30 flex items-center justify-center bg-white shadow-sm"
          >
            {/* Spinning clean minimalist lotus symbol */}
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#B8860B]" style={{ clipPath: "polygon(50% 0%, 80% 30%, 100% 60%, 80% 90%, 50% 100%, 20% 90%, 0% 60%, 20% 30%)" }} />
          </motion.div>
        </div>

        <div className="space-y-4">
          <h1 className="text-8xl font-light text-[#D4AF37] leading-none select-none tracking-widest" style={{ fontFamily: "'Inter', serif" }}>
            404
          </h1>
          <h2 className="text-xl font-bold text-[#2F2F2F] tracking-wide" style={{ fontFamily: "'Inter', serif" }}>
            Không Tìm Thấy Trang Yêu Cầu
          </h2>
          <p className="text-xs text-[#2F2F2F]/50 max-w-sm mx-auto leading-relaxed font-medium">
            Đường liên kết quý khách đang truy cập có thể đã hết hạn, bị thay đổi hoặc không tồn tại trong hệ thống.
          </p>
        </div>

        <div className="pt-4 flex justify-center">
          <Link href="/dashboard" className="inline-flex items-center gap-3 px-8 py-3.5 rounded-full text-white font-bold uppercase tracking-[0.25em] text-[10px] shadow-[0_10px_25px_rgba(212,175,55,0.25)] hover:shadow-[0_15px_30px_rgba(212,175,55,0.35)] transition-all bg-gradient-to-r from-[#D4AF37] to-[#B8860B] hover:opacity-95">
            <ArrowLeft size={12} />
            <span>Trở về Dashboard</span>
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
