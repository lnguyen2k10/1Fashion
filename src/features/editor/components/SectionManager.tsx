'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { confirmAction } from '@/lib/confirm'
import {
  Plus, ChevronUp, ChevronDown, Trash2, Eye, EyeOff,
  Sparkles, Users, MessageSquare, ImageIcon, Video,
  Phone, DollarSign, HelpCircle, Zap, AlignLeft, Grid3X3, Star, GripVertical
} from 'lucide-react'
import { AddSectionModal, SECTION_TYPES } from './AddSectionModal'

interface SectionManagerProps {
  sections: string[]
  hiddenSections: string[]
  onMoveUp: (sectionKey: string) => void
  onMoveDown: (sectionKey: string) => void
  onToggleHide: (sectionKey: string) => void
  onDelete: (sectionKey: string) => void
  onAddSection: (sectionType: string, defaultContent: any) => void
  activeSection: string | null
  onSelectSection: (key: string) => void
}

const SECTION_META: Record<string, { label: string; icon: any; color: string }> = {
  hero_section:    { label: 'Banner Chính',      icon: Sparkles,      color: '#D4AF37' },
  services_menu:   { label: 'Sản Phẩm',          icon: Grid3X3,       color: '#D4AF37' },
  about_us:        { label: 'Giới Thiệu Shop',   icon: Users,         color: '#6366f1' },
  social_trust:    { label: 'Đánh Giá KH',       icon: MessageSquare, color: '#f59e0b' },
  gallery:         { label: 'Lookbook / Gallery', icon: ImageIcon,     color: '#ec4899' },
  video_intro:     { label: 'Video Giới Thiệu',  icon: Video,         color: '#ef4444' },
  contact_info:    { label: 'Liên Hệ & Bản Đồ', icon: Phone,         color: '#3b82f6' },
  cta_banner:      { label: 'Kêu Gọi Hành Động', icon: Zap,           color: '#f97316' },
  custom_text:     { label: 'Nội Dung Tự Do',    icon: AlignLeft,     color: '#6b7280' },
  offers_list:     { label: 'Ưu Đãi / KM',       icon: Sparkles,      color: '#8b5cf6' },
  operating_hours: { label: 'Giờ Hoạt Động',     icon: AlignLeft,     color: '#6b7280' },
}

const NON_DELETABLE = ['hero_section', 'contact_info']

export function SectionManager({
  sections,
  hiddenSections,
  onMoveUp,
  onMoveDown,
  onToggleHide,
  onDelete,
  onAddSection,
  activeSection,
  onSelectSection,
}: SectionManagerProps) {
  const [showAddModal, setShowAddModal] = useState(false)

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#D4AF37]/10 flex items-center justify-between shrink-0">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D4AF37]">Sections</p>
          <p className="text-[9px] text-[#2F2F2F]/30 mt-0.5">{sections.length} phần</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#D4AF37] text-white text-[10px] font-bold uppercase tracking-wider hover:bg-[#B8860B] transition-colors shadow-sm"
        >
          <Plus size={11} /> Thêm
        </button>
      </div>

      {/* Section List */}
      <div className="flex-1 overflow-y-auto py-2">
        <AnimatePresence>
          {sections.map((key, idx) => {
            const meta = SECTION_META[key] || { label: key, icon: AlignLeft, color: '#6b7280' }
            const Icon = meta.icon
            const isHidden = hiddenSections.includes(key)
            const isActive = activeSection === key
            const isDeletable = !NON_DELETABLE.includes(key)

            return (
              <motion.div
                key={key}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className={`mx-2 mb-1 rounded-xl border transition-all cursor-pointer group ${
                  isActive
                    ? 'border-[#D4AF37]/60 bg-[#D4AF37]/8 shadow-sm'
                    : 'border-transparent hover:border-[#D4AF37]/20 hover:bg-[#D4AF37]/3'
                } ${isHidden ? 'opacity-40' : ''}`}
                onClick={() => onSelectSection(key)}
              >
                <div className="flex items-center gap-2 px-3 py-2.5">
                  {/* Drag Handle (visual only) */}
                  <GripVertical size={12} className="text-[#2F2F2F]/20 shrink-0" />

                  {/* Icon */}
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: meta.color + '20' }}
                  >
                    <Icon size={13} style={{ color: meta.color }} />
                  </div>

                  {/* Label */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-bold truncate ${isActive ? 'text-[#B8860B]' : 'text-[#2F2F2F]'}`}>
                      {meta.label}
                    </p>
                    <p className="text-[9px] text-[#2F2F2F]/30 font-mono">{idx + 1} / {sections.length}</p>
                  </div>

                  {/* Actions (visible on hover / active) */}
                  <div className={`flex items-center gap-0.5 transition-opacity ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    <button
                      onClick={(e) => { e.stopPropagation(); onMoveUp(key) }}
                      disabled={idx === 0}
                      className="p-1 rounded hover:bg-[#D4AF37]/20 text-[#2F2F2F]/40 hover:text-[#D4AF37] disabled:opacity-20 transition-colors"
                      title="Lên"
                    >
                      <ChevronUp size={12} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onMoveDown(key) }}
                      disabled={idx === sections.length - 1}
                      className="p-1 rounded hover:bg-[#D4AF37]/20 text-[#2F2F2F]/40 hover:text-[#D4AF37] disabled:opacity-20 transition-colors"
                      title="Xuống"
                    >
                      <ChevronDown size={12} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); onToggleHide(key) }}
                      className="p-1 rounded hover:bg-[#D4AF37]/20 text-[#2F2F2F]/40 hover:text-[#D4AF37] transition-colors"
                      title={isHidden ? 'Hiện' : 'Ẩn'}
                    >
                      {isHidden ? <EyeOff size={12} /> : <Eye size={12} />}
                    </button>
                    {isDeletable && (
                      <button
                        onClick={async (e) => {
                          e.stopPropagation()
                          const confirmed = await confirmAction(`Xóa section "${meta.label}"?`)
                          if (confirmed) onDelete(key)
                        }}
                        className="p-1 rounded hover:bg-red-100 text-[#2F2F2F]/40 hover:text-red-500 transition-colors"
                        title="Xóa"
                      >
                        <Trash2 size={12} />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>

      <AddSectionModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={onAddSection}
        existingSections={sections}
      />
    </div>
  )
}
