import type { CSSProperties } from "react";

export const headerActionStyles: Record<string, CSSProperties> = {
  button: {
    padding: "8px 12px",
    border: "1px solid #ddd",
    borderRadius: 8,
    background: "#fff",
    color: "#111",
    cursor: "pointer",
    fontSize: 14,
    textDecoration: "none",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
  },
  danger: {
    border: "1px solid #f0b4b4",
    background: "#fff5f5",
  },
};
