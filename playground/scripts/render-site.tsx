import { copyFileSync, mkdirSync, writeFileSync } from "node:fs";
import { renderToStaticMarkup, renderToString } from "react-dom/server";
import { Button } from "@alien6-studio/elea-ui";
import { sitePath } from "../src/links.js";
import { NotFound } from "../src/components/NotFound.js";
import { GlyphCarousel } from "../src/components/GlyphCarousel.js";
import { SiteHeader } from "../src/components/SiteHeader.js";
import { SiteFooter } from "../src/components/SiteFooter.js";
import { featuredColourThemes, makeBrandTheme, studioTheme } from "../src/pages/brandTheme.js";
import { SiteHome } from "./site-home.js";

const assets = new URL("../../docs/assets/", import.meta.url);
const templates = new URL("../../overrides/", import.meta.url);
mkdirSync(new URL("fonts/", assets), { recursive: true });

const styles = [
  ["@alien6-studio/elea-tokens/elea.css", "elea.css"],
  ["@alien6-studio/elea-tokens/typography.css", "type-roles.css"],
  ["@alien6-studio/elea-tokens/editions.css", "editions.css"],
  ["@alien6-studio/elea-ui/styles.css", "elea-ui.css"],
  ["@alien6-studio/elea-content-viewer/styles.css", "elea-viewer.css"],
] as const;
for (const [specifier, target] of styles) {
  copyFileSync(new URL(import.meta.resolve(specifier)), new URL(target, assets));
}
// The default scope also supplies a fallback for old or unavailable stored profiles.
const profileStyles = [
  makeBrandTheme(studioTheme("reserve"), "elea-site").css,
  ...featuredColourThemes.filter(id => id !== "reserve").map(id => makeBrandTheme(studioTheme(id), `elea-site-${id}`).css),
];
writeFileSync(new URL("site-profile.css", assets), profileStyles.join("\n"));

for (const file of ["elea-sans.css", "ELEASans-Variable.woff2", "ELEASans-Italic-Variable.woff2"]) {
  const source = import.meta.resolve(`@alien6-studio/elea-tokens/fonts/${file}`);
  copyFileSync(new URL(source), new URL(`fonts/${file}`, assets));
}

const fonts = [
  ["instrument-sans", "normal"],
  ["instrument-sans", "italic"],
  ["roboto", "normal"],
  ["roboto", "italic"],
] as const;
for (const [family, style] of fonts) {
  const file = `${family}-latin-wght-${style}.woff2`;
  const source = import.meta.resolve(`@fontsource-variable/${family}/files/${file}`);
  copyFileSync(new URL(source), new URL(`fonts/${file}`, assets));
}
for (const family of ["instrument-sans", "roboto"]) {
  const license = import.meta.resolve(`@fontsource-variable/${family}/LICENSE`);
  copyFileSync(new URL(license), new URL(`fonts/${family}-license.txt`, assets));
}

writeFileSync(new URL("header-home.html", templates), renderToStaticMarkup(<SiteHeader />));
writeFileSync(new URL("header-docs.html", templates), renderToStaticMarkup(<SiteHeader section="docs" />));
writeFileSync(new URL("header-research.html", templates), renderToStaticMarkup(<SiteHeader section="research" />));
writeFileSync(new URL("not-found.html", templates), renderToStaticMarkup(<NotFound />));
writeFileSync(new URL("header-typography.html", templates), renderToStaticMarkup(<SiteHeader section="typography" />));
writeFileSync(new URL("typography-cover.html", templates), renderToString(
  <header className="type-cover">
    <h1>Typography</h1>
    <div className="type-cover__family">
      <p className="type-cover__title">ELEA <em>Sans</em></p>
      <div className="type-cover__download">
        <Button href={`${sitePath}assets/ELEA-Sans.zip`} download="ELEA-Sans.zip" trailingIcon="↓">Download ELEA Sans</Button>
        <span>TTF + WOFF2</span>
      </div>
    </div>
    <div id="glyph-carousel"><GlyphCarousel /></div>
    <p className="type-cover__details">Variable typeface <span>Roman &amp; italic <span aria-hidden="true">·</span> 100–900</span></p>
  </header>
));
writeFileSync(new URL("site-home.html", templates), renderToStaticMarkup(<SiteHome />));
writeFileSync(new URL("site-footer.html", templates), renderToStaticMarkup(<SiteFooter />));
