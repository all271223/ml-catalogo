import ClientCatalog from "../components/ClientCatalog";
import CartBar from "../components/CartBar";

export default function Page() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Barra de carrito (sticky) */}
      <CartBar />

      {/* Contenido principal */}
      <section className="mx-auto w-full max-w-7xl px-4 py-6">
        <ClientCatalog />
      </section>
    </main>
  );
}
