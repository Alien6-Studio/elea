import { repositoryUrl } from "../../links.js";

const editions = [
  { id: "precision", native: "light", archive: "precision" },
  { id: "editorial", native: "light", archive: "editorial-porcelain/reference/editorial-workspace" },
  { id: "obsidian", native: "dark", archive: "component-studies/obsidian-workspace" },
] as const;

const archiveRoot = `${repositoryUrl}/blob/83c13b41161a182ef763b908b67b5813e75294d2/docs/assets/design-lab`;

export function archivedWorkspace(route: string) {
  const [, direction, appearance] = route.split("/");
  const edition = editions.find(item => item.id === direction);
  if (!edition) return undefined;
  const mode = appearance === "dark" || appearance === "light" ? appearance : edition.native;
  return `${archiveRoot}/${edition.archive}-${mode}.webp`;
}
