// src/app/scan/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ScanLoginPage() {
  const [password, setPassword] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);

    try {
      const res = await fetch("/api/scan-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Clave incorrecta");

      router.replace("/scan");
    } catch (e: any) {
      setErr(e?.message ?? "Clave incorrecta");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="mb-4 text-2xl font-bold">Acceso a Escáner</h1>

      <form onSubmit={submit} className="space-y-3 rounded-xl border bg-white p-4">
        <div>
          <label className="block text-sm font-medium">Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded border px-3 py-2"
            placeholder="Ingresa la clave"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-blue-600 px-4 py-2 font-medium text-white disabled:opacity-60"
        >
          {loading ? "Verificando…" : "Entrar"}
        </button>

        {err && <p className="text-sm text-red-600">Error: {err}</p>}
      </form>

      <p className="mt-3 text-xs text-gray-500">
        Si no tienes la clave, vuelve al <a className="underline" href="/">catálogo</a>.
      </p>
    </main>
  );
}
