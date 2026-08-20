import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardClientWrapper from './DashboardClientWrapper'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch role
  const { data: acc } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle()
  const isAdmin = acc?.role === 'super_admin'

  // Fetch business profile
  const { data: profile } = await supabase.from('business_profiles').select('*').eq('account_id', user.id).maybeSingle()
  if (!profile) {
    redirect('/onboarding')
  }

  // Fetch landing page
  const { data: landingPage } = await supabase.from('landing_pages').select('*').eq('business_id', profile.id).maybeSingle()

  return (
    <DashboardClientWrapper
      initialUser={user}
      initialProfile={profile}
      initialIsAdmin={isAdmin}
      initialLandingPage={landingPage}
    >
      {children}
    </DashboardClientWrapper>
  )
}
