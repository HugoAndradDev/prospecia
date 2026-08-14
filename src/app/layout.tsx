import type { Metadata } from "next";
import { Geist, Geist_Mono, Fraunces } from "next/font/google";
import "./globals.css";
import { SCRIPT_TEMA } from "@/components/tema";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

// Só as telas internas (/app, /admin) usam mono. Sem preload ela não entra no
// caminho crítico da landing, que é a página que precisa carregar rápido.
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

// Só os títulos da landing usam esta. Sem pedir os eixos extras (SOFT/WONK)
// o arquivo variável fica bem menor, e o peso alto já dá o caráter que quero.
const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "ProspecIA",
  description:
    "Negócios locais sem site, com diagnóstico e argumento de venda prontos, entregues pra você prospectar.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
    >
      <head>
        {/* Precisa rodar antes da primeira pintura, senão a tela pisca clara
            antes de virar escura. Por isso vai inline, e não como componente. */}
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_TEMA }} />
      </head>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
