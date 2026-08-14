"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Cliente do navegador. Usa a chave pública (anon), então TODA a proteção
 * de dados vem do Row Level Security configurado no Supabase — nunca deste
 * código. Ver supabase/migracao-v2.sql, parte 4.
 */
export function getSupabaseBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
