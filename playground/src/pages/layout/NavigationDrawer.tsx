"use client";

import { useState } from "react";
import { Button, Sheet } from "@alien6-studio/elea-ui";
import { LibrarySidebar, SpecimenPage } from "./LibrarySidebar.js";
import { usePreviewNavigation } from "./usePreviewNavigation.js";

export function NavigationDrawer() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const navigation = usePreviewNavigation("letterforms", close);

  return <>
    <div style={{ width: "100%", background: "var(--elea-color-surface-default)" }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: "var(--elea-space-3)", padding: "var(--elea-space-3) var(--elea-space-4)" }}>
        <strong>Design handbook</strong>
        <Button variant="outline" size="sm" aria-haspopup="dialog" onClick={() => setOpen(true)}>Contents</Button>
      </header>
      <SpecimenPage navigation={navigation} />
    </div>
    <Sheet open={open} onClose={close} side="start" size="sm"
      title="Handbook contents" closeLabel="Close contents">
      <LibrarySidebar navigation={navigation} />
    </Sheet>
  </>;
}
