'use client'

import React, { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle2, Store } from 'lucide-react'

export default function ClaimPage() {
  const searchParams = useSearchParams()
  const shopSlug = searchParams.get('shop') || ''
  
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Giả lập xử lý gửi yêu cầu
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6 pt-24">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center space-y-6">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Yêu cầu đã được gửi!</h1>
          <p className="text-slate-600 text-sm">
            Đội ngũ 1Fashion.asia sẽ liên hệ với bạn trong vòng 24h để xác minh thông tin và cấp quyền quản trị viên cho cửa hàng.
          </p>
          <div className="pt-4">
            <Link href="/" className="inline-flex items-center justify-center w-full py-3 px-4 bg-[#D4AF37] text-white rounded-xl font-bold hover:bg-[#B8860B] transition-colors">
              Quay lại Trang Chủ
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6 pt-24">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 space-y-8">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Store size={24} />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Nhận Cửa Hàng</h1>
          <p className="text-slate-500 text-sm">
            Xác minh bạn là chủ sở hữu để toàn quyền quản lý hình ảnh, sản phẩm và thông tin của <strong>{shopSlug || 'cửa hàng này'}</strong>.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Họ và tên</label>
            <input 
              required
              type="text" 
              placeholder="Nguyễn Văn A" 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Số điện thoại / Zalo</label>
            <input 
              required
              type="tel" 
              placeholder="0909..." 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Email (Không bắt buộc)</label>
            <input 
              type="email" 
              placeholder="email@example.com" 
              className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
            />
          </div>

          <button type="submit" className="w-full py-3 px-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors mt-6">
            Gửi Yêu Cầu Xác Minh
          </button>
        </form>

        <p className="text-xs text-center text-slate-400">
          Bằng việc gửi yêu cầu, bạn đồng ý với các Điều khoản dịch vụ của 1Fashion.asia.
        </p>
      </div>
    </main>
  )
}
