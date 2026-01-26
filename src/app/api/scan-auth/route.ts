// src/app/api/scan-auth/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

type ScanAuthBody = {
  password?: unknown;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ScanAuthBody;
    const password = typeof body.password === "string" ? body.password : "";
    const expected = process.env.SCAN_PASSWORD || "";

    if (!expected) {
      return NextResponse.json(
        { error: "SCAN_PASSWORD no está configurado en .env.local" },
        { status: 500 }
      );
    }

    if (password !== expected) {
      return NextResponse.json(
        { error: "Clave incorrecta" },
        { status: 401 }
      );
    }

    const res = NextResponse.json({ ok: true }, { status: 200 });

    // Cookie de sesión del escáner (8 horas)
    res.cookies.set("scan_auth", "1", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 8 * 60 * 60,
    });

    return res;
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Error inesperado";

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
