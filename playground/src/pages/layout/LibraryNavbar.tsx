"use client";

import { Button, Navbar, ResponsiveImage } from "@alien6-studio/elea-ui";
import { colorThemes } from "@alien6-studio/elea-tokens/palette";
import { usePreviewNavigation } from "./usePreviewNavigation.js";

const chapters = [
  { id: "hero", label: "Hero", description: "Pair a lead image with a headline to open a story." },
  { id: "navbar", label: "Navbar", description: "Give the publication a masthead and a route to each collection." },
  { id: "sidebar", label: "Sidebar", description: "Keep chapters and their neighbouring pages within reach." },
];
const studies = ["rasance", "reserve", "braise"] as const;
type Study = typeof studies[number];
type Artwork = { src: string };

function Swatches({ study }: { study: Study }) {
  const colours = colorThemes[study].colours;
  return <span aria-hidden="true" style={{ display: "flex", flex: 1 }}>
    {[colours.primary, colours.secondary, colours.tertiary].map((colour, index) =>
      <span key={index} style={{ flex: 1, background: colour }} />
    )}
  </span>;
}

export function HandbookCollection({ artworks = {} }: { artworks?: Partial<Record<Study, Artwork>> }) {
  const preview = usePreviewNavigation("colours");
  const study = studies.find(id => id === preview.current);
  const chapter = chapters.find(item => item.id === preview.current);
  const atlas = preview.current === "colours" || study !== undefined;
  let title = "Design handbook";
  let description = "Field guides to the shapes, colours and layouts of a publication.";
  if (chapter) {
    title = chapter.label;
    description = chapter.description;
  } else if (preview.current === "studio") {
    title = "Theme studio";
    description = "Primary, secondary and tertiary colours from the three studies.";
  } else if (atlas) {
    title = study ? colorThemes[study].name : "Colour studies";
    description = study ? colorThemes[study].style : "";
  }
  return <div style={{ width: "100%", background: "var(--elea-color-surface-default)" }}>
    <Navbar label="Design handbook" menuLabel="Menu"
      brand={preview.render({ href: "#home", "aria-current": preview.current === "home" ? "page" : undefined, children: <strong>Design handbook</strong> })}
      items={[
        { id: "guides", label: "Guides", disclosureLabel: "Browse guides",
          children: chapters.map(({ id, label }) => ({ id, label, href: "#" + id })) },
        { id: "colours", label: "Colour atlas", href: "#colours" },
      ]}
      current={atlas ? "colours" : preview.current} render={preview.render}
      persistentActions={<Button href="#studio" render={preview.render} aria-current={preview.current === "studio" ? "page" : undefined} variant="outline" size="sm">Studio</Button>}
    />
    <section aria-label="Handbook preview" style={{ padding: "var(--elea-space-5)", minBlockSize: "11rem" }}>
      <h3 aria-live="polite" style={{ margin: 0, fontSize: "var(--elea-font-size-2xl)" }}>{title}</h3>
      {description && <p>{description}</p>}
      {(atlas || preview.current === "studio") && <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "var(--elea-space-3)", marginBlockStart: "var(--elea-space-4)" }}>
        {studies.map(id => {
          const artwork = artworks[id];
          return <Button key={id} size="sm" variant={id === study ? "outline" : "ghost"}
            aria-pressed={id === study} onClick={() => preview.select(id === study ? "colours" : id)}
            style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", height: "auto", padding: "var(--elea-space-1)", minWidth: 0 }}>
            <span style={{ display: "flex", aspectRatio: "4 / 3", marginBlockEnd: "var(--elea-space-2)" }}>
              {artwork && preview.current !== "studio"
                ? <ResponsiveImage src={artwork.src} alt="" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <Swatches study={id} />}
            </span>
            {colorThemes[id].name}
          </Button>;
        })}
      </div>}
    </section>
  </div>;
}
