'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '@/types'
import { today } from '@/lib/utils'
import Modal from '@/components/ui/Modal'

interface Props {
  open: boolean
  onClose: () => void
  onSaved: (isSalary: boolean, amount: number) => void
  userId: string
}

export default function TransactionForm({ open, onClose, onSaved, userId }: Props) {
  const [type, setType] = useState<'gasto' | 'receita'>('gasto')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('Alimentação')
  const [subcategory, setSubcategory] = useState('')
  const [place, setPlace] = useState('')
  const [city, setCity] = useState('')
  const [payment, setPayment] = useState('Débito')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(today())
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const cats = type === 'gasto' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES

  function handleTypeChange(t: 'gasto' | 'receita') {
    setType(t)
    setCategory(t === 'gasto' ? 'Alimentação' : 'Salário')
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    const v = parseFloat(amount)
    if (!v || v <= 0) { setError('Valor inválido.'); return }
    if (!date) { setError('Selecione uma data.'); return }
    setError('')
    setLoading(true)
    const supabase = createClient()
    const { error: err } = await supabase.from('transactions').insert({
      user_id: userId,
      type, amount: v, category,
      subcategory: subcategory || null,
      place: place || null,
      city: city || null,
      payment_method: payment,
      description: description || null,
      date,
    })
    setLoading(false)
    if (err) { setError(err.message); return }
    const isSalary = type === 'receita' && category === 'Salário'
    onSaved(isSalary, v)
    // reset
    setAmount(''); setSubcategory(''); setPlace(''); setCity('')
    setDescription(''); setDate(today()); setType('gasto'); setCategory('Alimentação')
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title="Nova transação">
      <form onSubmit={handleSave}>
        <div className="modal-body">
          {/* Type toggle */}
          <div className="flex rounded-lg overflow-hidden border border-line p-0.5 bg-canvas">
            {(['gasto', 'receita'] as const).map(t => (
              <button key={t} type="button" onClick={() => handleTypeChange(t)}
                className={`flex-1 py-2 text-xs font-medium rounded-md transition-all ${
                  type === t
                    ? t === 'gasto' ? 'bg-loss-dim text-loss' : 'bg-gain-dim text-gain'
                    : 'text-slate-500 hover:text-slate-300'
                }`}>
                {t === 'gasto' ? '↑ Gasto' : '↓ Receita'}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Valor (CAD$)</label>
              <div className="input-prefix">
                <span>CAD$</span>
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)}
                  placeholder="0.00" step="0.01" min="0" autoFocus />
              </div>
            </div>
            <div>
              <label className="label">Data</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className="input" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Categoria</label>
              <select className="input" value={category} onChange={e => setCategory(e.target.value)}>
                {cats.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Subcategoria</label>
              <input className="input" value={subcategory} onChange={e => setSubcategory(e.target.value)}
                placeholder="Ex: Restaurante" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Estabelecimento</label>
              <input className="input" value={place} onChange={e => setPlace(e.target.value)}
                placeholder="Ex: Superstore" />
            </div>
            <div>
              <label className="label">Cidade</label>
              <input className="input" value={city} onChange={e => setCity(e.target.value)}
                placeholder="Ex: Vancouver" />
            </div>
          </div>

          <div>
            <label className="label">Método de pagamento</label>
            <select className="input" value={payment} onChange={e => setPayment(e.target.value)}>
              {['Débito', 'Crédito', 'Dinheiro', 'Transferência', 'PIX', 'E-transfer'].map(m =>
                <option key={m}>{m}</option>
              )}
            </select>
          </div>

          <div>
            <label className="label">Observações</label>
            <input className="input" value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Ex: Jantar após o trabalho" />
          </div>

          {error && <p className="text-xs text-loss">{error}</p>}
        </div>

        <div className="modal-footer">
          <button type="button" onClick={onClose} className="btn">Cancelar</button>
          <button type="submit" disabled={loading} className="btn btn-primary">
            {loading
              ? <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : 'Salvar transação'
            }
          </button>
        </div>
      </form>
    </Modal>
  )
}
