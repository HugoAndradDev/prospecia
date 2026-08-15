-- ===========================================================================
-- ProspecIA v3 — rode este arquivo INTEIRO no SQL Editor do Supabase.
-- Aditivo e idempotente: não apaga nem sobrescreve dado existente.
-- ===========================================================================


-- ---------------------------------------------------------------------------
-- O kit de abordagem que o n8n já produz e o painel jogava fora
-- ---------------------------------------------------------------------------
-- O motor gera, para cada negócio, muito mais que o diagnóstico: a mensagem
-- pronta, argumentos de reforço para objeção, o link de WhatsApp montado e o
-- melhor horário para abordar. Até aqui só o diagnóstico chegava ao cliente.

-- A mensagem que o cliente copia e envia ao negócio local (mensagem_chave).
alter table leads add column if not exists mensagem text;

-- Os 3 argumentos de reforço, usados quando o negócio hesita (argumentos).
alter table leads add column if not exists argumentos jsonb;

-- Link wa.me já montado pelo n8n. Substitui montar a URL a partir do telefone:
-- o export final não traz telefone cru, só este link.
alter table leads add column if not exists link_whatsapp text;

-- [{ horario, motivo }] — melhor janela para abordar, calculada por código a
-- partir do horário de funcionamento, não gerada por IA.
alter table leads add column if not exists horarios_sugeridos jsonb;


-- ---------------------------------------------------------------------------
-- Limite do plano: 50 diagnósticos por mês, não 30
-- ---------------------------------------------------------------------------

alter table clientes alter column limite_diagnosticos set default 50;
update clientes set limite_diagnosticos = 50 where limite_diagnosticos = 30;


-- ---------------------------------------------------------------------------
-- Nada a fazer em RLS
-- ---------------------------------------------------------------------------
-- As políticas são por linha, então as colunas novas já ficam cobertas: o
-- cliente lê apenas os próprios leads. E como o GRANT de escrita continua
-- restrito à coluna status, ele não consegue alterar mensagem nem argumentos.
