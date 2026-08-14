import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

/**
 * Renova a sessão a cada navegação e manda quem não está logado para /login.
 *
 * ATENÇÃO: isto é conveniência de navegação, NÃO é a proteção dos dados.
 * A documentação do Next 16 avisa explicitamente para não depender do proxy
 * para autorização. Quem impede um cliente de ler dados de outro é o Row
 * Level Security no Supabase (supabase/migracao-v2.sql, parte 4).
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
          // Impede CDN ou proxy reverso de guardar uma resposta que carrega
          // cookie de sessão — senão a sessão de um usuário pode acabar
          // entregue a outro.
          for (const [chave, valor] of Object.entries(headers)) {
            response.headers.set(chave, valor);
          }
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/app") && !user) {
    const login = new URL("/login", request.url);
    login.searchParams.set("motivo", "sessao");
    return NextResponse.redirect(login);
  }

  if (pathname === "/login" && user) {
    return NextResponse.redirect(new URL("/app", request.url));
  }

  return response;
}

export const config = {
  matcher: ["/app/:path*", "/login"],
};
