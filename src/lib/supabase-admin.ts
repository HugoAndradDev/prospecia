import "server-only";
import { createClient } from "@supabase/supabase-js";

// Cliente com service role — só pode ser importado por código de servidor
// (API routes, server components). O import "server-only" faz o build falhar
// se algum componente "use client" tentar importar isso por engano.
export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      "Supabase não configurado: defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}
