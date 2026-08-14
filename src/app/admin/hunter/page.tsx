"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { AdminGate, AdminNav, sairDoAdmin } from "@/components/admin-gate";
import {
  FOLLOWUP_DIAS,
  PROSPECT_STAGES,
  STAGE_LABELS,
  precisaFollowUp,
  type Prospect,
  type ProspectStage,
} from "@/lib/types";

export default function HunterPage() {
  return <AdminGate>{(secret) => <HunterCRM secret={secret} />}</AdminGate>;
}

type Filtro = "all" | "pendente" | "followup" | "respondeu" | "cliente";

const FILTROS: { id: Filtro; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "pendente", label: "Pendentes" },
  { id: "followup", label: "Follow-up" },
  { id: "respondeu", label: "Responderam" },
  { id: "cliente", label: "Fecharam" },
];

const CORES_FUNIL: Record<ProspectStage, string> = {
  pendente: "text-neutral-300",
  contatado: "text-neutral-400",
  sem_resposta: "text-amber-400",
  respondeu: "text-blue-400",
  cliente: "text-emerald-400",
  descartado: "text-neutral-600",
};

const CORES_BOTAO_ATIVO: Record<ProspectStage, string> = {
  pendente: "bg-neutral-700 text-white",
  contatado: "bg-neutral-600 text-white",
  sem_resposta: "bg-amber-600 text-neutral-950",
  respondeu: "bg-blue-500 text-neutral-950",
  cliente: "bg-emerald-500 text-neutral-950",
  descartado: "bg-neutral-700 text-neutral-300",
};

function HunterCRM({ secret }: { secret: string }) {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [filtro, setFiltro] = useState<Filtro>("all");
  const [busca, setBusca] = useState("");
  const [abertoId, setAbertoId] = useState<string | null>(null);
  const [painelImport, setPainelImport] = useState(false);
  const [textoImport, setTextoImport] = useState("");
  const [msgImport, setMsgImport] = useState("");
  const [toast, setToast] = useState("");

  const mostrarToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2200);
  }, []);

  const carregar = useCallback(async () => {
    const res = await fetch("/api/admin/prospects", {
      headers: { "x-admin-secret": secret },
    });
    const data = await res.json();
    if (res.ok) setProspects(data.prospects);
    setCarregando(false);
  }, [secret]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function importar() {
    setMsgImport("");
    let parsed: unknown;
    try {
      parsed = JSON.parse(textoImport);
      if (!Array.isArray(parsed)) throw new Error("não é uma lista");
    } catch {
      setMsgImport("JSON inválido — confira se colou o array completo.");
      return;
    }
    const res = await fetch("/api/admin/prospects", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-secret": secret },
      body: JSON.stringify(parsed),
    });
    const data = await res.json();
    if (!res.ok) {
      setMsgImport(data.error || "Falha ao importar.");
      return;
    }
    setMsgImport(
      `${data.adicionados} novo(s) adicionado(s), ${data.jaExistiam} já existia(m).`
    );
    setTextoImport("");
    carregar();
  }

  async function mudarStage(p: Prospect, stage: ProspectStage) {
    // Clicar de novo no estágio atual devolve o prospect para pendente.
    const novo = p.stage === stage ? "pendente" : stage;
    const res = await fetch(`/api/admin/prospects/${p.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-admin-secret": secret },
      body: JSON.stringify({ stage: novo }),
    });
    if (res.ok) {
      const { prospect } = await res.json();
      setProspects((atual) =>
        atual.map((x) => (x.id === prospect.id ? prospect : x))
      );
      mostrarToast(`${STAGE_LABELS[novo as ProspectStage]} marcado`);
    }
  }

  const contagens = useMemo(() => {
    const c = Object.fromEntries(
      PROSPECT_STAGES.map((s) => [s, 0])
    ) as Record<ProspectStage, number>;
    for (const p of prospects) c[p.stage]++;
    return c;
  }, [prospects]);

  const totalFollowUp = useMemo(
    () => prospects.filter(precisaFollowUp).length,
    [prospects]
  );

  const abordados = prospects.length - contagens.pendente;

  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return prospects.filter((p) => {
      if (filtro === "pendente" && p.stage !== "pendente") return false;
      if (filtro === "followup" && !precisaFollowUp(p)) return false;
      if (filtro === "respondeu" && p.stage !== "respondeu") return false;
      if (filtro === "cliente" && p.stage !== "cliente") return false;
      if (q) {
        const alvo = `${p.nome} ${p.endereco ?? ""}`.toLowerCase();
        if (!alvo.includes(q)) return false;
      }
      return true;
    });
  }, [prospects, filtro, busca]);

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between gap-3">
          <AdminNav atual="hunter" />
          <button
            onClick={sairDoAdmin}
            className="text-sm text-neutral-500 hover:text-neutral-300"
          >
            sair
          </button>
        </div>

        <header>
          <p className="text-xs font-mono uppercase tracking-wider text-orange-500 mb-2">
            ProspecIA Hunter
          </p>
          <h1 className="text-2xl font-semibold mb-1">Painel de abordagem</h1>
          <p className="text-sm text-neutral-400 mb-5">
            Agências e web designers para você abordar — uso interno, nenhum
            cliente vê isso.
          </p>

          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
            <div className="flex justify-between items-baseline mb-2.5">
              <p className="text-xl font-semibold">
                {abordados}{" "}
                <span className="text-base font-medium text-neutral-600">
                  / {prospects.length} abordadas
                </span>
              </p>
              <p className="text-xs font-mono text-neutral-500">
                {carregando
                  ? "carregando…"
                  : contagens.pendente === 0 && prospects.length > 0
                    ? "lote finalizado"
                    : `${contagens.pendente} restantes`}
              </p>
            </div>
            <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{
                  width: prospects.length
                    ? `${(abordados / prospects.length) * 100}%`
                    : "0%",
                }}
              />
            </div>
          </div>

          <div className="mt-3 bg-neutral-900 border border-neutral-800 rounded-xl p-3 flex overflow-x-auto">
            {PROSPECT_STAGES.map((s) => (
              <button
                key={s}
                onClick={() =>
                  setFiltro(
                    s === "pendente" || s === "respondeu" || s === "cliente"
                      ? (s as Filtro)
                      : "all"
                  )
                }
                className="flex-1 min-w-[80px] text-center px-1 py-1.5 rounded-lg hover:bg-neutral-800 border-r border-neutral-800 last:border-r-0"
              >
                <p className={`text-lg font-semibold ${CORES_FUNIL[s]}`}>
                  {contagens[s]}
                </p>
                <p className="text-[10px] font-mono uppercase tracking-wide text-neutral-600 mt-0.5">
                  {STAGE_LABELS[s]}
                </p>
              </button>
            ))}
            {totalFollowUp > 0 && (
              <button
                onClick={() => setFiltro("followup")}
                className="flex-1 min-w-[80px] text-center px-1 py-1.5 rounded-lg hover:bg-neutral-800 border-l border-neutral-800"
              >
                <p className="text-lg font-semibold text-amber-400">
                  {totalFollowUp}
                </p>
                <p className="text-[10px] font-mono uppercase tracking-wide text-neutral-600 mt-0.5">
                  Follow-up
                </p>
              </button>
            )}
          </div>
        </header>

        <div>
          <button
            onClick={() => setPainelImport((v) => !v)}
            className="rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 px-3.5 py-2 text-sm hover:border-neutral-600"
          >
            + Importar novo lote
          </button>

          {painelImport && (
            <div className="mt-3 bg-neutral-900 border border-neutral-800 rounded-xl p-4 space-y-3">
              <p className="text-xs text-neutral-500">
                Cole o JSON exportado do Hunter (n8n), do jeito que ele sai.
                Quem já está na lista não duplica e mantém o status.
              </p>
              <textarea
                value={textoImport}
                onChange={(e) => setTextoImport(e.target.value)}
                placeholder='[{"placeId": "...", "nome": "...", "copyB2B": "..."}]'
                className="w-full min-h-32 rounded-lg bg-neutral-950 border border-neutral-800 px-3 py-2 text-xs font-mono outline-none focus:border-orange-500"
              />
              <div className="flex items-center gap-3">
                <button
                  onClick={importar}
                  className="rounded-lg bg-orange-500 text-neutral-950 font-medium px-4 py-2 text-sm hover:opacity-90"
                >
                  Adicionar
                </button>
                {msgImport && (
                  <span className="text-xs text-neutral-400">{msgImport}</span>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-2 flex-wrap">
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome ou endereço…"
            className="flex-1 min-w-44 rounded-lg bg-neutral-900 border border-neutral-800 px-3.5 py-2 text-sm outline-none focus:border-orange-500"
          />
          <div className="flex gap-1.5 flex-wrap">
            {FILTROS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFiltro(f.id)}
                className={`rounded-lg border px-3 py-2 text-[13px] font-medium ${
                  filtro === f.id
                    ? "bg-orange-500/10 border-orange-500/40 text-orange-400"
                    : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-600"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2.5">
          {filtrados.map((p, i) => (
            <CardProspect
              key={p.id}
              prospect={p}
              indice={i + 1}
              aberto={abertoId === p.id}
              onToggle={() => setAbertoId(abertoId === p.id ? null : p.id)}
              onStage={(s) => mudarStage(p, s)}
              onCopiar={() => mostrarToast("Mensagem copiada")}
            />
          ))}

          {!carregando && filtrados.length === 0 && (
            <p className="text-sm text-neutral-500 text-center py-14">
              {prospects.length === 0
                ? 'Nenhuma agência ainda — clique em "Importar novo lote" para começar.'
                : "Nenhum resultado com esse filtro."}
            </p>
          )}
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-neutral-800 border border-emerald-500/40 text-emerald-400 px-4 py-2.5 rounded-lg text-sm font-medium shadow-lg">
          {toast}
        </div>
      )}
    </main>
  );
}

function CardProspect({
  prospect: p,
  indice,
  aberto,
  onToggle,
  onStage,
  onCopiar,
}: {
  prospect: Prospect;
  indice: number;
  aberto: boolean;
  onToggle: () => void;
  onStage: (s: ProspectStage) => void;
  onCopiar: () => void;
}) {
  const followUp = precisaFollowUp(p);
  const temWhats = p.link_whatsapp?.startsWith("http");
  const hrefWhats = temWhats
    ? `${p.link_whatsapp}?text=${encodeURIComponent(p.copy_b2b ?? "")}`
    : undefined;

  return (
    <div
      className={`bg-neutral-900 border rounded-xl overflow-hidden ${
        p.stage !== "pendente" ? "border-emerald-500/30" : "border-neutral-800"
      }`}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-start gap-3.5 p-4 text-left hover:bg-neutral-800/40"
      >
        <span
          className={`font-mono text-xs pt-1 min-w-6 ${
            p.stage !== "pendente" ? "text-emerald-500" : "text-neutral-600"
          }`}
        >
          {String(indice).padStart(2, "0")}
        </span>
        <span className="flex-1 min-w-0">
          <span className="flex items-center gap-2 flex-wrap font-medium text-[15px] mb-1">
            <span
              className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                p.stage !== "pendente" ? "bg-emerald-500" : "bg-neutral-600"
              }`}
            />
            {p.nome}
            {p.aberto_agora === true && (
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded border border-emerald-500/40 bg-emerald-500/10 text-emerald-400">
                ● aberto agora
              </span>
            )}
            {followUp && (
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded border border-amber-500/40 bg-amber-500/10 text-amber-400">
                ⏰ follow-up
              </span>
            )}
          </span>
          {p.endereco && (
            <span className="block font-mono text-[11.5px] text-neutral-500 leading-relaxed">
              {p.endereco}
            </span>
          )}
          {p.melhor_horario_contato && (
            <span className="block font-mono text-[11.5px] text-orange-500/80 mt-0.5">
              ⏰ Melhor horário: {p.melhor_horario_contato}
            </span>
          )}
        </span>
        <span
          className={`text-neutral-600 text-xs pt-1 transition-transform ${
            aberto ? "rotate-90" : ""
          }`}
        >
          ▶
        </span>
      </button>

      {aberto && (
        <div className="px-4 pb-4 pl-[54px] space-y-3">
          {p.copy_b2b && (
            <p className="text-[13.5px] leading-relaxed bg-neutral-950 border border-neutral-800 rounded-lg p-3 whitespace-pre-wrap">
              {p.copy_b2b}
            </p>
          )}

          {followUp && (
            <p className="text-[11.5px] text-amber-400 bg-amber-500/[0.08] border border-amber-500/25 rounded-lg px-2.5 py-2">
              ⏰ Já se passaram {FOLLOWUP_DIAS}+ dias sem retorno — bom momento
              pra reforçar o contato.
            </p>
          )}

          <div className="flex gap-2 flex-wrap items-center">
            <button
              onClick={() => {
                navigator.clipboard.writeText(p.copy_b2b ?? "");
                onCopiar();
              }}
              className="rounded-lg bg-neutral-800 border border-neutral-700 px-3.5 py-2 text-[13px] font-semibold hover:opacity-85"
            >
              📋 Copiar mensagem
            </button>
            {hrefWhats ? (
              <a
                href={hrefWhats}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 px-3.5 py-2 text-[13px] font-semibold hover:opacity-85"
              >
                💬 Abrir no WhatsApp
              </a>
            ) : (
              <span className="text-xs text-neutral-600 italic">
                Sem WhatsApp — abordar por Instagram DM
              </span>
            )}
          </div>

          <div className="flex gap-1.5 flex-wrap">
            {PROSPECT_STAGES.filter((s) => s !== "pendente").map((s) => (
              <button
                key={s}
                onClick={() => onStage(s)}
                className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold border transition-colors ${
                  p.stage === s
                    ? `border-transparent ${CORES_BOTAO_ATIVO[s]}`
                    : "bg-neutral-800 border-neutral-700 text-neutral-400 hover:border-neutral-500"
                }`}
              >
                {STAGE_LABELS[s]}
              </button>
            ))}
          </div>

          <p className="font-mono text-[11px] text-neutral-600">
            último status em{" "}
            {new Date(p.atualizado_em).toLocaleString("pt-BR", {
              day: "2-digit",
              month: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      )}
    </div>
  );
}
