/**
 * Teste de isolamento entre clientes.
 *
 *   node scripts/teste-isolamento.mjs
 *
 * Cria dois clientes de teste com login próprio, entra como o Cliente A e
 * tenta invadir os dados do Cliente B pela API do Supabase — sem passar pela
 * interface, que é onde uma proteção só de tela seria burlada.
 *
 * Todos os ataques têm que FALHAR. No fim, apaga tudo que criou.
 */

import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(
  readFileSync(".env.local", "utf8")
    .split("\n")
    .filter((l) => l.trim() && !l.trim().startsWith("#"))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    })
);

const URL = env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE = env.SUPABASE_SERVICE_ROLE_KEY;

if (!URL || !ANON || !SERVICE) {
  console.error("Faltam variáveis em .env.local (URL, ANON_KEY, SERVICE_ROLE_KEY).");
  process.exit(1);
}

const admin = createClient(URL, SERVICE, { auth: { persistSession: false } });

const SENHA = `teste-${crypto.randomUUID()}`;
const marca = Date.now();
const criados = { usuarios: [], clientes: [] };

let falhas = 0;

function checar(nome, passou, detalhe) {
  console.log(`${passou ? "  OK  " : " FALHA"} │ ${nome}`);
  if (detalhe) console.log(`       │   ${detalhe}`);
  if (!passou) falhas++;
}

async function criarCliente(nome) {
  const email = `${nome.toLowerCase()}-${marca}@teste-prospecia.local`;

  const { data: u, error: erroUser } = await admin.auth.admin.createUser({
    email,
    password: SENHA,
    email_confirm: true,
  });
  if (erroUser) throw new Error(`criar usuário ${nome}: ${erroUser.message}`);
  criados.usuarios.push(u.user.id);

  const { data: c, error: erroCliente } = await admin
    .from("clientes")
    .insert({
      nome: `ZZ Teste ${nome} ${marca}`,
      slug: `zz-teste-${nome.toLowerCase()}-${marca}`,
      user_id: u.user.id,
    })
    .select()
    .single();
  if (erroCliente) throw new Error(`criar cliente ${nome}: ${erroCliente.message}`);
  criados.clientes.push(c.id);

  const { data: lead, error: erroLead } = await admin
    .from("leads")
    .insert({
      cliente_id: c.id,
      nome_negocio: `Negócio secreto do ${nome}`,
      endereco: `Rua do ${nome}, 100`,
      diagnostico: `Diagnóstico confidencial do ${nome}`,
    })
    .select()
    .single();
  if (erroLead) throw new Error(`criar lead ${nome}: ${erroLead.message}`);

  return { email, cliente: c, lead };
}

async function limpar() {
  await admin.from("clientes").delete().in("id", criados.clientes);
  for (const id of criados.usuarios) await admin.auth.admin.deleteUser(id);
}

try {
  console.log("\nPreparando dois clientes de teste…\n");
  const A = await criarCliente("Alfa");
  const B = await criarCliente("Beta");

  // Entra como o Cliente A usando a MESMA chave pública que vai no navegador.
  const comoA = createClient(URL, ANON, { auth: { persistSession: false } });
  const { error: erroLogin } = await comoA.auth.signInWithPassword({
    email: A.email,
    password: SENHA,
  });
  if (erroLogin) throw new Error(`login do Alfa: ${erroLogin.message}`);

  console.log("Logado como Cliente Alfa. Tentando invadir o Cliente Beta:\n");
  console.log("       ┌─────────────────────────────────────────────────────");

  // 1 — listar tudo
  const todos = await comoA.from("leads").select("*");
  const vazouNaLista = (todos.data ?? []).some((l) => l.cliente_id === B.cliente.id);
  checar(
    "Listar leads devolve apenas os próprios",
    !vazouNaLista && (todos.data ?? []).length === 1,
    `retornou ${(todos.data ?? []).length} lead(s): ${(todos.data ?? []).map((l) => l.nome_negocio).join(", ") || "nenhum"}`
  );

  // 2 — pedir explicitamente os leads do outro
  const doBeta = await comoA.from("leads").select("*").eq("cliente_id", B.cliente.id);
  checar(
    "Pedir cliente_id do Beta na consulta devolve vazio",
    (doBeta.data ?? []).length === 0,
    `retornou ${(doBeta.data ?? []).length} linha(s)`
  );

  // 3 — pedir o lead do outro pelo id exato
  const porId = await comoA.from("leads").select("*").eq("id", B.lead.id);
  checar(
    "Pedir o lead do Beta pelo id exato devolve vazio",
    (porId.data ?? []).length === 0,
    `retornou ${(porId.data ?? []).length} linha(s)`
  );

  // 4 — alterar o lead do outro
  const invasao = await comoA
    .from("leads")
    .update({ status: "convertido" })
    .eq("id", B.lead.id)
    .select();
  const confereB = await admin.from("leads").select("status").eq("id", B.lead.id).single();
  checar(
    "Mover card do Beta não altera nada",
    (invasao.data ?? []).length === 0 && confereB.data.status === "novo",
    `linhas afetadas: ${(invasao.data ?? []).length}; status do Beta segue "${confereB.data.status}"`
  );

  // 5 — ler a conta do outro
  const contas = await comoA.from("clientes").select("*");
  const vazouConta = (contas.data ?? []).some((c) => c.id === B.cliente.id);
  checar(
    "Listar clientes devolve apenas a própria conta",
    !vazouConta && (contas.data ?? []).length === 1,
    `retornou: ${(contas.data ?? []).map((c) => c.nome).join(", ") || "nenhuma"}`
  );

  // 6 — espiar o CRM interno de prospecção
  const crm = await comoA.from("prospects").select("*");
  checar(
    "CRM interno (prospects) fica invisível para o cliente",
    (crm.data ?? []).length === 0,
    crm.error ? `bloqueado: ${crm.error.message}` : "retornou 0 linha(s)"
  );

  // 7 — editar campo que não é status, no PRÓPRIO lead
  const edicaoIndevida = await comoA
    .from("leads")
    .update({ nome_negocio: "ALTERADO PELO CLIENTE" })
    .eq("id", A.lead.id)
    .select();
  const confereA = await admin
    .from("leads")
    .select("nome_negocio")
    .eq("id", A.lead.id)
    .single();
  checar(
    "Cliente não consegue editar nada além do status, nem no lead dele",
    !!edicaoIndevida.error && confereA.data.nome_negocio === A.lead.nome_negocio,
    edicaoIndevida.error
      ? `bloqueado: ${edicaoIndevida.error.message}`
      : "PASSOU — o nome foi alterado!"
  );

  // 8 — mover o próprio card (tem que FUNCIONAR)
  const movimentoLegitimo = await comoA
    .from("leads")
    .update({ status: "contatado" })
    .eq("id", A.lead.id)
    .select();
  checar(
    "Mover o PRÓPRIO card continua funcionando",
    (movimentoLegitimo.data ?? []).length === 1 &&
      movimentoLegitimo.data[0].status === "contatado",
    `status agora: ${movimentoLegitimo.data?.[0]?.status ?? "não mudou"}`
  );

  // 9 — visitante sem login
  const semLogin = createClient(URL, ANON, { auth: { persistSession: false } });
  const anonimo = await semLogin.from("leads").select("*");
  checar(
    "Visitante sem login não lê lead nenhum",
    (anonimo.data ?? []).length === 0,
    anonimo.error ? `bloqueado: ${anonimo.error.message}` : "retornou 0 linha(s)"
  );

  console.log("       └─────────────────────────────────────────────────────\n");
} catch (e) {
  console.error("\nErro durante o teste:", e.message, "\n");
  falhas++;
} finally {
  await limpar();
  console.log("Dados de teste removidos.\n");
}

console.log(
  falhas === 0
    ? "RESULTADO: isolamento confirmado — nenhum ataque passou.\n"
    : `RESULTADO: ${falhas} verificação(ões) falharam. NÃO publicar assim.\n`
);
process.exit(falhas === 0 ? 0 : 1);
