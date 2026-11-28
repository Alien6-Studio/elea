"use client";

import { Navbar } from "@alien6-studio/elea-ui";
import { usePreviewNavigation } from "./usePreviewNavigation.js";

const tools = [
  { id: "crop", label: "Image crop", description: "The cover is framed at 16:9, ready for a 1600 × 900 export." },
  { id: "theme", label: "Theme studio", description: "The notebook uses the Réserve palette and ELEA Sans." },
  { id: "publishing", label: "Publishing", description: "The glacier notebook is a draft visible to its editors." },
];

export function EditorialTools() {
  const preview = usePreviewNavigation("editor");
  const selected = tools.find(tool => tool.id === preview.current);
  return <div style={{ width: "100%" }}>
    <Navbar label="Editorial tools" menuLabel="Menu" collapse="never" submenuLayout="columns"
      items={[
        { id: "editor", label: "Editor", href: "#editor" },
        { id: "tools", label: "Tools",
          children: tools.map(({ id, label }) => ({ id, label, href: "#" + id })) },
      ]}
      current={preview.current} render={preview.render}
    />
    <section aria-label="Tool preview" style={{ padding: "var(--elea-space-5)", minBlockSize: "7rem" }}>
      <h3 aria-live="polite" style={{ margin: 0, fontSize: "var(--elea-font-size-2xl)" }}>{selected?.label ?? "Editor"}</h3>
      <p>{selected?.description ?? "The glacier notebook · Cover, introduction and field notes."}</p>
    </section>
  </div>;
}
