import { lazy, Suspense, useEffect, useLayoutEffect, useMemo, useState, useSyncExternalStore } from "react";
import { SiteFooter } from "./components/SiteFooter.js";
import { SiteHeader } from "./components/SiteHeader.js";
import { siteNavigation, sitePath } from "./links.js";
import { brandRoute, exactProfile, readBrandTheme, studioTheme, type BrandTheme, type StudioThemeId } from "./pages/brandTheme.js";
import { siteProfile, siteScope } from "./siteProfile.js";
import { archivedWorkspace } from "./pages/design-lab/index.js";
import { href, useHashRoute } from "./router.js";

const CatalogPage = lazy(() => import("./pages/catalog.js"));
const ColoursPage = lazy(async () => ({ default: (await import("./pages/ColoursPage.js")).ColoursPage }));
const PlaygroundPage = lazy(async () => ({ default: (await import("./pages/Playground.js")).PlaygroundPage }));
const ThemeStudioPage = lazy(async () => ({ default: (await import("./pages/ThemeStudio.js")).ThemeStudioPage }));

export function App() {
  const [route, replaceRoute] = useHashRoute();
  const [requestedPath = "playground"] = route.split("?", 1);
  const lab = requestedPath === "design-lab" || requestedPath.startsWith("design-lab/");
  const archive = lab ? archivedWorkspace(requestedPath) : undefined;
  const retiredStudy = lab && !archive;
  const path = retiredStudy ? "ui" : requestedPath;
  const catalog = path === "ui" || path.startsWith("ui/");
  const studio = path === "theme";
  const colours = path === "colours";
  const section = archive ? undefined : catalog ? "catalog" : studio ? "studio" : colours ? "colours" : "workspace";
  const [editorSession, setEditorSession] = useState(0);
  const saved = useSyncExternalStore(siteProfile.subscribe, siteProfile.get);
  const shared = useMemo(() => lab ? undefined : readBrandTheme(route.split("?")[1] ?? ""), [lab, route]);
  const preferred = useMemo(() => studioTheme(saved), [saved]);
  const brand = shared ?? (!lab && (saved !== "reserve" || studio || colours) ? preferred : undefined);
  const profile = shared ? exactProfile(shared) : saved;
  const scope = siteScope(profile ?? saved);
  useLayoutEffect(() => {
    document.documentElement.dataset.eleaTheme = scope;
  }, [scope, saved]);

  function selectProfile(id: StudioThemeId) {
    siteProfile.set(id);
    setEditorSession(session => session + 1);
    const destination = studio ? "theme" : colours ? "colours" : catalog ? path as "ui" | `ui/${string}` : "playground";
    replaceRoute(brandRoute(destination, studioTheme(id)));
  }
  function editBrand(next: BrandTheme) {
    const profile = exactProfile(next);
    if (profile) siteProfile.set(profile);
    replaceRoute(brandRoute(studio ? "theme" : "colours", next));
  }
  const navigation = brand ? siteNavigation.map((link) =>
    "route" in link
      ? { ...link, href: `${sitePath}playground/${brandRoute(link.route, brand)}` }
      : link,
  ) : siteNavigation;
  const title = siteNavigation.find(link => link.id === section)?.label ?? "Archived workspace";
  useEffect(() => {
    if (retiredStudy) replaceRoute(href("ui"));
  }, [retiredStudy, replaceRoute]);
  useEffect(() => {
    if (archive) globalThis.location.replace(archive);
  }, [archive]);
  useEffect(() => {
    if (!catalog) document.title = `${title} · Elea`;
  }, [catalog, title]);

  return (
    <div className="site">
      <SiteHeader navigation={navigation} section={section} profile={profile} onProfileChange={selectProfile} />
      <main id="main" tabIndex={-1} className={`site__content site__content--${section === "workspace" || !section ? "full" : section}`}>
        <Suspense fallback={<p className="site-container" role="status">Loading…</p>}>
          {archive ? <p className="site-container"><a href={archive}>View the archived Workspace capture on GitHub</a>.</p>
            : catalog ? <CatalogPage route={path} brand={brand} />
            : colours ? <ColoursPage key={editorSession} brand={brand ?? preferred} onChange={editBrand} />
            : studio ? <ThemeStudioPage key={editorSession} brand={brand ?? preferred} onChange={editBrand} />
            : <PlaygroundPage brand={brand} />}
        </Suspense>
      </main>
      <SiteFooter navigation={navigation} />
    </div>
  );
}
