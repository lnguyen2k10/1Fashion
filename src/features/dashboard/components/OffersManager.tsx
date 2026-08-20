'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Edit2, Trash2, Loader2, Image as ImageIcon } from 'lucide-react'
import { ImagePickerModal } from '@/features/editor/components/ImagePickerModal'
import Image from 'next/image'

interface Offer {
  id: string
  business_id: string
  title: string
  description: string
  discount_code: string
  image_url: string
  status: string
  valid_until: string
}

export function OffersManager({ businessId }: { businessId: string }) {
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isImagePickerOpen, setIsImagePickerOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  
  const [editingOffer, setEditingOffer] = useState<Partial<Offer> | null>(null)
  
  const supabase = createClient()

  useEffect(() => {
    fetchOffers()
  }, [businessId])

  const fetchOffers = async () => {
    try {
      const { data, error } = await supabase
        .from('business_offers')
        .select('*')
        .eq('business_id', businessId)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setOffers(data || [])
    } catch (error) {
      console.error('Error fetching offers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingOffer?.title) return
    
    setSaving(true)
    try {
      const payload = {
        title: editingOffer.title,
        description: editingOffer.description,
        discount_code: editingOffer.discount_code,
        image_url: editingOffer.image_url,
        status: editingOffer.status || 'active',
        valid_until: editingOffer.valid_until || null
      }

      if (editingOffer.id) {
        const { error } = await supabase
          .from('business_offers')
          .update({...payload, updated_at: new Date().toISOString()})
          .eq('id', editingOffer.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('business_offers')
          .insert({
            business_id: businessId,
            ...payload
          })
        if (error) throw error
      }
      setIsModalOpen(false)
      fetchOffers()
    } catch (error: any) {
      alert('Lỗi khi lưu ưu đãi: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa mã ưu đãi này?')) return
    
    try {
      const { error } = await supabase.from('business_offers').delete().eq('id', id)
      if (error) throw error
      setOffers(offers.filter(o => o.id !== id))
    } catch (error: any) {
      alert('Lỗi khi xóa: ' + error.message)
    }
  }

  const openNewModal = () => {
    setEditingOffer({
      title: '',
      description: '',
      discount_code: '',
      image_url: '',
      status: 'active',
      valid_until: ''
    })
    setIsModalOpen(true)
  }

  if (loading) return <div className="py-12 flex justify-center"><Loader2 className="animate-spin text-[#D4AF37]" /></div>

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-[#2F2F2F]">Mã Ưu Đãi & Khuyến Mãi</h2>
          <p className="text-sm text-zinc-500 mt-1">Tạo và quản lý các chương trình khuyến mãi cho khách hàng.</p>
        </div>
        <button 
          onClick={openNewModal}
          className="bg-[#2F2F2F] text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-black transition-colors shadow-sm hover:shadow"
        >
          <Plus size={16} /> Thêm Ưu Đãi
        </button>
      </div>

      <div className="bg-white border border-[#D4AF37]/20 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#fcfaf5] border-b border-[#D4AF37]/20 text-[#D4AF37] uppercase text-[10px] font-bold tracking-widest">
              <tr>
                <th className="px-6 py-4">Chương trình</th>
                <th className="px-6 py-4">Mã giảm giá</th>
                <th className="px-6 py-4">Thời hạn</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D4AF37]/10">
              {offers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="mx-auto w-12 h-12 bg-zinc-50 rounded-full flex items-center justify-center mb-3">
                      <ImageIcon size={20} className="text-zinc-300" />
                    </div>
                    <p className="text-zinc-500 font-medium">Chưa có ưu đãi nào</p>
                    <p className="text-xs text-zinc-400 mt-1">Hãy tạo mã giảm giá đầu tiên để thu hút khách hàng.</p>
                  </td>
                </tr>
              ) : (
                offers.map(offer => (
                  <tr key={offer.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-10 rounded-lg bg-zinc-100 overflow-hidden relative flex-shrink-0 border border-zinc-200">
                          {offer.image_url ? (
                            <Image src={offer.image_url} alt={offer.title} fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-zinc-400"><ImageIcon size={14} /></div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-[#2F2F2F]">{offer.title}</p>
                          <p className="text-xs text-zinc-500 line-clamp-1 mt-0.5">{offer.description || 'Không có mô tả'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {offer.discount_code ? (
                        <span className="font-mono text-sm font-bold text-[#D4AF37] bg-[#D4AF37]/10 px-3 py-1 rounded-md border border-[#D4AF37]/20">
                          {offer.discount_code}
                        </span>
                      ) : (
                        <span className="text-zinc-400 text-xs">Không có mã</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-zinc-600 text-xs">
                      {offer.valid_until ? new Date(offer.valid_until).toLocaleDateString('vi-VN') : 'Không giới hạn'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button 
                          onClick={() => { setEditingOffer(offer); setIsModalOpen(true); }}
                          className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-[#D4AF37] hover:bg-[#D4AF37]/10 rounded-lg transition-colors"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          onClick={() => handleDelete(offer.id)}
                          className="w-8 h-8 flex items-center justify-center text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && editingOffer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200 border border-white/20">
            <div className="p-6 md:p-8 border-b border-zinc-100 flex justify-between items-center sticky top-0 bg-white/80 backdrop-blur-xl z-10">
              <div>
                <h3 className="text-2xl font-light text-[#2F2F2F]">
                  {editingOffer.id ? 'Sửa Ưu Đãi' : 'Thêm Ưu Đãi Mới'}
                </h3>
                <p className="text-sm text-zinc-500 mt-1">Cấu hình khuyến mãi cho khách hàng của bạn.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="w-10 h-10 flex items-center justify-center bg-zinc-100 hover:bg-zinc-200 text-zinc-500 rounded-full transition-colors">
                <span className="text-xl leading-none">&times;</span>
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 md:p-8 space-y-8">
              <div className="grid grid-cols-1 gap-8">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Tên chương trình *</label>
                  <input 
                    required
                    type="text" 
                    placeholder="VD: Giảm giá 20% bộ sưu tập hè"
                    value={editingOffer.title || ''} 
                    onChange={e => setEditingOffer({...editingOffer, title: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] transition-all bg-zinc-50/50"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-5">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Mã giảm giá (Code)</label>
                      <input 
                        type="text" 
                        placeholder="VD: SUMMER20 (Không bắt buộc)"
                        value={editingOffer.discount_code || ''} 
                        onChange={e => setEditingOffer({...editingOffer, discount_code: e.target.value})}
                        className="w-full px-4 py-3 font-mono text-sm uppercase rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] transition-all bg-zinc-50/50"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Hạn sử dụng</label>
                      <input 
                        type="date" 
                        value={editingOffer.valid_until ? editingOffer.valid_until.split('T')[0] : ''} 
                        onChange={e => setEditingOffer({...editingOffer, valid_until: e.target.value ? new Date(e.target.value).toISOString() : ''})}
                        className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] transition-all bg-zinc-50/50"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Banner / Hình ảnh</label>
                    <div 
                      onClick={() => setIsImagePickerOpen(true)}
                      className="w-full aspect-[2/1] rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50/80 flex flex-col items-center justify-center cursor-pointer hover:border-[#D4AF37] hover:bg-[#D4AF37]/5 transition-all relative overflow-hidden group"
                    >
                      {editingOffer.image_url ? (
                        <>
                          <Image src={editingOffer.image_url} alt="Preview" fill className="object-cover transition-transform group-hover:scale-105" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <span className="text-white font-medium text-sm bg-black/50 px-4 py-2 rounded-full backdrop-blur-md">Thay đổi ảnh</span>
                          </div>
                        </>
                      ) : (
                        <div className="text-center text-zinc-400 p-4">
                          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm">
                            <ImageIcon size={20} className="text-[#D4AF37]" />
                          </div>
                          <p className="text-xs font-medium text-[#2F2F2F]">Tải banner ưu đãi</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2">Mô tả chi tiết</label>
                  <textarea 
                    rows={4}
                    placeholder="Nhập điều kiện áp dụng, chi tiết khuyến mãi..."
                    value={editingOffer.description || ''} 
                    onChange={e => setEditingOffer({...editingOffer, description: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] transition-all bg-zinc-50/50 resize-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-zinc-100">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-6 py-3 rounded-xl text-[#2F2F2F] bg-zinc-100 hover:bg-zinc-200 font-bold transition-colors"
                >
                  Hủy bỏ
                </button>
                <button 
                  type="submit"
                  disabled={saving}
                  className="px-8 py-3 rounded-xl bg-[#D4AF37] text-[#2F2F2F] font-bold hover:bg-[#C5A028] hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
                >
                  {saving ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                  Lưu Ưu Đãi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ImagePickerModal 
        isOpen={isImagePickerOpen}
        onClose={() => setIsImagePickerOpen(false)}
        currentUrl={editingOffer?.image_url}
        onSelect={(url) => {
          setEditingOffer(prev => prev ? {...prev, image_url: url} : null)
          setIsImagePickerOpen(false)
        }}
      />
    </div>
  )
}
