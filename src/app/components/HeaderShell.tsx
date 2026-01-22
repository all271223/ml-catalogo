"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";

export default function HeaderShell() {
  const pathname = usePathname();

  // Ocultar header SOLO en el login del escáner
  if (pathname === "/scan/login") return null;

  return <Header />;
}
