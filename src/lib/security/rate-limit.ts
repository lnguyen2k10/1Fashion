import { createHash } from 'node:crypto'
import { createAdminClient } from '@/lib/supabase/admin'

export function clientIp(request: Request) {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown'
}

/** Distributed PostgreSQL rate limit shared by all server instances. */
export async function enforceRateLimit(request: Request, namespace: string, limit: number, windowMs: number) {
  const fingerprint = createHash('sha256')
    .update(`${clientIp(request)}:${request.headers.get('user-agent')?.slice(0, 120) || 'unknown'}`)
    .digest('hex')
  const { data, error } = await createAdminClient()
    .rpc('consume_api_rate_limit', {
      input_namespace: namespace,
      input_identifier_hash: fingerprint,
      input_limit: limit,
      input_window_seconds: Math.ceil(windowMs / 1000),
    })
    .single()
  const result = data as { allowed: boolean; retry_after_seconds: number } | null
  if (error || !result) return { allowed: false, reset: Date.now() + 60_000, unavailable: true }
  return {
    allowed: result.allowed,
    reset: Date.now() + result.retry_after_seconds * 1000,
    unavailable: false,
  }
}
