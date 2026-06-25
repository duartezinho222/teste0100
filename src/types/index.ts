export type TransactionType = 'receita' | 'gasto'

export interface Transaction {
  id: string
  user_id: string
  type: TransactionType
  amount: number
  category: string
  subcategory?: string
  place?: string
  city?: string
  payment_method?: string
  description?: string
  tags?: string[]
  date: string
  created_at: string
}

export interface Goal {
  id: string
  user_id: string
  name: string
  target: number
  current: number
  created_at: string
}

export interface Profile {
  id: string
  email: string
  budget_rule: string
  created_at: string
}

export interface BudgetRule {
  needs: number
  savings: number
  wants: number
}

export const BUDGET_RULES: Record<string, BudgetRule> = {
  '50-20-30': { needs: 50, savings: 20, wants: 30 },
  '50-30-20': { needs: 50, savings: 30, wants: 20 },
  '60-20-20': { needs: 60, savings: 20, wants: 20 },
  'custom':   { needs: 50, savings: 20, wants: 30 },
}

export const EXPENSE_CATEGORIES = [
  'Alimentação',
  'Transporte',
  'Moradia',
  'Saúde',
  'Lazer',
  'Viagem',
  'Compras',
  'Assinaturas',
  'Educação',
  'Emergência',
  'Outros',
] as const

export const INCOME_CATEGORIES = [
  'Salário',
  'Freelance',
  'Investimento',
  'Presente',
  'Outros',
] as const

export const CAT_ICONS: Record<string, string> = {
  'Alimentação': '🛒',
  'Transporte': '🚌',
  'Moradia': '🏠',
  'Saúde': '💊',
  'Lazer': '🎬',
  'Viagem': '✈️',
  'Compras': '🛍️',
  'Assinaturas': '📱',
  'Educação': '📚',
  'Emergência': '🚨',
  'Salário': '💼',
  'Freelance': '💻',
  'Investimento': '📈',
  'Presente': '🎁',
  'Outros': '📦',
}
