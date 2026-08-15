import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { checkAdminSecret } from "@/lib/admin-auth";

/** Só estes campos podem ser alterados pelo painel. */
const CAMPOS = ["nome", "user_id", "limite_diagnosticos", "assinatura_iniciada_em"] as const;

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

  const patch: Record<string, unknown> = {};

  for (const campo of CAMPOS) {
    if (!(campo in body)) continue;
    const valor = body[campo];

    if (campo === "limite_diagnosticos") {
      const n = Number(valor);
      if (!Number.isInteger(n) || n < 1 || n > 10000) {
        return NextResponse.json(
          { error: "limite precisa ser um número inteiro entre 1 e 10000" },
          { status: 400 }
        );
      }
      patch[campo] = n;
      continue;
    }

    if (campo === "nome") {
      const nome = typeof valor === "string" ? valor.trim() : "";
      if (!nome) {
        return NextResponse.json({ error: "nome não pode ficar vazio" }, { status: 400 });
      }
      patch[campo] = nome;
      continue;
    }

    // user_id e assinatura_iniciada_em aceitam vazio, que vira nulo:
    // desvincular o login é uma operação legítima.
    patch[campo] = typeof valor === "string" && valor.trim() ? valor.trim() : null;
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "nada para atualizar" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("clientes")
    .update(patch)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    // user_id é unique: o mesmo login não pode servir a dois clientes.
    if (error.code === "23505") {
      return NextResponse.json(
        { error: "esse login já está vinculado a outro cliente" },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ cliente: data });
}
