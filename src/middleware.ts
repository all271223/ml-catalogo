// src/middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Solo proteger rutas /scan
  if (!pathname.startsWith("/scan")) return NextResponse.next();

  // Dejar pasar la página de login
  if (pathname === "/scan/login") return NextResponse.next();

  // Dejar pasar el endpoint que valida la clave
  if (pathname.startsWith("/api/scan-auth")) return NextResponse.next();

  // Revisar cookie de autorización
  const ok = req.cookies.get("scan_auth")?.value === "1";

  if (!ok) {
    const url = req.nextUrl.clone();
    url.pathname = "/scan/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/scan/:path*"],
};
