import "@vitejs/plugin-react/preamble";
import { createElement, useEffect, useSyncExternalStore } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { SiteSearch } from "./src/components/SiteSearch.tsx";
import { SiteProfileSelect } from "./src/components/SiteProfileSelect.tsx";
import { siteProfile } from "./src/siteProfile.ts";

const picker = document.getElementById("site-profile-picker");

function StoredProfileSelect() {
  const profile = useSyncExternalStore(siteProfile.subscribe, siteProfile.get, () => "reserve");
  useEffect(() => { picker.hidden = false; }, []);
  return createElement(SiteProfileSelect, { profile, onProfileChange: siteProfile.set });
}

hydrateRoot(picker, createElement(StoredProfileSelect));

const search = document.getElementById("site-search");
if (search) hydrateRoot(search, createElement(SiteSearch));

const comparison = document.getElementById("theme-comparison");
if (comparison) {
  const { ThemeComparison } = await import("./src/components/ThemeComparison.tsx");
  createRoot(comparison).render(createElement(ThemeComparison));
}
