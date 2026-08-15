"use client";

import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import { DetalheLead } from "./detalhe-lead";
import type { Lead, LeadStatus } from "@/lib/types";

const COLUNAS: { id: LeadStatus; titulo: string; vazio: string }[] = [
  {
    id: "novo",
    titulo: "Novo",
    vazio: "Seus próximos diagnósticos chegam aqui.",
  },
  {
    id: "contatado",
    titulo: "Contatado",
    vazio: "Mova pra cá quando falar com o negócio.",
  },
  {
    id: "convertido",
    titulo: "Convertido",
    vazio: "Quando fechar o serviço, arraste pra cá.",
  },
];

const CORES: Record<LeadStatus, { ponto: string; texto: string; fundo: string }> = {
  novo: { ponto: "bg-novo", texto: "text-novo", fundo: "bg-novo-fraco" },
  contatado: {
    ponto: "bg-contatado",
    texto: "text-contatado",
    fundo: "bg-contatado-fraco",
  },
  convertido: {
    ponto: "bg-convertido",
    texto: "text-convertido",
    fundo: "bg-convertido-fraco",
  },
};

export function Kanban({ iniciais }: { iniciais: Lead[] }) {
  const [leads, setLeads] = useState(iniciais);
  const [arrastando, setArrastando] = useState<Lead | null>(null);
  const [abertoId, setAbertoId] = useState<string | null>(null);
  const [aba, setAba] = useState<LeadStatus>("novo");
  const [aviso, setAviso] = useState("");

  const sensores = useSensors(
    // Sem esta distância mínima, qualquer toque no card viraria arrasto e o
    // botão de abrir a ficha pararia de funcionar.
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  // Buscado a cada render para a ficha refletir a mudança de coluna na hora.
  const aberto = leads.find((l) => l.id === abertoId) ?? null;

  async function mover(leadId: string, novoStatus: LeadStatus) {
    const alvo = leads.find((l) => l.id === leadId);
    if (!alvo || alvo.status === novoStatus) return;

    const statusAnterior = alvo.status;
    setAviso("");
    setLeads((atual) =>
      atual.map((l) => (l.id === leadId ? { ...l, status: novoStatus } : l))
    );

    try {
      const supabase = getSupabaseBrowser();
      const { data, error } = await supabase
        .from("leads")
        .update({ status: novoStatus })
        .eq("id", leadId)
        .select();

      // Sem erro e sem linha alterada significa que o RLS barrou: tratar como
      // falha, senão a tela mostraria uma mudança que não existe no banco.
      if (error || !data || data.length === 0) throw new Error();
    } catch {
      setLeads((atual) =>
        atual.map((l) => (l.id === leadId ? { ...l, status: statusAnterior } : l))
      );
      setAviso(
        "Não consegui salvar essa mudança. O card voltou para onde estava — verifique sua conexão e tente de novo."
      );
    }
  }

  function aoSoltar(evento: DragEndEvent) {
    setArrastando(null);
    const { active, over } = evento;
    if (!over) return;
    mover(String(active.id), over.id as LeadStatus);
  }

  function aoPegar(evento: DragStartEvent) {
    setArrastando(leads.find((l) => l.id === String(evento.active.id)) ?? null);
  }

  const porStatus = (s: LeadStatus) => leads.filter((l) => l.status === s);

  return (
    <div className="space-y-3">
      {aviso && (
        <p
          role="alert"
          className="rounded-lg border border-erro/40 bg-erro-fraco px-3.5 py-2.5 text-[13px] text-erro"
        >
          {aviso}
        </p>
      )}

      {/* Computador: três colunas, arrastando entre elas. */}
      <DndContext sensors={sensores} onDragStart={aoPegar} onDragEnd={aoSoltar}>
        <div className="hidden gap-4 lg:grid lg:grid-cols-3">
          {COLUNAS.map((coluna) => (
            <Coluna
              key={coluna.id}
              id={coluna.id}
              titulo={coluna.titulo}
              quantidade={porStatus(coluna.id).length}
              vazio={coluna.vazio}
            >
              {porStatus(coluna.id).map((lead) => (
                <CardArrastavel
                  key={lead.id}
                  lead={lead}
                  onMover={mover}
                  onAbrir={() => setAbertoId(lead.id)}
                />
              ))}
            </Coluna>
          ))}
        </div>

        <DragOverlay>
          {arrastando && (
            <div className="rotate-2 opacity-95">
              <CorpoDoCard lead={arrastando} />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* Celular: uma coluna por vez. Arrastar entre colunas que não estão na
          tela não existe, então aqui o caminho é o botão "mover". */}
      <div className="lg:hidden">
        <div
          role="tablist"
          aria-label="Etapas"
          className="mb-3 grid grid-cols-3 gap-1.5"
        >
          {COLUNAS.map((coluna) => {
            const ativa = aba === coluna.id;
            const total = porStatus(coluna.id).length;
            return (
              <button
                key={coluna.id}
                role="tab"
                aria-selected={ativa}
                onClick={() => setAba(coluna.id)}
                className={`rounded-lg border px-2 py-2 text-center transition-colors ${
                  ativa
                    ? "border-marca-borda bg-marca-fraca"
                    : "border-borda bg-superficie"
                }`}
              >
                <span
                  className={`block text-lg font-semibold ${CORES[coluna.id].texto}`}
                >
                  {total}
                </span>
                <span className="block text-[11px] text-texto-suave">
                  {coluna.titulo}
                </span>
              </button>
            );
          })}
        </div>

        <div className="space-y-2">
          {porStatus(aba).map((lead) => (
            <CorpoDoCard
              key={lead.id}
              lead={lead}
              onMover={mover}
              onAbrir={() => setAbertoId(lead.id)}
            />
          ))}
          {porStatus(aba).length === 0 && (
            <p className="px-4 py-10 text-center text-[13px] leading-relaxed text-texto-fraco">
              {COLUNAS.find((c) => c.id === aba)?.vazio}
            </p>
          )}
        </div>
      </div>

      <DetalheLead
        lead={aberto}
        onFechar={() => setAbertoId(null)}
        onMover={mover}
      />
    </div>
  );
}

function Coluna({
  id,
  titulo,
  quantidade,
  vazio,
  children,
}: {
  id: LeadStatus;
  titulo: string;
  quantidade: number;
  vazio: string;
  children: React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <section
      ref={setNodeRef}
      className={`rounded-xl border p-3 transition-colors ${
        isOver ? "border-marca-borda bg-marca-fraca" : "border-borda bg-superficie-2"
      }`}
    >
      <h2 className="mb-3 flex items-center gap-2 px-1 text-[13px] font-semibold">
        <span className={`h-2 w-2 rounded-full ${CORES[id].ponto}`} />
        {titulo}
        <span className="ml-auto font-mono text-[11px] text-texto-fraco">
          {quantidade}
        </span>
      </h2>
      <div className="min-h-24 space-y-2">
        {children}
        {/* Todo cliente novo começa com tudo em Novo, então estas duas nascem
            vazias justamente na primeira impressão. */}
        {quantidade === 0 && (
          <p className="px-1 py-6 text-center text-[12.5px] leading-relaxed text-texto-fraco">
            {vazio}
          </p>
        )}
      </div>
    </section>
  );
}

function CardArrastavel({
  lead,
  onMover,
  onAbrir,
}: {
  lead: Lead;
  onMover: (id: string, s: LeadStatus) => void;
  onAbrir: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: lead.id });

  return (
    <div
      ref={setNodeRef}
      data-arrastavel
      style={transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined}
      className={isDragging ? "opacity-40" : ""}
      {...listeners}
      {...attributes}
    >
      <CorpoDoCard lead={lead} onMover={onMover} onAbrir={onAbrir} arrastavel />
    </div>
  );
}

function CorpoDoCard({
  lead,
  onMover,
  onAbrir,
  arrastavel,
}: {
  lead: Lead;
  onMover?: (id: string, s: LeadStatus) => void;
  onAbrir?: () => void;
  arrastavel?: boolean;
}) {
  const [menu, setMenu] = useState(false);
  const destinos = COLUNAS.filter((c) => c.id !== lead.status);

  return (
    <article
      className={`rounded-lg border border-borda bg-superficie p-3 ${
        arrastavel ? "cursor-grab active:cursor-grabbing" : ""
      }`}
    >
      <h3 className="text-[13.5px] font-semibold leading-snug">
        {lead.nome_negocio}
      </h3>

      {lead.endereco && (
        <p className="mt-1 font-mono text-[11px] leading-relaxed text-texto-fraco">
          {lead.endereco}
        </p>
      )}

      {/* Só uma prévia: o texto completo, a mensagem e os argumentos vivem na
          ficha, senão o card cresce e o kanban perde a visão de conjunto. */}
      {lead.diagnostico && (
        <p className="mt-2 line-clamp-2 text-[12.5px] leading-relaxed text-texto-suave">
          {lead.diagnostico}
        </p>
      )}

      {onAbrir && (
        <button
          type="button"
          onPointerDown={(e) => e.stopPropagation()}
          onClick={onAbrir}
          className="mt-2.5 inline-flex min-h-11 w-full items-center justify-center rounded-md bg-marca px-2.5 text-[12.5px] font-semibold text-marca-contraste hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca lg:min-h-9"
        >
          {lead.mensagem ? "Ver mensagem" : "Ver detalhes"}
        </button>
      )}

      {onMover && (
        <div className="relative mt-1.5">
          <button
            type="button"
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => setMenu((v) => !v)}
            aria-expanded={menu}
            /* min-h-11 = 44px: alvo de toque confortável no celular, que é
               onde o cliente mais usa. No computador pode ser mais compacto. */
            className="min-h-11 w-full rounded-md border border-borda bg-superficie-2 px-2.5 text-[12px] font-medium text-texto-suave hover:border-borda-forte hover:text-texto focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca lg:min-h-9"
          >
            Mover para…
          </button>

          {menu && (
            <div className="mt-1.5 flex flex-col gap-1">
              {destinos.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={() => {
                    setMenu(false);
                    onMover(lead.id, d.id);
                  }}
                  className={`flex min-h-11 items-center rounded-md px-2.5 text-left text-[12px] font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca lg:min-h-9 ${CORES[d.id].fundo} ${CORES[d.id].texto}`}
                >
                  {d.titulo}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </article>
  );
}
