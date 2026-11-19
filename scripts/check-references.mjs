import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

// Public repository guard: examples, tests and docs only ever name reserved
// example domains or well-known public services. A real host or mailbox in
// the tree is a mistake, whatever it belongs to.
const ALLOWED_HOSTS = new Set([
  "localhost", "127.0.0.1", "x",
  "github.com", "api.github.com", "img.shields.io", "alien6-studio.github.io",
  "registry.npmjs.org", "www.npmjs.com", "nodejs.org",
  "www.apache.org", "www.contributor-covenant.org", "tr.designtokens.org",
  "www.youtube.com", "m.youtube.com", "youtube.com", "youtube-nocookie.com", "www.youtube-nocookie.com", "youtu.be",
  "vimeo.com", "www.vimeo.com", "player.vimeo.com", "dailymotion.com", "www.dailymotion.com", "dai.ly",
]);
const RESERVED_DOMAIN = /(^|\.)(example|test|invalid|localhost)$|\.example\.(org|com|net)$|^example\.(org|com|net)$/;
const TEXT_EXTENSIONS = /\.(ts|tsx|js|mjs|cjs|json|md|css|yml|yaml|toml|txt|html)$/;
const SKIPPED = new Set(["package-lock.json"]);

const files = execFileSync("git", ["ls-files", "-z"], { encoding: "utf8" })
  .split("\0")
  .filter((file) => file && TEXT_EXTENSIONS.test(file) && !SKIPPED.has(file) && existsSync(file));

const problems = [];
for (const file of files) {
  const content = readFileSync(file, "utf8");
  for (const match of content.matchAll(/https?:\/\/([a-zA-Z0-9.-]+)/g)) {
    const host = match[1].toLowerCase().replace(/\.$/, "");
    if (!host) continue;
    if (!ALLOWED_HOSTS.has(host) && !RESERVED_DOMAIN.test(host)) problems.push(`${file}: host ${host}`);
  }
  for (const match of content.matchAll(/[a-zA-Z0-9._%+-]+@([a-zA-Z0-9.-]+\.[a-z]{2,})/g)) {
    const domain = match[1].toLowerCase();
    if (!RESERVED_DOMAIN.test(domain)) problems.push(`${file}: mailbox at ${domain}`);
  }
}

if (problems.length > 0) {
  console.error("Only reserved example domains and known public services may appear in the repository:");
  for (const problem of problems) console.error(`  ${problem}`);
  process.exit(1);
}
console.log(`references: ${files.length} files checked, only synthetic hosts and mailboxes`);
