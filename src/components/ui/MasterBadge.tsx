'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface MasterBadgeProps {
  level: number
  label?: string
  className?: string
}

export const MasterBadge: React.FC<MasterBadgeProps> = ({ level, label, className }) => {
  const isMaster = level <= 2
  const isExpert = level > 2 && level <= 4

  const gradientClass = isMaster 
    ? 'text-luxury-gold animate-pulse-gold' 
    : isExpert 
      ? 'text-luxury-silver' 
      : 'text-muted'

  const borderGradient = isMaster
    ? 'border-[#D4AF37]/30 shadow-[0_0_15px_rgba(212,175,55,0.1)]'
    : isExpert
      ? 'border-white/20'
      : 'border-white/5'

  return (
    <motion.div 
      className={`inline-flex items-center gap-2 px-3 py-1 rounded-full glass-3d ${borderGradient} ${className}`}
      whileHover={{ scale: 1.05 }}
    >
      <div className={`w-1.5 h-1.5 rounded-full ${isMaster ? 'bg-accent shadow-[0_0_8px_#D4AF37]' : 'bg-zinc-500'}`} />
      <span className={`text-[10px] font-mono uppercase tracking-[0.2em] ${gradientClass}`}>
        {label || `Level ${level}`}
      </span>
    </motion.div>
  )
}
