import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import DashboardClient from '@/components/dashboard/DashboardClient'

export default async function DashboardPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('budget_rule')
    .eq('id', user.id)
    .single()

  return (
    <DashboardClient
      userId={user.id}
      budgetRule={profile?.budget_rule ?? '50-20-30'}
    />
  )
}
