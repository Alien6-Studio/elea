import { mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { LAYERS, animationsIn, bundle, keyframesIn, layered } from "../../../scripts/css.mjs";

// Ships every sheet of src/css on its own (dist/css/<component>.css), all of them as dist/styles.css,
// and dist/bundle.css, which imports the tokens before them.
// Motion is the base layer: it declares the opt-in factor and the shared entrances the components scale by.
const BASE = "motion.css";
const FIRST = ["button.css", "button-effects.css"];
const read = (name) => readFileSync(`src/css/${name}`, "utf8");
const sheets = readdirSync("src/css").filter((name) => name.endsWith(".css") && name !== BASE).sort();
const ordered = [...FIRST, ...sheets.filter((name) => !FIRST.includes(name))];
const dependencies = {
  "carousel.css": ["button.css"],
  "color-picker.css": ["field.css"],
  "combobox.css": ["field.css", "select.css"],
  "date-field.css": ["field.css", "button.css", "popover.css", "calendar.css"],
  "identifier-input.css": ["field.css"],
  "phone-input.css": ["field.css", "select.css", "combobox.css"],
  "multi-select.css": ["badge.css", "select.css"],
  "navbar.css": ["navigation-list.css"],
  "hero.css": ["responsive-image.css"],
  "search-autocomplete.css": ["field.css", "search-field.css"],
  "search-field.css": ["field.css"],
  "sidebar.css": ["navigation-list.css"],
  "stepper.css": ["button.css", "skeleton.css"],
};

// A sheet loaded alone still animates: it carries the shared keyframes it names
const shared = keyframesIn(read(BASE));
const keyframesOf = (css) => [...animationsIn(css)].filter((name) => shared.has(name) && !keyframesIn(css).has(name)).map((name) => shared.get(name));

mkdirSync("dist/css", { recursive: true });
writeFileSync(`dist/css/${BASE}`, `${LAYERS}\n${layered("base", read(BASE))}`);
const parts = ordered.map((name) => {
  const css = read(name);
  const standalone = [...(dependencies[name] ?? []).map(read), css].join("\n");
  const keyframes = keyframesOf(standalone);
  writeFileSync(`dist/css/${name}`, `${LAYERS}\n${keyframes.length > 0 ? layered("base", keyframes.join("\n")) : ""}${layered("components", standalone)}`);
  return css;
});
// The layout classes also ship without their prefix, for a page that owns its class names. Only on request:
// frame, grid, col-4 and start-2 are names another sheet of the host may already use.
writeFileSync("dist/css/layout-bare.css", `${LAYERS}\n${layered("components", read("layout.css").replaceAll(/(?<!-)elea-(?=frame|grid|col-|start-)/g, ""))}`);
writeFileSync("dist/styles.css", [
  "/* Elea UI primitives: every value comes from the tokens of @alien6-studio/elea-tokens (elea.css). */",
  LAYERS,
  layered("base", read(BASE)) + layered("components", parts.join("\n")),
].join("\n"));
writeFileSync("dist/bundle.css", bundle(["@alien6-studio/elea-tokens/elea.css", "./styles.css"]));
