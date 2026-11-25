// Runs before styles are painted on both the documentation and interactive pages.
(() => {
  const key = "elea-theme";
  const system = window.matchMedia("(prefers-color-scheme: dark)");
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
  window.addEventListener("storage", (event) => {
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
