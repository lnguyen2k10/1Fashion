'use client'

import { createClient } from '@/lib/supabase/client'

const MAX_IMAGE_SIZE = 5 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])

export async function uploadShopImage(file: File, assetType: 'logo' | 'editor' | 'product' | 'receipt' | 'avatar' = 'editor', explicitShopId?: string) {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) throw new Error('Chỉ hỗ trợ JPG, PNG, WEBP hoặc GIF.')
  if (file.size > MAX_IMAGE_SIZE) throw new Error('Ảnh phải nhỏ hơn 5MB.')

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Vui lòng đăng nhập trước khi tải ảnh.')

  let targetShopId = explicitShopId

  if (!targetShopId) {
    const { data: shop, error: shopError } = await supabase
      .from('business_profiles')
      .select('id')
      .eq('account_id', user.id)
      .maybeSingle()
    if (shopError || !shop) throw new Error('Không tìm thấy shop thuộc tài khoản này.')
    targetShopId = shop.id
  }

  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const filePath = `shops/${targetShopId}/${assetType}/${crypto.randomUUID()}.${extension}`
  const { error } = await supabase.storage.from('public_images').upload(filePath, file, {
    cacheControl: '31536000',
    upsert: false,
    contentType: file.type,
  })
  if (error) throw error

  return supabase.storage.from('public_images').getPublicUrl(filePath).data.publicUrl
}
