// src/app/scan/page.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type SearchItem = {
  id: string;
  name: string;
  sku: string | null;
  barcode: string | null;
  stock: number;
  price: number | null;
};

export default function ScanPage() {
  const [code, setCode] = useState("");
  const [qty, setQty] = useState<number>(1);
  const [moveType, setMoveType] = useState<"IN" | "OUT">("IN");
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // 🔍 búsqueda
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchItem[]>([]);
  const [searching, setSearching] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // limpiar mensajes
  useEffect(() => {
    if (!msg && !err) return;
    const t = setTimeout(() => {
      setMsg(null);
      setErr(null);
    }, 2000);
    return () => clearTimeout(t);
  }, [msg, err]);

  async function runSubmit() {
    setMsg(null);
    setErr(null);
    setLoading(true);

    try {
      const cleanCode = code.trim();
      if (!cleanCode) {
        setErr("Código vacío");
        return;
      }

      const res = await fetch("/api/stock-move", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: cleanCode,
          qty,
          move_type: moveType,
          source: "scan",
          user_label: "manual",
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Error desconocido");

      setMsg(`✔ ${moveType} x${qty} aplicado`);
      setCode("");
      setQty(1);
      inputRef.current?.focus();
    } catch (e: any) {
      setErr(e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!loading) await runSubmit();
  }

  async function logout() {
    try {
      await fetch("/api/scan-logout", { method: "POST" });
    } finally {
      router.replace("/scan/login");
      router.refresh();
    }
  }

  // 🔍 buscar productos por nombre
  async function doSearch(q: string) {
    setQuery(q);
    if (!q.trim()) {
      setResults([]);
      return;
    }

    setSearching(true);
    try {
      const res = await fetch(`/api/product-search?q=${encodeURIComponent(q)}`);
      const json = await res.json();
      setResults(json.items ?? []);
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  }

  function selectProduct(p: SearchItem) {
    setCode(p.barcode || p.sku || "");
    setSearchOpen(false);
    setQuery("");
    setResults([]);
    inputRef.current?.focus();
  }

  return (
    <main className="mx-auto max-w-xl p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
          >
            ← Catálogo
          </Link>

          <h1 className="text-2xl font-bold">Escáner de stock</h1>
        </div>

        <button
          onClick={logout}
          className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
        >
          Cerrar sesión
        </button>
      </div>

      {/* feedback */}
      {msg && (
        <div className="mb-3 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
          {msg}
        </div>
      )}
      {err && (
        <div className="mb-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          Error: {err}
        </div>
      )}

      {/* botón buscar */}
      <div className="mb-3">
        <button
          type="button"
          onClick={() => setSearchOpen((v) => !v)}
          className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50"
        >
          🔍 Buscar producto
        </button>
      </div>

      {/* panel búsqueda */}
      {searchOpen && (
        <div className="mb-4 rounded-lg border bg-white p-3">
          <input
            value={query}
            onChange={(e) => doSearch(e.target.value)}
            placeholder="Buscar por nombre, SKU o barcode"
            className="mb-2 w-full rounded border px-3 py-2"
            autoFocus
          />

          {searching && (
            <div className="text-sm text-gray-500">Buscando…</div>
          )}

          {!searching && results.length === 0 && query && (
            <div className="text-sm text-gray-500">
              Sin resultados
            </div>
          )}

          <ul className="divide-y">
            {results.map((p) => (
              <li
                key={p.id}
                onClick={() => selectProduct(p)}
                className="cursor-pointer py-2 hover:bg-gray-50"
              >
                <div className="text-sm font-medium">{p.name}</div>
                <div className="text-xs text-gray-500">
                  Stock: {p.stock} · {p.sku || p.barcode}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* formulario principal */}
      <form
        onSubmit={submit}
        onClick={(e) => {
          const t = e.target as HTMLElement;
          if (
            t.tagName !== "INPUT" &&
            t.tagName !== "SELECT" &&
            t.tagName !== "BUTTON"
          ) {
            inputRef.current?.focus();
          }
        }}
        className="space-y-3 rounded-xl border bg-white p-4"
      >
        <div>
          <label className="block text-sm font-medium">
            Código
          </label>
          <input
            ref={inputRef}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={async (e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                if (!loading) await runSubmit();
              }
            }}
            className="mt-1 w-full rounded border px-3 py-2"
            placeholder="Escanea o selecciona un producto"
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
      </form>
    </main>
  );
}
