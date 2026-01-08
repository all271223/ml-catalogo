// src/app/scan/page.tsx
"use client";

import { useState } from "react";

export default function ScanPage() {
  const [code, setCode] = useState("");
  const [qty, setQty] = useState(1);
  const [moveType, setMoveType] = useState<"IN" | "OUT">("IN");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setErr(null);
    setLoading(true);

    try {
      const res = await fetch("/api/stock-move", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.trim(),
          qty,
          move_type: moveType,
          source: "scan",
          user_label: "manual",
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Error desconocido");

      setMsg(`OK: ${moveType} x${qty}`);
      setCode("");
      setQty(1);
    } catch (e: any) {
      setErr(e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-xl p-6">
      <h1 className="mb-4 text-2xl font-bold">Escáner de stock</h1>

      <form onSubmit={submit} className="space-y-3 rounded-xl border bg-white p-4">
        <div>
          <label className="block text-sm font-medium">Código</label>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="mt-1 w-full rounded border px-3 py-2"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium">Cantidad</label>
            <input
              type="number"
              min={1}
              value={qty}
              onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
              className="mt-1 w-full rounded border px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Tipo</label>
            <select
              value={moveType}
              onChange={(e) => setMoveType(e.target.value as "IN" | "OUT")}
              className="mt-1 w-full rounded border px-3 py-2"
            >
              <option value="IN">IN</option>
              <option value="OUT">OUT</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
        >
          Registrar movimiento
        </button>

        {msg && <p className="text-green-700 text-sm">{msg}</p>}
        {err && <p className="text-red-600 text-sm">{err}</p>}
      </form>
    </main>
  );
}
