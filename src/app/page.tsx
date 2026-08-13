export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-950 text-neutral-100 px-4">
      <div className="text-center space-y-2">
        <p className="text-xs font-mono uppercase tracking-wider text-orange-500">ProspecIA</p>
        <p className="text-sm text-neutral-500">
          Acesse seu painel pelo link que você recebeu, ou{" "}
          <a href="/admin" className="text-orange-400 hover:underline">
            entre como admin
          </a>
          .
        </p>
      </div>
    </main>
  );
}
