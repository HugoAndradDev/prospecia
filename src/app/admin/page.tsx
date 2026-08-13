"use client";

import { useEffect, useState } from "react";
import type { Cliente, Lead, LeadStatus } from "@/lib/types";

const SECRET_KEY = "prospecia:admin-secret";

const STATUS_LABEL: Record<LeadStatus, string> = {
  novo: "Novo",
  contatado: "Contatado",
  convertido: "Convertido",
};

export default function AdminPage() {
  const [secret, setSecret] = useState<string | null>(null);
  const [secretInput, setSecretInput] = useState("");
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    const saved = sessionStorage.getItem(SECRET_KEY);
    if (saved) setSecret(saved);
  }, []);

  async function handleUnlock(e: React.FormEvent) {
    e.preventDefault();
    setAuthError("");
    const res = await fetch("/api/admin/clientes", {
      headers: { "x-admin-secret": secretInput },
    });
    if (res.status === 401) {
      setAuthError("Senha incorreta.");
      return;
    }
    sessionStorage.setItem(SECRET_KEY, secretInput);
    setSecret(secretInput);
  }

  if (!secret) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-neutral-950 text-neutral-100 px-4">
        <form
          onSubmit={handleUnlock}
          className="w-full max-w-sm space-y-4 bg-neutral-900 border border-neutral-800 rounded-xl p-6"
        >
          <h1 className="text-lg font-semibold">Admin ProspecIA</h1>
          <input
            type="password"
            autoFocus
            value={secretInput}
            onChange={(e) => setSecretInput(e.target.value)}
            placeholder="Senha admin"
            className="w-full rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm outline-none focus:border-orange-500"
          />
          {authError && <p className="text-sm text-red-400">{authError}</p>}
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

  return <AdminDashboard secret={secret} onLogout={() => {
    sessionStorage.removeItem(SECRET_KEY);
    setSecret(null);
  }} />;
}

function AdminDashboard({ secret, onLogout }: { secret: string; onLogout: () => void }) {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [novoClienteNome, setNovoClienteNome] = useState("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [importText, setImportText] = useState("");
  const [importMsg, setImportMsg] = useState("");
  const [loadingLeads, setLoadingLeads] = useState(false);

  async function carregarClientes() {
    const res = await fetch("/api/admin/clientes", {
      headers: { "x-admin-secret": secret },
    });
    const data = await res.json();
    if (res.ok) setClientes(data.clientes);
  }

  useEffect(() => {
    carregarClientes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function criarCliente(e: React.FormEvent) {
    e.preventDefault();
    if (!novoClienteNome.trim()) return;
    const res = await fetch("/api/admin/clientes", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-secret": secret },
      body: JSON.stringify({ nome: novoClienteNome.trim() }),
    });
    const data = await res.json();
    if (res.ok) {
      setNovoClienteNome("");
      await carregarClientes();
      setSelectedId(data.cliente.id);
    }
  }

  async function carregarLeads(clienteId: string) {
    setLoadingLeads(true);
    const res = await fetch(`/api/admin/leads?clienteId=${clienteId}`, {
      headers: { "x-admin-secret": secret },
    });
    const data = await res.json();
    if (res.ok) setLeads(data.leads);
    setLoadingLeads(false);
  }

  useEffect(() => {
    if (selectedId) carregarLeads(selectedId);
    else setLeads([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  async function importarLeads() {
    if (!selectedId) return;
    let parsed: unknown;
    try {
      parsed = JSON.parse(importText);
      if (!Array.isArray(parsed)) throw new Error("não é uma lista");
    } catch {
      setImportMsg("JSON inválido — confira se colou o array completo.");
      return;
    }
    const res = await fetch("/api/admin/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-secret": secret },
      body: JSON.stringify({ clienteId: selectedId, leads: parsed }),
    });
    const data = await res.json();
    if (res.ok) {
      setImportMsg(`${data.adicionados} lead(s) adicionado(s).`);
      setImportText("");
      carregarLeads(selectedId);
    } else {
      setImportMsg(data.error || "Falha ao importar.");
    }
  }

  async function alterarStatus(leadId: string, status: LeadStatus) {
    const res = await fetch(`/api/admin/leads/${leadId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", "x-admin-secret": secret },
      body: JSON.stringify({ status }),
    });
    if (res.ok && selectedId) carregarLeads(selectedId);
  }

  const selected = clientes.find((c) => c.id === selectedId);
  const painelUrl = selected ? `/painel/${selected.slug}` : null;

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Admin ProspecIA</h1>
          <button onClick={onLogout} className="text-sm text-neutral-400 hover:text-neutral-200">
            sair
          </button>
        </div>

        <section className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-medium text-neutral-300">Clientes</h2>
          <form onSubmit={criarCliente} className="flex gap-2">
            <input
              value={novoClienteNome}
              onChange={(e) => setNovoClienteNome(e.target.value)}
              placeholder="Nome do cliente (ex: Agência Fulano)"
              className="flex-1 rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm outline-none focus:border-orange-500"
            />
            <button
              type="submit"
              className="rounded-lg bg-orange-500 text-neutral-950 font-medium px-4 py-2 text-sm hover:opacity-90"
            >
              Criar
            </button>
          </form>

          <div className="flex flex-wrap gap-2">
            {clientes.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedId(c.id)}
                className={`rounded-lg border px-3 py-2 text-sm ${
                  selectedId === c.id
                    ? "bg-orange-500/10 border-orange-500/40 text-orange-400"
                    : "bg-neutral-800 border-neutral-700 text-neutral-300 hover:border-neutral-500"
                }`}
              >
                {c.nome}
              </button>
            ))}
          </div>

          {painelUrl && (
            <p className="text-xs text-neutral-400 font-mono break-all">
              Link do painel: <span className="text-orange-400">{painelUrl}</span>
            </p>
          )}
        </section>

        {selected && (
          <>
            <section className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-3">
              <h2 className="text-sm font-medium text-neutral-300">
                Importar leads para {selected.nome}
              </h2>
              <p className="text-xs text-neutral-500">
                Cole o array JSON exportado do n8n. Campos: nome_negocio (obrigatório),
                endereco, telefone, diagnostico.
              </p>
              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder='[{"nome_negocio": "...", "endereco": "...", "telefone": "...", "diagnostico": "..."}]'
                className="w-full min-h-32 rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2 text-xs font-mono outline-none focus:border-orange-500"
              />
              <div className="flex items-center gap-3">
                <button
                  onClick={importarLeads}
                  className="rounded-lg bg-orange-500 text-neutral-950 font-medium px-4 py-2 text-sm hover:opacity-90"
                >
                  Adicionar leads
                </button>
                {importMsg && <span className="text-xs text-neutral-400">{importMsg}</span>}
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-sm font-medium text-neutral-300">
                Leads ({leads.length}) {loadingLeads && "— carregando…"}
              </h2>
              <div className="space-y-2">
                {leads.map((lead) => (
                  <div
                    key={lead.id}
                    className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div>
                      <p className="font-medium text-sm">{lead.nome_negocio}</p>
                      {lead.endereco && (
                        <p className="text-xs text-neutral-500 font-mono">{lead.endereco}</p>
                      )}
                    </div>
                    <div className="flex gap-1.5">
                      {(["novo", "contatado", "convertido"] as LeadStatus[]).map((s) => (
                        <button
                          key={s}
                          onClick={() => alterarStatus(lead.id, s)}
                          className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium ${
                            lead.status === s
                              ? "bg-orange-500/10 border-orange-500/40 text-orange-400"
                              : "bg-neutral-800 border-neutral-700 text-neutral-400 hover:border-neutral-500"
                          }`}
                        >
                          {STATUS_LABEL[s]}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                {leads.length === 0 && !loadingLeads && (
                  <p className="text-sm text-neutral-500">Nenhum lead ainda para este cliente.</p>
                )}
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
