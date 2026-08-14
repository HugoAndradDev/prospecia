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

const CTA_PRINCIPAL = "Falar comigo no WhatsApp";

export default function Landing() {
  const zap = linkWhatsApp(MSG_INTERESSE);

  return (
    <div className="bg-fundo text-texto">
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
          className="inline-flex min-h-11 items-center rounded-lg border border-borda px-4 text-[13px] text-texto-suave hover:border-borda-forte hover:text-texto focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca"
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
  tamanho = "normal",
}: {
  href: string;
  children: React.ReactNode;
  tamanho?: "normal" | "grande";
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center justify-center rounded-lg bg-marca font-semibold text-marca-contraste transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca ${
        tamanho === "grande"
          ? "px-7 py-3.5 text-[16px]"
          : "px-5 py-3 text-[15px]"
      }`}
    >
      {children}
    </a>
  );
}

function Hero({ zap }: { zap: string }) {
  return (
    <section className="mx-auto max-w-6xl px-5 pb-16 pt-14 sm:pt-20 lg:pb-24">
      <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:gap-14">
        <div>
          <h1 className="font-display text-[34px] font-semibold leading-[1.08] tracking-[-0.02em] text-balance sm:text-[46px] lg:text-[52px]">
            Você já sabe fazer site. O chato é achar quem precisa.
          </h1>

          <p className="mt-6 max-w-[52ch] text-[16.5px] leading-relaxed text-texto-suave">
            Eu garimpo negócios locais que ainda não têm site de verdade, monto
            um diagnóstico de cada um e já deixo escrita a primeira mensagem que
            você vai mandar. Você abre o painel, escolhe quem vale a ligação, e
            entra na conversa sabendo o que dizer.
          </p>

          <p className="mt-6 text-[15px]">
            <strong className="font-display text-[22px] font-semibold">
              R$ 67 por mês.
            </strong>{" "}
            <span className="text-texto-suave">Sem fidelidade.</span>
          </p>

          <div className="mt-7">
            <BotaoZap href={zap} tamanho="grande">
              {CTA_PRINCIPAL}
            </BotaoZap>
            <p className="mt-2.5 text-[13px] text-texto-fraco">
              Respondo eu mesmo, normalmente no mesmo dia.
            </p>
          </div>
        </div>

        {/* Sangra para fora da margem à direita: assimetria proposital, o
            painel parece continuar além da tela. */}
        <div className="lg:-mr-16 xl:-mr-28">
          <KanbanVitrine />
          <p className="mt-3 text-[12.5px] text-texto-fraco">
            O painel do cliente, do jeito que ele abre no celular entre um
            atendimento e outro.
          </p>
        </div>
      </div>

      <p className="mt-14 max-w-[64ch] border-l-2 border-marca-borda pl-5 text-[15px] leading-relaxed text-texto-suave lg:mt-20">
        Não vou prometer que todo mundo responde. Boa parte vai ignorar você. O
        que eu tiro do seu caminho é o garimpo e a página em branco na hora de
        escrever.
      </p>
    </section>
  );
}

function Problema() {
  return (
    <section className="border-t border-borda">
      <div className="mx-auto max-w-6xl px-5 py-16 lg:py-24">
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
      titulo: "Eu garimpo",
      texto:
        "Todo mês eu passo pelas regiões que você escolher e separo os negócios que ainda não têm site de verdade. Não é lista comprada nem base revendida, é busca feita na hora.",
    },
    {
      titulo: "Eu escrevo o diagnóstico",
      texto:
        "Para cada negócio, o que está faltando e por que isso custa cliente. Escrito em português de gente, do jeito que dá pra ler em voz alta pro dono da padaria.",
    },
    {
      titulo: "Você abre o painel e trabalha",
      texto:
        "Os negócios chegam na coluna Novo. Você move para Contatado quando falar com alguém, e para Convertido quando fechar. No celular, com o dedo.",
    },
  ];

  return (
    <section className="border-t border-borda">
      <div className="mx-auto max-w-6xl px-5 py-16 lg:py-24">
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
              <h3 className="mb-2 mt-2.5 text-[17px] font-semibold">
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
      <div className="mx-auto max-w-6xl px-5 py-16 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-16">
          <div>
            <h2 className="font-display text-[28px] font-semibold leading-[1.15] tracking-[-0.015em] text-balance sm:text-[34px]">
              Um que eu entreguei semana passada
            </h2>
            <p className="mt-5 text-[15.5px] leading-relaxed text-texto-suave">
              É isso que aparece no seu painel. O negócio, o que falta nele, e a
              mensagem pronta para você copiar, ajustar do seu jeito e mandar.
            </p>
          </div>

          <FichaDiagnostico />
        </div>
      </div>
    </section>
  );
}

function Preco({ zap }: { zap: string }) {
  const incluso = [
    "Até 30 diagnósticos por mês",
    "Painel de acompanhamento, com login seu",
    "Suporte no WhatsApp, falando comigo direto",
  ];

  return (
    <section className="border-t border-borda">
      <div className="mx-auto max-w-6xl px-5 py-16 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-texto-fraco">
              Preço
            </p>
            <p className="mt-4 font-display text-[64px] font-semibold leading-none tracking-[-0.03em] sm:text-[76px]">
              R$ 67
            </p>
            <p className="mt-2 text-[16px] text-texto-suave">
              por mês, sem fidelidade
            </p>

            <div className="mt-8">
              <BotaoZap href={zap} tamanho="grande">
                {CTA_PRINCIPAL}
              </BotaoZap>
            </div>
          </div>

          <div>
            <ul className="divide-y divide-borda border-y border-borda">
              {incluso.map((item) => (
                <li key={item} className="py-3.5 text-[15.5px]">
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-5 text-[14px] leading-relaxed text-texto-fraco">
              Passou de 30 num mês movimentado? O painel avisa e continua
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
      r: "Aí ele não entra, o critério é exatamente esse. De vez em quando escapa um que tem site velho e abandonado. Nesses casos você me avisa e eu troco por outro.",
    },
    {
      p: "Posso cancelar quando quiser?",
      r: "Pode. Não tem contrato nem multa. Você me avisa e para no mês seguinte.",
    },
    {
      p: "Quantos diagnósticos por mês?",
      r: "Até 30. Na prática já é bastante coisa pra uma pessoa dar conta sozinha. Se você precisar de mais, me chama que a gente ajusta.",
    },
    {
      p: "Você entrega os mesmos negócios pra várias pessoas?",
      r: "Não na mesma região. Se você pegou a zona oeste de São Paulo, aquele lote é seu. É justamente por isso que eu não consigo atender muita gente ao mesmo tempo, e prefiro deixar isso claro agora em vez de descobrirmos depois.",
    },
  ];

  return (
    <section className="border-t border-borda">
      <div className="mx-auto max-w-6xl px-5 py-16 lg:py-24">
        <h2 className="mb-10 font-display text-[28px] font-semibold tracking-[-0.015em] sm:text-[34px]">
          O que costumam me perguntar
        </h2>

        <div className="max-w-[68ch] divide-y divide-borda border-y border-borda">
          {perguntas.map((item) => (
            <details key={item.p} className="group">
              <summary className="cursor-pointer list-none py-4 pr-8 text-[16px] font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca">
                <span className="relative block">
                  {item.p}
                  <span
                    aria-hidden="true"
                    className="absolute right-[-24px] top-0.5 text-texto-fraco transition-transform group-open:rotate-45"
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
      <div className="mx-auto max-w-6xl px-5 py-20 lg:py-28">
        <div className="max-w-[56ch]">
          <h2 className="font-display text-[30px] font-semibold leading-[1.12] tracking-[-0.02em] text-balance sm:text-[40px]">
            Quer ver antes de pagar?
          </h2>
          <p className="mt-5 text-[16.5px] leading-relaxed text-texto-suave">
            Me chama no WhatsApp que eu monto três diagnósticos da sua região e
            mando de graça, pra você ver exatamente como chega. Se não servir
            pro seu jeito de trabalhar, tudo bem, e eu não fico insistindo.
          </p>

          <div className="mt-8">
            <BotaoZap href={zap} tamanho="grande">
              {CTA_PRINCIPAL}
            </BotaoZap>
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
          className="inline-flex min-h-11 items-center text-[13px] text-texto-fraco hover:text-texto focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca"
        >
          Já é cliente? Entrar no painel
        </Link>
      </div>
    </footer>
  );
}
