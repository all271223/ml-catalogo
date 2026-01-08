"use client";

import { useCart } from "./CartContext";
import { buildWhatsAppMessage } from "./wa";

export default function CartBar() {
  const { items, total, clear } = useCart();

  const phone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || ""; // ej: 56912345678
  const msg = buildWhatsAppMessage(
    items.map((i) => ({ id: i.id, name: i.name, price: i.price, qty: i.qty })),
    total
  );

  const waHref = phone
    ? `https://wa.me/${phone}?text=${encodeURIComponent(msg)}`
    : undefined;

  if (!items.length) {
    // barra discreta cuando no hay items
    return (
      <div className="mx-auto mb-3 max-w-6xl px-3">
        <div className="rounded-2xl bg-white/95 p-3 text-sm text-gray-600 shadow ring-1 ring-black/5 backdrop-blur">
          Carrito vacío
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto mb-3 max-w-6xl px-3">
      <div className="flex flex-col gap-3 rounded-2xl bg-white/95 p-3 shadow-lg ring-1 ring-black/5 backdrop-blur md:flex-row md:items-center md:justify-between">
        <div className="text-sm">
          <strong>{items.reduce((a, b) => a + b.qty, 0)}</strong> ítem(s) ·{" "}
          <strong>
            ${new Intl.NumberFormat("es-CL").format(total)}
          </strong>
        </div>

        <div className="flex flex-1 flex-wrap justify-end gap-2">
          <button
            onClick={clear}
            className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
            aria-label="Vaciar carrito"
          >
            Vaciar
          </button>

          {waHref ? (
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
            >
              Enviar por WhatsApp
            </a>
          ) : (
            <span className="rounded-lg bg-gray-300 px-4 py-2 text-sm text-white">
              Configura NEXT_PUBLIC_WHATSAPP_PHONE
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
