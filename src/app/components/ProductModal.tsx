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
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  const images = useMemo(() => {
    if (!p) return [];
    return imagePublicUrls(p.image_url ?? null);
  }, [p]);

  if (!p) return null;

  const canAdd = p.stock > 0 && qty > 0 && qty <= p.stock;
  const hasDiscount = p.original_price && p.original_price > (p.price || 0);
  const savings = hasDiscount ? (p.original_price || 0) - (p.price || 0) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 sm:p-4">
      <div className="w-full max-w-5xl rounded-2xl bg-white shadow-2xl max-h-[95vh] sm:max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 sm:px-6 py-3 sm:py-4 shrink-0">
          <h2 className="text-base sm:text-xl font-semibold text-gray-900 pr-4 line-clamp-2">
            {p.name}
          </h2>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 p-4 sm:p-6 overflow-y-auto flex-1">
          {/* Columna izquierda - Galería + Precio */}
          <div className="flex flex-col gap-3 sm:gap-4">
            {/* Imagen principal - OPTIMIZADA MÓVIL */}
            <div className="relative rounded-xl bg-white flex items-center justify-center" style={{ minHeight: '280px', maxHeight: '500px' }}>
              <img
                src={images[currentImageIndex]}
                alt={`${p.name} - Imagen ${currentImageIndex + 1}`}
                className="w-full h-full rounded-lg object-contain cursor-pointer hover:opacity-90 transition"
                style={{ maxHeight: '500px' }}
                onClick={() => setZoomedImage(images[currentImageIndex])}
              />
              
              {/* Badge de descuento */}
              {hasDiscount && p.discount_percent && (
                <div className="absolute top-3 right-3">
                  <span className="inline-flex items-center rounded-full bg-[#2A9D8F] px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-white shadow-lg">
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
                    className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white rounded-full p-2 sm:p-3 shadow-lg transition"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={() =>
                      setCurrentImageIndex((prev) =>
                        prev === images.length - 1 ? 0 : prev + 1
                      )
                    }
                    className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white rounded-full p-2 sm:p-3 shadow-lg transition"
                  >
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}

              {/* Indicador */}
              {images.length > 1 && (
                <div className="absolute bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-2 sm:px-3 py-1 sm:py-1.5 rounded-full font-medium">
                  {currentImageIndex + 1} / {images.length}
                </div>
              )}
            </div>

            {/* Thumbnails - OCULTO EN MÓVIL */}
            {images.length > 1 && (
              <div className="hidden sm:grid grid-cols-6 gap-2">
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

            {/* PRECIO */}
            <div className="bg-white rounded-xl border-2 border-gray-200 p-4 sm:p-5">
              {hasDiscount ? (
                <div className="space-y-1">
                  <div className="text-xs sm:text-sm text-gray-500">
                    Precio original:{" "}
                    <span className="line-through">
                      ${Intl.NumberFormat("es-CL").format(Number(p.original_price))}
                    </span>
                  </div>
                  <div className="text-lg sm:text-xl font-bold text-gray-900">
                    Oferta ml-catalogo: ${Intl.NumberFormat("es-CL").format(Number(p.price) || 0)}
                  </div>
                  <div className="text-xs sm:text-sm font-semibold text-[#2A9D8F]">
                    Ahorras ${Intl.NumberFormat("es-CL").format(savings)}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="text-xs sm:text-sm text-gray-500 mb-1">Precio</div>
                  <div className="text-lg sm:text-xl font-bold text-gray-900">
                    ${Intl.NumberFormat("es-CL").format(Number(p.price) || 0)}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Columna derecha - Info */}
          <div className="flex flex-col gap-4">
            {/* Marca y Stock */}
            <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-gray-200">
              {p.brand && (
                <div className="text-sm sm:text-base font-semibold text-gray-700">
                  Marca: {p.brand}
                </div>
              )}
              <span
                className={`rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold ${
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
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-2 sm:mb-3">
                  Descripción del producto
                </h3>
                <div className="bg-gray-50 rounded-xl p-3 sm:p-5 border border-gray-200">
                  <p className="text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                    {p.description}
                  </p>
                </div>
              </div>
            )}

            {/* Acciones - SIEMPRE VISIBLE */}
            <div className="space-y-3 sm:space-y-4 mt-auto">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
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
                    className="w-20 rounded-lg border-2 border-gray-300 px-3 py-2 text-sm text-center font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                  />
                </div>

                {/* Botón */}
                <button
                  onClick={() => {
                    if (canAdd) {
                      addItem(p, qty);
                      onClose();
                    }
                  }}
                  disabled={!canAdd}
                  className={`flex-1 rounded-lg px-4 sm:px-6 py-3 text-sm sm:text-base font-semibold transition-all ${
                    canAdd
                      ? "bg-gray-900 text-white hover:bg-black active:scale-95 shadow-lg hover:shadow-xl"
                      : "cursor-not-allowed bg-gray-300 text-gray-500"
                  }`}
                >
                  {canAdd ? "Agregar al carrito" : "Sin stock"}
                </button>
              </div>

              <p className="text-center text-xs text-gray-500">
                Finaliza tu pedido desde el carrito por WhatsApp
              </p>
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
            onClick={() => setZoomedImage(null)}
            className="absolute top-4 right-4 text-white text-3xl sm:text-4xl hover:text-gray-300 transition z-10"
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

          {/* Navegación (solo si hay más de 1 imagen) */}
          {images.length > 1 && (
            <>
              {/* Flecha izquierda */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const newIndex = currentImageIndex === 0 ? images.length - 1 : currentImageIndex - 1;
                  setCurrentImageIndex(newIndex);
                  setZoomedImage(images[newIndex]);
                }}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-3 sm:p-4 shadow-2xl transition z-10"
              >
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {/* Flecha derecha */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const newIndex = currentImageIndex === images.length - 1 ? 0 : currentImageIndex + 1;
                  setCurrentImageIndex(newIndex);
                  setZoomedImage(images[newIndex]);
                }}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-3 sm:p-4 shadow-2xl transition z-10"
              >
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Indicador de posición */}
              <div className="absolute bottom-16 sm:bottom-20 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-medium">
                {currentImageIndex + 1} / {images.length}
              </div>
            </>
          )}

          {/* Instrucciones */}
          <p className="absolute bottom-4 text-white text-xs sm:text-sm text-center px-4">
            {images.length > 1 ? (
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