"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { CSSProperties } from "react";

export default function HeaderNavLinks({ linkStyle }: { linkStyle: CSSProperties }) {
  const pathname = usePathname();
  const isHome = pathname === "/";

  if (isHome) return null;

  return (
    <Link href="/" style={linkStyle}>
      Catálogo
    </Link>
  );
}
