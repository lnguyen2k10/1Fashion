'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { MapPin, Phone, Mail, Globe, Clock, Send, MessageCircle, ExternalLink } from 'lucide-react'
import type { ContactInfo, SocialLink, OperatingHoursEntry } from '@/types/landing-page'
import toast from 'react-hot-toast'

interface ContactSectionProps {
  info: ContactInfo
  lat?: number | null
  lng?: number | null
  operatingHours?: OperatingHoursEntry[]
  themeColor?: string
  isEditing?: boolean
  businessId?: string
  onUpdate?: (path: string, value: any) => void
}

const DAYS_LABEL = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy']

const SOCIAL_ICONS: Record<string, { icon: string; color: string; label: string }> = {
  facebook:  { icon: '📘', color: '#1877F2', label: 'Facebook' },
  tiktok:    { icon: '🎵', color: '#000000', label: 'TikTok' },
  instagram: { icon: '📸', color: '#E1306C', label: 'Instagram' },
  youtube:   { icon: '▶️', color: '#FF0000', label: 'YouTube' },
  zalo:      { icon: '💬', color: '#0068FF', label: 'Zalo' },
  website:   { icon: '🌐', color: '#374151', label: 'Website' },
}

export function ContactSection({ info, lat, lng, operatingHours, themeColor = '#D4AF37', isEditing, businessId, onUpdate }: ContactSectionProps) {
  const socialLinks: SocialLink[] = info?.social_links || []

  // Group hours by day for display
  const sortedHours = operatingHours
    ? [...operatingHours].sort((a, b) => (a.day_of_week === 0 ? 7 : a.day_of_week) - (b.day_of_week === 0 ? 7 : b.day_of_week))
    : []

  const handleSocialUpdate = (platform: string, url: string) => {
    const currentLinks = info?.social_links || []
    let newLinks = [...currentLinks]
    
    if (!url.trim()) {
      newLinks = newLinks.filter(l => l.platform.toLowerCase() !== platform.toLowerCase())
    } else {
      const idx = newLinks.findIndex(l => l.platform.toLowerCase() === platform.toLowerCase())
      if (idx >= 0) {
        newLinks[idx].url = url
      } else {
        newLinks.push({ platform: platform.toLowerCase(), url })
      }
    }
    onUpdate?.('contact_info.social_links', newLinks)
  }

  const [msgName, setMsgName] = useState('')
  const [msgPhone, setMsgPhone] = useState('')
  const [msgContent, setMsgContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleMessageSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!businessId) {
      toast.error('Không thể gửi tin nhắn lúc này.')
      return
    }

    setIsSubmitting(true)
    const response = await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ businessId, customerName: msgName, customerPhone: msgPhone, content: msgContent }),
    })

    if (!response.ok) {
      toast.error('Có lỗi xảy ra, vui lòng thử lại sau.')
    } else {
      toast.success('Gửi tin nhắn thành công!')
      setMsgName('')
      setMsgPhone('')
      setMsgContent('')
    }
    setIsSubmitting(false)
  }

  return (
    <section className="py-16 px-4 bg-[#0F0F0F] text-white" id="contact">
      <div className="max-w-6xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="block text-[10px] font-mono tracking-[0.4em] uppercase mb-3" style={{ color: themeColor }}>
            — Tìm Chúng Tôi
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
            Liên Hệ <span className="italic font-light" style={{ color: themeColor }}>& Địa Chỉ</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left: Contact Info */}
          <div className="space-y-8">
            {/* Contact details */}
            <div className="space-y-6">
              {/* Address */}
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: themeColor + '20' }}>
                  <MapPin size={16} style={{ color: themeColor }} />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Địa Chỉ</p>
                  {isEditing ? (
                    <div
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={e => onUpdate?.('contact_info.address_full', e.currentTarget.textContent)}
                      className="text-white/80 text-sm leading-relaxed outline-none border-b border-dashed border-white/30 focus:border-[#D4AF37] transition-colors"
                    >
                      {info?.address_full || 'Nhập địa chỉ...'}
                    </div>
                  ) : (
                    <p className="text-white/80 text-sm leading-relaxed">{info?.address_full || <span className="italic opacity-50">Đang cập nhật</span>}</p>
                  )}
                </div>
              </div>

              {/* Phone */}
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: themeColor + '20' }}>
                  <Phone size={16} style={{ color: themeColor }} />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Điện Thoại</p>
                  {isEditing ? (
                    <div
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={e => onUpdate?.('contact_info.hotline', e.currentTarget.textContent)}
                      className="text-white/80 text-sm outline-none border-b border-dashed border-white/30 focus:border-[#D4AF37] transition-colors inline-block"
                    >
                      {info?.hotline || 'Nhập hotline...'}
                    </div>
                  ) : info?.hotline ? (
                    <a href={`tel:${info.hotline}`} className="text-white/80 text-sm hover:text-white transition-colors">
                      {info.hotline}
                    </a>
                  ) : (
                    <p className="text-white/80 text-sm italic opacity-50">Đang cập nhật</p>
                  )}
                </div>
              </div>

              {/* Zalo */}
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: themeColor + '20' }}>
                  <span className="font-bold text-[10px]" style={{ color: themeColor }}>ZALO</span>
                </div>
                <div className="flex-1">
                  <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Zalo Chat</p>
                  {isEditing ? (
                    <div
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={e => onUpdate?.('contact_info.zalo', e.currentTarget.textContent)}
                      className="text-white/80 text-sm outline-none border-b border-dashed border-white/30 focus:border-[#D4AF37] transition-colors inline-block"
                    >
                      {info?.zalo || 'Nhập số Zalo...'}
                    </div>
                  ) : info?.zalo ? (
                    <a href={`https://zalo.me/${info.zalo.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-50 py-4 font-bold text-blue-600 transition hover:bg-blue-100">
                      <MessageCircle size={20} />
                      Chat Zalo ngay
                    </a>
                  ) : (
                    <div className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white/5 py-4 font-bold text-white/40 cursor-not-allowed">
                      <MessageCircle size={20} />
                      Zalo chưa cập nhật
                    </div>
                  )}
                </div>
              </div>

              {/* Website */}
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{ background: themeColor + '20' }}>
                  <Globe size={16} style={{ color: themeColor }} />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] uppercase tracking-widest text-white/40 mb-1">Website</p>
                  {isEditing ? (
                    <div
                      contentEditable
                      suppressContentEditableWarning
                      onBlur={e => onUpdate?.('contact_info.website', e.currentTarget.textContent)}
                      className="text-white/80 text-sm outline-none border-b border-dashed border-white/30 focus:border-[#D4AF37] transition-colors inline-block break-all"
                    >
                      {info?.website || 'Nhập website...'}
                    </div>
                  ) : info?.website ? (
                    <a href={info.website.startsWith('http') ? info.website : `https://${info.website}`} target="_blank" rel="noopener noreferrer"
                      className="text-white/80 text-sm hover:text-white transition-colors break-all">
                      {info.website}
                    </a>
                  ) : (
                    <p className="text-white/80 text-sm italic opacity-50">Đang cập nhật</p>
                  )}
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div>
              <p className="text-[10px] uppercase tracking-widest text-white/40 mb-4">Mạng Xã Hội</p>
              {isEditing ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                  {['Facebook', 'Instagram', 'TikTok', 'YouTube'].map(platform => {
                    const currentUrl = socialLinks.find(l => l.platform.toLowerCase() === platform.toLowerCase())?.url || ''
                    const meta = SOCIAL_ICONS[platform.toLowerCase()]
                    return (
                      <div key={platform} className="flex items-center gap-2">
                        <span className="text-sm" title={meta.label}>{meta?.icon}</span>
                        <input 
                          type="text"
                          placeholder={`Link ${platform}...`}
                          defaultValue={currentUrl}
                          onBlur={(e) => handleSocialUpdate(platform, e.target.value)}
                          className="flex-1 text-sm border-b border-dashed border-white/30 focus:border-[#D4AF37] outline-none bg-transparent px-1 py-0.5 transition-colors text-white/80 placeholder:text-white/20"
                        />
                      </div>
                    )
                  })}
                </div>
              ) : (
                <div className="flex flex-wrap gap-3">
                  {['facebook', 'instagram', 'tiktok', 'youtube'].map((platform, idx) => {
                    const link = socialLinks.find(l => l.platform === platform)
                    const meta = SOCIAL_ICONS[platform]
                    const hasUrl = link && link.url && link.url.trim() !== ''
                    
                    if (hasUrl) {
                      return (
                        <a
                          key={idx}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold text-white transition-all hover:scale-105 hover:brightness-110"
                          style={{ background: meta.color + '25', border: `1px solid ${meta.color}40` }}
                        >
                          <span>{meta.icon}</span>
                          <span>{meta.label}</span>
                        </a>
                      )
                    } else {
                      // Disabled state
                      return (
                        <div
                          key={idx}
                          className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold text-white/30 bg-white/5 border border-white/10 cursor-not-allowed"
                        >
                          <span className="grayscale opacity-50">{meta.icon}</span>
                          <span>{meta.label}</span>
                        </div>
                      )
                    }
                  })}
                </div>
              )}
            </div>

            {/* Operating Hours */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Clock size={14} style={{ color: themeColor }} />
                <p className="text-[10px] uppercase tracking-widest text-white/40">Giờ Hoạt Động</p>
              </div>
              
              {sortedHours.length > 0 ? (
                <div className="space-y-2">
                  {sortedHours.map(h => (
                    <div key={h.day_of_week} className="flex justify-between text-sm">
                      <span className="text-white/60">{DAYS_LABEL[h.day_of_week]}</span>
                      <span className={h.is_closed ? 'text-red-400' : 'text-white/80'}>
                        {h.is_closed ? 'Đóng cửa' : `${h.open_time} – ${h.close_time}`}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                isEditing ? (
                  <div
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={e => onUpdate?.('contact_info.operating_hours_text', e.currentTarget.textContent)}
                    className="text-white/70 text-sm whitespace-pre-line outline-none border-b border-dashed border-white/30 focus:border-[#D4AF37] transition-colors"
                  >
                    {info?.operating_hours_text || 'Nhập giờ hoạt động...'}
                  </div>
                ) : (
                  <p className="text-white/70 text-sm whitespace-pre-line">{info?.operating_hours_text || 'Mở cửa: 09:00 - 21:00'}</p>
                )
              )}
            </div>
          </div>

          {/* Right: Message Form */}
          <div className="bg-white/5 rounded-2xl p-8 border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#D4AF37]/20 to-transparent blur-3xl" />
            <h3 className="text-xl font-playfair font-bold text-white mb-6">Gửi Tin Nhắn</h3>
            <form onSubmit={handleMessageSubmit} className="space-y-4 relative z-10">
              <div>
                <input 
                  type="text" 
                  placeholder="Họ và tên *" 
                  required
                  value={msgName}
                  onChange={e => setMsgName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#D4AF37] transition-colors"
                />
              </div>
              <div>
                <input 
                  type="tel" 
                  placeholder="Số điện thoại *" 
                  required
                  value={msgPhone}
                  onChange={e => setMsgPhone(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#D4AF37] transition-colors"
                />
              </div>
              <div>
                <textarea 
                  placeholder="Nội dung liên hệ..." 
                  rows={4}
                  required
                  value={msgContent}
                  onChange={e => setMsgContent(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#D4AF37] transition-colors resize-none"
                />
              </div>
              <button 
                type="submit"
                disabled={isSubmitting || isEditing}
                className="w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: themeColor, color: '#1A1A1A' }}
              >
                {isSubmitting ? (
                  <span className="w-5 h-5 border-2 border-[#1A1A1A] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>Gửi Liên Hệ <Send size={18} /></>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Map - Full Width Bottom */}
        <div className="mt-12 h-64 lg:h-96 rounded-2xl overflow-hidden bg-white/5 border border-white/10 relative group">
          {info?.address_full ? (
            <iframe 
              width="100%" 
              height="100%" 
              frameBorder="0" 
              style={{ border: 0, filter: 'contrast(1.1) opacity(0.9)' }} 
              src={`https://maps.google.com/maps?q=${encodeURIComponent(info.address_full)}&t=m&z=15&output=embed&iwloc=near`}
              allowFullScreen
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-white/40">
              <MapPin size={32} className="mb-2 opacity-50" />
              <p className="text-sm">Bản đồ chưa cập nhật</p>
            </div>
          )}
          {isEditing && (
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
              <span className="text-white text-sm">Bản đồ tự động tạo từ địa chỉ</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer bar */}
      <div className="max-w-6xl mx-auto mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-white/30">
        <span suppressHydrationWarning>© {new Date().getFullYear()} · Được cung cấp bởi <span className="font-serif italic" style={{ color: themeColor }}>1Fashion</span></span>
        <Link href="/" className="hover:text-white/60 transition-colors">1Fashion Platform</Link>
      </div>
    </section>
  )
}
