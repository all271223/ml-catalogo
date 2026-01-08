import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { CartProvider } from "./components/CartContext";
import CartBar from "./components/CartBar"; // 👈 nuevo import

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Catálogo ",
  description: "Mostrador de productos con gestión de stock y carrito.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang={typeof navigator !== "undefined" ? navigator.language.slice(0, 2) : "es"}
      suppressHydrationWarning
    >
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <CartProvider>
          {children}
          <CartBar /> {/* 👈 Barra del carrito visible en todo el sitio */}
        </CartProvider>
      </body>
    </html>
  );
}
