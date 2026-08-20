'use client'

import Link from 'next/link'
import { X } from 'lucide-react'

interface PaymentPopupProps {
  isOpen: boolean
  onClose: () => void
  onConfirm?: () => void
  planName?: string
  amount?: string
}

// Payment submission intentionally lives in the authenticated billing page.
// Keeping this component as a safe compatibility dialog avoids client-side subscription writes.
export const PaymentPopup = ({ isOpen, onClose }: PaymentPopupProps) => {
  if (!isOpen) return null
  return <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true">
    <div className="w-full max-w-md rounded-2xl bg-white p-6 text-center shadow-2xl">
      <button aria-label="Đóng" onClick={onClose} className="float-right text-zinc-500"><X size={20} /></button>
      <h2 className="pt-4 text-xl font-bold">Thanh toán gói dịch vụ</h2>
      <p className="mt-3 text-sm text-zinc-600">Để gửi biên lai và theo dõi trạng thái duyệt thủ công, hãy mở trang thanh toán của shop.</p>
      <Link onClick={onClose} href="/dashboard/billing" className="mt-6 inline-block rounded-xl bg-[#2F2F2F] px-5 py-3 text-sm font-semibold text-white">Đi đến thanh toán</Link>
    </div>
  </div>
}
