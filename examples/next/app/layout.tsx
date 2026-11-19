import type { ReactNode } from "react";
import "@alien6-studio/elea-tokens/elea.css";
import "@alien6-studio/elea-content-viewer/styles.css";
import "@alien6-studio/elea-media/styles.css";
import "@alien6-studio/elea-content-editor/styles.css";
import "@alien6-studio/elea-ui/styles.css";

export const metadata = { title: "Elea on Next.js", description: "The Elea content viewer in a server component and the editor behind the client boundary" };

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "var(--elea-font-family-sans)", background: "var(--elea-color-surface-default)", color: "var(--elea-color-text-default)" }}>
        <nav style={{ display: "flex", gap: "1rem", padding: "1rem 2rem", borderBottom: "1px solid var(--elea-color-border-default)" }}>
          <a href="/">Read (server component)</a>
          <a href="/edit">Edit (client component)</a>
        </nav>
        <main style={{ maxWidth: "48rem", margin: "0 auto", padding: "2rem" }}>{children}</main>
      </body>
    </html>
  );
}
