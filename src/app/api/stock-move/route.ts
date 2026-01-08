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
  return "" as const;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const code = String(body.code ?? body.sku ?? body.barcode ?? "").trim();
    const move_type = normalizeMoveType(String(body.move_type ?? ""));
    const qty = Number(body.qty ?? 0);
    const source = String(body.source ?? "scan");
    const user_label = body.user_label ? String(body.user_label) : null;

    if (!code) {
      return NextResponse.json({ error: "Falta 'code' (sku/barcode/alias)" }, { status: 400 });
    }
    if (!move_type) {
      return NextResponse.json({ error: "move_type debe ser IN u OUT" }, { status: 400 });
    }
    if (!Number.isFinite(qty) || qty <= 0) {
      return NextResponse.json({ error: "qty debe ser > 0" }, { status: 400 });
    }

    const { data: productId, error: rpcErr } = await supabaseAdmin.rpc("find_product_by_code", {
      p_code: code,
    });
    if (rpcErr) {
      return NextResponse.json({ error: `RPC find_product_by_code: ${rpcErr.message}` }, { status: 500 });
    }
    if (!productId) {
      return NextResponse.json({ error: `No se encontró producto para código '${code}'` }, { status: 404 });
    }

    const { data: applyRes, error: applyErr } = await supabaseAdmin.rpc("apply_stock_move", {
      p_product_id: productId,
      p_move_type: move_type,
      p_qty: qty,
      p_source: source,
      p_user_label: user_label,
    });
    if (applyErr) {
      return NextResponse.json({ error: `apply_stock_move: ${applyErr.message}` }, { status: 500 });
    }

    return NextResponse.json(
      { ok: true, product_id: productId, move_type, qty, source, user_label, result: applyRes ?? null },
      { status: 200 }
    );
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? String(e) }, { status: 500 });
  }
}
