import { useMemo, useState } from "react";
import {
  Accordion, Badge, Button, Slider, Table, TableBody, TableCaption, TableCell, TableFoot, TableHead, TableHeaderCell, TableRow,
  ToastProvider, useToast, type TableSort, type ToastPosition,
} from "@alien6-studio/elea-ui";
import { Demo, PropsTable } from "../components/Demo.js";

const articles = [
  { title: "Autumn field notes", author: "Ada Lovelace", status: "Published", words: 1240, readers: 3812 },
  { title: "Cranes over the valley", author: "Grace Hopper", status: "In review", words: 860, readers: 0 },
  { title: "A winter herbarium", author: "Alan Turing", status: "Draft", words: 2105, readers: 0 },
  { title: "Letters from the marsh", author: "Hedy Lamarr", status: "Published", words: 1530, readers: 9406 },
] as const;
type Column = "title" | "words" | "readers";
const tones = { Published: "success", "In review": "warning", Draft: "neutral" } as const;
const figure = (value: number) => value.toLocaleString("en-GB");

export function TablePage() {
  const [order, setOrder] = useState<{ column: Column; direction: Exclude<TableSort, "none"> }>({ column: "words", direction: "descending" });
  const sorted = useMemo(() => [...articles].sort((a, b) => {
    const result = order.column === "title" ? a.title.localeCompare(b.title) : a[order.column] - b[order.column];
    return order.direction === "ascending" ? result : -result;
  }), [order]);
  const sortBy = (column: Column) => ({
    sort: order.column === column ? order.direction : "none" as const,
    onSort: () => setOrder((current) => ({ column, direction: current.column === column && current.direction === "ascending" ? "descending" : "ascending" })),
  });
  return (
    <>
      <h1>Table</h1>
      <p className="lead">Lay out records in rows and columns people can scan and compare. The table scrolls sideways inside its own region, so it never widens the page.</p>
      <Demo title="Sortable columns" description="A sortable heading is a button; the column states its direction. Sorting the rows stays with you." code={`<Table label="Articles" hoverable>
  <TableHead>
    <TableRow>
      <TableHeaderCell sort={sort.title} onSort={() => sortBy("title")}>Article</TableHeaderCell>
      <TableHeaderCell>Status</TableHeaderCell>
      <TableHeaderCell align="end" sort={sort.words} onSort={() => sortBy("words")}>Words</TableHeaderCell>
      <TableHeaderCell align="end" sort={sort.readers} onSort={() => sortBy("readers")}>Readers</TableHeaderCell>
    </TableRow>
  </TableHead>
  <TableBody>
    {articles.map((article) => (
      <TableRow key={article.title}>
        <TableHeaderCell scope="row">{article.title}</TableHeaderCell>
        <TableCell><Badge tone="success">{article.status}</Badge></TableCell>
        <TableCell numeric>{article.words}</TableCell>
        <TableCell numeric>{article.readers}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>`}>
        <Table label="Articles" hoverable className="catalog-fill">
          <TableHead>
            <TableRow>
              <TableHeaderCell {...sortBy("title")}>Article</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell align="end" {...sortBy("words")}>Words</TableHeaderCell>
              <TableHeaderCell align="end" {...sortBy("readers")}>Readers</TableHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sorted.map((article) => (
              <TableRow key={article.title}>
                <TableHeaderCell scope="row">{article.title}</TableHeaderCell>
                <TableCell><Badge tone={tones[article.status]} variant="subtle">{article.status}</Badge></TableCell>
                <TableCell numeric>{figure(article.words)}</TableCell>
                <TableCell numeric>{figure(article.readers)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Demo>
      <Demo title="Dense, striped, with a caption and a footer" description="A caption names the table for everyone; the footer carries the totals." code={`<Table density="sm" striped>
  <TableCaption>Words written this week</TableCaption>
  <TableHead>…</TableHead>
  <TableBody>
    <TableRow selected>…</TableRow>
  </TableBody>
  <TableFoot>
    <TableRow>
      <TableHeaderCell scope="row">Total</TableHeaderCell>
      <TableCell numeric>5 735</TableCell>
    </TableRow>
  </TableFoot>
</Table>`}>
        <Table density="sm" striped className="catalog-fill">
          <TableCaption>Words written this week</TableCaption>
          <TableHead>
            <TableRow><TableHeaderCell>Author</TableHeaderCell><TableHeaderCell>Article</TableHeaderCell><TableHeaderCell align="end">Words</TableHeaderCell></TableRow>
          </TableHead>
          <TableBody>
            {articles.map((article, index) => (
              <TableRow key={article.title} selected={index === 1}>
                <TableHeaderCell scope="row">{article.author}</TableHeaderCell>
                <TableCell>{article.title}</TableCell>
                <TableCell numeric>{figure(article.words)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFoot>
            <TableRow><TableHeaderCell scope="row" colSpan={2}>Total</TableHeaderCell><TableCell numeric>{figure(articles.reduce((sum, article) => sum + article.words, 0))}</TableCell></TableRow>
          </TableFoot>
        </Table>
      </Demo>
      <Demo title="Sticky header" description="Give the table a height and its header stays in view while the rows scroll." code={`<Table label="Revisions" stickyHeader className="revisions">…</Table>

.revisions { max-block-size: 14rem; }`}>
        <Table label="Revisions" stickyHeader density="sm" className="catalog-fill catalog-table-scroll">
          <TableHead>
            <TableRow><TableHeaderCell>Revision</TableHeaderCell><TableHeaderCell>Editor</TableHeaderCell><TableHeaderCell align="end">Words</TableHeaderCell></TableRow>
          </TableHead>
          <TableBody>
            {Array.from({ length: 14 }, (_, index) => {
              const article = articles[index % articles.length]!;
              return (
                <TableRow key={index}>
                  <TableHeaderCell scope="row">Revision {14 - index}</TableHeaderCell>
                  <TableCell>{article.author}</TableCell>
                  <TableCell numeric>{figure(article.words - index * 37)}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Demo>
      <h2>Props</h2>
      <PropsTable rows={[
        { name: "label", type: "string", description: "Names the scrolling region and lets the keyboard reach it; pass it for any table that may overflow." },
        { name: "density", type: '"sm" | "md"', defaultValue: '"md"', description: "Height of the rows." },
        { name: "striped, hoverable", type: "boolean", defaultValue: "false", description: "Tints every other row; rows answer the pointer." },
        { name: "stickyHeader", type: "boolean", defaultValue: "false", description: "Keeps the header in view; give the table a height through className." },
        { name: "TableRow selected", type: "boolean", defaultValue: "false", description: "Tints the row. State the selection through the row's own control, such as a checkbox." },
        { name: "TableHeaderCell sort, onSort", type: '"ascending" | "descending" | "none", () => void', description: "With onSort the heading becomes a button and the column states its direction." },
        { name: "TableHeaderCell scope", type: '"col" | "row"', defaultValue: '"col"', description: "Use row for the cell that names a row." },
        { name: "align, TableCell numeric", type: '"start" | "center" | "end", boolean', description: "Alignment of a cell; numeric aligns figures to the end." },
      ]} />
    </>
  );
}

const questions = [
  { value: "publish", label: "Who can publish an article?", panel: "Editors and owners publish. Writers submit their draft for review, and are told when it goes live." },
  { value: "history", label: "How long are revisions kept?", panel: "Every revision of the last ninety days is kept. Older ones are thinned to one a week." },
  { value: "export", label: "Can I export my articles?", panel: "Yes, as Markdown or HTML, one article at a time or the whole publication." },
];

export function AccordionPage() {
  const [open, setOpen] = useState<string[]>(["members"]);
  return (
    <>
      <h1>Accordion</h1>
      <p className="lead">Fold long content under headings people can scan, and open only what they need. Under expressive motion a section unfolds; otherwise it opens at once.</p>
      <Demo title="One section at a time" description="Opening a section closes the other; the open one can be closed again." code={`<Accordion
  defaultValue={["publish"]}
  items={[
    { value: "publish", label: "Who can publish an article?", panel: "Editors and owners publish…" },
    { value: "history", label: "How long are revisions kept?", panel: "Every revision of the last ninety days…" },
    { value: "export", label: "Can I export my articles?", panel: "Yes, as Markdown or HTML…" },
  ]}
/>`}>
        <Accordion className="catalog-fill" defaultValue={["publish"]} items={questions} />
      </Demo>
      <Demo title="Several sections, contained" description="With multiple, sections open independently. A controlled accordion reports the open sections." code={`<Accordion
  variant="contained"
  multiple
  value={open}
  onChange={setOpen}
  items={[
    { value: "members", label: "Members", panel: … },
    { value: "billing", label: "Billing", panel: … },
    { value: "archive", label: "Archive", panel: …, disabled: true },
  ]}
/>`}>
        <div className="catalog-stack catalog-fill">
          <Accordion variant="contained" multiple value={open} onChange={setOpen} headingLevel="h3" items={[
            { value: "members", label: "Members", panel: "Five people write for this publication. Invite more from the team page." },
            { value: "billing", label: "Billing", panel: "The plan renews on the first of each month." },
            { value: "archive", label: "Archive", panel: "Nothing is archived.", disabled: true },
          ]} />
          <p className="catalog-note" role="status">{open.length ? `Open: ${open.join(", ")}` : "Everything is closed"}</p>
        </div>
      </Demo>
      <h2>Props</h2>
      <PropsTable rows={[
        { name: "items", type: "AccordionItem[]", description: "Sections with a unique value, a label, a panel and an optional disabled flag." },
        { name: "value, defaultValue", type: "string[]", description: "The open sections, controlled or as a starting point." },
        { name: "onChange", type: "(value: string[]) => void", description: "Called with the open sections after each change." },
        { name: "multiple", type: "boolean", defaultValue: "false", description: "Lets several sections stay open at once." },
        { name: "headingLevel", type: '"h2" … "h6"', defaultValue: '"h3"', description: "Heading level that fits the outline of the page." },
        { name: "variant", type: '"separated" | "contained"', defaultValue: '"separated"', description: "Lines between the sections, or one bordered surface." },
      ]} />
    </>
  );
}

export function SliderPage() {
  const [width, setWidth] = useState(68);
  return (
    <>
      <h1>Slider</h1>
      <p className="lead">Pick a value along a range where the feel matters more than the exact figure. It is a native range input, so the keyboard, touch and forms work as the platform does.</p>
      <Demo title="Label and value" description="The value shows beside the label and follows the thumb." code={`<Slider label="Volume" showValue defaultValue={40} />`}>
        <div className="catalog-fill"><Slider label="Volume" showValue defaultValue={40} /></div>
      </Demo>
      <Demo title="Steps and a worded value" description="formatValue words the value for the eye and for assistive technology." code={`<Slider
  label="Reading width"
  min={48}
  max={96}
  step={4}
  value={width}
  onChange={setWidth}
  showValue
  formatValue={(value) => \`\${value} characters\`}
/>`}>
        <div className="catalog-stack catalog-fill">
          <Slider label="Reading width" min={48} max={96} step={4} value={width} onChange={setWidth} showValue formatValue={(value) => `${value} characters`} />
          <p className="catalog-measure" style={{ maxInlineSize: `${width}ch` }}>Cranes crossed the valley at dusk, calling to one another above the reeds while the light went from the water.</p>
        </div>
      </Demo>
      <Demo title="Sizes and states" code={`<Slider size="sm" aria-label="Zoom" defaultValue={25} />
<Slider label="Brightness" defaultValue={70} />
<Slider label="Locked" defaultValue={55} disabled />`}>
        <div className="catalog-stack catalog-fill">
          <Slider size="sm" aria-label="Zoom" defaultValue={25} />
          <Slider label="Brightness" defaultValue={70} />
          <Slider label="Locked" defaultValue={55} disabled />
        </div>
      </Demo>
      <h2>Props</h2>
      <PropsTable rows={[
        { name: "value, defaultValue", type: "number", description: "The value, controlled or as a starting point; min by default." },
        { name: "onChange", type: "(value: number) => void", description: "Called with the number while the thumb moves." },
        { name: "min, max, step", type: "number", defaultValue: "0, 100, 1", description: "Bounds of the range and distance between two values." },
        { name: "label", type: "ReactNode", description: "Visible label; without one, name the slider with aria-label." },
        { name: "showValue", type: "boolean", defaultValue: "false", description: "Shows the value beside the label." },
        { name: "formatValue", type: "(value: number) => string", description: "Words the value, such as “68 characters”." },
        { name: "size", type: '"sm" | "md"', defaultValue: '"md"', description: "Thickness of the track and size of the thumb." },
        { name: "name, disabled, ref…", type: "input attributes", description: "The native input takes them, and the ref." },
      ]} />
    </>
  );
}

const toastIconShapes = {
  archive: <path d="M4 4h16v5H4zM6 9v11h12V9m-8 4h4" />,
  neutral: <path d="M6 3h8l4 4v14H6zM14 3v5h4M9 13h6m-6 4h6" />,
  success: <><circle cx="12" cy="12" r="9" /><path d="m8.5 12.5 2.5 2.5 4.5-5.5" /></>,
  info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v5m0-8.5v.5" /></>,
  warning: <path d="M12 3 22 20H2zM12 9v4m0 3v.5" />,
  danger: <><circle cx="12" cy="12" r="9" /><path d="m9 9 6 6m0-6-6 6" /></>,
};

export function ToastExampleIcon({ name }: { name: keyof typeof toastIconShapes }) {
  return (
    <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {toastIconShapes[name]}
    </svg>
  );
}

const toastExamples = [
  { label: "Neutral", tone: "neutral", title: "Draft saved" },
  { label: "Success", tone: "success", title: "Article published", description: "It is now visible to everyone." },
  { label: "Info", tone: "info", title: "Maintenance is planned for Sunday" },
  { label: "Warning", tone: "warning", title: "Your session ends in five minutes" },
  { label: "Danger", tone: "danger", title: "The article could not be saved", description: "Check your connection and try again." },
] as const;

function ToastDemos({ position, onPosition }: { position: ToastPosition; onPosition: (position: ToastPosition) => void }) {
  const { toast, dismiss } = useToast();
  return (
    <>
      <Demo title="Tones" description="A toast confirms what just happened and leaves by itself. Errors are announced at once, the others politely." code={`const { toast } = useToast();
const icon = <ToastExampleIcon name="success" />;

<Button
  size="sm"
  variant="success"
  icon={icon}
  onClick={() => toast({
    tone: "success",
    title: "Article published",
    description: "It is now visible to everyone.",
    icon,
  })}
>
  Success
</Button>`}>
        {toastExamples.map(({ label, ...message }) => {
          const icon = <ToastExampleIcon name={message.tone} />;
          return (
            <Button
              key={message.tone}
              size="sm"
              variant={message.tone === "neutral" ? "outline" : message.tone}
              icon={icon}
              onClick={() => toast({ ...message, icon })}
            >
              {label}
            </Button>
          );
        })}
      </Demo>
      <Demo title="An action, and a toast that stays" description="A lifetime of Infinity keeps the toast until it is dismissed. Its timer also waits while the pointer or the focus is on the toasts." code={`const id = toast({
  title: "Article moved to the archive",
  icon: <ToastExampleIcon name="archive" />,
  duration: Infinity,
  action: <Button size="sm" variant="ghost" onClick={() => { restore(); dismiss(id); }}>Undo</Button>,
});`}>
        <Button size="sm" variant="secondary" onClick={() => {
          const id = toast({
            id: "archive",
            title: "Article moved to the archive",
            icon: <ToastExampleIcon name="archive" />,
            duration: Infinity,
            action: <Button size="sm" variant="ghost" onClick={() => {
              dismiss(id);
              toast({ tone: "success", icon: <ToastExampleIcon name="success" />, title: "Article restored" });
            }}>Undo</Button>,
          });
        }}>Archive the article</Button>
        <Button size="sm" variant="ghost" onClick={() => dismiss()}>Dismiss all</Button>
      </Demo>
      <Demo title="Replace a toast" description="A toast shown under the id of a visible one takes its place, to follow a task from start to end." code={`toast({ id: "export", title: "Preparing the export…", duration: Infinity });
await exportArticles();
toast({ id: "export", tone: "success", icon: <ToastExampleIcon name="success" />, title: "Export ready" });`}>
        <Button size="sm" variant="secondary" onClick={() => {
          toast({ id: "export", title: "Preparing the export…", duration: Infinity });
          setTimeout(() => toast({ id: "export", tone: "success", icon: <ToastExampleIcon name="success" />, title: "Export ready", description: "42 articles as Markdown." }), 1500);
        }}>Export the articles</Button>
      </Demo>
      <Demo title="Position" description="The provider places the stack in a corner or the middle of an edge; it follows the reading direction." code={`<ToastProvider label="Notifications" dismissLabel="Dismiss" position="top-center">
  <App />
</ToastProvider>`}>
        {(["top-start", "top-center", "top-end", "bottom-start", "bottom-center", "bottom-end"] as const).map((item) => (
          <Button key={item} size="sm" variant={item === position ? "primary" : "outline"} aria-pressed={item === position} onClick={() => {
            onPosition(item);
            toast({ id: "position", tone: "info", icon: <ToastExampleIcon name="info" />, title: `Toasts appear ${item.replace("-", " ")}` });
          }}>{item}</Button>
        ))}
      </Demo>
    </>
  );
}

export function ToastPage() {
  const [position, setPosition] = useState<ToastPosition>("bottom-end");
  return (
    <ToastProvider label="Notifications" dismissLabel="Dismiss" position={position}>
      <h1>Toast</h1>
      <p className="lead">Confirm an action with a brief message above the page, without taking the focus. Wrap the application in a ToastProvider once, then call useToast wherever something happens.</p>
      <ToastDemos position={position} onPosition={setPosition} />
      <h2>Props</h2>
      <PropsTable rows={[
        { name: "ToastProvider label", type: "string", description: "Accessible name of the region that holds the toasts, such as “Notifications”." },
        { name: "ToastProvider dismissLabel", type: "string", description: "Accessible name of the close button of a toast." },
        { name: "position", type: '"top-start" … "bottom-end"', defaultValue: '"bottom-end"', description: "Where the stack sits on the page." },
        { name: "duration", type: "number", defaultValue: "5000", description: "Default lifetime of a toast in milliseconds." },
        { name: "max", type: "number", defaultValue: "3", description: "Toasts shown at once; the oldest leave first." },
        { name: "motion", type: "boolean", description: "Expressive motion for the toasts; follows the page when omitted." },
        { name: "toast(options)", type: "(options: ToastOptions) => string", description: "Shows a toast and returns its id. Options: title, description, tone, icon, action, duration, id." },
        { name: "dismiss(id?)", type: "(id?: string) => void", description: "Dismisses one toast, or all of them without an id." },
      ]} />
    </ToastProvider>
  );
}
