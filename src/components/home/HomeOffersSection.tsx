import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Clock, Zap, ArrowRight } from 'lucide-react'
import { ClientCopyButton } from '@/app/(public)/offers/ClientCopyButton'

interface HomeOffersSectionProps {
  offers: any[]
}

export function HomeOffersSection({ offers }: HomeOffersSectionProps) {

  return (
    <section className="relative overflow-hidden bg-white py-16 sm:py-24">
      {/* Background decorations */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-[#D4AF37]/5 blur-3xl transform skew-x-12 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-1/4 h-1/2 bg-black/5 blur-3xl rounded-full pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-8 flex flex-col justify-between gap-4 md:mb-12 md:flex-row md:items-end md:gap-6">
          <div className="max-w-2xl">
            <span className="text-[#D4AF37] tracking-[0.3em] uppercase text-[10px] font-bold block mb-3">
              Ưu Đãi Độc Quyền
            </span>
            <h2 className="font-playfair text-3xl font-bold tracking-tight text-[#1A1A1A] md:text-5xl">
              Khuyến Mãi <span className="italic text-[#D4AF37] font-light">Mới Nhất</span>
            </h2>
          </div>
          <Link 
            href="/offers" 
            className="flex items-center gap-2 text-sm font-bold text-[#1A1A1A] hover:text-[#D4AF37] transition-colors group tracking-wider uppercase"
          >
            Xem tất cả ưu đãi
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {offers.length === 0 ? (
          <div className="text-center py-16 bg-gray-50 rounded-3xl border border-dashed border-[#D4AF37]/30">
            <p className="text-4xl mb-3">🎁</p>
            <p className="text-sm font-semibold text-gray-500">Chưa có ưu đãi nào.</p>
            <p className="text-xs text-gray-400 mt-1">Các shop hãy thêm ưu đãi trong Dashboard!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
            {offers.map((offer) => (
              <div key={offer.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl hover:border-[#D4AF37]/30 transition-all duration-500 group relative flex flex-col">
                
                {/* Image Header */}
                <div className="aspect-[16/9] overflow-hidden relative bg-gray-50">
                  <Image 
                    src={offer.image_url || 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80'} 
                    alt={offer.title} 
                    fill
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                  />
                  <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold text-[#D4AF37] flex items-center gap-1 shadow-lg uppercase tracking-widest">
                    <Zap size={12} fill="currentColor" /> HOT
                  </div>
                </div>

                {/* Business Meta (Overlapping) */}
                <div className="px-6 -mt-6 relative z-10 flex items-center justify-between">
                  <div className="w-12 h-12 rounded-full border-[3px] border-white bg-white shadow-md overflow-hidden">
                     <Image 
                       src={offer.business_profiles?.logo_url || 'https://i.imgur.com/oIeQ21A.png'} 
                       alt="Logo" 
                       width={48} height={48} 
                       className="w-full h-full object-cover" 
                     />
                  </div>
                  <Link 
                    href={`/${offer.business_profiles?.slug}`} 
                    className="bg-[#1A1A1A] text-white text-[9px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full hover:bg-[#D4AF37] hover:text-black transition-colors"
                  >
                    Tới Cửa Hàng
                  </Link>
                </div>

                {/* Body Content */}
                <div className="p-6 flex-1 flex flex-col pt-4">
                  <div className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest mb-2 truncate">
                    {offer.business_profiles?.business_name}
                  </div>
                  <h3 className="text-xl font-bold font-serif mb-3 text-gray-900 line-clamp-2 leading-snug group-hover:text-[#D4AF37] transition-colors">{offer.title}</h3>
                  <p className="text-gray-500 text-sm mb-6 flex-1 line-clamp-2 leading-relaxed">{offer.description}</p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className="flex items-center gap-1.5 text-[11px] text-gray-500 font-bold uppercase tracking-wider">
                      <Clock size={14} className="text-[#D4AF37]" /> HSD: {new Date(offer.valid_until).toLocaleDateString('vi-VN')}
                    </span>
                    <ClientCopyButton code={offer.discount_code} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
