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
        
        {/* Badge discreto - presente pero no protagonista */}
        {hasDiscount && p.discount_percent && (
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
              -{p.discount_percent}% OFF
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

        {/* Stock bajo - SOLO si ≤ 3 */}
        {p.stock <= 0 ? (
          <div className="flex items-center gap-1.5 text-xs font-medium text-gray-500 bg-gray-100 rounded-md px-2 py-1">
            <span>⚫</span>
            <span>Agotado</span>
          </div>
        ) : p.stock <= 3 ? (
          <div className="flex items-center gap-1.5 text-xs font-medium text-orange-700 bg-orange-50 rounded-md px-2 py-1">
            <span>⚠️</span>
            <span>
              {p.stock === 1
                ? "Última unidad disponible"
                : `Quedan ${p.stock} unidades`}
            </span>
          </div>
        ) : null}

        {/* PRECIO ELEGANTE - Jerarquía clara */}
        <div className="space-y-1">
          {hasDiscount ? (
            <>
              {/* Precio final - protagonista pero elegante */}
              <div className="text-[26px] font-semibold text-gray-900">
                ${Intl.NumberFormat("es-CL").format(Number(p.price) || 0)}
              </div>
              
              {/* Precio original + ahorro - secundarios */}
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-400 line-through">
                  ${Intl.NumberFormat("es-CL").format(Number(p.original_price))}
                </span>
                <span className="text-emerald-600 font-medium">
                  Ahorras ${Intl.NumberFormat("es-CL").format(savings)}
                </span>
              </div>
            </>
          ) : (
            <div className="text-[26px] font-semibold text-gray-900">
              ${Intl.NumberFormat("es-CL").format(Number(p.price) || 0)}
            </div>
          )}
        </div>

        {/* CTA - Full width pero no exagerado */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            addItem(p);
          }}
          disabled={!canAdd}
          className={`w-full rounded-xl px-6 py-2.5 text-sm font-medium transition-all duration-200 ${
            canAdd
              ? "bg-gray-900 text-white hover:bg-black shadow-sm hover:shadow-md"
              : "cursor-not-allowed bg-gray-200 text-gray-500"
          }`}
        >
          {canAdd ? "Agregar al carrito" : "Sin stock"}
        </button>
      </div>
    </article>
  );
}