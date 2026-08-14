export type LeadStatus = "novo" | "contatado" | "convertido";

export type Lead = {
  id: string;
  cliente_id: string;
  nome_negocio: string;
  endereco: string | null;
  telefone: string | null;
  diagnostico: string | null;
  status: LeadStatus;
  entregue_em: string;
  atualizado_em: string;
};

export type Cliente = {
  id: string;
  nome: string;
  slug: string;
  criado_em: string;
};

export const PROSPECT_STAGES = [
  "pendente",
  "contatado",
  "respondeu",
  "sem_resposta",
  "cliente",
  "descartado",
] as const;

export type ProspectStage = (typeof PROSPECT_STAGES)[number];

export const STAGE_LABELS: Record<ProspectStage, string> = {
  pendente: "Pendente",
  contatado: "Contatado",
  respondeu: "Respondeu",
  sem_resposta: "Sem resposta",
  cliente: "Fechou",
  descartado: "Descartado",
};

export type Prospect = {
  id: string;
  place_id: string;
  nome: string;
  endereco: string | null;
  telefone: string | null;
  email: string | null;
  instagram: string | null;
  site: string | null;
  copy_b2b: string | null;
  mensagem_pronta: string | null;
  link_whatsapp: string | null;
  aberto_agora: boolean | null;
  horario: string | null;
  melhor_horario_contato: string | null;
  stage: ProspectStage;
  follow_up_em: string | null;
  contatado_em: string | null;
  stage_atualizado_em: string | null;
  atualizado_em: string;
  criado_em: string;
};

export type ProspectNota = {
  id: string;
  prospect_id: string;
  texto: string;
  tipo: "manual" | "sistema";
  criado_em: string;
};

/** Campos que você pode corrigir à mão pelo painel. */
export const CAMPOS_EDITAVEIS = [
  "nome",
  "endereco",
  "telefone",
  "email",
  "instagram",
  "site",
  "link_whatsapp",
  "melhor_horario_contato",
  "copy_b2b",
  "follow_up_em",
] as const;

export type CampoEditavel = (typeof CAMPOS_EDITAVEIS)[number];

/** Dias sem retorno depois dos quais vale reforçar o contato. */
export const FOLLOWUP_DIAS = 3;

/**
 * "agendado" — você marcou uma data de retorno e ela chegou.
 * "parado"   — ninguém respondeu há FOLLOWUP_DIAS dias.
 * Uma data agendada sempre vence a regra automática: se você decidiu voltar
 * em duas semanas, o painel não fica cobrando antes disso.
 */
export type MotivoFollowUp = "agendado" | "parado" | null;

export function motivoFollowUp(p: Prospect): MotivoFollowUp {
  if (p.stage === "cliente" || p.stage === "descartado") return null;

  if (p.follow_up_em) {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    return new Date(`${p.follow_up_em}T00:00:00`) <= hoje ? "agendado" : null;
  }

  if (p.stage !== "contatado" && p.stage !== "sem_resposta") return null;
  const base = p.stage_atualizado_em ?? p.contatado_em;
  if (!base) return null;
  const dias = (Date.now() - new Date(base).getTime()) / 86_400_000;
  return dias >= FOLLOWUP_DIAS ? "parado" : null;
}

export function precisaFollowUp(p: Prospect): boolean {
  return motivoFollowUp(p) !== null;
}

export function formatarData(iso: string | null): string {
  if (!iso) return "—";
  // Colunas `date` chegam como "2026-08-20"; sem a hora explícita o navegador
  // interpreta como UTC e a data aparece um dia atrasada no fuso do Brasil.
  const d = iso.length === 10 ? new Date(`${iso}T00:00:00`) : new Date(iso);
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
}

export function formatarDataHora(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}
