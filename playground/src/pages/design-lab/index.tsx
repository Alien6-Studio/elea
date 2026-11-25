import { Button } from "@alien6-studio/elea-ui";
import { useEffect } from "react";
import { repositoryUrl } from "../../links.js";
import { ComponentStudies } from "./ComponentStudies.js";
import "./tokens.css";

const editions = [
  { id: "precision", title: "Precision", native: "light", archive: "precision" },
  { id: "editorial", title: "Editorial", native: "light", archive: "editorial-porcelain/reference/editorial-workspace" },
  { id: "obsidian", title: "Obsidian", native: "dark", archive: "component-studies/obsidian-workspace" },
] as const;

type Edition = (typeof editions)[number];
type Mode = "light" | "dark";
const modes = ["light", "dark"] as const;
const tabPresentation = { precision: "segmented", editorial: "underline", obsidian: "rail" } as const;

const workspaceArchive = `${repositoryUrl}/blob/83c13b41161a182ef763b908b67b5813e75294d2/docs/assets/design-lab`;

export default function DesignLab({ route }: { route: string }) {
  const [, area, ...segments] = route.split("/");
  const [slug, appearance, identity] = area === "components" ? segments : [area, ...segments];
  const namedEdition = editions.find((item) => item.id === slug);
  const edition = namedEdition ?? editions[0];
  const mode = appearance === "dark" || appearance === "light" ? appearance : edition.native;
  const siteIdentity = area === "components" && identity === "site";
  const archive = area !== "components" && namedEdition
    ? `${workspaceArchive}/${namedEdition.archive}-${mode}.webp`
    : undefined;

  useEffect(() => {
    if (archive) globalThis.location.replace(archive);
  }, [archive]);

  function path(direction: Edition["id"], appearance: Mode, site = false) {
    return `#/design-lab/components/${direction}/${appearance}${site ? "/site" : ""}`;
  }

  if (archive) return <p className="site-container"><a href={archive}>View the archived Workspace capture on GitHub</a>.</p>;

  return <>
    <div className="lab-bar">
      <div className="lab-bar-inner">
        <nav className="lab-directions" aria-label="Art direction">{editions.map((item) =>
          <a key={item.id} href={path(item.id, item.id === edition.id ? mode : item.native, siteIdentity)}
            aria-current={item.id === edition.id ? "page" : undefined}>{item.title}</a>
        )}</nav>
        {!siteIdentity && <nav className="lab-modes" aria-label="Component appearance">{modes.map((value) =>
          <Button key={value} size="sm" variant={mode === value ? "outline" : "ghost"}
            href={path(edition.id, value)} aria-current={mode === value ? "true" : undefined}>
            {value === "light" ? "Light" : "Dark"}</Button>)}</nav>}
      </div>
    </div>
    <ComponentStudies theme={`lab-study-${siteIdentity ? "site-" : ""}${edition.id}-${mode}`}
      presentation={tabPresentation[edition.id]}
      siteIdentity={siteIdentity} identityHref={path(edition.id, mode, !siteIdentity)} />
  </>;
}
