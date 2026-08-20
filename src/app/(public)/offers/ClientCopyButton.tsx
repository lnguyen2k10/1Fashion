'use client'

import React from 'react'
import toast from 'react-hot-toast'

export function ClientCopyButton({ code }: { code: string }) {
  return (
    <button 
      onClick={() => {
        navigator.clipboard.writeText(code)
        toast.success(`Đã copy mã: ${code}`)
      }} 
      className="text-xs font-bold px-4 py-2 rounded-full border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-white transition-colors uppercase tracking-wider"
    >
      Nhận Ngay
    </button>
  )
}
