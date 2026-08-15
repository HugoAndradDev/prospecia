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

/**
 * No celular NÃO cabem três colunas.
 *
 * Em 375px cada coluna sobra com ~100px, largura em que endereço e resumo não
 * entram. A versão anterior escondia os dois, e o que restava era um nome de
 * negócio em 10px: a prova do produto virava três retângulos vazios, logo na
 * tela em que chega a maior parte das visitas.
 *
 * Aqui o celular mostra UMA coluna (Novo) com o card em tamanho de leitura, e
 * a fita de estágios acima é o que comunica que aquilo é um kanban. A partir
 * de sm volta a ser a grade de três colunas, com o texto todo.
 */
export function KanbanVitrine() {
  return (
    <div
      aria-label="Exemplo do painel de acompanhamento, com os estágios Novo, Contatado e Convertido"
      role="img"
      /* Sem borda e sem sombra: no hero este bloco apoia a headline, não
         disputa contorno com ela. O card com moldura é a ficha, mais abaixo. */
      className="rounded-xl bg-superficie-2 p-2.5 sm:p-3"
    >
      {/* Fita de estágios: só no celular, onde os títulos de coluna somem. */}
      <div className="mb-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 px-0.5 sm:hidden">
        {COLUNAS.map((coluna) => (
          <span
            key={coluna.id}
            className="flex items-center gap-1.5 text-[11px] font-medium text-texto-suave"
          >
            <span
              className={`h-1.5 w-1.5 shrink-0 rounded-full ${coluna.ponto}`}
            />
            {coluna.titulo}
            <span className="tabular-nums text-texto-fraco">
              {CARDS[coluna.id].length}
            </span>
          </span>
        ))}
      </div>

      <div className="grid gap-2 sm:grid-cols-3 sm:gap-3">
        {COLUNAS.map((coluna) => {
          const cards = CARDS[coluna.id];
          return (
            <div
              key={coluna.id}
              className={coluna.id === "novo" ? undefined : "hidden sm:block"}
            >
              <p className="mb-2 hidden items-center gap-1.5 px-0.5 text-[12px] font-semibold sm:flex">
                <span
                  className={`h-1.5 w-1.5 shrink-0 rounded-full ${coluna.ponto}`}
                />
                <span className="truncate">{coluna.titulo}</span>
                <span className="ml-auto text-[10px] tabular-nums text-texto-fraco">
                  {cards.length}
                </span>
              </p>

              <div className="space-y-2">
                {cards.map((c) => (
                  <div
                    key={c.nome}
                    className="rounded-lg border border-borda bg-superficie p-3 sm:p-2.5"
                  >
                    <p className="text-[14px] font-semibold leading-snug sm:text-[12px]">
                      {c.nome}
                    </p>
                    <p className="mt-0.5 text-[12px] text-texto-fraco sm:text-[10px]">
                      {c.endereco}
                    </p>
                    <p className="mt-1.5 text-[12.5px] leading-relaxed text-texto-suave sm:mt-1 sm:line-clamp-2 sm:text-[10px]">
                      {c.resumo}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
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
      {/*
       * Esta é a prova central da página, e por isso é o único elemento com
       * moldura de verdade: borda forte, canto maior e sombra em duas camadas
       * (uma rente, que assenta, e outra larga e difusa, que levanta). O
       * kanban do hero recuou justamente para esta ficha ter esse peso
       * sozinha.
       *
       * No celular sangra até as duas bordas da tela (-mx-5 contra o px-5 da
       * seção): ganha presença física em vez de ficar num card estreito.
       */}
      <article className="-mx-5 overflow-hidden border-y border-borda-forte bg-superficie shadow-[0_1px_2px_rgb(0_0_0_/_0.04),0_16px_40px_-12px_rgb(0_0_0_/_0.12)] sm:mx-0 sm:rounded-2xl sm:border-x">
        <header className="flex items-center justify-between gap-3 border-b border-borda bg-superficie-2 px-5 py-3">
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-texto-fraco">
            Diagnóstico entregue
          </span>
          <span className="rounded-md bg-novo-fraco px-2 py-0.5 text-[11px] font-semibold text-novo">
            Novo
          </span>
        </header>

        <dl className="divide-y divide-borda">
          {linhas.map(([rotulo, valor]) => (
            <div key={rotulo} className="flex gap-4 px-5 py-3">
              <dt className="w-20 shrink-0 text-[14px] text-texto-fraco">
                {rotulo}
              </dt>
              <dd className="min-w-0 flex-1 text-[14px]">{valor}</dd>
            </div>
          ))}
        </dl>

        <div className="border-t border-borda px-5 py-4">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-texto-fraco">
            O que está faltando
          </p>
          <p className="text-[16px] leading-relaxed text-texto-suave">
            Não tem site. No Google aparece só o pino do Maps, sem cardápio, sem
            horário de funcionamento e sem link para pedido. Quem procura
            &ldquo;padaria perto de mim&rdquo; às sete da manhã encontra o
            concorrente da esquina, que tem página com foto e telefone clicável.
          </p>
        </div>

        {/* Filete na cor da marca, agora sobre fundo da própria marca: dentro
            do documento, esta é a parte que o cliente realmente usa, e é o
            clímax da página inteira. Um degrau de tipo acima do resto da
            ficha, de propósito. */}
        <div className="border-t-2 border-marca bg-marca-fraca px-5 py-5">
          <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-marca">
            Sua primeira mensagem, já escrita
          </p>
          {/* 17 contra os 16 do resto da ficha: o clímax continua um degrau
              acima depois da escala nova, como era a intenção. */}
          <p className="text-[17px] leading-relaxed">
            &ldquo;Bom dia! Passei em frente à padaria de vocês essa semana. Fui
            procurar o cardápio no Google e não achei nada além do endereço.
            Vocês perdem pedido por causa disso, principalmente de gente que
            está chegando no bairro. Eu faço site para comércio da região e
            queria te mostrar uma ideia rápida, sem compromisso. Posso mandar
            por aqui mesmo?&rdquo;
          </p>
        </div>
      </article>

      <p className="mt-3 px-1 text-[14px] leading-relaxed text-texto-fraco">
        Esse texto vai inteiro para o WhatsApp do negócio, com um toque no
        painel.
      </p>
    </div>
  );
}
