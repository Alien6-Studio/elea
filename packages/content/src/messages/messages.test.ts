import assert from "node:assert/strict";
import { test } from "node:test";
import { en } from "./en.js";
import { fr } from "./fr.js";
import { formatMessage, withDefaultMessages } from "./types.js";

function keys(value: Record<string, unknown>, prefix = ""): string[] {
  return Object.entries(value).flatMap(([key, nested]) =>
    typeof nested === "object" && nested !== null ? keys(nested as Record<string, unknown>, `${prefix}${key}.`) : [`${prefix}${key}`],
  );
}

test("French and English carry the same keys and no empty label", () => {
  assert.deepEqual(keys(fr), keys(en));
  for (const section of Object.values(fr)) {
    for (const label of Object.values(section)) assert.ok(label.length > 0);
  }
});

test("withDefaultMessages merges a partial translation over the defaults", () => {
  const merged = withDefaultMessages({ toolbar: { bold: "Fett" }, unknown: { x: "y" } } as never, en);
  assert.equal(merged.toolbar.bold, "Fett");
  assert.equal(merged.toolbar.italic, en.toolbar.italic);
  assert.equal(merged.editor.startWriting, en.editor.startWriting);
  assert.equal("unknown" in merged, false);
  assert.equal(withDefaultMessages({ toolbar: undefined } as never, en).toolbar.bold, en.toolbar.bold);
});

test("formatMessage replaces named placeholders and leaves unknown ones", () => {
  assert.equal(formatMessage(en.viewer.listLevel, { level: 2 }), "Nested list level 2");
  assert.equal(formatMessage(fr.actions.addBlockType, { type: "Image" }), "Ajouter Image");
  assert.equal(formatMessage("{a} {b}", { a: "x" }), "x {b}");
  assert.equal(formatMessage("plain"), "plain");
});

test("a partial crop format translation inherits the remaining labels from its locale", () => {
  const messages = withDefaultMessages({ cropFormats: { format: "Cadrage" } }, fr);
  assert.deepEqual(messages.cropFormats, { ...fr.cropFormats, format: "Cadrage" });
});
