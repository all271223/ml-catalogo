import type { CSSProperties } from "react";

export const headerStyles: Record<string, CSSProperties> = {
  header: {
    borderBottom: "1px solid #e5e5e5",
    padding: "12px 0",
    position: "sticky",
    top: 0,
    background: "white",
    zIndex: 50,
  },
  container: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "0 16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  brand: {
    fontWeight: 700,
    textDecoration: "none",
    color: "#111",
  },
  nav: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  link: {
    textDecoration: "none",
    color: "#111",
  },
};
