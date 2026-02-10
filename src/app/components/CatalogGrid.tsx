// src/app/components/CatalogGrid.tsx
"use client";

import { useState } from "react";
import ProductCard from "./ProductCard";
import ProductModal from "./ProductModal";

type Product = {
  id: string;
  name: string;
  price: number | null;
  original_price?: number | null;
  discount_percent?: number | null;
  stock: number;
  image_url?: string | string[] | null;
  brand?: string | null;
  store?: string | null;
  description?: string | null;
  sku?: string | null;
  barcode?: string | null;
};

export default function CatalogGrid({ products }: { products: Product[] }) {
  const [selected, setSelected] = useState<Product | null>(null);

  return (
    <>
      {/* Marco del catálogo (mejor jerarquía + aire) */}
      <section className="mx-auto max-w-6xl px-4 py-6">
        <header className="mb-4 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-xl font-semibold text-gray-900">
              Catálogo de productos
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Agrega al carrito y finaliza tu pedido por WhatsApp.
            </p>
          </div>

          <div className="shrink-0 text-sm text-gray-500">
            {products.length} productos
          </div>
        </header>

        {/* GRID */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((p) => (
            <div key={p.id}>
              <ProductCard p={p} onOpenModal={() => setSelected(p)} />
            </div>
          ))}
        </div>
      </section>

      {/* MODAL */}
      {selected && (
        <ProductModal p={selected} onClose={() => setSelected(null)} />
      )}
    </>
  );
}