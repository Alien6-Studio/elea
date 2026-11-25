import { lazy, Suspense, useEffect, useMemo } from "react";
import { SiteFooter } from "./components/SiteFooter.js";
import { SiteHeader } from "./components/SiteHeader.js";
import { siteNavigation, sitePath } from "./links.js";
import { brandRoute, readBrandTheme } from "./pages/brandTheme.js";
import { useHashRoute } from "./router.js";

const ResourceLibrary = lazy(() => import("./pages/design-lab/ResourceLibrary.js"));
const DesignLab = lazy(() => import("./pages/design-lab/index.js"));
const CatalogPage = lazy(() => import("./pages/catalog.js"));
const PlaygroundPage = lazy(async () => ({ default: (await import("./pages/Playground.js")).PlaygroundPage }));
const ThemeStudioPage = lazy(async () => ({ default: (await import("./pages/ThemeStudio.js")).ThemeStudioPage }));

export function App() {
  const [route, replaceRoute] = useHashRoute();
  const [path = "playground"] = route.split("?", 1);
  const catalog = path === "ui" || path.startsWith("ui/");
  const studio = path === "theme";
  const resourceLibrary = path === "design-lab/resource-library";
  const lab = path === "design-lab" || path.startsWith("design-lab/");
  const brand = useMemo(() => lab ? undefined : readBrandTheme(), [lab, route]);
  const navigation = brand ? siteNavigation.map((link) =>
    "route" in link && !(studio && link.id === "studio")
      ? { ...link, href: `${sitePath}playground/${brandRoute(link.route, brand)}` }
      : link,
  ) : siteNavigation;
  const title = resourceLibrary ? "Field library" : lab ? "Component Studies" : studio ? "Theme studio" : "Editorial workspace";
  useEffect(() => {
    if (!catalog) document.title = `${title} · Elea`;
  }, [catalog, title]);

  return (
    <div className="site">
      <SiteHeader navigation={navigation} section={lab ? undefined : catalog ? "catalog" : studio ? "studio" : "workspace"} />
      <main id="main" tabIndex={-1} className={`site__content site__content--${catalog ? "catalog" : studio ? "studio" : "full"}`}>
        <Suspense fallback={<p className="site-container" role="status">Loading…</p>}>
          {resourceLibrary ? <ResourceLibrary /> : lab ? <DesignLab route={path} /> : catalog ? <CatalogPage route={path} brand={brand} /> : studio ? <ThemeStudioPage replaceRoute={replaceRoute} /> : <PlaygroundPage brand={brand} />}
        </Suspense>
      </main>
      <SiteFooter navigation={navigation} />
    </div>
  );
}
