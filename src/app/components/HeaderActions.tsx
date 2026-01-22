"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import { headerActionStyles as styles } from "./header-actions.styles";

export default function HeaderActions({
  isScanAuthed,
}: {
  isScanAuthed: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  const isInScanArea = pathname.startsWith("/scan");
  const isOnScanLogin = pathname === "/scan/login";

  async function logout() {
    try {
      setLoading(true);
      await fetch("/api/scan-logout", { method: "POST" });
      router.refresh();
      router.push("/scan/login");
    } finally {
      setLoading(false);
    }
  }

  // 1) NO logueado:
  // - dentro de /scan (incluye /scan/login): no mostramos nada
  // - fuera de /scan: mostramos "Ir al escáner"
  if (!isScanAuthed) {
    if (isInScanArea) return null;

    return (
      <Link href="/scan/login" style={styles.button}>
        Ir al escáner
      </Link>
    );
  }

  // 2) Logueado:
  // - en /scan/login: no mostramos nada
  if (isOnScanLogin) return null;

  // - fuera de /scan (ej: catálogo): NO mostrar "Cerrar sesión"
  if (!isInScanArea) {
    return (
      <Link href="/scan" style={styles.button}>
        Escáner
      </Link>
    );
  }

  // - dentro de /scan: sí mostramos "Cerrar sesión"
  return (
    <>
      <Link href="/scan" style={styles.button}>
        Escáner
      </Link>

      <button
        onClick={logout}
        disabled={loading}
        style={{ ...styles.button, ...styles.danger }}
      >
        {loading ? "Cerrando..." : "Cerrar sesión"}
      </button>
    </>
  );
}
