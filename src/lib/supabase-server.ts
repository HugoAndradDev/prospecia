import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

/**
 * Cliente para Server Components e Route Handlers, no contexto do usuário
 * logado. Assim como o do navegador, respeita RLS — o que ele enxerga é
 * exatamente o que o cliente dono da sessão pode enxergar.
 *
 * Para operações administrativas (importar leads, criar cliente) use
 * getSupabaseAdmin(), que passa por cima do RLS.
 */
export async function getSupabaseServer() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            for (const { name, value, options } of cookiesToSet) {
              cookieStore.set(name, value, options);
            }
          } catch {
            // Server Components não podem gravar cookies. Quem renova a
            // sessão é o proxy.ts, então ignorar aqui é seguro.
          }
        },
      },
    }
  );
}

/** Sessão do usuário logado, ou null. */
export async function getUsuarioAtual() {
  const supabase = await getSupabaseServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
