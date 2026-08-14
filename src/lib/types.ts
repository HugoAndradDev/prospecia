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
  copy_b2b: string | null;
  mensagem_pronta: string | null;
  link_whatsapp: string | null;
  aberto_agora: boolean | null;
  horario: string | null;
  melhor_horario_contato: string | null;
  stage: ProspectStage;
  contatado_em: string | null;
  atualizado_em: string;
  criado_em: string;
};

/** Dias sem retorno depois dos quais vale reforçar o contato. */
export const FOLLOWUP_DIAS = 3;

export function precisaFollowUp(p: Prospect): boolean {
  if (p.stage !== "contatado" && p.stage !== "sem_resposta") return false;
  const base = p.atualizado_em || p.contatado_em;
  if (!base) return false;
  const dias = (Date.now() - new Date(base).getTime()) / 86_400_000;
  return dias >= FOLLOWUP_DIAS;
}
