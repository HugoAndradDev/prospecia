"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const SECRET_KEY = "prospecia:admin-secret";

/**
 * Trava simples da área interna: guarda a senha na sessão do navegador e a
 * repassa para as chamadas de API. Não é login de verdade — é só para o Hugo,
 * enquanto não existe Supabase Auth (Fase 2).
 */
export function AdminGate({
  children,
}: {
  children: (secret: string) => React.ReactNode;
}) {
  const [secret, setSecret] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [senhaDigitada, setSenhaDigitada] = useState("");
  const [erro, setErro] = useState("");

  useEffect(() => {
    setSecret(sessionStorage.getItem(SECRET_KEY));
    setCarregando(false);
  }, []);

  async function entrar(e: React.FormEvent) {
    e.preventDefault();
    setErro("");
    const res = await fetch("/api/admin/clientes", {
      headers: { "x-admin-secret": senhaDigitada },
    });
    if (res.status === 401) {
      setErro("Senha incorreta.");
      return;
    }
    sessionStorage.setItem(SECRET_KEY, senhaDigitada);
    setSecret(senhaDigitada);
  }

  if (carregando) {
    return <main className="min-h-screen bg-neutral-950" />;
  }

  if (!secret) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-neutral-950 text-neutral-100 px-4">
        <form
          onSubmit={entrar}
          className="w-full max-w-sm space-y-4 bg-neutral-900 border border-neutral-800 rounded-xl p-6"
        >
          <h1 className="text-lg font-semibold">Admin ProspecIA</h1>
          <input
            type="password"
            autoFocus
            value={senhaDigitada}
            onChange={(e) => setSenhaDigitada(e.target.value)}
            placeholder="Senha admin"
            className="w-full rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm outline-none focus:border-orange-500"
          />
          {erro && <p className="text-sm text-red-400">{erro}</p>}
          <button
            type="submit"
            className="w-full rounded-lg bg-orange-500 text-neutral-950 font-medium py-2 text-sm hover:opacity-90"
          >
            Entrar
          </button>
        </form>
      </main>
    );
  }

  return <>{children(secret)}</>;
}

export function AdminNav({ atual }: { atual: "clientes" | "hunter" }) {
  const abas = [
    { id: "clientes", href: "/admin", label: "Clientes & Leads" },
    { id: "hunter", href: "/admin/hunter", label: "Hunter — prospecção" },
  ] as const;

  return (
    <nav className="flex gap-1.5">
      {abas.map((aba) => (
        <Link
          key={aba.id}
          href={aba.href}
          className={`rounded-lg border px-3 py-1.5 text-sm ${
            atual === aba.id
              ? "bg-orange-500/10 border-orange-500/40 text-orange-400"
              : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-600"
          }`}
        >
          {aba.label}
        </Link>
      ))}
    </nav>
  );
}

export function sairDoAdmin() {
  sessionStorage.removeItem(SECRET_KEY);
  location.reload();
}
