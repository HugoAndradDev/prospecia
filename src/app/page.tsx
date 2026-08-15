import type { Metadata } from "next";
import Link from "next/link";
import { SeletorDeTema } from "@/components/tema";
import { linkWhatsApp, MSG_INTERESSE } from "@/lib/contato";
import { KanbanVitrine, FichaDiagnostico } from "./vitrine";

export const metadata: Metadata = {
  title: "ProspecIA",
  description:
    "Negócios locais sem site, com diagnóstico pronto e a primeira mensagem já escrita. Para freelancer de web design e agência pequena. R$ 67 por mês.",
};

const CTA_PRINCIPAL = "Falar no WhatsApp";

/**
 * Ritmo de leitura, não espaçamento uniforme.
 *
 * VIRADA vai nas seções que mudam o argumento (a prova, o preço, o
 * fechamento): elas precisam de silêncio em volta para pesarem. CONTINUA vai
 * entre blocos do mesmo raciocínio, que devem ser lidos em sequência.
 *
 * Os degraus são bem afastados de propósito. Na versão anterior eles existiam
 * mas ficavam a duas ou quatro unidades um do outro, diferença que só existia
 * no código: ao rolar, a página lia como uma pilha de blocos iguais.
 */
const RESPIRO = {
  continua: "py-12 lg:py-16",
  padrao: "py-16 lg:py-24",
  virada: "py-24 lg:py-40",
  final: "py-28 lg:py-44",
};

/**
 * Escala tipográfica, sete degraus.
 *
 * A página usava dezenove tamanhos escolhidos um a um, vários separados por
 * meio pixel (15, 15.5, 16, 16.5). É o tipo de coisa que ninguém aponta e todo
 * mundo sente: lê como página montada, não projetada.
 *
 * Duas exceções conscientes, ambas numerais e não texto corrido: o "R$ 67"
 * grande da seção de preço, que funciona como imagem e não como tipo, e o
 * "R$ 67 por mês" do hero. A réplica do painel em vitrine.tsx também tem
 * escala própria, porque imita uma interface, não o texto da página.
 */
const TEXTO = {
  rotulo: "text-[11px] font-semibold uppercase tracking-[0.14em]",
  apoio: "text-[14px]",
  corpo: "text-[16px]",
  destaque: "text-[17px]",
  titulo3: "font-display text-[27px] font-semibold tracking-[-0.015em] sm:text-[34px]",
  titulo2: "font-display text-[32px] font-semibold tracking-[-0.025em] sm:text-[44px]",
  /*
   * A proposta era subir a headline um degrau no desktop. Não se sustentou: a
   * copy nova tem 89 caracteres contra 64 da anterior, então a 64px ela virava
   * cinco linhas e o hero desandava. Corpo maior com frase longa não é mais
   * ênfase, é só mais linha. Ficou abaixo dos 60px da versão anterior, de
   * propósito.
   */
  titulo1:
    "font-display text-[40px] font-semibold tracking-[-0.025em] sm:text-[46px] lg:text-[54px]",
};

/**
 * Uma gramática só de foco e de hover.
 *
 * Antes eram quatro: o botão levantava, o link do topo mudava a borda, a
 * pergunta do FAQ mudava a cor e o sinal ao lado dela ficava parado. Estado
 * pela metade em três lugares diferentes.
 */
const FOCO =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca";
const TRANSICAO = "transition-colors duration-150 ease-out";

export default function Landing() {
  const zap = linkWhatsApp(MSG_INTERESSE);

  return (
    /*
     * overflow-x-clip apara a sangria do painel no hero, que passa de
     * propósito da margem direita. Precisa ser clip e não hidden: hidden cria
     * um contexto de rolagem e quebraria o position sticky da seção de prova.
     */
    <div className="overflow-x-clip bg-fundo text-texto">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-marca focus:px-4 focus:py-2 focus:text-sm focus:text-marca-contraste"
      >
        Pular para o conteúdo
      </a>

      <Topo />

      <main id="conteudo">
        <Hero zap={zap} />
        <Problema />
        <ComoFunciona />
        <OQueChega />
        <Confianca />
        <Preco zap={zap} />
        <Objecoes />
        <Fechamento zap={zap} />
      </main>

      <Rodape />
    </div>
  );
}

function Topo() {
  return (
    <header className="border-b border-borda">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-5 py-4">
        <p className={`flex-1 ${TEXTO.rotulo} tracking-[0.16em] text-marca`}>
          ProspecIA
        </p>
        <SeletorDeTema />
        <Link
          href="/login"
          className={`inline-flex min-h-11 items-center rounded-lg border border-borda px-4 ${TEXTO.apoio} text-texto-suave ${TRANSICAO} hover:border-borda-forte hover:text-texto ${FOCO}`}
        >
          Entrar
        </Link>
      </div>
    </header>
  );
}

function BotaoZap({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      /* Largura total no celular: o polegar acerta sem mirar. */
      className={`inline-flex min-h-[3.25rem] w-full items-center justify-center rounded-lg bg-marca px-7 ${TEXTO.corpo} font-semibold text-marca-contraste shadow-sm transition-[transform,box-shadow,opacity] duration-150 ease-out hover:-translate-y-px hover:opacity-95 hover:shadow-md ${FOCO} active:translate-y-0 sm:w-auto`}
    >
      {children}
    </a>
  );
}

/**
 * Rótulo pequeno em caixa alta, no alto da seção.
 *
 * `comoTitulo` o promove a <h2> onde a seção não tem outro título, para nenhum
 * bloco da página ficar sem cabeçalho na árvore do documento.
 */
function Eyebrow({
  children,
  comoTitulo,
}: {
  children: React.ReactNode;
  comoTitulo?: boolean;
}) {
  const Tag = comoTitulo ? "h2" : "p";
  return (
    <Tag className={`mb-3 ${TEXTO.rotulo} text-texto-fraco`}>
      {children}
    </Tag>
  );
}

function Hero({ zap }: { zap: string }) {
  return (
    <section className="mx-auto max-w-6xl px-5 pb-16 pt-14 sm:pt-20 lg:pb-28">
      {/* 1.2 contra 0.8: a coluna de texto domina, e o painel apoia em vez de
          disputar a atenção com a headline.

          Alinhado pelo topo, não centralizado: centralizado, o painel flutuava
          numa altura que dependia do tamanho do texto ao lado, e a leitura
          começava em dois lugares ao mesmo tempo. */}
      <div className="grid gap-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:items-start lg:gap-16">
        <div>
          {/*
           * O eixo da página é o que você tem na mão ao abrir a conversa, não
           * o garimpo. Achar negócio sem site é commodity (o Maps faz, e há
           * ferramenta gratuita fazendo), então a headline concede esse ponto
           * antes que o leitor cético conceda sozinho, e move o problema para
           * onde o produto entrega de verdade.
           *
           * Alternativa em avaliação, mais próxima da âncora do playbook:
           *
           * A) A lista qualquer um monta. O motivo para ele fechar com você,
           *    não.
           *
           * Descartadas na rodada anterior, quando o eixo ainda era o garimpo:
           *
           * B) O difícil nunca foi fazer o site. É descobrir quem ainda não
           *    tem.
           * C) Fazer o site é a parte fácil. Achar quem precisa é que toma o
           *    seu sábado.
           */}
          <h1
            className={`${TEXTO.titulo1} leading-[1.05] text-balance`}
          >
            Achar quem não tem site é a parte fácil. Difícil é saber o que dizer
            na primeira mensagem.
          </h1>

          <p
            className={`mt-6 max-w-[46ch] ${TEXTO.destaque} leading-relaxed text-texto-suave`}
          >
            Cada negócio da sua região chega com o diagnóstico escrito e a
            primeira mensagem pronta para enviar. A varredura já vem feita, e
            ela é o menor pedaço do trabalho. O que muda é você abrir a conversa
            sabendo o que está faltando naquele negócio e o que dizer na
            primeira frase.
          </p>

          {/* Preço e CTA agrupados atrás de um filete: viram um bloco de
              decisão, separado da explicação acima. */}
          <div className="mt-9 border-t border-borda pt-7">
            <p className={`mb-5 ${TEXTO.corpo}`}>
              {/* Exceção declarada da escala: numeral, funciona como marca. */}
              <strong className="font-display text-[24px] font-semibold">
                R$ 67 por mês.
              </strong>{" "}
              <span className="text-texto-suave">Sem fidelidade.</span>
            </p>

            <BotaoZap href={zap}>{CTA_PRINCIPAL}</BotaoZap>
            <p className={`mt-3 ${TEXTO.apoio} text-texto-fraco`}>
              Resposta normalmente no mesmo dia.
            </p>
          </div>
        </div>

        {/* Sangra para fora da margem à direita: o painel parece continuar
            além da tela, em vez de ser um card centrado competindo. O respiro
            no topo desce o painel de propósito, para a headline começar
            sozinha. */}
        <div className="lg:-mr-16 lg:pt-3 xl:-mr-28">
          <KanbanVitrine />
          <p className={`mt-3 ${TEXTO.apoio} text-texto-fraco`}>
            Seu painel, do jeito que abre no celular.
          </p>
        </div>
      </div>
    </section>
  );
}

function Problema() {
  return (
    /*
     * Sem linha: o hero termina um argumento e aqui começa outro, então o
     * respiro é que separa. Linha em toda seção era o que fazia a página ler
     * como pilha de blocos; agora ela sobrou só nos dois lugares em que o
     * raciocínio CONTINUA e o leitor precisa amarrar um bloco no seguinte.
     */
    <section>
      <div className={`mx-auto max-w-6xl px-5 ${RESPIRO.padrao}`}>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
          <h2 className={`${TEXTO.titulo3} leading-[1.15] text-balance`}>
            Sábado de manhã, Google Maps aberto
          </h2>

          <div
            className={`space-y-5 ${TEXTO.corpo} leading-relaxed text-texto-suave`}
          >
            <p>
              Você digita o tipo de negócio mais o nome do bairro e começa a
              clicar em um por um. Esse tem site. Esse aqui tem um link que só
              leva pro Instagram. Aquele não tem nada, e é justamente o que
              interessa.
            </p>
            <p>
              Meia hora depois, seis nomes anotados no bloco de notas. Aí vem a
              parte pior, que é abrir o WhatsApp e escrever a primeira mensagem
              sem soar como robô de vendas.
            </p>
            <p className="text-texto">
              Na terça você não lembra mais quem já respondeu.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function ComoFunciona() {
  const passos = [
    {
      titulo: "A varredura é a parte fácil, e já vem feita",
      texto:
        "Todo mês a busca passa pelas regiões que você escolher e separa quem ainda não tem site de verdade. Feita na hora, sem lista comprada e sem base que já rodou por aí. Só que uma lista de nomes é o começo do trabalho, não o fim.",
    },
    {
      /* Centro de gravidade da seção: é aqui que a página deixa de vender
         garimpo. A mensagem de abordagem não aparecia em passo nenhum, mesmo
         sendo metade do produto e o que a ficha logo abaixo demonstra. */
      titulo: "Cada negócio chega com o argumento pronto",
      texto:
        "Junto com o negócio vem o que está faltando nele, por que isso custa cliente, e a primeira mensagem já escrita. Em português de gente, do jeito que dá pra ler em voz alta pro dono da padaria.",
    },
    {
      titulo: "Você abre o painel e entra na conversa",
      texto:
        "A mensagem vai para o WhatsApp do negócio com um toque. Os negócios chegam na coluna Novo, você move para Contatado quando falar com alguém, e para Convertido quando fechar. No celular, com o dedo.",
    },
  ];

  return (
    /* Linha mantida: a cena do sábado de manhã e o mecanismo são o mesmo
       raciocínio, e a linha amarra os dois. */
    <section className="border-t border-borda">
      {/* Respiro menor: continua o raciocínio do bloco anterior. */}
      <div className={`mx-auto max-w-6xl px-5 ${RESPIRO.continua}`}>
        <h2 className={`mb-12 ${TEXTO.titulo3}`}>Como funciona</h2>

        {/* Numeração aqui porque é sequência de verdade: um passo depois do
            outro. Em nenhuma outra seção da página há números. */}
        <ol className="grid gap-10 sm:grid-cols-3 sm:gap-8">
          {passos.map((p, i) => (
            <li key={p.titulo}>
              <span
                className={`${TEXTO.rotulo} tabular-nums text-marca`}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3
                className={`mb-2 mt-2.5 ${TEXTO.destaque} font-semibold leading-snug`}
              >
                {p.titulo}
              </h3>
              <p className={`${TEXTO.corpo} leading-relaxed text-texto-suave`}>
                {p.texto}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function OQueChega() {
  return (
    /*
     * O único fundo diferente da página inteira, atravessando de ponta a
     * ponta. Toda a ousadia visual gasta em um lugar só, e o lugar escolhido é
     * o argumento mais forte: o artefato real. Sem border-t aqui, porque a
     * troca de fundo já separa a seção melhor do que uma linha separaria.
     */
    <section className="bg-superficie-2">
      {/* Virada: é o argumento mais forte da página, mostra o artefato real. */}
      <div className={`mx-auto max-w-6xl px-5 ${RESPIRO.virada}`}>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] lg:gap-16">
          <div className="lg:sticky lg:top-12 lg:self-start">
            <Eyebrow>Prova</Eyebrow>
            <h2 className={`${TEXTO.titulo3} leading-[1.15] text-balance`}>
              Um diagnóstico entregue semana passada
            </h2>
            {/* Único ponto da página em que o leitor lê a distinção com o
                artefato à vista, então é aqui que a âncora de posicionamento
                trabalha. Sem a redação literal do playbook ("o motivo pelo
                qual aquele negócio VAI FECHAR com você"), que promete
                resultado e não serve para fora. */}
            <p
              className={`mt-5 ${TEXTO.corpo} leading-relaxed text-texto-suave`}
            >
              Não é ilustração. É o formato exato que chega no seu painel.
              Repare no que ele não é: uma linha de planilha com nome e
              telefone. O ProspecIA não entrega a lista, entrega o argumento e a
              frase que abre a conversa.
            </p>
          </div>

          <FichaDiagnostico />
        </div>
      </div>
    </section>
  );
}

function Confianca() {
  return (
    /* Sem linha: a borda do fundo da seção de prova, logo acima, já é o corte
       mais forte da página. Linha aqui seria carimbo em cima de carimbo. */
    <section>
      <div className={`mx-auto max-w-6xl px-5 ${RESPIRO.padrao}`}>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
          {/* Alternativa de título: "Suporte sem intermediário" */}
          <h2 className={`${TEXTO.titulo3} leading-[1.15] text-balance`}>
            Quem atende é quem desenvolve
          </h2>

          <div
            className={`space-y-5 ${TEXTO.corpo} leading-relaxed text-texto-suave`}
          >
            <p>
              O suporte do ProspecIA não tem central de atendimento, fila de
              chamado nem robô pedindo para você avaliar a conversa. A mensagem
              chega direto em quem desenvolve o produto, e a resposta costuma
              sair no mesmo dia.
            </p>
            <p>
              Um campo faltando no painel ou um lote que veio torto vai direto
              para quem mexe no código, sem passar por ninguém no meio. A
              operação é pequena, e o atendimento segue assim enquanto for
              possível.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Preco({ zap }: { zap: string }) {
  const incluso = [
    "Até 50 diagnósticos por mês",
    "Painel de acompanhamento, com login seu",
    "Suporte no WhatsApp, sem intermediário",
  ];

  return (
    /* Sem linha: virada de argumento, o silêncio em volta é que pesa. */
    <section>
      {/* Virada: momento da decisão. */}
      <div className={`mx-auto max-w-6xl px-5 ${RESPIRO.virada}`}>
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <Eyebrow comoTitulo>Preço</Eyebrow>
            {/* Exceção declarada da escala. Era 84px, maior que a própria
                headline da página, o que punha o preço como ponto de foco no
                lugar do argumento. Continua dominando a seção, sem competir
                com o topo. */}
            <p className="font-display text-[56px] font-semibold leading-none tracking-[-0.035em] sm:text-[68px]">
              R$ 67
            </p>
            <p className={`mt-3 ${TEXTO.corpo} text-texto-suave`}>
              por mês, sem fidelidade
            </p>

            {/* A âncora de comparação. O bloco "Sábado de manhã" nomeia o custo
                da alternativa e depois era abandonado, então quando o preço
                aparecia o leitor já tinha esquecido dele. Aqui as três imagens
                daquela seção voltam, do outro lado do número. Comparação entre
                duas rotinas, nunca entre custo e ganho: sem calcular hora de
                trabalho e sem prometer retorno. */}
            <p
              className={`mt-6 max-w-[44ch] ${TEXTO.corpo} leading-relaxed text-texto-suave`}
            >
              No lugar do sábado de manhã com o Maps aberto, do bloco de notas
              com seis nomes e da tela em branco do WhatsApp: até 50 negócios já
              diagnosticados, com a primeira mensagem escrita.
            </p>

            <div className="mt-9">
              <BotaoZap href={zap}>{CTA_PRINCIPAL}</BotaoZap>
            </div>
          </div>

          <div className="lg:pt-9">
            <ul className="divide-y divide-borda border-y border-borda">
              {incluso.map((item) => (
                <li key={item} className={`py-4 ${TEXTO.corpo}`}>
                  {item}
                </li>
              ))}
            </ul>
            <p className={`mt-5 ${TEXTO.apoio} leading-relaxed text-texto-fraco`}>
              Passou de 50 num mês movimentado? O painel avisa e continua
              funcionando normal. Você não perde acesso a nada do que já
              recebeu.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Objecoes() {
  const perguntas = [
    {
      p: "De onde vêm esses negócios?",
      r: "Busca no Google Maps, na região que você escolher, separando quem não tem site ou tem presença muito fraca. Não é base comprada nem lista que já rodou por aí.",
    },
    {
      p: "E se o negócio já tiver site?",
      r: "Aí ele não entra, o critério é exatamente esse. De vez em quando escapa um que tem site velho e abandonado. Nesse caso, um aviso pelo suporte já resolve: o lead sai da sua lista e outro entra no lugar.",
    },
    {
      p: "Posso cancelar quando quiser?",
      r: "Pode. Não tem contrato nem multa. É só avisar, e a cobrança para no mês seguinte.",
    },
    {
      p: "Quantos diagnósticos por mês?",
      r: "Até 50. Na prática já é bastante coisa para uma pessoa trabalhar sozinha. Precisando de mais, o limite pode subir, e o suporte resolve isso.",
    },
    {
      p: "Qual a chance de o negócio responder?",
      r: "Não existe número honesto para dar aqui, e desconfie de quem der. Prospecção fria funciona assim: uma parte ignora, uma parte responde semanas depois, e alguma fecha. O que muda é o começo. Você entra na conversa sabendo o nome, o que está faltando no negócio e o que dizer na primeira frase, em vez de encarar uma tela em branco no sábado de manhã.",
    },
  ];

  return (
    /* Linha mantida: as perguntas continuam o raciocínio do preço, são as
       objeções a ele. */
    <section className="border-t border-borda">
      <div className={`mx-auto max-w-6xl px-5 ${RESPIRO.continua}`}>
        <h2 className={`mb-10 ${TEXTO.titulo3}`}>O que costumam perguntar</h2>

        <div className="max-w-[68ch] divide-y divide-borda border-y border-borda">
          {perguntas.map((item) => (
            <details key={item.p} className="group">
              {/*
               * Grade de duas colunas em vez do sinal empurrado para fora com
               * right-[-24px]: naquele arranjo o "+" encostava no texto em
               * pergunta longa no celular. Agora ele tem coluna própria e não
               * tem como colidir.
               */}
              <summary
                className={`grid cursor-pointer list-none grid-cols-[1fr_auto] items-start gap-4 py-4 ${TEXTO.corpo} font-medium ${TRANSICAO} hover:text-marca ${FOCO}`}
              >
                <span>{item.p}</span>
                <span
                  aria-hidden="true"
                  className={`mt-0.5 text-texto-fraco ${TRANSICAO} duration-200 group-hover:text-marca motion-safe:transition-[transform,color] group-open:rotate-45`}
                >
                  +
                </span>
              </summary>
              <p
                className={`max-w-[62ch] pb-5 ${TEXTO.corpo} leading-relaxed text-texto-suave`}
              >
                {item.r}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function Fechamento({ zap }: { zap: string }) {
  return (
    /* Sem linha: o maior respiro da página já anuncia o fechamento. */
    <section>
      {/* O maior respiro da página inteira: última coisa que a pessoa lê. */}
      <div className={`mx-auto max-w-6xl px-5 ${RESPIRO.final}`}>
        <div className="max-w-[56ch]">
          <h2 className={`${TEXTO.titulo2} leading-[1.1] text-balance`}>
            Quer ver antes de pagar?
          </h2>
          <p
            className={`mt-5 ${TEXTO.destaque} leading-relaxed text-texto-suave`}
          >
            Fale com o ProspecIA no WhatsApp e receba três diagnósticos da sua
            região, de graça, pra ver exatamente como chega. Se não servir pro
            seu jeito de trabalhar, sem insistência.
          </p>

          <div className="mt-9">
            <BotaoZap href={zap}>{CTA_PRINCIPAL}</BotaoZap>
          </div>
        </div>
      </div>
    </section>
  );
}

function Rodape() {
  return (
    <footer className="border-t border-borda">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-8">
        <p className={`${TEXTO.rotulo} tracking-[0.16em] text-texto-fraco`}>
          ProspecIA
        </p>
        <Link
          href="/login"
          className={`inline-flex min-h-11 items-center ${TEXTO.apoio} text-texto-fraco ${TRANSICAO} hover:text-texto ${FOCO}`}
        >
          Já é cliente? Entrar no painel
        </Link>
      </div>
    </footer>
  );
}
