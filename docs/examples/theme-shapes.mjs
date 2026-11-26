// From a source checkout: npm ci && npm run build:packages && node docs/examples/theme-shapes.mjs
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { createElement as h } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { createThemeProfile, makeBrandTheme } from "@alien6-studio/elea-tokens/brand";
import { colorThemes } from "@alien6-studio/elea-tokens/palette";
import { Button, Card, CardTitle, Field, Input, RadioGroup } from "@alien6-studio/elea-ui";

const output = new URL("../../artifacts/examples/theme-shapes/", import.meta.url);
mkdirSync(new URL("fonts/", output), { recursive: true });

for (const [entry, destination] of [
  ["@alien6-studio/elea-ui/styles.css", "ui.css"],
  ["@alien6-studio/elea-tokens/elea.css", "tokens.css"],
  ...["elea-sans.css", "ELEASans-Variable.woff2", "ELEASans-Italic-Variable.woff2"]
    .map(file => ["@alien6-studio/elea-tokens/fonts/" + file, "fonts/" + file]),
]) {
  copyFileSync(new URL(import.meta.resolve(entry)), new URL(destination, output));
}

const { version } = JSON.parse(readFileSync(new URL(import.meta.resolve("@alien6-studio/elea-tokens/package.json")), "utf8"));
const profiles = Object.entries(colorThemes).filter(([, scheme]) => "profile" in scheme);
const styles = profiles.map(([id]) => makeBrandTheme(createThemeProfile(id), "elea-" + id).css);
writeFileSync(new URL("profiles.css", output), styles.join("\n"));

function example([id, theme]) {
  return h(Card, { key: id, "data-elea-theme": id },
    h(CardTitle, { as: "h2" }, theme.name),
    h("form", null,
      h(Field, { label: "Publication title" }, control => h(Input, { ...control, defaultValue: "Field notes" })),
      h(RadioGroup, {
        label: "Format", name: "format-" + id, defaultValue: "print",
        options: [{ value: "print", label: "Print" }, { value: "web", label: "Web" }],
      }),
      h(Button, { type: "reset" }, "Reset settings"),
    ),
  );
}

const grid = renderToStaticMarkup(h("main", null,
  h("h1", null, "Theme shapes"),
  h("p", null, version === "0.0.0" ? "ELEA development snapshot" : "ELEA " + version),
  h("div", { className: "profiles" }, profiles.map(example)),
));
const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>ELEA theme shapes</title>
<link rel="stylesheet" href="tokens.css"><link rel="stylesheet" href="ui.css"><link rel="stylesheet" href="profiles.css">
<style>
  body { margin: 0; font-family: var(--elea-font-family-sans); background: var(--elea-color-surface-default); color: var(--elea-color-text-default); }
  main { max-width: 72rem; margin: auto; padding: clamp(1rem, 4vw, 3rem); }
  .profiles { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr)); gap: 1rem; }
  form { display: grid; gap: 1rem; margin-block-start: 1rem; }
  form button { justify-self: start; }
</style></head><body>${grid}</body></html>\n`;
const index = new URL("index.html", output);
writeFileSync(index, html);
console.log("Theme shapes example written to", fileURLToPath(index));
