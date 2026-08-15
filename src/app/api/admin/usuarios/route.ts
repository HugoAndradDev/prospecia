import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { checkAdminSecret } from "@/lib/admin-auth";

/**
 * Lista os logins existentes no Supabase Auth, para vincular a um cliente
 * pelo /admin em vez de copiar o UUID à mão do painel do Supabase.
 *
 * Devolve só id e e-mail: nada de metadados nem de qualquer coisa ligada a
 * senha.
 */
export async function GET(request: Request) {
  if (!checkAdminSecret(request)) {
    return NextResponse.json({ error: "não autorizado" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const usuarios = data.users.map((u) => ({
    id: u.id,
    email: u.email ?? "(sem e-mail)",
    confirmado: !!u.email_confirmed_at,
  }));

  return NextResponse.json({ usuarios });
}
