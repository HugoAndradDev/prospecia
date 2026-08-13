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
