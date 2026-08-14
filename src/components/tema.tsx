"use client";

import { useEffect, useState } from "react";

export const CHAVE_TEMA = "prospecia:tema";

export type Preferencia = "claro" | "escuro" | "sistema";

/**
 * Roda antes da primeira pintura, direto no <head>, para a tela nunca piscar
 * clara antes de virar escura.
 *
 * "sistema" REMOVE o atributo em vez de resolver o valor: sem atributo, o CSS
 * cai na media query e o navegador acompanha sozinho quando o aparelho troca
 * de tema — sem listener de JavaScript para manter vivo.
 */
export const SCRIPT_TEMA = `(function(){try{
var p=localStorage.getItem('${CHAVE_TEMA}');
if(p==='claro')document.documentElement.setAttribute('data-theme','light');
else if(p==='escuro')document.documentElement.setAttribute('data-theme','dark');
else document.documentElement.removeAttribute('data-theme');
}catch(e){}})();`;

function aplicar(pref: Preferencia) {
  const raiz = document.documentElement;
  if (pref === "claro") raiz.setAttribute("data-theme", "light");
  else if (pref === "escuro") raiz.setAttribute("data-theme", "dark");
  else raiz.removeAttribute("data-theme");
}

const OPCOES: { id: Preferencia; rotulo: string; icone: string }[] = [
  { id: "claro", rotulo: "Tema claro", icone: "☀" },
  { id: "escuro", rotulo: "Tema escuro", icone: "☾" },
  { id: "sistema", rotulo: "Seguir o aparelho", icone: "◐" },
];

export function SeletorDeTema() {
  const [pref, setPref] = useState<Preferencia>("sistema");
  const [pronto, setPronto] = useState(false);

  useEffect(() => {
    const salvo = localStorage.getItem(CHAVE_TEMA) as Preferencia | null;
    setPref(salvo ?? "sistema");
    setPronto(true);
  }, []);

  function escolher(novo: Preferencia) {
    setPref(novo);
    localStorage.setItem(CHAVE_TEMA, novo);
    aplicar(novo);
  }

  return (
    <div
      role="group"
      aria-label="Tema da interface"
      className="inline-flex rounded-lg border border-borda bg-superficie p-0.5"
    >
      {OPCOES.map((o) => {
        const ativo = pronto && pref === o.id;
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => escolher(o.id)}
            title={o.rotulo}
            aria-label={o.rotulo}
            aria-pressed={ativo}
            /* 44px: mínimo confortável para o dedo, exigido também pela
               auditoria de acessibilidade. */
            className={`min-h-11 min-w-11 rounded-md text-[13px] leading-none transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca ${
              ativo ? "bg-marca-fraca text-marca" : "text-texto-fraco hover:text-texto"
            }`}
          >
            <span aria-hidden="true">{o.icone}</span>
          </button>
        );
      })}
    </div>
  );
}
