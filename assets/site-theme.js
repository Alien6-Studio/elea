// Runs before styles are painted on both the documentation and interactive pages.
(() => {
  const key = "elea-theme";
  const system = globalThis.matchMedia("(prefers-color-scheme: dark)");
  function savedTheme() {
    try {
      const value = localStorage.getItem(key);
      return value === "dark" || value === "light" ? value : null;
    } catch {
      return null;
    }
  }

  let preference = savedTheme();
  function apply() {
    document.documentElement.dataset.theme = preference ?? (system.matches ? "dark" : "light");
  }
  apply();
  system.addEventListener("change", apply);
  globalThis.addEventListener("storage", (event) => {
    if (event.key === key || event.key === null) {
      preference = savedTheme();
      apply();
    }
  });
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) {
      preference = savedTheme();
      apply();
    }
  });
  document.addEventListener("click", (event) => {
    if (!(event.target instanceof Element) || !event.target.closest("[data-site-theme-toggle]")) return;
    preference = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    apply();
    try {
      localStorage.setItem(key, preference);
    } catch {
      // Storage can be disabled; the preference still applies to this page.
    }
  });
})();

(() => {
  const key = "elea-site-font";
  const sessionKey = "elea-site-font-session";
  const options = [
    { value: "elea", label: "ELEA Sans" },
    { value: "instrument", label: "Instrument Sans" },
    { value: "roboto", label: "Roboto" },
  ];
  const listeners = new Set();
  let current = options[0];

  function storedFont(storage, storageKey) {
    const value = storage.getItem(storageKey);
    if (value !== "source-serif") return value;
    try { storage.setItem(storageKey, "roboto"); } catch { /* The stored preference may be read-only. */ }
    return "roboto";
  }

  function readFont() {
    // A tab can retain its choice when a persistent write was denied.
    try {
      const fallback = storedFont(sessionStorage, sessionKey);
      if (fallback !== null) return fallback;
    } catch { /* Session storage can be disabled. */ }
    try {
      return storedFont(localStorage, key);
    } catch {
      return current.value;
    }
  }

  function applyFont(value) {
    const font = options.find((option) => option.value === value) ?? options[0];
    if (document.documentElement.dataset.siteFont === font.value) return;
    current = font;
    document.documentElement.dataset.siteFont = current.value;
    for (const listener of listeners) listener();
  }

  function usePersistentChoice() {
    try { sessionStorage.removeItem(sessionKey); } catch { /* Storage is optional. */ }
  }

  globalThis.eleaSiteFont = {
    options,
    get: () => current.value,
    set(value) {
      applyFont(value);
      try {
        localStorage.setItem(key, current.value);
        usePersistentChoice();
      } catch {
        try { sessionStorage.setItem(sessionKey, current.value); } catch { /* Keep the in-memory selection. */ }
      }
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
  applyFont(readFont());
  globalThis.addEventListener("storage", (event) => {
    if (event.key === key || event.key === null) {
      usePersistentChoice();
      applyFont(readFont());
    }
  });
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) applyFont(readFont());
  });
})();

// Apply a saved profile before first paint. The base class keeps Ponctuation, the default, available
// while the picker validates a stored id against the theme catalogue on startup.
(() => {
  const root = document.documentElement;
  root.classList.add("elea-site");
  try {
    const profile = sessionStorage.getItem("elea-site-profile") ?? localStorage.getItem("elea-site-profile");
    if (profile && profile !== "ponctuation" && /^[a-z-]+$/.test(profile)) root.dataset.eleaTheme = "site-" + profile;
  } catch { /* Storage is optional. */ }
})();
