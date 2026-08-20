'use client'

import React from 'react'
import Image from 'next/image'
import { Tag, Calendar, Plus, ImageIcon } from 'lucide-react'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { ImagePickerModal } from '@/features/editor/components/ImagePickerModal'

interface Offer {
  id?: string
  title: string
  description?: string
  image_url?: string
  discount_code?: string
  valid_until?: string
  status?: string
}

interface OffersSectionProps {
  businessId?: string
  offers: Offer[]
  sectionTitle?: string
  themeColor?: string
  isEditing?: boolean
}

function formatDate(dateStr?: string) {
  if (!dateStr) return null
  try {
    return new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })
  } catch {
    return null
  }
}

export function OffersSection({ businessId, offers, sectionTitle, themeColor = '#D4AF37', isEditing }: OffersSectionProps) {
  const [localOffers, setLocalOffers] = React.useState<Offer[]>(offers || [])
  const [pickerOpen, setPickerOpen] = React.useState(false)
  const [pickingOfferIdx, setPickingOfferIdx] = React.useState<number | null>(null)
  const activeOffers = localOffers.filter(o => o.status !== 'expired')
  const supabase = createClient()
  const router = useRouter()

  React.useEffect(() => {
    setLocalOffers(offers || [])
  }, [offers])

  const handleUpdateOffer = async (index: number, field: string, value: any) => {
    const offer = activeOffers[index]
    const previousOffers = localOffers
    if (!offer || !offer.id || !businessId) return

    // Optimistic update
    const newOffers = [...localOffers]
    const localIndex = localOffers.findIndex(o => o.id === offer.id)
    if (localIndex > -1) {
      newOffers[localIndex] = { ...newOffers[localIndex], [field]: value }
      setLocalOffers(newOffers)
    }

    try {
      const { error } = await supabase.from('business_offers').update({ [field]: value }).eq('id', offer.id)
      if (error) throw error
      router.refresh()
    } catch(err) {
      setLocalOffers(previousOffers)
      toast.error('Lỗi cập nhật ưu đãi')
    }
  }

  const handleAddOffer = async () => {
    if (!businessId) {
      toast.error('Thiếu thông định doanh nghiệp.')
      return
    }

    const newOffer = {
      business_id: businessId,
      title: 'Tên Ưu Đãi Mới',
      description: 'Mô tả chi tiết ưu đãi...',
      status: 'active'
    }

    try {
      const { data, error } = await supabase.from('business_offers').insert([newOffer]).select().single()
      if (error) throw error
      
      // Optimistic update
      setLocalOffers(prev => [data, ...prev])
      toast.success('Đã thêm ưu đãi mới!')
      router.refresh()
    } catch (err: any) {
      toast.error('Lỗi thêm ưu đãi: ' + err.message)
    }
  }

  if (activeOffers.length === 0) {
    if (!isEditing) return null
    return (
      <section className="py-16 px-4 bg-white" id="offers">
        <div className="max-w-5xl mx-auto text-center">
          <span className="text-xs font-mono tracking-[0.3em] uppercase" style={{ color: themeColor }}>Ưu Đãi</span>
          <h2 className="text-2xl font-bold mt-2 mb-8 text-gray-800">Khuyến Mãi</h2>
          <div 
            onClick={handleAddOffer}
            className="border-2 border-dashed border-gray-200 rounded-2xl p-12 text-gray-400 cursor-pointer hover:border-[#D4AF37] hover:bg-[#D4AF37]/5 transition-all"
          >
            <Plus size={40} className="mx-auto mb-3 text-gray-400" />
            <p className="font-bold text-sm text-gray-600">Thêm Ưu Đãi Trực Tiếp</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-white px-4 py-12 sm:py-16">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="block text-[10px] font-mono tracking-[0.4em] uppercase mb-3" style={{ color: themeColor }}>
            — Khuyến Mãi
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] tracking-tight">
            {sectionTitle || <>Ưu Đãi <span className="italic font-light">Đặc Biệt</span></>}
          </h2>
        </div>

        {/* Offers Grid */}
        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {activeOffers.map((offer, idx) => (
            <div
              key={offer.id || idx}
              className="group relative bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-1"
            >
              {/* Offer Image */}
              {offer.image_url ? (
                <div className="relative h-44 overflow-hidden">
                  <Image
                    src={offer.image_url}
                    alt={offer.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  {isEditing && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <button
                        onClick={() => {
                          setPickingOfferIdx(idx)
                          setPickerOpen(true)
                        }}
                        className="bg-white text-black px-6 py-3 rounded-full font-bold shadow-lg flex items-center gap-2 hover:scale-105 transition-transform"
                      >
                        <ImageIcon size={18} /> Thay ảnh
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div
                  className="h-44 flex items-center justify-center relative group-hover:bg-opacity-90"
                  style={{ background: `linear-gradient(135deg, ${themeColor}, ${themeColor}80)` }}
                >
                  <span className="text-4xl font-bold text-white">🎁</span>
                  {isEditing && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <button
                        onClick={() => {
                          setPickingOfferIdx(idx)
                          setPickerOpen(true)
                        }}
                        className="bg-white text-black px-6 py-3 rounded-full font-bold shadow-lg flex items-center gap-2 hover:scale-105 transition-transform"
                      >
                        <ImageIcon size={18} /> Thêm ảnh
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Offer Content */}
              <div className="p-5">
                {isEditing ? (
                  <h3
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={e => handleUpdateOffer(idx, 'title', e.currentTarget.textContent)}
                    className="font-bold text-[#1A1A1A] text-base leading-snug mb-2 outline-none border-b border-dashed border-gray-300"
                  >
                    {offer.title}
                  </h3>
                ) : (
                  <h3 className="font-bold text-[#1A1A1A] text-base leading-snug mb-2">{offer.title}</h3>
                )}

                {isEditing ? (
                  <p
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={e => handleUpdateOffer(idx, 'description', e.currentTarget.textContent)}
                    className="text-gray-500 text-sm mb-3 outline-none border-b border-dashed border-transparent focus:border-gray-300"
                  >
                    {offer.description || 'Thêm mô tả...'}
                  </p>
                ) : offer.description && (
                  <p className="text-gray-500 text-sm mb-3 line-clamp-2">{offer.description}</p>
                )}
                
                <div className="flex items-center justify-between gap-3">
                  {/* Discount Code */}
                  {isEditing ? (
                    <div
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={e => handleUpdateOffer(idx, 'discount_code', e.currentTarget.textContent)}
                      className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold tracking-wider border border-dashed outline-none"
                      style={{ borderColor: themeColor + '60', color: themeColor, background: themeColor + '08' }}
                    >
                      {offer.discount_code || 'CODE'}
                    </div>
                  ) : offer.discount_code && (
                    <div
                      className="px-3 py-1.5 rounded-lg text-xs font-mono font-bold tracking-wider border border-dashed"
                      style={{ borderColor: themeColor + '60', color: themeColor, background: themeColor + '08' }}
                    >
                      {offer.discount_code}
                    </div>
                  )}

                  {/* Expiry */}
                  {isEditing ? (
                    <div className="flex items-center gap-1 text-gray-400 text-xs">
                      <Calendar size={11} />
                      Hạn: <span
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={e => handleUpdateOffer(idx, 'valid_until', e.currentTarget.textContent)}
                        className="outline-none border-b border-dashed border-gray-300"
                      >{offer.valid_until || '2025-12-31'}</span>
                    </div>
                  ) : formatDate(offer.valid_until) && (
                    <div className="flex items-center gap-1 text-gray-400 text-xs">
                      <Calendar size={11} />
                      <span suppressHydrationWarning>Hết hạn: {formatDate(offer.valid_until)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Accent border top */}
              <div className="absolute top-0 inset-x-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{ background: `linear-gradient(to right, ${themeColor}, ${themeColor}60)` }} />
            </div>
          ))}

          {/* Add Offer Card (Editing Only) */}
          {isEditing && (
            <div
              onClick={handleAddOffer}
              className="cursor-pointer bg-white/50 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border-2 border-dashed border-gray-200 hover:border-[#D4AF37] hover:bg-[#D4AF37]/5 flex flex-col items-center justify-center min-h-[280px]"
            >
              <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-400 mb-4 transition-transform group-hover:scale-110">
                <Plus size={32} />
              </div>
              <span className="font-bold text-gray-600 text-sm">Thêm Ưu Đãi Mới</span>
            </div>
          )}
        </div>
      </div>
      
      <ImagePickerModal 
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        businessId={businessId}
        currentUrl={pickingOfferIdx !== null && activeOffers[pickingOfferIdx] ? activeOffers[pickingOfferIdx].image_url || '' : ''}
        onSelect={(url) => {
          if (pickingOfferIdx !== null) {
            handleUpdateOffer(pickingOfferIdx, 'image_url', url)
          }
          setPickerOpen(false)
        }}
      />
    </section>
  )
}
