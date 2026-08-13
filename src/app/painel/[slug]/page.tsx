import { notFound } from "next/navigation";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import type { Lead, LeadStatus } from "@/lib/types";

const STATUS_LABEL: Record<LeadStatus, string> = {
  novo: "Novo",
  contatado: "Contatado",
  convertido: "Convertido",
};

const STATUS_STYLE: Record<LeadStatus, string> = {
  novo: "bg-neutral-800 border-neutral-700 text-neutral-300",
  contatado: "bg-blue-500/10 border-blue-500/40 text-blue-400",
  convertido: "bg-emerald-500/10 border-emerald-500/40 text-emerald-400",
};

export default async function PainelClientePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = getSupabaseAdmin();

  const { data: cliente } = await supabase
    .from("clientes")
    .select("*")
    .eq("slug", slug)
    .single();

  if (!cliente) notFound();

  const { data: leads } = await supabase
    .from("leads")
    .select("*")
    .eq("cliente_id", cliente.id)
    .order("entregue_em", { ascending: false });

  const lista = (leads ?? []) as Lead[];
  const convertidos = lista.filter((l) => l.status === "convertido").length;

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100">
      <div className="max-w-3xl mx-auto px-4 py-10 sm:py-14">
        <p className="text-xs font-mono uppercase tracking-wider text-orange-500 mb-2">
          ProspecIA
        </p>
        <h1 className="text-2xl font-semibold mb-1">Leads de {cliente.nome}</h1>
        <p className="text-sm text-neutral-400 mb-8">
          {lista.length} lead(s) entregue(s) · {convertidos} convertido(s)
        </p>

        <div className="space-y-3">
          {lista.map((lead) => (
            <div
              key={lead.id}
              className="bg-neutral-900 border border-neutral-800 rounded-xl p-5"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <h2 className="font-medium text-[15px]">{lead.nome_negocio}</h2>
                <span
                  className={`shrink-0 rounded-md border px-2 py-1 text-[11px] font-medium font-mono ${STATUS_STYLE[lead.status]}`}
                >
                  {STATUS_LABEL[lead.status]}
                </span>
              </div>
              {lead.endereco && (
                <p className="text-xs text-neutral-500 font-mono mb-1">{lead.endereco}</p>
              )}
              {lead.telefone && (
                <p className="text-xs text-neutral-500 font-mono mb-3">{lead.telefone}</p>
              )}
              {lead.diagnostico && (
                <p className="text-sm text-neutral-300 leading-relaxed bg-neutral-950 border border-neutral-800 rounded-lg p-3 whitespace-pre-wrap">
                  {lead.diagnostico}
                </p>
              )}
            </div>
          ))}

          {lista.length === 0 && (
            <p className="text-sm text-neutral-500 text-center py-16">
              Nenhum lead entregue ainda.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
