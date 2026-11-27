export const sitePath = "/";
export const siteHostnames = ["localhost", "elea.alien6.com"];
export const repositoryUrl = "https://github.com/Alien6-Studio/elea";
export const alien6Url = "https://alien6.com";
export const alien6ContactUrl = `${alien6Url}/en/contact/`;

export const siteNavigation = [
  { id: "docs", label: "Docs", href: `${sitePath}getting-started/` },
  { id: "catalog", route: "ui", label: "Components", href: `${sitePath}playground/#/ui` },
  { id: "typography", label: "Typography", href: `${sitePath}typography/` },
  { id: "colours", route: "colours", label: "Colours", href: `${sitePath}playground/#/colours` },
  { id: "studio", route: "theme", label: "Theme studio", href: `${sitePath}playground/#/theme` },
  { id: "workspace", route: "playground", label: "Editorial workspace", href: `${sitePath}playground/#/playground` },
  { id: "research", label: "Research", href: `${sitePath}research/` },
] as const;
export type SiteSection = (typeof siteNavigation)[number]["id"];
export type SiteNavigation = readonly { id: SiteSection; label: string; href: string }[];
