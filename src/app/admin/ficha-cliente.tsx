"use client";

import { useCallback, useEffect, useState } from "react";
import { LIMITE_PADRAO, type Cliente } from "@/lib/types";

type Usuario = { id: string; email: string; confirmado: boolean };

/**
 * Vínculo do cliente com o login e com o plano.
 *
 * Existe porque este é o passo repetido a cada cliente fechado, e até aqui só
 * dava para fazer na mão dentro do Supabase.
 */
export function FichaCliente({
  cliente,
  secret,
  onSalvo,
}: {
  cliente: Cliente;
  secret: string;
  onSalvo: (c: Cliente) => void;
}) {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [userId, setUserId] = useState(cliente.user_id ?? "");
  const [limite, setLimite] = useState(String(cliente.limite_diagnosticos ?? LIMITE_PADRAO));
  const [inicio, setInicio] = useState(cliente.assinatura_iniciada_em ?? "");
  const [salvando, setSalvando] = useState(false);
  const [msg, setMsg] = useState("");

  // Depende só do id: salvar altera os próprios valores do cliente, e reagir a
  // isso apagaria o "Salvo." no mesmo instante em que ele aparece.
  useEffect(() => {
    setUserId(cliente.user_id ?? "");
    setLimite(String(cliente.limite_diagnosticos ?? LIMITE_PADRAO));
    setInicio(cliente.assinatura_iniciada_em ?? "");
    setMsg("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cliente.id]);

  const carregarUsuarios = useCallback(async () => {
    const res = await fetch("/api/admin/usuarios", {
      headers: { "x-admin-secret": secret },
    });
    if (res.ok) setUsuarios((await res.json()).usuarios);
  }, [secret]);

  useEffect(() => {
    carregarUsuarios();
  }, [carregarUsuarios]);

  async function salvar(e: React.FormEvent) {
    e.preventDefault();
    setSalvando(true);
    setMsg("");

    const res = await fetch(`/api/admin/clientes/${cliente.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-admin-secret": secret },
      body: JSON.stringify({
        user_id: userId,
        limite_diagnosticos: Number(limite),
        assinatura_iniciada_em: inicio,
      }),
    });

    const data = await res.json();
    setSalvando(false);

    if (!res.ok) {
      setMsg(data.error || "Falha ao salvar.");
      return;
    }
    onSalvo(data.cliente);
    setMsg("Salvo.");
  }

  const emailVinculado = usuarios.find((u) => u.id === cliente.user_id)?.email;

  return (
    <section className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
      <div>
        <h2 className="text-sm font-medium text-neutral-300">
          Acesso e plano de {cliente.nome}
        </h2>
        <p className="mt-1 text-xs text-neutral-500">
          {cliente.user_id
            ? `Entra com ${emailVinculado ?? "um login vinculado"}.`
            : "Sem login vinculado ainda: este cliente não consegue entrar no painel."}
        </p>
      </div>

      <form onSubmit={salvar} className="grid gap-3 sm:grid-cols-3">
        <label className="block sm:col-span-3">
          <span className="mb-1 block text-[11px] text-neutral-500">
            Login do cliente
          </span>
          <select
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm outline-none focus:border-orange-500"
          >
            <option value="">Nenhum (cliente não entra)</option>
            {usuarios.map((u) => (
              <option key={u.id} value={u.id}>
                {u.email}
                {u.confirmado ? "" : " (e-mail não confirmado)"}
              </option>
            ))}
          </select>
          <span className="mt-1 block text-[11px] text-neutral-600">
            Crie o login em Supabase → Authentication → Users → Add user, e
            depois selecione aqui.
          </span>
        </label>

        <label className="block">
          <span className="mb-1 block text-[11px] text-neutral-500">
            Diagnósticos por ciclo
          </span>
          <input
            type="number"
            min={1}
            max={10000}
            value={limite}
            onChange={(e) => setLimite(e.target.value)}
            className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm outline-none focus:border-orange-500"
          />
        </label>

        <label className="block sm:col-span-2">
          <span className="mb-1 block text-[11px] text-neutral-500">
            Assinatura começou em
          </span>
          <input
            type="date"
            value={inicio}
            onChange={(e) => setInicio(e.target.value)}
            className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm outline-none focus:border-orange-500 [color-scheme:dark]"
          />
          <span className="mt-1 block text-[11px] text-neutral-600">
            O contador do cliente zera no aniversário mensal desta data.
          </span>
        </label>

        <div className="flex items-center gap-3 sm:col-span-3">
          <button
            type="submit"
            disabled={salvando}
            className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-neutral-950 hover:opacity-90 disabled:opacity-50"
          >
            {salvando ? "Salvando…" : "Salvar acesso e plano"}
          </button>
          {msg && <span className="text-xs text-neutral-400">{msg}</span>}
        </div>
      </form>
    </section>
  );
}
