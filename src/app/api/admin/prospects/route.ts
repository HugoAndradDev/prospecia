import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { checkAdminSecret } from "@/lib/admin-auth";

export async function GET(request: Request) {
  if (!checkAdminSecret(request)) {
    return NextResponse.json({ error: "não autorizado" }, { status: 401 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("prospects")
    .select("*")
    .order("criado_em", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ prospects: data });
}

/** Formato cru exportado pelo Hunter no n8n. */
type ProspectImportado = {
  placeId?: string;
  nome?: string;
  endereco?: string;
  copyB2B?: string;
  mensagem_pronta?: string;
  link_whatsapp?: string;
  abertoAgora?: boolean;
  horario?: string;
  melhorHorarioContato?: string;
};

export async function POST(request: Request) {
  if (!checkAdminSecret(request)) {
    return NextResponse.json({ error: "não autorizado" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!Array.isArray(body)) {
    return NextResponse.json(
      { error: "esperava um array de prospects exportado do n8n" },
      { status: 400 }
    );
  }

  const brutos = body as ProspectImportado[];
  if (brutos.some((p) => !p?.placeId || !p?.nome)) {
    return NextResponse.json(
      { error: "todo prospect precisa de placeId e nome" },
      { status: 400 }
    );
  }

  // Um mesmo place_id repetido dentro do próprio lote quebraria o insert.
  const porPlaceId = new Map<string, ProspectImportado>();
  for (const p of brutos) porPlaceId.set(p.placeId!, p);

  const rows = [...porPlaceId.values()].map((p) => ({
    place_id: p.placeId!,
    nome: p.nome!.trim(),
    endereco: p.endereco?.trim() || null,
    copy_b2b: p.copyB2B?.trim() || null,
    mensagem_pronta: p.mensagem_pronta?.trim() || null,
    link_whatsapp: p.link_whatsapp?.trim() || null,
    aberto_agora: typeof p.abertoAgora === "boolean" ? p.abertoAgora : null,
    horario: p.horario?.trim() || null,
    melhor_horario_contato: p.melhorHorarioContato?.trim() || null,
  }));

  const supabase = getSupabaseAdmin();
  // ignoreDuplicates preserva o histórico de quem já foi abordado: place_id
  // que já existe é simplesmente pulado, nunca sobrescrito.
  const { data, error } = await supabase
    .from("prospects")
    .upsert(rows, { onConflict: "place_id", ignoreDuplicates: true })
    .select();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    adicionados: data.length,
    jaExistiam: rows.length - data.length,
  });
}
