/**
 * WhatsApp do Hugo, com DDI, vindo de variável de ambiente.
 *
 * Ressalva honesta: NEXT_PUBLIC_ significa que o valor VAI para o código que
 * roda no navegador. Isso é inevitável, porque o número aparece dentro de um
 * link clicável na página. O ganho aqui não é sigilo (não existe sigilo em um
 * link visível), é poder trocar o número no painel do Vercel sem mexer no
 * código nem publicar de novo.
 */
export const WHATSAPP = process.env.NEXT_PUBLIC_WHATSAPP ?? "";

export function linkWhatsApp(mensagem: string): string {
  return `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(mensagem)}`;
}

/** Sem nome próprio: a landing fala em voz de produto do começo ao fim. */
export const MSG_INTERESSE =
  "Oi! Vi o ProspecIA e quero entender como funciona.";

export function msgSuporte(nomeCliente: string): string {
  return `Oi Hugo! Aqui é da ${nomeCliente}. Preciso de ajuda com o painel.`;
}
