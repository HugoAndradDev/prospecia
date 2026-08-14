import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { checkAdminSecret } from "@/lib/admin-auth";
import { PROSPECT_STAGES, type ProspectStage } from "@/lib/types";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkAdminSecret(request)) {
    return NextResponse.json({ error: "não autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const stage = body?.stage as ProspectStage;

  if (!PROSPECT_STAGES.includes(stage)) {
    return NextResponse.json({ error: "stage inválido" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data: atual, error: erroLeitura } = await supabase
    .from("prospects")
    .select("contatado_em")
    .eq("id", id)
    .single();

  if (erroLeitura) {
    return NextResponse.json({ error: erroLeitura.message }, { status: 404 });
  }

  const agora = new Date().toISOString();
  const { data, error } = await supabase
    .from("prospects")
    .update({
      stage,
      // A data do primeiro contato nunca é reescrita por mudanças de estágio.
      contatado_em:
        atual.contatado_em ?? (stage === "pendente" ? null : agora),
      atualizado_em: agora,
    })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ prospect: data });
}
