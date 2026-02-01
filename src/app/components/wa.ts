// src/app/components/wa.ts

export type WAItem = {
  name: string;
  price: number; // en pesos
  qty: number;
};

function normalizePhone(raw: string) {
  // deja solo dígitos (ej: +56912345678 -> 56912345678)
  return (raw || "").replace(/[^\d]/g, "");
}

function formatCLP(n: number) {
  return Intl.NumberFormat("es-CL").format(Math.round(n));
}

function isMobileDevice() {
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent || "";
  return /Android|iPhone|iPad|iPod/i.test(ua);
}

export function buildWhatsAppMessage(items: WAItem[], total: number) {
  const phone = normalizePhone(process.env.NEXT_PUBLIC_WHATSAPP_PHONE || "");
  if (!phone) {
    // fallback "seguro" para no romper
    return "#";
  }

  const lines: string[] = [];
  lines.push("🛒 *Pedido desde mi catálogo*");
  lines.push("");
  lines.push("*Productos:*");

  for (const it of items) {
    const price = Number(it.price) || 0;
    const qty = Number(it.qty) || 0;
    const lineTotal = price * qty;
    lines.push(`• ${it.name} x${qty} — $${formatCLP(lineTotal)}`);
  }

  lines.push("");
  lines.push(`*Total:* $${formatCLP(Number(total) || 0)}`);
  lines.push("_Envía este mensaje para coordinar pago y despacho._");

  const text = encodeURIComponent(lines.join("\n"));

  // ✅ En móviles, este deep link evita el flujo “Compartir enlace”
  if (isMobileDevice()) {
    return `whatsapp://send?phone=${phone}&text=${text}`;
  }

  // ✅ Desktop / fallback
  return `https://wa.me/${phone}?text=${text}`;
}
