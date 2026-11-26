import "@vitejs/plugin-react/preamble";
import { createElement, useEffect, useSyncExternalStore } from "react";
import { hydrateRoot } from "react-dom/client";
import { SiteProfileSelect } from "./src/components/SiteProfileSelect.tsx";
import { siteProfile } from "./src/siteProfile.ts";

const picker = document.getElementById("site-profile-picker");

function StoredProfileSelect() {
  const profile = useSyncExternalStore(siteProfile.subscribe, siteProfile.get, () => "reserve");
  useEffect(() => { picker.hidden = false; }, []);
  return createElement(SiteProfileSelect, { profile, onProfileChange: siteProfile.set });
}

hydrateRoot(picker, createElement(StoredProfileSelect));
