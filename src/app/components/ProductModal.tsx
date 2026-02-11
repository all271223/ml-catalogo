// src/app/components/ProductModal.tsx
"use client";

import { useMemo, useState, useEffect } from "react";
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
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  const images = useMemo(() => {
    if (!p) return [];
    return imagePublicUrls(p.image_url ?? null);
  }, [p]);

  // Reset de estados cuando cambia el producto
  useEffect(() => {
    setQty(1);
    setCurrentImageIndex(0);
    setZoomedImage(null);
  }, [p?.id]);

  if (!p) return null;

  const safeImages = images.length > 0 ? images : ["/placeholder.png"]; // opcional
  const safeIndex = Math.min(Math.max(currentImageIndex, 0), safeImages.length - 1);

  const canAdd = p.stock > 0 && qty > 0 && qty <= p.stock;
  const hasDiscount = !!(p.original_price && p.original_price > (p.price || 0));
  const savings = hasDiscount ? (p.original_price || 0) - (p.price || 0) : 0;

  const fmtCLP = (n: number) => Intl.NumberFormat("es-CL").format(Math.round(n));

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
            type="button"
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
            <div
              className="relative rounded-xl bg-white p-4 flex items-center justify-center"
              style={{ height: "420px" }}
            >
              <img
                src={safeImages[safeIndex]}
                alt={`${p.name} - Imagen ${safeIndex + 1}`}
                className="max-h-full max-w-full rounded-lg object-contain cursor-pointer hover:opacity-90 transition"
                onClick={() => setZoomedImage(safeImages[safeIndex])}
              />

              {/* Badge de descuento */}
              {hasDiscount && p.discount_percent ? (
                <div className="absolute top-6 right-6">
                  <span className="inline-flex items-center rounded-full bg-[#2A9D8F] px-4 py-2 text-sm font-bold text-white shadow-lg">
                    -{p.discount_percent}% OFF
                  </span>
                </div>
              ) : null}

              {/* Navegación de imágenes */}
              {safeImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentImageIndex((prev) => (prev === 0 ? safeImages.length - 1 : prev - 1))
                    }
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white rounded-full p-3 shadow-lg transition"
                    aria-label="Imagen anterior"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setCurrentImageIndex((prev) => (prev === safeImages.length - 1 ? 0 : prev + 1))
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white rounded-full p-3 shadow-lg transition"
                    aria-label="Imagen siguiente"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}

              {/* Indicador */}
              {safeImages.length > 1 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-3 py-1.5 rounded-full font-medium">
                  {safeIndex + 1} / {safeImages.length}
                </div>
              )}
            </div>

            {/* Thumbnails */}
            {safeImages.length > 1 && (
              <div className="grid grid-cols-6 gap-2">
                {safeImages.map((img, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition ${
                      idx === safeIndex
                        ? "border-blue-500 ring-2 ring-blue-200"
                        : "border-gray-200 hover:border-gray-400"
                    }`}
                    aria-label={`Ver imagen ${idx + 1}`}
                  >
                    <img src={img} alt={`Miniatura ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* PRECIO */}
            <div className="bg-white rounded-xl border-2 border-gray-200 p-5">
              {hasDiscount ? (
                <div className="space-y-1">
                  <div className="text-sm text-gray-500">
                    Precio original: <span className="line-through">${fmtCLP(Number(p.original_price || 0))}</span>
                  </div>

                  <div className="text-xl font-bold text-gray-900">
                    Oferta ml-catalogo: ${fmtCLP(Number(p.price || 0))}
                  </div>

                  <div className="text-sm font-semibold text-[#2A9D8F]">Ahorras ${fmtCLP(savings)}</div>
                </div>
              ) : (
                <div>
                  <div className="text-sm text-gray-500 mb-1">Precio</div>
                  <div className="text-xl font-bold text-gray-900">${fmtCLP(Number(p.price || 0))}</div>
                </div>
              )}
            </div>
          </div>

          {/* Columna derecha - Info (CON SCROLL) */}
          <div className="flex flex-col overflow-y-auto pr-2" style={{ maxHeight: "calc(85vh - 120px)" }}>
            <div className="space-y-5">
              {/* Marca y Stock */}
              <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                {p.brand ? <div className="text-base font-semibold text-gray-700">Marca: {p.brand}</div> : <div />}

                <span
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${
                    p.stock > 0 ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"
                  }`}
                >
                  Stock: {p.stock}
                </span>
              </div>

              {/* Descripción */}
              {p.description ? (
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-3">Descripción del producto</h3>
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">{p.description}</p>
                  </div>
                </div>
              ) : null}

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
                        setQty(Math.min(Math.max(1, Number(e.target.value) || 1), p.stock))
                      }
                      className="w-20 rounded-lg border-2 border-gray-300 px-3 py-2.5 text-sm text-center font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (canAdd) {
                        addItem(p, qty);
                        onClose();
                      }
                    }}
                    disabled={!canAdd}
                    className={`flex-1 rounded-lg px-6 py-3.5 text-base font-semibold transition-all ${
                      canAdd
                        ? "bg-gray-900 text-white hover:bg-black active:scale-95 shadow-lg hover:shadow-xl"
                        : "cursor-not-allowed bg-gray-300 text-gray-500"
                    }`}
                  >
                    {canAdd ? "Agregar al carrito" : "Sin stock"}
                  </button>
                </div>

                <p className="text-center text-xs text-gray-500 pt-2">Finaliza tu pedido desde el carrito por WhatsApp</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de zoom con navegación */}
      {zoomedImage && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4"
          onClick={() => setZoomedImage(null)}
        >
          {/* Botón cerrar */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setZoomedImage(null);
            }}
            className="absolute top-4 right-4 text-white text-4xl hover:text-gray-300 transition z-10"
            aria-label="Cerrar zoom"
          >
            ✕
          </button>

          {/* Imagen */}
          <img
            src={zoomedImage}
            alt="Zoom"
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Navegación */}
          {safeImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  const newIndex = safeIndex === 0 ? safeImages.length - 1 : safeIndex - 1;
                  setCurrentImageIndex(newIndex);
                  setZoomedImage(safeImages[newIndex]);
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-4 shadow-2xl transition z-10"
                aria-label="Imagen anterior"
              >
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  const newIndex = safeIndex === safeImages.length - 1 ? 0 : safeIndex + 1;
                  setCurrentImageIndex(newIndex);
                  setZoomedImage(safeImages[newIndex]);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-4 shadow-2xl transition z-10"
                aria-label="Imagen siguiente"
              >
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <div className="absolute bottom-20 left-1/2 -translate-x-1/2 bg-black/60 text-white text-sm px-4 py-2 rounded-full font-medium">
                {safeIndex + 1} / {safeImages.length}
              </div>
            </>
          )}

          <p className="absolute bottom-4 text-white text-sm text-center">
            {safeImages.length > 1 ? (
              <>Usa las flechas para navegar • Click fuera para cerrar</>
            ) : (
              <>Click fuera de la imagen para cerrar</>
            )}
          </p>
        </div>
      )}
    </div>
  );
}
