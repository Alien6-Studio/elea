import assert from "node:assert/strict";
import { test } from "node:test";
import { PACKAGE_NAME } from "./index.js";

test("package name is stable", () => {
  assert.equal(PACKAGE_NAME, "@alien6-studio/elea-viewer");
});
