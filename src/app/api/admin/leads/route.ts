import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { checkAdminSecret } from "@/lib/admin-auth";

export async function GET(request: Request) {
  if (!checkAdminSecret(request)) {
    return NextResponse.json({ error: "não autorizado" }, { status: 401 });
  }

  const clienteId = new URL(request.url).searchParams.get("clienteId");
  if (!clienteId) {
    return NextResponse.json({ error: "clienteId é obrigatório" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("cliente_id", clienteId)
    .order("entregue_em", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ leads: data });
}

type ImportLead = {
  nome_negocio: string;
  endereco?: string;
  telefone?: string;
  diagnostico?: string;
};

export async function POST(request: Request) {
  if (!checkAdminSecret(request)) {
    return NextResponse.json({ error: "não autorizado" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const clienteId = body?.clienteId;
  const leads = body?.leads;

  if (!clienteId || !Array.isArray(leads)) {
    return NextResponse.json(
      { error: "clienteId e leads (array) são obrigatórios" },
      { status: 400 }
    );
  }

  const invalidos = leads.some(
    (l: ImportLead) => !l || typeof l.nome_negocio !== "string" || !l.nome_negocio.trim()
  );
  if (invalidos) {
    return NextResponse.json(
      { error: "todo lead precisa de nome_negocio" },
      { status: 400 }
    );
  }

  const rows = (leads as ImportLead[]).map((l) => ({
    cliente_id: clienteId,
    nome_negocio: l.nome_negocio.trim(),
    endereco: l.endereco?.trim() || null,
    telefone: l.telefone?.trim() || null,
    diagnostico: l.diagnostico?.trim() || null,
  }));

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("leads").insert(rows).select();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ adicionados: data.length });
}
