import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { checkAdminSecret } from "@/lib/admin-auth";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkAdminSecret(request)) {
    return NextResponse.json({ error: "não autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const supabase = getSupabaseAdmin();
  // Só notas suas saem; o registro automático de mudança de estágio fica,
  // para o histórico não virar uma versão editada dos fatos.
  const { error } = await supabase
    .from("prospect_notas")
    .delete()
    .eq("id", id)
    .eq("tipo", "manual");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
