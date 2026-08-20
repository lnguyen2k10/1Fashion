'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { DEFAULT_SHOP_CONTENT, DEFAULT_TEMPLATE_ID } from '@/lib/constants'
import { redirect } from 'next/navigation'

export async function completeOnboarding(formData: FormData) {
  // Check if Supabase is configured
  const isConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://YOUR_PROJECT_ID.supabase.co';

  if (!isConfigured) {
    await new Promise(resolve => setTimeout(resolve, 1500));
    redirect('/dashboard');
    return;
  }

  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
    return
  }

  const business_name = (formData.get('business_name') || formData.get('name')) as string
  const rawCategories = formData.get('categories')
  let categories: string[] = []
  try {
    const parsed = typeof rawCategories === 'string' ? JSON.parse(rawCategories) : []
    categories = Array.isArray(parsed) ? [...new Set(parsed.filter((item): item is string => typeof item === 'string').map((item) => item.trim()).filter(Boolean))].slice(0, 12) : []
  } catch { categories = [] }
  const major = categories[0] || ((formData.get('major') || formData.get('category')) as string) || 'Chưa phân loại'
  const specialization = (formData.get('specialization') || '') as string
  const bio = (formData.get('bio') || '') as string
  const location_city = ((formData.get('location_city') || '') as string).trim().slice(0, 100) || null
  const location_district = ((formData.get('location_district') || '') as string).trim().slice(0, 100) || null
  const location_ward = ((formData.get('location_ward') || '') as string).trim().slice(0, 100) || null
  const admin = createAdminClient()

  // 1. Update Profile (Identity)
  const { error: profileError } = await admin
    .from('profiles')
    .upsert({
      id: user.id,
      email: user.email,
      full_name: business_name,
      role: 'shop',
      subscription_status: 'trial',
      expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    }, { onConflict: 'id' })

  if (profileError) throw new Error(profileError.message)

  // 2. Update Business Profile & Landing Page
  const { data: business } = await admin
    .from('business_profiles')
    .select('id')
    .eq('account_id', user.id)
    .maybeSingle()

  if (business) {
    // Update category and name - category is a free TEXT field, no whitelist
    await admin
      .from('business_profiles')
      .update({ 
        category: major,
        categories,
        business_name: business_name,
        location_city,
        location_district,
        location_ward,
      })
      .eq('id', business.id)

    // Update Landing Page Bio in content_json
    const { data: lp } = await admin
      .from('landing_pages')
      .select('id, content_json')
      .eq('business_id', business.id)
      .maybeSingle()

    if (lp) {
      const content = (lp.content_json as any) || {}
      if (!content.about_us) content.about_us = {}
      content.about_us.intro_text = bio
      content.about_us.specialization = specialization

      await admin
        .from('landing_pages')
        .update({ 
          content_json: content,
          draft_json: content,
          status: 'Published',
          is_published: true
        })
        .eq('id', lp.id)
    } else {
       // If business profile exists but NO landing page, create one
       const defaultContent = { ...DEFAULT_SHOP_CONTENT }
       defaultContent.about_us.intro_text = bio
       ;(defaultContent.about_us as any).specialization = specialization
       
      await admin
        .from('landing_pages')
        .insert({
          business_id: business.id,
          template_id: DEFAULT_TEMPLATE_ID,
          content_json: defaultContent,
          draft_json: defaultContent,
          status: 'Published',
          is_published: true
        })
    }
  } else {
    // Handle new business profile creation if needed (fallback to remote logic style)
    const slug = business_name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .slice(0, 60) + '-' + Date.now().toString(36)

    const { data: newBusiness } = await admin
      .from('business_profiles')
      .insert({
        account_id: user.id,
        business_name,
        slug,
        category: major,
        categories,
        location_city,
        location_district,
        location_ward,
        is_verified: false,
      })
      .select()
      .single()

    if (newBusiness) {
       // Explicitly create the landing page immediately with the default template and published status
       const defaultContent = { ...DEFAULT_SHOP_CONTENT }
       defaultContent.about_us.intro_text = bio
       ;(defaultContent.about_us as any).specialization = specialization

      await admin
        .from('landing_pages')
        .insert({
          business_id: newBusiness.id,
          template_id: DEFAULT_TEMPLATE_ID,
          content_json: defaultContent,
          draft_json: defaultContent,
          status: 'Published',
          is_published: true
        })
    }
  }

  redirect('/dashboard')
}
