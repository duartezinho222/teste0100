import { createServerSupabaseClient } from '@/lib/supabase-server'
import { redirect } from 'next/navigation'
import TransactionsClient from '@/components/transactions/TransactionsClient'

export default async function TransactionsPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  return <TransactionsClient userId={user.id} />
}
