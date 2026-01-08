// src/app/components/wa.ts
type CartItem = {
  id: string;
  name: string;
  price: number | null;
  qty: number;
};

export function buildWhatsAppMessage(items: CartItem[], total: number) {
  const lines: string[] = [];

  lines.push("🛒 *Pedido desde mi catálogo*");
  lines.push("");
  if (!items.length) {
    lines.push("_(carrito vacío)_");
  } else {
    lines.push("*Productos:*");
    for (const it of items) {
      const unit = Number(it.price) || 0;
      const line = `• ${it.name}  x${it.qty} — $${Intl.NumberFormat("es-CL").format(
        unit * it.qty
      )}`;
      lines.push(line);
    }
    lines.push("");
    lines.push(
      `*Total:* $${Intl.NumberFormat("es-CL").format(total)}`
    );
  }

  lines.push("");
  lines.push("_Enviado desde el catálogo_");

  return lines.join("\n");
}
