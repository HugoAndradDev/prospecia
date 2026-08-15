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
 */
const RESPIRO = {
  padrao: "py-16 lg:py-24",
  continua: "py-14 lg:py-20",
  virada: "py-20 lg:py-32",
  final: "py-24 lg:py-36",
};

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
        <p className="flex-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-marca">
          ProspecIA
        </p>
        <SeletorDeTema />
        <Link
          href="/login"
          className="inline-flex min-h-11 items-center rounded-lg border border-borda px-4 text-[13px] text-texto-suave transition-colors duration-150 hover:border-borda-forte hover:text-texto focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca"
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
      className="inline-flex min-h-[3.25rem] w-full items-center justify-center rounded-lg bg-marca px-7 text-[16px] font-semibold text-marca-contraste shadow-sm transition-[transform,box-shadow,opacity] duration-150 hover:-translate-y-px hover:opacity-95 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca active:translate-y-0 sm:w-auto"
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
    <Tag className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-texto-fraco">
      {children}
    </Tag>
  );
}

function Hero({ zap }: { zap: string }) {
  return (
    <section className="mx-auto max-w-6xl px-5 pb-16 pt-14 sm:pt-20 lg:pb-28">
      {/* 1.2 contra 0.8: a coluna de texto domina, e o painel apoia em vez de
          disputar a atenção com a headline. */}
      <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)] lg:gap-16">
        <div>
          {/*
           * Alternativas de headline, mantendo a mesma lógica (a parte difícil
           * não é executar, é encontrar quem precisa):
           *
           * A) Fazer o site é a parte fácil. Achar quem precisa é que toma o
           *    seu sábado.
           * B) Você sabe fazer site. Ninguém te ensinou a achar quem precisa.
           */}
          <h1 className="font-display text-[38px] font-semibold leading-[1.05] tracking-[-0.025em] text-balance sm:text-[52px] lg:text-[60px]">
            O difícil nunca foi fazer o site. É descobrir quem ainda não tem.
          </h1>

          <p className="mt-6 max-w-[46ch] text-[17px] leading-relaxed text-texto-suave">
            Todo mês o ProspecIA separa negócios da sua região que ainda não têm
            site. Cada um chega com o diagnóstico escrito e a primeira mensagem
            pronta. Você abre o painel e já entra na conversa sabendo o que
            dizer.
          </p>

          {/* Preço e CTA agrupados atrás de um filete: viram um bloco de
              decisão, separado da explicação acima. */}
          <div className="mt-9 border-t border-borda pt-7">
            <p className="mb-5 text-[15px]">
              <strong className="font-display text-[24px] font-semibold">
                R$ 67 por mês.
              </strong>{" "}
              <span className="text-texto-suave">Sem fidelidade.</span>
            </p>

            <BotaoZap href={zap}>{CTA_PRINCIPAL}</BotaoZap>
            <p className="mt-3 text-[13px] text-texto-fraco">
              Resposta normalmente no mesmo dia.
            </p>
          </div>
        </div>

        {/* Sangra para fora da margem à direita: o painel parece continuar
            além da tela, em vez de ser um card centrado competindo. */}
        <div className="lg:-mr-16 xl:-mr-28">
          <KanbanVitrine />
          <p className="mt-3 text-[12.5px] text-texto-fraco">
            Seu painel, do jeito que abre no celular.
          </p>
        </div>
      </div>
    </section>
  );
}

function Problema() {
  return (
    <section className="border-t border-borda">
      <div className={`mx-auto max-w-6xl px-5 ${RESPIRO.padrao}`}>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
          <h2 className="font-display text-[28px] font-semibold leading-[1.15] tracking-[-0.015em] text-balance sm:text-[34px]">
            Sábado de manhã, Google Maps aberto
          </h2>

          <div className="space-y-5 text-[16px] leading-relaxed text-texto-suave">
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
      titulo: "O ProspecIA varre a sua região",
      texto:
        "Todo mês a busca passa pelas regiões que você escolher e separa quem ainda não tem site de verdade. Não é lista comprada nem base que já rodou por aí, é feita na hora.",
    },
    {
      titulo: "Cada negócio chega diagnosticado",
      texto:
        "Junto com o negócio vem o que está faltando nele e por que isso custa cliente. Escrito em português de gente, do jeito que dá pra ler em voz alta pro dono da padaria.",
    },
    {
      titulo: "Você abre o painel e trabalha",
      texto:
        "Os negócios chegam na coluna Novo. Você move para Contatado quando falar com alguém, e para Convertido quando fechar. No celular, com o dedo.",
    },
  ];

  return (
    <section className="border-t border-borda">
      {/* Respiro menor: continua o raciocínio do bloco anterior. */}
      <div className={`mx-auto max-w-6xl px-5 ${RESPIRO.continua}`}>
        <h2 className="mb-12 font-display text-[28px] font-semibold tracking-[-0.015em] sm:text-[34px]">
          Como funciona
        </h2>

        {/* Numeração aqui porque é sequência de verdade: um passo depois do
            outro. Em nenhuma outra seção da página há números. */}
        <ol className="grid gap-10 sm:grid-cols-3 sm:gap-8">
          {passos.map((p, i) => (
            <li key={p.titulo}>
              <span className="text-[12px] font-semibold tabular-nums text-marca">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mb-2 mt-2.5 text-[17px] font-semibold leading-snug">
                {p.titulo}
              </h3>
              <p className="text-[15px] leading-relaxed text-texto-suave">
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
    <section className="border-t border-borda">
      {/* Virada: é o argumento mais forte da página, mostra o artefato real. */}
      <div className={`mx-auto max-w-6xl px-5 ${RESPIRO.virada}`}>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] lg:gap-16">
          <div className="lg:sticky lg:top-12 lg:self-start">
            <Eyebrow>Prova</Eyebrow>
            <h2 className="font-display text-[28px] font-semibold leading-[1.15] tracking-[-0.015em] text-balance sm:text-[34px]">
              Um diagnóstico entregue semana passada
            </h2>
            <p className="mt-5 text-[15.5px] leading-relaxed text-texto-suave">
              Não é ilustração. É o formato exato que chega no seu painel: o
              negócio, o que está faltando nele, e a mensagem que você copia e
              envia sem reescrever.
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
    <section className="border-t border-borda">
      <div className={`mx-auto max-w-6xl px-5 ${RESPIRO.padrao}`}>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-16">
          {/* Alternativa de título: "Suporte sem intermediário" */}
          <h2 className="font-display text-[28px] font-semibold leading-[1.15] tracking-[-0.015em] text-balance sm:text-[34px]">
            Quem atende é quem desenvolve
          </h2>

          <div className="space-y-5 text-[16px] leading-relaxed text-texto-suave">
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
    <section className="border-t border-borda">
      {/* Virada: momento da decisão. */}
      <div className={`mx-auto max-w-6xl px-5 ${RESPIRO.virada}`}>
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <Eyebrow comoTitulo>Preço</Eyebrow>
            <p className="font-display text-[68px] font-semibold leading-none tracking-[-0.035em] sm:text-[84px]">
              R$ 67
            </p>
            <p className="mt-3 text-[16px] text-texto-suave">
              por mês, sem fidelidade
            </p>

            <div className="mt-9">
              <BotaoZap href={zap}>{CTA_PRINCIPAL}</BotaoZap>
            </div>
          </div>

          <div className="lg:pt-9">
            <ul className="divide-y divide-borda border-y border-borda">
              {incluso.map((item) => (
                <li key={item} className="py-4 text-[15.5px]">
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-5 text-[14px] leading-relaxed text-texto-fraco">
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
    <section className="border-t border-borda">
      <div className={`mx-auto max-w-6xl px-5 ${RESPIRO.padrao}`}>
        <h2 className="mb-10 font-display text-[28px] font-semibold tracking-[-0.015em] sm:text-[34px]">
          O que costumam perguntar
        </h2>

        <div className="max-w-[68ch] divide-y divide-borda border-y border-borda">
          {perguntas.map((item) => (
            <details key={item.p} className="group">
              <summary className="cursor-pointer list-none py-4 pr-8 text-[16px] font-medium transition-colors duration-150 hover:text-marca focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca">
                <span className="relative block">
                  {item.p}
                  <span
                    aria-hidden="true"
                    className="absolute right-[-24px] top-0.5 text-texto-fraco transition-transform duration-200 group-open:rotate-45"
                  >
                    +
                  </span>
                </span>
              </summary>
              <p className="max-w-[62ch] pb-5 text-[15px] leading-relaxed text-texto-suave">
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
    <section className="border-t border-borda">
      {/* O maior respiro da página inteira: última coisa que a pessoa lê. */}
      <div className={`mx-auto max-w-6xl px-5 ${RESPIRO.final}`}>
        <div className="max-w-[56ch]">
          <h2 className="font-display text-[32px] font-semibold leading-[1.1] tracking-[-0.025em] text-balance sm:text-[44px]">
            Quer ver antes de pagar?
          </h2>
          <p className="mt-5 text-[16.5px] leading-relaxed text-texto-suave">
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
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-texto-fraco">
          ProspecIA
        </p>
        <Link
          href="/login"
          className="inline-flex min-h-11 items-center text-[13px] text-texto-fraco transition-colors duration-150 hover:text-texto focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca"
        >
          Já é cliente? Entrar no painel
        </Link>
      </div>
    </footer>
  );
}
