import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { checkAdminSecret } from "@/lib/admin-auth";

export async function GET(request: Request) {
  if (!checkAdminSecret(request)) {
    return NextResponse.json({ error: "não autorizado" }, { status: 401 });
  }

  const clienteId = new URL(request.url).searchParams.get("clienteId");
  if (!clienteId) {
    return NextResponse.json({ error: "clienteId é obrigatório" }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("cliente_id", clienteId)
    .order("entregue_em", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ leads: data });
}

/**
 * Um lead do jeito que o n8n (ProspecIA V2) entrega, no nó
 * "Gerar Pacote do Relatorio". Os nomes aqui seguem o motor, não o banco:
 * "nome" e não "nome_negocio", "mensagem_chave" e não "mensagem".
 */
type LeadDoMotor = {
  nome?: string;
  nome_negocio?: string;
  endereco?: string;
  telefone?: string;
  diagnostico?: string;
  mensagem_chave?: string;
  mensagem?: string;
  argumentos?: unknown;
  link_whatsapp?: string;
  horarios_sugeridos?: unknown;
};

/**
 * O arquivo do n8n é um OBJETO com os leads aninhados, não um array solto:
 * { cliente, nicho, cidade, total_leads, leads: [...] }
 * Aceita as duas formas para não obrigar ninguém a editar o export à mão.
 */
function extrairLeads(entrada: unknown): LeadDoMotor[] | null {
  if (Array.isArray(entrada)) return entrada as LeadDoMotor[];
  if (entrada && typeof entrada === "object") {
    const pacote = entrada as { leads?: unknown };
    if (Array.isArray(pacote.leads)) return pacote.leads as LeadDoMotor[];
  }
  return null;
}

function texto(valor: unknown): string | null {
  return typeof valor === "string" && valor.trim() ? valor.trim() : null;
}

export async function POST(request: Request) {
  if (!checkAdminSecret(request)) {
    return NextResponse.json({ error: "não autorizado" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const clienteId = body?.clienteId;
  const leads = extrairLeads(body?.leads);

  if (!clienteId || !leads) {
    return NextResponse.json(
      {
        error:
          "clienteId e os leads são obrigatórios. Cole o arquivo do n8n inteiro ou apenas a lista de leads.",
      },
      { status: 400 }
    );
  }

  if (leads.length === 0) {
    return NextResponse.json({ error: "o arquivo não tem lead nenhum" }, { status: 400 });
  }

  const semNome = leads.some((l) => !texto(l?.nome) && !texto(l?.nome_negocio));
  if (semNome) {
    return NextResponse.json(
      { error: "todo lead precisa de um nome" },
      { status: 400 }
    );
  }

  const rows = leads.map((l) => ({
    cliente_id: clienteId,
    nome_negocio: texto(l.nome) ?? texto(l.nome_negocio)!,
    endereco: texto(l.endereco),
    telefone: texto(l.telefone),
    diagnostico: texto(l.diagnostico),
    mensagem: texto(l.mensagem_chave) ?? texto(l.mensagem),
    argumentos: Array.isArray(l.argumentos) ? l.argumentos : null,
    link_whatsapp: texto(l.link_whatsapp),
    horarios_sugeridos: Array.isArray(l.horarios_sugeridos)
      ? l.horarios_sugeridos
      : null,
  }));

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.from("leads").insert(rows).select();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Avisa quando o lote veio sem a mensagem pronta: sem ela o cliente recebe
  // só o diagnóstico, que é menos do que o produto promete.
  const semMensagem = data.filter((l) => !l.mensagem).length;
  return NextResponse.json({ adicionados: data.length, semMensagem });
}
