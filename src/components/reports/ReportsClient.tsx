'use client'
import { useEffect, useState, useCallback } from 'react'
import { Download, FileText } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { Transaction, Goal } from '@/types'
import { fmt, fmtDate } from '@/lib/utils'
import { ToastProvider, useToast } from '@/components/ui/Toast'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts'

const COLORS = ['#4550F0','#00C896','#F5A623','#a78bfa','#FF4D6A','#38BDF8','#fb923c','#64748b']

export default function ReportsClient({ userId }: { userId: string }) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const { show } = useToast()

  const load = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const [txRes, goalsRes] = await Promise.all([
      supabase.from('transactions').select('*').eq('user_id', userId).order('date', { ascending: false }),
      supabase.from('goals').select('*').eq('user_id', userId),
    ])
    setTransactions(txRes.data || [])
    setGoals(goalsRes.data || [])
    setLoading(false)
  }, [userId])

  useEffect(() => { load() }, [load])

  const income   = transactions.filter(t => t.type === 'receita').reduce((a,t) => a+t.amount, 0)
  const expenses = transactions.filter(t => t.type === 'gasto').reduce((a,t) => a+t.amount, 0)
  const balance  = income - expenses

  const catData = (() => {
    const m: Record<string, number> = {}
    transactions.filter(t => t.type === 'gasto').forEach(t => { m[t.category] = (m[t.category]||0)+t.amount })
    return Object.entries(m).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value)
  })()

  async function genPDF() {
    const { default: jsPDF } = await import('jspdf')
    const { default: autoTable } = await import('jspdf-autotable')
    const doc = new jsPDF()
    const now = new Date().toLocaleDateString('pt-BR')

    // Header
    doc.setFillColor(5, 10, 20)
    doc.rect(0, 0, 210, 297, 'F')
    doc.setFillColor(12, 21, 37)
    doc.rect(0, 0, 210, 38, 'F')
    doc.setTextColor(241, 245, 249)
    doc.setFontSize(18); doc.setFont('helvetica', 'bold')
    doc.text('FinanceTracker', 14, 18)
    doc.setFontSize(9); doc.setFont('helvetica', 'normal')
    doc.setTextColor(148, 163, 184)
    doc.text('Relatório financeiro · ' + now, 14, 26)

    // Summary
    let y = 50
    doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(241, 245, 249)
    doc.text('Resumo', 14, y); y += 8
    doc.setFontSize(9); doc.setFont('helvetica', 'normal')
    doc.setTextColor(0, 200, 150); doc.text('Receitas: ' + fmt(income), 14, y)
    doc.setTextColor(255, 77, 106); doc.text('Gastos: ' + fmt(expenses), 80, y)
    doc.setTextColor(56, 189, 248); doc.text('Saldo: ' + fmt(balance), 150, y)
    y += 14

    // Transactions table
    doc.setTextColor(241, 245, 249)
    doc.setFontSize(11); doc.setFont('helvetica', 'bold')
    doc.text('Transações', 14, y); y += 4

    autoTable(doc, {
      startY: y,
      head: [['Data', 'Tipo', 'Categoria', 'Descrição / Local', 'Valor']],
      body: transactions.map(t => [
        fmtDate(t.date),
        t.type === 'receita' ? 'Receita' : 'Gasto',
        t.category,
        t.description || t.place || t.subcategory || '—',
        (t.type === 'receita' ? '+' : '-') + fmt(t.amount),
      ]),
      styles: { fontSize: 8, textColor: [226, 232, 248], fillColor: [8, 15, 30] },
      headStyles: { fillColor: [12, 21, 37], textColor: [148, 163, 184], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [10, 22, 40] },
      columnStyles: { 4: { halign: 'right', fontStyle: 'bold' } },
      theme: 'plain',
    })

    // Goals
    if (goals.length > 0) {
      // @ts-ignore
      y = (doc as any).lastAutoTable.finalY + 12
      doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(241, 245, 249)
      doc.text('Metas', 14, y); y += 4
      autoTable(doc, {
        startY: y,
        head: [['Meta', 'Progresso', 'Atual', 'Alvo']],
        body: goals.map(g => {
          const pct = Math.min(100, Math.round((g.current / g.target) * 100))
          return [g.name, pct + '%', fmt(g.current), fmt(g.target)]
        }),
        styles: { fontSize: 8, textColor: [226, 232, 248], fillColor: [8, 15, 30] },
        headStyles: { fillColor: [12, 21, 37], textColor: [148, 163, 184], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [10, 22, 40] },
        theme: 'plain',
      })
    }

    doc.save('finance-tracker-' + now.replace(/\//g, '-') + '.pdf')
    show('PDF exportado com sucesso!', 'success')
  }

  return (
    <>
      <ToastProvider />
      <div className="sticky top-0 z-10 border-b border-line bg-surface/80 backdrop-blur px-6 py-3.5 flex items-center justify-between">
        <div>
          <h1 className="text-sm font-semibold text-white">Relatórios</h1>
          <p className="text-xs text-slate-500">{transactions.length} transações registradas</p>
        </div>
        <button onClick={genPDF} className="btn btn-primary btn-sm">
          <Download size={14} /> Exportar PDF
        </button>
      </div>

      <div className="p-6 space-y-5 flex-1 overflow-auto">
        {/* Metric cards */}
        <div className="grid grid-cols-3 gap-3">
          <div className="metric-card">
            <span className="metric-label">Total receitas</span>
            <span className="metric-value text-gain">{fmt(income)}</span>
          </div>
          <div className="metric-card">
            <span className="metric-label">Total gastos</span>
            <span className="metric-value text-loss">{fmt(expenses)}</span>
          </div>
          <div className="metric-card">
            <span className="metric-label">Saldo final</span>
            <span className={`metric-value ${balance >= 0 ? 'text-info' : 'text-loss'}`}>{fmt(balance)}</span>
          </div>
        </div>

        {/* Bar chart */}
        {catData.length > 0 && (
          <div className="card p-5">
            <h2 className="text-sm font-medium text-white mb-4">Gastos por categoria</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={catData} barSize={32}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={v => 'CAD$'+v} />
                <Tooltip
                  contentStyle={{ background: '#0C1525', border: '1px solid #1A2D47', borderRadius: 10, fontSize: 12 }}
                  formatter={(v: number) => [fmt(v), 'Total']}
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                />
                <Bar dataKey="value" radius={[6,6,0,0]}>
                  {catData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Full transaction table */}
        <div className="card overflow-hidden">
          <div className="px-4 py-3 border-b border-line flex items-center gap-2">
            <FileText size={13} className="text-slate-500" />
            <h2 className="text-xs font-medium text-white">Histórico completo</h2>
          </div>
          {loading ? (
            <div className="p-8 flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-line border-t-accent-500 rounded-full animate-spin" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-10 text-center text-sm text-slate-600">Nenhuma transação registrada</div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Tipo</th>
                  <th>Categoria</th>
                  <th>Descrição</th>
                  <th className="text-right pr-4">Valor</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(t => (
                  <tr key={t.id}>
                    <td className="text-slate-500 text-xs">{fmtDate(t.date)}</td>
                    <td>
                      <span className={`badge ${t.type === 'receita' ? 'badge-gain' : 'badge-loss'}`}>
                        {t.type}
                      </span>
                    </td>
                    <td className="text-xs text-slate-300">{t.category}</td>
                    <td className="text-xs text-slate-500">{t.description || t.place || t.subcategory || '—'}</td>
                    <td className={`text-right pr-4 text-sm font-semibold tabular-nums ${t.type==='receita'?'text-gain':'text-loss'}`}>
                      {t.type === 'receita' ? '+' : '-'}{fmt(t.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  )
}
