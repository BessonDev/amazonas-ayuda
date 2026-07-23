import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <main className="flex flex-col items-center gap-8 text-center max-w-2xl">
        <Image src="/logo.png" alt="Logo" width={96} height={96} priority />
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          La Red Solidaria
        </h1>
        <p className="text-lg text-muted-foreground">
          Plataforma de gestión logística para donaciones humanitarias
        </p>
        <div className="flex gap-4">
          <Link
            href="/admin"
            className="rounded-lg bg-primary px-6 py-3 text-base font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Portal Administrativo
          </Link>
          <Link
            href="/publico"
            className="rounded-lg border border-input bg-background px-6 py-3 text-base font-semibold hover:bg-accent transition-colors"
          >
            Portal Público
          </Link>
        </div>
      </main>
    </div>
  );
}
