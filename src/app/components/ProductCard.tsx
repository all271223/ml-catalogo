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
    <article className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md">
      {/* Imagen - clickable para abrir modal */}
      <div 
        className="relative aspect-square w-full overflow-hidden bg-gray-100 cursor-pointer"
        onClick={onOpenModal}
      >
        <img
          src={src}
          alt={p.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
        />
        
        {/* Badge de descuento - VERDE AZULADO (como Mercado Libre) */}
        {hasDiscount && p.discount_percent && (
          <div className="absolute top-3 right-3">
            <span className="inline-flex items-center rounded-full bg-[#2A9D8F] px-3 py-1 text-xs font-bold text-white shadow-lg">
              -{p.discount_percent}% OFF
            </span>
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="p-4">
        {/* Marca */}
        {p.brand ? (
          <div className="text-xs font-medium text-gray-500">{p.brand}</div>
        ) : (
          <div className="h-4" />
        )}

        {/* Nombre - clickable */}
        <h3 
          className="mt-1 line-clamp-2 text-sm font-semibold text-gray-900 cursor-pointer hover:text-blue-600 transition"
          onClick={onOpenModal}
        >
          {p.name}
        </h3>

        {/* Indicador de stock - NARANJA (solo para alertas) */}
        {p.stock <= 0 ? (
          <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-gray-500">
            <span>⚫</span>
            <span>Sin stock disponible</span>
          </div>
        ) : p.stock <= 3 ? (
          <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-[#F97316]">
            <span>⚠️</span>
            <span>
              {p.stock === 1
                ? "¡Última unidad disponible!"
                : `Solo quedan ${p.stock} unidades`}
            </span>
          </div>
        ) : null}

        {/* Precio + CTA */}
        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="min-w-0">
            {/* Precio con descuento - SOBRIO (negro + gris) */}
            {hasDiscount ? (
              <div>
                <div className="text-[11px] font-medium text-gray-500">
                  Precio original:{" "}
                  <span className="line-through">
                    ${Intl.NumberFormat("es-CL").format(Number(p.original_price))}
                  </span>
                </div>
                <div className="truncate text-lg font-bold text-gray-900">
                  Oferta ml-catalogo: ${Intl.NumberFormat("es-CL").format(Number(p.price) || 0)}
                </div>
                <div className="text-xs font-medium text-[#2A9D8F]">
                  Ahorras ${Intl.NumberFormat("es-CL").format(savings)}
                </div>
              </div>
            ) : (
              <div>
                <div className="text-[11px] font-medium text-gray-500">Precio</div>
                <div className="truncate text-lg font-semibold text-gray-900">
                  ${Intl.NumberFormat("es-CL").format(Number(p.price) || 0)}
                </div>
              </div>
            )}
          </div>

          {/* Botón - NEGRO (sobrio, como Mercado Libre) */}
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