// src/app/components/ProductCard.tsx
"use client";

import { useCart } from "./CartContext";
import { imagePublicUrl } from "../lib/images";

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
  sku?: string | null;
  barcode?: string | null;
};

export default function ProductCard({ 
  p, 
  onOpenModal 
}: { 
  p: Product;
  onOpenModal?: () => void;
}) {
  const { addItem } = useCart();
  const src = imagePublicUrl(p.image_url);
  const canAdd = p.stock > 0;
  
  const hasDiscount = p.original_price && p.original_price > (p.price || 0);
  const savings = hasDiscount ? (p.original_price || 0) - (p.price || 0) : 0;

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-lg hover:border-gray-300">
      {/* Imagen */}
      <div 
        className="relative aspect-square w-full overflow-hidden bg-white cursor-pointer p-4"
        onClick={onOpenModal}
      >
        <img
          src={src}
          alt={p.name}
          loading="lazy"
          className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
        />
        
        {/* Badge OPTIMIZADO con urgencia */}
        {hasDiscount && p.discount_percent && (
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center gap-1 rounded-lg bg-gradient-to-r from-red-500 to-orange-500 px-3 py-1.5 text-xs font-bold text-white shadow-lg">
              🔥 -{p.discount_percent}% HOY
            </span>
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="p-4 space-y-3">
        {/* Marca */}
        {p.brand && (
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">{p.brand}</div>
        )}

        {/* Nombre - clickable */}
        <h3 
          className="line-clamp-2 text-base font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition min-h-[48px]"
          onClick={onOpenModal}
        >
          {p.name}
        </h3>

        {/* Stock bajo - OPTIMIZADO con urgencia */}
        {p.stock <= 0 ? (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 bg-gray-100 rounded-md px-2 py-1">
            <span>⚫</span>
            <span>Agotado</span>
          </div>
        ) : p.stock <= 3 ? (
          <div className="flex items-center gap-1.5 text-xs font-bold text-white bg-gradient-to-r from-red-600 to-orange-600 rounded-md px-2 py-1.5 animate-pulse">
            <span>⚠️</span>
            <span>
              {p.stock === 1
                ? "¡ÚLTIMA UNIDAD!"
                : `¡SOLO QUEDAN ${p.stock}!`}
            </span>
          </div>
        ) : null}

        {/* PRECIO HÉROE - Optimizado */}
        <div className="space-y-1">
          {hasDiscount ? (
            <>
              {/* Precio final - HÉROE */}
              <div className="text-3xl font-black text-gray-900">
                ${Intl.NumberFormat("es-CL").format(Number(p.price) || 0)}
              </div>
              
              {/* Precio original - secundario */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 line-through">
                  ${Intl.NumberFormat("es-CL").format(Number(p.original_price))}
                </span>
                <span className="text-sm font-bold text-green-600">
                  Ahorras ${Intl.NumberFormat("es-CL").format(savings)}
                </span>
              </div>
            </>
          ) : (
            <div className="text-3xl font-black text-gray-900">
              ${Intl.NumberFormat("es-CL").format(Number(p.price) || 0)}
            </div>
          )}
        </div>

        {/* CTA - FULL WIDTH + dominante */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            addItem(p);
          }}
          disabled={!canAdd}
          className={`w-full rounded-xl px-6 py-4 text-base font-bold transition-all duration-200 ${
            canAdd
              ? "bg-black text-white hover:bg-gray-800 active:scale-[0.98] shadow-lg hover:shadow-xl"
              : "cursor-not-allowed bg-gray-200 text-gray-500"
          }`}
        >
          {canAdd ? "Agregar al carrito" : "Sin stock"}
        </button>
      </div>
    </article>
  );
}