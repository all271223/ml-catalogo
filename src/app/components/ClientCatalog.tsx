"use client";

import { useEffect, useState } from "react";
import { supabasePublic } from "../lib/supabasePublic";
import CatalogGrid from "./CatalogGrid";

export type CatalogProduct = {
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
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      const { data, error } = await supabasePublic
        .from("products")
        .select(
          `
          id,
          name,
          price,
          stock,
          image_url,
          brand,
          store,
          description,
          sku,
          barcode
        `
        )
        .eq("active", true)
        .order("name");

      if (!error && data) {
        setProducts(data as CatalogProduct[]);
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

  return <CatalogGrid products={products} />;
}
