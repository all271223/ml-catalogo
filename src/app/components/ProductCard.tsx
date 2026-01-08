// src/app/components/ProductCard.tsx
"use client";

import { useCart } from "./CartContext";
import { imagePublicUrl } from "../lib/images";

type Product = {
  id: string;
  name: string;
  price: number | null;
  stock: number;
  image_url?: string | null; // alias de image_path en la query
  brand?: string | null;
  store?: string | null;
  sku?: string | null;
  barcode?: string | null;
};

export default function ProductCard({ p }: { p: Product }) {
  const { addItem } = useCart();
  const src = imagePublicUrl(p.image_url);

  return (
    <article className="group rounded-2xl border bg-white p-3 shadow-sm transition hover:shadow-md">
      {/* Imagen */}
      <div className="aspect-square w-full overflow-hidden rounded-xl bg-gray-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={p.name}
          className="h-full w-full object-cover transition group-hover:scale-[1.02]"
        />
      </div>

      {/* Texto */}
      <div className="mt-3 space-y-1">
        {p.brand && (
          <div className="text-xs font-medium text-gray-500">{p.brand}</div>
        )}

        <h3 className="line-clamp-2 text-sm font-semibold text-gray-800">
          {p.name}
        </h3>

        {p.store && (
          <div className="text-xs text-gray-500">Tienda: {p.store}</div>
        )}

        <div className="mt-1 flex items-center justify-between">
          <span className="text-lg font-semibold">
            ${Intl.NumberFormat("es-CL").format(Number(p.price) || 0)}
          </span>

          <span
            className={`rounded-full px-2 py-0.5 text-xs ${
              p.stock > 0
                ? "bg-emerald-50 text-emerald-700"
                : "bg-gray-100 text-gray-500"
            }`}
            title="Existencias"
          >
            Stock: {p.stock}
          </span>
        </div>

        {/* Botón agregar al carrito */}
        <button
          onClick={(e) => {
            e.stopPropagation(); // 👈 evita abrir el modal
            addItem(p);
          }}
          disabled={p.stock <= 0}
          className={`mt-2 w-full rounded-md px-3 py-2 text-sm font-medium transition ${
            p.stock > 0
              ? "bg-green-600 text-white hover:bg-green-700"
              : "bg-gray-300 text-gray-600 cursor-not-allowed"
          }`}
        >
          {p.stock > 0 ? "Agregar al carrito" : "Sin stock"}
        </button>
      </div>
    </article>
  );
}
