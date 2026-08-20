'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Sparkles, Shield } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

import { completeOnboarding } from '@/lib/services/onboarding'

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showMockWarning, setShowMockWarning] = useState(false)
  const [categories, setCategories] = useState<{name: string}[]>([])

  const [formData, setFormData] = useState({
    business_name: '',
    categories: [] as string[],
    specialization: '',
    bio: '',
    location_city: '',
    location_district: '',
    location_ward: '',
  })

  const supabase = createClient()

  useEffect(() => {
    // Fetch categories dynamically from DB to prevent hardcoding
    const fetchCategories = async () => {
      const { data } = await supabase
        .from('site_categories')
        .select('name')
        .eq('is_active', true)
        .order('sort_order', { ascending: true })

      if (data && data.length > 0) {
        setCategories(data)
      } else {
        setCategories([{name: 'Thời Trang'}, {name: 'Phụ Kiện'}])
      }
    }
    fetchCategories()
  }, [])

  const nextStep = () => setStep(s => s + 1)
  const prevStep = () => setStep(s => s - 1)

  async function handleSubmit() {
    setIsSubmitting(true)
    const isMock = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('YOUR_PROJECT_ID');
    if (isMock) setShowMockWarning(true)

    const finalData = new FormData()
    Object.entries(formData).forEach(([k, v]) => {
      if (k !== 'categories') finalData.append(k, String(v))
    })
    finalData.append('categories', JSON.stringify(formData.categories))

    try {
      await completeOnboarding(finalData)
    } catch (err) {
      console.error(err)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#ffffff] text-[#2F2F2F] flex items-center justify-center p-6 selection:bg-[#D4AF37]/20 overflow-hidden relative">
      {/* Sovereign Ambient Background */}
      <div className="absolute inset-0 z-0">
         <div className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-[#D4AF37]/5 rounded-full blur-[140px] animate-pulse" />
         <div className="absolute bottom-1/4 right-1/3 w-[500px] h-[500px] bg-[#D4AF37]/5 rounded-full blur-[140px] animate-pulse" style={{ animationDelay: '3s' }} />
      </div>
      
      <div className="relative z-10 max-w-xl w-full">
        <AnimatePresence mode="wait">
          <motion.div 
            key={step}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1] }}
            className="space-y-8 rounded-[2rem] border border-[#D4AF37]/20 bg-white/90 p-6 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] backdrop-blur-xl sm:p-10 sm:space-y-10 md:p-16 md:space-y-12"
          >
            {/* Ritual Step Indicator */}
            <div className="flex justify-center gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="relative h-1 w-12 bg-[#EFE9DD] rounded-full overflow-hidden">
                  {step >= i && (
                    <motion.div 
                      layoutId="step-bar"
                      className="absolute inset-0 bg-[#D4AF37] shadow-[0_0_10px_rgba(212,175,55,0.5)]"
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Step 1: Identity */}
            {step === 1 && (
              <div className="space-y-10">
                <div className="space-y-3 text-center">
                  <h1 className="text-4xl md:text-5xl font-sans font-bold tracking-tight text-[#2F2F2F]"><span className="text-[#D4AF37]">1</span>Fashion.</h1>
                  <p className="text-[#2F2F2F]/60 text-[10px] font-mono uppercase tracking-[0.4em] italic leading-relaxed">
                    "Bắt đầu hành trình bán hàng của bạn. <br/> Đăng ký cửa hàng dễ dàng, bảo mật."
                  </p>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-mono text-[#2F2F2F]/40 uppercase tracking-[0.3em] ml-1">Tên Cửa Hàng / Thương Hiệu</label>
                  <input 
                    value={formData.business_name}
                    onChange={e => setFormData({...formData, business_name: e.target.value})}
                    type="text" 
                    placeholder="e.g. Trendy Boutique"
                    className="w-full bg-[#FDFBF7] border border-[#D4AF37]/20 rounded-2xl px-8 py-5 text-xl text-[#2F2F2F] focus:border-[#D4AF37] focus:bg-white outline-none transition-all placeholder:text-[#2F2F2F]/20 font-serif"
                  />
                </div>
                <button onClick={nextStep} disabled={!formData.business_name} className="premium-button w-full py-6 flex items-center justify-center gap-4 group">
                  <span className="text-sm tracking-widest">TIẾP TỤC ĐẾN LĨNH VỰC</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            )}

            {/* Step 2: The Domain of Impact */}
            {step === 2 && (
              <div className="space-y-10">
                <div className="space-y-3 text-center">
                  <h1 className="text-4xl md:text-5xl font-sans font-bold tracking-tight text-[#2F2F2F]">Lĩnh vực.</h1>
                  <p className="text-[#2F2F2F]/60 text-[10px] font-mono uppercase tracking-[0.4em] italic leading-relaxed">
                    "Định vị ngành hàng kinh doanh cốt lõi <br/> của cửa hàng bạn."
                  </p>
                </div>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-[#2F2F2F]/40 uppercase tracking-[0.3em] ml-1">Lĩnh vực hoạt động chính</label>
                    <div className="relative group">
                      <div className="flex flex-wrap gap-2 rounded-2xl border border-[#D4AF37]/20 bg-[#FDFBF7] p-4">
                        {categories.map((category) => <label key={category.name} className={`cursor-pointer rounded-full border px-3 py-2 text-sm ${formData.categories.includes(category.name) ? 'border-[#D4AF37] bg-white text-[#9c7a1c]' : 'border-transparent text-[#2F2F2F]/60'}`}>
                          <input type="checkbox" className="sr-only" checked={formData.categories.includes(category.name)} onChange={() => setFormData((current) => ({ ...current, categories: current.categories.includes(category.name) ? current.categories.filter((item) => item !== category.name) : [...current.categories, category.name] }))} />
                          {category.name}
                        </label>)}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-mono text-[#2F2F2F]/40 uppercase tracking-[0.3em] ml-1">Mặt hàng chủ đạo</label>
                    <input 
                      value={formData.specialization}
                      onChange={e => setFormData({...formData, specialization: e.target.value})}
                      type="text" 
                      placeholder="e.g. Quần áo nữ Hàn Quốc"
                      className="w-full bg-[#FDFBF7] border border-[#D4AF37]/20 rounded-2xl px-8 py-5 text-lg text-[#2F2F2F] focus:border-[#D4AF37] focus:bg-white outline-none transition-all placeholder:text-[#2F2F2F]/20 font-serif"
                    />
                  </div>
                </div>
                <div className="flex gap-4">
                   <button onClick={prevStep} className="w-1/3 py-6 border border-[#EFE9DD] rounded-2xl text-[10px] font-mono text-[#2F2F2F]/60 uppercase tracking-widest hover:bg-[#FDFBF7] transition-colors">Quay lại</button>
                   <button onClick={nextStep} className="premium-button flex-1 py-6 flex items-center justify-center gap-4 group">
                      <span className="text-sm tracking-widest">TIẾP TỤC</span>
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                   </button>
                </div>
              </div>
            )}

            {/* Step 3: The Ritual of Purpose */}
            {step === 3 && (
              <div className="space-y-10">
                <div className="space-y-3 text-center">
                  <h1 className="text-4xl md:text-5xl font-sans font-bold tracking-tight text-[#2F2F2F]">Giới Thiệu.</h1>
                  <p className="text-[#2F2F2F]/60 text-[10px] font-mono uppercase tracking-[0.4em] italic leading-relaxed">
                    "Hãy chia sẻ câu chuyện đằng sau <br/> thương hiệu của bạn."
                  </p>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-[#2F2F2F]/40 uppercase tracking-[0.3em] ml-1">Mô tả ngắn về cửa hàng</label>
                  <textarea 
                    value={formData.bio}
                    onChange={e => setFormData({...formData, bio: e.target.value})}
                    placeholder="Sản phẩm của chúng tôi hướng tới..."
                    rows={6}
                    className="w-full bg-[#FDFBF7] border border-[#D4AF37]/20 rounded-2xl px-8 py-5 text-sm text-[#2F2F2F] focus:border-[#D4AF37] focus:bg-white outline-none transition-all resize-none placeholder:text-[#2F2F2F]/20 font-serif leading-relaxed"
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <input value={formData.location_city} onChange={e => setFormData({...formData, location_city: e.target.value})} placeholder="Tỉnh / thành" className="rounded-xl border border-[#D4AF37]/20 bg-[#FDFBF7] px-4 py-3 text-sm outline-none focus:border-[#D4AF37]" />
                  <input value={formData.location_district} onChange={e => setFormData({...formData, location_district: e.target.value})} placeholder="Quận / huyện" className="rounded-xl border border-[#D4AF37]/20 bg-[#FDFBF7] px-4 py-3 text-sm outline-none focus:border-[#D4AF37]" />
                  <input value={formData.location_ward} onChange={e => setFormData({...formData, location_ward: e.target.value})} placeholder="Phường / xã" className="rounded-xl border border-[#D4AF37]/20 bg-[#FDFBF7] px-4 py-3 text-sm outline-none focus:border-[#D4AF37]" />
                </div>
                
                <div className="space-y-6">
                   <div className="flex gap-4">
                      <button onClick={prevStep} className="w-1/3 py-6 border border-[#EFE9DD] rounded-2xl text-[10px] font-mono text-[#2F2F2F]/60 uppercase tracking-widest hover:bg-[#FDFBF7] transition-colors">Quay lại</button>
                      <button 
                        onClick={handleSubmit} 
                        disabled={isSubmitting}
                        className="premium-button flex-1 py-6 flex items-center justify-center gap-4 group relative overflow-hidden"
                      >
                         <AnimatePresence>
                           {isSubmitting && (
                             <motion.div 
                               initial={{ opacity: 0 }}
                               animate={{ opacity: 1 }}
                               className="absolute inset-0 bg-white/10 animate-pulse" 
                             />
                           )}
                         </AnimatePresence>
                         <Sparkles size={18} className={isSubmitting ? 'animate-spin' : ''} />
                         <span className="text-sm tracking-widest">{isSubmitting ? 'ĐANG KHỞI TẠO...' : 'XÁC NHẬN ĐĂNG KÝ'}</span>
                      </button>
                   </div>
                   
                   {showMockWarning && (
                     <motion.p 
                       initial={{ opacity: 0 }} 
                       animate={{ opacity: 1 }} 
                       className="text-[10px] font-mono text-[#D4AF37] text-center uppercase tracking-[0.3em] animate-pulse"
                     >
                        Đang thiết lập cửa hàng của bạn...
                     </motion.p>
                   )}
                   <div className="text-center pt-2">
                     <Link href="/dashboard" className="text-xs font-medium text-[#2F2F2F]/50 hover:text-[#D4AF37] transition-colors uppercase tracking-widest">
                       Bỏ qua & Thiết lập sau
                     </Link>
                   </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
