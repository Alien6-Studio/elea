import { readFileSync, realpathSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { repositorySnapshot } from "../src/data/repository.js";

const endpoint = "https://api.github.com/repos/Alien6-Studio/elea";

export function documentedRelease() {
  const versions = readFileSync(new URL("../../docs/versions.md", import.meta.url), "utf8");
  return versions.match(/https:\/\/github\.com\/Alien6-Studio\/elea\/releases\/tag\/(v[\w.-]+)\)/)?.[1];
}

export async function loadRepositoryMetadata(request = fetch) {
  async function read(url: string) {
    try {
      const response = await request(url, {
        headers: { Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" },
        signal: AbortSignal.timeout(4000),
      });
      if (response.ok) return await response.json();
    } catch {
      // Network failures affect only the unavailable facts. The repository link still works.
    }
    return undefined;
  }
  const [repo, release] = await Promise.all([read(endpoint), read(endpoint + "/releases/latest")]);
  return repositorySnapshot({ release: release?.tag_name ?? documentedRelease(), stars: repo?.stargazers_count, forks: repo?.forks_count });
}

if (process.argv[1] && realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url))) {
  const snapshot = await loadRepositoryMetadata();
  if (snapshot.stars === undefined || snapshot.forks === undefined) {
    console.warn("GitHub repository metrics are unavailable. Building the header with the published release.");
  }
  console.log(JSON.stringify(snapshot));
}
