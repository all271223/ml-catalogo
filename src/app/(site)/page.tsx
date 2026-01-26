import ClientCatalog from "../components/ClientCatalog";
import CartBar from "../components/CartBar";

export default function Page() {
  return (
    <main className="min-h-screen bg-gray-100">
      <section className="mx-auto w-full max-w-7xl px-4 py-6">
        <CartBar />
        <ClientCatalog />
      </section>
    </main>
  );
}
