"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase-browser";
import { SeletorDeTema } from "@/components/tema";
import { linkWhatsApp, MSG_INTERESSE } from "@/lib/contato";

export default function LoginPage() {
  return (
    <Suspense>
      <FormularioLogin />
    </Suspense>
  );
}

function FormularioLogin() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [entrando, setEntrando] = useState(false);

  const sessaoExpirada = params.get("motivo") === "sessao";

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    setEntrando(true);

    try {
      const supabase = getSupabaseBrowser();
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: senha,
      });

      if (error) {
        setErro(mensagemDeErro(error.message, error.status));
        setEntrando(false);
        return;
      }

      router.push("/app");
      router.refresh();
    } catch {
      setErro("Não consegui conectar. Verifique sua internet e tente de novo.");
      setEntrando(false);
    }
  }

  return (
    <main className="flex min-h-screen flex-col bg-fundo px-4 text-texto">
      <div className="flex justify-end py-4">
        <SeletorDeTema />
      </div>

      <div className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center pb-16">
        <div className="mb-7 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.14em] text-marca">
            ProspecIA
          </p>
          <h1 className="mt-2 text-xl font-semibold">Entrar na sua conta</h1>
        </div>

        {sessaoExpirada && (
          <p className="mb-4 rounded-lg border border-alerta/40 bg-alerta-fraco px-3.5 py-2.5 text-[13px] text-alerta">
            Sua sessão expirou. Entre de novo para continuar.
          </p>
        )}

        <form
          onSubmit={entrar}
          className="space-y-3.5 rounded-xl border border-borda bg-superficie p-6"
        >
          <label className="block">
            <span className="mb-1.5 block text-[13px] text-texto-suave">E-mail</span>
            <input
              type="email"
              required
              autoFocus
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-borda bg-superficie-2 px-3 py-2.5 text-sm outline-none focus:border-marca"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-[13px] text-texto-suave">Senha</span>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full rounded-lg border border-borda bg-superficie-2 px-3 py-2.5 text-sm outline-none focus:border-marca"
            />
          </label>

          {erro && (
            <p
              role="alert"
              className="rounded-lg border border-erro/40 bg-erro-fraco px-3 py-2.5 text-[13px] text-erro"
            >
              {erro}
            </p>
          )}

          <button
            type="submit"
            disabled={entrando}
            className="w-full rounded-lg bg-marca py-2.5 text-sm font-semibold text-marca-contraste hover:opacity-90 disabled:opacity-50"
          >
            {entrando ? "Entrando…" : "Entrar"}
          </button>
        </form>

        <p className="mt-5 text-center text-[13px] leading-relaxed text-texto-fraco">
          Ainda não tem acesso?{" "}
          <a
            href={linkWhatsApp(MSG_INTERESSE)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-marca hover:underline"
          >
            Fale comigo
          </a>{" "}
          para criar sua conta.
        </p>
      </div>
    </main>
  );
}

/**
 * Nunca revela se o e-mail existe: credencial errada e e-mail inexistente
 * devolvem exatamente a mesma frase.
 */
function mensagemDeErro(original: string, status?: number): string {
  const texto = original.toLowerCase();

  if (status === 429 || texto.includes("rate limit") || texto.includes("too many")) {
    return "Muitas tentativas seguidas. Aguarde alguns minutos antes de tentar de novo.";
  }
  if (texto.includes("email not confirmed")) {
    return "Sua conta ainda não foi liberada. Me chame no WhatsApp que eu resolvo.";
  }
  return "E-mail ou senha inválidos.";
}
