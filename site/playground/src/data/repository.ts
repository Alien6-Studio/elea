export interface RepositorySnapshot {
  release?: string;
  stars?: number;
  forks?: number;
}

/** Keep only the public facts used in the header. A missing fact is distinct from zero. */
export function repositorySnapshot(value: unknown): RepositorySnapshot {
  if (!value || typeof value !== "object") return {};
  const { release, stars, forks } = value as RepositorySnapshot;
  const validCount = (count: unknown): count is number => typeof count === "number" && Number.isSafeInteger(count) && count >= 0;
  return {
    release: typeof release === "string" && release.trim() ? release.trim() : undefined,
    stars: validCount(stars) ? stars : undefined,
    forks: validCount(forks) ? forks : undefined,
  };
}
