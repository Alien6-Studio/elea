import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const css = readFileSync(new URL("./css/layout.css", import.meta.url), "utf8");
const columns = [...css.matchAll(/\.elea-grid \{[^}]*grid-template-columns: repeat\((\d), minmax\(0, 1fr\)\)/g)].map(match => Number(match[1]));

test("the ruling has two, four and six equal columns and a nested grid takes its lines", () => {
  assert.deepEqual(columns, [2, 4, 6]);
  assert.deepEqual([...css.matchAll(/@media \(min-width: (\d+rem)\)/g)].map(match => match[1]), ["48rem", "72rem"]);
  assert.match(css, /\.elea-grid > \.elea-grid \{ grid-template-columns: subgrid; \}/);
});

test("a block takes the whole line by default and never spans more columns than the ruling has", () => {
  assert.match(css, /:where\(\.elea-grid > \*\) \{ grid-column: 1 \/ -1;/);
  const rulings = css.split("@media").map((block, index) => ({ count: columns[index]!, spans: [...block.matchAll(/span (\d)/g)].map(match => Number(match[1])) }));
  for (const { count, spans } of rulings) assert.ok(spans.every(span => span <= count), `${count} columns`);
});

test("the frame and the gutter can be set by the host", () => {
  for (const name of ["width", "margin", "gutter"]) assert.ok(css.includes(`var(--elea-layout-${name}, `), name);
});
