import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const command = fileURLToPath(new URL("release-notes.mjs", import.meta.url));
const tag = "v1.2.3";
function checkout(t, changelog) {
  const directory = mkdtempSync(join(tmpdir(), "elea-notes-"));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  const write = (file, body) => {
    const path = join(directory, file);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, body);
  };
  write("package.json", JSON.stringify({ version: "1.2.3" }));
  write("packages/ui/package.json", JSON.stringify({ name: "@example/ui", version: "1.2.3" }));
  write("packages/ui/README.md", "# UI");
  write("docs/release.md", "# Releases");
  write("docs/examples/theme-shapes.mjs", "export {};");
  write("CHANGELOG.md", changelog);
  return directory;
}
function notes(cwd) {
  return spawnSync(process.execPath, [command, tag], {
    cwd, encoding: "utf8", env: { ...process.env, GITHUB_REPOSITORY: "example/elea" },
  });
}

test("release notes contain only the selected section and documentation at the signed tag", t => {
  const draft = notes(checkout(t, "## Unreleased\nFuture work\n\n## 1.2.3 - 2026-01-01\n\n### Changed\n\n- Use the new public export.\n\n## 1.2.2\nPast work.\n"));
  assert.equal(draft.status, 0, draft.stderr);
  assert.match(draft.stdout, /Use the new public export/);
  assert.doesNotMatch(draft.stdout, /Future work|Past work/);
  for (const path of ["packages/ui/README.md", "docs/release.md", "CHANGELOG.md", "docs/examples/theme-shapes.mjs"]) {
    assert.ok(draft.stdout.includes(`https://github.com/example/elea/blob/${tag}/${path}`));
  }
  assert.ok(draft.stdout.includes(`git clone --depth 1 --branch ${tag}`));
});

test("publication requires one exact nonempty version section and the example on disk", t => {
  for (const changelog of ["## Unreleased\nA different version", "## 1.2.30\nLater release",
    "## 1.2.3\n### Changes\n<!-- to be filled -->", "## 1.2.3\nFirst\n## 1.2.3\nSecond"]) {
    assert.notEqual(notes(checkout(t, changelog)).status, 0, changelog);
  }
  const cwd = checkout(t, "## 1.2.3\nNew version notes.");
  rmSync(join(cwd, "docs/examples/theme-shapes.mjs"));
  assert.notEqual(notes(cwd).status, 0);
});
