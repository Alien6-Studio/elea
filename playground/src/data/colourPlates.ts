import rasance from "../assets/colour-themes/rasance.webp";
import reserve from "../assets/colour-themes/reserve.webp";
import braise from "../assets/colour-themes/braise.webp";
import horsChamp from "../assets/colour-themes/hors-champ.webp";

export const colourPlates = {
  rasance: { src: rasance, paper: "Ivory", alt: "A thin band of light crosses a black rock face." },
  reserve: { src: reserve, paper: "Porcelain", alt: "A curved ridge rises from a field of ultramarine pigment." },
  braise: { src: braise, paper: "Madder", alt: "Burgundy glass meets a glowing apricot edge." },
  "hors-champ": { src: horsChamp, paper: "Chalk", alt: "A small red sign stands against a pale blue wall." },
} as const;
