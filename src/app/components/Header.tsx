// src/app/components/Header.tsx
import Link from "next/link";
import { cookies } from "next/headers";
import HeaderActions from "./HeaderActions";
import { headerStyles as styles } from "./header.styles";

export default async function Header() {
  const cookieStore = await cookies();
  const isScanAuthed = cookieStore.has("scan_auth");

  /**
   * Mostrar acceso a escáner:
   * - En desarrollo (localhost): SI
   * - En producción: NO
   * - Forzar en producción: SHOW_SCAN_BUTTON=true
   */
  const showScan =
    process.env.NODE_ENV === "development" ||
    process.env.SHOW_SCAN_BUTTON?.toLowerCase() === "true";

  return (
    <header style={styles.header}>
      <div style={styles.container}>
        <Link href="/" style={styles.brand}>
          ML-CATALOGO
        </Link>

        <nav style={styles.nav}>
          <Link href="/" style={styles.link}>
            Catálogo
          </Link>

          {showScan && <HeaderActions isScanAuthed={isScanAuthed} />}
        </nav>
      </div>
    </header>
  );
}