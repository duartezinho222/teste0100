# FinanceTracker

Aplicativo de controle financeiro pessoal — Next.js 15 + Supabase + Vercel.

## Stack

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Backend**: Supabase (Auth + PostgreSQL + RLS)
- **Gráficos**: Recharts
- **PDF**: jsPDF + jspdf-autotable
- **Deploy**: Vercel

---

## Setup local

### 1. Clonar e instalar

```bash
git clone https://github.com/seu-usuario/finance-tracker.git
cd finance-tracker
npm install
```

### 2. Criar projeto no Supabase

1. Acesse [supabase.com](https://supabase.com) → **New project**
2. Anote a **Project URL** e a **anon public key**
3. No **SQL Editor**, cole e execute o conteúdo de `supabase-schema.sql`

### 3. Variáveis de ambiente

```bash
cp .env.local.example .env.local
```

Edite `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key-aqui
```

### 4. Rodar localmente

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

---

## Deploy na Vercel

### Opção A — Via CLI (recomendado)

```bash
npm i -g vercel
vercel login
vercel
```

### Opção B — Via GitHub

1. Push o projeto para um repositório no GitHub
2. Acesse [vercel.com](https://vercel.com) → **New Project** → importe o repo
3. Em **Environment Variables**, adicione:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Clique em **Deploy**

---

## Supabase Auth — configurar redirect

No painel do Supabase:

**Authentication → URL Configuration**

- **Site URL**: `https://seu-app.vercel.app`
- **Redirect URLs**: `https://seu-app.vercel.app/**`

---

## Estrutura do projeto

```
src/
├── app/
│   ├── page.tsx                  # Landing page
│   ├── login/page.tsx
│   ├── register/page.tsx
│   ├── dashboard/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── transactions/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── goals/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── budget/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   └── reports/
│       ├── layout.tsx
│       └── page.tsx
├── components/
│   ├── layout/Sidebar.tsx
│   ├── ui/{Modal,Toast}.tsx
│   ├── forms/TransactionForm.tsx
│   ├── dashboard/DashboardClient.tsx
│   ├── transactions/TransactionsClient.tsx
│   ├── goals/GoalsClient.tsx
│   ├── budget/BudgetClient.tsx
│   └── reports/ReportsClient.tsx
├── lib/
│   ├── supabase.ts               # client-side
│   ├── supabase-server.ts        # server-side
│   └── utils.ts
├── types/index.ts
└── middleware.ts                 # proteção de rotas
```

---

## Funcionalidades

- ✅ Autenticação (login, cadastro, logout) via Supabase Auth
- ✅ Dashboard com métricas, gráfico de pizza e últimas transações
- ✅ Banner automático de distribuição de salário (regra 50/30/20)
- ✅ CRUD completo de transações com filtros e busca
- ✅ Metas financeiras com barra de progresso e incremento rápido
- ✅ Regra 50/30/20 explicada e configurável (4 modos)
- ✅ Alertas automáticos ao atingir 70%, 90% e 100% do orçamento
- ✅ Relatórios com gráfico de barras e exportação PDF
- ✅ Row Level Security — cada usuário só vê seus próprios dados
- ✅ Middleware de proteção de rotas
- ✅ Design dark premium responsivo
