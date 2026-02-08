"use client";

import { useCart } from "./CartContext";

export default function CartToast() {
  const { toast, hideToast } = useCart();

  if (!toast.open) return null;

  return (
    <div className="fixed inset-x-0 bottom-4 z-[70] flex justify-center px-4">
      <button
        type="button"
        onClick={hideToast}
        className="flex max-w-md items-center gap-2 rounded-2xl bg-gray-900 px-4 py-3 text-sm font-medium text-white shadow-lg ring-1 ring-black/10"
        aria-label="Cerrar notificación"
      >
        <span className="text-base">✅</span>
        <span className="truncate">{toast.text}</span>
      </button>
    </div>
  );
}
