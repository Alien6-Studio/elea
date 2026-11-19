import { mkdtempSync, readFileSync, writeFileSync, mkdirSync, rmSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

// Packs every workspace and installs the archives together in a throwaway
// consumer, so workspace dependencies resolve from the packed files and never
// from the registry. Each entry point is then imported as a consumer would.
const root = dirname(dirname(fileURLToPath(import.meta.url)));
const workspaces = readdirSync(join(root, "packages")).map((dir) =>
  JSON.parse(readFileSync(join(root, "packages", dir, "package.json"), "utf8")),
);
const temporary = mkdtempSync(join(tmpdir(), "elea-consumer-"));
const consumer = join(temporary, "consumer");
mkdirSync(consumer);
writeFileSync(join(consumer, "package.json"), JSON.stringify({ private: true, type: "module" }));
const userConfig = join(temporary, "empty.npmrc");
writeFileSync(userConfig, "registry=https://registry.npmjs.org\n");
const env = { ...process.env, npm_config_userconfig: userConfig };
delete env.NODE_AUTH_TOKEN;
delete env.NPM_TOKEN;

function run(command, args, cwd = consumer, capture = false) {
  const result = spawnSync(command, args, { cwd, env, encoding: "utf8", stdio: capture ? "pipe" : "inherit" });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`${command} failed (${result.status})${capture ? `: ${result.stderr}` : ""}`);
  return result.stdout;
}

try {
  const packed = JSON.parse(run("npm", ["pack", "--workspaces", "--json", "--pack-destination", temporary], root, true));
  const archives = packed.map((entry) => join(temporary, entry.filename));
  if (archives.length !== workspaces.length) throw new Error(`Expected ${workspaces.length} archives, packed ${archives.length}`);
  run("npm", ["install", "--ignore-scripts", "--no-audit", "--no-fund", "--registry=https://registry.npmjs.org", ...archives]);
  const imports = workspaces
    .map((pkg, index) => `import * as m${index} from ${JSON.stringify(pkg.name)};\nassert.ok(Object.keys(m${index}).length > 0, ${JSON.stringify(pkg.name + " exports nothing")});`)
    .join("\n");
  writeFileSync(join(consumer, "consume.mjs"), `import assert from 'node:assert/strict';\n${imports}\nconsole.log('consumer imports verified: ${workspaces.length} packages');\n`);
  run("node", ["consume.mjs"]);
} finally {
  rmSync(temporary, { recursive: true, force: true });
}
