import { copyFileSync, mkdirSync, writeFileSync } from "node:fs";
import { renderToStaticMarkup } from "react-dom/server";
import { SiteHeader } from "../src/components/SiteHeader.js";
import { SiteFooter } from "../src/components/SiteFooter.js";
import { SiteHome } from "./site-home.js";

const assets = new URL("../../docs/assets/", import.meta.url);
const templates = new URL("../../overrides/", import.meta.url);
mkdirSync(new URL("fonts/", assets), { recursive: true });

const styles = [
  ["@alien6-studio/elea-tokens/elea.css", "elea.css"],
  ["@alien6-studio/elea-tokens/editions.css", "editions.css"],
  ["@alien6-studio/elea-ui/styles.css", "elea-ui.css"],
  ["@alien6-studio/elea-content-viewer/styles.css", "elea-viewer.css"],
] as const;
for (const [specifier, target] of styles) {
  copyFileSync(new URL(import.meta.resolve(specifier)), new URL(target, assets));
}

const fonts = [
  ["instrument-sans", "normal"],
  ["source-serif-4", "normal"],
  ["source-serif-4", "italic"],
] as const;
for (const [family, style] of fonts) {
  const file = `${family}-latin-wght-${style}.woff2`;
  const source = import.meta.resolve(`@fontsource-variable/${family}/files/${file}`);
  copyFileSync(new URL(source), new URL(`fonts/${file}`, assets));
}
for (const family of ["instrument-sans", "source-serif-4"]) {
  const license = import.meta.resolve(`@fontsource-variable/${family}/LICENSE`);
  copyFileSync(new URL(license), new URL(`fonts/${family}-license.txt`, assets));
}

writeFileSync(new URL("header-home.html", templates), renderToStaticMarkup(<SiteHeader />));
writeFileSync(new URL("header-docs.html", templates), renderToStaticMarkup(<SiteHeader section="docs" />));
writeFileSync(new URL("site-home.html", templates), renderToStaticMarkup(<SiteHome />));
writeFileSync(new URL("site-footer.html", templates), renderToStaticMarkup(<SiteFooter />));
