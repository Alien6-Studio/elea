import { useState } from "react";
import { Button, Checkbox, ConfirmPopover, Field, Input, Popover, Sheet, Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow, Textarea, type ConfirmTone, type PopoverAnchor, type SheetProps } from "@alien6-studio/elea-ui";
import { Demo, PropsTable } from "../components/Demo.js";

const TrashIcon = () => <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" /></svg>;

const CheckIcon = () => <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="m8 12 3 3 5-6" /></svg>;

const drafts = ["Field notes", "Release plan", "Style guide", "Reading list", "Interview", "Changelog"];
const tones: { tone: ConfirmTone; action: string; title: string }[] = [
  { tone: "danger", action: "Delete", title: "Delete this article?" },
  { tone: "primary", action: "Publish", title: "Publish this article?" },
  { tone: "success", action: "Approve", title: "Approve this article?" },
  { tone: "info", action: "Archive", title: "Archive this article?" },
];

export function PopoverPage() {
  const [articles, setArticles] = useState(drafts);
  const [row, setRow] = useState<{ name: string; anchor: HTMLElement } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [point, setPoint] = useState<PopoverAnchor | null>(null);
  const [asked, setAsked] = useState<{ tone: ConfirmTone; title: string; action: string; anchor: HTMLElement } | null>(null);
  const [answer, setAnswer] = useState("nothing yet");
  const [rejecting, setRejecting] = useState<HTMLElement | null>(null);
  const [reason, setReason] = useState("nothing yet");
  const [refusing, setRefusing] = useState<HTMLElement | null>(null);
  const [comment, setComment] = useState("nothing yet");
  const [invited, setInvited] = useState("nobody yet");
  const [email, setEmail] = useState("");
  const [open, setOpen] = useState(false);
  const [visits, setVisits] = useState(0);
  const [heading, setHeading] = useState("Cranes over the valley");
  const [filters, setFilters] = useState({ drafts: true, published: false });
  return (
    <>
      <h1>Popover</h1>
      <p className="lead">Anchor a short form, filters or details to the control that opens them. A popover leaves the page usable: use a dialog when the task must be finished first, and a menu for a plain list of actions.</p>
      <Demo title="A short form" description={`Last invitation: ${invited}`} code={`<Popover label="Invite a reader" trigger={(props) => <Button variant="outline" {...props}>Invite</Button>}>
  {({ close }) => (
    <form onSubmit={(event) => { event.preventDefault(); setInvited(email); close(); }}>
      <Field label="Email">{(control) => <Input {...control} type="email" required value={email} onChange={(event) => setEmail(event.target.value)} />}</Field>
      <Button variant="ghost" size="sm" onClick={close}>Cancel</Button>
      <Button type="submit" size="sm">Send</Button>
    </form>
  )}
</Popover>`}>
        <Popover label="Invite a reader" trigger={(props) => <Button variant="outline" {...props}>Invite</Button>}>
          {({ close }) => (
            <form className="catalog-popover-form" onSubmit={(event) => { event.preventDefault(); setInvited(email); setEmail(""); close(); }}>
              <Field label="Email">{(control) => <Input {...control} type="email" required value={email} onChange={(event) => setEmail(event.target.value)} />}</Field>
              <div className="catalog-popover-actions">
                <Button variant="ghost" size="sm" onClick={close}>Cancel</Button>
                <Button type="submit" size="sm">Send</Button>
              </div>
            </form>
          )}
        </Popover>
      </Demo>
      <Demo title="Side and alignment" description="The panel opens under or above its anchor, against its start, its centre or its end. When that side has no room it flips to the other one, and it shifts to stay inside the viewport." code={`<Popover label="Reading time" side="bottom" align="start" trigger={…}>About six minutes.</Popover>
<Popover label="Word count" side="bottom" align="center" trigger={…}>1,240 words.</Popover>
<Popover label="Last revision" side="top" align="end" trigger={…}>Saved on Monday.</Popover>`}>
        <Popover label="Reading time" trigger={(props) => <Button variant="outline" size="sm" {...props}>Bottom start</Button>}>About six minutes.</Popover>
        <Popover label="Word count" align="center" trigger={(props) => <Button variant="outline" size="sm" {...props}>Bottom centre</Button>}>1,240 words.</Popover>
        <Popover label="Last revision" side="top" align="end" trigger={(props) => <Button variant="outline" size="sm" {...props}>Top end</Button>}>Saved on Monday.</Popover>
      </Demo>
      <Demo title="Controlled" description={`The popover is ${open ? "open" : "closed"}. Showing: ${Object.entries(filters).filter(([, on]) => on).map(([name]) => name).join(", ") || "nothing"}`} code={`<Popover label="Filters" open={open} onOpenChange={setOpen} trigger={(props) => <Button variant="outline" {...props}>Filters</Button>}>
  <Checkbox label="Drafts" checked={filters.drafts} onCheckedChange={…} />
  <Checkbox label="Published" checked={filters.published} onCheckedChange={…} />
</Popover>`}>
        <Popover label="Filters" open={open} onOpenChange={setOpen} trigger={(props) => <Button variant="outline" {...props}>Filters</Button>}>
          <div className="catalog-stack">
            <Checkbox label="Drafts" checked={filters.drafts} onCheckedChange={(drafts) => setFilters({ ...filters, drafts })} />
            <Checkbox label="Published" checked={filters.published} onCheckedChange={(published) => setFilters({ ...filters, published })} />
          </div>
        </Popover>
      </Demo>
      <Demo title="Inside a clickable row" description={`The row was opened ${visits} times. A click in the panel stops there, so a popover declared in a row or a card that is itself clickable does not activate it. The trigger is yours: stop its click if it should not open the row either.`} code={`<div onClick={() => setVisits((count) => count + 1)}>
  <span>{heading}</span>
  <Popover label="Rename" align="end" trigger={(props) => (
    <Button variant="outline" size="sm" {...props} onClick={(event) => { event.stopPropagation(); props.onClick(); }}>Rename</Button>
  )}>
    {({ close }) => (
      <>
        <Field label="Title">{(control) => <Input {...control} value={heading} onChange={(event) => setHeading(event.target.value)} />}</Field>
        <Button size="sm" onClick={close}>Done</Button>
      </>
    )}
  </Popover>
</div>`}>
        <div className="catalog-popover-row" data-demo="row" onClick={() => setVisits((count) => count + 1)}>
          <span>{heading}</span>
          <Popover label="Rename" align="end" trigger={(props) => (
            <Button variant="outline" size="sm" {...props} onClick={(event) => { event.stopPropagation(); props.onClick(); }}>Rename</Button>
          )}>
            {({ close }) => (
              <div className="catalog-popover-form">
                <Field label="Title">{(control) => <Input {...control} value={heading} onChange={(event) => setHeading(event.target.value)} />}</Field>
                <div className="catalog-popover-actions"><Button size="sm" onClick={close}>Done</Button></div>
              </div>
            )}
          </Popover>
        </div>
      </Demo>
      <Demo title="One confirmation for a list" description={`${articles.length} articles. One ConfirmPopover serves every row: the row button becomes its anchor. The panel sits in the top layer, so the scrolling container does not cut it.`} code={`const [row, setRow] = useState<{ name: string; anchor: HTMLElement } | null>(null);

{articles.map((name) => (
  <Button key={name} variant="ghost" size="sm" aria-haspopup="dialog" onClick={(event) => setRow({ name, anchor: event.currentTarget })}>Delete</Button>
))}

<ConfirmPopover anchor={row?.anchor ?? null} open={row !== null} tone="danger" icon={<TrashIcon />} loading={deleting}
  title={\`Delete \${row?.name}?\`} description="This cannot be undone." confirmLabel="Delete" cancelLabel="Keep"
  onConfirm={remove} onCancel={() => setRow(null)} />`}>
        <div className="catalog-popover-scroll">
          <Table label="Articles" density="sm">
            <TableHead><TableRow><TableHeaderCell>Article</TableHeaderCell><TableHeaderCell align="end">Action</TableHeaderCell></TableRow></TableHead>
            <TableBody>
              {articles.map((name) => (
                <TableRow key={name}>
                  <TableCell>{name}</TableCell>
                  <TableCell align="end"><Button variant="ghost" size="sm" aria-haspopup="dialog" aria-label={`Delete ${name}`} onClick={(event) => setRow({ name, anchor: event.currentTarget })}>Delete</Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <Button variant="outline" size="sm" onClick={() => setArticles(drafts)}>Restore the list</Button>
        <ConfirmPopover anchor={row?.anchor ?? null} open={row !== null} tone="danger" icon={<TrashIcon />} loading={deleting} align="end"
          title={`Delete ${row?.name ?? "it"}?`} description="This cannot be undone." confirmLabel="Delete" cancelLabel="Keep"
          onConfirm={() => {
            setDeleting(true);
            setTimeout(() => {
              setArticles((all) => all.filter((name) => name !== row?.name));
              setDeleting(false);
              setRow(null);
            }, 900);
          }}
          onCancel={() => setRow(null)} />
      </Demo>
      <Demo title="Tones and icon" description={`Last answer: ${answer}. ConfirmPopover and ConfirmDialog take the same tone values and the same optional icon.`} code={`<ConfirmPopover anchor={anchor} open={open} tone="success" icon={<CheckIcon />}
  title="Approve this article?" confirmLabel="Approve" cancelLabel="Cancel" onConfirm={…} onCancel={…} />`}>
        {tones.map(({ tone, action, title }) => (
          <Button key={tone} variant="outline" size="sm" aria-haspopup="dialog" onClick={(event) => setAsked({ tone, title, action, anchor: event.currentTarget })}>{action}</Button>
        ))}
        <ConfirmPopover anchor={asked?.anchor ?? null} open={asked !== null} tone={asked?.tone} icon={asked?.tone === "danger" ? <TrashIcon /> : <CheckIcon />}
          title={asked?.title} confirmLabel={asked?.action ?? "Confirm"} cancelLabel="Cancel"
          onConfirm={() => { setAnswer(`${asked?.action} confirmed`); setAsked(null); }}
          onCancel={() => { setAnswer(`${asked?.action} cancelled`); setAsked(null); }} />
      </Demo>
      <Demo title="An optional reason" description={`Received: ${reason}. With field, the confirmation shows a labelled input and hands its trimmed text to onConfirm. Focus opens in the field and Enter confirms.`} code={`<ConfirmPopover anchor={anchor} open={open} tone="danger" title="Reject this article?" confirmLabel="Reject" cancelLabel="Cancel"
  field={{ label: "Reason", placeholder: "Optional" }}
  onConfirm={(reason) => reject(reason)} onCancel={close} />`}>
        <Button variant="outline" size="sm" aria-haspopup="dialog" onClick={(event) => setRejecting(event.currentTarget)}>Reject</Button>
        <ConfirmPopover anchor={rejecting} open={rejecting !== null} tone="danger" title="Reject this article?" confirmLabel="Reject" cancelLabel="Cancel"
          field={{ label: "Reason", placeholder: "Optional" }}
          onConfirm={(value) => { setReason(value ? `"${value}"` : "no reason"); setRejecting(null); }}
          onCancel={() => setRejecting(null)} />
      </Demo>
      <Demo title="A required comment" description={`Received: ${comment}. A required field keeps the confirm button disabled while it is empty, and the button is described by the label of the field. In a multiline field Enter adds a line: Ctrl or Cmd with Enter confirms.`} code={`<ConfirmPopover anchor={anchor} open={open} title="Refuse the request" confirmLabel="Refuse" cancelLabel="Cancel"
  field={{ label: "Comment", required: true, multiline: true, maxLength: 280 }}
  onConfirm={(comment) => refuse(comment)} onCancel={close} />`}>
        <Button variant="outline" size="sm" aria-haspopup="dialog" onClick={(event) => setRefusing(event.currentTarget)}>Refuse</Button>
        <ConfirmPopover anchor={refusing} open={refusing !== null} title="Refuse the request" confirmLabel="Refuse" cancelLabel="Cancel"
          field={{ label: "Comment", required: true, multiline: true, maxLength: 280 }}
          onConfirm={(value) => { setComment(`"${value}"`); setRefusing(null); }}
          onCancel={() => setRefusing(null)} />
      </Demo>
      <Demo title="Virtual anchor" description="A host that only kept the coordinates of a click passes an object with getBoundingClientRect. Focus is not returned to it: there is no element to return to." code={`const [point, setPoint] = useState<PopoverAnchor | null>(null);

<button onClick={(event) => { const { clientX: x, clientY: y } = event; setPoint({ getBoundingClientRect: () => new DOMRect(x, y, 0, 0) }); }}>Click anywhere</button>
<Popover label="Position" anchor={point} open={point !== null} onOpenChange={() => setPoint(null)}>Opened where you clicked.</Popover>`}>
        <button type="button" className="catalog-popover-zone" onClick={(event) => { const { clientX: x, clientY: y } = event; setPoint({ getBoundingClientRect: () => new DOMRect(x, y, 0, 0) }); }}>Click anywhere in this area</button>
        <Popover label="Position" anchor={point} open={point !== null} onOpenChange={() => setPoint(null)}>Opened where you clicked.</Popover>
      </Demo>
      <h2>Props</h2>
      <p>A popover is anchored either to the <code>trigger</code> it renders, or to an <code>anchor</code> the host hands it together with <code>open</code>.</p>
      <PropsTable rows={[
        { name: "trigger", type: "(props) => ReactNode", description: "Render the trigger and spread its click and ARIA props." },
        { name: "anchor", type: "HTMLElement | { getBoundingClientRect(): DOMRect } | null", description: "Instead of trigger: the element, or the virtual rectangle, the panel is placed against. Requires open; nothing shows while it is null. Focus returns to it when it is an element." },
        { name: "children", type: "ReactNode | ({ close }) => ReactNode", description: "The panel content; the function form receives close, which also returns focus to the trigger." },
        { name: "label", type: "string", description: "Accessible name of the panel." },
        { name: "open, defaultOpen", type: "boolean", defaultValue: "false", description: "Visibility, controlled or as a starting point." },
        { name: "onOpenChange", type: "(open: boolean) => void", description: "Called when the popover asks to open or close." },
        { name: "side", type: '"bottom" | "top"', defaultValue: '"bottom"', description: "Preferred side; the panel flips when it has no room there." },
        { name: "align", type: '"start" | "center" | "end"', defaultValue: '"start"', description: "Edge of the anchor the panel lines up with." },
      ]} />
      <h2>ConfirmPopover props</h2>
      <p>An alert dialog anchored to a control: focus opens on the cancel button, or in the <code>field</code> when there is one, and stays inside, <kbd>Escape</kbd> and an outside click cancel, and focus returns to the anchor.</p>
      <PropsTable rows={[
        { name: "anchor", type: "HTMLElement | { getBoundingClientRect(): DOMRect } | null", description: "What the confirmation is placed against, usually the button that asked." },
        { name: "open", type: "boolean", description: "Visibility; the host owns it." },
        { name: "title", type: "ReactNode", description: "The question, which names the panel." },
        { name: "description", type: "ReactNode", description: "The consequence, read after the title." },
        { name: "confirmLabel, cancelLabel", type: "string", description: "Text of the two buttons." },
        { name: "onConfirm", type: "(value?: string) => void", description: "Called by the confirm button, with the trimmed text of the field when there is one and with no argument otherwise." },
        { name: "onCancel", type: "() => void", description: "Called by the cancel button; Escape and an outside click cancel." },
        { name: "field", type: "ConfirmField", description: "Collects a value with the answer, between the description and the buttons. ConfirmDialog takes the same one." },
        { name: "loading", type: "boolean", defaultValue: "false", description: "Disables both buttons and the field, and shows progress on the confirm button." },
        { name: "tone", type: '"danger" | "primary" | "success" | "info"', defaultValue: '"primary"', description: "Colour of the confirm button and of the icon." },
        { name: "icon", type: "ReactNode", description: "Shown before the title, hidden from assistive technology." },
        { name: "side, align", type: '"bottom" | "top", "start" | "center" | "end"', defaultValue: '"bottom", "start"', description: "Preferred place; it flips and shifts to stay in the viewport." },
      ]} />
      <h2>ConfirmField</h2>
      <p>The <code>field</code> of ConfirmPopover and ConfirmDialog. Its value starts over each time the confirmation opens. With per-component style sheets, load <code>css/field.css</code> too.</p>
      <PropsTable rows={[
        { name: "label", type: "string", description: "Visible label, tied to the input. It also describes the confirm button while the field keeps it disabled." },
        { name: "placeholder", type: "string", description: "Hint shown while the field is empty." },
        { name: "required", type: "boolean", defaultValue: "false", description: "Keeps the confirm button disabled while the field is empty, and marks the input as required." },
        { name: "multiline", type: "boolean", defaultValue: "false", description: "A textarea: Enter adds a line, Ctrl or Cmd with Enter confirms." },
        { name: "maxLength", type: "number", description: "Longest value the input accepts." },
        { name: "defaultValue", type: "string", description: "Text the field opens with." },
        { name: "expected", type: "string", description: "Keeps the confirm button disabled until the trimmed value matches exactly, case included." },
      ]} />
    </>
  );
}

const sides = ["start", "end", "top", "bottom"] as const;

export function SheetPage() {
  const [editing, setEditing] = useState(false);
  const [side, setSide] = useState<NonNullable<SheetProps["side"]> | null>(null);
  return (
    <>
      <h1>Sheet</h1>
      <p className="lead">Dock a form, filters or details to an edge of the viewport while the page stays in sight behind. A sheet is a dialog: it keeps the focus until it is closed.</p>
      <Demo title="A form beside the page" description="The body scrolls; the title and the actions stay in place." code={`<Sheet open={open} onClose={() => setOpen(false)} title="Article details" description="Shown on the article page and in search results." closeLabel="Close"
  actions={<><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => setOpen(false)}>Save</Button></>}>
  <Field label="Title">{(control) => <Input {...control} defaultValue="Cranes over the valley" />}</Field>
  <Field label="Summary">{(control) => <Textarea {...control} rows={4} />}</Field>
</Sheet>`}>
        <Button onClick={() => setEditing(true)}>Edit details</Button>
        <Sheet open={editing} onClose={() => setEditing(false)} title="Article details" description="Shown on the article page and in search results." closeLabel="Close" actions={<><Button variant="outline" onClick={() => setEditing(false)}>Cancel</Button><Button onClick={() => setEditing(false)}>Save</Button></>}>
          <div className="catalog-stack">
            <Field label="Title">{(control) => <Input {...control} defaultValue="Cranes over the valley" />}</Field>
            <Field label="Summary">{(control) => <Textarea {...control} rows={4} defaultValue="Cranes crossed the valley at dusk, calling to one another above the reeds." />}</Field>
            <Field label="Author">{(control) => <Input {...control} defaultValue="Grace Hopper" />}</Field>
          </div>
        </Sheet>
      </Demo>
      <Demo title="Sides and sizes" description="A side sheet takes its size as a width, a top or bottom sheet as a share of the height." code={`<Sheet open={open} onClose={close} side="bottom" size="sm" title="Revisions" closeLabel="Close">…</Sheet>`}>
        {sides.map((name) => <Button key={name} variant="outline" size="sm" onClick={() => setSide(name)}>{name}</Button>)}
        <Sheet open={side !== null} onClose={() => setSide(null)} side={side ?? "end"} size="sm" title="Revisions" closeLabel="Close">
          <ol className="catalog-revisions">
            {Array.from({ length: 14 }, (_, index) => <li key={index}>Revision {14 - index}</li>)}
          </ol>
        </Sheet>
      </Demo>
      <h2>Props</h2>
      <PropsTable rows={[
        { name: "open, onClose", type: "boolean, () => void", description: "Controlled visibility." },
        { name: "title, description", type: "ReactNode", description: "Named and described through ARIA." },
        { name: "closeLabel", type: "string", description: "Accessible name of the close control." },
        { name: "side", type: '"start" | "end" | "top" | "bottom"', defaultValue: '"end"', description: "Edge of the viewport the sheet is docked to." },
        { name: "size", type: '"sm" | "md" | "lg"', defaultValue: '"md"', description: "Width of a side sheet, height of a top or bottom one." },
        { name: "actions", type: "ReactNode", description: "Buttons pinned under the body." },
        { name: "dismissOnBackdrop", type: "boolean", defaultValue: "true", description: "A click outside closes the sheet." },
        { name: "motion", type: "boolean", description: "Turns the slide on or off for this sheet. A sheet is rendered in a portal, so by default it follows data-elea-motion on the page, not on its container." },
      ]} />
    </>
  );
}
