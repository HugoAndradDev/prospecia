-- ===========================================================================
-- ProspecIA v2 — rode este arquivo INTEIRO no SQL Editor do Supabase.
-- Pode rodar mais de uma vez sem problema: tudo aqui é idempotente.
-- Não apaga nem sobrescreve nenhum dado existente.
-- ===========================================================================


-- ---------------------------------------------------------------------------
-- PARTE 1 — Migração pendente do Hunter 2.0
-- ---------------------------------------------------------------------------

alter table prospects add column if not exists telefone text;
alter table prospects add column if not exists email text;
alter table prospects add column if not exists instagram text;
alter table prospects add column if not exists site text;
alter table prospects add column if not exists follow_up_em date;
alter table prospects add column if not exists stage_atualizado_em timestamptz;

update prospects
   set stage_atualizado_em = atualizado_em
 where stage_atualizado_em is null;

create table if not exists prospect_notas (
  id uuid primary key default gen_random_uuid(),
  prospect_id uuid not null references prospects(id) on delete cascade,
  texto text not null,
  tipo text not null default 'manual' check (tipo in ('manual', 'sistema')),
  criado_em timestamptz not null default now()
);

create index if not exists prospect_notas_prospect_idx
  on prospect_notas(prospect_id, criado_em desc);


-- ---------------------------------------------------------------------------
-- PARTE 2 — Ligar cada cliente a um login, e ao seu plano
-- ---------------------------------------------------------------------------

-- Preenchido quando você cria o usuário no Supabase Auth e vincula pelo /admin.
-- Cliente sem user_id continua acessível apenas pelo link secreto antigo.
alter table clientes add column if not exists user_id uuid unique
  references auth.users(id) on delete set null;

-- O "30" de "12 de 30 diagnósticos usados". Configurável por cliente.
alter table clientes add column if not exists limite_diagnosticos int not null default 30;

-- Âncora do ciclo de cobrança: o contador zera no aniversário mensal desta data.
-- Nulo = usa a data de criação do cliente.
alter table clientes add column if not exists assinatura_iniciada_em date;


-- ---------------------------------------------------------------------------
-- PARTE 3 — Carimbar atualizado_em no servidor
-- ---------------------------------------------------------------------------
-- O cliente logado não recebe permissão de escrever nesta coluna: quem carimba
-- é o banco. Assim a data não depende do relógio nem da boa-fé do navegador.

create or replace function tocar_atualizado_em()
returns trigger
language plpgsql
as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$;

drop trigger if exists leads_tocar_atualizado_em on leads;
create trigger leads_tocar_atualizado_em
  before update on leads
  for each row execute function tocar_atualizado_em();


-- ---------------------------------------------------------------------------
-- PARTE 4 — Row Level Security
-- ---------------------------------------------------------------------------
-- A partir daqui o navegador passa a falar direto com o Supabase usando a
-- chave pública. O RLS é o que impede um cliente de ler os dados do outro.

alter table clientes        enable row level security;
alter table leads           enable row level security;
alter table prospects       enable row level security;
alter table prospect_notas  enable row level security;

-- Cliente enxerga apenas a própria conta.
drop policy if exists "cliente le a propria conta" on clientes;
create policy "cliente le a propria conta"
  on clientes for select
  to authenticated
  using (user_id = auth.uid());

-- Cliente enxerga apenas os leads entregues a ele.
drop policy if exists "cliente le os proprios leads" on leads;
create policy "cliente le os proprios leads"
  on leads for select
  to authenticated
  using (cliente_id in (select id from clientes where user_id = auth.uid()));

-- Cliente move os próprios leads no kanban. O WITH CHECK impede que ele
-- reatribua um lead para outro cliente durante o update.
drop policy if exists "cliente move os proprios leads" on leads;
create policy "cliente move os proprios leads"
  on leads for update
  to authenticated
  using      (cliente_id in (select id from clientes where user_id = auth.uid()))
  with check (cliente_id in (select id from clientes where user_id = auth.uid()));

-- prospects e prospect_notas ficam com RLS ligado e ZERO políticas.
-- Sem política, ninguém passa: seu CRM de prospecção fica invisível para
-- qualquer cliente logado. O /admin continua enxergando porque usa a chave
-- secreta no servidor, que passa por cima do RLS por design.


-- ---------------------------------------------------------------------------
-- PARTE 5 — Permissões por coluna
-- ---------------------------------------------------------------------------
-- O RLS decide QUAIS LINHAS. Os grants abaixo decidem QUAIS COLUNAS.
-- Juntos garantem que o cliente só consiga mexer no status dos próprios leads.

revoke all on clientes       from anon, authenticated;
revoke all on leads          from anon, authenticated;
revoke all on prospects      from anon, authenticated;
revoke all on prospect_notas from anon, authenticated;

grant select            on clientes to authenticated;
grant select            on leads    to authenticated;
grant update (status)   on leads    to authenticated;

-- Visitante não autenticado não lê nada: a landing e o login não precisam
-- de acesso a tabela nenhuma.
