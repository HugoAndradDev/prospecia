-- ProspecIA — Fase 1 (sem login, sem RLS ainda)
-- Rode isso no SQL Editor do Supabase.

create extension if not exists "pgcrypto";

create table if not exists clientes (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  slug text not null unique,
  criado_em timestamptz not null default now()
);

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid not null references clientes(id) on delete cascade,
  nome_negocio text not null,
  endereco text,
  telefone text,
  diagnostico text,
  status text not null default 'novo' check (status in ('novo', 'contatado', 'convertido')),
  entregue_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

create index if not exists leads_cliente_id_idx on leads(cliente_id);

-- Prospecção do Hunter: agências/freelancers que o Hugo aborda para virarem
-- clientes. Uso interno, nunca aparece no painel de nenhum cliente.
-- place_id vem do Google Places e é o que evita reimportar o mesmo prospect.
create table if not exists prospects (
  id uuid primary key default gen_random_uuid(),
  place_id text not null unique,
  nome text not null,
  endereco text,
  copy_b2b text,
  mensagem_pronta text,
  link_whatsapp text,
  aberto_agora boolean,
  horario text,
  melhor_horario_contato text,
  stage text not null default 'pendente' check (
    stage in ('pendente', 'contatado', 'respondeu', 'sem_resposta', 'cliente', 'descartado')
  ),
  contatado_em timestamptz,
  atualizado_em timestamptz not null default now(),
  criado_em timestamptz not null default now()
);

-- Fase 1: sem RLS (não há Supabase Auth ainda). O acesso é controlado pela
-- aplicação: a leitura do painel do cliente usa a service role no servidor
-- (nunca a anon key no navegador), filtrando por slug.
-- Na Fase 2, ao introduzir Supabase Auth, habilitar RLS em clientes e leads.
-- A tabela prospects nunca fica exposta a cliente nenhum.
