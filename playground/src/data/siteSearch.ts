import { colorThemes } from "@alien6-studio/elea-tokens/palette";
import { componentGuides, type GuideSummary } from "./componentGuides.js";
import { siteNavigation, sitePath } from "../links.js";
import { featuredColourThemes } from "../pages/brandTheme.js";

export interface SearchEntry {
  title: string;
  section: string;
  href: string;
  text: string;
}

const sections = siteNavigation.map(link => ({
  title: link.id === "docs" ? "Getting started" : link.label,
  section: "Site",
  href: link.href,
  text: link.id === "docs" ? "Docs documentation installation" : "",
}));
const home = { title: "Overview", section: "Site", href: sitePath, text: "ELEA home design system" };
const guides = componentGuides.flatMap((guide: GuideSummary) => {
  const href = `${sitePath}playground/#/ui/${guide.slug}`;
  const section = `Components · ${guide.category}`;
  const parts = (guide.sections ?? []).map(part => ({
    title: part.title, section, href: `${href}/${part.id}`, text: part.keywords ?? "",
  }));
  return [{ title: guide.name, section, href, text: guide.summary }, ...parts];
});
const palettes = featuredColourThemes.map(id => ({
  title: colorThemes[id].name,
  section: "Colours",
  href: `${sitePath}playground/#/colours?scheme=${id}`,
  text: `Palette theme ${colorThemes[id].style}`,
}));

const builtIn = [home, ...sections, ...guides, ...palettes];
const fold = (text: string) => text.toLowerCase().normalize("NFD").replace(/\p{M}/gu, "");

export function searchSite(query: string, docs: readonly SearchEntry[]) {
  const phrase = fold(query.trim());
  if (!phrase) return sections;
  const words = phrase.split(/\s+/u);
  const matches = [];
  const destinations = new Map([...builtIn, ...docs].map(entry => [entry.href, entry]));
  for (const entry of destinations.values()) {
    const title = fold(entry.title);
    const haystack = `${title} ${fold(entry.section)} ${fold(entry.text)}`;
    if (!words.every(word => haystack.includes(word))) continue;
    let rank = 0;
    if (title === phrase) rank = 4;
    else if (title.startsWith(phrase)) rank = 3;
    else if (words.every(word => title.includes(word))) rank = 2;
    else if (words.some(word => title.includes(word))) rank = 1;
    matches.push({ entry, rank });
  }
  return matches.sort((a, b) => b.rank - a.rank).map(match => match.entry);
}

// Documentation headings and anchors come from the same MkDocs build as the pages.
let cachedDocs: Promise<SearchEntry[]> | undefined;
export function loadSearchDocs() {
  cachedDocs ??= fetch(`${sitePath}search/search_index.json`).then(async response => {
    if (!response.ok) throw new Error("Documentation index unavailable");
    const { docs }: { docs: { location: string; title: string; text: string }[] } = await response.json();
    const pages = new Map(docs.filter(item => !item.location.includes("#")).map(item => [item.location, item.title]));
    const entries: SearchEntry[] = [];
    for (const item of docs) {
      // The landing page has a custom template and does not render the Markdown headings.
      if (!item.location || item.location.startsWith("#")) continue;
      const href = sitePath + item.location;
      const [page, anchor] = item.location.split("#");
      const parent = page && pages.get(page);
      if (anchor && item.title === parent) continue;
      const section = anchor && parent ? `Docs · ${parent}` : "Documentation";
      entries.push({ title: item.title, text: item.text, section, href });
    }
    return entries;
  }).catch(error => {
    cachedDocs = undefined;
    throw error;
  });
  return cachedDocs;
}

export function resultHref(href: string) {
  const app = `${sitePath}playground/`;
  if (!location.pathname.startsWith(app) || !href.startsWith(app + "#/") || href.includes("?")) return href;
  const query = location.hash.indexOf("?");
  return query === -1 ? href : href + location.hash.slice(query);
}
