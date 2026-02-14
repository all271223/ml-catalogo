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
  const { items, total, clear, removeItem } = useCart();
  const hasItems = items.length > 0;

  const waUrl = useMemo(() => {
    if (!hasItems) return "";
    return buildWhatsAppMessage(
      items.map((i) => ({
        id: i.id,
        name: i.name,
        price: Number(i.price) || 0,
        qty: i.qty,
      })),
      Number(total) || 0
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
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-black/5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b px-5 py-4">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-gray-900">
              Finalizar por WhatsApp
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Revisa tu pedido y envíalo. Te respondemos para coordinar pago y
              despacho.
            </p>
          </div>

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
            <div className="rounded-xl border bg-gray-50 p-4 text-sm text-gray-700">
              Tu carrito está vacío.
            </div>
          ) : (
            <div className="space-y-4">
              {/* Resumen */}
              <div className="rounded-2xl border bg-white p-4">
                <div className="mb-3 text-sm font-semibold text-gray-900">
                  Resumen del pedido
                </div>

                <ul className="divide-y text-sm">
                  {items.map((it) => (
                    <li key={it.id} className="flex items-start gap-3 py-3">
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium text-gray-900">
                          {it.name}
                        </div>
                        <div className="mt-0.5 text-xs text-gray-500">
                          Cantidad: {it.qty}
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        <div className="font-semibold text-gray-900">
                          $
                          {new Intl.NumberFormat("es-CL").format(
                            (Number(it.price) || 0) * it.qty
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          $
                          {new Intl.NumberFormat("es-CL").format(
                            Number(it.price) || 0
                          )}
                          {" "}c/u
                        </div>
                      </div>

                      {/* Botón eliminar */}
                      <button
                        onClick={() => removeItem(it.id)}
                        className="shrink-0 rounded-full p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600 transition"
                        aria-label="Eliminar producto"
                        title="Eliminar"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>

                {/* Total destacado */}
                <div className="mt-4 rounded-xl bg-gray-50 p-4">
                  <div className="text-xs font-medium text-gray-600">Total</div>
                  <div className="mt-1 text-2xl font-semibold text-gray-900">
                    ${new Intl.NumberFormat("es-CL").format(Number(total) || 0)}
                  </div>
                </div>

                <p className="mt-3 text-center text-xs text-gray-500">
                  Se abrirá WhatsApp con tu pedido listo. Tú solo lo envías ✅
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-2 border-t bg-white px-5 py-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2 md:flex-row">
            <button
              onClick={onClose}
              className="w-full rounded-xl border px-4 py-2 text-sm hover:bg-gray-50 md:w-auto"
            >
              Volver
            </button>

            {hasItems ? (
              <button
                onClick={() => {
                  clear();
                  onClose();
                }}
                className="w-full rounded-xl px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 md:w-auto"
              >
                Vaciar carrito
              </button>
            ) : null}
          </div>

          {hasItems ? (
            <button
              onClick={() => {
                if (!waUrl) return;
                window.open(waUrl, "_blank", "noopener,noreferrer");
              }}
              className="w-full rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white hover:bg-green-700 md:w-auto"
            >
              Enviar por WhatsApp
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}