'use client'

import { useSearchParams } from 'next/navigation'
import React, { Suspense } from 'react'
import Link from 'next/link'
import { MarketTemplate } from '@/features/landing-pages/templates/market-v1/MarketTemplate'
import { DEFAULT_SHOP_CONTENT, DEFAULT_THEME_COLOR } from '@/lib/constants'

function PreviewContent() {
  const searchParams = useSearchParams()
  const type = searchParams.get('template')

  const renderTemplate = () => {
    const dummyProps = {
      data: {},
      isEditing: false,
      onUpdate: () => {},
      businessInfo: {
        name: '1Fashion Preview',
        category: 'Thời Trang',
        district: 'Quận 1',
        city: 'TP. Hồ Chí Minh',
        logo_url: '',
        is_verified: true,
        lat: null,
        lng: null,
        address_full: ''
      }
    }

    if (type) {
      return (
        <MarketTemplate 
          {...dummyProps} 
          defaults={{
            ...DEFAULT_SHOP_CONTENT,
            themeColor: DEFAULT_THEME_COLOR
          }}
        />
      )
    }

    switch (type) {
      default:
        return (
          <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
              <h1 className="text-2xl font-bold text-slate-800 mb-6">1Fashion Elite Templates</h1>
              <div className="space-y-4">
                <Link href="/preview?template=Fashion" className="block w-full py-4 bg-orange-50 text-orange-800 font-bold rounded-xl border border-orange-200 hover:bg-orange-100 transition-all">
                  👗 Fashion Boutique (Trầm Ấm)
                </Link>
                <Link href="/preview?template=Jewelry" className="block w-full py-4 bg-yellow-50 text-yellow-800 font-bold rounded-xl border border-yellow-200 hover:bg-yellow-100 transition-all">
                  💎 Jewelry & Accessories (Vàng Gold)
                </Link>
                <Link href="/preview?template=Shoes" className="block w-full py-4 bg-cyan-50 text-cyan-800 font-bold rounded-xl border border-cyan-200 hover:bg-cyan-100 transition-all">
                  👠 Designer Shoes (Sáng)
                </Link>
              </div>
            </div>
          </div>
        )
    }
  }

  return <main>{renderTemplate()}</main>
}

export default function PreviewPage() {
  return (
    <Suspense fallback={<div>Đang tải component...</div>}>
      <PreviewContent />
    </Suspense>
  )
}
