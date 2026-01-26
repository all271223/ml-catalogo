// src/app/api/stock-move/route.ts
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

function normalizeMoveType(s: string): "IN" | "OUT" | "" {
  const u = s.trim().toUpperCase();
  if (u.startsWith("IN")) return "IN";
  if (u.startsWith("OUT")) return "OUT";
  return "";
}

type StockMoveBody = {
  code?: unknown;
  sku?: unknown;
  barcode?: unknown;
  move_type?: unknown;
  qty?: unknown;
  source?: unknown;
  user_label?: unknown;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as StockMoveBody;

    const code = String(
      body.code ?? body.sku ?? body.barcode ?? ""
    ).trim();

    const move_type = normalizeMoveType(String(body.move_type ?? ""));
    const qty = Number(body.qty ?? 0);
    const source = String(body.source ?? "scan");
    const user_label =
      typeof body.user_label === "string" ? body.user_label : null;

    if (!code) {
      return NextResponse.json(
        { error: "Falta 'code' (sku/barcode/alias)" },
        { status: 400 }
      );
    }

    if (!move_type) {
      return NextResponse.json(
        { error: "move_type debe ser IN u OUT" },
        { status: 400 }
      );
    }

    if (!Number.isFinite(qty) || qty <= 0) {
      return NextResponse.json(
        { error: "qty debe ser > 0" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin.rpc("apply_stock_move", {
      p_barcode: code,
      p_type: move_type,
      p_qty: qty,
      p_source: source,
      p_user_label: user_label,
    });

    if (error) {
      return NextResponse.json(
        { error: `apply_stock_move: ${error.message}` },
        { status: 500 }
      );
    }

    const row = Array.isArray(data) ? data[0] : data;

    if (!row) {
      return NextResponse.json(
        { error: `No se encontró producto para código '${code}'` },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        move_type,
        qty,
        source,
        user_label,
        result: row,
      },
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
