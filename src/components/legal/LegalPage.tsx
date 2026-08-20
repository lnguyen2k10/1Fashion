import { createClient } from '@/lib/supabase/server'
type Props = { title: string; field: 'terms_content' | 'privacy_content'; fallback: string }

export async function LegalPage({ title, field, fallback }: Props) {
  const supabase = await createClient()
  const { data } = await supabase.from('site_settings').select(field).eq('id', 'current').maybeSingle()
  const content = (data as Record<string, string | null> | null)?.[field] || fallback

  return <div className="min-h-screen bg-white pt-28"><main className="mx-auto max-w-3xl px-6 pb-20"><p className="text-xs font-bold uppercase tracking-[0.25em] text-[#B8860B]">1Fashion</p><h1 className="mt-4 text-4xl font-bold text-zinc-900">{title}</h1><article className="mt-10 whitespace-pre-wrap rounded-3xl border border-zinc-100 bg-zinc-50 p-7 text-sm leading-7 text-zinc-700 md:p-10">{content}</article></main></div>
}
