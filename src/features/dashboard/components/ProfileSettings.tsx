'use client'

import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast';
import Image from 'next/image'
import { useFileUpload } from '@/hooks/useFileUpload'
import { createClient } from '@/lib/supabase/client'
import { Camera, Save, Loader2 } from 'lucide-react'
import { fetchCategories } from '@/lib/services/categories'
import type { SiteCategory } from '@/types/landing-page'

export function ProfileSettings({ profile, onUpdate }: { profile: any, onUpdate: (data: any) => void }) {
  const [isSaving, setIsSaving] = React.useState(false)
  const [form, setForm] = React.useState(profile)
  const [socials, setSocials] = React.useState<any>(profile.social_links || {})
  const [categories, setCategories] = useState<SiteCategory[]>([])
  const [systemLocations, setSystemLocations] = useState<any[]>([])
  const { uploadFile, isUploading } = useFileUpload()
  const supabase = createClient()
  const selectedCategories = Array.isArray(form.categories) ? form.categories : (form.category ? [form.category] : [])
  const toggleCategory = (name: string) => setForm({ ...form, categories: selectedCategories.includes(name) ? selectedCategories.filter((item: string) => item !== name) : [...selectedCategories, name] })

  useEffect(() => {
    fetchCategories().then(setCategories)
    
    // Fetch system locations
    supabase.from('system_locations').select('*').eq('is_active', true).order('sort_order', { ascending: true })
      .then(({ data }) => setSystemLocations(data || []))
  }, [])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const url = await uploadFile(file, field === 'logo_url' ? 'logo' : 'avatar')
      if (url) {
        setForm({ ...form, [field]: url })
      }
    } catch (err: any) {
      toast(err.message)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    const { error } = await supabase
      .from('business_profiles')
      .update({
        business_name: form.business_name,
        slug: form.slug,
        category: selectedCategories[0] || 'Chưa phân loại',
        categories: selectedCategories,
        location_city: form.location_city,
        location_district: form.location_district,
        location_ward: form.location_ward,
        address_full: form.address_full,
        email_contact: form.email_contact,
        operating_hours_text: form.operating_hours_text,
        zalo_phone: form.zalo_phone,
        hotline: form.hotline,
        social_links: socials,
        logo_url: form.logo_url
      })
      .eq('id', profile.id)

    setIsSaving(false)
    if (!error) {
      toast.success('Cập nhật thành công!')
      onUpdate({...form, social_links: socials})
    } else {
      toast('Lỗi: ' + error.message)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl border border-[#D4AF37]/10 shadow-sm">
      <div className="flex items-center gap-6 pb-6 border-b border-[#D4AF37]/10">
        <div className="relative group">
          <div className="w-24 h-24 rounded-lg bg-[#FDFBF7] border border-[#D4AF37]/10 overflow-hidden">
            {form.logo_url ? (
              <Image src={form.logo_url} alt="Logo" width={96} height={96} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#2F2F2F]/40 text-xs text-center p-2">No Logo</div>
            )}
          </div>
          <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
            <Camera size={20} className="text-white" />
            <input type="file" className="hidden" onChange={(e) => handleUpload(e, 'logo_url')} disabled={isUploading} />
          </label>
        </div>
        <div>
          <h3 className="text-lg font-bold text-[#2F2F2F]">{form.business_name || 'Tên doanh nghiệp'}</h3>
          <p className="text-xs text-[#2F2F2F]/60">Cập nhật logo và thông tin cơ bản của bạn</p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Basic Info */}
        <div>
          <h4 className="text-sm font-bold text-[#2F2F2F] mb-4 pb-2 border-b border-[#D4AF37]/10">Thông tin cơ bản</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-mono text-[#2F2F2F]/60 uppercase tracking-widest">Tên Thương Hiệu</label>
              <input 
                value={form.business_name} 
                onChange={e => setForm({...form, business_name: e.target.value})}
                className="w-full bg-[#FDFBF7] border border-[#D4AF37]/10 rounded-lg p-2.5 text-sm text-[#2F2F2F] focus:border-[#D4AF37] outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-mono text-[#2F2F2F]/60 uppercase tracking-widest">Đường dẫn (Slug)</label>
              <input 
                value={form.slug} 
                onChange={e => setForm({...form, slug: e.target.value})}
                className="w-full bg-[#FDFBF7] border border-[#D4AF37]/10 rounded-lg p-2.5 text-sm text-[#2F2F2F] focus:border-[#D4AF37] outline-none"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-mono text-[#2F2F2F]/60 uppercase tracking-widest">Lĩnh vực kinh doanh</label>
              <div className="flex flex-wrap gap-2 rounded-lg border border-[#D4AF37]/10 bg-[#FDFBF7] p-2.5">
                {categories.length === 0 ? <span className="text-xs text-[#2F2F2F]/50">Đang tải danh mục...</span> : categories.map(cat => <label key={cat.slug} className={`cursor-pointer rounded-full px-3 py-1.5 text-xs ${selectedCategories.includes(cat.name) ? 'bg-[#D4AF37]/15 text-[#9c7a1c]' : 'bg-white text-[#2F2F2F]/60'}`}><input type="checkbox" className="sr-only" checked={selectedCategories.includes(cat.name)} onChange={() => toggleCategory(cat.name)} />{cat.icon} {cat.name}</label>)}
              </div>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div>
          <h4 className="text-sm font-bold text-[#2F2F2F] mb-4 pb-2 border-b border-[#D4AF37]/10">Thông tin liên hệ</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-mono text-[#2F2F2F]/60 uppercase tracking-widest">Hotline</label>
              <input 
                value={form.hotline || ''} 
                onChange={e => setForm({...form, hotline: e.target.value})}
                placeholder="0909 123 456"
                className="w-full bg-[#FDFBF7] border border-[#D4AF37]/10 rounded-lg p-2.5 text-sm text-[#2F2F2F] focus:border-[#D4AF37] outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-mono text-[#2F2F2F]/60 uppercase tracking-widest">Zalo</label>
              <input 
                value={form.zalo_phone || ''} 
                onChange={e => setForm({...form, zalo_phone: e.target.value})}
                placeholder="0909 123 456"
                className="w-full bg-[#FDFBF7] border border-[#D4AF37]/10 rounded-lg p-2.5 text-sm text-[#2F2F2F] focus:border-[#D4AF37] outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-mono text-[#2F2F2F]/60 uppercase tracking-widest">Email</label>
              <input 
                type="email"
                value={form.email_contact || ''} 
                onChange={e => setForm({...form, email_contact: e.target.value})}
                placeholder="contact@shop.com"
                className="w-full bg-[#FDFBF7] border border-[#D4AF37]/10 rounded-lg p-2.5 text-sm text-[#2F2F2F] focus:border-[#D4AF37] outline-none"
              />
            </div>
          </div>
        </div>

        {/* Location Info */}
        <div>
          <h4 className="text-sm font-bold text-[#2F2F2F] mb-4 pb-2 border-b border-[#D4AF37]/10">Địa chỉ cửa hàng</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-mono text-[#2F2F2F]/60 uppercase tracking-widest">Thành phố</label>
              <select
                value={form.location_city || ''}
                onChange={e => setForm({...form, location_city: e.target.value})}
                className="w-full bg-[#FDFBF7] border border-[#D4AF37]/10 rounded-lg p-2.5 text-sm text-[#2F2F2F] focus:border-[#D4AF37] outline-none appearance-none"
              >
                <option value="">-- Chọn Thành phố --</option>
                {systemLocations.map(loc => (
                  <option key={loc.id} value={loc.name}>{loc.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-mono text-[#2F2F2F]/60 uppercase tracking-widest">Quận / Huyện</label>
              <input 
                value={form.location_district || ''} 
                onChange={e => setForm({...form, location_district: e.target.value})}
                placeholder="Quận 1"
                className="w-full bg-[#FDFBF7] border border-[#D4AF37]/10 rounded-lg p-2.5 text-sm text-[#2F2F2F] focus:border-[#D4AF37] outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-mono text-[#2F2F2F]/60 uppercase tracking-widest">Phường / Xã</label>
              <input 
                value={form.location_ward || ''} 
                onChange={e => setForm({...form, location_ward: e.target.value})}
                placeholder="Phường Bến Nghé"
                className="w-full bg-[#FDFBF7] border border-[#D4AF37]/10 rounded-lg p-2.5 text-sm text-[#2F2F2F] focus:border-[#D4AF37] outline-none"
              />
            </div>
            <div className="space-y-2 md:col-span-3">
              <label className="text-[10px] font-mono text-[#2F2F2F]/60 uppercase tracking-widest">Địa chỉ chi tiết (Số nhà, Tên đường)</label>
              <input 
                value={form.address_full || ''} 
                onChange={e => setForm({...form, address_full: e.target.value})}
                placeholder="Số 1, Đường Lê Duẩn"
                className="w-full bg-[#FDFBF7] border border-[#D4AF37]/10 rounded-lg p-2.5 text-sm text-[#2F2F2F] focus:border-[#D4AF37] outline-none"
              />
            </div>
          </div>
        </div>

        {/* Operating Hours */}
        <div>
          <h4 className="text-sm font-bold text-[#2F2F2F] mb-4 pb-2 border-b border-[#D4AF37]/10">Giờ hoạt động</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <label className="text-[10px] font-mono text-[#2F2F2F]/60 uppercase tracking-widest">Lịch mở cửa</label>
              <input 
                value={form.operating_hours_text || ''} 
                onChange={e => setForm({...form, operating_hours_text: e.target.value})}
                placeholder="VD: Thứ 2 - Chủ Nhật: 08:00 - 22:00"
                className="w-full bg-[#FDFBF7] border border-[#D4AF37]/10 rounded-lg p-2.5 text-sm text-[#2F2F2F] focus:border-[#D4AF37] outline-none"
              />
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div>
          <h4 className="text-sm font-bold text-[#2F2F2F] mb-4 pb-2 border-b border-[#D4AF37]/10">Mạng xã hội & Web</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-mono text-[#2F2F2F]/60 uppercase tracking-widest">Website</label>
              <input 
                value={socials.website || ''} 
                onChange={e => setSocials({...socials, website: e.target.value})}
                placeholder="https://myshop.com"
                className="w-full bg-[#FDFBF7] border border-[#D4AF37]/10 rounded-lg p-2.5 text-sm text-[#2F2F2F] focus:border-[#D4AF37] outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-mono text-[#2F2F2F]/60 uppercase tracking-widest">Facebook</label>
              <input 
                value={socials.facebook || ''} 
                onChange={e => setSocials({...socials, facebook: e.target.value})}
                placeholder="https://facebook.com/..."
                className="w-full bg-[#FDFBF7] border border-[#D4AF37]/10 rounded-lg p-2.5 text-sm text-[#2F2F2F] focus:border-[#D4AF37] outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-mono text-[#2F2F2F]/60 uppercase tracking-widest">Instagram</label>
              <input 
                value={socials.instagram || ''} 
                onChange={e => setSocials({...socials, instagram: e.target.value})}
                placeholder="https://instagram.com/..."
                className="w-full bg-[#FDFBF7] border border-[#D4AF37]/10 rounded-lg p-2.5 text-sm text-[#2F2F2F] focus:border-[#D4AF37] outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-mono text-[#2F2F2F]/60 uppercase tracking-widest">TikTok</label>
              <input 
                value={socials.tiktok || ''} 
                onChange={e => setSocials({...socials, tiktok: e.target.value})}
                placeholder="https://tiktok.com/@..."
                className="w-full bg-[#FDFBF7] border border-[#D4AF37]/10 rounded-lg p-2.5 text-sm text-[#2F2F2F] focus:border-[#D4AF37] outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      <button 
        type="submit" 
        disabled={isSaving || isUploading}
        className="w-full py-3 bg-[#D4AF37] hover:bg-[#C59B27] text-white font-bold rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
      >
        {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
        Lưu Thay Đổi
      </button>
    </form>
  )
}
