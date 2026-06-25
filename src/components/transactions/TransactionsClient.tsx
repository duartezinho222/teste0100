'use client'
import { useEffect, useState, useCallback } from 'react'
import { Plus, Trash2, Search } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { Transaction } from '@/types'
import { fmt, fmtDate } from '@/lib/utils'
import TransactionForm from '@/components/forms/TransactionForm'
import { ToastProvider, useToast } from '@/components/ui/Toast'
import { cn } from '@/lib/utils'

const FILTERS = [
  { label: 'Todas', value: 'all' },
  { label: 'Receitas', value: 'receita' },
  { label: 'Gastos', value: 'gasto' },
  { label: 'Alimentação', value: 'cat:Alimentação' },
  { label: 'Transporte', value: 'cat:Transporte' },
  { label: 'Lazer', value: 'cat:Lazer' },
  { label: 'Viagem', value: 'cat:Viagem' },
  { label: 'Compras', value: 'cat:Compras' },
]

export default function TransactionsClient({ userId }: { userId: string }) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const { show } = useToast()

  const load = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const { data } = await supabase
      .from('transactions').select('*').eq('user_id', userId)
      .order('date', { ascending: false }).order('created_at', { ascending: false })
    setTransactions(data || [])
    setLoading(false)
  }, [userId])

  useEffect(() => { load() }, [load])

  async function deleteTx(id: string) {
    if (!confirm('Remover esta transação?')) return
    const supabase = createClient()
    await supabase.from('transactions').delete().eq('id', id)
    show('Transação removida.', 'error')
    load()
  }

  const filtered = transactions.filter(t => {
    if (filter === 'receita' || filter === 'gasto') return t.type === filter
    if (filter.startsWith('cat:')) return t.category === filter.slice(4)
    if (search) {
      const s = search.toLowerCase()
      return t.category.toLowerCase().includes(s) ||
        t.description?.toLowerCase().includes(s) ||
        t.place?.toLowerCase().includes(s) ||
        t.subcategory?.toLowerCase().includes(s)
    }
    return true
  }).filter(t => {
    if (!search) return true
    const s = search.toLowerCase()
    return t.category.toLowerCase().includes(s) ||
      t.description?.toLowerCase().includes(s) ||
      t.place?.toLowerCase().includes(s)
  })

  const total = filtered.reduce((a, t) => a + (t.type === 'receita' ? t.amount : -t.amount), 0)

  return (
    <>
      <ToastProvider />
      <div className="sticky top-0 z-10 border-b border-line bg-surface/80 backdrop-blur px-6 py-3.5 flex items-center justify-between">
        <div>
          <h1 className="text-sm font-semibold text-white">Transações</h1>
          <p className="text-xs text-slate-500">{filtered.length} registros</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn btn-primary btn-sm">
          <Plus size={14} /> Nova
        </button>
      </div>

      <div className="p-6 space-y-4 flex-1 overflow-auto">
        {/* Filters + search */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-shrink-0">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
            <input className="input pl-8 w-52 text-xs" placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {FILTERS.map(f => (
              <button key={f.value} onClick={() => setFilter(f.value)}
                className={cn('chip', filter === f.value && 'active')}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Summary row */}
        {filtered.length > 0 && (
          <div className="flex gap-4 text-xs text-slate-500">
            <span>Receitas: <span className="text-gain font-medium">{fmt(filtered.filter(t=>t.type==='receita').reduce((a,t)=>a+t.amount,0))}</span></span>
            <span>Gastos: <span className="text-loss font-medium">{fmt(filtered.filter(t=>t.type==='gasto').reduce((a,t)=>a+t.amount,0))}</span></span>
            <span>Saldo: <span className={`font-medium ${total>=0?'text-info':'text-loss'}`}>{fmt(Math.abs(total))}</span></span>
          </div>
        )}

        {/* Table */}
        <div className="card overflow-hidden">
          {loading ? (
            <div className="p-8 flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-line border-t-accent-500 rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center">
              <p className="text-slate-600 text-sm">Nenhuma transação encontrada</p>
              <button onClick={() => setShowForm(true)} className="btn btn-primary btn-sm mt-4">
                <Plus size={13} /> Adicionar primeira transação
              </button>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Tipo</th>
                  <th>Categoria</th>
                  <th>Descrição / Local</th>
                  <th>Método</th>
                  <th className="text-right pr-4">Valor</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(t => (
                  <tr key={t.id}>
                    <td className="text-slate-500 text-xs">{fmtDate(t.date)}</td>
                    <td>
                      <span className={cn('badge', t.type === 'receita' ? 'badge-gain' : 'badge-loss')}>
                        {t.type === 'receita' ? '↓ receita' : '↑ gasto'}
                      </span>
                    </td>
                    <td>
                      <div className="text-xs font-medium text-slate-200">{t.category}</div>
                      {t.subcategory && <div className="text-[11px] text-slate-600">{t.subcategory}</div>}
                    </td>
                    <td>
                      <div className="text-xs text-slate-300">{t.description || t.place || '—'}</div>
                      {t.place && t.city && <div className="text-[11px] text-slate-600">{t.place} · {t.city}</div>}
                    </td>
                    <td className="text-xs text-slate-600">{t.payment_method || '—'}</td>
                    <td className={`text-right pr-4 text-sm font-semibold tabular-nums ${t.type==='receita'?'text-gain':'text-loss'}`}>
                      {t.type === 'receita' ? '+' : '-'}{fmt(t.amount)}
                    </td>
                    <td>
                      <button onClick={() => deleteTx(t.id)}
                        className="btn btn-danger btn-sm p-1.5 opacity-0 group-hover:opacity-100 hover:opacity-100">
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <TransactionForm open={showForm} onClose={() => setShowForm(false)}
        onSaved={() => { load(); show('Transação salva!', 'success') }} userId={userId} />
    </>
  )
}
