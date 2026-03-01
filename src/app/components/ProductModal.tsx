// src/app/components/ProductModal.tsx
"use client";

import { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import { useCart } from "./CartContext";
import { imagePublicUrls } from "../lib/images";
import { supabasePublic } from "../lib/supabasePublic";
import {
  ProductVariant,
  formatVariantAttributes,
  extractUniqueAttributes,
} from "../lib/variant-helpers";
import VariantSelector from "./VariantSelector";

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
  has_variants?: boolean;
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

  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [loadingVariants, setLoadingVariants] = useState(false);

  // Handler que recibe la selección desde VariantSelector
  const handleVariantSelect = (variant: ProductVariant | null) => {

    setSelectedVariant(variant);
  };

  // handler limpio para añadir al carrito
  const handleAddToCart = () => {
    // Si es necesario seleccionar variante y no hay seleccionada
    if (p?.has_variants && !selectedVariant) {
      alert("Por favor selecciona una opción (color, talla o diseño)");
      return;
    }

    // determinar stock actual y si se puede agregar
    const currentStock =
      p?.has_variants && selectedVariant ? selectedVariant.stock : p?.stock ?? 0;
    const canAddLocal = currentStock > 0 && qty > 0 && qty <= currentStock;
    if (!canAddLocal) return;

    // Si hay variante seleccionada: crear item con id único por variante
    if (p?.has_variants && selectedVariant) {
      const variantLabel = formatVariantAttributes(selectedVariant.attributes); // ✅ NUEVA LÍNEA
      const item = {
        id: `${p.id}::${selectedVariant.id}`, // id único por variante
        name: `${p.name}${variantLabel ? ` - ${variantLabel}` : ""}`, // ✅ LÍNEA MODIFICADA
        price: (selectedVariant.price ?? p.price ?? 0) as number,
        sku: (selectedVariant.sku ?? p.sku ?? null) as string | null,
      };

      // Mantener la firma addItem(item, qty, meta) que usabas antes
      addItem(
        item,
        qty,
        {
          variantId: selectedVariant.id,
          attributes: selectedVariant.attributes || {},
        }
      );
    } else if (p) {
      // Producto sin variantes
      const item = {
        id: p.id,
        name: p.name,
        price: (p.price ?? 0) as number,
        sku: (p.sku ?? null) as string | null,
      };

      addItem(item, qty);
    }

    onClose();
  };

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  // cargar variantes si corresponde
  useEffect(() => {
    if (p?.has_variants) {
      loadVariants();
    } else {
      // si el producto no tiene variantes, asegurarnos de limpiar
      setVariants([]);
      setSelectedVariant(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [p?.has_variants, p?.id]);

  // limpiar selectedVariant si dejó de existir en la lista de variantes
  useEffect(() => {
    if (selectedVariant && variants.length > 0) {
      const exists = variants.some((v) => v.id === selectedVariant.id);
      if (!exists) setSelectedVariant(null);
    }
  }, [variants, selectedVariant]);

  const loadVariants = async () => {
    if (!p) return;

    setLoadingVariants(true);
    const { data, error } = await supabasePublic
      .from("product_variants")
      .select("*")
      .eq("product_id", p.id)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error loading variants:", error);
    } else {
      setVariants(data || []);
    }
    setLoadingVariants(false);
  };

  const images = useMemo(() => {
    if (!p) return [];

    if (selectedVariant?.variant_images && selectedVariant.variant_images.length > 0) {
      return imagePublicUrls(selectedVariant.variant_images);
    }

    return imagePublicUrls(p.image_url ?? null);
  }, [p, selectedVariant]);

  if (!p) return null;

  const currentStock = p.has_variants && selectedVariant ? selectedVariant.stock : p.stock;

  const canAdd = currentStock > 0 && qty > 0 && qty <= currentStock;
  const needsVariantSelection = p.has_variants && !selectedVariant;

  // precio a mostrar (variante o padre)
  const displayPrice = selectedVariant?.price ?? p.price ?? 0;

  const displayOriginalPrice = useMemo(() => {
    if (selectedVariant?.price && p.original_price && p.price) {
      const discountMultiplier = p.price / p.original_price;
      return selectedVariant.price / discountMultiplier;
    }
    return p.original_price || 0;
  }, [selectedVariant, p.price, p.original_price]);

  const hasDiscount = displayOriginalPrice > displayPrice;
  const savings = hasDiscount ? displayOriginalPrice - displayPrice : 0;

  return (
    <>
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
            {/* Column left */}
            <div className="flex flex-col gap-3 sm:gap-4">
              {/* Main image */}
              <div className="relative rounded-xl bg-white flex items-center justify-center" style={{ height: "400px" }}>
                <Image
                  src={images[currentImageIndex]}
                  alt={`${p.name} - Imagen ${currentImageIndex + 1}`}
                  width={500}
                  height={500}
                  className="w-full h-full rounded-lg object-contain cursor-pointer hover:opacity-90 transition"
                  style={{ maxHeight: "500px" }}
                  onClick={() => setZoomedImage(images[currentImageIndex])}
                  unoptimized
                />

                {hasDiscount && p.discount_percent && (
                  <div className="absolute top-3 right-3">
                    <span className="inline-flex items-center rounded-md bg-gray-100 px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs font-medium text-gray-700">
                      -{p.discount_percent}% OFF
                    </span>
                  </div>
                )}

                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                      className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white rounded-full p-2 sm:p-3 shadow-lg transition"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))}
                      className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/95 hover:bg-white rounded-full p-2 sm:p-3 shadow-lg transition"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}

                {images.length > 1 && (
                  <div className="absolute bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs px-2 sm:px-3 py-1 sm:py-1.5 rounded-full font-medium">
                    {currentImageIndex + 1} / {images.length}
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="hidden sm:grid grid-cols-6 gap-2">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`aspect-square rounded-lg overflow-hidden border-2 transition ${idx === currentImageIndex ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-200 hover:border-gray-400"}`}
                    >
                      <Image src={img} alt={`Miniatura ${idx + 1}`} width={100} height={100} className="w-full h-full object-cover" unoptimized />
                    </button>
                  ))}
                </div>
              )}

              {/* Price */}
              <div className="bg-white rounded-xl border-2 border-gray-200 p-4 sm:p-5">
                {hasDiscount ? (
                  <div className="space-y-1.5">
                    <div className="text-[28px] sm:text-[32px] font-semibold text-gray-900">
                      ${Intl.NumberFormat("es-CL").format(displayPrice)}
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-400 line-through">
                        ${Intl.NumberFormat("es-CL").format(displayOriginalPrice)}
                      </span>
                      <span className="text-emerald-600 font-medium">
                        Ahorras ${Intl.NumberFormat("es-CL").format(savings)}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-[28px] sm:text-[32px] font-semibold text-gray-900">
                    ${Intl.NumberFormat("es-CL").format(displayPrice)}
                  </div>
                )}
              </div>
            </div>

            {/* Column right */}
            <div className="flex flex-col gap-4">
              {/* Brand and stock */}
              <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-gray-200">
                {p.brand && <div className="text-sm sm:text-base font-semibold text-gray-700">Marca: {p.brand}</div>}

                {!p.has_variants && currentStock <= 3 && (
                  <span className="rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold bg-orange-50 text-orange-700">
                    {currentStock === 0 ? "Agotado" : currentStock === 1 ? "Última unidad" : `Quedan ${currentStock}`}
                  </span>
                )}
              </div>

              {/* Variant selector */}
              {p.has_variants && (
                <div className="bg-purple-50 rounded-xl border-2 border-purple-200 p-4">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span>🎨</span>
                    <span>Selecciona una opción:</span>
                  </h3>

                  {loadingVariants ? (
                    <div className="text-center py-8 text-gray-500 text-sm">Cargando opciones...</div>
                  ) : variants.length > 0 ? (
                    <>
                      <VariantSelector variants={variants} onVariantSelect={handleVariantSelect} />

                      {selectedVariant && (
                        <div className="mt-4 pt-4 border-t border-purple-200">
                          <div>
                            <p className="text-sm font-medium text-gray-700">
                              Selección: <span className="text-purple-700">{formatVariantAttributes(selectedVariant.attributes)}</span>
                            </p>
                            
                          </div>
                        </div>
                      )}
                    </>
                  ) : (
                    <p className="text-sm text-gray-500">No hay variantes disponibles</p>
                  )}
                </div>
              )}

              {/* Description */}
              {p.description && (
                <div>
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-2 sm:mb-3">Descripción del producto</h3>
                  <div className="bg-gray-50 rounded-xl p-3 sm:p-5 border border-gray-200 max-h-64 overflow-y-auto">
                    <p className="text-xs sm:text-sm text-gray-700 leading-relaxed whitespace-pre-line">{p.description}</p>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="space-y-3 sm:space-y-4 mt-auto">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                  <div className="flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-700">Cantidad:</label>
                    <input
                      type="number"
                      min={1}
                      max={currentStock}
                      value={qty}
                      onChange={(e) => setQty(Math.min(Math.max(1, Number(e.target.value) || 1), currentStock))}
                      className="w-20 rounded-lg border-2 border-gray-300 px-3 py-2 text-sm text-center font-medium focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                    />
                  </div>

                  <button
                    onClick={handleAddToCart}
                    disabled={!canAdd || needsVariantSelection}
                    className={`flex-1 rounded-xl px-4 sm:px-6 py-3 text-sm sm:text-base font-medium transition-all ${canAdd && !needsVariantSelection
                      ? "bg-gray-900 text-white hover:bg-black shadow-md hover:shadow-lg"
                      : "cursor-not-allowed bg-gray-300 text-gray-500"
                      }`}
                  >
                    {needsVariantSelection ? "Selecciona una opción" : canAdd ? "Agregar al carrito" : "Sin stock"}
                  </button>
                </div>

                <p className="text-center text-xs text-gray-500">Finaliza tu pedido desde el carrito por WhatsApp</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Zoom modal */}
      {zoomedImage && (
        <div className="fixed inset-0 z-100 bg-black/95 flex items-center justify-center p-4" onClick={() => setZoomedImage(null)}>
          <button onClick={() => setZoomedImage(null)} className="absolute top-4 right-4 text-white text-3xl sm:text-4xl hover:text-gray-300 transition z-10">✕</button>

          <Image src={zoomedImage} alt="Zoom" width={1200} height={1200} className="max-w-full max-h-full object-contain" onClick={(e) => e.stopPropagation()} unoptimized />

          {images.length > 1 && (
            <>
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

              <div className="absolute bottom-16 sm:bottom-20 left-1/2 -translate-x-1/2 bg-black/60 text-white text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full font-medium">
                {currentImageIndex + 1} / {images.length}
              </div>
            </>
          )}

          <p className="absolute bottom-4 text-white text-xs sm:text-sm text-center px-4">
            {images.length > 1 ? <>Usa las flechas para navegar • Click fuera para cerrar</> : <>Click fuera de la imagen para cerrar</>}
          </p>
        </div>
      )}
    </>
  );
}