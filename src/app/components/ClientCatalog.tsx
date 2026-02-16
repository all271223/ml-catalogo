"use client";

import { useEffect, useState, useMemo } from "react";
import { supabasePublic } from "../lib/supabasePublic";
import CatalogGrid from "./CatalogGrid";

export type CatalogProduct = {
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
  category?: string | null; // ✅ NUEVO
};

type CategoryCount = {
  name: string;
  count: number;
  icon: string;
};

const CATEGORIES = [
  { name: "Herramientas", icon: "🔧" },
  { name: "Ropa", icon: "👕" },
  { name: "Calzado", icon: "👟" },
  { name: "Para Bebés", icon: "👶" },
  { name: "Bolsos y Mochilas", icon: "🎒" },
  { name: "Entretenimiento", icon: "🎮" },
  { name: "Accesorios", icon: "💍" },
  { name: "Electrónica", icon: "📱" },
  { name: "Hogar y Decoración", icon: "🏠" },
  { name: "Juguetes", icon: "🧸" },
  { name: "Otros", icon: "📦" },
];

export default function ClientCatalog() {
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setErrorMsg(null);

      const { data, error } = await supabasePublic
        .from("products")
        .select(
          `
          id,
          name,
          price,
          original_price,
          discount_percent,
          stock,
          image_url:image_path,
          brand,
          store,
          description,
          sku,
          barcode,
          category
        `
        )
        .eq("is_visible", true)
        .order("name", { ascending: true });

      if (error) {
        setErrorMsg(error.message);
        setProducts([]);
      } else {
        setProducts((data ?? []) as CatalogProduct[]);
      }

      setLoading(false);
    };

    load();
  }, []);

  // ✅ Calcular categorías con productos (solo las que tienen al menos 1 producto)
  const categoriesWithCount = useMemo(() => {
    const counts: CategoryCount[] = [];

    CATEGORIES.forEach((cat) => {
      const count = products.filter((p) => p.category === cat.name).length;
      if (count > 0) {
        counts.push({ name: cat.name, count, icon: cat.icon });
      }
    });

    // Agregar productos sin categoría si existen
    const uncategorized = products.filter((p) => !p.category).length;
    if (uncategorized > 0) {
      counts.push({ name: "Sin categoría", count: uncategorized, icon: "📋" });
    }

    return counts;
  }, [products]);

  // ✅ Filtrar productos según categoría seleccionada
  const filteredProducts = useMemo(() => {
    if (!selectedCategory) return products;
    
    if (selectedCategory === "Sin categoría") {
      return products.filter((p) => !p.category);
    }
    
    return products.filter((p) => p.category === selectedCategory);
  }, [products, selectedCategory]);

  if (loading) {
    return (
      <div className="flex justify-center py-10 text-sm text-gray-500">
        Cargando catálogo…
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="mx-auto max-w-xl rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
        Error cargando catálogo: {errorMsg}
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* ✅ MENÚ LATERAL DE CATEGORÍAS - DESKTOP */}
      <aside className="hidden lg:block w-64 flex-shrink-0">
        <div className="bg-white rounded-lg shadow-md p-4 sticky top-24">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Categorías</h2>
          
          {/* Todas */}
          <button
            onClick={() => setSelectedCategory(null)}
            className={`w-full text-left px-4 py-3 rounded-lg mb-2 transition ${
              selectedCategory === null
                ? "bg-blue-600 text-white font-semibold"
                : "bg-gray-50 text-gray-700 hover:bg-gray-100"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span>📋</span>
                <span>Todas</span>
              </span>
              <span className="text-sm opacity-75">({products.length})</span>
            </div>
          </button>

          {/* Categorías dinámicas */}
          {categoriesWithCount.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setSelectedCategory(cat.name)}
              className={`w-full text-left px-4 py-3 rounded-lg mb-2 transition ${
                selectedCategory === cat.name
                  ? "bg-blue-600 text-white font-semibold"
                  : "bg-gray-50 text-gray-700 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span>{cat.icon}</span>
                  <span className="truncate">{cat.name}</span>
                </span>
                <span className="text-sm opacity-75">({cat.count})</span>
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* ✅ MENÚ DE CATEGORÍAS - MOBILE (desplegable) */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="w-full bg-white rounded-lg shadow-md px-4 py-3 flex items-center justify-between"
        >
          <span className="font-semibold text-gray-800">
            {selectedCategory ? (
              <span className="flex items-center gap-2">
                <span>
                  {categoriesWithCount.find((c) => c.name === selectedCategory)?.icon || "📋"}
                </span>
                <span>{selectedCategory}</span>
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <span>📋</span>
                <span>Todas las categorías</span>
              </span>
            )}
          </span>
          <span className="text-gray-500">{showMobileMenu ? "▲" : "▼"}</span>
        </button>

        {showMobileMenu && (
          <div className="mt-2 bg-white rounded-lg shadow-md p-2">
            {/* Todas */}
            <button
              onClick={() => {
                setSelectedCategory(null);
                setShowMobileMenu(false);
              }}
              className={`w-full text-left px-4 py-3 rounded-lg mb-1 transition ${
                selectedCategory === null
                  ? "bg-blue-600 text-white font-semibold"
                  : "bg-gray-50 text-gray-700"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span>📋</span>
                  <span>Todas</span>
                </span>
                <span className="text-sm opacity-75">({products.length})</span>
              </div>
            </button>

            {/* Categorías */}
            {categoriesWithCount.map((cat) => (
              <button
                key={cat.name}
                onClick={() => {
                  setSelectedCategory(cat.name);
                  setShowMobileMenu(false);
                }}
                className={`w-full text-left px-4 py-3 rounded-lg mb-1 transition ${
                  selectedCategory === cat.name
                    ? "bg-blue-600 text-white font-semibold"
                    : "bg-gray-50 text-gray-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span>{cat.icon}</span>
                    <span>{cat.name}</span>
                  </span>
                  <span className="text-sm opacity-75">({cat.count})</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ✅ GRID DE PRODUCTOS */}
      <div className="flex-1">
        {selectedCategory && (
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">
              {categoriesWithCount.find((c) => c.name === selectedCategory)?.icon}{" "}
              {selectedCategory}
            </h2>
            <span className="text-sm text-gray-500">
              {filteredProducts.length} producto{filteredProducts.length !== 1 ? "s" : ""}
            </span>
          </div>
        )}
        
        {filteredProducts.length > 0 ? (
          <CatalogGrid products={filteredProducts} />
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-gray-500">No hay productos en esta categoría</p>
          </div>
        )}
      </div>
    </div>
  );
}