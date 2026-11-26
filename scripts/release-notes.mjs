import { readFileSync, readdirSync, statSync } from "node:fs";

const [tag] = process.argv.slice(2);
if (!/^v\d+\.\d+\.\d+$/.test(tag ?? "")) throw new Error("Expected a release tag such as v1.2.3");
const version = tag.slice(1);
const readJson = path => JSON.parse(readFileSync(path, "utf8"));
if (readJson("package.json").version !== version) throw new Error("The root package version must match the tag");

const changelog = readFileSync("CHANGELOG.md", "utf8").replaceAll("\r\n", "\n");
const headings = [...changelog.matchAll(/^## ([^\n]+)$/gm)];
const releases = headings.filter(([, heading]) => {
  const [release, separator, date, extra] = heading.trim().split(/\s+/, 4);
  return release === version && (separator === undefined ||
    (separator === "-" && /^\d{4}-\d{2}-\d{2}$/.test(date ?? "") && extra === undefined));
});
if (releases.length !== 1) throw new Error(`Expected exactly one CHANGELOG.md section for ${version}`);
const [heading] = releases;
const next = headings[headings.indexOf(heading) + 1];
const changes = changelog.slice(heading.index + heading[0].length, next?.index).trim();
const prose = changes.replaceAll(/<!--[\s\S]*?-->/g, "").replaceAll(/^#{1,6} .*$/gm, "").trim();
if (!prose) throw new Error(`Add integrator-facing release notes under CHANGELOG.md section ${version}`);

const repo = process.env.GITHUB_REPOSITORY ?? "Alien6-Studio/elea";
const source = `https://github.com/${repo}/blob/${tag}`;
function link(label, path) {
  if (!statSync(path).isFile()) throw new Error(`Missing release documentation: ${path}`);
  return `[${label}](${source}/${path})`;
}

const packages = [];
for (const entry of readdirSync("packages", { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  const directory = `packages/${entry.name}`;
  const workspace = readJson(`${directory}/package.json`);
  if (workspace.private) continue;
  if (workspace.version !== version) throw new Error(`${workspace.name} must match ${tag}`);
  packages.push(link(workspace.name, `${directory}/README.md`));
}
if (!packages.length) throw new Error("Expected at least one public workspace");

const example = link("theme shapes example", "docs/examples/theme-shapes.mjs");
console.log([
  changes, "", "## Documentation", "",
  ...packages.sort().map(item => `- ${item}`), "",
  `Read the ${link("release guide", "docs/release.md")} and the ${link("change history", "CHANGELOG.md")} for this tag.`,
  "", "## Reproduce the example", "",
  `Run the ${example} from this checkout with Node.js 22 or later.`, "",
  "```sh", `git clone --depth 1 --branch ${tag} https://github.com/${repo}.git elea`, "cd elea",
  "npm ci", "npm run build:packages", "node docs/examples/theme-shapes.mjs", "```", "",
  "Open `artifacts/examples/theme-shapes/index.html` in a browser.",
].join("\n"));
