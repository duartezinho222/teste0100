'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { TrendingUp, Eye, EyeOff, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase'

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [pass, setPass] = useState('')
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!email || !pass) { setError('Preencha todos os campos.'); return }
    if (pass.length < 6) { setError('A senha precisa ter no mínimo 6 caracteres.'); return }
    setLoading(true)
    const supabase = createClient()
    const { error: err } = await supabase.auth.signUp({
      email, password: pass,
      options: { emailRedirectTo: `${location.origin}/dashboard` }
    })
    setLoading(false)
    if (err) { setError(err.message); return }
    // Try auto-login
    const { error: loginErr } = await supabase.auth.signInWithPassword({ email, password: pass })
    if (!loginErr) { router.push('/dashboard'); router.refresh(); return }
    setDone(true)
  }

  if (done) return (
    <main className="min-h-screen bg-canvas flex items-center justify-center p-6">
      <div className="card p-8 max-w-sm w-full text-center">
        <CheckCircle2 size={40} className="text-gain mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-white mb-2">Conta criada!</h2>
        <p className="text-sm text-slate-500 mb-6">Verifique seu email para confirmar o cadastro e acessar sua conta.</p>
        <Link href="/login" className="btn btn-primary w-full justify-center">Ir para o login</Link>
      </div>
    </main>
  )

  return (
    <main className="min-h-screen bg-canvas flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-7 h-7 rounded-lg bg-accent-500 flex items-center justify-center shadow-glow-accent">
            <TrendingUp size={14} className="text-white" />
          </div>
          <span className="font-semibold text-white text-sm">FinanceTracker</span>
        </div>

        <h1 className="text-2xl font-semibold text-white tracking-tight mb-1">Criar conta</h1>
        <p className="text-sm text-slate-500 mb-8">Comece a controlar suas finanças hoje</p>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="label">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              className="input" placeholder="seu@email.com" />
          </div>
          <div>
            <label className="label">Senha</label>
            <div className="relative">
              <input type={show ? 'text' : 'password'} value={pass} onChange={e => setPass(e.target.value)}
                className="input pr-10" placeholder="mínimo 6 caracteres" />
              <button type="button" onClick={() => setShow(!show)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                {show ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="alert alert-danger text-xs">
              <AlertCircle size={14} className="shrink-0 mt-0.5" />{error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn btn-primary w-full mt-2">
            {loading
              ? <span className="flex items-center gap-2"><span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Criando...</span>
              : <span className="flex items-center gap-2">Criar conta <ArrowRight size={15} /></span>
            }
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-6">
          Já tem conta?{' '}
          <Link href="/login" className="text-accent-400 hover:text-accent-300 transition-colors">Entrar</Link>
        </p>
      </div>
    </main>
  )
}
