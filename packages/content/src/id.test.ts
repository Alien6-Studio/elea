import assert from "node:assert/strict";
import { test } from "node:test";
import { generateId } from "./id.js";

test("generateId returns unique UUIDs", () => {
  const ids = new Set(Array.from({ length: 50 }, generateId));
  assert.equal(ids.size, 50);
  for (const id of ids) assert.match(id, /^[0-9a-f-]{36}$/);
});

test("generateId draws from the platform generator where randomUUID is missing", () => {
  Object.defineProperty(globalThis.crypto, "randomUUID", { value: undefined, configurable: true });
  try {
    const ids = new Set(Array.from({ length: 50 }, generateId));
    assert.equal(ids.size, 50);
    for (const id of ids) assert.match(id, /^[0-9a-f]{32}$/);
  } finally {
    delete (globalThis.crypto as { randomUUID?: unknown }).randomUUID;
  }
  assert.match(generateId(), /^[0-9a-f-]{36}$/);
});
