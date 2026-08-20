import 'server-only'
import type { SupabaseClient } from '@supabase/supabase-js'

type EmailInput = {
  profileId: string
  templateKey: string
  dedupeKey: string
  recipientEmail: string
  subject: string
  bodyText: string
}

/** Queue mail durably; the cron route is the only component that sends it. */
export async function queueEmail(admin: SupabaseClient, email: EmailInput) {
  const { error } = await admin.from('email_outbox').upsert({
    profile_id: email.profileId,
    template_key: email.templateKey,
    dedupe_key: email.dedupeKey,
    recipient_email: email.recipientEmail,
    subject: email.subject,
    body_text: email.bodyText,
  }, { onConflict: 'template_key,dedupe_key', ignoreDuplicates: true })
  if (error) throw error
}
