import Link from 'next/link'
import {
  TrendingUp, Shield, Target, BarChart3, Zap,
  ArrowRight, CheckCircle2, Globe
} from 'lucide-react'

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-canvas flex flex-col">
      {/* Nav */}
      <nav className="border-b border-line/50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accent-500 flex items-center justify-center shadow-glow-accent">
            <TrendingUp size={16} className="text-white" />
          </div>
          <span className="font-semibold text-white tracking-tight">FinanceTracker</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/login" className="btn btn-ghost btn-sm">Entrar</Link>
          <Link href="/register" className="btn btn-primary btn-sm">Criar conta</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 py-24 text-center relative overflow-hidden">
        {/* ambient glow */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[600px] h-[600px] rounded-full bg-accent-500/5 blur-3xl" />
        </div>

        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-accent-800/80 bg-accent-900/40 text-accent-300 text-xs font-medium mb-8">
            <Globe size={12} />
            Pensado para quem vive no Canadá
          </div>

          <h1 className="text-5xl font-semibold tracking-tight text-white leading-[1.1] mb-5">
            Controle financeiro
            <br />
            <span className="text-accent-400">sem complicação</span>
          </h1>

          <p className="text-slate-400 text-lg leading-relaxed mb-10 max-w-xl mx-auto">
            Registre entradas e gastos, defina metas, aplique a regra&nbsp;50/30/20
            e veja relatórios em PDF — tudo em CAD$.
          </p>

          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link href="/register" className="btn btn-primary btn-lg gap-2">
              Começar de graça <ArrowRight size={16} />
            </Link>
            <Link href="/login" className="btn btn-lg">
              Já tenho conta
            </Link>
          </div>

          <div className="mt-8 flex items-center justify-center gap-6 text-xs text-slate-600">
            {['Sem cartão de crédito', 'Dados só seus', 'Deploy em segundos'].map(t => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle2 size={12} className="text-gain" />
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-line px-6 py-16">
        <div className="max-w-4xl mx-auto">
          <p className="section-title text-center mb-10">O que você vai controlar</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: TrendingUp, title: 'Dashboard em tempo real', desc: 'Saldo, receitas, despesas e economia num só painel com gráficos por categoria.', color: 'text-accent-400' },
              { icon: Zap, title: 'Registro detalhado', desc: 'Tipo, valor, categoria, subcategoria, estabelecimento, cidade e método de pagamento.', color: 'text-gain' },
              { icon: Target, title: 'Metas financeiras', desc: 'Crie objetivos como Carro ou Viagem e acompanhe o progresso com barras visuais.', color: 'text-warn' },
              { icon: BarChart3, title: 'Regra 50/30/20', desc: 'Distribua o salário automaticamente e receba alertas quando o limite se aproximar.', color: 'text-info' },
              { icon: Shield, title: 'Autenticação segura', desc: 'Login via Supabase Auth com Row Level Security — só você vê seus dados.', color: 'text-loss' },
              { icon: Globe, title: 'Relatórios PDF', desc: 'Exporte relatórios mensais com todas as transações, categorias e metas.', color: 'text-accent-300' },
            ].map(({ icon: Icon, title, desc, color }) => (
              <div key={title} className="card-hover p-5">
                <div className={`mb-3 ${color}`}><Icon size={20} /></div>
                <h3 className="text-sm font-medium text-white mb-1.5">{title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-line px-6 py-5 flex items-center justify-between text-xs text-slate-600">
        <span>© 2026 FinanceTracker</span>
        <span>Built with Next.js + Supabase + Vercel</span>
      </footer>
    </main>
  )
}
