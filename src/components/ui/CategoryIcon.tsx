import React from 'react'
import * as LucideIcons from 'lucide-react'

interface CategoryIconProps {
  name: string
  size?: number
  className?: string
}

export function CategoryIcon({ name, size = 24, className = '' }: CategoryIconProps) {
  // Tìm Icon Component trong thư viện Lucide
  const IconComponent = (LucideIcons as any)[name]

  // Nếu là Lucide Icon hợp lệ
  if (IconComponent) {
    return <IconComponent size={size} className={className} />
  }

  // Nếu nhập sai tên icon, hiển thị hộp Box mặc định
  return <LucideIcons.Box size={size} className={className} />
}
