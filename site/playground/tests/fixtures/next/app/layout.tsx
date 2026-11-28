import type { ReactNode } from "react";
import "@alien6-studio/elea-tokens/elea.css";
import "@alien6-studio/elea-content-viewer/styles.css";
import "@alien6-studio/elea-media/styles.css";
import "@alien6-studio/elea-content-editor/styles.css";
import "@alien6-studio/elea-ui/styles.css";

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
