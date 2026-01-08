"use client";

import { createContext, useContext, useMemo, useState } from "react";

export type CartItem = {
  id: string;
  name: string;
  price: number | null;
  qty: number;
};

type CartContextType = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "qty">, qty?: number) => void;
  removeItem: (id: string) => void;
  clear: () => void;
  total: number;
  count: number;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

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
  };

  const removeItem: CartContextType["removeItem"] = (id) =>
    setItems((prev) => prev.filter((p) => p.id !== id));

  const clear = () => setItems([]);

  const { total, count } = useMemo(() => {
    const t = items.reduce((s, it) => s + (Number(it.price) || 0) * it.qty, 0);
    const c = items.reduce((s, it) => s + it.qty, 0);
    return { total: t, count: c };
  }, [items]);

  const value: CartContextType = { items, addItem, removeItem, clear, total, count };
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
