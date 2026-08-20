'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Sparkles, Users, MessageSquare, ImageIcon, Video, Phone, DollarSign, HelpCircle, Zap, AlignLeft, Grid3X3, Star } from 'lucide-react'

export const SECTION_TYPES = [
  { id: 'hero_section', label: 'Banner Chính (Hero)', desc: 'Ảnh nền lớn, tiêu đề, nút CTA', icon: Sparkles, color: '#D4AF37' },
  { id: 'services_menu', label: 'Danh Sách Dịch Vụ', desc: 'Grid dịch vụ với ảnh, tên, giá', icon: Grid3X3, color: '#D4AF37' },
  { id: 'about_us', label: 'Về Chúng Tôi', desc: 'Giới thiệu thương hiệu, câu chuyện', icon: Users, color: '#6366f1' },
  { id: 'testimonials', label: 'Nhận Xét Khách Hàng', desc: 'Đánh giá và phản hồi khách hàng', icon: MessageSquare, color: '#f59e0b' },
  { id: 'gallery', label: 'Thư Viện Ảnh', desc: 'Grid ảnh không gian, kết quả', icon: ImageIcon, color: '#ec4899' },
  { id: 'video_intro', label: 'Video Giới Thiệu', desc: 'Nhúng video YouTube hoặc link MP4', icon: Video, color: '#ef4444' },
  { id: 'contact_info', label: 'Liên Hệ & Bản Đồ', desc: 'Hotline, địa chỉ, Google Maps', icon: Phone, color: '#3b82f6' },
  { id: 'pricing_table', label: 'Bảng Giá Dịch Vụ', desc: 'So sánh gói dịch vụ, giá cả', icon: DollarSign, color: '#8b5cf6' },
  { id: 'team', label: 'Đội Ngũ Chuyên Gia', desc: 'Giới thiệu bác sĩ, chuyên viên', icon: Star, color: '#06b6d4' },
  { id: 'faq', label: 'Câu Hỏi Thường Gặp', desc: 'Accordion Q&A giải đáp thắc mắc', icon: HelpCircle, color: '#84cc16' },
  { id: 'cta_banner', label: 'Kêu Gọi Hành Động', desc: 'Banner khuyến mãi và ưu đãi', icon: Zap, color: '#f97316' },
  { id: 'custom_text', label: 'Nội Dung Tự Do', desc: 'Đoạn văn bản, thông báo tùy ý', icon: AlignLeft, color: '#6b7280' },
  { id: 'offers_list', label: 'Khuyến Mãi Hiện Có', desc: 'Hiển thị các Voucher đang chạy', icon: Sparkles, color: '#8b5cf6' },
]

const DEFAULT_CONTENT: Record<string, any> = {
  hero_section: {
    hero_title: 'Tiêu đề Banner của bạn',
    hero_subtitle: 'Slogan hoặc mô tả ngắn gọn về dịch vụ.',
    hero_slides: ['https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1200&auto=format&fit=crop']
  },
  services_menu: [],
  about_us: {
    intro_text: 'Chúng tôi là đơn vị hàng đầu trong lĩnh vực chăm sóc sắc đẹp.',
    experience_years: '5+'
  },
  testimonials: {
    title: 'Cảm nhận từ khách hàng',
    items: [
      { name: 'Khách hàng A', content: 'Dịch vụ rất tốt và chuyên nghiệp!', rating: 5 }
    ]
  },
  gallery: {
    title: 'Thư viện ảnh',
    images: ['https://images.unsplash.com/photo-1570172619644-defd00bb34da?q=80&w=800']
  },
  video_intro: {
    title: 'Video giới thiệu',
    video_url: ''
  },
  contact_info: {
    hotline: '1900 8888',
    zalo_link: 'https://zalo.me/',
    address_full: 'Địa chỉ của bạn',
    google_map_embed_code: ''
  },
  pricing_table: {
    title: 'Bảng giá dịch vụ',
    packages: [{ name: 'Gói cơ bản', price: '500.000đ', features: ['Dịch vụ 1', 'Dịch vụ 2'] }]
  },
  team: {
    title: 'Đội ngũ chuyên gia',
    members: [{ name: 'Chuyên gia A', role: 'Nhà thiết kế', image_url: '' }]
  },
  faq: {
    title: 'Câu hỏi thường gặp',
    items: [{ question: 'Câu hỏi 1?', answer: 'Câu trả lời 1.' }]
  },
  cta_banner: {
    title: 'Ưu đãi đặc biệt',
    subtitle: 'Khám phá ưu đãi mới nhất từ cửa hàng.',
    button_text: 'Xem ưu đãi',
    background_image: ''
  },
  custom_text: {
    title: 'Tiêu đề',
    content: 'Nội dung của bạn ở đây...'
  },
  offers_list: {
    title: 'Ưu Đãi Đặc Quyền',
    subtitle: 'Nhanh tay nhận ngay các voucher hấp dẫn chỉ dành riêng cho bạn.'
  }
}

interface AddSectionModalProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (sectionType: string, defaultContent: any) => void
  existingSections: string[]
}

export function AddSectionModal({ isOpen, onClose, onAdd, existingSections }: AddSectionModalProps) {
  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[9000] bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-0 z-[9001] flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl pointer-events-auto overflow-hidden border border-[#D4AF37]/10 max-h-[80vh] flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#D4AF37]/10 shrink-0">
                <div>
                  <h3 className="font-bold text-base text-[#2F2F2F]">Thêm Section Mới</h3>
                  <p className="text-xs text-[#2F2F2F]/40 mt-0.5">Chọn loại nội dung để thêm vào Cửa hàng</p>
                </div>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-[#D4AF37]/10 text-[#2F2F2F]/40 hover:text-[#2F2F2F] transition-colors">
                  <X size={16} />
                </button>
              </div>

              {/* Grid */}
              <div className="overflow-y-auto p-6">
                <div className="grid grid-cols-2 gap-3">
                  {SECTION_TYPES.map((type) => {
                    const Icon = type.icon
                    const isExisting = existingSections.includes(type.id) && 
                      !['services_menu', 'gallery', 'testimonials', 'faq', 'cta_banner', 'custom_text', 'pricing_table', 'team'].includes(type.id)
                    
                    return (
                      <button
                        key={type.id}
                        onClick={() => {
                          onAdd(type.id, DEFAULT_CONTENT[type.id] || {})
                          onClose()
                        }}
                        disabled={isExisting}
                        className={`flex items-start gap-3 p-4 rounded-2xl border text-left transition-all group ${
                          isExisting
                            ? 'border-[#D4AF37]/10 bg-[#ffffff]/50 opacity-40 cursor-not-allowed'
                            : 'border-[#D4AF37]/15 hover:border-[#D4AF37]/50 hover:bg-[#D4AF37]/5 hover:shadow-md'
                        }`}
                      >
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110"
                          style={{ backgroundColor: type.color + '20' }}
                        >
                          <Icon size={18} style={{ color: type.color }} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-[#2F2F2F] leading-snug">{type.label}</p>
                          <p className="text-xs text-[#2F2F2F]/40 mt-0.5 leading-snug">{type.desc}</p>
                          {isExisting && <span className="text-[9px] text-[#D4AF37] font-bold uppercase tracking-widest mt-1 block">Đã có</span>}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
