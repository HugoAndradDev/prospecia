/**
 * Lighthouse mobile da landing, três vezes, no build de produção.
 *
 * POR QUE TRÊS VEZES, E NUMA PORTA SÓ DELE
 *
 * Duas medições já enganaram este projeto. Na Fase 2, um servidor antigo
 * ocupava a porta e servia CSS quebrado: a nota veio 99, e era falsa. Na
 * rodada de acabamento, o `next dev` rodando em paralelo disputou CPU e a nota
 * veio 95, também falsa (as três medições limpas deram 97, 97, 98).
 *
 * Daí as duas regras que este script existe para forçar: porta separada da de
 * desenvolvimento, e três rodadas em vez de uma. Uma medição só não distingue
 * regressão de ruído de máquina. Das três, vale a mediana (ver o motivo lá
 * embaixo, onde o resultado é apurado).
 *
 * COMO RODAR
 *
 *   npm run build
 *   npx next start -p 3100        (em outro terminal, e com o `next dev` FORA)
 *   node scripts/medir-landing.mjs [url]
 *
 * Usa o Lighthouse via npx, sem entrar como dependência do projeto.
 *
 * O piso combinado é 97 de performance e 100 nas outras três. Sai com código 1
 * se cair, para poder travar uma rodada futura.
 */
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const ALVO = process.argv[2] ?? "http://localhost:3100/";
const RODADAS = 3;
const PISO = { performance: 97, accessibility: 100, "best-practices": 100, seo: 100 };

const pasta = mkdtempSync(join(tmpdir(), "prospecia-lighthouse-"));
const resultados = [];

for (let i = 1; i <= RODADAS; i++) {
  const saida = join(pasta, `rodada-${i}.json`);
  const proc = spawnSync(
    "npx",
    [
      "lighthouse",
      ALVO,
      "--only-categories=performance,accessibility,best-practices,seo",
      "--form-factor=mobile",
      "--screenEmulation.mobile",
      "--quiet",
      "--chrome-flags=--headless=new --no-sandbox",
      "--output=json",
      `--output-path=${saida}`,
    ],
    { shell: true, stdio: "ignore" },
  );

  if (proc.status !== 0) {
    console.error(`Rodada ${i} falhou. O servidor está no ar em ${ALVO}?`);
    process.exit(2);
  }

  const relatorio = JSON.parse(readFileSync(saida, "utf8"));
  const notas = Object.fromEntries(
    Object.entries(relatorio.categories).map(([k, v]) => [
      k,
      Math.round(v.score * 100),
    ]),
  );
  const lcp = relatorio.audits["largest-contentful-paint"].displayValue;
  const cls = relatorio.audits["cumulative-layout-shift"].displayValue;

  resultados.push(notas);
  console.log(
    `rodada ${i}: ` +
      Object.entries(notas)
        .map(([k, v]) => `${k} ${v}`)
        .join(" | ") +
      ` | LCP ${lcp} | CLS ${cls}`,
  );
}

/*
 * A MEDIANA é que vale, não a pior das três.
 *
 * A primeira versão deste script usava a pior, por parecer o critério mais
 * conservador. Foi reprovado no próprio teste: sem nenhuma mudança na página,
 * três rodadas deram 89, 95 e 97 só porque a máquina estava ocupada. O
 * critério "pior das três" transforma qualquer ruído em alarme, e alarme que
 * dispara à toa acaba ignorado, que é o pior dos mundos numa checagem.
 *
 * Mediana é o que o próprio Lighthouse recomenda para rodadas repetidas. A
 * dispersão vai impressa junto: se as pontas estiverem longe, o número não é
 * confiável e a medição deve ser refeita com a máquina em paz.
 */
const mediana = (nums) => [...nums].sort((a, b) => a - b)[Math.floor(nums.length / 2)];

console.log("\nmediana das três rodadas:");
let caiu = false;
for (const [categoria, minimo] of Object.entries(PISO)) {
  const notas = resultados.map((r) => r[categoria]);
  const meio = mediana(notas);
  const dispersao = Math.max(...notas) - Math.min(...notas);
  const situacao = meio >= minimo ? "ok" : `ABAIXO DO PISO (${minimo})`;
  if (meio < minimo) caiu = true;
  console.log(
    `  ${categoria}: ${meio} ${situacao}` +
      (dispersao >= 5 ? `  [dispersão de ${dispersao} pontos, medição suja]` : ""),
  );
}

if (caiu) {
  console.log(
    "\nAntes de tratar como regressão: o `next dev` está desligado? " +
      "A porta é só deste servidor? Alguma outra coisa pesada rodando?",
  );
}

process.exit(caiu ? 1 : 0);
