// src/app/api/scan-auth/route.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const password = String(body?.password ?? "");

    const expected = process.env.SCAN_PASSWORD || "";

    if (!expected) {
      return NextResponse.json(
        { error: "SCAN_PASSWORD no está configurado en .env.local" },
        { status: 500 }
      );
    }

    if (password !== expected) {
      return NextResponse.json({ error: "Clave incorrecta" }, { status: 401 });
    }

    const res = NextResponse.json({ ok: true }, { status: 200 });

    res.cookies.set("scan_auth", "1", {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? String(e) }, { status: 500 });
  }
}
