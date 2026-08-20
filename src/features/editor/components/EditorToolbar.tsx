'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Save, X, Eye, Sparkles, Loader2, Send, ArrowLeft } from 'lucide-react'

interface EditorToolbarProps {
  onSaveDraft: () => void
  onPublish: () => void
  onCancel: () => void
  isSaving: boolean
  isPublishing: boolean
  hasChanges: boolean
  isPreviewMode: boolean
  onTogglePreview: () => void
}

export const EditorToolbar = ({
  onSaveDraft,
  onPublish,
  onCancel,
  isSaving,
  isPublishing,
  hasChanges,
  isPreviewMode,
  onTogglePreview,
}: EditorToolbarProps) => {
  const isBusy = isSaving || isPublishing

  return (
    <>
      {/* ── DESKTOP: floating top bar ────────────────────────────────── */}
      <motion.div
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        className="fixed left-1/2 top-4 z-[100] hidden md:block w-full max-w-4xl -translate-x-1/2 px-4"
      >
        <div className="flex items-center justify-between gap-4 rounded-2xl border border-[#D4AF37]/30 bg-white/95 px-4 py-3 shadow-[0_20px_50px_rgba(212,175,55,0.15)] backdrop-blur-xl">
          {/* Brand */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#D4AF37] to-[#B8860B] flex items-center justify-center text-white shadow-inner">
              <Sparkles size={17} />
            </div>
            <div>
              <p className="text-[9px] font-mono uppercase tracking-widest text-[#2F2F2F]/50">Chế độ chỉnh sửa</p>
              <p className="text-xs font-bold text-[#2F2F2F] uppercase tracking-wider leading-none">Visual Editor</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {/* Preview toggle */}
            <button
              onClick={onTogglePreview}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-mono font-bold uppercase tracking-widest transition-all border ${
                isPreviewMode
                  ? 'bg-[#2F2F2F] text-white border-[#2F2F2F]'
                  : 'bg-white text-[#2F2F2F] border-zinc-200 hover:border-[#D4AF37] hover:text-[#D4AF37]'
              }`}
            >
              <Eye size={13} />
              {isPreviewMode ? 'Tắt xem trước' : 'Xem trước'}
            </button>

            {/* Exit */}
            <button
              onClick={onCancel}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-mono font-bold uppercase tracking-widest text-[#2F2F2F]/60 hover:text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all"
            >
              <X size={13} />
              {hasChanges ? 'Hủy' : 'Đóng'}
            </button>

            {/* Save draft */}
            <button
              onClick={onSaveDraft}
              disabled={!hasChanges || isBusy}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[10px] font-mono font-bold uppercase tracking-widest transition-all border shadow-sm ${
                hasChanges && !isBusy
                  ? 'bg-amber-50 text-[#D4AF37] border-amber-200 hover:bg-amber-100'
                  : 'bg-zinc-50 text-zinc-400 border-zinc-100 cursor-not-allowed'
              }`}
            >
              {isSaving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
              Lưu nháp
            </button>

            {/* Publish */}
            <button
              onClick={onPublish}
              disabled={isBusy}
              className={`flex items-center gap-1.5 px-5 py-2 rounded-lg text-[10px] font-mono font-bold uppercase tracking-widest transition-all shadow-lg ${
                !isBusy
                  ? 'bg-gradient-to-r from-[#2F2F2F] to-[#1A1A1A] text-white hover:shadow-xl hover:-translate-y-0.5'
                  : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
              }`}
            >
              {isPublishing ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
              Xuất bản
            </button>
          </div>
        </div>

        {/* Unsaved changes indicator */}
        <AnimatePresence>
          {hasChanges && !isBusy && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-[#D4AF37] px-4 py-1 rounded-full shadow-md"
            >
              <p className="text-[9px] font-mono font-bold text-white uppercase tracking-wider">Có thay đổi chưa lưu *</p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ── MOBILE: sticky bottom bar ─────────────────────────────────── */}
      {/* Sits above browser chrome using safe-area-inset-bottom */}
      <motion.div
        initial={{ y: 120, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28, delay: 0.1 }}
        className="fixed inset-x-0 bottom-0 z-[100] md:hidden"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {/* Unsaved dot — shown above bar */}
        <AnimatePresence>
          {hasChanges && !isBusy && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex justify-center mb-1 pointer-events-none"
            >
              <span className="bg-[#D4AF37] text-white text-[9px] font-mono font-bold uppercase tracking-widest px-3 py-0.5 rounded-full shadow">
                Chưa lưu *
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mx-2 mb-2 flex items-center gap-2 rounded-2xl border border-[#D4AF37]/30 bg-white/97 px-3 py-2.5 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] backdrop-blur-xl">
          {/* Exit button — leftmost, most prominent on mobile */}
          <button
            onClick={onCancel}
            className="flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl text-[10px] font-semibold text-zinc-500 hover:text-red-500 hover:bg-red-50 transition-colors min-w-[44px]"
          >
            <ArrowLeft size={18} />
            <span className="leading-none">Thoát</span>
          </button>

          <div className="w-px h-8 bg-zinc-100 mx-1 shrink-0" />

          {/* Preview toggle */}
          <button
            onClick={onTogglePreview}
            className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl text-[10px] font-semibold transition-colors min-w-[44px] ${
              isPreviewMode ? 'text-[#B8860B] bg-amber-50' : 'text-zinc-500'
            }`}
          >
            <Eye size={18} />
            <span className="leading-none">{isPreviewMode ? 'Tắt xem' : 'Xem trước'}</span>
          </button>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Save draft */}
          <button
            onClick={onSaveDraft}
            disabled={!hasChanges || isBusy}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
              hasChanges && !isBusy
                ? 'bg-amber-50 text-[#D4AF37] border-amber-200 active:bg-amber-100'
                : 'bg-zinc-50 text-zinc-300 border-zinc-100 cursor-not-allowed'
            }`}
          >
            {isSaving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            <span>Lưu nháp</span>
          </button>

          {/* Publish */}
          <button
            onClick={onPublish}
            disabled={isBusy}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md ${
              !isBusy
                ? 'bg-[#2F2F2F] text-white active:bg-[#1A1A1A]'
                : 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
            }`}
          >
            {isPublishing ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
            <span>Xuất bản</span>
          </button>
        </div>
      </motion.div>

      {/* ── MOBILE: spacer so page content doesn't hide behind toolbar ── */}
      <div className="h-[80px] md:hidden" aria-hidden="true" />
    </>
  )
}
