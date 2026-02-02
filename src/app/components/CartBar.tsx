"use client";

import { useState } from "react";
import { useCart } from "./CartContext";
import CartCheckoutModal from "./CartCheckoutModal";

export default function CartBar() {
  const { items, total, clear } = useCart();
  const [open, setOpen] = useState(false);

  const disabled = items.length === 0;

  return (
    <>
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
              onClick={() => setOpen(true)}
              disabled={disabled}
              className="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Finalizar
            </button>
          </div>
        </div>
      </div>

      <CartCheckoutModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
