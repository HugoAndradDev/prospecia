"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminGate, AdminNav, sairDoAdmin } from "@/components/admin-gate";
import { DetalheProspect } from "./detalhe-prospect";
import {
  PROSPECT_STAGES,
  STAGE_LABELS,
  formatarData,
  motivoFollowUp,
  precisaFollowUp,
  type Prospect,
  type ProspectStage,
} from "@/lib/types";

export default function HunterPage() {
  return <AdminGate>{(secret) => <HunterCRM secret={secret} />}</AdminGate>;
}

type Filtro = "all" | "followup" | ProspectStage;
type Ordenacao = "atividade" | "followup" | "nome" | "entrada";

const ORDENACOES: { id: Ordenacao; label: string }[] = [
  { id: "atividade", label: "Última atividade" },
  { id: "followup", label: "Follow-up primeiro" },
  { id: "entrada", label: "Ordem de entrada" },
  { id: "nome", label: "Nome A–Z" },
];

const CORES_FUNIL: Record<ProspectStage, string> = {
  pendente: "text-neutral-300",
  contatado: "text-slate-300",
  sem_resposta: "text-amber-400",
  respondeu: "text-blue-400",
  cliente: "text-emerald-400",
  descartado: "text-neutral-600",
};

const CORES_PONTO: Record<ProspectStage, string> = {
  pendente: "bg-neutral-600",
  contatado: "bg-slate-400",
  sem_resposta: "bg-amber-500",
  respondeu: "bg-blue-500",
  cliente: "bg-emerald-500",
  descartado: "bg-neutral-700",
};

function HunterCRM({ secret }: { secret: string }) {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [selecionadoId, setSelecionadoId] = useState<string | null>(null);
  const [filtro, setFiltro] = useState<Filtro>("all");
  const [busca, setBusca] = useState("");
  const [ordenacao, setOrdenacao] = useState<Ordenacao>("atividade");
  const [painel, setPainel] = useState<"import" | "novo" | null>(null);
  const [toast, setToast] = useState("");

  const mostrarToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2200);
  }, []);

  const carregar = useCallback(async () => {
    const res = await fetch("/api/admin/prospects", {
      headers: { "x-admin-secret": secret },
    });
    if (res.ok) setProspects((await res.json()).prospects);
    setCarregando(false);
  }, [secret]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const contagens = useMemo(() => {
    const c = Object.fromEntries(PROSPECT_STAGES.map((s) => [s, 0])) as Record<
      ProspectStage,
      number
    >;
    for (const p of prospects) c[p.stage]++;
    return c;
  }, [prospects]);

  const totalFollowUp = useMemo(
    () => prospects.filter(precisaFollowUp).length,
    [prospects]
  );

  const abordados = prospects.length - contagens.pendente;
  const taxaResposta = abordados
    ? Math.round(((contagens.respondeu + contagens.cliente) / abordados) * 100)
    : 0;
  const taxaFechamento = abordados
    ? Math.round((contagens.cliente / abordados) * 100)
    : 0;

  const visiveis = useMemo(() => {
    const q = busca.trim().toLowerCase();
    const lista = prospects.filter((p) => {
      if (filtro === "followup" && !precisaFollowUp(p)) return false;
      if (filtro !== "all" && filtro !== "followup" && p.stage !== filtro)
        return false;
      if (q) {
        const alvo =
          `${p.nome} ${p.endereco ?? ""} ${p.telefone ?? ""} ${p.email ?? ""}`.toLowerCase();
        if (!alvo.includes(q)) return false;
      }
      return true;
    });

    const porData = (a: string | null, b: string | null) =>
      new Date(b ?? 0).getTime() - new Date(a ?? 0).getTime();

    return lista.sort((a, b) => {
      switch (ordenacao) {
        case "nome":
          return a.nome.localeCompare(b.nome, "pt-BR");
        case "entrada":
          return porData(b.criado_em, a.criado_em);
        case "followup": {
          const fa = precisaFollowUp(a) ? 0 : 1;
          const fb = precisaFollowUp(b) ? 0 : 1;
          if (fa !== fb) return fa - fb;
          return porData(a.atualizado_em, b.atualizado_em);
        }
        default:
          return porData(a.atualizado_em, b.atualizado_em);
      }
    });
  }, [prospects, filtro, busca, ordenacao]);

  const selecionado = prospects.find((p) => p.id === selecionadoId) ?? null;

  function aplicarAtualizacao(atualizado: Prospect) {
    setProspects((atual) =>
      atual.map((p) => (p.id === atualizado.id ? atualizado : p))
    );
  }

  function removerDaLista(id: string) {
    setProspects((atual) => atual.filter((p) => p.id !== id));
    setSelecionadoId(null);
  }

  async function baixarBackup() {
    const res = await fetch("/api/admin/backup", {
      headers: { "x-admin-secret": secret },
    });
    if (!res.ok) return mostrarToast("Falha ao gerar backup");
    const blob = new Blob([JSON.stringify(await res.json(), null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hunter-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    mostrarToast("Backup baixado");
  }

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="mx-auto max-w-[1400px] space-y-5 px-4 py-6">
        <div className="flex items-center justify-between gap-3">
          <AdminNav atual="hunter" />
          <button
            onClick={sairDoAdmin}
            className="text-sm text-neutral-500 hover:text-neutral-300"
          >
            sair
          </button>
        </div>

        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-1.5 font-mono text-xs uppercase tracking-wider text-orange-500">
              ProspecIA Hunter
            </p>
            <h1 className="text-2xl font-semibold">Prospecção de agências</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setPainel(painel === "novo" ? null : "novo")}
              className="rounded-lg border border-neutral-800 bg-neutral-900 px-3.5 py-2 text-sm text-neutral-300 hover:border-neutral-600"
            >
              + Adicionar à mão
            </button>
            <button
              onClick={() => setPainel(painel === "import" ? null : "import")}
              className="rounded-lg border border-neutral-800 bg-neutral-900 px-3.5 py-2 text-sm text-neutral-300 hover:border-neutral-600"
            >
              ⇪ Importar lote
            </button>
            <button
              onClick={baixarBackup}
              className="rounded-lg border border-neutral-800 bg-neutral-900 px-3.5 py-2 text-sm text-neutral-300 hover:border-neutral-600"
            >
              ⇩ Backup
            </button>
          </div>
        </header>

        {painel === "import" && (
          <PainelImport
            secret={secret}
            onPronto={carregar}
            onToast={mostrarToast}
          />
        )}
        {painel === "novo" && (
          <FormNovoProspect
            secret={secret}
            onCriado={(p) => {
              setProspects((atual) => [...atual, p]);
              setSelecionadoId(p.id);
              setPainel(null);
              mostrarToast("Prospect adicionado");
            }}
            onToast={mostrarToast}
          />
        )}

        <section className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Metrica titulo="Na base" valor={String(prospects.length)} />
          <Metrica
            titulo="Abordadas"
            valor={`${abordados}`}
            detalhe={`${contagens.pendente} na fila`}
          />
          <Metrica
            titulo="Taxa de resposta"
            valor={`${taxaResposta}%`}
            detalhe={`${contagens.respondeu + contagens.cliente} de ${abordados}`}
          />
          <Metrica
            titulo="Fechamento"
            valor={`${taxaFechamento}%`}
            detalhe={`${contagens.cliente} cliente(s)`}
          />
        </section>

        <section className="flex overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-900 p-2.5">
          {PROSPECT_STAGES.map((s) => (
            <button
              key={s}
              onClick={() => setFiltro(filtro === s ? "all" : s)}
              className={`min-w-[86px] flex-1 rounded-lg border-r border-neutral-800 px-1 py-1.5 text-center last:border-r-0 ${
                filtro === s ? "bg-neutral-800" : "hover:bg-neutral-800/50"
              }`}
            >
              <p className={`text-lg font-semibold ${CORES_FUNIL[s]}`}>
                {contagens[s]}
              </p>
              <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wide text-neutral-600">
                {STAGE_LABELS[s]}
              </p>
            </button>
          ))}
          <button
            onClick={() => setFiltro(filtro === "followup" ? "all" : "followup")}
            className={`min-w-[86px] flex-1 rounded-lg border-l border-neutral-800 px-1 py-1.5 text-center ${
              filtro === "followup" ? "bg-neutral-800" : "hover:bg-neutral-800/50"
            }`}
          >
            <p
              className={`text-lg font-semibold ${
                totalFollowUp > 0 ? "text-amber-400" : "text-neutral-600"
              }`}
            >
              {totalFollowUp}
            </p>
            <p className="mt-0.5 font-mono text-[10px] uppercase tracking-wide text-neutral-600">
              Follow-up
            </p>
          </button>
        </section>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,400px)_minmax(0,1fr)]">
          <section
            className={`space-y-2.5 ${selecionado ? "hidden lg:block" : ""}`}
          >
            <div className="flex gap-2">
              <input
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                placeholder="Buscar nome, endereço, telefone…"
                className="min-w-0 flex-1 rounded-lg border border-neutral-800 bg-neutral-900 px-3.5 py-2 text-sm outline-none focus:border-orange-500"
              />
              <select
                value={ordenacao}
                onChange={(e) => setOrdenacao(e.target.value as Ordenacao)}
                className="rounded-lg border border-neutral-800 bg-neutral-900 px-2.5 py-2 text-xs text-neutral-300 outline-none focus:border-orange-500"
              >
                {ORDENACOES.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between px-0.5">
              <p className="font-mono text-[11px] text-neutral-600">
                {visiveis.length} de {prospects.length}
              </p>
              {filtro !== "all" && (
                <button
                  onClick={() => setFiltro("all")}
                  className="font-mono text-[11px] text-orange-400 hover:underline"
                >
                  limpar filtro
                </button>
              )}
            </div>

            <ul className="space-y-1.5">
              {visiveis.map((p) => {
                const motivo = motivoFollowUp(p);
                return (
                  <li key={p.id}>
                    <button
                      onClick={() => setSelecionadoId(p.id)}
                      className={`w-full rounded-lg border px-3.5 py-3 text-left transition-colors ${
                        selecionadoId === p.id
                          ? "border-orange-500/50 bg-orange-500/[0.07]"
                          : "border-neutral-800 bg-neutral-900 hover:border-neutral-700"
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <span
                          className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${CORES_PONTO[p.stage]}`}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {p.nome}
                          </p>
                          {p.endereco && (
                            <p className="truncate font-mono text-[11px] text-neutral-600">
                              {p.endereco}
                            </p>
                          )}
                          <p className="mt-1 flex flex-wrap items-center gap-1.5 font-mono text-[10.5px] text-neutral-600">
                            <span>{STAGE_LABELS[p.stage]}</span>
                            {motivo && (
                              <span className="text-amber-400">
                                ⏰{" "}
                                {motivo === "agendado"
                                  ? `retorno ${formatarData(p.follow_up_em)}`
                                  : "parado"}
                              </span>
                            )}
                            {!motivo && p.follow_up_em && (
                              <span className="text-neutral-500">
                                → {formatarData(p.follow_up_em)}
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>

            {!carregando && visiveis.length === 0 && (
              <p className="py-12 text-center text-sm text-neutral-500">
                {prospects.length === 0
                  ? "Nenhuma agência ainda — importe um lote ou adicione à mão."
                  : "Nada encontrado com esse filtro."}
              </p>
            )}
          </section>

          <section className={selecionado ? "" : "hidden lg:block"}>
            {selecionado ? (
              <DetalheProspect
                prospect={selecionado}
                secret={secret}
                onAtualizar={aplicarAtualizacao}
                onExcluir={removerDaLista}
                onFechar={() => setSelecionadoId(null)}
                onToast={mostrarToast}
              />
            ) : (
              <div className="flex h-full min-h-64 items-center justify-center rounded-xl border border-dashed border-neutral-800">
                <p className="px-6 text-center text-sm text-neutral-600">
                  Escolha uma agência na lista para ver o histórico e trabalhar
                  o contato.
                </p>
              </div>
            )}
          </section>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-lg border border-emerald-500/40 bg-neutral-800 px-4 py-2.5 text-sm font-medium text-emerald-400 shadow-lg">
          {toast}
        </div>
      )}
    </main>
  );
}

function Metrica({
  titulo,
  valor,
  detalhe,
}: {
  titulo: string;
  valor: string;
  detalhe?: string;
}) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3">
      <p className="font-mono text-[10px] uppercase tracking-wider text-neutral-600">
        {titulo}
      </p>
      <p className="mt-1 text-xl font-semibold">{valor}</p>
      {detalhe && (
        <p className="mt-0.5 font-mono text-[10.5px] text-neutral-600">
          {detalhe}
        </p>
      )}
    </div>
  );
}

function PainelImport({
  secret,
  onPronto,
  onToast,
}: {
  secret: string;
  onPronto: () => void;
  onToast: (m: string) => void;
}) {
  const [texto, setTexto] = useState("");
  const [msg, setMsg] = useState("");

  async function importar() {
    setMsg("");
    let parsed: unknown;
    try {
      parsed = JSON.parse(texto);
      if (!Array.isArray(parsed)) throw new Error("não é uma lista");
    } catch {
      setMsg("JSON inválido — confira se colou o array completo.");
      return;
    }
    const res = await fetch("/api/admin/prospects", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-secret": secret },
      body: JSON.stringify(parsed),
    });
    const data = await res.json();
    if (!res.ok) return setMsg(data.error || "Falha ao importar.");
    setMsg(
      `${data.adicionados} novo(s) adicionado(s), ${data.jaExistiam} já existia(m).`
    );
    setTexto("");
    onPronto();
    onToast("Lote importado");
  }

  return (
    <div className="space-y-3 rounded-xl border border-neutral-800 bg-neutral-900 p-4">
      <p className="text-xs text-neutral-500">
        Cole o JSON exportado do Hunter (n8n), do jeito que ele sai. Quem já
        está na lista não duplica e mantém status, notas e follow-up.
      </p>
      <textarea
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder='[{"placeId": "...", "nome": "...", "copyB2B": "..."}]'
        className="min-h-32 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 font-mono text-xs outline-none focus:border-orange-500"
      />
      <div className="flex items-center gap-3">
        <button
          onClick={importar}
          className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-neutral-950 hover:opacity-90"
        >
          Adicionar
        </button>
        {msg && <span className="text-xs text-neutral-400">{msg}</span>}
      </div>
    </div>
  );
}

function FormNovoProspect({
  secret,
  onCriado,
  onToast,
}: {
  secret: string;
  onCriado: (p: Prospect) => void;
  onToast: (m: string) => void;
}) {
  const [form, setForm] = useState({
    nome: "",
    endereco: "",
    telefone: "",
    email: "",
    instagram: "",
    link_whatsapp: "",
    copyB2B: "",
  });

  const campos: [keyof typeof form, string][] = [
    ["nome", "Nome da agência *"],
    ["telefone", "Telefone"],
    ["instagram", "Instagram"],
    ["email", "E-mail"],
    ["endereco", "Endereço"],
    ["link_whatsapp", "Link do WhatsApp"],
  ];

  async function criar(e: React.FormEvent) {
    e.preventDefault();
    if (!form.nome.trim()) return;
    const res = await fetch("/api/admin/prospects", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-secret": secret },
      body: JSON.stringify(form),
    });
    if (!res.ok) return onToast("Falha ao adicionar");
    onCriado((await res.json()).prospect);
  }

  return (
    <form
      onSubmit={criar}
      className="space-y-3 rounded-xl border border-neutral-800 bg-neutral-900 p-4"
    >
      <p className="text-xs text-neutral-500">
        Para agências que você achou fora do Hunter — Instagram, indicação,
        evento.
      </p>
      <div className="grid gap-2.5 sm:grid-cols-2">
        {campos.map(([campo, rotulo]) => (
          <label key={campo} className="block">
            <span className="mb-1 block text-[11px] text-neutral-500">
              {rotulo}
            </span>
            <input
              value={form[campo]}
              onChange={(e) => setForm({ ...form, [campo]: e.target.value })}
              className="w-full rounded-lg border border-neutral-800 bg-neutral-950 px-2.5 py-2 text-xs outline-none focus:border-orange-500"
            />
          </label>
        ))}
      </div>
      <label className="block">
        <span className="mb-1 block text-[11px] text-neutral-500">
          Mensagem de abordagem
        </span>
        <textarea
          value={form.copyB2B}
          onChange={(e) => setForm({ ...form, copyB2B: e.target.value })}
          className="min-h-20 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-2.5 py-2 text-xs outline-none focus:border-orange-500"
        />
      </label>
      <button
        type="submit"
        disabled={!form.nome.trim()}
        className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-neutral-950 hover:opacity-90 disabled:opacity-40"
      >
        Adicionar prospect
      </button>
    </form>
  );
}
