"use client";

import { createContext, useContext, useMemo, useRef, useState } from "react";

export type CartItem = {
  id: string;
  name: string;
  price: number | null;
  qty: number;
};

type CartToast = {
  open: boolean;
  text: string;
};

type CartContextType = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "qty">, qty?: number) => void;
  removeItem: (id: string) => void;
  clear: () => void;
  total: number;
  count: number;

  // ✅ Toast simple
  toast: CartToast;
  hideToast: () => void;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [toast, setToast] = useState<CartToast>({ open: false, text: "" });
  const toastTimer = useRef<number | null>(null);

  const hideToast = () => {
    setToast((t) => ({ ...t, open: false }));
    if (toastTimer.current) {
      window.clearTimeout(toastTimer.current);
      toastTimer.current = null;
    }
  };

  const showToast = (text: string) => {
    setToast({ open: true, text });

    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => {
      setToast((t) => ({ ...t, open: false }));
      toastTimer.current = null;
    }, 1100);
  };

  const addItem: CartContextType["addItem"] = (item, qty = 1) => {
    setItems((prev) => {
      const i = prev.findIndex((p) => p.id === item.id);
      if (i >= 0) {
        const copy = [...prev];
        copy[i] = { ...copy[i], qty: copy[i].qty + qty };
        return copy;
      }
      return [...prev, { ...item, qty }];
    });

    // ✅ Feedback: “Agregado ✓”
    showToast(`Agregado: ${item.name}`);
  };

  const removeItem: CartContextType["removeItem"] = (id) =>
    setItems((prev) => prev.filter((p) => p.id !== id));

  const clear = () => setItems([]);

  const { total, count } = useMemo(() => {
    const t = items.reduce((s, it) => s + (Number(it.price) || 0) * it.qty, 0);
    const c = items.reduce((s, it) => s + it.qty, 0);
    return { total: t, count: c };
  }, [items]);

  const value: CartContextType = {
    items,
    addItem,
    removeItem,
    clear,
    total,
    count,
    toast,
    hideToast,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
