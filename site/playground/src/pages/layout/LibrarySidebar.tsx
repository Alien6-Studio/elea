"use client";

import { Button, Navbar, Sidebar } from "@alien6-studio/elea-ui";
import { usePreviewNavigation } from "./usePreviewNavigation.js";

type HandbookNavigation = ReturnType<typeof usePreviewNavigation>;

const groups = [
  {
    id: "foundations", label: "Foundations",
    items: [
      {
        id: "type", label: "Typography", href: "#type", disclosureLabel: "Browse typography",
        children: [
          { id: "letterforms", label: "Letterforms", href: "#letterforms" },
          { id: "sizes", label: "Text sizes", href: "#sizes" },
        ],
      },
      { id: "colours", label: "Colour atlas", href: "#colours" },
    ],
  },
  {
    id: "layout", label: "Page layout", collapsible: true, defaultExpanded: false,
    items: [
      { id: "hero", label: "Hero", href: "#hero" },
      { id: "footer", label: "Footer", href: "#footer" },
    ],
  },
];

const chapters: Record<string, { title: string; text: string }> = {
  guides: { title: "Design handbook", text: "The handbook covers type, colour and page composition. Choose a chapter from the contents." },
  type: { title: "Typography", text: "Start with the shapes of the letters, then compare the type at reading and display sizes." },
  letterforms: { title: "ELEA Sans", text: "Roman and italic, regular weight" },
  sizes: { title: "Text sizes", text: "Set a comfortable size for the body before deciding how far the headline should stand above it." },
  colours: { title: "Colour atlas", text: "Réserve pairs an ultramarine primary with a pale secondary. Braise brings the same roles into warmer colours." },
  hero: { title: "Hero", text: "Start the story with a headline and a single action. Use a lead photograph when the setting is part of the story." },
  footer: { title: "Footer", text: "At the end of the page, group links by destination so readers can find a related story or return to the publication." },
};

export function LibrarySidebar({ navigation }: Readonly<{ navigation: HandbookNavigation }>) {
  return <Sidebar label="Library sections" header={<strong>Contents</strong>} groups={groups}
    current={navigation.current} render={navigation.render}
    footer={navigation.render({ href: "#guides", children: "All chapters" })} />;
}

export function SpecimenPage({ navigation }: Readonly<{ navigation: HandbookNavigation }>) {
  const chapter = chapters[navigation.current];
  if (!chapter) return null;
  return <article aria-live="polite" style={{ flex: "1 1 15rem", minWidth: 0, padding: "var(--elea-space-4)" }}>
    <h3 style={{ margin: 0, fontSize: "var(--elea-font-size-2xl)" }}>{chapter.title}</h3>
    {navigation.current === "letterforms" && <div aria-hidden="true" style={{ marginBlockStart: "var(--elea-space-5)", fontFamily: '"ELEA Sans", sans-serif', fontSize: "clamp(3rem, 7vw, 5rem)", lineHeight: 1.1 }}>Aa <em>Aa</em></div>}
    <p>{chapter.text}</p>
    {navigation.current === "sizes" && <div style={{ fontFamily: '"ELEA Sans", sans-serif' }}>
      <p style={{ fontSize: "1rem" }}>Body copy</p><p style={{ fontSize: "2rem" }}>Headline</p>
    </div>}
    {navigation.current === "letterforms" && <Button size="sm" variant="outline" onClick={() => navigation.select("sizes")}>Compare text sizes</Button>}
  </article>;
}

export function HandbookLayout() {
  const navigation = usePreviewNavigation("letterforms");
  let collection = "guides";
  if (["type", "letterforms", "sizes"].includes(navigation.current)) collection = "type";
  else if (navigation.current === "colours") collection = "colours";
  return <div style={{ width: "100%", background: "var(--elea-color-surface-default)" }}>
    <Navbar label="Design handbook" menuLabel="Handbook menu" brand={<strong>Design handbook</strong>}
      items={[
        { id: "guides", label: "Guides", href: "#guides" },
        { id: "type", label: "Typography", href: "#type" },
        { id: "colours", label: "Colour atlas", href: "#colours" },
      ]}
      current={collection} render={navigation.render} />
    <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--elea-space-4)", padding: "var(--elea-space-4)" }}>
      <SpecimenPage navigation={navigation} />
      <LibrarySidebar navigation={navigation} />
    </div>
  </div>;
}
