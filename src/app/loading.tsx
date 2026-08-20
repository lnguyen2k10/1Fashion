'use client'

import React from 'react'
import { motion } from 'framer-motion'

export default function RootLoading() {
  return (
    <div className="min-h-screen z-50 flex items-center justify-center bg-white">
      <div className="w-8 h-8 rounded-full border-[2px] border-gray-200 border-t-[#1A1A1A] animate-spin" />
    </div>
  )
}
