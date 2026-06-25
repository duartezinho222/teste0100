'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { Transaction, BUDGET_RULES } from '@/types'
import { fmt } from '@/lib/utils'
import { AlertTriangle, Info, CheckCircle2, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

const RULES = [
  {
    key: '50-20-30',
    label: '50 / 20 / 30',
    title: 'Regra clássica',
    desc: 'A mais usada mundialmente. Metade do salário para necessidades (moradia, comida, transporte), 20% direto para poupança e investimentos, 30% para o que você quiser — lazer, compras, viagens.',
    tag: 'Recomendado',
    needs: 50, savings: 20, wants: 30,
  },
  {
    key: '50-30-20',
    label: '50 / 30 / 20',
    title: 'Foco em economia',
    desc: 'Inverte lazer e poupança: 30% vai direto para reserva ou investimentos. Ideal para quem quer acelerar a independência financeira ou está juntando para um objetivo grande.',
    tag: 'Poupar mais',
    needs: 50, savings: 30, wants: 20,
  },
  {
    key: '60-20-20',
    label: '60 / 20 / 20',
    title: 'Custo de vida alto',
    desc: 'Para quem mora em cidades caras como Vancouver ou Toronto, onde moradia e transporte consomem mais. 60% para essenciais, 20% poupança, 20% lazer. Equilibrado para a realidade canadense.',
    tag: 'Para o Canadá',
    needs: 60, savings: 20, wants: 20,
  },
  {
    key: 'custom',
    label: 'Personalizado',
    title: 'Sua própria regra',
    desc: 'Defina as porcentagens que fazem sentido para sua vida. Útil quando sua situação não se encaixa em nenhuma das regras padrão — como uma renda variável ou gastos específicos.',
    tag: 'Flexível',
    needs: 50, savings: 20, wants: 30,
  },
]

export default function BudgetClient({ userId, initialRule }: { userId: string; initialRule: string }) {
  const [selectedRule, setSelectedRule] = useState(initialRule || '50-20-30')
  const [customNeeds, setCustomNeeds] = useState(50)
  const [customSavings, setCustomSavings] = useState(20)
  const [customWants, setCustomWants] = useState(30)
  const [income, setIncome] = useState('')
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.from('transactions').select('*').eq('user_id', userId)
      .then(({ data }) => setTransactions(data || []))
  }, [userId])

  const rule = selectedRule === 'custom'
    ? { needs: customNeeds, savings: customSavings, wants: customWants }
    : BUDGET_RULES[selectedRule] || BUDGET_RULES['50-20-30']

  const inc = parseFloat(income) || 0
  const vNeeds   = (rule.needs    / 100) * inc
  const vSavings = (rule.savings  / 100) * inc
  const vWants   = (rule.wants    / 100) * inc

  const totalExpenses = transactions.filter(t => t.type === 'gasto').reduce((a, t) => a + t.amount, 0)
  const needsSpent = transactions.filter(t => t.type === 'gasto' && ['Alimentação','Transporte','Moradia','Saúde','Assinaturas'].includes(t.category)).reduce((a,t)=>a+t.amount,0)
  const wantsSpent = transactions.filter(t => t.type === 'gasto' && ['Lazer','Viagem','Compras'].includes(t.category)).reduce((a,t)=>a+t.amount,0)

  const pNeeds = vNeeds   > 0 ? Math.round((needsSpent / vNeeds)   * 100) : 0
  const pWants = vWants   > 0 ? Math.round((wantsSpent / vWants)   * 100) : 0
  const pTotal = inc      > 0 ? Math.round((totalExpenses / inc)    * 100) : 0

  async function saveRule() {
    setSaving(true)
    const supabase = createClient()
    await supabase.from('profiles').update({ budget_rule: selectedRule }).eq('id', userId)
    setSaving(false)
  }

  const bars = [
    { label: 'Necessidades', pct: rule.needs,    color: 'bg-info',       textColor: 'text-info' },
    { label: 'Economia',     pct: rule.savings,  color: 'bg-gain',       textColor: 'text-gain' },
    { label: 'Lazer',        pct: rule.wants,    color: 'bg-warn',       textColor: 'text-warn' },
  ]

  function alertLevel(pct: number) {
    if (pct > 100) return { level: 'danger', msg: `Limite ultrapassado em ${pct - 100}%` }
    if (pct >= 90)  return { level: 'danger', msg: `${pct}% utilizado — limite próximo!` }
    if (pct >= 70)  return { level: 'warn',   msg: `${pct}% utilizado — atenção` }
    return null
  }

  return (
    <>
      <div className="sticky top-0 z-10 border-b border-line bg-surface/80 backdrop-blur px-6 py-3.5 flex items-center justify-between">
        <div>
          <h1 className="text-sm font-semibold text-white">Regra 50/30/20</h1>
          <p className="text-xs text-slate-500">Distribua seu salário de forma inteligente</p>
        </div>
        <button onClick={saveRule} disabled={saving} className="btn btn-primary btn-sm">
          {saving ? <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Salvar regra'}
        </button>
      </div>

      <div className="p-6 space-y-5 flex-1 overflow-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Left: Rule picker */}
          <div className="space-y-4">
            <div>
              <h2 className="text-sm font-medium text-white mb-1">Escolha sua regra</h2>
              <p className="text-xs text-slate-500 mb-4">Cada modelo reflete uma filosofia diferente de usar o dinheiro. Escolha a que combina com o seu momento de vida.</p>
              <div className="space-y-2">
                {RULES.map(r => (
                  <button key={r.key} onClick={() => setSelectedRule(r.key)}
                    className={cn('w-full text-left card p-4 transition-all duration-150',
                      selectedRule === r.key
                        ? 'border-accent-600 bg-accent-900/30'
                        : 'hover:border-line-2'
                    )}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white font-mono">{r.label}</span>
                        <span className={cn('badge badge-muted text-[10px]',
                          selectedRule === r.key && 'badge-accent')}>{r.tag}</span>
                      </div>
                      <div className={cn('w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0',
                        selectedRule === r.key ? 'border-accent-500 bg-accent-500' : 'border-line-2')}>
                        {selectedRule === r.key && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </div>
                    <p className="text-xs font-medium text-slate-400 mb-1.5">{r.title}</p>
                    {selectedRule === r.key && (
                      <p className="text-xs text-slate-500 leading-relaxed animate-fade-in">{r.desc}</p>
                    )}
                    {/* Mini bar */}
                    <div className="flex gap-0.5 mt-2.5 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-info rounded-l-full" style={{ width: r.needs + '%' }} />
                      <div className="bg-gain" style={{ width: r.savings + '%' }} />
                      <div className="bg-warn rounded-r-full" style={{ width: r.wants + '%' }} />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom inputs */}
            {selectedRule === 'custom' && (
              <div className="card p-4 space-y-3 animate-fade-in">
                <p className="text-xs text-slate-400 font-medium">Defina as porcentagens (total deve ser 100%)</p>
                {[
                  { label: 'Necessidades (%)', val: customNeeds, set: setCustomNeeds },
                  { label: 'Economia (%)',     val: customSavings, set: setCustomSavings },
                  { label: 'Lazer (%)',        val: customWants, set: setCustomWants },
                ].map(({ label, val, set }) => (
                  <div key={label} className="flex items-center gap-3">
                    <label className="text-xs text-slate-500 w-36 shrink-0">{label}</label>
                    <input type="range" min={0} max={100} value={val} onChange={e => set(Number(e.target.value))}
                      className="flex-1 accent-accent-500" />
                    <span className="text-xs font-mono text-slate-300 w-8 text-right">{val}%</span>
                  </div>
                ))}
                <div className="text-xs text-right text-slate-600">
                  Total: <span className={customNeeds+customSavings+customWants===100?'text-gain':'text-loss'}>
                    {customNeeds+customSavings+customWants}%
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Right: Calculator + usage */}
          <div className="space-y-4">
            {/* Income input */}
            <div className="card p-4">
              <h2 className="text-sm font-medium text-white mb-1">Calcular distribuição</h2>
              <p className="text-xs text-slate-500 mb-3">Digite sua receita mensal para ver exatamente quanto vai para cada categoria</p>
              <div className="input-prefix mb-4">
                <span>CAD$</span>
                <input type="number" value={income} onChange={e => setIncome(e.target.value)}
                  placeholder="Ex: 4 000" />
              </div>

              {/* Distribution bars */}
              <div className="space-y-3">
                {bars.map(b => (
                  <div key={b.label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className={cn('w-2 h-2 rounded-full', b.color)} />
                        <span className="text-xs text-slate-400">{b.label}</span>
                        <span className="text-[11px] text-slate-600">{b.pct}%</span>
                      </div>
                      <span className={cn('text-sm font-semibold tabular-nums', b.textColor)}>
                        {inc > 0 ? fmt((b.pct / 100) * inc) : '—'}
                      </span>
                    </div>
                    <div className="progress-track">
                      <div className={cn('progress-fill', b.color)} style={{ width: b.pct + '%' }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Usage vs budget */}
            {inc > 0 && (
              <div className="card p-4 space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp size={13} className="text-slate-500" />
                  <h3 className="text-xs font-medium text-white">Seu uso atual</h3>
                </div>

                {[
                  { label: 'Total de gastos', spent: totalExpenses, budget: inc, pct: pTotal },
                  { label: 'Necessidades',    spent: needsSpent,    budget: vNeeds,   pct: pNeeds },
                  { label: 'Lazer',           spent: wantsSpent,    budget: vWants,   pct: pWants },
                ].map(({ label, spent, budget, pct }) => {
                  const alert = inc > 0 ? alertLevel(pct) : null
                  return (
                    <div key={label}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-500">{label}</span>
                        <span className="text-slate-400 tabular-nums">{fmt(spent)} / {fmt(budget)}</span>
                      </div>
                      <div className="progress-track">
                        <div className={cn('progress-fill', pct > 100 ? 'bg-loss' : pct >= 70 ? 'bg-warn' : 'bg-accent-500')}
                          style={{ width: Math.min(100, pct) + '%' }} />
                      </div>
                      {alert && (
                        <div className={cn('alert mt-2 text-xs', alert.level === 'danger' ? 'alert-danger' : 'alert-warn')}>
                          <AlertTriangle size={12} className="shrink-0" />
                          {alert.msg}
                        </div>
                      )}
                    </div>
                  )
                })}

                {pTotal < 70 && inc > 0 && (
                  <div className="alert alert-gain text-xs">
                    <CheckCircle2 size={12} className="shrink-0" />
                    Você está dentro do orçamento. Continue assim!
                  </div>
                )}
              </div>
            )}

            {/* Info box */}
            <div className="alert alert-info text-xs">
              <Info size={13} className="shrink-0 mt-0.5" />
              <span>Quando você registrar um salário na aba de Transações, o Dashboard mostrará automaticamente a divisão com base nesta regra.</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
