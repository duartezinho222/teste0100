'use client'
import { useEffect, useState, useCallback } from 'react'
import { Plus, Trash2, Trophy } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { Goal } from '@/types'
import { fmt } from '@/lib/utils'
import Modal from '@/components/ui/Modal'
import { ToastProvider, useToast } from '@/components/ui/Toast'
import { cn } from '@/lib/utils'

const GOAL_COLORS = [
  { bar: 'bg-accent-500', text: 'text-accent-300', glow: 'shadow-glow-accent' },
  { bar: 'bg-gain',       text: 'text-gain',       glow: 'shadow-glow-gain' },
  { bar: 'bg-warn',       text: 'text-warn',       glow: '' },
  { bar: 'bg-info',       text: 'text-info',       glow: '' },
  { bar: 'bg-loss',       text: 'text-loss',       glow: '' },
]

export default function GoalsClient({ userId }: { userId: string }) {
  const [goals, setGoals] = useState<Goal[]>([])
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [target, setTarget] = useState('')
  const [current, setCurrent] = useState('')
  const [saving, setSaving] = useState(false)
  const { show } = useToast()

  const load = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase.from('goals').select('*').eq('user_id', userId).order('created_at')
    setGoals(data || [])
  }, [userId])

  useEffect(() => { load() }, [load])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!name || !target) { show('Preencha nome e valor alvo.', 'error'); return }
    setSaving(true)
    const supabase = createClient()
    await supabase.from('goals').insert({ user_id: userId, name, target: parseFloat(target), current: parseFloat(current) || 0 })
    setSaving(false)
    setShowForm(false)
    setName(''); setTarget(''); setCurrent('')
    show('Meta criada!', 'success')
    load()
  }

  async function deleteGoal(id: string) {
    if (!confirm('Remover esta meta?')) return
    const supabase = createClient()
    await supabase.from('goals').delete().eq('id', id)
    show('Meta removida.', 'error')
    load()
  }

  async function addAmount(goal: Goal, delta: number) {
    const newVal = Math.max(0, goal.current + delta)
    const supabase = createClient()
    await supabase.from('goals').update({ current: newVal }).eq('id', goal.id)
    load()
    if (newVal >= goal.target) show(`🎉 Meta "${goal.name}" concluída!`, 'success')
  }

  const totalSaved = goals.reduce((a, g) => a + g.current, 0)
  const totalTarget = goals.reduce((a, g) => a + g.target, 0)
  const overallPct = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0

  return (
    <>
      <ToastProvider />
      <div className="sticky top-0 z-10 border-b border-line bg-surface/80 backdrop-blur px-6 py-3.5 flex items-center justify-between">
        <div>
          <h1 className="text-sm font-semibold text-white">Metas financeiras</h1>
          <p className="text-xs text-slate-500">{goals.length} metas · {overallPct}% do total alcançado</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn btn-primary btn-sm">
          <Plus size={14} /> Nova meta
        </button>
      </div>

      <div className="p-6 space-y-4 flex-1 overflow-auto">
        {/* Summary */}
        {goals.length > 0 && (
          <div className="card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-500">Progresso geral</span>
              <span className="text-xs font-medium text-slate-300">{fmt(totalSaved)} de {fmt(totalTarget)}</span>
            </div>
            <div className="progress-track h-2">
              <div className="progress-fill bg-accent-500" style={{ width: Math.min(100, overallPct) + '%' }} />
            </div>
            <div className="mt-1 text-right text-[11px] text-slate-600">{overallPct}% concluído</div>
          </div>
        )}

        {/* Goals grid */}
        {goals.length === 0 ? (
          <div className="card p-12 text-center">
            <Trophy size={32} className="text-slate-700 mx-auto mb-3" />
            <p className="text-sm text-slate-500 mb-1">Nenhuma meta ainda</p>
            <p className="text-xs text-slate-600 mb-5">Crie metas como "Carro", "Viagem" ou "Reserva de emergência"</p>
            <button onClick={() => setShowForm(true)} className="btn btn-primary btn-sm mx-auto">
              <Plus size={13} /> Criar primeira meta
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {goals.map((g, i) => {
              const pct = Math.min(100, Math.round((g.current / g.target) * 100))
              const col = GOAL_COLORS[i % GOAL_COLORS.length]
              const done = pct >= 100
              const remaining = Math.max(0, g.target - g.current)
              return (
                <div key={g.id} className="card p-5 flex flex-col gap-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-white mb-0.5">{g.name}</h3>
                      <p className="text-xs text-slate-600">
                        {done ? 'Meta concluída! 🎉' : `Faltam ${fmt(remaining)}`}
                      </p>
                    </div>
                    <button onClick={() => deleteGoal(g.id)}
                      className="btn btn-danger btn-sm p-1.5 flex-shrink-0">
                      <Trash2 size={12} />
                    </button>
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <span className={cn('text-xl font-semibold tabular-nums', col.text)}>{fmt(g.current)}</span>
                      <span className="text-sm text-slate-500 self-end">{fmt(g.target)}</span>
                    </div>
                    <div className="progress-track h-2">
                      <div className={cn('progress-fill', col.bar)} style={{ width: pct + '%' }} />
                    </div>
                    <div className="flex justify-between mt-1.5">
                      <span className="text-[11px] text-slate-600">0%</span>
                      <span className={cn('text-[11px] font-medium', col.text)}>{pct}%</span>
                    </div>
                  </div>

                  {!done && (
                    <div className="flex gap-1.5">
                      {[50, 100, 250].map(v => (
                        <button key={v} onClick={() => addAmount(g, v)}
                          className="btn btn-sm flex-1 text-[11px]">+{v}</button>
                      ))}
                      <button onClick={() => addAmount(g, remaining)}
                        className="btn btn-gain btn-sm text-[11px] px-2">
                        100%
                      </button>
                    </div>
                  )}

                  {done && (
                    <div className="flex items-center gap-2 text-xs text-gain bg-gain-dim/50 rounded-lg px-3 py-2">
                      <Trophy size={13} /> Meta alcançada! Parabéns.
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Nova meta">
        <form onSubmit={handleSave}>
          <div className="modal-body">
            <div>
              <label className="label">Nome da meta</label>
              <input className="input" value={name} onChange={e => setName(e.target.value)}
                placeholder="Ex: Carro, Viagem Europa, Emergência" autoFocus />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Valor alvo (CAD$)</label>
                <div className="input-prefix">
                  <span>CAD$</span>
                  <input type="number" value={target} onChange={e => setTarget(e.target.value)} placeholder="5000" />
                </div>
              </div>
              <div>
                <label className="label">Valor atual (CAD$)</label>
                <div className="input-prefix">
                  <span>CAD$</span>
                  <input type="number" value={current} onChange={e => setCurrent(e.target.value)} placeholder="0" />
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" onClick={() => setShowForm(false)} className="btn">Cancelar</button>
            <button type="submit" disabled={saving} className="btn btn-primary">
              {saving ? <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Criar meta'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  )
}
