// src/app/api/product-search/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

type ProductSearchItem = {
  id: string;
  name: string;
  sku: string | null;
  barcode: string | null;
  stock: number;
  price: number | null;
};

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") ?? "").trim();

    if (!q) {
      return NextResponse.json(
        { ok: true, items: [] as ProductSearchItem[] },
        { status: 200 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("products")
      .select("id, name, sku, barcode, stock, price")
      .eq("is_visible", true)
      .or(`name.ilike.%${q}%,sku.ilike.%${q}%,barcode.ilike.%${q}%`)
      .limit(8);

    if (error) {
      return NextResponse.json(
        { error: `search products: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { ok: true, items: (data ?? []) as ProductSearchItem[] },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Error inesperado";

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
