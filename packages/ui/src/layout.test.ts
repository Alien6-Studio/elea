import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const css = readFileSync(new URL("./css/layout.css", import.meta.url), "utf8");
const columns = [...css.matchAll(/\.elea-grid \{[^}]*grid-template-columns: repeat\((\d+), minmax\(0, 1fr\)\)/g)].map(match => Number(match[1]));

test("the ruling has four, eight and twelve equal columns and a nested grid takes its lines", () => {
  assert.deepEqual(columns, [4, 8, 12]);
  assert.deepEqual([...css.matchAll(/@media \(min-width: (\d+rem)\)/g)].map(match => match[1]), ["48rem", "72rem"]);
  assert.match(css, /\.elea-grid > \.elea-grid \{ grid-template-columns: subgrid; \}/);
});

test("a block takes the whole line by default, and each ruling offers every span and start it has columns for", () => {
  assert.match(css, /:where\(\.elea-grid > \*\) \{ grid-column: 1 \/ -1;/);
  css.split("@media").forEach((block, index) => {
    const count = columns[index]!;
    const tier = ["", "md-", "lg-"][index]!;
    const numbers = Array.from({ length: count }, (_, column) => column + 1);
    const spans = [...block.matchAll(/\.elea-col-([a-z]+-)?(\d+) \{ grid-column: auto \/ span (\d+); \}/g)];
    const starts = [...block.matchAll(/\.elea-start-([a-z]+-)?(\d+) \{ grid-column-start: (\d+); \}/g)];
    for (const rules of [spans, starts]) {
      assert.ok(rules.every(rule => (rule[1] ?? "") === tier && rule[2] === rule[3]), `${count} columns`);
      assert.deepEqual(rules.map(rule => Number(rule[2])), numbers, `${count} columns`);
    }
    // A start stated with a span at the same width wins: it comes after
    assert.ok(block.indexOf(`.elea-start-${tier}1 `) > block.indexOf(`.elea-col-${tier}${count} `), `${count} columns`);
  });
});

test("the frame and the gutter are stated once, where a host or another sheet reads them", () => {
  const root = /:root \{([^}]*)\}/.exec(css)![1]!;
  for (const name of ["width", "margin", "gutter"]) {
    assert.ok(root.includes(`--elea-layout-${name}: `), name);
    assert.ok(css.includes(`var(--elea-layout-${name})`), name);
  }
});

test("a rail states the measure it needs, and two columns hold it in the default frame", () => {
  assert.match(css, /@property --elea-layout-measure \{ syntax: "<length>"; inherits: false; initial-value: 0px; \}/);
  assert.match(css, /\.elea-grid__rail \{ --elea-layout-measure: 9rem; \}/);
  // Where each ruling begins its columns are narrowest: margins of 4.4vi and gutters of 2.4vi
  const rail = (viewport: number, count: number) => {
    const [frame, gutter] = [viewport - 2 * 0.044 * viewport, 0.024 * viewport];
    return (2 * (frame - (count - 1) * gutter)) / count + gutter;
  };
  assert.ok(rail(48, 8) >= 9);
  assert.ok(rail(72, 12) >= 9);
});
