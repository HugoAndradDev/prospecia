"use client";

import { useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase-browser";

export function BotaoSair() {
  const router = useRouter();

  async function sair() {
    await getSupabaseBrowser().auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      onClick={sair}
      className="rounded-lg border border-borda px-3 py-1.5 text-[13px] text-texto-suave hover:border-borda-forte hover:text-texto focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-marca"
    >
      Sair
    </button>
  );
}
