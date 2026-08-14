"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CAMPOS_EDITAVEIS,
  FOLLOWUP_DIAS,
  PROSPECT_STAGES,
  STAGE_LABELS,
  formatarData,
  formatarDataHora,
  motivoFollowUp,
  type CampoEditavel,
  type Prospect,
  type ProspectNota,
  type ProspectStage,
} from "@/lib/types";

const CORES_BOTAO_ATIVO: Record<ProspectStage, string> = {
  pendente: "bg-neutral-600 text-white",
  contatado: "bg-slate-500 text-neutral-950",
  sem_resposta: "bg-amber-500 text-neutral-950",
  respondeu: "bg-blue-500 text-neutral-950",
  cliente: "bg-emerald-500 text-neutral-950",
  descartado: "bg-neutral-700 text-neutral-300",
};

const ROTULOS_CAMPO: Record<CampoEditavel, string> = {
  nome: "Nome",
  endereco: "Endereço",
  telefone: "Telefone",
  email: "E-mail",
  instagram: "Instagram",
  site: "Site",
  link_whatsapp: "Link do WhatsApp",
  melhor_horario_contato: "Melhor horário",
  copy_b2b: "Mensagem de abordagem",
  follow_up_em: "Retornar em",
};

function diasAPartirDeHoje(dias: number): string {
  const d = new Date();
  d.setDate(d.getDate() + dias);
  return d.toISOString().slice(0, 10);
}

export function DetalheProspect({
  prospect: p,
  secret,
  onAtualizar,
  onExcluir,
  onFechar,
  onToast,
}: {
  prospect: Prospect;
  secret: string;
  onAtualizar: (p: Prospect) => void;
  onExcluir: (id: string) => void;
  onFechar: () => void;
  onToast: (msg: string) => void;
}) {
  const [notas, setNotas] = useState<ProspectNota[]>([]);
  const [novaNota, setNovaNota] = useState("");
  const [editando, setEditando] = useState(false);
  const [rascunho, setRascunho] = useState<Record<string, string>>({});
  const [confirmandoExclusao, setConfirmandoExclusao] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const carregarNotas = useCallback(async () => {
    const res = await fetch(`/api/admin/prospects/${p.id}/notas`, {
      headers: { "x-admin-secret": secret },
    });
    if (res.ok) setNotas((await res.json()).notas);
  }, [p.id, secret]);

  useEffect(() => {
    setEditando(false);
    setConfirmandoExclusao(false);
    setNovaNota("");
    carregarNotas();
  }, [p.id, carregarNotas]);

  const patch = useCallback(
    async (mudancas: Record<string, unknown>) => {
      const res = await fetch(`/api/admin/prospects/${p.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-admin-secret": secret,
        },
        body: JSON.stringify(mudancas),
      });
      if (!res.ok) {
        onToast("Falha ao salvar");
        return null;
      }
      const { prospect } = await res.json();
      onAtualizar(prospect);
      return prospect as Prospect;
    },
    [p.id, secret, onAtualizar, onToast]
  );

  async function mudarStage(stage: ProspectStage) {
    const novo = p.stage === stage ? "pendente" : stage;
    const r = await patch({ stage: novo });
    if (r) {
      onToast(`${STAGE_LABELS[novo]} marcado`);
      carregarNotas();
    }
  }

  async function agendarRetorno(data: string | null) {
    const r = await patch({ follow_up_em: data });
    if (r) onToast(data ? `Retorno em ${formatarData(data)}` : "Retorno removido");
  }

  function abrirEdicao() {
    const inicial: Record<string, string> = {};
    for (const campo of CAMPOS_EDITAVEIS) inicial[campo] = p[campo] ?? "";
    setRascunho(inicial);
    setEditando(true);
  }

  async function salvarEdicao() {
    setSalvando(true);
    const r = await patch(rascunho);
    setSalvando(false);
    if (r) {
      setEditando(false);
      onToast("Dados atualizados");
    }
  }

  async function adicionarNota(e: React.FormEvent) {
    e.preventDefault();
    if (!novaNota.trim()) return;
    const res = await fetch(`/api/admin/prospects/${p.id}/notas`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-secret": secret },
      body: JSON.stringify({ texto: novaNota }),
    });
    if (res.ok) {
      setNovaNota("");
      carregarNotas();
      onToast("Anotação salva");
    }
  }

  async function excluirNota(id: string) {
    const res = await fetch(`/api/admin/notas/${id}`, {
      method: "DELETE",
      headers: { "x-admin-secret": secret },
    });
    if (res.ok) carregarNotas();
  }

  async function excluirProspect() {
    const res = await fetch(`/api/admin/prospects/${p.id}`, {
      method: "DELETE",
      headers: { "x-admin-secret": secret },
    });
    if (res.ok) {
      onExcluir(p.id);
      onToast("Prospect excluído");
    }
  }

  const motivo = motivoFollowUp(p);
  const temWhats = p.link_whatsapp?.startsWith("http");

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl">
      <div className="p-5 border-b border-neutral-800">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0">
            <button
              onClick={onFechar}
              className="lg:hidden text-xs text-neutral-500 hover:text-neutral-300 mb-2"
            >
              ← voltar para a lista
            </button>
            <h2 className="text-lg font-semibold leading-snug">{p.nome}</h2>
            <p className="font-mono text-[11px] text-neutral-600 mt-1">
              entrou em {formatarData(p.criado_em)}
              {p.contatado_em &&
                ` · 1º contato em ${formatarData(p.contatado_em)}`}
            </p>
          </div>
          <div className="flex gap-1.5 shrink-0">
            <button
              onClick={editando ? () => setEditando(false) : abrirEdicao}
              className="rounded-lg border border-neutral-700 bg-neutral-800 px-2.5 py-1.5 text-xs font-medium text-neutral-300 hover:border-neutral-500"
            >
              {editando ? "Cancelar" : "✏️ Editar"}
            </button>
            <button
              onClick={() => setConfirmandoExclusao(true)}
              className="rounded-lg border border-neutral-700 bg-neutral-800 px-2.5 py-1.5 text-xs font-medium text-neutral-400 hover:border-red-500/50 hover:text-red-400"
            >
              🗑
            </button>
          </div>
        </div>

        {confirmandoExclusao && (
          <div className="mb-3 rounded-lg border border-red-500/30 bg-red-500/[0.07] p-3">
            <p className="text-xs text-red-300 mb-2.5">
              Excluir <strong>{p.nome}</strong> e todo o histórico dele? Não tem
              como desfazer.
            </p>
            <div className="flex gap-2">
              <button
                onClick={excluirProspect}
                className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-semibold text-neutral-950 hover:opacity-90"
              >
                Sim, excluir
              </button>
              <button
                onClick={() => setConfirmandoExclusao(false)}
                className="rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-xs font-medium text-neutral-300"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-1.5">
          {PROSPECT_STAGES.filter((s) => s !== "pendente").map((s) => (
            <button
              key={s}
              onClick={() => mudarStage(s)}
              className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                p.stage === s
                  ? `border-transparent ${CORES_BOTAO_ATIVO[s]}`
                  : "border-neutral-700 bg-neutral-800 text-neutral-400 hover:border-neutral-500"
              }`}
            >
              {STAGE_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      <div className="p-5 space-y-5">
        <section>
          <h3 className="mb-2.5 font-mono text-[10px] uppercase tracking-wider text-neutral-500">
            Retorno agendado
          </h3>
          {motivo && (
            <p className="mb-2.5 rounded-lg border border-amber-500/25 bg-amber-500/[0.08] px-2.5 py-2 text-[11.5px] text-amber-400">
              {motivo === "agendado"
                ? `⏰ Você marcou retorno para ${formatarData(p.follow_up_em)} — chegou a hora.`
                : `⏰ ${FOLLOWUP_DIAS}+ dias sem retorno. Bom momento pra reforçar.`}
            </p>
          )}
          <div className="flex flex-wrap items-center gap-1.5">
            <input
              type="date"
              value={p.follow_up_em ?? ""}
              onChange={(e) => agendarRetorno(e.target.value || null)}
              className="rounded-lg border border-neutral-700 bg-neutral-800 px-2.5 py-1.5 text-xs text-neutral-200 outline-none focus:border-orange-500 [color-scheme:dark]"
            />
            {[
              { label: "amanhã", dias: 1 },
              { label: "+3 dias", dias: 3 },
              { label: "+1 semana", dias: 7 },
            ].map((atalho) => (
              <button
                key={atalho.dias}
                onClick={() => agendarRetorno(diasAPartirDeHoje(atalho.dias))}
                className="rounded-lg border border-neutral-700 bg-neutral-800 px-2.5 py-1.5 text-xs text-neutral-400 hover:border-neutral-500 hover:text-neutral-200"
              >
                {atalho.label}
              </button>
            ))}
            {p.follow_up_em && (
              <button
                onClick={() => agendarRetorno(null)}
                className="px-1.5 py-1.5 text-xs text-neutral-500 hover:text-neutral-300"
              >
                limpar
              </button>
            )}
          </div>
        </section>

        <section>
          <h3 className="mb-2.5 font-mono text-[10px] uppercase tracking-wider text-neutral-500">
            Dados de contato
          </h3>

          {editando ? (
            <div className="space-y-2.5">
              {CAMPOS_EDITAVEIS.filter((c) => c !== "follow_up_em").map(
                (campo) => (
                  <label key={campo} className="block">
                    <span className="mb-1 block text-[11px] text-neutral-500">
                      {ROTULOS_CAMPO[campo]}
                    </span>
                    {campo === "copy_b2b" ? (
                      <textarea
                        value={rascunho[campo] ?? ""}
                        onChange={(e) =>
                          setRascunho({ ...rascunho, [campo]: e.target.value })
                        }
                        className="min-h-24 w-full rounded-lg border border-neutral-700 bg-neutral-950 px-2.5 py-2 text-xs outline-none focus:border-orange-500"
                      />
                    ) : (
                      <input
                        value={rascunho[campo] ?? ""}
                        onChange={(e) =>
                          setRascunho({ ...rascunho, [campo]: e.target.value })
                        }
                        className="w-full rounded-lg border border-neutral-700 bg-neutral-950 px-2.5 py-2 text-xs outline-none focus:border-orange-500"
                      />
                    )}
                  </label>
                )
              )}
              <button
                onClick={salvarEdicao}
                disabled={salvando}
                className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-neutral-950 hover:opacity-90 disabled:opacity-50"
              >
                {salvando ? "Salvando…" : "Salvar alterações"}
              </button>
            </div>
          ) : (
            <dl className="space-y-1.5 text-[12.5px]">
              {(
                [
                  ["endereco", p.endereco],
                  ["telefone", p.telefone],
                  ["email", p.email],
                  ["instagram", p.instagram],
                  ["site", p.site],
                  ["melhor_horario_contato", p.melhor_horario_contato],
                ] as [CampoEditavel, string | null][]
              )
                .filter(([, valor]) => valor)
                .map(([campo, valor]) => (
                  <div key={campo} className="flex gap-2">
                    <dt className="w-24 shrink-0 text-neutral-600">
                      {ROTULOS_CAMPO[campo]}
                    </dt>
                    <dd className="min-w-0 flex-1 break-words text-neutral-300">
                      {valor}
                    </dd>
                  </div>
                ))}
              {!p.endereco && !p.telefone && !p.email && !p.instagram && (
                <p className="text-xs text-neutral-600">
                  Nenhum dado de contato ainda — use &quot;Editar&quot; para
                  preencher.
                </p>
              )}
            </dl>
          )}
        </section>

        {p.copy_b2b && !editando && (
          <section>
            <h3 className="mb-2.5 font-mono text-[10px] uppercase tracking-wider text-neutral-500">
              Mensagem de abordagem
            </h3>
            <p className="whitespace-pre-wrap rounded-lg border border-neutral-800 bg-neutral-950 p-3 text-[13px] leading-relaxed">
              {p.copy_b2b}
            </p>
            <div className="mt-2.5 flex flex-wrap gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(p.copy_b2b ?? "");
                  onToast("Mensagem copiada");
                }}
                className="rounded-lg border border-neutral-700 bg-neutral-800 px-3.5 py-2 text-[13px] font-semibold hover:opacity-85"
              >
                📋 Copiar
              </button>
              {temWhats && (
                <a
                  href={`${p.link_whatsapp}?text=${encodeURIComponent(p.copy_b2b ?? "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 px-3.5 py-2 text-[13px] font-semibold text-emerald-400 hover:opacity-85"
                >
                  💬 WhatsApp
                </a>
              )}
            </div>
          </section>
        )}

        <section>
          <h3 className="mb-2.5 font-mono text-[10px] uppercase tracking-wider text-neutral-500">
            Histórico
          </h3>
          <form onSubmit={adicionarNota} className="mb-3">
            <textarea
              value={novaNota}
              onChange={(e) => setNovaNota(e.target.value)}
              placeholder="O que aconteceu? Ex: falei com o Pedro, pediu proposta por e-mail."
              className="min-h-16 w-full rounded-lg border border-neutral-800 bg-neutral-950 px-3 py-2 text-[13px] outline-none focus:border-orange-500"
            />
            <button
              type="submit"
              disabled={!novaNota.trim()}
              className="mt-2 rounded-lg bg-orange-500 px-3.5 py-1.5 text-[13px] font-medium text-neutral-950 hover:opacity-90 disabled:opacity-40"
            >
              Anotar
            </button>
          </form>

          <ol className="space-y-2.5">
            {notas.map((nota) => (
              <li key={nota.id} className="group flex gap-2.5">
                <span
                  className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                    nota.tipo === "sistema" ? "bg-neutral-700" : "bg-orange-500"
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-[13px] leading-relaxed ${
                      nota.tipo === "sistema"
                        ? "font-mono text-[11.5px] text-neutral-500"
                        : "whitespace-pre-wrap text-neutral-200"
                    }`}
                  >
                    {nota.texto}
                  </p>
                  <p className="mt-0.5 font-mono text-[10.5px] text-neutral-600">
                    {formatarDataHora(nota.criado_em)}
                  </p>
                </div>
                {nota.tipo === "manual" && (
                  <button
                    onClick={() => excluirNota(nota.id)}
                    className="shrink-0 text-xs text-neutral-700 opacity-0 transition-opacity hover:text-red-400 group-hover:opacity-100"
                    title="excluir anotação"
                  >
                    ✕
                  </button>
                )}
              </li>
            ))}
            {notas.length === 0 && (
              <p className="text-xs text-neutral-600">
                Nada registrado ainda.
              </p>
            )}
          </ol>
        </section>
      </div>
    </div>
  );
}
