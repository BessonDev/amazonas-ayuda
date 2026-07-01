export default function PublicoPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <main className="flex flex-col items-center gap-8 text-center max-w-2xl">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Donaciones Amazonas
        </h1>
        <p className="text-lg text-muted-foreground">
          Transparencia y trazabilidad en cada donación
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-md">
          <div className="rounded-xl border p-6 text-center">
            <p className="text-3xl font-bold text-primary">0</p>
            <p className="text-sm text-muted-foreground mt-1">Donaciones</p>
          </div>
          <div className="rounded-xl border p-6 text-center">
            <p className="text-3xl font-bold text-primary">0</p>
            <p className="text-sm text-muted-foreground mt-1">Entregados</p>
          </div>
          <div className="rounded-xl border p-6 text-center">
            <p className="text-3xl font-bold text-primary">0</p>
            <p className="text-sm text-muted-foreground mt-1">Viajes</p>
          </div>
          <div className="rounded-xl border p-6 text-center">
            <p className="text-3xl font-bold text-primary">0</p>
            <p className="text-sm text-muted-foreground mt-1">Centros</p>
          </div>
        </div>
      </main>
    </div>
  );
}
