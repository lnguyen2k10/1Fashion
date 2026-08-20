import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'super_admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { accountId, newPassword } = body

    if (!accountId || !newPassword) {
      return NextResponse.json({ error: 'Missing accountId or newPassword' }, { status: 400 })
    }

    const supabaseAdmin = createAdminClient()
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(accountId, {
      password: newPassword,
    })

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error resetting password:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
