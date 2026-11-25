export const sitePath = "/elea/";
export const siteHostnames = ["localhost", "alien6-studio.github.io"];
export const repositoryUrl = "https://github.com/Alien6-Studio/elea";
export const alien6Url = "https://alien6.com";
export const alien6ContactUrl = `${alien6Url}/en/contact/`;

export const siteNavigation = [
  { id: "docs", label: "Docs", href: `${sitePath}getting-started/` },
  { id: "catalog", route: "ui", label: "Components", href: `${sitePath}playground/#/ui` },
  { id: "studio", route: "theme", label: "Theme studio", href: `${sitePath}playground/#/theme` },
  { id: "workspace", route: "playground", label: "Editorial workspace", href: `${sitePath}playground/#/playground` },
] as const;
export type SiteSection = (typeof siteNavigation)[number]["id"];
export type SiteNavigation = readonly { id: SiteSection; label: string; href: string }[];
