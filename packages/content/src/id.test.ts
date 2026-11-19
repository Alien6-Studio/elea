import assert from "node:assert/strict";
import { test } from "node:test";
import { generateId } from "./id.js";

test("generateId returns unique UUIDs", () => {
  const ids = new Set(Array.from({ length: 50 }, generateId));
  assert.equal(ids.size, 50);
  for (const id of ids) assert.match(id, /^[0-9a-f-]{36}$/);
});
