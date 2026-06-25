'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { TrendingUp, Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react'
import { createClient } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!email || !pass) { setError('Preencha todos os campos.'); return }
    setLoading(true)
    const supabase = createClient()
    const { error: err } = await supabase.auth.signInWithPassword({ email, password: pass })
    setLoading(false)
    if (err) { setError('Email ou senha incorretos.'); return }
    router.push('/dashboard')
    router.refresh()
  }

  return (
    <main className="min-h-screen bg-canvas flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col w-[420px] bg-surface border-r border-line p-10 justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent-500 flex items-center justify-center shadow-glow-accent">
            <TrendingUp size={16} className="text-white" />
          </div>
          <span className="font-semibold text-white">FinanceTracker</span>
        </div>
        <div>
          <p className="text-2xl font-medium text-white leading-snug mb-4">
            "Entrar no mercado de trabalho no Canadá e finalmente entender meu dinheiro."
          </p>
          <p className="text-sm text-slate-500">— Matheus, Vancouver BC</p>
        </div>
        <div className="space-y-2">
          {['Todos os dados criptografados', 'Row Level Security ativado', 'Só você acessa suas finanças'].map(t => (
            <div key={t} className="flex items-center gap-2 text-sm text-slate-500">
              <div className="w-1.5 h-1.5 rounded-full bg-gain" />
              {t}
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-7 h-7 rounded-lg bg-accent-500 flex items-center justify-center">
              <TrendingUp size={14} className="text-white" />
            </div>
            <span className="font-semibold text-white text-sm">FinanceTracker</span>
          </div>

          <h1 className="text-2xl font-semibold text-white tracking-tight mb-1">Bem-vindo de volta</h1>
          <p className="text-sm text-slate-500 mb-8">Entre com suas credenciais para continuar</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="input" placeholder="seu@email.com" autoComplete="email"
              />
            </div>
            <div>
              <label className="label">Senha</label>
              <div className="relative">
                <input
                  type={show ? 'text' : 'password'} value={pass} onChange={e => setPass(e.target.value)}
                  className="input pr-10" placeholder="••••••••" autoComplete="current-password"
                />
                <button type="button" onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                  {show ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="alert alert-danger text-xs">
                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn btn-primary w-full mt-2">
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Entrando...
                </span>
              ) : (
                <span className="flex items-center gap-2">Entrar <ArrowRight size={15} /></span>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Não tem conta?{' '}
            <Link href="/register" className="text-accent-400 hover:text-accent-300 transition-colors">
              Criar conta gratuita
            </Link>
          </p>
          <p className="text-center mt-2">
            <Link href="/" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">
              ← Página inicial
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
