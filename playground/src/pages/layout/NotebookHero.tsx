"use client";

import { useId, useState } from "react";
import { Button, Hero } from "@alien6-studio/elea-ui";

export function NotebookHero() {
  const [open, setOpen] = useState(false);
  const excerpt = useId();
  return (
    <Hero
      layout="cover"
      headingLevel="h3"
      eyebrow="Field notes"
      heading="The glacier notebook"
      description={<>
        An aerial study of the ridges and crevasses that ice leaves behind.
        <p id={excerpt} hidden={!open}>From above, the ice reads like a map. Fine blue lines gather into deep folds where the glacier bends around the rock.</p>
      </>}
      actions={<Button aria-expanded={open} aria-controls={excerpt} onClick={() => setOpen(!open)}>
        {open ? "Close the notebook" : "Open the notebook"}
      </Button>}
      image={{
        src: "/elea/assets/glacier.webp",
        srcSet: "/elea/assets/glacier-560.webp 560w, /elea/assets/glacier.webp 1050w",
        sizes: "(min-width: 75rem) 52rem, (min-width: 55rem) 65vw, 100vw",
        alt: "Deep blue crevasses crossing the white surface of a glacier",
        width: 1050, height: 525, loading: "lazy",
      }}
    />
  );
}
