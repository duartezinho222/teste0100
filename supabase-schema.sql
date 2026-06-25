-- ============================================================
-- FinanceTracker — Schema completo para Supabase
-- Cole este SQL no SQL Editor do Supabase e execute
-- ============================================================

-- 1. Profiles (criado automaticamente ao registrar)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  budget_rule text not null default '50-20-30',
  created_at timestamptz not null default now()
);

-- 2. Transactions
create table if not exists public.transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  type text not null check (type in ('receita', 'gasto')),
  amount numeric(12, 2) not null check (amount > 0),
  category text not null,
  subcategory text,
  place text,
  city text,
  payment_method text,
  description text,
  tags text[],
  date date not null,
  created_at timestamptz not null default now()
);

-- 3. Goals
create table if not exists public.goals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  target numeric(12, 2) not null check (target > 0),
  current numeric(12, 2) not null default 0 check (current >= 0),
  created_at timestamptz not null default now()
);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.profiles    enable row level security;
alter table public.transactions enable row level security;
alter table public.goals        enable row level security;

-- Profiles
create policy "users can view own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- Transactions
create policy "users can select own transactions"
  on public.transactions for select using (auth.uid() = user_id);

create policy "users can insert own transactions"
  on public.transactions for insert with check (auth.uid() = user_id);

create policy "users can update own transactions"
  on public.transactions for update using (auth.uid() = user_id);

create policy "users can delete own transactions"
  on public.transactions for delete using (auth.uid() = user_id);

-- Goals
create policy "users can select own goals"
  on public.goals for select using (auth.uid() = user_id);

create policy "users can insert own goals"
  on public.goals for insert with check (auth.uid() = user_id);

create policy "users can update own goals"
  on public.goals for update using (auth.uid() = user_id);

create policy "users can delete own goals"
  on public.goals for delete using (auth.uid() = user_id);

-- ============================================================
-- Trigger: auto-criar profile ao registrar
-- ============================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- Índices para performance
-- ============================================================

create index if not exists idx_transactions_user_id on public.transactions (user_id);
create index if not exists idx_transactions_date    on public.transactions (date desc);
create index if not exists idx_transactions_type    on public.transactions (type);
create index if not exists idx_goals_user_id        on public.goals (user_id);
