// src/app/scan/page.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ScanPage() {
  const [code, setCode] = useState("");
  const [qty, setQty] = useState<number>(1);
  const [moveType, setMoveType] = useState<"IN" | "OUT">("IN");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

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

      setMsg(`OK: ${moveType} x${qty} aplicado`);
      setCode("");
      setQty(1);
      inputRef.current?.focus();
    } catch (e: any) {
      setErr(e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    try {
      await fetch("/api/scan-logout", { method: "POST" });
    } finally {
      // Forzar ir al login (middleware hará el resto)
      router.replace("/scan/login");
      router.refresh();
    }
  }

  return (
    <main className="mx-auto max-w-xl p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Escáner de stock</h1>

        <button
          onClick={logout}
          className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
          aria-label="Cerrar sesión"
          title="Cerrar sesión"
        >
          Cerrar sesión
        </button>
      </div>

      <form onSubmit={submit} className="space-y-3 rounded-xl border bg-white p-4">
        <div>
          <label className="block text-sm font-medium">Código</label>
          <input
            ref={inputRef}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="mt-1 w-full rounded border px-3 py-2"
            placeholder="Escanea o escribe SKU / barcode"
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
              <option value="IN">IN (entrada)</option>
              <option value="OUT">OUT (salida)</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {loading ? "Enviando…" : "Registrar movimiento"}
        </button>

        {msg && <p className="text-sm text-green-700">{msg}</p>}
        {err && <p className="text-sm text-red-600">Error: {err}</p>}
      </form>
    </main>
  );
}
