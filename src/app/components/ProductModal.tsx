// src/app/components/ProductModal.tsx
"use client";

import { useMemo, useState } from "react";
import { useCart } from "./CartContext";
import { imagePublicUrls } from "../lib/images";

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

export default function ProductModal({
  p,
  onClose,
}: {
  p?: Product | null;
  onClose: () => void;
}) {
  const { addItem } = useCart();
  const [qty, setQty] = useState<number>(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = useMemo(() => {
    if (!p) return [];
    return imagePublicUrls(p.image_url ?? null);
  }, [p]);

  if (!p) return null;

  const canAdd = p.stock > 0 && qty > 0 && qty <= p.stock;
  const hasDiscount = p.original_price && p.original_price > (p.price || 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-5xl rounded-2xl bg-white shadow-2xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-6 py-4 shrink-0">
          <h2 className="text-xl font-semibold text-gray-900 pr-4">{p.name}</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition shrink-0"
            aria-label="Cerrar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6 overflow-hidden flex-1">
          {/* Columna izquierda - Galería + Precio (FIJA) */}
          <div className="flex flex-col gap-4">
            {/* Imagen principal */}
            <div className="relative rounded-xl bg-gray-50 p-4 flex items-center justify-center" style={{ height: '500px' }}>
              <img
                src={images[currentImageIndex]}
                alt={`${p.name} - Imagen ${currentImageIndex + 1}`}
                className="max-h-full max-w-full rounded-lg object-contain"
              />
              
              {/* Badge de descuento */}
              {hasDiscount && p.discount_percent && (
                <div className="absolute top-6 right-6">
                  <span className="inline-flex items-center rounded-full bg-red-600 px-4 py-2 text-sm font-bold text-white shadow-lg">
                    -{p.discount_percent}% OFF
                  </span>
                </div>
              )}

              {/* Navegación de imágenes */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setCurrentImageIndex((prev) =>
                        prev === 0 ? images.length - 1 : prev - 1
                      )
                    }
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white rounded-full p-3 shadow-lg transition"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() =>
                      setCurrentImageIndex((prev) =>
                        prev === images.length - 1 ? 0 : prev + 1
                      )
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white rounded-full p-3 shadow-lg transition"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}

              {/* Indicador */}
              {images.length > 1 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full font-medium">
                  {currentImageIndex + 1} / {images.length}
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="grid grid-cols-6 gap-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition ${
                      idx === currentImageIndex
                        ? "border-blue-500 ring-2 ring-blue-200"
                        : "border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Miniatura ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* PRECIO - ABAJO DE LA IMAGEN, FIJO */}
            <div className="bg-white rounded-xl border-2 border-gray-200 p-5">
              {hasDiscount ? (
                <div>
                  <div className="text-sm text-gray-400 line-through mb-1">
                    ${Intl.NumberFormat("es-CL").format(Number(p.original_price))}
                  </div>
                  <div className="text-2xl font-bold text-red-600">
                    ${Intl.NumberFormat("es-CL").format(Number(p.price) || 0)}
                  </div>
                  <div className="text-sm text-green-600 font-semibold">
                    Ahorras ${Intl.NumberFormat("es-CL").format(
                      Number(p.original_price) - Number(p.price)
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-3xl font-bold text-gray-900">
                  ${Intl.NumberFormat("es-CL").format(Number(p.price) || 0)}
                </div>
              )}
            </div>
          </div>

          {/* Columna derecha - Info (CON SCROLL) */}
          <div className="flex flex-col overflow-y-auto pr-2" style={{ maxHeight: 'calc(85vh - 120px)' }}>
            <div className="space-y-5">
              {/* Marca y Stock en la misma línea */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                {p.brand && (
                  <div className="text-base font-semibold text-gray-700">
                    Marca: {p.brand}
                  </div>
                )}
                <span
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${
                    p.stock > 0
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  Stock: {p.stock}
                </span>
              </div>

              {/* Descripción */}
              {p.description && (
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-3">
                    Descripción del producto
                  </h3>
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                      {p.description}
                    </p>
                  </div>
                </div>
              )}

              {/* Acciones */}
              <div className="space-y-4 pt-4 sticky bottom-0 bg-white pb-2">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700">Cantidad:</label>
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
                      className="w-20 rounded-lg border-2 border-gray-300 px-3 py-2.5 text-sm text-center font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                    />
                  </div>

                  <button
                    onClick={() => {
                      if (canAdd) {
                        addItem(p, qty);
                        onClose();
                      }
                    }}
                    disabled={!canAdd}
                    className={`flex-1 rounded-lg px-6 py-3.5 text-base font-semibold transition-all ${
                      canAdd
                        ? "bg-green-600 text-white hover:bg-green-700 active:scale-95 shadow-lg hover:shadow-xl"
                        : "cursor-not-allowed bg-gray-300 text-gray-500"
                    }`}
                  >
                    {canAdd ? "Agregar al carrito" : "Sin stock"}
                  </button>
                </div>

                <p className="text-center text-xs text-gray-500 pt-2">
                  Finaliza tu pedido desde el carrito por WhatsApp
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}