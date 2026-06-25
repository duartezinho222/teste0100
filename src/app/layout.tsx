import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'FinanceTracker — Controle financeiro pessoal',
  description: 'Controle seus gastos, metas e orçamento com a regra 50/20/30. Feito para o Canadá.',
  icons: { icon: '/favicon.ico' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="min-h-screen bg-canvas text-slate-200 antialiased">
        {children}
      </body>
    </html>
  )
}
