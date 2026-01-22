import type { CSSProperties } from "react";

export const headerActionStyles: Record<string, CSSProperties> = {
  button: {
    padding: "8px 14px",
    border: "1px solid #ddd",
    borderRadius: 999, // botón pill
    background: "#ffffff",
    color: "#111",
    cursor: "pointer",
    fontSize: 14,
    textDecoration: "none",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    transition: "all 0.2s ease",
  },
  danger: {
    border: "1px solid #f0b4b4",
    background: "#fff5f5",
    color: "#b42323",
  },
};
