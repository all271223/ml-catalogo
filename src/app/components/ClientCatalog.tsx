// src/app/components/ClientCatalog.tsx
"use client";

import { useEffect, useState } from "react";
import { supabasePublic } from "../lib/supabasePublic";
import CatalogGrid from "./CatalogGrid";

type Product = {
  id: string;
  name: string;
  price: number | null;
  stock: number;
  image_url?: string | null;
  brand?: string | null;
  store?: string | null;
  description?: string | null;
  sku?: string | null;
  barcode?: string | null;
};

export default function ClientCatalog() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      setErr(null);
      try {
        const { data, error, status } = await supabasePublic
          .from("products")
          .select(
            "id, name, price, stock, sku, barcode, image_url:image_path, description, brand, store"
          )
          .eq("is_visible", true)
          .limit(200);

        if (error) {
          throw new Error(
            `PostgREST ${status ?? ""} - ${error.message || ""} ${
              (error as any).details ? " | " + (error as any).details : ""
            }`
          );
        }

        if (!alive) return;
        setProducts((data ?? []) as Product[]);
      } catch (e: any) {
        const msg =
          e?.message ||
          e?.error ||
          (typeof e === "object" ? JSON.stringify(e) : String(e));
        console.error("load products failed:", e);
        if (!alive) return;
        setErr(msg);
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Encabezado (solo visual/UX) */}
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Catálogo</h1>
          <p className="text-sm text-gray-600">
            {loading ? "Cargando productos…" : `${products.length} productos`}
          </p>
        </div>
      </div>

      {/* Contenido */}
      {loading && (
        <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-600">
          Cargando catálogo…
        </div>
      )}

      {!loading && err && (
        <div className="rounded-xl border border-red-200 bg-white p-4 text-sm text-red-700">
          Error cargando productos: {err}
        </div>
      )}

      {!loading && !err && !products.length && (
        <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-600">
          No hay productos.
        </div>
      )}

      {!loading && !err && products.length > 0 && (
        <CatalogGrid products={products} />
      )}
    </div>
  );
}
