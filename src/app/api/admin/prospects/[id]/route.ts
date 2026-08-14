import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { checkAdminSecret } from "@/lib/admin-auth";
import {
  CAMPOS_EDITAVEIS,
  PROSPECT_STAGES,
  STAGE_LABELS,
  type CampoEditavel,
  type ProspectStage,
} from "@/lib/types";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkAdminSecret(request)) {
    return NextResponse.json({ error: "não autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "corpo inválido" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data: atual, error: erroLeitura } = await supabase
    .from("prospects")
    .select("stage, contatado_em")
    .eq("id", id)
    .single();

  if (erroLeitura) {
    return NextResponse.json({ error: "prospect não encontrado" }, { status: 404 });
  }

  const agora = new Date().toISOString();
  const patch: Record<string, unknown> = { atualizado_em: agora };

  for (const campo of CAMPOS_EDITAVEIS) {
    if (!(campo in body)) continue;
    const valor = body[campo as CampoEditavel];
    patch[campo] =
      typeof valor === "string" ? valor.trim() || null : (valor ?? null);
  }

  const mudouStage =
    "stage" in body && body.stage !== atual.stage;

  if ("stage" in body) {
    const stage = body.stage as ProspectStage;
    if (!PROSPECT_STAGES.includes(stage)) {
      return NextResponse.json({ error: "stage inválido" }, { status: 400 });
    }
    patch.stage = stage;
    // A data do primeiro contato nunca é reescrita por mudanças posteriores.
    patch.contatado_em =
      atual.contatado_em ?? (stage === "pendente" ? null : agora);
    if (mudouStage) {
      patch.stage_atualizado_em = agora;
      // Avançar o estágio encerra o retorno agendado: ele já aconteceu.
      if (!("follow_up_em" in body)) patch.follow_up_em = null;
    }
  }

  const { data, error } = await supabase
    .from("prospects")
    .update(patch)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  if (mudouStage) {
    await supabase.from("prospect_notas").insert({
      prospect_id: id,
      tipo: "sistema",
      texto: `${STAGE_LABELS[atual.stage as ProspectStage]} → ${
        STAGE_LABELS[body.stage as ProspectStage]
      }`,
    });
  }

  return NextResponse.json({ prospect: data });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkAdminSecret(request)) {
    return NextResponse.json({ error: "não autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("prospects").delete().eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
