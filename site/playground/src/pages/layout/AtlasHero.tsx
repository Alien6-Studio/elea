"use client";

import { useId, useState } from "react";
import { Button, Hero } from "@alien6-studio/elea-ui";
import { colorThemes } from "@alien6-studio/elea-tokens/palette";

export function AtlasHero() {
  const [open, setOpen] = useState(false);
  const paletteId = useId();
  return <Hero headingLevel="h3" heading="The colour atlas"
    description={<>
      Three palettes drawn from painting and photography.
      <div id={paletteId} hidden={!open}>
        <dl style={{ display: "flex", flexWrap: "wrap", gap: "var(--elea-space-5)" }}>
          {(["rasance", "reserve", "braise"] as const).map(id => {
            const palette = colorThemes[id];
            return <div key={id}>
              <dt>{palette.name}</dt>
              <dd style={{ display: "flex", margin: 0 }}>
                {(["primary", "secondary", "tertiary"] as const).map(role => <span key={role}
                  role="img" aria-label={role + " " + palette.colours[role]}
                  style={{ width: "1.75rem", height: "1rem", backgroundColor: palette.colours[role] }} />)}
              </dd>
            </div>;
          })}
        </dl>
      </div>
    </>}
    actions={<Button variant="outline" aria-expanded={open} aria-controls={paletteId} onClick={() => setOpen(!open)}>
      {open ? "Close the palettes" : "Explore the palettes"}
    </Button>} />;
}
