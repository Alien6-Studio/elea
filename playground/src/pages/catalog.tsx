import { lazy, useEffect, useMemo, useRef, useState, type ComponentType, type ReactNode } from "react";
import { brandPalettes } from "@alien6-studio/elea-tokens/brand";
import { Accordion, Alert, Avatar, AvatarGroup, Badge, Button, Calendar, ColorPicker, Combobox, Card, CardHeader, CardImage, CardTitle, Checkbox, Field, Input, Pagination, Progress, RadioGroup, Select, Separator, Skeleton, Slider, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow, Tabs, Toggle } from "@alien6-studio/elea-ui";
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
import "./catalog.css";

const MediaPage = lazy(async () => ({ default: (await import("./media.js")).MediaPage }));
const categories = ["Actions", "Forms", "Display", "Feedback", "Navigation", "Layout", "Media"] as const;
type Category = typeof categories[number];
interface Entry {
  slug: string;
  name: string;
  category: Category;
  summary: string;
  interaction: ReactNode;
  page: ComponentType<{ brand?: BrandTheme }>;
  workspace?: true;
  preview: ReactNode;
}

const entries: Entry[] = [
  {
    slug: "button", name: "Button", category: "Actions", page: ButtonsPage,
    summary: "Trigger an action, show progress or lead to another page.",
    interaction: <>Use <kbd>Enter</kbd> or <kbd>Space</kbd> on a button. A link styled as a button follows its destination with <kbd>Enter</kbd>. Give an icon-only action a descriptive label.</>,
    preview: <><Button size="sm">Publish</Button><Button variant="outline" size="sm">Save draft</Button></>,
  },
  {
    slug: "badge", name: "Badge", category: "Feedback", page: BadgePage,
    summary: "Label an article’s state, priority or workflow status.",
    interaction: <>Give each state a short, meaningful name such as “Published”. A badge is read with the surrounding content and stays outside the tab order.</>,
    preview: <><Badge tone="success">Published</Badge><Badge tone="warning">In review</Badge><Badge>Draft</Badge></>,
  },
  {
    slug: "field", name: "Field, Input, Textarea", category: "Forms", page: FieldsPage,
    summary: "Pair text inputs with labels, instructions and validation.",
    interaction: <>Pass the field render props to the input so its label, help text and error are announced together. <kbd>Tab</kbd> moves between controls.</>,
    preview: <Field label="Article title">{(control) => <Input {...control} readOnly value={notebookTitle} />}</Field>,
  },
  {
    slug: "select", workspace: true, name: "Select", category: "Forms", page: SelectPage,
    summary: "Choose one or several values from a compact list.",
    interaction: <>Open the list and move with the arrow keys. Type a letter to jump to a matching option, choose with <kbd>Enter</kbd> or <kbd>Space</kbd>, and close with <kbd>Escape</kbd>.</>,
    preview: <Select label="Language" value="en" onChange={() => {}} options={[{ value: "en", label: "English" }, { value: "fr", label: "Français" }]} />,
  },
  {
    slug: "calendar", name: "Calendar", category: "Forms", page: CalendarPage,
    summary: "Choose a date in a monthly calendar with optional booking limits.",
    interaction: <>Arrow keys move by day or week. <kbd>Page Up</kbd> and <kbd>Page Down</kbd> change the month. Press <kbd>Enter</kbd> or <kbd>Space</kbd> to select the focused date.</>,
    preview: <Calendar className="gallery__calendar" label="Publication date" labels={monthLabels} locale="en-GB" value="2028-02-29" onChange={() => {}} />,
  },
  {
    slug: "combobox", name: "Combobox", category: "Forms", page: ComboboxPage,
    summary: "Search a long list and choose a matching option.",
    interaction: <>Type to filter and use the arrow keys to explore matches. <kbd>Enter</kbd> selects an option. <kbd>Escape</kbd> restores the previous choice.</>,
    preview: <Combobox options={collections} value={null} onChange={() => {}} label="Collection" placeholder="Search collections…" emptyMessage="No matching collections" />,
  },
  {
    slug: "color-picker", name: "ColorPicker", category: "Forms", page: ColorPickerPage,
    summary: "Choose a colour visually or enter its hex code.",
    interaction: <>Use <kbd>Tab</kbd> to reach the swatch or the hex input. Press <kbd>Enter</kbd> to apply a typed value, or <kbd>Escape</kbd> to restore the last colour.</>,
    preview: <ColorPicker label="Ink colour" hexLabel="Ink hex" invalidMessage="Enter a six-digit hex colour." value={brandPalettes.Emerald.seed} onChange={() => {}} />,
  },
  {
    slug: "media", name: "Image upload and crop", category: "Media", page: MediaPage,
    summary: "Frame an article cover and a feature card from the same original photograph.",
    interaction: <>Use the arrow keys on the frame to move it or on a corner to resize it. Hold <kbd>Shift</kbd> for larger steps. Open Adjust crop to return to a saved composition.</>,
    preview: <img className="gallery__crop" src={`${sitePath}assets/harbour-light.webp`} alt="" loading="lazy" />,
  },
  {
    slug: "choice", name: "Checkbox and Toggle", category: "Forms", page: ChoicesPage,
    summary: "Collect independent selections or switch a setting on and off.",
    interaction: <>Use <kbd>Tab</kbd> to reach each enabled control and <kbd>Space</kbd> to toggle it. A mixed checkbox can represent a partially selected group.</>,
    preview: <div className="catalog-stack"><Checkbox label="Include cover" checked readOnly /><Toggle label="Allow comments" checked onCheckedChange={() => {}} /></div>,
  },
  {
    slug: "radio-group", name: "RadioGroup", category: "Forms", page: RadiosPage,
    summary: "Present mutually exclusive options side by side for comparison.",
    interaction: <>Use <kbd>Tab</kbd> to enter the group and arrow keys to change the checked option. The checked radio contributes its value to the form under the group name.</>,
    preview: <RadioGroup label="Audience" name="preview-audience" defaultValue="team" options={[{ value: "team", label: "Team" }, { value: "public", label: "Public" }]} />,
  },
  {
    slug: "dialog", name: "Dialog", category: "Feedback", page: DialogPage,
    summary: "Keep attention on a decision, confirmation or focused task.",
    interaction: <>Open the dialog and use <kbd>Tab</kbd> or <kbd>Shift</kbd> + <kbd>Tab</kbd> to move inside it. <kbd>Escape</kbd> closes the dialog and returns focus to the opener.</>,
    preview: <div className="gallery__dialog"><strong>Publish article?</strong><span>Visible to everyone in your workspace.</span><Button size="sm">Publish</Button></div>,
  },
  {
    slug: "sheet", name: "Sheet", category: "Feedback", page: SheetPage,
    summary: "Dock a form or details to an edge while the page stays in sight.",
    interaction: <>A sheet is a modal dialog: <kbd>Tab</kbd> stays inside it, <kbd>Escape</kbd> or the backdrop closes it and focus returns to the opener. Its body scrolls between the title and the actions.</>,
    preview: <div className="catalog-sheet-preview"><span /><div><strong>Article details</strong><span>Title, summary, author</span><Button size="sm">Save</Button></div></div>,
  },
  {
    slug: "popover", name: "Popover", category: "Actions", page: PopoverPage,
    summary: "Anchor a short form or details to the control that opens them.",
    interaction: <>The trigger opens the panel and focus moves into it. <kbd>Escape</kbd> closes it and returns to the trigger; a click outside or <kbd>Tab</kbd> past its last control closes it too. The page behind stays usable. A confirmation keeps <kbd>Tab</kbd> inside until it is answered.</>,
    preview: <div className="catalog-popover-preview"><Button variant="outline" size="sm">Invite</Button><div className="elea-popover__panel"><strong>Invite a reader</strong><span>They can read, not edit.</span></div></div>,
  },
  {
    slug: "menu", name: "Menu", category: "Actions", page: MenuPage,
    summary: "Group related actions behind a single trigger.",
    interaction: <>Open with <kbd>↓</kbd> or <kbd>↑</kbd>, then move between enabled items with the arrows. <kbd>Home</kbd> and <kbd>End</kbd> jump to the first and last. <kbd>Escape</kbd> dismisses the list.</>,
    preview: <div className="elea-menu__list catalog-menu"><div className="elea-menu__item elea-menu__item--active">Edit article</div><div className="elea-menu__item">Duplicate</div><div className="elea-menu__item elea-menu__item--danger">Delete</div></div>,
  },
  {
    slug: "tooltip", name: "Tooltip", category: "Feedback", page: TooltipPage,
    summary: "Explain a control when someone hovers or focuses it.",
    interaction: <>Focus the trigger with <kbd>Tab</kbd> to reveal the hint. Keep the trigger’s accessible name meaningful on its own.</>,
    preview: <div className="catalog-tooltip"><span className="elea-tooltip__bubble" data-side="top">Save without publishing</span><Button variant="outline" size="sm">Save draft</Button></div>,
  },
  {
    slug: "slider", name: "Slider", category: "Forms", page: SliderPage,
    summary: "Pick a value along a range by dragging or with the arrow keys.",
    interaction: <>The slider is a native range input. <kbd>←</kbd> and <kbd>→</kbd> move by one step, <kbd>Page Up</kbd> and <kbd>Page Down</kbd> by a larger one, <kbd>Home</kbd> and <kbd>End</kbd> reach the bounds. A worded value is read in place of the number.</>,
    preview: <div className="catalog-fill"><Slider label="Volume" showValue defaultValue={40} /></div>,
  },
  {
    slug: "alert", name: "Alert", category: "Feedback", page: AlertPage,
    summary: "Tell people what happened and what they can do about it.",
    interaction: <>Warnings and errors use <code>role="alert"</code> and are announced at once; the other tones use <code>role="status"</code>. The close button is reached with <kbd>Tab</kbd> and carries the label you pass.</>,
    preview: <Alert role="note" tone="success" title="Article published">Visible to everyone.</Alert>,
  },
  {
    slug: "toast", name: "Toast", category: "Feedback", page: ToastPage,
    summary: "Confirm an action with a brief message above the page.",
    interaction: <>Toasts sit in a named region that is announced politely, and an error at once. They never take the focus; <kbd>Tab</kbd> reaches their action and close button, and their timer waits while the pointer or the focus is on them. Keep anything people must act on in the page.</>,
    preview: <div className="elea-toast elea-toast--success catalog-fill">
      <span className="elea-toast__icon" aria-hidden="true"><ToastExampleIcon name="success" /></span>
      <div className="elea-toast__body">
        <p className="elea-toast__title">Article published</p>
        <p className="elea-toast__description">Visible to everyone.</p>
      </div>
    </div>,
  },
  {
    slug: "progress", name: "Progress", category: "Feedback", page: ProgressPage,
    summary: "Show how far a task has come, or that work is under way.",
    interaction: <>The bar is a <code>progressbar</code> named by its label. Word the value with <code>formatValue</code> when a percentage says too little, such as “3 of 8 files”.</>,
    preview: <div className="catalog-fill"><Progress label="Uploading" value={62} showValue /></div>,
  },
  {
    slug: "skeleton", name: "Skeleton", category: "Feedback", page: SkeletonPage,
    summary: "Hold the shape of content while it loads.",
    interaction: <>Placeholders are hidden from assistive technology. Mark the region that loads with <code>aria-busy</code> so its state is announced.</>,
    preview: <div className="catalog-loading catalog-fill"><Skeleton variant="circle" width={36} height={36} /><div className="catalog-stack"><Skeleton width="50%" /><Skeleton lines={2} /></div></div>,
  },
  {
    slug: "card", name: "Card", category: "Display", page: CardPage,
    summary: "Group related content and actions on one surface.",
    interaction: <>Give the title the heading level that fits the page. In an interactive card the title link is the only tab stop and covers the whole surface.</>,
    preview: <Card padding="sm" className="gallery__notebook"><CardImage src={glacierImage.data.file.url} alt="" width={1050} height={525} loading="lazy" /><CardHeader><CardTitle>{notebookTitle}</CardTitle></CardHeader></Card>,
  },
  {
    slug: "avatar", name: "Avatar", category: "Display", page: AvatarPage,
    summary: "Show who wrote, edited or owns something.",
    interaction: <>An avatar is announced by its <code>name</code>. Leave the name empty when it is already written beside the avatar, and name a group with <code>aria-label</code>.</>,
    preview: <AvatarGroup aria-label="Editors" max={3}><Avatar name="Ada Lovelace" tone="primary" /><Avatar name="Grace Hopper" /><Avatar name="Alan Turing" tone="secondary" /><Avatar name="Hedy Lamarr" /></AvatarGroup>,
  },
  {
    slug: "table", name: "Table", category: "Display", page: TablePage,
    summary: "Lay out records in rows and columns people can scan and sort.",
    interaction: <>A table with a <code>label</code> scrolls inside a named region that <kbd>Tab</kbd> reaches, then the arrow keys scroll it. A sortable heading is a button, and its column states the direction with <code>aria-sort</code>.</>,
    preview: <Table density="sm" className="catalog-fill"><TableHead><TableRow><TableHeaderCell>Article</TableHeaderCell><TableHeaderCell align="end">Words</TableHeaderCell></TableRow></TableHead><TableBody><TableRow><TableCell>Field notes</TableCell><TableCell numeric>1,240</TableCell></TableRow><TableRow><TableCell>Herbarium</TableCell><TableCell numeric>2,105</TableCell></TableRow></TableBody></Table>,
  },
  {
    slug: "carousel", name: "Carousel", category: "Navigation", page: CarouselPage,
    summary: "Browse a sequence of images or cards.",
    interaction: <>Use the arrow keys to browse. <kbd>Home</kbd> and <kbd>End</kbd> reach the ends. On a touch screen, swipe horizontally.</>,
    preview: <PlateCarousel />,
  },
  {
    slug: "pagination", name: "Pagination", category: "Navigation", page: PaginationPage,
    summary: "Move through pages of results while keeping your place.",
    interaction: <>Move between available page buttons with <kbd>Tab</kbd>. <kbd>Enter</kbd> or <kbd>Space</kbd> changes the page. The current page is exposed to assistive technology.</>,
    preview: <Pagination page={2} pageCount={3} onPageChange={() => {}} labels={{ navigation: "Preview pages", previous: "Previous", next: "Next", page: "Page {page}" }} />,
  },
  {
    slug: "tabs", workspace: true, name: "Tabs", category: "Navigation", page: TabsPage,
    summary: "Move between related views within the same workspace.",
    interaction: <>Use <kbd>←</kbd> and <kbd>→</kbd> to switch views. <kbd>Home</kbd> and <kbd>End</kbd> activate the first and last enabled tabs. <kbd>Tab</kbd> moves from the selected tab into its panel.</>,
    preview: <Tabs label="Preview views" items={[{ value: "article", label: "Article", panel: <span>Publication details</span> }, { value: "revisions", label: "Revisions", panel: <span>Version history</span> }]} />,
  },
  {
    slug: "accordion", name: "Accordion", category: "Layout", page: AccordionPage,
    summary: "Fold sections of content under headings people can scan.",
    interaction: <><kbd>Enter</kbd> or <kbd>Space</kbd> opens and closes a section. <kbd>↓</kbd> and <kbd>↑</kbd> move between the headings, <kbd>Home</kbd> and <kbd>End</kbd> reach the first and last. Each panel is a region named by its heading.</>,
    preview: <Accordion className="catalog-fill" variant="contained" defaultValue={["publish"]} items={[{ value: "publish", label: "Who can publish?", panel: "Editors and owners." }, { value: "export", label: "Can I export?", panel: "Yes, as Markdown." }]} />,
  },
  {
    slug: "separator", name: "Separator", category: "Layout", page: SeparatorPage,
    summary: "Draw a line between two groups of content, with an optional label.",
    interaction: <>A separator is decorative by default and skipped by assistive technology. Pass <code>{"decorative={false}"}</code> where the line carries the structure.</>,
    preview: <div className="catalog-stack catalog-fill"><span>Sign in with a passkey</span><Separator>or</Separator><span>Sign in with email</span></div>,
  },
  {
    slug: "footer", name: "Footer", category: "Layout", page: FooterPage,
    summary: "Close a page with product identity, useful links and a signature.",
    interaction: <>Group related links under a descriptive heading. Preserve a logical reading order so <kbd>Tab</kbd> moves through the footer links in sequence.</>,
    preview: <div className="catalog-footer-preview"><strong>Field notes</strong><span>Resources<br />Documentation</span><small>Editorial workspace</small></div>,
  },
];

const MOTION_KEY = "elea-gallery-motion";

function storedMotion() {
  try {
    return localStorage.getItem(MOTION_KEY) !== "off";
  } catch {
    return true;
  }
}

function ExampleLinks({ brand }: { brand?: BrandTheme }) {
  return (
    <nav aria-label="Composed examples" className="catalog-examples">
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

function Overview({ brand, motionSwitch }: { brand?: BrandTheme; motionSwitch: ReactNode }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category | "All">("All");
  const searchRef = useRef<HTMLInputElement>(null);
  const terms = query.trim().toLowerCase().split(/\s+/u);
  const filtered = entries.filter((entry) => {
    const text = `${entry.name} ${entry.category} ${entry.summary} ${entry.slug}`.toLowerCase();
    return (category === "All" || entry.category === category) && terms.every((term) => text.includes(term));
  });

  function clearFilters() {
    setQuery("");
    setCategory("All");
    searchRef.current?.focus();
  }

  return (
    <>
      <header className="catalog-hero">
        <div>
          <h1 className="site-page-title">Components</h1>
          <p>Explore the building blocks behind Elea’s publication forms and editorial tools. Each guide includes a live example and its React code.</p>
        </div>
        <ExampleLinks brand={brand} />
      </header>
      <div className="catalog-tools">
        <label className="catalog-search">
          <span className="site__visually-hidden">Search components</span>
          <svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 4 4" /></svg>
          <Input ref={searchRef} type="search" placeholder="Search components" value={query} onChange={(event) => setQuery(event.currentTarget.value)} />
        </label>
        <div className="catalog-filters" role="group" aria-label="Filter by category">
          {(["All", ...categories] as const).map((item) =>
            <button key={item} type="button" aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>)}
        </div>
        {motionSwitch}
      </div>
      <p className="catalog-results" role="status">{filtered.length} component {filtered.length === 1 ? "guide" : "guides"}</p>
      {filtered.length > 0 ? <div className="gallery">
        {filtered.map((entry) =>
          <article className="gallery__card" key={entry.slug}>
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

function ComponentGuide({ entry, brand, motionSwitch }: { entry: Entry; brand?: BrandTheme; motionSwitch: ReactNode }) {
  const Page = entry.page;
  return (
    <div className="catalog-layout">
      <aside className="catalog-index">
        <nav aria-label="Component index">
          <a className="catalog-index__all" href={brandRoute("ui", brand)}>All components</a>
          {categories.map((category) => <div key={category}>
            <h2>{category}</h2>
            {entries.filter((item) => item.category === category).map((item) =>
              <a key={item.slug} href={brandRoute(`ui/${item.slug}`, brand)} aria-current={item === entry ? "page" : undefined}>{item.name}</a>)}
          </div>)}
        </nav>
      </aside>
      <article className="catalog-guide">
        <div className="catalog-guide__bar">
          <nav aria-label="Breadcrumb" className="catalog-breadcrumb"><a href={brandRoute("ui", brand)}>Components</a><span aria-hidden="true">/</span>{entry.category}</nav>
          <div className="catalog-guide__actions">
            <a href={brandRoute("theme", brand)}>Edit theme</a>
            {motionSwitch}
          </div>
        </div>
        <div className="catalog-demos" data-elea-theme={brand && "brand"}><Page brand={brand} /></div>
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

export default function CatalogPage({ route, brand }: { route: string; brand?: BrandTheme }) {
  const current = entries.find((entry) => route === `ui/${entry.slug}`);
  useEffect(() => {
    document.title = `${current?.name ?? "Components"} · Elea`;
  }, [current]);
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
      {current
        ? <ComponentGuide key={current.slug} entry={current} brand={brand} motionSwitch={motionSwitch} />
        : <Overview brand={brand} motionSwitch={motionSwitch} />}
    </div>
  );
}
