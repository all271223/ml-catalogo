// src/app/components/wa.ts

export type WAItem = {
  id?: string;
  name: string;
  qty: number;
  price: number | null;
};


function formatCLP(n: number) {
  return Intl.NumberFormat("es-CL").format(Math.round(n));
}

/**
 * Retorna una URL lista para abrir en window.open(...)
 * usando el teléfono definido en NEXT_PUBLIC_WHATSAPP_PHONE.
 */
export function buildWhatsAppMessage(items: WAItem[], total: number): string {
  const phoneRaw = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || "";
  const phone = phoneRaw.replace(/[^\d]/g, ""); // deja solo números

  const lines: string[] = [];
  lines.push("🛒 *Pedido desde mi catálogo*");
  lines.push("");
  lines.push("*Productos:*");

  for (const it of items) {
    const price = Number(it.price) || 0;
    const subtotal = price * it.qty;
    lines.push(`• ${it.name} x${it.qty} — $${formatCLP(subtotal)}`);
  }

  lines.push("");
  lines.push(`*Total:* $${formatCLP(Number(total) || 0)}`);
  lines.push("_Enviado desde el catálogo_");

  const text = encodeURIComponent(lines.join("\n"));

  return `https://wa.me/${phone}?text=${text}`;
}
