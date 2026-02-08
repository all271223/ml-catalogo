"use client";

import { CartProvider } from "./CartContext";
import CartToast from "./CartToast";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      {children}
      <CartToast />
    </CartProvider>
  );
}
