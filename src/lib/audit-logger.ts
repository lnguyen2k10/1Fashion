import { createClient } from '@/lib/supabase/client'

/**
 * Logs an administrative action into the admin_audit_logs table.
 * 
 * @param action - The action performed (e.g., 'VERIFY_BUSINESS', 'UPDATE_SUBSCRIPTION', 'BULK_VERIFY')
 * @param targetId - The ID of the primary entity being modified (can be null for bulk actions or general actions)
 * @param targetType - The type of entity ('business_profile', 'subscription', 'landing_page', etc.)
 * @param details - An object containing any additional context (e.g., previous state, new state, list of IDs for bulk)
 */
export async function logAdminAction(
  action: string,
  targetId: string | null = null,
  targetType: string | null = null,
  details: Record<string, any> = {}
) {
  try {
    const supabase = createClient()
    
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
      console.warn('Cannot log admin action: No active session.')
      return
    }

    const { error } = await supabase.from('admin_audit_logs').insert({
      admin_id: session.user.id,
      action,
      target_id: targetId,
      target_type: targetType,
      details
    })

    if (error) {
      console.error('Failed to write audit log:', error.message)
    }
  } catch (error) {
    console.error('Unexpected error while writing audit log:', error)
  }
}
