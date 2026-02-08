// src/app/components/ProductCard.tsx
"use client";

import { useCart } from "./CartContext";
import { imagePublicUrl } from "../lib/images";

type Product = {
  id: string;
  name: string;
  price: number | null;
  stock: number;
  image_url?: string | null;
  brand?: string | null;
  store?: string | null;
  sku?: string | null;
  barcode?: string | null;
};

export default function ProductCard({ p }: { p: Product }) {
  const { addItem } = useCart();
  const src = imagePublicUrl(p.image_url);
  const canAdd = p.stock > 0;

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md">
      {/* Imagen */}
      <div className="relative aspect-square w-full overflow-hidden bg-gray-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={p.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
        />

        {/* Badge único (más pro) */}
        <div className="absolute bottom-3 left-3">
          {p.stock <= 0 ? (
            <span className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-gray-600 shadow-sm ring-1 ring-black/5 backdrop-blur">
              Sin stock
            </span>
          ) : p.stock <= 3 ? (
            <span className="rounded-full bg-amber-100/90 px-3 py-1 text-[11px] font-semibold text-amber-900 shadow-sm ring-1 ring-black/5 backdrop-blur">
              Últimas {p.stock} unidades
            </span>
          ) : (
            <span className="rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold text-emerald-700 shadow-sm ring-1 ring-black/5 backdrop-blur">
              En stock
            </span>
          )}
        </div>
      </div>

      {/* Contenido */}
      <div className="p-4">
        {/* Marca */}
        {p.brand ? (
          <div className="text-xs font-medium text-gray-500">{p.brand}</div>
        ) : (
          <div className="h-4" />
        )}

        {/* Nombre */}
        <h3 className="mt-1 line-clamp-2 text-sm font-semibold text-gray-900">
          {p.name}
        </h3>

        {/* Tienda */}
        {p.store ? (
          <div className="mt-1 text-xs text-gray-500">Tienda: {p.store}</div>
        ) : (
          <div className="h-4" />
        )}

        {/* Precio + CTA */}
        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[11px] font-medium text-gray-500">Precio</div>
            <div className="truncate text-lg font-semibold text-gray-900">
              ${Intl.NumberFormat("es-CL").format(Number(p.price) || 0)}
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              addItem(p);
            }}
            disabled={!canAdd}
            className={`shrink-0 rounded-xl px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              canAdd
                ? "bg-gray-900 text-white hover:bg-black focus:ring-gray-900"
                : "cursor-not-allowed bg-gray-200 text-gray-500"
            }`}
          >
            Agregar
          </button>
        </div>

        {/* Microcopy */}
        <p className="mt-3 text-center text-xs text-gray-500">
          Finaliza por WhatsApp desde el carrito.
        </p>
      </div>
    </article>
  );
}
