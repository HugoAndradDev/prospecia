import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { checkAdminSecret } from "@/lib/admin-auth";

export async function GET(request: Request) {
  if (!checkAdminSecret(request)) {
    return NextResponse.json({ error: "não autorizado" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("clientes")
    .select("*")
    .order("criado_em", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ clientes: data });
}

export async function POST(request: Request) {
  if (!checkAdminSecret(request)) {
    return NextResponse.json({ error: "não autorizado" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const nome = body?.nome?.trim();
  if (!nome) {
    return NextResponse.json({ error: "nome é obrigatório" }, { status: 400 });
  }

  const slug = randomBytes(9).toString("base64url");
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("clientes")
    .insert({ nome, slug })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ cliente: data });
}
