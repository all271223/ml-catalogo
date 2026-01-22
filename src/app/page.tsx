import ClientCatalog from "./components/ClientCatalog";

export default function Page() {
  return (
    <main className="min-h-screen bg-gray-100">
      <section className="mx-auto w-full max-w-7xl px-4 py-6">
        <ClientCatalog />
      </section>
    </main>
  );
}
