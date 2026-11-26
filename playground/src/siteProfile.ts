import { featuredColourThemes, type StudioThemeId } from "./pages/brandTheme.js";

const storageKey = "elea-site-profile";
const listeners = new Set<() => void>();
let current: StudioThemeId = "reserve";

export function siteScope(id: StudioThemeId) {
  return id === "reserve" ? "site" : `site-${id}`;
}

let restoreTransitions = 0;

export function applySiteScope(scope: string) {
  const root = document.documentElement;
  if (root.dataset.eleaTheme === scope) return;
  root.dataset.switchingProfile = "";
  root.dataset.eleaTheme = scope;
  cancelAnimationFrame(restoreTransitions);
  // Paint the new foreground and background together before restoring interaction transitions.
  restoreTransitions = requestAnimationFrame(() => {
    restoreTransitions = requestAnimationFrame(() => { delete root.dataset.switchingProfile; });
  });
}

function read(): StudioThemeId {
  try {
    const value = sessionStorage.getItem(storageKey) ?? localStorage.getItem(storageKey);
    return featuredColourThemes.find(id => id === value) ?? "reserve";
  } catch {
    return current;
  }
}

function apply(id: StudioThemeId) {
  // The playground can be displaying an explicit shared brand from its URL.
  if (!document.getElementById("root")) applySiteScope(siteScope(id));
  // The static notebook deliberately opens a shareable, themed workspace.
  for (const link of document.querySelectorAll<HTMLAnchorElement>("[data-site-profile-link]")) {
    const [path] = link.hash.split("?");
    link.hash = `${path}?scheme=${id}`;
  }
  if (current === id) return;
  current = id;
  for (const listener of listeners) listener();
}

export const siteProfile = {
  get: () => current,
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  set(id: StudioThemeId) {
    apply(id);
    try {
      localStorage.setItem(storageKey, id);
      sessionStorage.removeItem(storageKey);
    } catch {
      try { sessionStorage.setItem(storageKey, id); } catch { /* In-memory selection still works. */ }
    }
  },
};

if (typeof window !== "undefined") {
  apply(read());
  window.addEventListener("storage", event => {
    if (event.key !== storageKey && event.key !== null) return;
    if (event.storageArea === localStorage) {
      try { sessionStorage.removeItem(storageKey); } catch { /* Optional in private browsing. */ }
    }
    apply(read());
  });
  window.addEventListener("pageshow", event => { if (event.persisted) apply(read()); });
}
