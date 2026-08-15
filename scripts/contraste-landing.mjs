/**
 * Varredura de contraste da landing, nos três temas.
 *
 * POR QUE ESTE ARQUIVO EXISTE
 *
 * O Lighthouse roda só em tema claro. O tema escuro fica descoberto, e foi
 * exatamente ali que a página quebrou uma vez: texto auxiliar em 3.08 sobre a
 * superfície cinza, contra o mínimo de 4.5, sem nenhum aviso automático.
 *
 * Verificador de contraste comum compara um par de cores que você digita. Não
 * serve aqui, porque os defeitos desta página nunca estiveram no par de cores:
 * estiveram na PILHA. O bloco da mensagem é um laranja com 8% de opacidade,
 * sobre a superfície da ficha, sobre o fundo da seção. Esse valor final não
 * existe em lugar nenhum do CSS, só na tela.
 *
 * Então este script não calcula nada no papel. Ele abre a página de verdade no
 * Chrome, percorre cada texto visível, resolve a pilha de fundos até achar uma
 * cor opaca e mede o contraste real. Sai com código 1 se algum texto reprovar,
 * para poder travar uma rodada futura.
 *
 * COMO RODAR
 *
 *   node scripts/contraste-landing.mjs [url]
 *
 * A url padrão é http://localhost:3100/. Aponte para o BUILD DE PRODUÇÃO numa
 * porta que não seja a do `next dev`: servidor de desenvolvimento rodando em
 * paralelo já falseou medição aqui antes.
 *
 * Sem dependência nenhuma: Node puro, mais o Chrome que já está na máquina.
 */
import { spawn } from "node:child_process";
import { existsSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const ALVO = process.argv[2] ?? "http://localhost:3100/";
const PORTA_DEPURACAO = 9334;

const CAMINHOS_CHROME = [
  process.env.CHROME_PATH,
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
  join(
    process.env.LOCALAPPDATA ?? "",
    "Google\\Chrome\\Application\\chrome.exe",
  ),
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
].filter(Boolean);

const CHROME = CAMINHOS_CHROME.find((c) => existsSync(c));
if (!CHROME) {
  console.error(
    "Chrome não encontrado. Aponte o caminho na variável CHROME_PATH.",
  );
  process.exit(2);
}

/**
 * Os três estados do tema, e o de sistema conta como dois.
 *
 * "sistema" não é um visual, é um caminho de código: sem atributo no <html>, o
 * CSS cai na media query e o resultado depende do aparelho. Testar só um lado
 * deixaria metade do caminho sem cobertura.
 */
const CENARIOS = [
  { nome: "claro", pref: "claro", sistemaEscuro: false },
  { nome: "escuro", pref: "escuro", sistemaEscuro: true },
  { nome: "sistema (aparelho escuro)", pref: "sistema", sistemaEscuro: true },
  { nome: "sistema (aparelho claro)", pref: "sistema", sistemaEscuro: false },
];

const perfil = mkdtempSync(join(tmpdir(), "prospecia-contraste-"));
const chrome = spawn(CHROME, [
  "--headless=new",
  `--remote-debugging-port=${PORTA_DEPURACAO}`,
  `--user-data-dir=${perfil}`,
  "--no-first-run",
  "about:blank",
]);

async function enderecoDoNavegador() {
  for (let i = 0; i < 60; i++) {
    try {
      const abas = await (
        await fetch(`http://127.0.0.1:${PORTA_DEPURACAO}/json/list`)
      ).json();
      const pagina = abas.find((a) => a.type === "page");
      if (pagina) return pagina.webSocketDebuggerUrl;
    } catch {
      // O Chrome ainda está subindo. Tenta de novo.
    }
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error("Chrome não respondeu na porta de depuração.");
}

/** Cliente mínimo do protocolo de depuração, só com o que este script usa. */
function conectar(url) {
  const ws = new WebSocket(url);
  let proximoId = 0;
  const pendentes = new Map();
  const ouvintes = new Map();

  ws.addEventListener("message", (evento) => {
    const msg = JSON.parse(evento.data);
    if (msg.id && pendentes.has(msg.id)) {
      const { ok, erro } = pendentes.get(msg.id);
      pendentes.delete(msg.id);
      msg.error ? erro(new Error(JSON.stringify(msg.error))) : ok(msg.result);
    } else if (msg.method) {
      ouvintes.get(msg.method)?.forEach((fn) => fn(msg.params));
    }
  });

  return {
    aberto: new Promise((r) => ws.addEventListener("open", r)),
    enviar: (metodo, params = {}) =>
      new Promise((ok, erro) => {
        const id = ++proximoId;
        pendentes.set(id, { ok, erro });
        ws.send(JSON.stringify({ id, method: metodo, params }));
      }),
    aoEvento: (nome, fn) =>
      ouvintes.set(nome, [...(ouvintes.get(nome) ?? []), fn]),
    fechar: () => ws.close(),
  };
}

/**
 * Roda dentro da página. Precisa ser string porque atravessa o protocolo.
 *
 * O limiar segue a WCAG AA: 4.5 para texto normal e 3 para texto grande, sendo
 * grande a partir de 24px, ou 18.66px quando negrito.
 */
const VARREDURA = `(() => {
  const parse = c => { const m = (c || '').match(/[\\d.]+/g);
    return m ? { r: +m[0], g: +m[1], b: +m[2], a: m.length > 3 ? +m[3] : 1 } : null; };

  const sobre = (frente, fundo) => ({
    r: frente.r * frente.a + fundo.r * (1 - frente.a),
    g: frente.g * frente.a + fundo.g * (1 - frente.a),
    b: frente.b * frente.a + fundo.b * (1 - frente.a),
    a: 1,
  });

  const luminancia = c => { const f = v => { v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b); };

  const razao = (a, b) => { const L1 = luminancia(a), L2 = luminancia(b);
    return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05); };

  // Sobe a árvore empilhando fundos translúcidos até achar um opaco. É este
  // pedaço que os verificadores de par de cores não fazem.
  function fundoEfetivo(el) {
    let acumulado = null;
    let no = el;
    while (no && no !== document.documentElement.parentNode) {
      const cor = parse(getComputedStyle(no).backgroundColor);
      if (cor && cor.a > 0) acumulado = acumulado ? sobre(acumulado, cor) : cor;
      if (acumulado && acumulado.a >= 1) return acumulado;
      no = no.parentElement;
    }
    const base = parse(getComputedStyle(document.body).backgroundColor)
      || { r: 255, g: 255, b: 255, a: 1 };
    return acumulado ? sobre(acumulado, base) : base;
  }

  const achados = [];
  for (const el of document.querySelectorAll('h1,h2,h3,p,li,dt,dd,span,a,summary,strong')) {
    // Só o texto que é filho direto: senão o mesmo trecho seria medido
    // duas vezes, uma no pai e outra no filho, com fundos diferentes.
    const texto = [...el.childNodes]
      .filter(n => n.nodeType === 3)
      .map(n => n.textContent.trim())
      .join(' ')
      .trim();
    if (!texto) continue;

    const estilo = getComputedStyle(el);
    if (estilo.visibility === 'hidden' || estilo.display === 'none') continue;
    if (!el.offsetParent && estilo.position !== 'fixed') continue;

    const frente = parse(estilo.color);
    if (!frente) continue;

    const fundo = fundoEfetivo(el);
    const px = parseFloat(estilo.fontSize);
    const peso = parseInt(estilo.fontWeight, 10) || 400;
    const grande = px >= 24 || (px >= 18.66 && peso >= 700);
    const minimo = grande ? 3 : 4.5;
    const medido = razao(frente.a < 1 ? sobre(frente, fundo) : frente, fundo);

    achados.push({
      texto: texto.slice(0, 42),
      px,
      razao: +medido.toFixed(2),
      minimo,
      passa: medido >= minimo,
    });
  }
  return JSON.stringify(achados);
})()`;

const cdp = conectar(await enderecoDoNavegador());
await cdp.aberto;
await cdp.enviar("Page.enable");
await cdp.enviar("Runtime.enable");

let reprovou = false;

for (const cenario of CENARIOS) {
  await cdp.enviar("Emulation.setDeviceMetricsOverride", {
    width: 390,
    height: 844,
    deviceScaleFactor: 2,
    mobile: true,
  });
  await cdp.enviar("Emulation.setEmulatedMedia", {
    features: [
      {
        name: "prefers-color-scheme",
        value: cenario.sistemaEscuro ? "dark" : "light",
      },
    ],
  });
  // Grava a preferência antes de qualquer script da página rodar, para o
  // script inline do <head> já encontrá-la na primeira pintura.
  await cdp.enviar("Page.addScriptToEvaluateOnNewDocument", {
    source: `try{localStorage.setItem('prospecia:tema','${cenario.pref}')}catch(e){}`,
  });

  const carregou = new Promise((r) => cdp.aoEvento("Page.loadEventFired", r));
  await cdp.enviar("Page.navigate", { url: ALVO });
  await carregou;
  await new Promise((r) => setTimeout(r, 700)); // as fontes assentarem

  const resposta = await cdp.enviar("Runtime.evaluate", {
    expression: VARREDURA,
    returnByValue: true,
  });
  const achados = JSON.parse(resposta.result.value);
  const falhas = achados.filter((a) => !a.passa);
  const pior = achados.reduce((a, b) => (a.razao < b.razao ? a : b));

  console.log(
    `${cenario.nome}: ${achados.length} textos, ${falhas.length} reprovados | ` +
      `pior ${pior.razao} (${pior.px}px) "${pior.texto}"`,
  );
  for (const f of falhas) {
    reprovou = true;
    console.log(`   REPROVA ${f.razao} < ${f.minimo} | ${f.px}px | "${f.texto}"`);
  }
}

cdp.fechar();
chrome.kill();
process.exit(reprovou ? 1 : 0);
