// MkDocs provides the static first slide. Vite serves this module in both preview and production.
import "@vitejs/plugin-react/preamble";
import { createElement } from "react";
import { hydrateRoot } from "react-dom/client";
import { GlyphCarousel } from "./src/components/GlyphCarousel.tsx";

hydrateRoot(document.getElementById("glyph-carousel"), createElement(GlyphCarousel));
