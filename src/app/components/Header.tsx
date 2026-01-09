// src/app/components/Header.tsx
import Link from "next/link";
import { cookies } from "next/headers";
import HeaderActions from "./HeaderActions";

export default function Header() {
  const isScanAuthed = cookies().has("scan_auth");

  // Flag simple para mostrar/ocultar el acceso al escáner (opcional)
  const showScan =
    process.env.NEXT_PUBLIC_SHOW_SCAN_BUTTON?.toLowerCase() !== "false";

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

const styles: Record<string, React.CSSProperties> = {
  header: {
    borderBottom: "1px solid #e5e5e5",
    padding: "12px 0",
    position: "sticky",
    top: 0,
    background: "white",
    zIndex: 50,
  },
  container: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "0 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  brand: { fontWeight: 700, textDecoration: "none", color: "#111" },
  nav: { display: "flex", alignItems: "center", gap: 12 },
  link: { textDecoration: "none", color: "#111" },
};
