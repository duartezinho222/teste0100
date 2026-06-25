import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import BudgetClient from '@/components/budget/BudgetClient'

export default async function BudgetPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('budget_rule').eq('id', user.id).single()
  return <BudgetClient userId={user.id} initialRule={profile?.budget_rule ?? '50-20-30'} />
}
