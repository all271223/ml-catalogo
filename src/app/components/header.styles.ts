import type { CSSProperties } from "react";

export const headerStyles: Record<string, CSSProperties> = {
  header: {
    position: "sticky",
    top: 0,
    zIndex: 50,
    background: "#ffffff",
    borderBottom: "1px solid #e5e7eb",
    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
  },

  container: {
    maxWidth: 1280, // un poco más ancho que antes
    margin: "0 auto",
    padding: "12px 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },

  brand: {
    fontWeight: 800,
    fontSize: "15px",
    letterSpacing: "0.3px",
    textDecoration: "none",
    color: "#111827",
  },

  nav: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },

  link: {
    textDecoration: "none",
    color: "#111827",
    fontSize: "14px",
  },
};
