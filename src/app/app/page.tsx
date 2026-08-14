import { redirect } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase-server";
import { inicioDoCicloAtual, fimDoCicloAtual, formatarDiaMes } from "@/lib/ciclo";
import { linkWhatsApp, msgSuporte } from "@/lib/contato";
import { SeletorDeTema } from "@/components/tema";
import { BotaoSair } from "./sair";
import { Kanban } from "./kanban";
import type { Lead } from "@/lib/types";

// A sessão vem de cookie: nunca servir versão em cache de uma conta para outra.
export const dynamic = "force-dynamic";

export default async function AreaDoCliente() {
  const supabase = await getSupabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?motivo=sessao");

  // Ambas as consultas passam por RLS: só retornam o que este usuário pode ver.
  const { data: cliente } = await supabase
    .from("clientes")
    .select("id, nome, limite_diagnosticos, assinatura_iniciada_em, criado_em")
    .maybeSingle();

  if (!cliente) return <ContaNaoVinculada />;

  const { data: leads } = await supabase
    .from("leads")
    .select("*")
    .order("entregue_em", { ascending: false });

  const lista = (leads ?? []) as Lead[];

  const inicioCiclo = inicioDoCicloAtual(
    cliente.assinatura_iniciada_em,
    cliente.criado_em
  );
  const usados = lista.filter(
    (l) => new Date(l.entregue_em) >= inicioCiclo
  ).length;

  return (
    <div className="flex min-h-screen flex-col bg-fundo text-texto">
      <Cabecalho nomeCliente={cliente.nome} />

      <main className="mx-auto w-full max-w-5xl flex-1 space-y-5 px-4 py-6">
        <ContadorDeUso
          usados={usados}
          limite={cliente.limite_diagnosticos}
          inicio={inicioCiclo}
        />

        {lista.length === 0 ? <SemLeadsAinda /> : <Kanban iniciais={lista} />}
      </main>

      <Rodape nomeCliente={cliente.nome} />
    </div>
  );
}

function Cabecalho({ nomeCliente }: { nomeCliente: string }) {
  return (
    <header className="border-b border-borda bg-superficie">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-3 px-4 py-3">
        <div className="min-w-0 flex-1">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-marca">
            ProspecIA
          </p>
          <p className="truncate text-sm font-semibold">{nomeCliente}</p>
        </div>
        <SeletorDeTema />
        <BotaoSair />
      </div>
    </header>
  );
}

function ContadorDeUso({
  usados,
  limite,
  inicio,
}: {
  usados: number;
  limite: number;
  inicio: Date;
}) {
  const noLimite = usados >= limite;
  const proporcao = limite > 0 ? Math.min(usados / limite, 1) : 0;
  const fim = fimDoCicloAtual(inicio);

  return (
    <section className="rounded-xl border border-borda bg-superficie p-4">
      <div className="mb-2.5 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
        <p className="text-[15px]">
          <strong className="text-lg font-semibold tabular-nums">
            {usados} de {limite}
          </strong>{" "}
          <span className="text-texto-suave">diagnósticos usados neste ciclo</span>
        </p>
        <p className="font-mono text-[11px] text-texto-fraco">
          {formatarDiaMes(inicio)} a {formatarDiaMes(fim)}
        </p>
      </div>

      <div
        role="progressbar"
        aria-valuenow={usados}
        aria-valuemin={0}
        aria-valuemax={limite}
        aria-label="Diagnósticos usados no ciclo"
        className="h-1.5 overflow-hidden rounded-full bg-superficie-2"
      >
        <div
          className={`h-full rounded-full transition-all ${
            noLimite ? "bg-alerta" : "bg-convertido"
          }`}
          style={{ width: `${proporcao * 100}%` }}
        />
      </div>

      {noLimite && (
        <p className="mt-2.5 rounded-lg border border-alerta/40 bg-alerta-fraco px-3 py-2 text-[12.5px] text-alerta">
          Você chegou ao limite deste ciclo. Continua com acesso a tudo que já
          está aqui — para receber mais diagnósticos agora, me chame no WhatsApp.
        </p>
      )}
    </section>
  );
}

function SemLeadsAinda() {
  return (
    <section className="rounded-xl border border-dashed border-borda bg-superficie px-6 py-14 text-center">
      <p className="text-[15px] font-semibold">
        Seus primeiros diagnósticos aparecem aqui
      </p>
      <p className="mx-auto mt-1.5 max-w-md text-sm leading-relaxed text-texto-suave">
        Assim que eu entregar o primeiro lote, cada negócio vira um card que você
        arrasta de Novo para Contatado e, quando fechar, para Convertido.
      </p>
    </section>
  );
}

function ContaNaoVinculada() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-fundo px-4 text-texto">
      <div className="max-w-md rounded-xl border border-borda bg-superficie p-6 text-center">
        <h1 className="mb-1.5 text-base font-semibold">
          Conta ainda não liberada
        </h1>
        <p className="text-sm leading-relaxed text-texto-suave">
          Seu login funcionou, mas ele ainda não está ligado a uma conta de
          cliente.
        </p>
        <a
          href={linkWhatsApp("Oi Hugo! Meu login entrou mas a conta não está liberada.")}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-block rounded-lg bg-marca px-4 py-2 text-sm font-semibold text-marca-contraste hover:opacity-90"
        >
          Falar com o Hugo
        </a>
      </div>
    </main>
  );
}

function Rodape({ nomeCliente }: { nomeCliente: string }) {
  return (
    <footer className="mt-4 border-t border-borda bg-superficie">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4">
        <p className="text-[12.5px] text-texto-fraco">
          Dúvida, problema ou quer mais diagnósticos?
        </p>
        <a
          href={linkWhatsApp(msgSuporte(nomeCliente))}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border border-convertido/40 bg-convertido-fraco px-3.5 py-2 text-[13px] font-semibold text-convertido hover:opacity-85"
        >
          Falar comigo no WhatsApp
        </a>
      </div>
    </footer>
  );
}
