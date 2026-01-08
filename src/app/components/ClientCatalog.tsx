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
        // 1) Query principal (sin order por si created_at no existe)
        const { data, error, status } = await supabasePublic
          .from("products")
          .select(
            "id, name, price, stock, sku, barcode, image_url:image_path, description, brand, store"
          )
          .eq("is_visible", true)
          .limit(200);

        if (error) {
          // mostrémoslo con máximo detalle
          throw new Error(
            `PostgREST ${status ?? ""} - ${error.message || ""} ${
              (error as any).details ? " | " + (error as any).details : ""
            }`
          );
        }

        if (!alive) return;
        setProducts((data ?? []) as Product[]);
      } catch (e: any) {
        // Captura robusta
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

  if (loading) {
    return <div className="p-6 text-sm text-gray-600">Cargando catálogo…</div>;
  }

  if (err) {
    return (
      <div className="p-6 text-sm text-red-600">
        Error cargando productos: {err}
      </div>
    );
  }

  if (!products.length) {
    return <div className="p-6 text-sm text-gray-600">No hay productos.</div>;
  }

  return <CatalogGrid products={products} />;
}
