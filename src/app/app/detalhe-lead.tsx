"use client";

import { useEffect, useRef, useState } from "react";
import type { Lead, LeadStatus } from "@/lib/types";

const COLUNAS: { id: LeadStatus; titulo: string }[] = [
  { id: "novo", titulo: "Novo" },
  { id: "contatado", titulo: "Contatado" },
  { id: "convertido", titulo: "Convertido" },
];

const CORES_ATIVO: Record<LeadStatus, string> = {
  novo: "bg-novo text-superficie",
  contatado: "bg-contatado text-superficie",
  convertido: "bg-convertido text-superficie",
};

/**
 * Ficha completa do lead, em <dialog> nativo.
 *
 * O elemento nativo já prende o foco, fecha no ESC e torna o resto da página
 * inerte, o que seria bastante código para reproduzir à mão. Vive fora do card
 * porque a mensagem de abordagem tem centenas de caracteres: dentro de uma
 * coluna do kanban ela quebraria o alinhamento das três colunas.
 */
export function DetalheLead({
  lead,
  onFechar,
  onMover,
}: {
  lead: Lead | null;
  onFechar: () => void;
  onMover: (id: string, s: LeadStatus) => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const [copiado, setCopiado] = useState(false);
  const [erroCopia, setErroCopia] = useState(false);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (lead && !d.open) d.showModal();
    if (!lead && d.open) d.close();
  }, [lead]);

  // O <dialog> modal não impede a página de fora de rolar em todos os
  // navegadores; sem isto, rolar no celular move o fundo em vez da ficha.
  useEffect(() => {
    if (!lead) return;
    const anterior = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = anterior;
    };
  }, [lead]);

  useEffect(() => {
    setCopiado(false);
    setErroCopia(false);
  }, [lead?.id]);

  function confirmar() {
    setCopiado(true);
    setErroCopia(false);
    setTimeout(() => setCopiado(false), 2200);
  }

  /**
   * Copiar é a ação central do produto, então vale ter plano B e plano C.
   * A API moderna recusa em situações comuns no celular (aba sem foco,
   * permissão negada), e sem aviso o cliente clicaria achando que copiou.
   */
  async function copiar() {
    const texto = lead?.mensagem;
    if (!texto) return;

    try {
      await navigator.clipboard.writeText(texto);
      confirmar();
      return;
    } catch {
      // Cai para o método antigo abaixo.
    }

    try {
      const area = document.createElement("textarea");
      area.value = texto;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.top = "0";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      const deuCerto = document.execCommand("copy");
      document.body.removeChild(area);
      if (deuCerto) {
        confirmar();
        return;
      }
    } catch {
      // Cai para a instrução manual.
    }

    setCopiado(false);
    setErroCopia(true);
  }

  const argumentos = Array.isArray(lead?.argumentos) ? lead.argumentos : [];
  const horario = lead?.horarios_sugeridos?.[0];

  return (
    <dialog
      ref={ref}
      onClose={onFechar}
      aria-labelledby="titulo-lead"
      className="ficha-lead m-0 max-h-[100dvh] w-full max-w-none bg-transparent p-0 text-texto sm:m-auto sm:max-h-[88vh] sm:w-[min(38rem,92vw)]"
    >
      {lead && (
        <div className="flex max-h-[100dvh] flex-col overflow-hidden bg-superficie sm:max-h-[88vh] sm:rounded-xl sm:border sm:border-borda">
          <header className="flex items-start justify-between gap-3 border-b border-borda px-5 py-4">
            <div className="min-w-0">
              <h2 id="titulo-lead" className="text-[17px] font-semibold leading-snug">
                {lead.nome_negocio}
              </h2>
              {lead.endereco && (
                <p className="mt-1 text-[12.5px] leading-relaxed text-texto-fraco">
                  {lead.endereco}
                </p>
              )}
            </div>
            <button
              onClick={onFechar}
              aria-label="Fechar"
              className="-mr-2 -mt-1 flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-lg text-texto-fraco hover:bg-superficie-2 hover:text-texto focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca"
            >
              <span aria-hidden="true" className="text-lg leading-none">
                ✕
              </span>
            </button>
          </header>

          <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
            {lead.diagnostico && (
              <section>
                <h3 className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-texto-fraco">
                  O que está faltando nesse negócio
                </h3>
                <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-texto-suave">
                  {lead.diagnostico}
                </p>
              </section>
            )}

            {horario && (
              <p className="rounded-lg border border-borda bg-superficie-2 px-3 py-2.5 text-[12.5px] leading-relaxed text-texto-suave">
                <strong className="font-semibold text-texto">
                  Melhor horário: {horario.horario}
                </strong>
                {horario.motivo ? `, ${horario.motivo}.` : "."}
              </p>
            )}

            {lead.mensagem ? (
              <section>
                <h3 className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-marca">
                  Sua mensagem, já escrita
                </h3>
                <p className="whitespace-pre-wrap rounded-lg border border-borda bg-superficie-2 p-3.5 text-[14px] leading-relaxed">
                  {lead.mensagem}
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={copiar}
                    aria-live="polite"
                    className={`inline-flex min-h-11 items-center rounded-lg px-4 text-[14px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca ${
                      copiado
                        ? "bg-convertido-fraco text-convertido"
                        : "bg-marca text-marca-contraste hover:opacity-90"
                    }`}
                  >
                    {copiado ? "Copiado" : "Copiar mensagem"}
                  </button>

                  {lead.link_whatsapp ? (
                    <a
                      href={`${lead.link_whatsapp}?text=${encodeURIComponent(lead.mensagem)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-11 items-center rounded-lg border border-convertido/40 bg-convertido-fraco px-4 text-[14px] font-semibold text-convertido hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca"
                    >
                      Abrir no WhatsApp
                    </a>
                  ) : (
                    <p className="flex min-h-11 items-center text-[12.5px] leading-relaxed text-texto-fraco">
                      Sem WhatsApp cadastrado. Copie a mensagem e mande por
                      Instagram, ou ligue.
                    </p>
                  )}
                </div>

                {erroCopia && (
                  <p
                    role="alert"
                    className="mt-2.5 rounded-lg border border-alerta/40 bg-alerta-fraco px-3 py-2.5 text-[12.5px] leading-relaxed text-alerta"
                  >
                    Seu navegador não deixou copiar sozinho. Toque e segure no
                    texto acima para selecionar e copiar na mão.
                  </p>
                )}
              </section>
            ) : (
              <p className="rounded-lg border border-borda bg-superficie-2 px-3 py-2.5 text-[12.5px] text-texto-fraco">
                Esse lead veio sem mensagem pronta. Me chame no WhatsApp que eu
                gero e reenvio.
              </p>
            )}

            {argumentos.length > 0 && (
              <section>
                <h3 className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-texto-fraco">
                  Se ele hesitar, use um destes
                </h3>
                <ul className="space-y-2">
                  {argumentos.map((arg, i) => (
                    <li
                      key={i}
                      className="flex gap-2.5 text-[13.5px] leading-relaxed text-texto-suave"
                    >
                      <span
                        aria-hidden="true"
                        className="mt-2 h-1 w-1 shrink-0 rounded-full bg-texto-fraco"
                      />
                      {arg}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          <footer className="border-t border-borda px-5 py-4">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-texto-fraco">
              Em que pé está
            </p>
            <div className="flex flex-wrap gap-1.5">
              {COLUNAS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => onMover(lead.id, c.id)}
                  aria-pressed={lead.status === c.id}
                  className={`inline-flex min-h-11 items-center rounded-lg border px-3.5 text-[13px] font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca ${
                    lead.status === c.id
                      ? `border-transparent ${CORES_ATIVO[c.id]}`
                      : "border-borda bg-superficie-2 text-texto-suave hover:border-borda-forte hover:text-texto"
                  }`}
                >
                  {c.titulo}
                </button>
              ))}
            </div>
          </footer>
        </div>
      )}
    </dialog>
  );
}
