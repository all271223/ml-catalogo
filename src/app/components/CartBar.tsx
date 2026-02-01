"use client";

import { useMemo } from "react";
import { useCart } from "./CartContext";
import { buildWhatsAppMessage } from "./wa";

export default function CartBar() {
  const { items, total, clear } = useCart();

  const disabled = items.length === 0;

  const waUrl = useMemo(() => {
    // Convertimos price null -> 0 para no romper tipos ni el mensaje
    const waItems = items.map((i) => ({
      name: i.name,
      price: Number(i.price) || 0,
      qty: i.qty,
    }));

    return buildWhatsAppMessage(waItems, Number(total) || 0);
  }, [items, total]);

  function handleSendWhatsApp() {
    if (disabled) return;

    // ✅ Esto evita que el navegador trate el link como “compartir”
    // y lo abre como navegación directa (igual que en el modal)
    window.open(waUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="sticky top-0 z-40 border-b bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
          <div className="text-sm font-semibold">
            Carrito: {items.reduce((acc, i) => acc + i.qty, 0)} item(s)
          </div>
          <div className="text-xs text-gray-600">
            Total: ${Intl.NumberFormat("es-CL").format(Number(total) || 0)}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={clear}
            disabled={disabled}
            className="rounded-md border px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Vaciar
          </button>

          <button
            type="button"
            onClick={handleSendWhatsApp}
            disabled={disabled}
            className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Enviar por WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
}
