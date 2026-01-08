// src/app/components/CatalogGrid.tsx
"use client";

import { useState } from "react";
import ProductCard from "./ProductCard";
import ProductModal from "./ProductModal";

type Product = {
  id: string;
  name: string;
  price: number | null;
  stock: number;
  image_url?: string | null; // alias de image_path
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
      {/* GRID */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {products.map((p) => (
          <div
            key={p.id}
            className="text-left"
            onClick={() => setSelected(p)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") setSelected(p);
            }}
            role="button"
            tabIndex={0}
            aria-label={`Ver detalles de ${p.name}`}
          >
            <ProductCard p={p} />
          </div>
        ))}
      </div>

      {/* MODAL */}
      {selected && (
        <ProductModal
          p={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}
