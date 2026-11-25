import { lazy, Suspense, useEffect, useMemo } from "react";
import { SiteFooter } from "./components/SiteFooter.js";
import { SiteHeader } from "./components/SiteHeader.js";
import { siteNavigation, sitePath } from "./links.js";
import { brandRoute, defaultSiteTheme, readBrandTheme } from "./pages/brandTheme.js";
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
  const brand = useMemo(() => lab ? undefined : readBrandTheme() ?? (studio || colours ? defaultSiteTheme : undefined), [lab, route, studio, colours]);
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
      <SiteHeader navigation={navigation} section={section} />
      <main id="main" tabIndex={-1} className={`site__content site__content--${section === "workspace" || !section ? "full" : section}`}>
        <Suspense fallback={<p className="site-container" role="status">Loading…</p>}>
          {archive ? <p className="site-container"><a href={archive}>View the archived Workspace capture on GitHub</a>.</p>
            : catalog ? <CatalogPage route={path} brand={brand} />
            : colours ? <ColoursPage brand={brand ?? defaultSiteTheme} onChange={next => replaceRoute(brandRoute("colours", next))} />
            : studio ? <ThemeStudioPage brand={brand ?? defaultSiteTheme} onChange={next => replaceRoute(brandRoute("theme", next))} />
            : <PlaygroundPage brand={brand} />}
        </Suspense>
      </main>
      <SiteFooter navigation={navigation} />
    </div>
  );
}
