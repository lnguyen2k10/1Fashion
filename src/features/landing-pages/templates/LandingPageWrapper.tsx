'use client'
import toast from 'react-hot-toast';

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { EditorToolbar } from '@/features/editor/components/EditorToolbar'
import { MarketTemplate } from '@/features/landing-pages/templates/market-v1/MarketTemplate'
import { ImagePickerModal } from '@/features/editor/components/ImagePickerModal'
import { DEFAULT_THEME_COLOR } from '@/lib/constants'
import { confirmAction } from '@/lib/confirm'

import { LandingPageData } from '@/types/landing-page'

interface WrapperProps {
  business: any
  isEditMode: boolean
  serverOffers?: any[]
  serverProducts?: any[]
  serverOperatingHours?: any[]
}

export default function LandingPageWrapper({ business, isEditMode, serverOffers = [], serverProducts = [], serverOperatingHours = [] }: WrapperProps) {
  // Bug fix: init from draft_json (what editor loads) not content_json (published)
  const initialData: LandingPageData = business.draft_json || business.content_json || {}
  const [data, setData] = useState<LandingPageData>(initialData)
  const [hasChanges, setHasChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [isPreviewMode, setIsPreviewMode] = useState(false)

  // Image Picker State
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const [activeImagePath, setActiveImagePath] = useState('')
  const [activeImageUrl, setActiveImageUrl] = useState('')

  // Use ref for supabase to keep stable reference across renders
  const supabase = useRef(createClient()).current
  // Keep a stable ref to the landing page ID
  const landingPageId = business.landing_page_id || business.id

  useEffect(() => {
    // Track View Analytics (view-mode only)
    if (!isEditMode && business.business_id) {
      void fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessId: business.business_id, eventType: 'view', pageSlug: business.business_slug }),
        keepalive: true,
      })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Bug fix: wrap in useCallback so auto-save effect dep array is stable
  const handleSaveDraft = useCallback(async (silent = false) => {
    if (!silent) setIsSaving(true)
    try {
      const { error } = await supabase
        .from('landing_pages')
        .update({ draft_json: data, updated_at: new Date().toISOString() })
        .eq('id', landingPageId)

      if (error) throw error
      setHasChanges(false)
      if (!silent) toast.success('Đã lưu bản nháp thành công!')
    } catch (error: any) {
      if (!silent) toast.error('Lưu nháp thất bại: ' + error.message)
      else console.error('[auto-save] draft save failed:', error.message)
    } finally {
      if (!silent) setIsSaving(false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, supabase, landingPageId])

  // Bug fix: correct dependency array — includes isEditMode and stable handleSaveDraft
  useEffect(() => {
    if (!isEditMode || !hasChanges) return
    const timer = setTimeout(() => { handleSaveDraft(true) }, 5000)
    return () => clearTimeout(timer)
  }, [data, hasChanges, isEditMode, handleSaveDraft])


  const handleUpdate = (path: string, value: any) => {
    setHasChanges(true)
    setData((prev: any) => {
      const newData = JSON.parse(JSON.stringify(prev || {}))
      const keys = path.replace(/\]/g, '').split(/[.\[]/).filter(Boolean)
      let current = newData
      for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i]
        const nextKey = keys[i + 1]
        if (current[key] === undefined || current[key] === null) {
          current[key] = isNaN(Number(nextKey)) ? {} : []
        }
        current = current[key]
      }
      current[keys[keys.length - 1]] = value
      return newData
    })
  }

  // handleSaveDraft is now defined above with useCallback

  const handlePublish = async () => {
    setIsPublishing(true)
    try {
      const { error } = await supabase
        .from('landing_pages')
        .update({
          content_json: data,
          draft_json: data,
          status: 'Published',
          is_published: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', landingPageId)

      if (error) throw error
      setHasChanges(false)
      toast.success('Đã xuất bản trang thành công! 🎉')
    } catch (error: any) {
      toast.error('Lỗi khi xuất bản: ' + error.message)
    } finally {
      setIsPublishing(false)
    }
  }

  const handleCancel = async () => {
    if (hasChanges) {
      const confirmed = await confirmAction('Bạn có chắc muốn thoát? Các thay đổi chưa lưu sẽ bị mất.')
      if (!confirmed) return
    }
    // Bug fix: reset to draft_json (what was loaded), not content_json (published)
    setData(business.draft_json || business.content_json || {})
    setHasChanges(false)
    if (isEditMode) window.location.href = '/dashboard/store'
  }

  const props = {
    data: data,
    isEditing: isEditMode && !isPreviewMode,
    onUpdate: handleUpdate,
    businessInfo: {
      id: business.business_id || business.id,
      name: business.business_name,
      category: business.category,
      district: business.location_district,
      city: business.location_city,
      zalo: business.zalo_phone,
      hotline: business.hotline,
      slug: business.business_slug,
      logo_url: business.logo_url,
      is_verified: business.is_verified,
      lat: business.lat || null,
      lng: business.lng || null,
      address_full: business.address_full || '',
      email_owner: business.email_owner || ''
    },
    onImagePick: (path: string, currentUrl: string) => {
      setActiveImagePath(path)
      setActiveImageUrl(currentUrl)
      setIsPickerOpen(true)
    },
    serverOffers: serverOffers.map((o: any) => ({
      ...o,
      status: o.status || 'active'
    })),
    serverProducts: serverProducts.map((p: any) => ({
      id: p.id,
      name: p.name,
      desc: p.description,
      price: p.price || 'Liên hệ',
      price_original: p.price_original,
      img: p.image_url || '',
      category: p.category,
      tags: p.tags,
      is_featured: p.is_featured,
      image_gallery: p.gallery_images || []
    })),
    serverOperatingHours
  }

  const renderTemplate = () => {
    // Always render MarketTemplate — merge DB data with content_json defaults
    // contact_info should also pull from business profile fields
    const mergedData = {
      ...data,
      contact_info: {
        address_full: data?.contact_info?.address_full || (props.businessInfo.address_full ?? ''),
        hotline: data?.contact_info?.hotline || (props.businessInfo.hotline ?? ''),
        email: data?.contact_info?.email || '',
        zalo: data?.contact_info?.zalo || (props.businessInfo.zalo ?? ''),
        website: data?.contact_info?.website || '',
        social_links: data?.contact_info?.social_links || [],
        operating_hours_text: data?.contact_info?.operating_hours_text || ''
      }
    }

    return (
      <MarketTemplate
        {...props}
        data={mergedData}
        defaults={{
          themeColor: business.theme_color || DEFAULT_THEME_COLOR
        }}
      />
    )
  }

  return (
    <>
      {isEditMode && (
        <EditorToolbar 
          onSaveDraft={() => handleSaveDraft(false)}
          onPublish={handlePublish}
          onCancel={handleCancel}
          isSaving={isSaving}
          isPublishing={isPublishing}
          hasChanges={hasChanges}
          isPreviewMode={isPreviewMode}
          onTogglePreview={() => setIsPreviewMode(!isPreviewMode)}
        />
      )}
      {renderTemplate()}



      <ImagePickerModal
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        currentUrl={activeImageUrl}
        businessId={props.businessInfo?.id}
        onSelect={(url) => {
          handleUpdate(activeImagePath, url)
          setIsPickerOpen(false)
        }}
      />
    </>
  )
}
