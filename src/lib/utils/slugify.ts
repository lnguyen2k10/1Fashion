export function toSlug(str: string): string {
  if (!str) return ''
  return str
    .toLowerCase()
    .normalize('NFD') // Chuẩn hóa unicode
    .replace(/[\u0300-\u036f]/g, '') // Bỏ dấu
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '') // Xóa ký tự đặc biệt
    .trim()
    .replace(/\s+/g, '-') // Đổi khoảng trắng thành gạch ngang
    .replace(/-+/g, '-') // Xóa gạch ngang thừa
}

export function generateProductUrl(shopSlug: string, productName: string, productId: string) {
  const slug = toSlug(productName)
  return `/${shopSlug}/${slug}-i.${productId}`
}

export function extractIdFromSlug(slug: string): string | null {
  const parts = slug.split('-i.')
  if (parts.length === 2) {
    return parts[1]
  }
  return null
}
