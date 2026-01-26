// src/app/components/ProductModal.tsx
"use client";

import { useMemo, useState } from "react";
import { useCart } from "./CartContext";
import { imagePublicUrl } from "../lib/images";
import { buildWhatsAppMessage } from "./wa";

type Product = {
  id: string;
  name: string;
  price: number | null;
  stock: number;
  image_url?: string | null; // alias de image_path en el select
  brand?: string | null;
  store?: string | null;
  description?: string | null;
  sku?: string | null;
  barcode?: string | null;
};

export default function ProductModal({
  p,
  onClose,
}: {
  p?: Product | null;
  onClose: () => void;
}) {
  // ✅ Hooks SIEMPRE antes de cualquier return condicional
  const { addItem } = useCart();
  const [qty, setQty] = useState<number>(1);

  // ✅ Hook también antes del return (usa optional chaining para no romper)
  const total = useMemo(() => (Number(p?.price) || 0) * qty, [p?.price, qty]);

  // ✅ Ahora sí, return condicional
  if (!p) return null;

  const src = imagePublicUrl(p.image_url ?? null);
  const canAdd = p.stock > 0 && qty > 0 && qty <= p.stock;

  const handleBuyNow = () => {
    if (!canAdd) return;

    const items = [
      {
        id: p.id,
        name: p.name,
        price: Number(p.price) || 0,
        qty,
      },
    ];

    const url = buildWhatsAppMessage(items, total);
    window.open(url, "_blank");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-3xl rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="text-lg font-semibold">{p.name}</h2>
          <button
            onClick={onClose}
            className="rounded-full px-3 py-1 text-sm text-gray-600 hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="grid grid-cols-1 gap-5 p-5 md:grid-cols-2">
          {/* Imagen grande */}
          <div className="rounded-xl bg-gray-50 p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={p.name}
              className="h-auto w-full rounded-lg object-contain"
            />
          </div>

          {/* Detalle */}
          <div className="space-y-3">
            {p.brand && (
              <div className="text-sm text-gray-600">Marca: {p.brand}</div>
            )}
            {p.store && (
              <div className="text-sm text-gray-600">Tienda: {p.store}</div>
            )}

            {/* SKU y Barcode */}
            <div className="text-sm">
              <div className="text-gray-500">
                <span className="mr-2">SKU:</span>
                <code className="rounded bg-gray-100 px-1 py-0.5">
                  {p.sku ?? "—"}
                </code>
                <button
                  onClick={() => p.sku && navigator.clipboard.writeText(p.sku)}
                  className="ml-2 text-xs text-blue-600 hover:underline"
                >
                  copiar
                </button>
              </div>

              <div className="mt-1 text-gray-500">
                <span className="mr-2">Barcode:</span>
                <code className="rounded bg-gray-100 px-1 py-0.5">
                  {p.barcode ?? "—"}
                </code>
                <button
                  onClick={() =>
                    p.barcode && navigator.clipboard.writeText(p.barcode)
                  }
                  className="ml-2 text-xs text-blue-600 hover:underline"
                >
                  copiar
                </button>
              </div>
            </div>

            {p.description && (
              <p className="text-sm text-gray-700">{p.description}</p>
            )}

            <div className="flex items-center justify-between">
              <div className="text-2xl font-semibold">
                ${Intl.NumberFormat("es-CL").format(Number(p.price) || 0)}
              </div>

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

            {/* Cantidad + Acciones */}
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min={1}
                  max={p.stock}
                  value={qty}
                  onChange={(e) =>
                    setQty(
                      Math.min(
                        Math.max(1, Number(e.target.value) || 1),
                        p.stock
                      )
                    )
                  }
                  className="w-24 rounded-md border px-2 py-1 text-sm"
                />

                <button
                  onClick={() => canAdd && addItem(p, qty)} // ✅ qty como 2° argumento
                  disabled={!canAdd}
                  className={`rounded-md px-4 py-2 text-sm font-medium ${
                    canAdd
                      ? "bg-green-600 text-white hover:bg-green-700"
                      : "cursor-not-allowed bg-gray-300 text-gray-600"
                  }`}
                >
                  Agregar al carrito
                </button>
              </div>

              <button
                onClick={handleBuyNow}
                disabled={!canAdd}
                className={`w-full rounded-md px-4 py-2 text-sm font-semibold ${
                  canAdd
                    ? "border border-black text-black hover:bg-gray-100"
                    : "cursor-not-allowed bg-gray-200 text-gray-500"
                }`}
              >
                Comprar ahora por WhatsApp
              </button>

              <p className="text-center text-xs text-gray-500">
                Te responderemos por WhatsApp para coordinar pago y despacho.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t px-5 py-3">
          <button
            onClick={onClose}
            className="rounded-md px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
