import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { checkAdminSecret } from "@/lib/admin-auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkAdminSecret(request)) {
    return NextResponse.json({ error: "não autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("prospect_notas")
    .select("*")
    .eq("prospect_id", id)
    .order("criado_em", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ notas: data });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkAdminSecret(request)) {
    return NextResponse.json({ error: "não autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const texto = typeof body?.texto === "string" ? body.texto.trim() : "";

  if (!texto) {
    return NextResponse.json({ error: "nota vazia" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("prospect_notas")
    .insert({ prospect_id: id, texto, tipo: "manual" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Anotar algo conta como atividade: reinicia o relógio do follow-up
  // automático, senão o painel cobraria retorno de quem você acabou de tocar.
  await supabase
    .from("prospects")
    .update({
      atualizado_em: new Date().toISOString(),
      stage_atualizado_em: new Date().toISOString(),
    })
    .eq("id", id);

  return NextResponse.json({ nota: data });
}
