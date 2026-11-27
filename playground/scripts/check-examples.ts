import { readdirSync, readFileSync } from "node:fs";
import { basename, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import * as layoutSnippets from "../src/pages/layout/snippets.js";

/** The code shown under a demo must read as application code and fit its block without scrolling. */
const maxColumns = 80;
const forbidden: readonly [RegExp, string][] = [
  [/\bstyle=\{\{/, "inline style"],
  [/catalog-|demo__/, "site class"],
  [/#\/ui\b|\/elea\//, "site route"],
  [/bundle\.css/, "style sheet import"],
  [/\bexport default\b/, "default export"],
  [/(?<![A-Za-z])…/, "elided code"],
];

const root = fileURLToPath(new URL("../src/", import.meta.url));
const examples = join(root, "examples");
const problems: string[] = [];

function files(directory: string, extension: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return files(path, extension);
    return entry.name.endsWith(extension) ? [path] : [];
  });
}

function checkLines(name: string, source: string) {
  source.split("\n").forEach((line, index) => {
    if (line.length > maxColumns) problems.push(`${name}:${index + 1} has ${line.length} columns (limit ${maxColumns})`);
    if (line !== line.trimEnd()) problems.push(`${name}:${index + 1} has trailing whitespace`);
  });
}

const pages = files(join(root, "pages"), ".tsx").map(path => readFileSync(path, "utf8")).join("\n");

for (const path of files(examples, ".tsx")) {
  const name = relative(root, path);
  const source = readFileSync(path, "utf8");
  checkLines(name, source);
  for (const [pattern, label] of forbidden) {
    if (pattern.test(source)) problems.push(`${name} contains ${label}`);
  }
  // Shared helpers stand for files an application owns; they are imported by examples, not shown.
  if (basename(path) === "icons.tsx") continue;
  if (!source.includes('from "@alien6-studio/elea-ui"')) problems.push(`${name} does not import from the package`);
  if (!/^export function [A-Z]/m.test(source)) problems.push(`${name} does not export a named component`);
  if (!pages.includes(`${basename(path)}?raw"`)) problems.push(`${name} is not shown by any guide`);
}

for (const [name, source] of Object.entries(layoutSnippets)) checkLines(`pages/layout/snippets.ts ${name}`, source);

if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}
