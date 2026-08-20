import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * Quick Clone: Nhân bản toàn bộ Landing Page từ một doanh nghiệp mẫu sang doanh nghiệp mục tiêu.
 * CHỈ dành cho Admin hệ thống.
 */
export async function quickCloneLandingPage(sourceBusinessId: string, targetBusinessId: string, requestorId: string) {
  try {
    // 0. Security Guard: Verify requestor is an ADMIN
    const { data: requestor } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', requestorId)
      .single()

    if (requestor?.role !== 'super_admin') {
      throw new Error('Unauthorized: Chỉ Admin mới có quyền nhân bản trang.')
    }

    // 1. Lấy Landing Page đang Published của nguồn
    const { data: sourcePage, error: fetchError } = await supabaseAdmin
      .from('landing_pages')
      .select('*')
      .eq('business_id', sourceBusinessId)
      .eq('status', 'Published')
      .single()

    if (fetchError || !sourcePage) {
      throw new Error('Không tìm thấy Landing Page mẫu đang hoạt động.')
    }

    // 2. Hạ toàn bộ trang hiện tại của mục tiêu xuống Draft
    await supabaseAdmin
      .from('landing_pages')
      .update({ status: 'Draft' })
      .eq('business_id', targetBusinessId)

    // 3. Tạo bản sao mới cho mục tiêu
    const { data: newPage, error: cloneError } = await supabaseAdmin
      .from('landing_pages')
      .insert({
        business_id: targetBusinessId,
        template_id: sourcePage.template_id,
        status: 'Published',
        content_json: sourcePage.content_json // Nhân bản toàn bộ cấu trúc nội dung
      })
      .select()
      .single()

    if (cloneError) {
      throw cloneError
    }

    return { success: true, pageId: newPage.id }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}
