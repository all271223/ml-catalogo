// src/app/components/wa.ts

export type WAItem = {
  name: string;
  price: number;
  qty: number;
  variant?: { // ✅ NUEVO
    variantId: string;
    attributes: Record<string, string | undefined>;
  };
};

function normalizePhone(raw: string) {
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
    
    // ✅ Incluir variante si existe
    const variantText = it.variant
      ? ` (${Object.values(it.variant.attributes).filter(Boolean).join(", ")})`
      : "";
    
    lines.push(`• ${it.name}${variantText} x${qty} — $${formatCLP(lineTotal)}`);
  }

  lines.push("");
  lines.push(`*Total:* $${formatCLP(Number(total) || 0)}`);
  lines.push("_Envía este mensaje para coordinar pago y despacho._");

  const text = encodeURIComponent(lines.join("\n"));

  if (isMobileDevice()) {
    return `whatsapp://send?phone=${phone}&text=${text}`;
  }

  return `https://wa.me/${phone}?text=${text}`;
}