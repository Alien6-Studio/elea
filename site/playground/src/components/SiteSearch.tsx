import { useEffect, useRef, useState } from "react";
import { SearchAutocomplete } from "@alien6-studio/elea-ui";
import { loadSearchDocs, resultHref, searchSite, type SearchEntry } from "../data/siteSearch.js";

export function SiteSearch() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [shortcut, setShortcut] = useState("Ctrl K");
  const [docs, setDocs] = useState<SearchEntry[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const field = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (/Mac|iPhone|iPad/i.test(navigator.userAgent)) setShortcut("⌘ K");
    function focusSearch(event: KeyboardEvent) {
      if (event.defaultPrevented || event.isComposing || event.key.toLowerCase() !== "k" ||
          !(event.metaKey || event.ctrlKey) || event.altKey || event.shiftKey) return;
      if (event.target instanceof Element && event.target.closest("input, textarea, [contenteditable=true], [role=dialog]")) return;
      event.preventDefault();
      field.current?.focus();
    }
    document.addEventListener("keydown", focusSearch);
    return () => document.removeEventListener("keydown", focusSearch);
  }, []);

  useEffect(() => {
    if (!open) return;
    let active = true;
    setStatus("loading");
    loadSearchDocs().then(entries => {
      if (active) { setDocs(entries); setStatus("ready"); }
    }, () => { if (active) setStatus("error"); });
    return () => { active = false; };
  }, [open]);

  const matches = open ? searchSite(query, docs) : [];
  let message = "Explore ELEA";
  if (query.trim()) {
    if (matches.length) message = matches.length === 1 ? "1 result" : matches.length + " results";
    else message = status === "loading" ? "Searching…" : "No results found";
  }
  if (status === "error") message += " · Documentation search is unavailable.";

  return <div role="search" aria-label="Site" className="site-search">
    <SearchAutocomplete ref={field} id="elea-site-query" label="Search the site" placeholder="Search" clearLabel="Clear search"
      aria-keyshortcuts="Control+k Meta+k" value={query} onValueChange={setQuery} onOpenChange={setOpen}
      status={message} autoSelectFirst onResultSelect={() => setQuery("")}
      results={matches.map(entry => ({ id: entry.href, href: resultHref(entry.href), label: entry.title, description: entry.section }))} />
    {!open && !query && <kbd aria-hidden="true" className="site-search__shortcut">{shortcut}</kbd>}
  </div>;
}
