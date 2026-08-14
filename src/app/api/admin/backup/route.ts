import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { checkAdminSecret } from "@/lib/admin-auth";

/** Dump completo da prospecção, para você guardar fora do Supabase. */
export async function GET(request: Request) {
  if (!checkAdminSecret(request)) {
    return NextResponse.json({ error: "não autorizado" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const [prospects, notas] = await Promise.all([
    supabase.from("prospects").select("*").order("criado_em"),
    supabase.from("prospect_notas").select("*").order("criado_em"),
  ]);

  if (prospects.error || notas.error) {
    return NextResponse.json(
      { error: prospects.error?.message ?? notas.error?.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    tipo: "prospecia-hunter-backup",
    geradoEm: new Date().toISOString(),
    prospects: prospects.data,
    notas: notas.data,
  });
}
