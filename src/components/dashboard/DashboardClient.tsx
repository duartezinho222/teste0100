'use client'
import { useEffect, useState, useCallback } from 'react'
import { Plus, TrendingUp, TrendingDown, Wallet, PiggyBank, Sparkles, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'
import { Transaction, Goal } from '@/types'
import { fmt, fmtDate } from '@/lib/utils'
import TransactionForm from '@/components/forms/TransactionForm'
import { ToastProvider, useToast } from '@/components/ui/Toast'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer
} from 'recharts'

const COLORS = ['#4550F0','#00C896','#F5A623','#a78bfa','#FF4D6A','#38BDF8','#fb923c','#64748b']

function SalaryBanner({ amount, rule }: { amount: number; rule: { needs: number; savings: number; wants: number } }) {
  if (!amount) return null
  const n = (rule.needs / 100) * amount
  const s = (rule.savings / 100) * amount
  const w = (rule.wants / 100) * amount
  return (
    <div className="rounded-xl border border-gain/20 bg-gain-dim/60 p-4 animate-fade-in">
      <div className="flex items-center gap-2 text-gain text-sm font-medium mb-3">
        <Sparkles size={15} />
        Salário de {fmt(amount)} registrado — distribuição automática pela sua regra {rule.needs}/{rule.savings}/{rule.wants}
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Necessidades', value: n, color: 'text-info' },
          { label: 'Economia', value: s, color: 'text-gain' },
          { label: 'Lazer', value: w, color: 'text-warn' },
        ].map(item => (
          <div key={item.label} className="bg-black/20 rounded-lg p-3 text-center">
            <div className={`text-base font-semibold tabular-nums ${item.color}`}>{fmt(item.value)}</div>
            <div className="text-xs text-slate-500 mt-0.5">{item.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function DashboardPage({ userId, budgetRule }: { userId: string; budgetRule: string }) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [showForm, setShowForm] = useState(false)
  const [salaryAlert, setSalaryAlert] = useState<{ amount: number } | null>(null)
  const { show } = useToast()

  const rule = (() => {
    const parts = budgetRule.split('-').map(Number)
    return { needs: parts[0] || 50, savings: parts[1] || 20, wants: parts[2] || 30 }
  })()

  const load = useCallback(async () => {
    const supabase = createClient()
    const [txRes, goalRes] = await Promise.all([
      supabase.from('transactions').select('*').eq('user_id', userId).order('date', { ascending: false }).limit(100),
      supabase.from('goals').select('*').eq('user_id', userId).order('created_at', { ascending: true }),
    ])
    if (txRes.data) setTransactions(txRes.data)
    if (goalRes.data) setGoals(goalRes.data)
  }, [userId])

  useEffect(() => { load() }, [load])

  const income   = transactions.filter(t => t.type === 'receita').reduce((a, t) => a + t.amount, 0)
  const expenses = transactions.filter(t => t.type === 'gasto').reduce((a, t) => a + t.amount, 0)
  const balance  = income - expenses
  const savings  = Math.max(0, balance)

  const catData = (() => {
    const m: Record<string, number> = {}
    transactions.filter(t => t.type === 'gasto').forEach(t => {
      m[t.category] = (m[t.category] || 0) + t.amount
    })
    return Object.entries(m).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)
  })()

  async function handleSaved(isSalary: boolean, amount: number) {
    await load()
    if (isSalary) {
      setSalaryAlert({ amount })
      show(`Salário de ${fmt(amount)} registrado! Distribuição aplicada.`, 'success')
    } else {
      show('Transação salva com sucesso.', 'success')
    }
  }

  const metrics = [
    { label: 'Saldo atual', value: fmt(balance), icon: Wallet, color: balance >= 0 ? 'text-info' : 'text-loss', sub: 'receitas − despesas' },
    { label: 'Receitas',    value: fmt(income),   icon: TrendingDown, color: 'text-gain', sub: `${transactions.filter(t=>t.type==='receita').length} lançamentos` },
    { label: 'Despesas',    value: fmt(expenses),  icon: TrendingUp,   color: 'text-loss', sub: `${transactions.filter(t=>t.type==='gasto').length} lançamentos` },
    { label: 'Poupança',   value: fmt(savings),   icon: PiggyBank,    color: 'text-warn', sub: rule.savings+'% do salário' },
  ]

  return (
    <>
      <ToastProvider />
      {/* Topbar */}
      <div className="sticky top-0 z-10 border-b border-line bg-surface/80 backdrop-blur px-6 py-3.5 flex items-center justify-between">
        <div>
          <h1 className="text-sm font-semibold text-white">Dashboard</h1>
          <p className="text-xs text-slate-500">{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn btn-primary btn-sm">
          <Plus size={14} /> Nova transação
        </button>
      </div>

      <div className="flex-1 p-6 space-y-5 overflow-auto">
        {/* Salary banner */}
        {salaryAlert && (
          <SalaryBanner amount={salaryAlert.amount} rule={rule} />
        )}

        {/* Metric cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {metrics.map(({ label, value, icon: Icon, color, sub }) => (
            <div key={label} className="metric-card">
              <div className="flex items-center justify-between mb-2">
                <span className="metric-label">{label}</span>
                <Icon size={14} className={color} />
              </div>
              <div className={`metric-value ${color}`}>{value}</div>
              <div className="metric-sub">{sub}</div>
            </div>
          ))}
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* Category chart */}
          <div className="card p-5 lg:col-span-3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-white">Gastos por categoria</h2>
              <Link href="/reports" className="text-xs text-accent-400 hover:text-accent-300 flex items-center gap-1 transition-colors">
                Ver relatório <ArrowRight size={11} />
              </Link>
            </div>
            {catData.length > 0 ? (
              <div className="flex gap-4">
                <ResponsiveContainer width="50%" height={200}>
                  <PieChart>
                    <Pie data={catData} dataKey="value" cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3}>
                      {catData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: '#0C1525', border: '1px solid #1A2D47', borderRadius: 10, fontSize: 12 }}
                      formatter={(v: number) => [fmt(v), '']}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 flex flex-col justify-center gap-1.5">
                  {catData.slice(0,6).map(({ name, value }, i) => (
                    <div key={name} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="text-xs text-slate-400 flex-1 truncate">{name}</span>
                      <span className="text-xs font-medium text-slate-300 tabular-nums">{fmt(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-sm text-slate-600">
                Nenhum gasto registrado ainda
              </div>
            )}
          </div>

          {/* Goals + recent */}
          <div className="lg:col-span-2 space-y-4">
            {/* Goals */}
            <div className="card p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-medium text-white">Metas</h2>
                <Link href="/goals" className="text-xs text-accent-400 hover:text-accent-300 transition-colors flex items-center gap-1">
                  Gerenciar <ArrowRight size={11} />
                </Link>
              </div>
              {goals.length > 0 ? goals.slice(0,3).map((g, i) => {
                const pct = Math.min(100, Math.round((g.current / g.target) * 100))
                const cols = ['bg-accent-500','bg-gain','bg-warn','bg-info','bg-loss']
                return (
                  <div key={g.id} className="mb-3 last:mb-0">
                    <div className="flex justify-between items-baseline mb-1.5">
                      <span className="text-xs font-medium text-slate-300">{g.name}</span>
                      <span className="text-xs text-slate-500 tabular-nums">{pct}%</span>
                    </div>
                    <div className="progress-track">
                      <div className={`progress-fill ${cols[i % cols.length]}`} style={{ width: pct+'%' }} />
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-[11px] text-slate-600">{fmt(g.current)}</span>
                      <span className="text-[11px] text-slate-600">{fmt(g.target)}</span>
                    </div>
                  </div>
                )
              }) : (
                <Link href="/goals" className="block text-xs text-slate-600 hover:text-accent-400 transition-colors py-2">
                  + Criar primeira meta
                </Link>
              )}
            </div>

            {/* Recent transactions */}
            <div className="card p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-medium text-white">Recentes</h2>
                <Link href="/transactions" className="text-xs text-accent-400 hover:text-accent-300 transition-colors flex items-center gap-1">
                  Ver todas <ArrowRight size={11} />
                </Link>
              </div>
              {transactions.slice(0,5).map(t => (
                <div key={t.id} className="flex items-center gap-2.5 py-2 border-b border-line/50 last:border-0">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-sm
                    ${t.type === 'receita' ? 'bg-gain-dim' : 'bg-loss-dim'}`}>
                    <span>{t.type === 'receita' ? '↓' : '↑'}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-slate-300 truncate">{t.category}</div>
                    <div className="text-[11px] text-slate-600">{fmtDate(t.date)}</div>
                  </div>
                  <span className={`text-xs font-semibold tabular-nums ${t.type === 'receita' ? 'text-gain' : 'text-loss'}`}>
                    {t.type === 'receita' ? '+' : '-'}{fmt(t.amount)}
                  </span>
                </div>
              ))}
              {transactions.length === 0 && (
                <p className="text-xs text-slate-600 py-2">Nenhuma transação ainda</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <TransactionForm open={showForm} onClose={() => setShowForm(false)} onSaved={handleSaved} userId={userId} />
    </>
  )
}
