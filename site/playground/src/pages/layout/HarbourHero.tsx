"use client";

import { useState } from "react";
import { Button, Hero } from "@alien6-studio/elea-ui";

export function HarbourHero() {
  const [alternate, setAlternate] = useState(false);
  return (
    <Hero
      layout="split"
      mediaPosition="start"
      headingLevel="h3"
      eyebrow="Photographic composition"
      heading="Harbour light"
      description="A red beacon interrupts the long line of the sea. Where you place the horizon changes the weight of the photograph."
      actions={<Button variant="outline" aria-pressed={alternate} onClick={() => setAlternate(!alternate)}>Compare crops</Button>}
      image={{
        src: "/assets/harbour-light.webp",
        sources: [{
          media: alternate ? "(width > 40rem)" : "(max-width: 40rem)", srcSet: "/assets/harbour-light-square.webp",
          width: 600, height: 600,
        }],
        alt: "A red lighthouse on the far end of a breakwater under an overcast sky",
        width: 1536, height: 1024, loading: "lazy",
      }}
    />
  );
}
