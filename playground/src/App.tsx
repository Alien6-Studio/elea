import { lazy, Suspense, useEffect, useLayoutEffect, useMemo, useState, useSyncExternalStore } from "react";
import { NotFound } from "./components/NotFound.js";
import { SiteFooter } from "./components/SiteFooter.js";
import { SiteHeader } from "./components/SiteHeader.js";
import { siteNavigation, sitePath } from "./links.js";
import { brandRoute, exactProfile, readBrandTheme, studioTheme, type BrandTheme, type StudioThemeId } from "./pages/brandTheme.js";
import { applySiteScope, siteProfile, siteScope } from "./siteProfile.js";
import { archivedWorkspace } from "./pages/design-lab/index.js";
import { href, useHashRoute } from "./router.js";

const CatalogPage = lazy(() => import("./pages/catalog.js"));
const ColoursPage = lazy(async () => ({ default: (await import("./pages/ColoursPage.js")).ColoursPage }));
const PlaygroundPage = lazy(async () => ({ default: (await import("./pages/Playground.js")).PlaygroundPage }));
const ThemeStudioPage = lazy(async () => ({ default: (await import("./pages/ThemeStudio.js")).ThemeStudioPage }));

type View = "archive" | "missing" | "catalog" | "studio" | "colours" | "workspace";

/** What a route shows. A retired study of the design lab opens the catalog; an archived one leaves the site. */
function readRoute(route: string) {
  const [requestedPath = "playground"] = route.split("?", 1);
  const lab = requestedPath === "design-lab" || requestedPath.startsWith("design-lab/");
  const archive = lab ? archivedWorkspace(requestedPath) : undefined;
  const retiredStudy = lab && !archive;
  const path = retiredStudy ? "ui" : requestedPath;
  return { lab, archive, retiredStudy, path, view: viewOf(path, archive) };
}

function viewOf(path: string, archive: string | undefined): View {
  if (archive) return "archive";
  if (path === "ui" || path.startsWith("ui/")) return "catalog";
  if (path === "theme") return "studio";
  if (path === "colours") return "colours";
  // Only a route written as #/… can be wrong: a bare fragment is an anchor of the current page.
  if (path !== "playground" && globalThis.location.hash.startsWith("#/")) return "missing";
  return "workspace";
}

/** The route that keeps the current page when the theme changes. */
function destinationOf(view: View, path: string) {
  if (view === "studio") return "theme";
  if (view === "colours") return "colours";
  if (view === "catalog") return path as "ui" | `ui/${string}`;
  return "playground";
}

function layoutOf(view: View) {
  if (view === "archive" || view === "workspace") return "full";
  return view;
}

function navigationFor(brand: BrandTheme | undefined) {
  if (!brand) return siteNavigation;
  return siteNavigation.map(link => "route" in link ? { ...link, href: `${sitePath}playground/${brandRoute(link.route, brand)}` } : link);
}

function useRedirects(retiredStudy: boolean, archive: string | undefined, replaceRoute: (route: string) => void) {
  useEffect(() => {
    if (retiredStudy) replaceRoute(href("ui"));
  }, [retiredStudy, replaceRoute]);
  useEffect(() => {
    if (archive) globalThis.location.replace(archive);
  }, [archive]);
}

function Page({ view, archive, path, brand, preferred, session, onChange }: Readonly<{
  view: View;
  archive: string | undefined;
  path: string;
  brand: BrandTheme | undefined;
  preferred: BrandTheme;
  session: number;
  onChange: (next: BrandTheme) => void;
}>) {
  switch (view) {
    case "archive": return <p className="elea-frame"><a href={archive}>View the archived Workspace capture on GitHub</a>.</p>;
    case "missing": return <NotFound />;
    case "catalog": return <CatalogPage route={path} brand={brand} />;
    case "colours": return <ColoursPage key={session} brand={brand ?? preferred} onChange={onChange} />;
    case "studio": return <ThemeStudioPage key={session} brand={brand ?? preferred} onChange={onChange} />;
    default: return <PlaygroundPage brand={brand} />;
  }
}

export function App() {
  const [route, replaceRoute] = useHashRoute();
  const { lab, archive, retiredStudy, path, view } = readRoute(route);
  const missing = view === "missing";
  const editing = view === "studio" || view === "colours";
  const section = view === "archive" || missing ? undefined : view;
  const [editorSession, setEditorSession] = useState(0);
  const saved = useSyncExternalStore(siteProfile.subscribe, siteProfile.get);
  const shared = useMemo(() => lab ? undefined : readBrandTheme(route.split("?")[1] ?? ""), [lab, route]);
  const preferred = useMemo(() => studioTheme(saved), [saved]);
  const followsProfile = !lab && (saved !== "reserve" || editing);
  const brand = shared ?? (followsProfile ? preferred : undefined);
  const profile = shared ? exactProfile(shared) : saved;
  const scope = siteScope(profile ?? saved);
  useLayoutEffect(() => {
    applySiteScope(scope);
  }, [scope]);

  function selectProfile(id: StudioThemeId) {
    siteProfile.set(id);
    setEditorSession(session => session + 1);
    if (!missing) replaceRoute(brandRoute(destinationOf(view, path), studioTheme(id)));
  }
  function editBrand(next: BrandTheme) {
    const profile = exactProfile(next);
    if (profile) siteProfile.set(profile);
    replaceRoute(brandRoute(view === "studio" ? "theme" : "colours", next));
  }
  const navigation = navigationFor(brand);
  const title = missing ? "Page not found" : siteNavigation.find(link => link.id === section)?.label ?? "Archived workspace";
  useRedirects(retiredStudy, archive, replaceRoute);
  useEffect(() => {
    if (view !== "catalog") document.title = `${title} · Elea`;
  }, [view, title]);

  return (
    <div className="site">
      <SiteHeader navigation={navigation} section={section} profile={profile} onProfileChange={selectProfile} />
      <main id="main" tabIndex={-1} className={`site__content site__content--${layoutOf(view)}`}>
        <Suspense fallback={<p className="elea-frame" role="status">Loading…</p>}>
          <Page view={view} archive={archive} path={path} brand={brand} preferred={preferred} session={editorSession} onChange={editBrand} />
        </Suspense>
      </main>
      <SiteFooter navigation={navigation} />
    </div>
  );
}
