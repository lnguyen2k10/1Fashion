'use client'

import { useState, useRef } from 'react'
import NextImage from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Link, X, Check, Image as ImageIcon, Loader2 } from 'lucide-react'
import { uploadShopImage } from '@/lib/storage/shop-images'

interface ImagePickerModalProps {
  isOpen: boolean
  onClose: () => void
  onSelect: (url: string) => void
  currentUrl?: string
  businessId?: string
}

export function ImagePickerModal({ isOpen, onClose, onSelect, currentUrl, businessId }: ImagePickerModalProps) {
  const [mode, setMode] = useState<'upload' | 'link'>('upload')
  const [linkValue, setLinkValue] = useState(currentUrl || '')
  const [preview, setPreview] = useState(currentUrl || '')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Ảnh phải nhỏ hơn 5MB')
      return
    }

    setUploadError('')
    setIsUploading(true)
    try {
      const publicUrl = await uploadShopImage(file, 'editor', businessId)

      setPreview(publicUrl)
      setLinkValue(publicUrl)
    } catch (err: any) {
      setUploadError('Tải ảnh thất bại: ' + err.message)
    } finally {
      setIsUploading(false)
    }
  }

  const handleLinkChange = (val: string) => {
    setLinkValue(val)
    setPreview(val)
  }

  const handleConfirm = () => {
    if (preview) {
      onSelect(preview)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[9000] bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-0 z-[9001] flex items-center justify-center p-4 pointer-events-none"
          >
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg pointer-events-auto overflow-hidden border border-[#D4AF37]/10">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[#D4AF37]/10">
                <div className="flex items-center gap-2">
                  <ImageIcon size={18} className="text-[#D4AF37]" />
                  <h3 className="font-bold text-sm text-[#2F2F2F] tracking-wide">Chọn / Tải ảnh</h3>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-full hover:bg-[#D4AF37]/10 text-[#2F2F2F]/50 hover:text-[#2F2F2F] transition-colors"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-6 space-y-5">
                {/* Mode Toggle */}
                <div className="flex bg-[#ffffff] rounded-xl p-1 border border-[#D4AF37]/10">
                  <button
                    onClick={() => setMode('upload')}
                    className={`flex-1 py-2.5 rounded-lg text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-2 transition-all ${mode === 'upload' ? 'bg-[#D4AF37] text-white shadow-md' : 'text-[#2F2F2F]/50 hover:text-[#2F2F2F]'}`}
                  >
                    <Upload size={13} /> Tải từ máy
                  </button>
                  <button
                    onClick={() => setMode('link')}
                    className={`flex-1 py-2.5 rounded-lg text-xs font-bold tracking-wider uppercase flex items-center justify-center gap-2 transition-all ${mode === 'link' ? 'bg-[#D4AF37] text-white shadow-md' : 'text-[#2F2F2F]/50 hover:text-[#2F2F2F]'}`}
                  >
                    <Link size={13} /> Dán link URL
                  </button>
                </div>

                {/* Upload Mode */}
                {mode === 'upload' && (
                  <div className="space-y-3">
                    <input ref={fileRef} type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    <div
                      onClick={() => fileRef.current?.click()}
                      className="border-2 border-dashed border-[#D4AF37]/30 rounded-2xl p-8 text-center cursor-pointer hover:border-[#D4AF37]/60 hover:bg-[#D4AF37]/5 transition-all group"
                    >
                      {isUploading ? (
                        <div className="flex flex-col items-center gap-3">
                          <Loader2 size={32} className="text-[#D4AF37] animate-spin" />
                          <p className="text-xs font-bold text-[#2F2F2F]/50">Đang tải lên...</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-[#D4AF37]/10 flex items-center justify-center group-hover:bg-[#D4AF37]/20 transition-colors">
                            <Upload size={22} className="text-[#D4AF37]" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-[#2F2F2F]">Nhấn để chọn ảnh</p>
                            <p className="text-xs text-[#2F2F2F]/40 mt-1">PNG, JPG, WEBP – tối đa 5MB</p>
                          </div>
                        </div>
                      )}
                    </div>
                    {uploadError && (
                      <p className="text-xs text-red-500 font-bold text-center">{uploadError}</p>
                    )}
                  </div>
                )}

                {/* Link Mode */}
                {mode === 'link' && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#2F2F2F]/50 uppercase tracking-widest block">URL ảnh</label>
                    <input
                      type="text"
                      value={linkValue}
                      onChange={(e) => handleLinkChange(e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full bg-[#ffffff] border border-[#D4AF37]/20 rounded-xl px-4 py-3 text-xs font-mono outline-none focus:border-[#D4AF37] transition-colors"
                    />
                  </div>
                )}

                {/* Preview */}
                {preview && (
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-[#2F2F2F]/40 uppercase tracking-widest">Xem trước</p>
                    <div className="w-full h-44 rounded-2xl overflow-hidden border border-[#D4AF37]/15 bg-[#ffffff]">
                      <NextImage
                        src={preview}
                        alt="Preview"
                        width={640}
                        height={352}
                        unoptimized
                        className="w-full h-full object-cover"
                        onError={() => setPreview('')}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#D4AF37]/10 bg-[#ffffff]/50">
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-full text-xs font-bold text-[#2F2F2F]/50 hover:text-[#2F2F2F] transition-colors uppercase tracking-widest"
                >
                  Hủy
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={!preview || isUploading}
                  className="px-6 py-2.5 rounded-full text-xs font-bold bg-[#D4AF37] text-white uppercase tracking-widest flex items-center gap-2 hover:bg-[#B8860B] transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
                >
                  <Check size={13} /> Áp dụng
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
