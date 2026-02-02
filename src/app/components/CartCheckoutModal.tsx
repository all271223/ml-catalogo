"use client";

import { useEffect, useMemo } from "react";
import { useCart } from "./CartContext";
import { buildWhatsAppMessage } from "./wa";

export default function CartCheckoutModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { items, total, clear } = useCart();
  const hasItems = items.length > 0;

  const waUrl = useMemo(() => {
    if (!hasItems) return "";
    return buildWhatsAppMessage(
      items.map((i) => ({
        id: i.id,
        name: i.name,
        price: Number(i.price) || 0, // ✅ fuerza number
        qty: i.qty,
      })),
      total
    );
  }, [items, total, hasItems]);

  // Cerrar con ESC
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="text-lg font-semibold">Finalizar por WhatsApp</h2>
          <button
            onClick={onClose}
            className="rounded-full px-3 py-1 text-sm text-gray-600 hover:bg-gray-100"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          {!hasItems ? (
            <div className="text-sm text-gray-600">Tu carrito está vacío.</div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-xl border bg-white p-3">
                <div className="mb-2 text-sm font-semibold">Resumen</div>

                <ul className="space-y-2 text-sm text-gray-700">
                  {items.map((it) => (
                    <li
                      key={it.id}
                      className="flex items-start justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="truncate">{it.name}</div>
                        <div className="text-xs text-gray-500">
                          Cantidad: {it.qty}
                        </div>
                      </div>
                      <div className="shrink-0 font-medium">
                        $
                        {new Intl.NumberFormat("es-CL").format(
                          (Number(it.price) || 0) * it.qty
                        )}
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="mt-3 flex items-center justify-between border-t pt-3 text-sm">
                  <span className="text-gray-600">Total</span>
                  <span className="font-semibold">
                    ${new Intl.NumberFormat("es-CL").format(total)}
                  </span>
                </div>
              </div>

              <p className="text-center text-xs text-gray-500">
                Se abrirá WhatsApp con tu pedido listo. Tú solo lo envías ✅
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-2 border-t px-5 py-4 md:flex-row md:justify-end">
          <button
            onClick={onClose}
            className="w-full rounded-lg border px-4 py-2 text-sm hover:bg-gray-50 md:w-auto"
          >
            Volver
          </button>

          {hasItems ? (
            <button
              onClick={() => {
                if (!waUrl) return;
                window.open(waUrl, "_blank");
              }}
              className="w-full rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 md:w-auto"
            >
              Abrir WhatsApp con el pedido
            </button>
          ) : null}

          {hasItems ? (
            <button
              onClick={() => {
                clear();
                onClose();
              }}
              className="w-full rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 md:w-auto"
            >
              Vaciar carrito
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
