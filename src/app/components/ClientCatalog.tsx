"use client";

import { useEffect, useState } from "react";
import { supabasePublic } from "../lib/supabasePublic";
import CatalogGrid from "./CatalogGrid";

export type CatalogProduct = {
  id: string;
  name: string;
  price: number | null;
  stock: number;
  image_url?: string | null; // viene como alias de image_path
  brand?: string | null;
  store?: string | null;
  description?: string | null;
  sku?: string | null;
  barcode?: string | null;
};

export default function ClientCatalog() {
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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
          stock,
          image_url:image_path,
          brand,
          store,
          description,
          sku,
          barcode
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

  return <CatalogGrid products={products} />;
}
