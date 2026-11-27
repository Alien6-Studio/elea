/** The code shown under each layout guide example, as an application would write it. */

export const notebookHero = `"use client";

import { useId, useState } from "react";
import { Button, Hero } from "@alien6-studio/elea-ui";

export function NotebookHero() {
  const [open, setOpen] = useState(false);
  const excerpt = useId();

  return (
    <Hero
      layout="cover"
      eyebrow="Field notes"
      heading="The glacier notebook"
      description={
        <>
          An aerial study of the ridges and crevasses that ice leaves behind.
          <p id={excerpt} hidden={!open}>
            From above, the ice reads like a map. Fine blue lines gather into
            deep folds where the glacier bends around the rock.
          </p>
        </>
      }
      actions={
        <Button
          aria-expanded={open}
          aria-controls={excerpt}
          onClick={() => setOpen(!open)}
        >
          {open ? "Close the notebook" : "Open the notebook"}
        </Button>
      }
      image={{
        src: "/images/glacier.webp",
        srcSet: "/images/glacier-560.webp 560w, /images/glacier.webp 1050w",
        sizes: "(min-width: 75rem) 52rem, (min-width: 55rem) 65vw, 100vw",
        alt: "Deep blue crevasses crossing the white surface of a glacier",
        width: 1050,
        height: 525,
      }}
    />
  );
}`;

export const harbourHero = `import { Button, Hero } from "@alien6-studio/elea-ui";

const description =
  "A red beacon interrupts the long line of the sea. " +
  "Where you place the horizon changes the weight of the photograph.";
const alt =
  "A red lighthouse on the far end of a breakwater under an overcast sky";

export function HarbourHero() {
  return (
    <Hero
      layout="split"
      mediaPosition="start"
      eyebrow="Photographic composition"
      heading="Harbour light"
      description={description}
      actions={
        <Button href="/harbour-light/crops" variant="outline">
          Compare crops
        </Button>
      }
      image={{
        src: "/images/harbour-light.webp",
        alt,
        width: 1536,
        height: 1024,
        sources: [
          {
            media: "(max-width: 40rem)",
            srcSet: "/images/harbour-light-square.webp",
            width: 600,
            height: 600,
          },
        ],
      }}
    />
  );
}`;

export const atlasHero = `"use client";

import { useId, useState } from "react";
import { Button, Hero } from "@alien6-studio/elea-ui";
import { PaletteList } from "./PaletteList";

export function AtlasHero() {
  const [open, setOpen] = useState(false);
  const palettes = useId();

  return (
    <Hero
      heading="The colour atlas"
      description={
        <>
          Three palettes drawn from painting and photography.
          <PaletteList id={palettes} hidden={!open} />
        </>
      }
      actions={
        <Button
          variant="outline"
          aria-expanded={open}
          aria-controls={palettes}
          onClick={() => setOpen(!open)}
        >
          {open ? "Close the palettes" : "Explore the palettes"}
        </Button>
      }
    />
  );
}`;

export const handbookNavbar = `import { Button, Navbar, type NavigationItem } from "@alien6-studio/elea-ui";

const items: NavigationItem[] = [
  {
    id: "guides",
    label: "Guides",
    disclosureLabel: "Browse guides",
    children: [
      { id: "hero", label: "Hero", href: "/guides/hero" },
      { id: "navbar", label: "Navbar", href: "/guides/navbar" },
      { id: "sidebar", label: "Sidebar", href: "/guides/sidebar" },
    ],
  },
  { id: "colours", label: "Colour atlas", href: "/colours" },
];

export function HandbookNavbar({ current }: { current: string }) {
  return (
    <Navbar
      label="Design handbook"
      menuLabel="Menu"
      brand={
        <a href="/">
          <strong>Design handbook</strong>
        </a>
      }
      items={items}
      current={current}
      persistentActions={
        <Button href="/studio" variant="outline" size="sm">
          Studio
        </Button>
      }
    />
  );
}`;

export const toolsNavbar = `import { Navbar, type NavigationItem } from "@alien6-studio/elea-ui";

const items: NavigationItem[] = [
  { id: "editor", label: "Editor", href: "/editor" },
  {
    id: "tools",
    label: "Tools",
    children: [
      { id: "crop", label: "Image crop", href: "/tools/crop" },
      { id: "theme", label: "Theme studio", href: "/tools/theme" },
      { id: "publishing", label: "Publishing", href: "/tools/publishing" },
    ],
  },
];

export function ToolsNavbar({ current }: { current: string }) {
  return (
    <Navbar
      label="Editorial tools"
      menuLabel="Menu"
      collapse="never"
      submenuLayout="columns"
      items={items}
      current={current}
    />
  );
}`;

export const handbookSidebar = `import { Sidebar, type SidebarGroup } from "@alien6-studio/elea-ui";

const groups: SidebarGroup[] = [
  {
    id: "foundations",
    label: "Foundations",
    items: [
      {
        id: "type",
        label: "Typography",
        href: "/typography",
        disclosureLabel: "Browse typography",
        children: [
          {
            id: "letterforms",
            label: "Letterforms",
            href: "/typography/letterforms",
          },
          { id: "sizes", label: "Text sizes", href: "/typography/sizes" },
        ],
      },
      { id: "colours", label: "Colour atlas", href: "/colours" },
    ],
  },
  {
    id: "layout",
    label: "Page layout",
    collapsible: true,
    defaultExpanded: false,
    items: [
      { id: "hero", label: "Hero", href: "/layout/hero" },
      { id: "footer", label: "Footer", href: "/layout/footer" },
    ],
  },
];

export function HandbookSidebar({ current }: { current: string }) {
  return (
    <Sidebar
      label="Library sections"
      header={<strong>Contents</strong>}
      groups={groups}
      current={current}
      footer={<a href="/guides">All chapters</a>}
    />
  );
}`;

export const navigationDrawer = `"use client";

import { useState } from "react";
import { Button, Sheet } from "@alien6-studio/elea-ui";
import { HandbookSidebar } from "./HandbookSidebar";

export function NavigationDrawer({ current }: { current: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
      >
        Contents
      </Button>
      <Sheet
        open={open}
        onClose={() => setOpen(false)}
        side="start"
        size="sm"
        title="Handbook contents"
        closeLabel="Close contents"
      >
        <HandbookSidebar current={current} />
      </Sheet>
    </>
  );
}`;
