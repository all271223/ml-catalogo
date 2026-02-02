// src/app/components/ProductCard.tsx
"use client";

import { useCart } from "./CartContext";
import { imagePublicUrl } from "../lib/images";
import { buildWhatsAppMessage } from "./wa";

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

function onlyDigits(s: string) {
  return (s || "").replace(/\D/g, "");
}

export default function ProductCard({ p }: { p: Product }) {
  const { addItem } = useCart();
  const src = imagePublicUrl(p.image_url);
  const phone = onlyDigits(process.env.NEXT_PUBLIC_WHATSAPP_PHONE || "");

  function buyNow() {
    addItem(p);

    if (!phone) {
      alert("Configura NEXT_PUBLIC_WHATSAPP_PHONE para enviar por WhatsApp.");
      return;
    }

    const price = Number(p.price) || 0;

    // ✅ price siempre number
    // ✅ NO mandamos id porque WAItem no lo tiene
    const url = buildWhatsAppMessage([{ name: p.name, price, qty: 1 }], price);

    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <article className="group rounded-2xl border border-gray-200 bg-white p-3 shadow-sm transition hover:-translate-y-[1px] hover:shadow-md focus-within:ring-2 focus-within:ring-gray-300">
      {/* Imagen */}
      <div className="aspect-square w-full overflow-hidden rounded-xl bg-gray-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={p.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
        />
      </div>

      {/* Texto */}
      <div className="mt-3 space-y-1">
        {p.brand && (
          <div className="text-xs font-medium text-gray-500">{p.brand}</div>
        )}

        <h3 className="line-clamp-2 text-sm font-semibold text-gray-900">
          {p.name}
        </h3>

        {p.store && (
          <div className="text-xs text-gray-500">Tienda: {p.store}</div>
        )}

        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="text-base font-semibold text-gray-900">
            ${Intl.NumberFormat("es-CL").format(Number(p.price) || 0)}
          </span>

          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${
              p.stock > 0
                ? "bg-emerald-50 text-emerald-700"
                : "bg-gray-100 text-gray-500"
            }`}
            title="Existencias"
          >
            Stock: {p.stock}
          </span>
        </div>

        {/* Acciones */}
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              addItem(p);
            }}
            disabled={p.stock <= 0}
            className={`w-full rounded-lg px-3 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              p.stock > 0
                ? "bg-green-600 text-white hover:bg-green-700 focus:ring-green-600"
                : "cursor-not-allowed bg-gray-200 text-gray-500"
            }`}
          >
            {p.stock > 0 ? "Agregar" : "Sin stock"}
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              buyNow();
            }}
            disabled={p.stock <= 0}
            className={`w-full rounded-lg px-3 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              p.stock > 0
                ? "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-600"
                : "cursor-not-allowed bg-gray-200 text-gray-500"
            }`}
          >
            Comprar
          </button>
        </div>

        {/* Mensaje de confianza */}
        <p className="mt-2 text-center text-xs text-gray-500">
          Te responderemos por WhatsApp para coordinar pago y despacho.
        </p>
      </div>
    </article>
  );
}
