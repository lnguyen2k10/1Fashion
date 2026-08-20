'use client'

import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast';
import Image from 'next/image'
import { Check, Upload, ImageIcon, RefreshCw } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { confirmAction } from '@/lib/confirm'

export default function BrandingPage() {
  const [saved, setSaved] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [config, setConfig] = useState({
    appName: '1Fashion',
    tagline: 'Premium Fashion & Market Directory',
    accentColor: '#D4AF37', // Gold
    logoUrl: '',
    heroEyebrow: 'Danh bạ thời trang',
    heroTitle: 'Khám phá phong cách của bạn',
    heroSubtitle: 'Khám phá các shop thời trang và phụ kiện.',
    heroImageUrl: '',
    socialLinks: {} as Record<string, string>,
    termsContent: '',
    privacyContent: '',
    manualPaymentInstructions: '',
  })

  const supabase = createClient()

  // Load config from Supabase on component mount
  useEffect(() => {
    const fetchConfig = async () => {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('id', 'current')
        .maybeSingle()
      
      if (data) {
        setConfig({
          appName: data.app_name || '1Fashion',
          tagline: data.tagline || 'Premium Fashion & Market Directory',
          accentColor: data.accent_color || '#D4AF37',
          logoUrl: data.logo_url || '',
          heroEyebrow: data.hero_content?.eyebrow || 'Danh bạ thời trang',
          heroTitle: data.hero_content?.title || 'Khám phá phong cách của bạn',
          heroSubtitle: data.hero_content?.subtitle || data.tagline || '',
          heroImageUrl: data.hero_content?.image_url || '',
          socialLinks: data.social_links || {},
          termsContent: data.terms_content || '',
          privacyContent: data.privacy_content || '',
          manualPaymentInstructions: data.manual_payment_instructions || '',
        })
      }
    }
    fetchConfig()
  }, [])

  // Handle Logo Upload to Supabase Storage ('public_images' bucket)
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']
    if (!allowedTypes.includes(file.type) || file.size > 5 * 1024 * 1024) {
      toast.error('Logo phải là PNG, JPG, WebP hoặc SVG và không vượt quá 5MB.')
      e.target.value = ''
      return
    }

    setUploading(true)
    try {
      const fileExt = file.type === 'image/svg+xml' ? 'svg' : file.type.split('/')[1]
      const fileName = `admin-branding-logo-${Date.now()}.${fileExt}`
      const filePath = `branding/${fileName}`

      // Upload file to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('public_images')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // Get public URL
      const { data } = supabase.storage.from('public_images').getPublicUrl(filePath)
      
      if (data?.publicUrl) {
        setConfig(prev => ({ ...prev, logoUrl: data.publicUrl }))
      }
    } catch (err: any) {
      toast('Upload logo thất bại: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  // Save branding config to Supabase
  const handleSave = async () => {
    const { error } = await supabase
      .from('site_settings')
      .upsert({
        id: 'current',
        app_name: config.appName,
        tagline: config.tagline,
        accent_color: config.accentColor,
        logo_url: config.logoUrl,
        hero_content: { eyebrow: config.heroEyebrow, title: config.heroTitle, subtitle: config.heroSubtitle, image_url: config.heroImageUrl || null },
        social_links: config.socialLinks,
        terms_content: config.termsContent,
        privacy_content: config.privacyContent,
        manual_payment_instructions: config.manualPaymentInstructions,
        updated_at: new Date().toISOString(),
      })

    if (error) {
      toast('Lưu cấu hình thất bại: ' + error.message)
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
  }

  // Reset to default branding config
  const handleReset = async () => {
    const confirmed = await confirmAction('Bạn có muốn đặt lại cấu hình nhận diện mặc định không?')
    if (confirmed) {
      const defaultConfig = {
        appName: '1Fashion',
        tagline: 'Premium Fashion & Market Directory',
        accentColor: '#D4AF37',
        logoUrl: '',
        heroEyebrow: 'Danh bạ thời trang',
        heroTitle: 'Khám phá phong cách của bạn',
        heroSubtitle: 'Khám phá các shop thời trang và phụ kiện.',
        heroImageUrl: '',
        socialLinks: {},
        termsContent: '',
        privacyContent: '',
        manualPaymentInstructions: '',
      }
      
      const { error } = await supabase
        .from('site_settings')
        .upsert({
          id: 'current',
          app_name: defaultConfig.appName,
          tagline: defaultConfig.tagline,
          accent_color: defaultConfig.accentColor,
          logo_url: defaultConfig.logoUrl,
          hero_content: { eyebrow: defaultConfig.heroEyebrow, title: defaultConfig.heroTitle, subtitle: defaultConfig.heroSubtitle, image_url: null },
          social_links: defaultConfig.socialLinks,
          terms_content: defaultConfig.termsContent,
          privacy_content: defaultConfig.privacyContent,
          manual_payment_instructions: defaultConfig.manualPaymentInstructions,
          updated_at: new Date().toISOString(),
        })

      if (error) {
        toast('Đặt lại cấu hình thất bại: ' + error.message)
      } else {
        setConfig(defaultConfig)
      }
    }
  }

  return (
    <div className="space-y-8 max-w-4xl">
      <header>
        <h2 className="text-2xl font-sans font-bold text-[#2F2F2F]">Cấu Hình Nhận Diện Thương Hiệu (Branding)</h2>
        <p className="text-sm text-[#2F2F2F]/60 mt-1">
          Thay đổi tên ứng dụng, biểu tượng Logo và màu sắc chủ đạo của hệ thống danh bạ 1Fashion. Cấu hình được lưu trữ và đồng bộ hóa thực tế.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left Form Column */}
        <div className="glass-card space-y-6 border-[#D4AF37]/10 bg-white p-5 sm:p-8 lg:col-span-3">
          {/* App Name */}
          <div className="space-y-2">
            <label className="text-[10px] font-mono text-[#2F2F2F]/60 uppercase tracking-widest block">Tên Ứng Dụng (Application Name)</label>
            <input
              type="text"
              value={config.appName}
              onChange={(e) => setConfig({ ...config, appName: e.target.value })}
              className="w-full bg-[#FDFBF7] border border-[#D4AF37]/10 rounded-lg px-4 py-3 text-[#2F2F2F] font-sans font-bold text-lg focus:border-[#D4AF37]/50 outline-none transition-colors"
            />
          </div>

          {/* Tagline */}
          <div className="space-y-2">
            <label className="text-[10px] font-mono text-[#2F2F2F]/60 uppercase tracking-widest block">Slogan / Tagline</label>
            <input
              type="text"
              value={config.tagline}
              onChange={(e) => setConfig({ ...config, tagline: e.target.value })}
              className="w-full bg-[#FDFBF7] border border-[#D4AF37]/10 rounded-lg px-4 py-3 text-[#2F2F2F]/80 focus:border-[#D4AF37]/50 outline-none transition-colors text-sm"
            />
          </div>

          {/* Accent Color */}
          <div className="space-y-3">
            <label className="text-[10px] font-mono text-[#2F2F2F]/60 uppercase tracking-widest block">Màu Sắc Chủ Đạo (Accent Color)</label>
            <div className="flex items-center gap-4">
              <input
                type="color"
                value={config.accentColor}
                onChange={(e) => setConfig({ ...config, accentColor: e.target.value })}
                className="w-12 h-12 rounded-lg border border-[#D4AF37]/10 bg-transparent cursor-pointer"
              />
              <div className="space-y-1">
                <p className="text-sm font-mono text-[#2F2F2F]/80">{config.accentColor.toUpperCase()}</p>
                <p className="text-[10px] text-[#2F2F2F]/40">Dùng cho các nút bấm cao cấp, các huy hiệu danh mục và đường viền nổi bật.</p>
              </div>
            </div>
          </div>

          {/* Logo Upload & URL */}
          <div className="space-y-4">
            <label className="text-[10px] font-mono text-[#2F2F2F]/60 uppercase tracking-widest block">Biểu Tượng Logo</label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Local File Upload */}
              <div className="border border-dashed border-[#D4AF37]/10 hover:border-[#D4AF37]/50 rounded-xl p-4 flex flex-col items-center justify-center bg-[#FDFBF7] relative group transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  disabled={uploading}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
                <Upload size={20} className={`text-[#2F2F2F]/60 group-hover:text-[#D4AF37] transition-colors ${uploading ? 'animate-bounce' : ''}`} />
                <span className="text-[11px] font-medium text-[#2F2F2F]/80 mt-2">
                  {uploading ? 'Đang tải lên...' : 'Tải Logo từ máy tính'}
                </span>
                <span className="text-[9px] text-[#2F2F2F]/40 mt-1">Hỗ trợ PNG, SVG, JPG</span>
              </div>

              {/* Direct URL Input */}
              <div className="flex flex-col justify-center space-y-2">
                <span className="text-[10px] font-mono text-[#2F2F2F]/40">Hoặc nhập URL trực tiếp:</span>
                <input
                  type="url"
                  value={config.logoUrl}
                  onChange={(e) => setConfig({ ...config, logoUrl: e.target.value })}
                  placeholder="https://cdn.1fashion.asia/logo.svg"
                  className="w-full bg-[#FDFBF7] border border-[#D4AF37]/10 rounded-lg px-3 py-2.5 text-[#2F2F2F]/80 placeholder:text-[#2F2F2F]/20 focus:border-[#D4AF37]/50 outline-none transition-colors text-xs font-mono"
                />
              </div>
            </div>
          </div>

          <section className="space-y-3 border-t border-[#D4AF37]/10 pt-6">
            <h3 className="text-sm font-bold text-[#2F2F2F]">Nội dung trang chủ</h3>
            <input value={config.heroEyebrow} onChange={(e) => setConfig({ ...config, heroEyebrow: e.target.value })} placeholder="Nhãn hero" className="w-full rounded-lg border border-[#D4AF37]/10 bg-[#FDFBF7] px-3 py-2 text-sm outline-none" />
            <input value={config.heroTitle} onChange={(e) => setConfig({ ...config, heroTitle: e.target.value })} placeholder="Tiêu đề hero" className="w-full rounded-lg border border-[#D4AF37]/10 bg-[#FDFBF7] px-3 py-2 text-sm outline-none" />
            <textarea value={config.heroSubtitle} onChange={(e) => setConfig({ ...config, heroSubtitle: e.target.value })} placeholder="Mô tả hero" rows={2} className="w-full rounded-lg border border-[#D4AF37]/10 bg-[#FDFBF7] px-3 py-2 text-sm outline-none" />
            <input type="url" value={config.heroImageUrl} onChange={(e) => setConfig({ ...config, heroImageUrl: e.target.value })} placeholder="URL ảnh nền hero (tùy chọn)" className="w-full rounded-lg border border-[#D4AF37]/10 bg-[#FDFBF7] px-3 py-2 text-sm outline-none" />
          </section>

          <section className="space-y-3 border-t border-[#D4AF37]/10 pt-6">
            <h3 className="text-sm font-bold text-[#2F2F2F]">Liên kết mạng xã hội footer</h3>
            <p className="text-xs text-[#2F2F2F]/55">Chỉ biểu tượng có URL hợp lệ mới hiển thị công khai.</p>
            <div className="grid gap-2 sm:grid-cols-2">{['facebook', 'instagram', 'tiktok', 'youtube', 'zalo', 'website'].map((network) => <input key={network} type="url" value={config.socialLinks[network] || ''} onChange={(e) => setConfig({ ...config, socialLinks: { ...config.socialLinks, [network]: e.target.value } })} placeholder={`${network}: https://...`} className="rounded-lg border border-[#D4AF37]/10 bg-[#FDFBF7] px-3 py-2 text-xs outline-none" />)}</div>
          </section>

          <section className="space-y-3 border-t border-[#D4AF37]/10 pt-6">
            <h3 className="text-sm font-bold text-[#2F2F2F]">Nội dung pháp lý công khai</h3>
            <textarea value={config.termsContent} onChange={(e) => setConfig({ ...config, termsContent: e.target.value })} placeholder="Điều khoản sử dụng" rows={6} className="w-full rounded-lg border border-[#D4AF37]/10 bg-[#FDFBF7] px-3 py-2 text-sm outline-none" />
            <textarea value={config.privacyContent} onChange={(e) => setConfig({ ...config, privacyContent: e.target.value })} placeholder="Chính sách bảo mật" rows={6} className="w-full rounded-lg border border-[#D4AF37]/10 bg-[#FDFBF7] px-3 py-2 text-sm outline-none" />
          </section>

          <section className="space-y-3 border-t border-[#D4AF37]/10 pt-6">
            <h3 className="text-sm font-bold text-[#2F2F2F]">Hướng dẫn thanh toán thủ công</h3>
            <p className="text-xs text-[#2F2F2F]/55">Hiển thị cho shop sau khi chọn gói. Nhập ngân hàng, số tài khoản, chủ tài khoản và lưu ý chuyển khoản.</p>
            <textarea value={config.manualPaymentInstructions} onChange={(e) => setConfig({ ...config, manualPaymentInstructions: e.target.value })} placeholder={'Ngân hàng: ...\nSố tài khoản: ...\nChủ tài khoản: ...'} rows={5} className="w-full rounded-lg border border-[#D4AF37]/10 bg-[#FDFBF7] px-3 py-2 text-sm outline-none" />
          </section>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-[#D4AF37]/10 flex justify-between">
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-white border border-[#D4AF37]/10 text-[#2F2F2F]/80 hover:text-[#2F2F2F] hover:bg-[#FDFBF7] rounded-lg text-xs font-mono uppercase flex items-center gap-1.5 transition-all"
            >
              <RefreshCw size={12} />
              Đặt lại mặc định
            </button>
            <button
              onClick={handleSave}
              className="premium-button px-8 py-3 flex items-center gap-2"
            >
              {saved ? (
                <>
                  <Check size={16} />
                  <span>Đã lưu thành công</span>
                </>
              ) : (
                <span>Lưu thay đổi</span>
              )}
            </button>
          </div>
        </div>

        {/* Right Preview Column (Shows a real-time mockup of 1Fashion with custom branding applied!) */}
        <div className="lg:col-span-2 space-y-6">
          <p className="text-[10px] font-mono text-[#2F2F2F]/60 uppercase tracking-widest">Bản xem trước giao diện thực tế (Live Preview)</p>
          
          <div className="glass-card overflow-hidden bg-white border-[#D4AF37]/10">
            {/* Website Mockup Header */}
            <div className="bg-[#FDFBF7] border-b border-[#D4AF37]/10 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                {config.logoUrl ? (
                  <Image src={config.logoUrl} alt="Logo" width={96} height={24} className="h-6 w-auto object-contain" />
                ) : (
                  <div className="w-5 h-5 rounded bg-[#D4AF37] flex items-center justify-center text-[10px] font-black text-white">
                    1S
                  </div>
                )}
                <span className="text-sm font-bold text-[#2F2F2F] font-sans">{config.appName}</span>
              </div>
              <div className="flex gap-3">
                <div className="w-12 h-1 bg-[#D4AF37]/20 rounded" />
                <div className="w-12 h-1 bg-[#D4AF37]/20 rounded" />
              </div>
            </div>

            {/* Website Mockup Hero Section */}
            <div className="p-6 bg-[#FDFBF7] space-y-4">
              <div className="space-y-1.5 text-center">
                <span 
                  className="text-[9px] font-mono px-2 py-0.5 rounded uppercase tracking-wider"
                  style={{ backgroundColor: `${config.accentColor}20`, color: config.accentColor, border: `1px solid ${config.accentColor}30` }}
                >
                  Premium Directory
                </span>
                <h4 className="text-sm font-sans font-bold text-[#2F2F2F] mt-2">Tìm kiếm cửa hàng tốt nhất</h4>
                <p className="text-[10px] text-[#2F2F2F]/60">{config.tagline}</p>
              </div>

              {/* Call to Action Button Preview */}
              <button 
                className="w-full py-2 rounded text-[10px] font-bold text-white uppercase tracking-wider transition-all"
                style={{ backgroundColor: config.accentColor }}
              >
                Khám phá ngay
              </button>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-white border border-[#D4AF37]/10">
            <p className="text-[10px] font-mono text-[#D4AF37] uppercase tracking-widest">💡 Trải nghiệm thực tế</p>
            <p className="text-[11px] text-[#2F2F2F]/60 mt-1">
              Bạn có thể tải trực tiếp ảnh Logo từ máy tính lên. Hệ thống sẽ tự động lưu ảnh vào Storage Bucket của Supabase và tạo liên kết ảnh công khai tức thì để cập nhật trên toàn hệ thống.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
