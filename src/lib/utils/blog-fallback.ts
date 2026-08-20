export function getBlogFallbackImage(category?: string | null): string {
  const cat = category?.toLowerCase() || '';
  
  if (cat.includes('trang sức') || cat.includes('phụ kiện')) {
    return 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&q=80';
  }
  if (cat.includes('giày') || cat.includes('dép')) {
    return 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80';
  }
  if (cat.includes('trẻ em')) {
    return 'https://images.unsplash.com/photo-1519689680058-324335c77eba?auto=format&fit=crop&q=80';
  }
  if (cat.includes('hàng hiệu') || cat.includes('luxury')) {
    return 'https://images.unsplash.com/photo-1549439602-43ebca2327af?auto=format&fit=crop&q=80';
  }
  if (cat.includes('streetwear')) {
    return 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&q=80';
  }
  if (cat.includes('khuyến mãi') || cat.includes('sale')) {
    return 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?auto=format&fit=crop&q=80';
  }

  // Default Fashion/Clothing Fallback
  return 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80';
}
