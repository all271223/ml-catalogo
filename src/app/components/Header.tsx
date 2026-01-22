import Link from "next/link";
import { cookies } from "next/headers";
import HeaderActions from "./HeaderActions";
import HeaderNavLinks from "./HeaderNavLinks";
import { headerStyles as styles } from "./header.styles";

export default async function Header() {
  const cookieStore = await cookies();
  const isScanAuthed = cookieStore.has("scan_auth");

  const showScan =
    process.env.NODE_ENV === "development" ||
    process.env.SHOW_SCAN_BUTTON?.toLowerCase() === "true";

  // 👇 Detectar ruta actual desde headers
  const pathname = cookieStore.get("x-pathname")?.value || "";

  // ❌ Ocultar header solo en /scan/login
  if (pathname === "/scan/login") {
    return null;
  }

  return (
    <header style={styles.header}>
      <div style={styles.container}>
        <Link href="/" style={styles.brand}>
          ML-CATALOGO
        </Link>

        <nav style={styles.nav}>
          <HeaderNavLinks linkStyle={styles.link} />
          {showScan && <HeaderActions isScanAuthed={isScanAuthed} />}
        </nav>
      </div>
    </header>
  );
}
