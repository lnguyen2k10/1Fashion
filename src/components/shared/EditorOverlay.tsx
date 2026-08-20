'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronUp, ChevronDown, Eye, EyeOff, Trash2, Plus, Image as ImageIcon, Edit3
} from 'lucide-react'

interface SectionOverlayProps {
  sectionKey: string
  label: string
  isEditing: boolean
  isActive: boolean
  onActivate: () => void
  children: React.ReactNode
  /** Optional image path to trigger image picker */
  imagePath?: string
  /** Optional image URL */
  imageUrl?: string
  onImagePick?: (path: string, currentUrl: string) => void
  /** Optional extra toolbar slot */
  extraAction?: React.ReactNode
}

/**
 * SectionOverlay wraps a template section.
 * In edit mode, shows a floating toolbar on hover with edit/image actions.
 */
export function SectionOverlay({
  sectionKey,
  label,
  isEditing,
  isActive,
  onActivate,
  children,
  imagePath,
  imageUrl,
  onImagePick,
  extraAction,
}: SectionOverlayProps) {
  const [isHovered, setIsHovered] = useState(false)

  if (!isEditing) return <>{children}</>

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onActivate}
    >
      {/* Active / hover border ring */}
      <div
        className={`absolute inset-0 z-[100] pointer-events-none transition-all duration-200 rounded-sm ${
          isActive
            ? 'ring-2 ring-[#D4AF37] ring-offset-0'
            : isHovered
            ? 'ring-1 ring-[#D4AF37]/40 ring-offset-0'
            : ''
        }`}
      />

      {/* Floating Toolbar */}
      <AnimatePresence>
        {(isHovered || isActive) && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15 }}
            className="absolute top-2 left-1/2 -translate-x-1/2 z-[200] pointer-events-auto"
          >
            <div className="flex items-center gap-1 bg-[#1a1a1a]/90 backdrop-blur-md border border-[#D4AF37]/30 rounded-full px-3 py-1.5 shadow-2xl">
              {/* Label */}
              <span className="text-[9px] font-bold text-[#D4AF37] uppercase tracking-widest mr-1 select-none">
                {label}
              </span>
              <div className="w-px h-3 bg-white/10" />

              {/* Image button */}
              {imagePath && onImagePick && (
                <button
                  onClick={(e) => { e.stopPropagation(); onImagePick(imagePath, imageUrl || '') }}
                  className="flex items-center gap-1 px-2 py-1 rounded-full text-white/70 hover:text-[#D4AF37] hover:bg-white/10 transition-colors text-[9px] font-bold uppercase tracking-wider"
                  title="Đổi ảnh"
                >
                  <ImageIcon size={10} /> Ảnh
                </button>
              )}

              {/* Extra actions slot */}
              {extraAction}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {children}
    </div>
  )
}

/**
 * EditableField: A click-to-edit inline text with visual indicator in edit mode.
 */
interface EditableFieldProps {
  value: string
  onChange: (val: string) => void
  isEditing: boolean
  multiline?: boolean
  className?: string
  placeholder?: string
  /** Display as heading with larger font */
  asHeading?: boolean
}

export function EditableField({
  value,
  onChange,
  isEditing,
  multiline = false,
  className = '',
  placeholder = 'Nhấn để chỉnh sửa...',
  asHeading = false,
}: EditableFieldProps) {
  const [isActive, setIsActive] = useState(false)
  const [local, setLocal] = useState(value)

  if (!isEditing) {
    return <span className={className}>{value}</span>
  }

  if (isActive) {
    if (multiline) {
      return (
        <textarea
          autoFocus
          value={local}
          onChange={(e) => setLocal(e.target.value)}
          onBlur={() => { onChange(local); setIsActive(false) }}
          className={`bg-white/90 border-2 border-[#D4AF37] rounded-lg p-2 outline-none resize-none w-full min-h-[80px] text-[#2F2F2F] ${className}`}
          placeholder={placeholder}
        />
      )
    }
    return (
      <input
        autoFocus
        type="text"
        value={local}
        onChange={(e) => setLocal(e.target.value)}
        onBlur={() => { onChange(local); setIsActive(false) }}
        onKeyDown={(e) => { if (e.key === 'Enter') { onChange(local); setIsActive(false) } }}
        className={`bg-white/90 border-2 border-[#D4AF37] rounded-lg px-2 py-1 outline-none w-full text-[#2F2F2F] ${className}`}
        placeholder={placeholder}
      />
    )
  }

  return (
    <span
      onClick={() => { setLocal(value); setIsActive(true) }}
      title="Nhấn để chỉnh sửa"
      className={`cursor-text relative group ${className}`}
    >
      {value || <span className="text-[#D4AF37]/50 italic">{placeholder}</span>}
      {/* Underline hint */}
      <span className="absolute bottom-0 left-0 right-0 h-[1px] bg-[#D4AF37]/40 scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />
      <Edit3 size={10} className="inline-block ml-1 text-[#D4AF37]/60 opacity-0 group-hover:opacity-100 transition-opacity" />
    </span>
  )
}

/**
 * ImageEditOverlay: Wraps an image element and shows a click-to-change button in edit mode.
 */
interface ImageEditOverlayProps {
  isEditing: boolean
  imagePath: string
  imageUrl: string
  onImagePick?: (path: string, currentUrl: string) => void
  children: React.ReactNode
  className?: string
}

export function ImageEditOverlay({
  isEditing,
  imagePath,
  imageUrl,
  onImagePick,
  children,
  className = '',
}: ImageEditOverlayProps) {
  if (!isEditing || !onImagePick) return <>{children}</>

  return (
    <div className={`relative group/img cursor-pointer ${className}`} onClick={() => onImagePick(imagePath, imageUrl)}>
      {children}
      <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/40 transition-colors duration-200 flex items-center justify-center rounded-inherit">
        <div className="opacity-0 group-hover/img:opacity-100 transition-opacity duration-200 flex flex-col items-center gap-1 text-white">
          <ImageIcon size={24} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Đổi ảnh</span>
        </div>
      </div>
    </div>
  )
}

/**
 * ArrayActionButtons: Controls for adding/removing items in a list (e.g. Services, Team)
 */
interface ArrayActionButtonsProps {
  onAdd?: () => void
  onRemove?: () => void
  label?: string
  className?: string
}

export function ArrayActionButtons({ onAdd, onRemove, label, className = "" }: ArrayActionButtonsProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {onRemove && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-600 rounded-full transition-colors"
          title="Xóa mục này"
        >
          <Trash2 size={14} />
        </button>
      )}
      {onAdd && (
        <button
          onClick={(e) => { e.stopPropagation(); onAdd(); }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#B8860B] hover:bg-amber-700 text-white text-[10px] font-bold uppercase tracking-wider rounded-full transition-shadow shadow-sm hover:shadow-md"
        >
          <Plus size={14} />
          <span>Thêm {label}</span>
        </button>
      )}
    </div>
  )
}
