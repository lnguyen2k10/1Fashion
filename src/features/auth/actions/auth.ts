'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { slugify } from '@/lib/utils'
import { DEFAULT_TEMPLATE_ID, DEFAULT_SHOP_CONTENT } from '@/lib/constants'

/** Creates the initial records for a newly authenticated shop owner. */
export async function completeSignupProfile(userId: string, email: string, businessName: string) {
  const sessionClient = await createClient()
  const { data: { user } } = await sessionClient.auth.getUser()

  if (!user || user.id !== userId || user.email?.toLowerCase() !== email.toLowerCase()) {
    return { success: false, error: 'Phiên đăng ký không hợp lệ. Vui lòng đăng nhập lại.' }
  }

  const name = businessName.trim()
  if (name.length < 2 || name.length > 120) {
    return { success: false, error: 'Tên shop phải có từ 2 đến 120 ký tự.' }
  }

  const supabase = createAdminClient()

  try {
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: user.id,
      email: user.email,
      full_name: name,
      role: 'shop',
      subscription_status: 'trial',
      expiry_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    }, { onConflict: 'id' })
    if (profileError) throw profileError

    const { data: existingBusiness, error: existingBusinessError } = await supabase
      .from('business_profiles')
      .select('id')
      .eq('account_id', user.id)
      .maybeSingle()
    if (existingBusinessError) throw existingBusinessError
    if (existingBusiness) return { success: true }

    const slug = `${slugify(name)}-${crypto.randomUUID().slice(0, 8)}`
    const { data: business, error: businessError } = await supabase
      .from('business_profiles')
      .insert({
        account_id: user.id,
        business_name: name,
        slug,
        category: 'Chưa phân loại',
        categories: [],
        location_city: null,
        location_district: null,
        location_ward: null,
        theme_color: '#D4AF37',
        is_verified: false,
      })
      .select('id')
      .single()
    if (businessError) throw businessError

    const { error: landingPageError } = await supabase.from('landing_pages').insert({
      business_id: business.id,
      template_id: DEFAULT_TEMPLATE_ID,
      status: 'Draft',
      is_published: false,
      content_json: DEFAULT_SHOP_CONTENT,
      draft_json: DEFAULT_SHOP_CONTENT,
    })
    if (landingPageError) throw landingPageError

    return { success: true }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Không thể khởi tạo shop.'
    console.error('Shop signup completion error:', error)
    return { success: false, error: message }
  }
}
