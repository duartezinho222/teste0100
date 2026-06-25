'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { TrendingUp, LayoutDashboard, ArrowLeftRight, Target, PieChart, FileText, LogOut, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/dashboard',    label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/transactions', label: 'Transações',   icon: ArrowLeftRight },
  { href: '/goals',        label: 'Metas',        icon: Target },
  { href: '/budget',       label: 'Regra 50/30/20', icon: PieChart },
  { href: '/reports',      label: 'Relatórios',   icon: FileText },
]

export default function Sidebar({ email }: { email?: string }) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <aside className="w-[220px] flex-shrink-0 bg-surface border-r border-line flex flex-col">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-line">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-8 h-8 rounded-lg bg-accent-500 flex items-center justify-center shadow-glow-accent flex-shrink-0">
            <TrendingUp size={15} className="text-white" />
          </div>
          <span className="font-semibold text-white text-sm tracking-tight">FinanceTracker</span>
        </div>
        {email && (
          <p className="text-[11px] text-slate-600 pl-[42px] truncate">{email}</p>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        <p className="section-title px-3 mb-3">Menu</p>
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link key={href} href={href}
              className={cn('nav-item relative', active && 'active')}>
              {active && <span className="sidebar-accent" />}
              <Icon size={15} className={active ? 'text-accent-400' : ''} />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight size={12} className="text-accent-500/60" />}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-line">
        <button onClick={handleLogout}
          className="nav-item w-full text-slate-600 hover:text-loss hover:bg-loss-dim/30">
          <LogOut size={14} />
          Sair da conta
        </button>
      </div>
    </aside>
  )
}
