-- ProspecIA — tabelas base.
-- Em instalação nova: rode este arquivo e depois `migracao-v2.sql`, que
-- adiciona o vínculo com o Supabase Auth, o RLS e as permissões por coluna.

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

-- Campos de contato preenchidos à mão durante a abordagem.
alter table prospects add column if not exists telefone text;
alter table prospects add column if not exists email text;
alter table prospects add column if not exists instagram text;
alter table prospects add column if not exists site text;

-- Retorno agendado por você. Quando preenchido, manda na regra automática
-- dos 3 dias: só cobra follow-up quando a data chegar.
alter table prospects add column if not exists follow_up_em date;

-- Relógio do follow-up automático. Separado de atualizado_em para que editar
-- um telefone não zere o "faz X dias que ninguém responde".
alter table prospects add column if not exists stage_atualizado_em timestamptz;
update prospects
   set stage_atualizado_em = atualizado_em
 where stage_atualizado_em is null;

-- Histórico de cada prospect: o que você anotou ('manual') e as mudanças de
-- estágio registradas automaticamente ('sistema'). Juntos formam a timeline.
create table if not exists prospect_notas (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid not null references prospects(id) on delete cascade,
  texto text not null,
  tipo text not null default 'manual' check (tipo in ('manual', 'sistema')),
  criado_em timestamptz not null default now()
);

create index if not exists prospect_notas_prospect_idx
  on prospect_notas(prospect_id, criado_em desc);

-- Fase 1: sem RLS (não há Supabase Auth ainda). O acesso é controlado pela
-- aplicação: a leitura do painel do cliente usa a service role no servidor
-- (nunca a anon key no navegador), filtrando por slug.
-- Na Fase 2, ao introduzir Supabase Auth, habilitar RLS em clientes e leads.
-- As tabelas prospects e prospect_notas nunca ficam expostas a cliente nenhum.
