import { lazy, useEffect, useLayoutEffect, useMemo, useRef, useState, type ComponentType, type ReactNode } from "react";
import { brandPalettes } from "@alien6-studio/elea-tokens/brand";
import { Accordion, Alert, Avatar, AvatarGroup, Badge, Breadcrumb, Button, Calendar, ColorPicker, Combobox, DateField, MultiSelect, Card, CardHeader, CardImage, CardTitle, Checkbox, Field, Hero, Input, Pagination, Progress, RadioGroup, SaveStatus, SearchField, Select, Separator, Sidebar, Skeleton, Slider, Stepper, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow, Tabs, Toggle } from "@alien6-studio/elea-ui";
import { NotFound } from "../components/NotFound.js";
import { GuideRoute, sectionHref, sectionId, visitSection } from "../components/Demo.js";
import { sitePath } from "../links.js";
import { glacierImage, notebookTitle } from "../notebook.js";
import { brandRoute, makeBrandTheme, type BrandTheme } from "./brandTheme.js";
import {
  BadgePage, ButtonsPage, ChoicesPage, DialogPage, FieldsPage, FooterPage,
  MenuPage, PaginationPage, RadiosPage, SelectPage, TabsPage, TooltipPage,
} from "./ui.js";
import { AlertPage, AvatarPage, CardPage, CarouselPage, PlateCarousel, ProgressPage, SeparatorPage, SkeletonPage } from "./display.js";
import { AccordionPage, SliderPage, TablePage, ToastExampleIcon, ToastPage } from "./data.js";
import { PopoverPage, SheetPage } from "./overlay.js";
import { CalendarPage, collections, ColorPickerPage, ComboboxPage, monthLabels } from "./form-guides.js";
import { StepperPage } from "./stepper.js";
import { ContentComparisonPage, SaveStatusPage } from "./RevisionGuides.js";
import { BreadcrumbPage } from "./BreadcrumbGuide.js";
import { DateFieldPage } from "./DateFieldGuide.js";
import { MultiSelectPage } from "./MultiSelectGuide.js";
import { HeroPage, NavbarPage, SidebarPage } from "./LayoutGuides.js";
import { NotebookHero } from "./layout/NotebookHero.js";
import { HandbookCollection } from "./layout/LibraryNavbar.js";
import { colourPlates } from "../data/colourPlates.js";
import { HandbookLayout } from "./layout/LibrarySidebar.js";
import { reviewSteps } from "../examples/stepper/ReviewSteps.js";
import { categories, componentGuides, type Category, type GuideSummary } from "../data/componentGuides.js";
import "@alien6-studio/elea-content-viewer/styles.css";
import "./catalog.css";

const MediaPage = lazy(async () => ({ default: (await import("./media.js")).MediaPage }));
interface Presentation {
  interaction: ReactNode;
  page: ComponentType<{ brand?: BrandTheme }>;
  workspace?: true;
  preview: ReactNode;
}

type Entry = GuideSummary & Presentation;
const examples: Record<(typeof componentGuides)[number]["slug"], Presentation> = {
  "button": {
    page: ButtonsPage,
    interaction: <>Use <kbd>Enter</kbd> or <kbd>Space</kbd> on a button. A link styled as a button follows its destination with <kbd>Enter</kbd>. Give an icon-only action a descriptive label.</>,
    preview: <><Button size="sm">Publish</Button><Button variant="outline" size="sm">Save draft</Button></>,
  },
  "badge": {
    page: BadgePage,
    interaction: <>Give each state a short, meaningful name such as “Published”. A badge is read with the surrounding content and stays outside the tab order.</>,
    preview: <><Badge tone="success">Published</Badge><Badge tone="warning">In review</Badge><Badge>Draft</Badge></>,
  },
  "field": {
    page: FieldsPage,
    interaction: <>Pass the field render props to the input so its label, help text and error are announced together. <kbd>Tab</kbd> moves between controls.</>,
    preview: <Field label="Article title">{(control) => <Input {...control} readOnly value={notebookTitle} />}</Field>,
  },
  "select": {
    workspace: true, page: SelectPage,
    interaction: <>Open the list and move with the arrow keys. Type a letter to jump to a matching option, choose with <kbd>Enter</kbd> or <kbd>Space</kbd>, and close with <kbd>Escape</kbd>.</>,
    preview: <Select label="Language" value="en" onChange={() => {}} options={[{ value: "en", label: "English" }, { value: "fr", label: "Français" }]} />,
  },
  "calendar": {
    page: CalendarPage,
    interaction: <>Arrow keys move by day or week. <kbd>Page Up</kbd> and <kbd>Page Down</kbd> change the month. Press <kbd>Enter</kbd> or <kbd>Space</kbd> to select the focused date.</>,
    preview: <Calendar className="gallery__calendar" label="Publication date" labels={monthLabels} locale="en-GB" value="2028-02-29" onChange={() => {}} />,
  },
  "date-field": {
    page: DateFieldPage,
    interaction: <>Tab between the date segments and the calendar button. The calendar supports arrow keys and returns focus when you choose a day.</>,
    preview: <DateField label="Publication date" value="2028-03-01" onChange={() => {}} locale="en-GB"
      labels={{ ...monthLabels, day: "Day", month: "Month", year: "Year", openCalendar: "Open calendar" }} />,
  },
  "multi-select": {
    page: MultiSelectPage,
    interaction: <>Type to filter and use the arrow keys to browse. Press <kbd>Enter</kbd> to toggle a result or <kbd>Backspace</kbd> in the empty search field to remove the last tag.</>,
    preview: <MultiSelect label="Collections" options={collections} value={["ice"]} onChange={() => {}}
      labels={{ empty: "No collections found", remove: name => "Remove " + name }} />,
  },
  "combobox": {
    page: ComboboxPage,
    interaction: <>Type to filter and use the arrow keys to explore matches. <kbd>Enter</kbd> selects an option. <kbd>Escape</kbd> restores the previous choice.</>,
    preview: <Combobox options={collections} value={null} onChange={() => {}} label="Collection" placeholder="Search collections…" emptyMessage="No matching collections" />,
  },
  "color-picker": {
    page: ColorPickerPage,
    interaction: <>Use <kbd>Tab</kbd> to reach the swatch or the hex input. Press <kbd>Enter</kbd> to apply a typed value, or <kbd>Escape</kbd> to restore the last colour.</>,
    preview: <ColorPicker label="Ink colour" hexLabel="Ink hex" invalidMessage="Enter a six-digit hex colour." value={brandPalettes.Emerald.seed} onChange={() => {}} />,
  },
  "media": {
    page: MediaPage,
    interaction: <>Use the arrow keys on the frame to move it or on a corner to resize it. Hold <kbd>Shift</kbd> for larger steps. Open Adjust crop to return to a saved composition.</>,
    preview: <img className="gallery__crop" src={`${sitePath}assets/harbour-light.webp`} alt="" loading="lazy" />,
  },
  "choice": {
    page: ChoicesPage,
    interaction: <>Use <kbd>Tab</kbd> to reach each enabled control and <kbd>Space</kbd> to toggle it. A mixed checkbox can represent a partially selected group.</>,
    preview: <div className="catalog-stack"><Checkbox label="Include cover" checked readOnly /><Toggle label="Allow comments" checked onCheckedChange={() => {}} /></div>,
  },
  "radio-group": {
    page: RadiosPage,
    interaction: <>Use <kbd>Tab</kbd> to enter the group and arrow keys to change the checked option. The checked radio contributes its value to the form under the group name.</>,
    preview: <RadioGroup label="Audience" name="preview-audience" defaultValue="team" options={[{ value: "team", label: "Team" }, { value: "public", label: "Public" }]} />,
  },
  "dialog": {
    page: DialogPage,
    interaction: <>Open the dialog and use <kbd>Tab</kbd> or <kbd>Shift</kbd> + <kbd>Tab</kbd> to move inside it. <kbd>Escape</kbd> closes the dialog and returns focus to the opener.</>,
    preview: <div className="gallery__dialog"><strong>Publish article?</strong><span>Visible to everyone in your workspace.</span><Button size="sm">Publish</Button></div>,
  },
  "sheet": {
    page: SheetPage,
    interaction: <>A sheet is a modal dialog: <kbd>Tab</kbd> stays inside it, <kbd>Escape</kbd> or the backdrop closes it and focus returns to the opener. Its body scrolls between the title and the actions.</>,
    preview: <div className="catalog-sheet-preview"><span /><div><strong>Article details</strong><span>Title, summary, author</span><Button size="sm">Save</Button></div></div>,
  },
  "popover": {
    page: PopoverPage,
    interaction: <>The trigger opens the panel and focus moves into it. <kbd>Escape</kbd> closes it and returns to the trigger; a click outside or <kbd>Tab</kbd> past its last control closes it too. The page behind stays usable. A confirmation keeps <kbd>Tab</kbd> inside until it is answered.</>,
    preview: <div className="catalog-popover-preview"><Button variant="outline" size="sm">Invite</Button><div className="elea-popover__panel"><strong>Invite a reader</strong><span>They can read, not edit.</span></div></div>,
  },
  "menu": {
    page: MenuPage,
    interaction: <>Open with <kbd>↓</kbd> or <kbd>↑</kbd>, then move between enabled items with the arrows. <kbd>Home</kbd> and <kbd>End</kbd> jump to the first and last. <kbd>Escape</kbd> dismisses the list.</>,
    preview: <div className="elea-menu__list catalog-menu"><div className="elea-menu__item elea-menu__item--active">Edit article</div><div className="elea-menu__item">Duplicate</div><div className="elea-menu__item elea-menu__item--danger">Delete</div></div>,
  },
  "tooltip": {
    page: TooltipPage,
    interaction: <>Focus the trigger with <kbd>Tab</kbd> to reveal the hint. Keep the trigger’s accessible name meaningful on its own.</>,
    preview: <div className="catalog-tooltip"><span className="elea-tooltip__bubble" data-side="top">Save without publishing</span><Button variant="outline" size="sm">Save draft</Button></div>,
  },
  "slider": {
    page: SliderPage,
    interaction: <>The slider is a native range input. <kbd>←</kbd> and <kbd>→</kbd> move by one step, <kbd>Page Up</kbd> and <kbd>Page Down</kbd> by a larger one, <kbd>Home</kbd> and <kbd>End</kbd> reach the bounds. A worded value is read in place of the number.</>,
    preview: <div className="catalog-fill"><Slider label="Volume" showValue defaultValue={40} /></div>,
  },
  "alert": {
    page: AlertPage,
    interaction: <>Warnings and errors use <code>role="alert"</code> and are announced at once; the other tones use <code>role="status"</code>. The close button is reached with <kbd>Tab</kbd> and carries the label you pass.</>,
    preview: <Alert role="note" tone="success" title="Article published">Visible to everyone.</Alert>,
  },
  "toast": {
    page: ToastPage,
    interaction: <>Toasts sit in a named region that is announced politely, and an error at once. They never take the focus; <kbd>Tab</kbd> reaches their action and close button, and their timer waits while the pointer or the focus is on them. Keep anything people must act on in the page.</>,
    preview: <div className="elea-toast elea-toast--success catalog-fill">
      <span className="elea-toast__icon" aria-hidden="true"><ToastExampleIcon name="success" /></span>
      <div className="elea-toast__body">
        <p className="elea-toast__title">Article published</p>
        <p className="elea-toast__description">Visible to everyone.</p>
      </div>
    </div>,
  },
  "progress": {
    page: ProgressPage,
    interaction: <>The bar is a <code>progressbar</code> named by its label. Word the value with <code>formatValue</code> when a percentage says too little, such as “3 of 8 files”.</>,
    preview: <div className="catalog-fill"><Progress label="Uploading" value={62} showValue /></div>,
  },
  "save-status": {
    page: SaveStatusPage,
    interaction: <>The text sits in a <code>status</code> region that stays mounted, so each change is announced without taking focus. The retry button is outside it and is reached with <kbd>Tab</kbd>.</>,
    preview: <SaveStatus state="saved">Saved at 12:12</SaveStatus>,
  },
  "content-comparison": {
    page: ContentComparisonPage,
    interaction: <>Insertions are <code>ins</code> elements and deletions <code>del</code> elements, underlined and struck through, so the difference does not rest on colour.</>,
    preview: <p className="elea-content elea-comparison">Printed on <del className="elea-change elea-change--removed">Monday</del><ins className="elea-change elea-change--added">Tuesday</ins></p>,
  },
  "skeleton": {
    page: SkeletonPage,
    interaction: <>Placeholders are hidden from assistive technology. Mark the region that loads with <code>aria-busy</code> so its state is announced.</>,
    preview: <div className="catalog-loading catalog-fill"><Skeleton variant="circle" width={36} height={36} /><div className="catalog-stack"><Skeleton width="50%" /><Skeleton lines={2} /></div></div>,
  },
  "card": {
    page: CardPage,
    interaction: <>Give the title the heading level that fits the page. In an interactive card the title link is the only tab stop and covers the whole surface.</>,
    preview: <Card padding="sm" className="gallery__notebook"><CardImage src={glacierImage.data.file.url} alt="" width={1050} height={525} loading="lazy" /><CardHeader><CardTitle>{notebookTitle}</CardTitle></CardHeader></Card>,
  },
  "avatar": {
    page: AvatarPage,
    interaction: <>An avatar is announced by its <code>name</code>. Leave the name empty when it is already written beside the avatar, and name a group with <code>aria-label</code>.</>,
    preview: <AvatarGroup aria-label="Editors" max={3}><Avatar name="Ada Lovelace" tone="primary" /><Avatar name="Grace Hopper" /><Avatar name="Alan Turing" tone="secondary" /><Avatar name="Hedy Lamarr" /></AvatarGroup>,
  },
  "table": {
    page: TablePage,
    interaction: <>A table with a <code>label</code> scrolls inside a named region that <kbd>Tab</kbd> reaches, then the arrow keys scroll it. A sortable heading is a button, and its column states the direction with <code>aria-sort</code>.</>,
    preview: <Table density="sm" className="catalog-fill"><TableHead><TableRow><TableHeaderCell>Article</TableHeaderCell><TableHeaderCell align="end">Words</TableHeaderCell></TableRow></TableHead><TableBody><TableRow><TableCell>Field notes</TableCell><TableCell numeric>1,240</TableCell></TableRow><TableRow><TableCell>Herbarium</TableCell><TableCell numeric>2,105</TableCell></TableRow></TableBody></Table>,
  },
  "navbar": {
    page: NavbarPage,
    interaction: <>Use <kbd>Tab</kbd> to visit the links. In compact layouts, activate the menu button with <kbd>Enter</kbd> or <kbd>Space</kbd>. <kbd>Escape</kbd> closes it and returns focus to the button.</>,
    preview: <div className="gallery__navbar"><HandbookCollection artworks={colourPlates} /></div>,
  },
  "sidebar": {
    page: SidebarPage,
    interaction: <>Tab through group headings and links. Press <kbd>Enter</kbd> or <kbd>Space</kbd> on a collapsible heading to show or hide its links. The active link identifies the current page.</>,
    preview: <div className="gallery__sidebar"><HandbookLayout /></div>,
  },
  "carousel": {
    page: CarouselPage,
    interaction: <>Use the arrow keys to browse. <kbd>Home</kbd> and <kbd>End</kbd> reach the ends. On a touch screen, swipe horizontally.</>,
    preview: <PlateCarousel />,
  },
  "pagination": {
    page: PaginationPage,
    interaction: <>Move between available page buttons with <kbd>Tab</kbd>. <kbd>Enter</kbd> or <kbd>Space</kbd> changes the page. The current page is exposed to assistive technology.</>,
    preview: <Pagination page={2} pageCount={3} onPageChange={() => {}} labels={{ navigation: "Preview pages", previous: "Previous", next: "Next", page: "Page {page}" }} />,
  },
  "breadcrumb": {
    page: BreadcrumbPage,
    interaction: <>Tab to an ancestor and press <kbd>Enter</kbd> to follow it. On a long trail, expand the ellipsis to bring earlier links into the tab order.</>,
    preview: <Breadcrumb label="Publication location" overflowLabel="Earlier pages" items={[
      { id: "library", label: "Library", href: "#/ui" }, { id: "issue", label: "Spring issue" }
    ]} />,
  },
  "stepper": {
    page: StepperPage,
    interaction: <>Use the arrow keys to focus available steps. <kbd>Home</kbd> and <kbd>End</kbd> move to the ends. Activate a step with <kbd>Enter</kbd> or <kbd>Space</kbd>. The current step is announced to screen readers.</>,
    preview: <Stepper label="Proof sections" steps={reviewSteps} current="images" onSelect={() => {}} />,
  },
  "tabs": {
    workspace: true, page: TabsPage,
    interaction: <>Use <kbd>←</kbd> and <kbd>→</kbd> to switch views. <kbd>Home</kbd> and <kbd>End</kbd> activate the first and last enabled tabs. <kbd>Tab</kbd> moves from the selected tab into its panel.</>,
    preview: <Tabs label="Preview views" items={[{ value: "article", label: "Article", panel: <span>Publication details</span> }, { value: "revisions", label: "Revisions", panel: <span>Version history</span> }]} />,
  },
  "hero": {
    page: HeroPage,
    interaction: <>Choose a heading level that fits the document. Describe meaningful images with alt text and give each action a label that names its destination.</>,
    preview: <div className="gallery__hero"><NotebookHero /></div>,
  },
  "accordion": {
    page: AccordionPage,
    interaction: <><kbd>Enter</kbd> or <kbd>Space</kbd> opens and closes a section. <kbd>↓</kbd> and <kbd>↑</kbd> move between the headings, <kbd>Home</kbd> and <kbd>End</kbd> reach the first and last. Each panel is a region named by its heading.</>,
    preview: <Accordion className="catalog-fill" variant="contained" defaultValue={["publish"]} items={[{ value: "publish", label: "Who can publish?", panel: "Editors and owners." }, { value: "export", label: "Can I export?", panel: "Yes, as Markdown." }]} />,
  },
  "separator": {
    page: SeparatorPage,
    interaction: <>A separator is decorative by default and skipped by assistive technology. Pass <code>{"decorative={false}"}</code> where the line carries the structure.</>,
    preview: <div className="catalog-stack catalog-fill"><span>Sign in with a passkey</span><Separator>or</Separator><span>Sign in with email</span></div>,
  },
  "footer": {
    page: FooterPage,
    interaction: <>Group related links under a descriptive heading. Preserve a logical reading order so <kbd>Tab</kbd> moves through the footer links in sequence.</>,
    preview: <div className="catalog-footer-preview"><strong>Field notes</strong><span>Resources<br />Documentation</span><small>Editorial workspace</small></div>,
  },
};

const entries: Entry[] = componentGuides.map(guide => ({ ...guide, ...examples[guide.slug] }));

const MOTION_KEY = "elea-gallery-motion";

function storedMotion() {
  try {
    return localStorage.getItem(MOTION_KEY) !== "off";
  } catch {
    return true;
  }
}

function ExampleLinks({ brand }: Readonly<{ brand?: BrandTheme }>) {
  return (
    <nav aria-label="Composed examples" className="elea-grid__panel catalog-examples">
      <a href={brandRoute("theme", brand)}>
        <span>Edit theme in Theme Studio <span aria-hidden="true">→</span></span>
        <small>Colour, typography and density</small>
      </a>
      <a href={brandRoute("playground", brand)}>
        <span>Explore the editorial workspace <span aria-hidden="true">→</span></span>
        <small>Select, Tabs, Button</small>
      </a>
    </nav>
  );
}

function Overview({ brand, motionSwitch }: Readonly<{ brand?: BrandTheme; motionSwitch: ReactNode }>) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category | "All">("All");
  const searchRef = useRef<HTMLInputElement>(null);
  const terms = query.trim().toLowerCase().split(/\s+/u);
  const filtered = entries.filter((entry) => {
    const parts = entry.sections?.map(part => `${part.title} ${part.keywords ?? ""}`).join(" ") ?? "";
    const text = `${entry.name} ${entry.category} ${entry.summary} ${entry.slug} ${parts}`.toLowerCase();
    return (category === "All" || entry.category === category) && terms.every((term) => text.includes(term));
  });

  function clearFilters() {
    setQuery("");
    setCategory("All");
    searchRef.current?.focus();
  }

  return (
    <>
      <div className="elea-grid catalog-head">
        <Hero className="elea-grid__stage catalog-hero" heading="Components"
          description="Explore the building blocks behind Elea’s publication forms and editorial tools. Each guide includes a live example and its React code." />
        <ExampleLinks brand={brand} />
      </div>
      <div className="catalog-tools">
        <SearchField className="catalog-search" ref={searchRef} label="Search components" clearLabel="Clear component search" value={query} onValueChange={setQuery} />
        <div className="catalog-filters" role="group" aria-label="Filter by category">
          {(["All", ...categories] as const).map((item) =>
            <button key={item} type="button" aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>)}
        </div>
        {motionSwitch}
      </div>
      <p className="catalog-results" role="status">{filtered.length} component {filtered.length === 1 ? "guide" : "guides"}</p>
      {filtered.length > 0 ? <div className="elea-grid gallery">
        {filtered.map((entry) =>
          <article className="elea-grid__third gallery__card" key={entry.slug}>
            <div className="gallery__preview" data-elea-theme={brand && "brand"} inert>{entry.preview}</div>
            <div className="catalog-card__body">
              <span className="catalog-category">{entry.category}</span>
              <h2><a className="gallery__name" href={brandRoute(`ui/${entry.slug}`, brand)}>{entry.name}</a></h2>
              <p>{entry.summary}</p>
            </div>
          </article>)}
      </div> : <section className="catalog-empty">
        <h2>No components found</h2>
        <p>Try another name or choose a different category.</p>
        <Button variant="outline" size="sm" onClick={clearFilters}>Clear filters</Button>
      </section>}
    </>
  );
}

function ComponentGuide({ entry, brand, motionSwitch, section }: Readonly<{ entry: Entry; brand?: BrandTheme; motionSwitch: ReactNode; section?: string }>) {
  const Page = entry.page;
  const guide = brandRoute(`ui/${entry.slug}`, brand);
  const article = useRef<HTMLElement>(null);
  const contents = useRef<HTMLDetailsElement>(null);
  const [indexOpen, setIndexOpen] = useState(false);
  const [sections, setSections] = useState<{ id: string; label: string }[]>([]);

  useLayoutEffect(() => {
    const headings = article.current?.querySelectorAll<HTMLElement>(".catalog-demos h2:not(.demo__stage h2), .catalog-interaction > h2");
    setSections(Array.from(headings ?? [], heading => {
      const label = heading.textContent.trim();
      heading.id ||= sectionId(label);
      heading.tabIndex = -1;
      return { id: heading.id, label };
    }));
  }, [entry]);

  useLayoutEffect(() => {
    if (!section) return;
    const heading = document.getElementById(section);
    if (heading && article.current?.contains(heading) && sections.some(item => item.id === section)) visitSection(heading);
  }, [section, sections]);
  return (
    <div className="elea-grid catalog-layout">
      <aside className="elea-grid__rail catalog-index">
        <Button className="catalog-index__toggle" variant="outline" size="sm" aria-expanded={indexOpen}
          aria-controls="guide-component-index" onClick={() => setIndexOpen(open => !open)}>Browse components</Button>
        <Sidebar id="guide-component-index" label="Component index" current={entry.slug}
          header={<a className="catalog-index__all" href={brandRoute("ui", brand)}>All components</a>}
          groups={categories.map(category => ({
            id: category, label: category,
            items: entries.filter(item => item.category === category).map(item => ({
              id: item.slug, label: item.name, href: brandRoute(`ui/${item.slug}`, brand),
            })),
          }))} />
      </aside>
      <article ref={article} className="elea-grid__body catalog-guide">
        <div className="catalog-guide__bar">
          <Breadcrumb label="Breadcrumb" overflowLabel="Earlier pages" items={[
            { id: "ui", label: "Components", href: brandRoute("ui", brand) },
            { id: entry.category, label: entry.category },
            { id: entry.slug, label: entry.name },
          ]} />
          <div className="catalog-guide__actions">
            <a href={brandRoute("theme", brand)}>Edit theme</a>
            {motionSwitch}
          </div>
        </div>
        <details className="catalog-contents" ref={contents}>
          <summary>On this page</summary>
          <nav aria-label="On this page">
            {sections.map(item => <a key={item.id} href={sectionHref(guide, item.id)}
              aria-current={section === item.id ? "location" : undefined} onClick={event => {
                if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
                if (contents.current) contents.current.open = false;
                const target = document.getElementById(item.id);
                if (event.currentTarget.hash === location.hash && target) visitSection(target);
              }}>{item.label}</a>)}
          </nav>
        </details>
        <GuideRoute.Provider value={guide}><div className="catalog-demos" data-elea-theme={brand && "brand"}><Page brand={brand} /></div></GuideRoute.Provider>
        <section className="catalog-interaction"><h2>Keyboard and accessibility</h2><p>{entry.interaction}</p></section>
        {entry.workspace && (
          <a className="catalog-guide__example" href={brandRoute("playground", brand)}>
            Try this component in the editorial workspace <span aria-hidden="true">→</span>
          </a>
        )}
      </article>
    </div>
  );
}

export default function CatalogPage({ route, brand }: Readonly<{ route: string; brand?: BrandTheme }>) {
  const [, slug, section] = route.split("/");
  const current = entries.find((entry) => slug === entry.slug);
  useEffect(() => {
    document.title = `${current?.name ?? (slug ? "Page not found" : "Components")} · Elea`;
  }, [current, slug]);
  const [motion, setMotion] = useState(storedMotion);
  const css = useMemo(() => brand && makeBrandTheme(brand).css, [brand]);
  useEffect(() => {
    try {
      localStorage.setItem(MOTION_KEY, motion ? "on" : "off");
    } catch {
      // The choice lasts for this visit only.
    }
  }, [motion]);
  const motionSwitch = <Toggle className="catalog-motion" checked={motion} onCheckedChange={setMotion} label="Expressive motion" />;
  return (
    <div className="catalog" data-elea-motion={motion ? "on" : "off"}>
      {css && <style>{css}</style>}
      {current && <ComponentGuide key={current.slug} entry={current} brand={brand} motionSwitch={motionSwitch} section={section} />}
      {!current && slug && <NotFound />}
      {!current && !slug && <Overview brand={brand} motionSwitch={motionSwitch} />}
    </div>
  );
}
