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

  // Si NO estás logueado:
  // - Si ya estás en /scan/login, NO muestres "Ir al escáner" (porque es el mismo lugar)
  if (!isScanAuthed) {
    if (isOnScanLogin) return null;

    return (
      <Link href="/scan/login" style={styles.button}>
        Ir al escáner
      </Link>
    );
  }

  // Si estás logueado → acceso + cerrar sesión
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
