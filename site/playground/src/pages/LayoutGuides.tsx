import { Demo, PropsTable } from "../components/Demo.js";
import { AtlasHero } from "./layout/AtlasHero.js";
import { NotebookHero } from "./layout/NotebookHero.js";
import { HarbourHero } from "./layout/HarbourHero.js";
import { HandbookCollection } from "./layout/LibraryNavbar.js";
import { EditorialTools } from "./layout/EditorialTools.js";
import * as snippets from "./layout/snippets.js";
import { colourPlates } from "../data/colourPlates.js";
import { HandbookLayout } from "./layout/LibrarySidebar.js";
import { NavigationDrawer } from "./layout/NavigationDrawer.js";

export function HeroPage() {
  return <>
    <h1>Hero</h1>
    <p className="lead">Introduce a publication or collection with a headline, a lead image and a route into the story.</p>
    <div className="layout-sample">
    <Demo title="Photographic cover" description="Set a headline directly on the photograph. The browser chooses between two image widths, and the cover keeps the text legible over the ice." code={snippets.notebookHero}>
      <NotebookHero />
    </Demo>
    <Demo title="Image-led feature" description="Show the full horizon alongside the story. On a phone, a square crop keeps the lighthouse in view beneath the introduction." code={snippets.harbourHero}>
      <HarbourHero />
    </Demo>
    <Demo title="Text opening" description="Open the atlas to see the primary, secondary and tertiary colours of three palettes." code={snippets.atlasHero}>
      <AtlasHero />
    </Demo>
    </div>
    <h2>Props</h2>
    <PropsTable rows={[
      { name: "heading", type: "ReactNode", description: "The headline for the section." },
      { name: "headingLevel", type: '"h1" … "h6"', defaultValue: '"h1"', description: "Choose the level that follows the surrounding page structure." },
      { name: "layout", type: '"stacked" | "split" | "cover"', defaultValue: '"stacked"', description: "Place media below the copy, beside it or behind it on a photographic cover." },
      { name: "image", type: "ResponsiveImageProps", description: "Supply src, alt and intrinsic dimensions. Optional srcSet, sizes and picture sources support different crops by viewport." },
      { name: "mediaPosition", type: '"start" | "end"', defaultValue: '"end"', description: "Choose which edge carries the image in a split layout." },
      { name: "eyebrow, description", type: "ReactNode", description: "Optional publication name and introductory copy." },
      { name: "actions, media", type: "ReactNode", description: "Supply links or buttons and an image, picture or figure with its own text alternative." },
    ]} />
  </>;
}

export function NavbarPage() {
  return <>
    <h1>Navbar</h1>
    <p className="lead">Give readers direct access to the main destinations in a site.</p>
    <div className="layout-sample">
    <Demo title="Publication masthead" description="Open Guides for a vertical list of chapters. Choose a chapter or a colour study to read it in this preview." code={snippets.handbookNavbar}>
      <HandbookCollection artworks={colourPlates} />
    </Demo>
    <Demo title="Column menu" description="Open Tools to see destinations arranged in columns on a wide screen. Selecting one shows that part of the notebook here." code={snippets.toolsNavbar}>
      <EditorialTools />
    </Demo>
    </div>
    <h2>Props</h2>
    <PropsTable rows={[
      { name: "label, menuLabel", type: "string", description: "Translated names for the navigation landmark and its compact menu button." },
      { name: "items", type: "readonly NavigationItem[]", description: "Give destinations an id, label and href. A group with children can omit href so its label opens the list." },
      { name: "current", type: "string", description: "The id of the active link, announced as the current page." },
      { name: "submenuLayout", type: '"list" | "columns"', defaultValue: '"list"', description: "Stack child links beneath their group or arrange them in columns across a wide navbar." },
      { name: "collapse", type: '"auto" | "never"', defaultValue: '"auto"', description: "Collapse into a disclosure in narrow containers, or keep a short list of links in view." },
      { name: "persistentActions", type: "ReactNode", description: "Keep a utility such as search or account access visible on both wide and narrow screens." },
      { name: "brand, actions", type: "ReactNode", description: "Place a home link before the destinations and account or utility controls after them." },
      { name: "render", type: "(props: ButtonLinkRenderProps) => ReactElement", description: "Forward the link props to your router’s link component." },
    ]} />
  </>;
}

export function SidebarPage() {
  return <>
    <h1>Sidebar</h1>
    <p className="lead">Organise a collection into named groups and keep the current page in view.</p>
    <div className="layout-sample">
    <Demo title="Site and section navigation" description="Choose a chapter in the contents to read it beside the sidebar. The top bar follows its collection." code={snippets.handbookSidebar}>
      <HandbookLayout />
    </Demo>
    <Demo title="Navigation drawer" description="Open Contents and choose a chapter. The drawer closes and the article shows your selection." code={snippets.navigationDrawer}>
      <NavigationDrawer />
    </Demo>
    </div>
    <h2>Props</h2>
    <PropsTable rows={[
      { name: "label", type: "string", description: "Accessible name for this navigation landmark." },
      { name: "groups", type: "readonly SidebarGroup[]", description: "Named groups of links. Items can include children; the ancestors of the current item open automatically." },
      { name: "collapsible, defaultExpanded", type: "boolean (per group)", description: "Allow a group to fold and choose whether it starts open." },
      { name: "current", type: "string", description: "The id of the current destination across all groups." },
      { name: "header, footer", type: "ReactNode", description: "Add a collection title above the groups and a return link or account action below them." },
      { name: "render", type: "(props: ButtonLinkRenderProps) => ReactElement", description: "Supply the same router-link adapter as Navbar and Button." },
    ]} />
  </>;
}
