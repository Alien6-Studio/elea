// What the stylesheets of every package share: Elea rules sit in cascade layers, so that a host
// rule or utility wins over a component default without matching its specificity.

/** The order of the layers, stated at the top of each sheet so that it holds whichever one loads first. */
export const LAYERS = "@layer elea.tokens, elea.base, elea.components;";

/** `css` inside the `elea.<name>` layer. */
export function layered(name, css) {
  return `@layer elea.${name} {\n${css.trim()}\n}\n`;
}

/** A sheet that imports `sheets` in order: a package's dependencies, then its own rules. */
export function bundle(sheets) {
  const imports = sheets.map((sheet) => `@import "${sheet}";`);
  return `${[LAYERS, ...imports].join("\n")}\n`;
}

/** Where the block that opens just before `start` closes, past its brace. */
function blockEnd(css, start) {
  let end = start;
  let depth = 1;
  while (depth > 0 && end < css.length) {
    if (css[end] === "{") depth += 1;
    else if (css[end] === "}") depth -= 1;
    end += 1;
  }
  return end;
}

/** `css` without its comments. */
export function withoutComments(css) {
  const [head, ...parts] = css.split("/*");
  return head + parts.map((part) => (part.includes("*/") ? part.slice(part.indexOf("*/") + 2) : "")).join("");
}

/** `value` without its functions: neither their names nor their arguments. */
function withoutFunctions(value) {
  let rest = "";
  let word = 0;
  let depth = 0;
  for (const character of value) {
    if (character === "(") {
      if (depth === 0) rest = rest.slice(0, word);
      depth += 1;
    } else if (character === ")") {
      depth -= 1;
      if (depth === 0) rest += " ";
    } else if (depth === 0) {
      rest += character;
      if (character === "," || character.trim() === "") word = rest.length;
    }
  }
  return rest;
}

/** The `@keyframes` rules of `css`, by name. */
export function keyframesIn(css) {
  const rules = new Map();
  for (const match of css.matchAll(/@keyframes\s+([\w-]+)\s*\{/g)) {
    rules.set(match[1], css.slice(match.index, blockEnd(css, match.index + match[0].length)));
  }
  return rules;
}

/** The names of the animations `css` runs. */
export function animationsIn(css) {
  const names = new Set();
  for (const [, value] of css.matchAll(/animation(?:-name)?\s*:([^;{}]*)/g)) {
    for (const word of withoutFunctions(value).split(/[\s,]+/)) {
      if (/^[a-z_][\w-]*$/i.test(word) && !ANIMATION_KEYWORDS.has(word)) names.add(word);
    }
  }
  return names;
}

const ANIMATION_KEYWORDS = new Set([
  "none", "infinite", "normal", "reverse", "alternate", "alternate-reverse", "forwards", "backwards", "both", "running", "paused",
  "linear", "ease", "ease-in", "ease-out", "ease-in-out", "step-start", "step-end", "inherit", "initial", "unset", "revert", "revert-layer",
]);

/** The custom properties `css` declares, and those it reads without a fallback. */
export function customPropertiesIn(css) {
  return {
    declared: new Set([...css.matchAll(/[;{\s](--[\w-]+)\s*:/g)].map((match) => match[1])),
    required: new Set([...css.matchAll(/var\(\s*(--[\w-]+)\s*\)/g)].map((match) => match[1])),
  };
}

/** The top-level layers of `css` in the order the cascade gives them, that of their first mention. */
export function layerOrder(css) {
  const source = withoutComments(css);
  const order = [];
  let at = source.indexOf("@layer");
  while (at !== -1) {
    const end = at + source.slice(at).search(/[;{]/);
    for (const name of source.slice(at + "@layer".length, end).split(",")) {
      const [top] = name.trim().split(".");
      if (top && !order.includes(top)) order.push(top);
    }
    at = source.indexOf("@layer", source[end] === "{" ? blockEnd(source, end + 1) : end);
  }
  return order;
}

/** What `css` leaves outside the Elea layers, once its comments, the order statement and its imports are set aside. */
export function unlayered(css) {
  const layer = /@layer elea\.(?:tokens|base|components)\s*\{/;
  let rest = withoutComments(css).replaceAll(LAYERS, "").replaceAll(/@import [^;]+;/g, "");
  let match = layer.exec(rest);
  while (match) {
    rest = rest.slice(0, match.index) + rest.slice(blockEnd(rest, match.index + match[0].length));
    match = layer.exec(rest);
  }
  return rest.trim();
}
