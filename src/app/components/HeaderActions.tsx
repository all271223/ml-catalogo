"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function HeaderActions({ isScanAuthed }: { isScanAuthed: boolean }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function logout() {
    try {
      setLoading(true);
      await fetch("/api/scan-logout", { method: "POST" });
      router.refresh(); // para que el Header (server) relea la cookie
      router.push("/");
    } finally {
      setLoading(false);
    }
  }

  // Si NO estás logueado, mostramos acceso al login del escáner
  if (!isScanAuthed) {
    return (
      <Link href="/scan/login" style={btn}>
        Ir al escáner
      </Link>
    );
  }

  // Si estás logueado, mostramos acceso directo + cerrar sesión
  return (
    <>
      <Link href="/scan" style={btn}>
        Escáner
      </Link>

      <button onClick={logout} disabled={loading} style={btnDanger}>
        {loading ? "Cerrando..." : "Cerrar sesión"}
      </button>
    </>
  );
}

const btn: React.CSSProperties = {
  padding: "8px 10px",
  border: "1px solid #ddd",
  borderRadius: 8,
  textDecoration: "none",
  color: "#111",
  background: "#fff",
  cursor: "pointer",
  fontSize: 14,
};

const btnDanger: React.CSSProperties = {
  ...btn,
  border: "1px solid #f0b4b4",
  background: "#fff5f5",
};
