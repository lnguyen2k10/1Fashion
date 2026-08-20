import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY // Cần có quyền ghi vào Storage

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

/**
 * Uploads an image from a URL to Supabase Storage.
 * MỤC ĐÍCH SỬ DỤNG:
 * Script này chỉ phục vụ upload các hình ảnh mà 1Fashion có QUYỀN SỬ DỤNG (ảnh chính thức từ doanh nghiệp, website chính thức).
 * KHÔNG dùng script này để cào (scrape) và copy hàng loạt ảnh từ các marketplace (Shopee, Lazada, v.v.).
 */
async function uploadImageFromUrl(imageUrl, bucketName = 'public_images') {
  if (!imageUrl) {
    console.error('Vui lòng cung cấp URL ảnh.')
    return null
  }

  try {
    console.log(`Đang tải ảnh từ: ${imageUrl}...`)
    const response = await fetch(imageUrl)
    if (!response.ok) {
      throw new Error(`Lỗi khi tải ảnh: ${response.statusText}`)
    }

    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    
    // Tạo tên file ngẫu nhiên dựa trên timestamp
    const ext = imageUrl.split('.').pop()?.split('?')[0] || 'jpg'
    const fileName = `import_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`
    
    console.log(`Đang upload lên Supabase Storage (${bucketName}/${fileName})...`)
    const { data, error } = await supabase
      .storage
      .from(bucketName)
      .upload(fileName, buffer, {
        contentType: response.headers.get('content-type') || `image/${ext}`,
        upsert: false
      })

    if (error) {
      throw error
    }

    const { data: { publicUrl } } = supabase.storage.from(bucketName).getPublicUrl(data.path)
    console.log('\n✅ Upload thành công!')
    console.log('Permanent URL:', publicUrl)
    return publicUrl

  } catch (err) {
    console.error('\n❌ Lỗi:', err.message)
    return null
  }
}

// Chạy trực tiếp từ CLI nếu có argument
const args = process.argv.slice(2)
if (args.length > 0) {
  const url = args[0]
  uploadImageFromUrl(url)
}

export { uploadImageFromUrl }
