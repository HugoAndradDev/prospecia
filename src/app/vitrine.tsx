/**
 * Réplica estática do painel, para a landing.
 *
 * É marcação de verdade, não imagem: pesa zero byte de download, fica nítida
 * em qualquer tela e não causa deslocamento de layout ao carregar. As cores e
 * as medidas saem dos mesmos tokens que o kanban real usa.
 */

const CARDS = {
  novo: [
    {
      nome: "Padaria Bela Vista",
      endereco: "R. Cardeal Arcoverde, 812",
      resumo: "Sem site. Só aparece no Maps, sem cardápio nem horário.",
    },
    {
      nome: "Pet Shop Focinho Feliz",
      endereco: "R. Teodoro Sampaio, 1044",
      resumo: "Perfil desatualizado, não aparece em busca por banho e tosa.",
    },
  ],
  contatado: [
    {
      nome: "Barbearia Navalha Fina",
      endereco: "R. Girassol, 331",
      resumo: "Só Instagram, sem agendamento online.",
    },
  ],
  convertido: [
    {
      nome: "Clínica Odonto Sorriso",
      endereco: "Av. Rebouças, 2100",
      resumo: "Fechou site institucional em setembro.",
    },
  ],
};

const COLUNAS = [
  { id: "novo", titulo: "Novo", ponto: "bg-novo", texto: "text-novo" },
  {
    id: "contatado",
    titulo: "Contatado",
    ponto: "bg-contatado",
    texto: "text-contatado",
  },
  {
    id: "convertido",
    titulo: "Convertido",
    ponto: "bg-convertido",
    texto: "text-convertido",
  },
] as const;

export function KanbanVitrine() {
  return (
    <div
      aria-label="Exemplo do painel de acompanhamento"
      role="img"
      className="grid grid-cols-3 gap-2 rounded-xl border border-borda bg-superficie-2 p-2.5 sm:gap-3 sm:p-3"
    >
      {COLUNAS.map((coluna) => {
        const cards = CARDS[coluna.id];
        return (
          <div key={coluna.id}>
            <p className="mb-2 flex items-center gap-1.5 px-0.5 text-[10px] font-semibold sm:text-[12px]">
              <span
                className={`h-1.5 w-1.5 shrink-0 rounded-full ${coluna.ponto}`}
              />
              <span className="truncate">{coluna.titulo}</span>
              <span className="ml-auto text-[9px] tabular-nums text-texto-fraco sm:text-[10px]">
                {cards.length}
              </span>
            </p>

            <div className="space-y-1.5 sm:space-y-2">
              {cards.map((c) => (
                <div
                  key={c.nome}
                  className="rounded-lg border border-borda bg-superficie p-2 sm:p-2.5"
                >
                  <p className="text-[10px] font-semibold leading-snug sm:text-[12px]">
                    {c.nome}
                  </p>
                  <p className="mt-0.5 hidden text-[9px] text-texto-fraco sm:block sm:text-[10px]">
                    {c.endereco}
                  </p>
                  <p className="mt-1 hidden text-[10px] leading-relaxed text-texto-suave md:line-clamp-2">
                    {c.resumo}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Uma entrega de verdade, do jeito que chega no painel. */
export function FichaDiagnostico() {
  const linhas = [
    ["Negócio", "Padaria Bela Vista"],
    ["Endereço", "R. Cardeal Arcoverde, 812, Pinheiros, São Paulo"],
    ["Telefone", "(11) 3062 4471"],
  ];

  return (
    <div>
      <article className="overflow-hidden rounded-xl border border-borda bg-superficie shadow-sm">
        <header className="flex items-center justify-between gap-3 border-b border-borda bg-superficie-2 px-5 py-3">
          <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-texto-fraco">
            Diagnóstico entregue
          </span>
          <span className="rounded-md bg-novo-fraco px-2 py-0.5 text-[10px] font-semibold text-novo">
            Novo
          </span>
        </header>

        <dl className="divide-y divide-borda">
          {linhas.map(([rotulo, valor]) => (
            <div key={rotulo} className="flex gap-4 px-5 py-3">
              <dt className="w-20 shrink-0 text-[12px] text-texto-fraco">
                {rotulo}
              </dt>
              <dd className="min-w-0 flex-1 text-[13.5px]">{valor}</dd>
            </div>
          ))}
        </dl>

        <div className="border-t border-borda px-5 py-4">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-texto-fraco">
            O que está faltando
          </p>
          <p className="text-[13.5px] leading-relaxed text-texto-suave">
            Não tem site. No Google aparece só o pino do Maps, sem cardápio, sem
            horário de funcionamento e sem link para pedido. Quem procura
            &ldquo;padaria perto de mim&rdquo; às sete da manhã encontra o
            concorrente da esquina, que tem página com foto e telefone clicável.
          </p>
        </div>

        {/* Filete na cor da marca: dentro do documento, esta é a parte que o
            cliente realmente usa. */}
        <div className="border-t-2 border-marca bg-superficie-2 px-5 py-4">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-marca">
            Sua primeira mensagem, já escrita
          </p>
          <p className="text-[13.5px] leading-relaxed">
            &ldquo;Bom dia! Passei em frente à padaria de vocês essa semana. Fui
            procurar o cardápio no Google e não achei nada além do endereço.
            Vocês perdem pedido por causa disso, principalmente de gente que
            está chegando no bairro. Eu faço site para comércio da região e
            queria te mostrar uma ideia rápida, sem compromisso. Posso mandar
            por aqui mesmo?&rdquo;
          </p>
        </div>
      </article>

      <p className="mt-3 px-1 text-[12.5px] leading-relaxed text-texto-fraco">
        Esse texto vai inteiro para o WhatsApp do negócio, com um toque no
        painel.
      </p>
    </div>
  );
}
