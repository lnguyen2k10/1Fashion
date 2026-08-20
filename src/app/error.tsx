'use client'

import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Unhandled root layout error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden" style={{ background: '#ffffff' }}>
      
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full blur-[140px] opacity-20" style={{ background: '#ef4444' }} />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full blur-[120px] opacity-20" style={{ background: '#D4AF37' }} />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full max-w-lg text-center bg-white/60 backdrop-blur-xl border border-white/80 p-8 md:p-12 rounded-[2rem] shadow-[0_20px_60px_rgba(0,0,0,0.03)]"
      >
        <div className="w-16 h-16 rounded-full bg-[#ef4444]/10 flex items-center justify-center mx-auto mb-6 text-[#ef4444]">
          <AlertTriangle size={28} />
        </div>

        <h2 className="text-2xl font-bold text-[#2F2F2F] mb-3" style={{ fontFamily: "'Inter', serif" }}>
          Đã xảy ra sự cố ngoài ý muốn
        </h2>
        
        <p className="text-xs text-[#2F2F2F]/60 font-medium leading-relaxed max-w-sm mx-auto mb-8">
          Hệ thống gặp gián đoạn tạm thời. Đội ngũ kỹ thuật của chúng tôi đã được thông báo và đang tiến hành kiểm tra.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={reset}
            className="flex items-center justify-center gap-2.5 px-6 py-3 rounded-full text-white font-bold uppercase tracking-[0.2em] text-[10px] shadow-[0_8px_20px_rgba(114,47,55,0.2)] hover:shadow-[0_12px_25px_rgba(114,47,55,0.3)] transition-all bg-gradient-to-r from-[#ef4444] to-[#dc2626] hover:opacity-90"
          >
            <RefreshCw size={12} />
            <span>Thử tải lại trang</span>
          </button>
          
          <button 
            onClick={() => window.location.href = '/dashboard'}
            className="flex items-center justify-center gap-2.5 px-6 py-3 rounded-full text-[#2F2F2F] font-bold uppercase tracking-[0.2em] text-[10px] border border-[#2F2F2F]/10 bg-white/50 hover:bg-white transition-all shadow-sm"
          >
            <Home size={12} />
            <span>Về Dashboard</span>
          </button>
        </div>

        {error.digest && (
          <p className="mt-8 text-[9px] font-mono text-[#2F2F2F]/30 uppercase tracking-wider">
            Mã định danh: {error.digest}
          </p>
        )}
      </motion.div>
    </div>
  )
}
