'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { Tag, X, ShoppingBag, Plus, Share2, ImageIcon, CheckCircle, Trash2, Copy, ChevronLeft, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { ProductItem } from '@/types/landing-page'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ImagePickerModal } from '@/features/editor/components/ImagePickerModal'
import { generateProductUrl } from '@/lib/utils/slugify'
import { optimizeImageUrl } from '@/lib/utils'
import toast from 'react-hot-toast'

interface ProductGridProps {
  businessId?: string
  businessSlug?: string
  products: ProductItem[]
  sectionTitle?: string
  sectionSubtitle?: string
  themeColor?: string
  isEditing?: boolean
  onUpdate?: (path: string, value: any) => void
  onImagePick?: (path: string, currentUrl: string) => void
}

export function ProductGrid({ businessId, businessSlug, products, sectionTitle, sectionSubtitle, themeColor = '#D4AF37', isEditing, onUpdate, onImagePick }: ProductGridProps) {
  const [localProducts, setLocalProducts] = useState<ProductItem[]>(products)
  const [selectedProduct, setSelectedProduct] = useState<{product: ProductItem, index: number} | null>(null)
  const [activeModalImage, setActiveModalImage] = useState<string | null>(null)
  
  const [isAdding, setIsAdding] = useState(false)
  
  // Image Picker State
  const [pickerOpen, setPickerOpen] = useState(false)
  const [pickingProductIdx, setPickingProductIdx] = useState<number | null>(null)
  const [pickingGalleryIdx, setPickingGalleryIdx] = useState<number | null>(null) // null = main image, -1 = new gallery image, >=0 = replace gallery image

  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    setLocalProducts(products)
  }, [products])

  useEffect(() => {
    if (selectedProduct) {
      setActiveModalImage(selectedProduct.product.img)
    } else {
      setActiveModalImage(null)
    }
  }, [selectedProduct])

  const handleAddProduct = async () => {
    if (!businessId) {
      toast.error('Thiếu thông định doanh nghiệp.')
      return
    }
    
    setIsAdding(true)
    const newProduct = {
      business_id: businessId,
      name: 'Tên Sản Phẩm Mới',
      price: 'Liên hệ',
      category: 'Sản Phẩm',
      description: 'Mô tả chi tiết sản phẩm mới...',
      image_url: '',
      image_gallery: []
    }

    try {
      const { data, error } = await supabase.from('shop_products').insert([newProduct]).select().single()
      if (error) throw error
      
      setLocalProducts(prev => [data, ...prev])
      toast.success('Đã thêm sản phẩm mới!')
      router.refresh()
    } catch (err: any) {
      toast.error('Lỗi thêm sản phẩm: ' + err.message)
    } finally {
      setIsAdding(false)
    }
  }

  const handleDeleteProduct = async (index: number) => {
    if (!confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return
    const product = localProducts[index]
    const newProducts = localProducts.filter((_, i) => i !== index)
    setLocalProducts(newProducts)
    setSelectedProduct(null)

    if (product.id && businessId) {
      try {
        const { error } = await supabase.from('shop_products').delete().eq('id', product.id)
        if (error) throw error
        toast.success('Đã xóa sản phẩm')
        router.refresh()
      } catch (err) {
        toast.error('Lỗi khi xóa sản phẩm')
        setLocalProducts(localProducts)
      }
    } else if (onUpdate) {
      onUpdate('services_menu', newProducts)
      toast.success('Đã xóa sản phẩm')
    }
  }

  const handleDuplicateProduct = async (index: number) => {
    const product = localProducts[index]
    const duplicatedProduct = {
      ...product,
      id: undefined,
      name: product.name + ' (Bản sao)',
      business_id: businessId
    }
    
    setIsAdding(true)
    if (businessId && product.id) {
       try {
         // Chuyển đổi tên field cho DB
         const dbProduct = {
           business_id: businessId,
           name: duplicatedProduct.name,
           price: duplicatedProduct.price,
           price_original: duplicatedProduct.price_original,
           category: duplicatedProduct.category,
           description: duplicatedProduct.desc,
           image_url: duplicatedProduct.img,
           image_gallery: duplicatedProduct.image_gallery || [],
           is_featured: duplicatedProduct.is_featured
         }
         const { data, error } = await supabase.from('shop_products').insert([dbProduct]).select().single()
         if (error) throw error
         
         const newProducts = [...localProducts]
         newProducts.splice(index + 1, 0, {
           ...data,
           desc: data.description,
           img: data.image_url
         })
         setLocalProducts(newProducts)
         toast.success('Đã nhân bản sản phẩm')
         router.refresh()
       } catch (err) {
         toast.error('Lỗi nhân bản sản phẩm')
       }
    } else {
       const newProducts = [...localProducts]
       newProducts.splice(index + 1, 0, duplicatedProduct)
       setLocalProducts(newProducts)
       if (onUpdate) onUpdate('services_menu', newProducts)
       toast.success('Đã nhân bản sản phẩm')
    }
    setIsAdding(false)
    setSelectedProduct(null)
  }

  const handleUpdateProduct = async (index: number, field: string, value: any) => {
    const product = localProducts[index]
    const previousProducts = localProducts
    
    // Optimistic update
    const newProducts = [...localProducts]
    newProducts[index] = { ...newProducts[index], [field]: value }
    setLocalProducts(newProducts)
    
    // Update local state for the modal
    if (selectedProduct && selectedProduct.index === index) {
      setSelectedProduct({ product: { ...selectedProduct.product, [field]: value }, index })
      if (field === 'img' && activeModalImage === selectedProduct.product.img) {
        setActiveModalImage(value)
      }
    }

    // Check if it's a server product (has id)
    if (product.id && businessId) {
      try {
        const dbField = field === 'desc' ? 'description' : field === 'img' ? 'image_url' : field
        const { error } = await supabase.from('shop_products').update({ [dbField]: value }).eq('id', product.id)
        if (error) throw error
        router.refresh()
      } catch(err) {
        setLocalProducts(previousProducts)
        toast.error('Lỗi cập nhật sản phẩm')
      }
    } else if (onUpdate) {
      onUpdate('services_menu', newProducts)
    }
  }

  if ((!localProducts || localProducts.length === 0) && !isEditing) {
    return (
      <section className="bg-[#FAFAF8] px-4 py-12 sm:py-16" id="products">
        <div className="max-w-6xl mx-auto text-center">
          <span className="block text-[10px] font-mono tracking-[0.4em] uppercase mb-3" style={{ color: themeColor }}>
            — Bộ Sưu Tập
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] tracking-tight mb-8">
            {sectionTitle || (
              <>Sản Phẩm <span className="italic font-light" style={{ color: themeColor }}>Nổi Bật</span></>
            )}
          </h2>
          <div className="py-12 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 flex flex-col items-center">
            <ShoppingBag size={48} className="mb-4 opacity-30" />
            <p className="text-sm font-medium">Shop chưa cập nhật sản phẩm.</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="bg-[#FAFAF8] px-4 py-12 sm:py-16" id="products">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <span className="block text-[10px] font-mono tracking-[0.4em] uppercase mb-3" style={{ color: themeColor }}>
            — Bộ Sưu Tập
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-[#1A1A1A] tracking-tight">
            {sectionTitle || (
              <>Sản Phẩm <span className="italic font-light" style={{ color: themeColor }}>Nổi Bật</span></>
            )}
          </h2>
          {sectionSubtitle && (
            <p className="text-gray-500 mt-3 max-w-lg mx-auto">{sectionSubtitle}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
          {localProducts.map((product, idx) => {
            const isSEOReady = !isEditing && product.id && businessSlug
            const productUrl = isSEOReady ? generateProductUrl(businessSlug, product.name, product.id!) : '#'
            
            const CardWrapper = ({ children }: any) => {
              if (isSEOReady) {
                return (
                  <Link 
                    href={productUrl}
                    className="group relative cursor-pointer overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-all duration-500 hover:-translate-y-1 hover:border-[#D4AF37]/50 hover:shadow-xl sm:rounded-2xl block"
                  >
                    {children}
                  </Link>
                )
              }
              return (
                <div
                  onClick={() => setSelectedProduct({ product, index: idx })}
                  className="group relative cursor-pointer overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm transition-all duration-500 hover:-translate-y-1 hover:border-[#D4AF37]/50 hover:shadow-xl sm:rounded-2xl block"
                >
                  {children}
                </div>
              )
            }

            return (
              <CardWrapper key={idx}>
              <div className="relative aspect-[3/4] overflow-hidden bg-gray-50">
               <div className="absolute inset-0 bg-gray-100">
                <Image
                  src={optimizeImageUrl(product.img) || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80'}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 50vw, 33vw"
                  className={`object-cover transition-transform duration-700 ${!isEditing ? 'group-hover:scale-105' : ''}`}
                />
               </div>
                {!product.img && (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <Tag size={32} className="text-gray-300" />
                  </div>
                )}
                {product.is_featured && (
                  <div
                    className="absolute top-3 left-3 text-[9px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full text-white shadow-md"
                    style={{ background: `linear-gradient(135deg, ${themeColor}, #F5E0A3)` }}
                  >
                    Nổi Bật
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <div className="flex items-baseline justify-between">
                    <div className="flex items-baseline gap-2">
                      <span className="text-white font-bold text-sm">{product.price}</span>
                      {product.price_original && (
                        <span className="text-white/50 text-xs line-through">{product.price_original}</span>
                      )}
                    </div>
                    <ShoppingBag size={16} className="text-white/80" />
                  </div>
                </div>
              </div>

              <div className="p-4">
                {product.category && (
                  <span className="text-[9px] uppercase tracking-widest font-medium" style={{ color: themeColor }}>{product.category}</span>
                )}
                <h3 className="text-sm font-semibold text-[#1A1A1A] mt-1 leading-snug line-clamp-2 group-hover:text-[#D4AF37] transition-colors">{product.name}</h3>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="font-bold text-sm text-[#1A1A1A]">{product.price}</span>
                  {product.price_original && (
                    <span className="text-gray-400 text-xs line-through">{product.price_original}</span>
                  )}
                </div>
              </div>
              </CardWrapper>
            )
          })}

          {isEditing && (
            <div
              onClick={handleAddProduct}
              className="cursor-pointer bg-white/50 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border-2 border-dashed border-gray-200 hover:border-[#D4AF37] hover:bg-[#D4AF37]/5 flex flex-col items-center justify-center aspect-[3/4] md:aspect-auto min-h-[300px]"
            >
              <div className="w-16 h-16 rounded-full bg-white shadow-sm flex items-center justify-center text-gray-400 mb-4 transition-transform group-hover:scale-110">
                <Plus size={32} />
              </div>
              <span className="font-bold text-gray-600 text-sm">{isAdding ? 'Đang thêm...' : 'Thêm Sản Phẩm'}</span>
            </div>
          )}
        </div>

        {/* Product Modal */}
        <AnimatePresence>
          {selectedProduct && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedProduct(null)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 md:p-6"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 20 }}
                  onClick={e => e.stopPropagation()}
                  className="bg-white rounded-2xl md:rounded-3xl overflow-y-auto md:overflow-hidden shadow-2xl max-w-4xl w-full max-h-[95vh] md:max-h-[90vh] flex flex-col md:flex-row relative"
                >
                  <button 
                    onClick={() => setSelectedProduct(null)}
                    className="absolute top-4 right-4 z-20 w-8 h-8 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-gray-700 hover:text-black hover:bg-white shadow-md transition-all"
                  >
                    <X size={18} />
                  </button>

                  <div className="md:w-1/2 relative bg-gray-50 flex flex-col shrink-0">
                    {/* Main Image */}
                    <div className="relative aspect-square max-h-[50vh] md:max-h-none w-full group overflow-hidden">
                      {activeModalImage ? (
                        <Image
                          src={optimizeImageUrl(activeModalImage)}
                          alt={selectedProduct.product.name}
                          fill
                          className="object-contain"
                          priority
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Tag size={48} className="text-gray-300" />
                        </div>
                      )}

                      {/* Image Editor Overlay */}
                      {isEditing && (
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          {activeModalImage === selectedProduct.product.img ? (
                            <button
                              onClick={() => {
                                setPickingProductIdx(selectedProduct.index)
                                setPickingGalleryIdx(null)
                                setPickerOpen(true)
                              }}
                              className="bg-white text-black px-6 py-3 rounded-full font-bold shadow-lg flex items-center gap-2 hover:scale-105 transition-transform text-sm"
                            >
                              <ImageIcon size={18} /> Đổi ảnh chính
                            </button>
                          ) : (
                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  const gIdx = selectedProduct.product.image_gallery?.findIndex(url => url === activeModalImage) ?? -1
                                  if (gIdx >= 0) {
                                    setPickingProductIdx(selectedProduct.index)
                                    setPickingGalleryIdx(gIdx)
                                    setPickerOpen(true)
                                  }
                                }}
                                className="bg-white text-black px-4 py-2 rounded-full font-bold shadow-lg flex items-center gap-2 hover:scale-105 transition-transform text-sm"
                              >
                                Đổi ảnh này
                              </button>
                              <button
                                onClick={() => {
                                  if (!confirm('Xóa ảnh này?')) return;
                                  const newGallery = (selectedProduct.product.image_gallery || []).filter(url => url !== activeModalImage)
                                  handleUpdateProduct(selectedProduct.index, 'image_gallery', newGallery)
                                  setActiveModalImage(selectedProduct.product.img)
                                }}
                                className="bg-red-50 text-red-600 px-4 py-2 rounded-full font-bold shadow-lg flex items-center gap-2 hover:scale-105 transition-transform text-sm"
                              >
                                Xóa
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Gallery Thumbnails */}
                    {((selectedProduct.product.image_gallery && selectedProduct.product.image_gallery.length > 0) || isEditing) && (
                      <div className="p-4 flex gap-2 overflow-x-auto border-t border-gray-100 hide-scrollbar bg-white">
                        <div 
                          onClick={() => setActiveModalImage(selectedProduct.product.img)}
                          className={`relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${activeModalImage === selectedProduct.product.img ? 'border-[#D4AF37] opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
                        >
                          {selectedProduct.product.img ? (
                            <Image src={selectedProduct.product.img} alt="Main" fill className="object-cover" />
                          ) : (
                            <div className="w-full h-full bg-gray-100 flex items-center justify-center"><Tag size={16} className="text-gray-300"/></div>
                          )}
                        </div>
                        
                        {selectedProduct.product.image_gallery?.map((url, idx) => (
                          <div 
                            key={idx}
                            onClick={() => setActiveModalImage(url)}
                            className={`relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${activeModalImage === url ? 'border-[#D4AF37] opacity-100' : 'border-transparent opacity-60 hover:opacity-100'}`}
                          >
                            <Image src={url} alt={`Gallery ${idx}`} fill className="object-cover" />
                          </div>
                        ))}

                        {isEditing && (
                          <div 
                            onClick={() => {
                              setPickingProductIdx(selectedProduct.index)
                              setPickingGalleryIdx(-1) // Thêm ảnh mới
                              setPickerOpen(true)
                            }}
                            className="w-16 h-16 flex-shrink-0 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-[#D4AF37] hover:bg-[#D4AF37]/5 transition-all group"
                          >
                            <Plus size={20} className="text-gray-400 group-hover:text-[#D4AF37] transition-colors" />
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="md:w-1/2 p-5 md:p-10 flex flex-col md:overflow-y-auto shrink-0">
                    {/* Admin Actions Toolbar */}
                    {isEditing && (
                      <div className="flex items-center gap-2 mb-6 p-3 bg-red-50/50 rounded-xl border border-red-100 justify-end">
                        <span className="text-xs text-gray-500 mr-auto font-medium">Quản lý sản phẩm</span>
                        <button 
                          onClick={() => handleDuplicateProduct(selectedProduct.index)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-white text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
                        >
                          <Copy size={14} /> Nhân bản
                        </button>
                        <button 
                          onClick={() => handleDeleteProduct(selectedProduct.index)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition-colors shadow-sm"
                        >
                          <Trash2 size={14} /> Xóa SP
                        </button>
                      </div>
                    )}

                    {isEditing ? (
                      <div
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={e => handleUpdateProduct(selectedProduct.index, 'category', e.currentTarget.textContent)}
                        className="text-[10px] font-bold tracking-widest uppercase mb-3 outline-none border-b border-dashed border-gray-300 inline-block w-fit shrink-0"
                        style={{ color: themeColor }}
                      >
                        {selectedProduct.product.category || 'Danh mục'}
                      </div>
                    ) : selectedProduct.product.category && (
                      <span className="text-[10px] font-bold tracking-widest uppercase mb-3 shrink-0" style={{ color: themeColor }}>
                        {selectedProduct.product.category}
                      </span>
                    )}
                    
                    {isEditing ? (
                      <h3
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={e => handleUpdateProduct(selectedProduct.index, 'name', e.currentTarget.textContent)}
                        className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight mb-4 outline-none border-b border-dashed border-gray-300 shrink-0"
                      >
                        {selectedProduct.product.name}
                      </h3>
                    ) : (
                      <h3 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight mb-4 shrink-0">
                        {selectedProduct.product.name}
                      </h3>
                    )}
                    
                    {/* Price UI */}
                    {isEditing ? (
                      <div className="shrink-0 mb-6 bg-white p-5 rounded-2xl border-2 border-[#D4AF37]/20 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-1 h-full" style={{ backgroundColor: themeColor }} />
                        <h4 className="text-[11px] font-bold text-gray-700 uppercase tracking-widest mb-4 flex items-center gap-2">
                          Cấu Hình Giá Bán 
                          <span className="bg-[#D4AF37]/10 text-[#D4AF37] text-[9px] px-2 py-0.5 rounded-full">Sửa</span>
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 focus-within:border-[#D4AF37]/50 transition-colors">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Giá Bán (Hiển thị chính)</label>
                            <input 
                              type="text" 
                              value={selectedProduct.product.price} 
                              onChange={e => handleUpdateProduct(selectedProduct.index, 'price', e.target.value)}
                              className="text-xl font-bold bg-transparent outline-none w-full pb-1"
                              placeholder="VD: 490.000đ"
                              style={{ color: themeColor }}
                            />
                          </div>
                          
                          <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 focus-within:border-gray-300 transition-colors">
                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">Giá Gốc (Gạch ngang)</label>
                            <input 
                              type="text" 
                              value={selectedProduct.product.price_original || ''} 
                              onChange={e => handleUpdateProduct(selectedProduct.index, 'price_original', e.target.value)}
                              className="text-sm text-gray-500 bg-transparent outline-none w-full pb-1 mt-1"
                              placeholder="Không bắt buộc"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-baseline gap-3 mb-6 pb-6 border-b border-gray-100">
                        <span className="text-2xl font-bold" style={{ color: themeColor }}>
                          {selectedProduct.product.price}
                        </span>
                        {selectedProduct.product.price_original && (
                          <span className="text-gray-400 line-through text-sm">
                            {selectedProduct.product.price_original}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="flex-1 shrink-0 min-h-[100px]">
                      <h4 className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">Mô tả sản phẩm</h4>
                      {isEditing ? (
                        <p
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={e => handleUpdateProduct(selectedProduct.index, 'desc', e.currentTarget.textContent)}
                          className="text-gray-600 leading-relaxed text-sm whitespace-pre-line outline-none border-b border-dashed border-transparent focus:border-gray-300"
                        >
                          {selectedProduct.product.desc || 'Nhập mô tả sản phẩm...'}
                        </p>
                      ) : (
                        <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-line">
                          {selectedProduct.product.desc || 'Chưa có thông tin mô tả chi tiết cho sản phẩm này.'}
                        </p>
                      )}
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col gap-3 shrink-0">
                      {isEditing ? (
                        <button
                          onClick={() => setSelectedProduct(null)}
                          className="w-full py-4 rounded-xl flex items-center justify-center gap-2 text-white font-bold uppercase tracking-wide transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 bg-gray-900"
                        >
                          <CheckCircle size={18} />
                          Hoàn Tất & Đóng
                        </button>
                      ) : (
                        <a
                          href="#contact"
                          onClick={() => setSelectedProduct(null)}
                          className="w-full py-4 rounded-xl flex items-center justify-center gap-2 text-white font-bold uppercase tracking-wide transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                          style={{ background: `linear-gradient(135deg, ${themeColor}, #B8860B)` }}
                        >
                          <ShoppingBag size={18} />
                          Liên Hệ Mua Hàng
                        </a>
                      )}

                      {!isEditing && (
                        <button 
                          onClick={() => {
                            if (navigator.share) {
                              navigator.share({ 
                                title: selectedProduct.product.name, 
                                text: selectedProduct.product.desc,
                                url: window.location.href 
                              })
                            } else {
                              navigator.clipboard.writeText(window.location.href)
                              alert('Đã copy đường dẫn!')
                            }
                          }}
                          className="w-full py-3 rounded-xl flex items-center justify-center gap-2 text-gray-600 font-bold uppercase tracking-wide border-2 border-gray-100 hover:bg-gray-50 transition-all"
                        >
                          <Share2 size={16} />
                          Chia Sẻ
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <ImagePickerModal 
          isOpen={pickerOpen}
          onClose={() => setPickerOpen(false)}
          businessId={businessId}
          currentUrl={
            pickingProductIdx !== null && localProducts[pickingProductIdx] 
              ? (pickingGalleryIdx === null 
                  ? localProducts[pickingProductIdx].img 
                  : pickingGalleryIdx >= 0 && localProducts[pickingProductIdx].image_gallery
                    ? localProducts[pickingProductIdx].image_gallery![pickingGalleryIdx]
                    : '') 
              : ''
          }
          onSelect={(url) => {
            if (pickingProductIdx !== null) {
              if (pickingGalleryIdx === null) {
                // Đổi ảnh chính
                handleUpdateProduct(pickingProductIdx, 'img', url)
              } else if (pickingGalleryIdx === -1) {
                // Thêm ảnh phụ mới
                const currentGallery = localProducts[pickingProductIdx].image_gallery || []
                handleUpdateProduct(pickingProductIdx, 'image_gallery', [...currentGallery, url])
              } else {
                // Sửa ảnh phụ hiện tại
                const currentGallery = [...(localProducts[pickingProductIdx].image_gallery || [])]
                currentGallery[pickingGalleryIdx] = url
                handleUpdateProduct(pickingProductIdx, 'image_gallery', currentGallery)
              }
            }
            setPickerOpen(false)
          }}
        />
      </div>
    </section>
  )
}
