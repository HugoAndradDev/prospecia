/**
 * Ciclo de cobrança do cliente.
 *
 * O contador de uso zera no aniversário mensal da assinatura, não no dia 1º.
 * Quem assinou dia 12 tem o contador zerado todo dia 12.
 */

function meiaNoiteLocal(iso: string): Date {
  // Colunas `date` chegam como "2026-08-12". Sem hora explícita o navegador
  // interpreta como UTC e o dia vira 11 no fuso do Brasil.
  const somenteData = iso.slice(0, 10);
  const [ano, mes, dia] = somenteData.split("-").map(Number);
  return new Date(ano, mes - 1, dia);
}

function ultimoDiaDoMes(ano: number, mes: number): number {
  return new Date(ano, mes + 1, 0).getDate();
}

/**
 * Início do ciclo vigente. Nunca devolve data anterior ao começo da assinatura.
 *
 * Quem assinou dia 31 e está em fevereiro cai no dia 28 (ou 29): o dia é
 * limitado ao último do mês, senão a data "transbordaria" para março.
 */
export function inicioDoCicloAtual(
  assinaturaIniciadaEm: string | null,
  criadoEm: string,
  agora: Date = new Date()
): Date {
  const ancora = meiaNoiteLocal(assinaturaIniciadaEm ?? criadoEm);
  const diaAncora = ancora.getDate();

  const hoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());

  const desteMes = new Date(
    hoje.getFullYear(),
    hoje.getMonth(),
    Math.min(diaAncora, ultimoDiaDoMes(hoje.getFullYear(), hoje.getMonth()))
  );

  // Ainda não chegou o aniversário neste mês: o ciclo corrente começou no mês
  // passado.
  const inicio =
    desteMes > hoje
      ? new Date(
          hoje.getFullYear(),
          hoje.getMonth() - 1,
          Math.min(
            diaAncora,
            ultimoDiaDoMes(hoje.getFullYear(), hoje.getMonth() - 1)
          )
        )
      : desteMes;

  return inicio < ancora ? ancora : inicio;
}

export function fimDoCicloAtual(inicio: Date): Date {
  const diaAncora = inicio.getDate();
  const proximo = new Date(
    inicio.getFullYear(),
    inicio.getMonth() + 1,
    Math.min(
      diaAncora,
      ultimoDiaDoMes(inicio.getFullYear(), inicio.getMonth() + 1)
    )
  );
  return proximo;
}

export function formatarDiaMes(d: Date): string {
  return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}
