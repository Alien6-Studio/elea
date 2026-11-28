import { repositoryUrl } from "../links.js";
import { repositorySnapshot, type RepositorySnapshot } from "../data/repository.js";

// Vite embeds the same public build value that the static renderer reads from its environment.
function buildSnapshot() {
  const json = import.meta.env?.VITE_ELEA_REPOSITORY_METADATA ?? (typeof process === "undefined" ? undefined : process.env.VITE_ELEA_REPOSITORY_METADATA);
  try {
    return repositorySnapshot(JSON.parse(json ?? "{}"));
  } catch {
    return {};
  }
}

const builtSnapshot = buildSnapshot();
const compact = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });
const exact = new Intl.NumberFormat("en");
const icons = {
  release: <><path d="M8.5 2H14v5.5l-6.3 6.3a1 1 0 0 1-1.4 0L2.2 9.7a1 1 0 0 1 0-1.4Z"/><circle cx="11.5" cy="4.5" r=".65" fill="currentColor" stroke="none"/></>,
  stars: <path d="m8 1.8 1.9 3.9 4.3.6-3.1 3 .7 4.3L8 11.5l-3.8 2.1.7-4.3-3.1-3 4.3-.6Z"/>,
  forks: <><circle cx="4" cy="3" r="1.6"/><circle cx="12" cy="3" r="1.6"/><circle cx="8" cy="13" r="1.6"/><path d="M4 4.6v1.5c0 2 4 1.5 4 4v1.3m4-6.8v1.5c0 2-4 1.5-4 4"/></>,
};

/** Static on both surfaces. A build without GitHub access still links to the repository. */
export function RepositoryLink({ snapshot = builtSnapshot }: Readonly<{ snapshot?: RepositorySnapshot }>) {
  const facts = [
    { id: "release", value: snapshot.release, label: "Latest release " + snapshot.release },
    { id: "stars", value: snapshot.stars, label: snapshot.stars === 1 ? "1 star" : exact.format(snapshot.stars ?? 0) + " stars" },
    { id: "forks", value: snapshot.forks, label: snapshot.forks === 1 ? "1 fork" : exact.format(snapshot.forks ?? 0) + " forks" },
  ] as const;
  const visible = facts.filter(fact => fact.value !== undefined);
  const label = ["Alien6-Studio/elea on GitHub", ...visible.map(fact => fact.label)].join(", ");
  return (
    <a className="site-repo" href={repositoryUrl} aria-label={label}>
      <svg className="site-repo__glyph" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 19c-4.3 1.3-4.3-2.2-6-2.7m12 5v-3.4c0-1 .1-1.5-.5-2.1 3.1-.4 6.4-1.6 6.4-7a5.4 5.4 0 0 0-1.5-3.8 5 5 0 0 0-.1-3.8s-1.2-.4-3.9 1.5a13.2 13.2 0 0 0-7 0C5.7.8 4.5 1.2 4.5 1.2a5 5 0 0 0-.1 3.8 5.4 5.4 0 0 0-1.5 3.8c0 5.4 3.3 6.6 6.4 7-.5.5-.7 1.1-.7 2.1v3.4" />
      </svg>
      <span className="site-repo__copy" aria-hidden="true">
        <span className="site-repo__name">Alien6-Studio/<wbr />elea</span>
        {visible.length > 0 && <span className="site-repo__facts">
          {visible.map(({ id, value }) => <span className="site-repo__fact" key={id}>
            <svg viewBox="0 0 16 16" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinejoin="round">{icons[id]}</svg>
            {typeof value === "number" ? compact.format(value) : value}
          </span>)}
        </span>}
      </span>
    </a>
  );
}
