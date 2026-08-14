"use client";

import { useEffect } from "react";
import { linkWhatsApp } from "@/lib/contato";

/**
 * Última barreira: qualquer erro inesperado na área do cliente cai aqui.
 * O cliente vê português e um caminho de saída; o detalhe técnico fica no
 * console do servidor, nunca na tela dele.
 */
export default function ErroNaAreaDoCliente({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Erro na área do cliente:", error);
  }, [error]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-fundo px-4 text-texto">
      <div className="max-w-md rounded-xl border border-borda bg-superficie p-6 text-center">
        <h1 className="mb-1.5 text-base font-semibold">
          Alguma coisa deu errado aqui
        </h1>
        <p className="text-sm leading-relaxed text-texto-suave">
          O problema é do meu lado, não do seu. Nada que você fez foi perdido.
        </p>

        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <button
            onClick={reset}
            className="rounded-lg bg-marca px-4 py-2 text-sm font-semibold text-marca-contraste hover:opacity-90"
          >
            Tentar de novo
          </button>
          <a
            href={linkWhatsApp("Oi Hugo! Deu erro no painel.")}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-borda px-4 py-2 text-sm font-semibold text-texto-suave hover:border-borda-forte"
          >
            Me avisar
          </a>
        </div>

        {error.digest && (
          <p className="mt-4 font-mono text-[10.5px] text-texto-fraco">
            código: {error.digest}
          </p>
        )}
      </div>
    </main>
  );
}
