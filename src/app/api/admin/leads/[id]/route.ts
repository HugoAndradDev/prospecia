import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { checkAdminSecret } from "@/lib/admin-auth";

const VALID_STATUS = ["novo", "contatado", "convertido"];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkAdminSecret(request)) {
    return NextResponse.json({ error: "não autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const status = body?.status;

  if (!VALID_STATUS.includes(status)) {
    return NextResponse.json({ error: "status inválido" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("leads")
    .update({ status, atualizado_em: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ lead: data });
}
