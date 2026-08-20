'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Store } from 'lucide-react'

export function ClaimBanner({ shopSlug }: { shopSlug: string }) {
  return (
    <motion.div 
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 2, duration: 0.5 }}
      className="fixed bottom-6 right-6 z-50 flex justify-end pointer-events-none"
    >
      <div className="bg-white/95 backdrop-blur-md shadow-2xl rounded-2xl border border-orange-200 p-4 flex items-center gap-3 max-w-sm w-full pointer-events-auto">
        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 text-orange-600">
          <Store size={20} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-slate-800">Bạn là chủ cửa hàng này?</h4>
          <p className="text-xs text-slate-500 truncate">Nhận quyền quản lý để chỉnh sửa thông tin.</p>
        </div>
        <Link href={`/claim?shop=${shopSlug}`} className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold px-4 py-2 rounded-xl whitespace-nowrap transition-colors">
          Nhận Ngay
        </Link>
      </div>
    </motion.div>
  )
}
