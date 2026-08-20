import { useState } from 'react'
import { uploadShopImage } from '@/lib/storage/shop-images'

export function useFileUpload() {
  const [isUploading, setIsUploading] = useState(false)

  const uploadFile = async (file: File, assetType: 'logo' | 'editor' | 'product' | 'receipt' | 'avatar' = 'editor') => {
    if (!file) return null
    setIsUploading(true)
    try {
      return await uploadShopImage(file, assetType)
    } finally {
      setIsUploading(false)
    }
  }

  return { uploadFile, isUploading }
}
