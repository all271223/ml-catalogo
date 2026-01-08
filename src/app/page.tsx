// src/app/page.tsx
import ClientCatalog from "./components/ClientCatalog";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-6xl p-6">
      <h1 className="mb-4 text-2xl font-bold">Catálogo</h1>
      <ClientCatalog />
    </main>
  );
}
