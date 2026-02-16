"use client";

import { createContext, useContext, useMemo, useRef, useState } from "react";

// ✅ NUEVO: Tipo para variante
export type CartItemVariant = {
  variantId: string;
  attributes: {
    talla?: string;
    color?: string;
    diseño?: string;
    [key: string]: string | undefined;
  };
};

export type CartItem = {
  id: string;
  name: string;
  price: number | null;
  qty: number;
  variant?: CartItemVariant; // ✅ NUEVO: Campo opcional para variantes
};

type CartToast = {
  open: boolean;
  text: string;
};

type CartContextType = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "qty">, qty?: number, variant?: CartItemVariant) => void; // ✅ MODIFICADO
  removeItem: (id: string, variantId?: string) => void; // ✅ MODIFICADO
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

  // ✅ MODIFICADO: addItem ahora acepta variantes
  const addItem: CartContextType["addItem"] = (item, qty = 1, variant) => {
    setItems((prev) => {
      // Si tiene variante, buscar por ID + variantId
      if (variant) {
        const i = prev.findIndex(
          (p) => p.id === item.id && p.variant?.variantId === variant.variantId
        );
        
        if (i >= 0) {
          const copy = [...prev];
          copy[i] = { ...copy[i], qty: copy[i].qty + qty };
          return copy;
        }
        
        return [...prev, { ...item, qty, variant }];
      }
      
      // Sin variante (producto normal)
      const i = prev.findIndex((p) => p.id === item.id && !p.variant);
      if (i >= 0) {
        const copy = [...prev];
        copy[i] = { ...copy[i], qty: copy[i].qty + qty };
        return copy;
      }
      
      return [...prev, { ...item, qty }];
    });

    // ✅ Toast con variante si aplica
    const variantText = variant
      ? ` (${Object.values(variant.attributes).filter(Boolean).join(" / ")})`
      : "";
    showToast(`Agregado: ${item.name}${variantText}`);
  };

  // ✅ MODIFICADO: removeItem ahora puede remover por variantId
  const removeItem: CartContextType["removeItem"] = (id, variantId) => {
    setItems((prev) =>
      prev.filter((p) => {
        if (variantId) {
          return !(p.id === id && p.variant?.variantId === variantId);
        }
        return p.id !== id;
      })
    );
  };

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