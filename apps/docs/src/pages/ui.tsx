import { useState } from "react";
import { Badge, Button, Checkbox, ConfirmDialog, Dialog, Field, IconButton, Input, Menu, Pagination, Select, Textarea, Toggle, Tooltip } from "@alien6-studio/elea-ui";
import { Demo, PropsTable } from "../components/Demo.js";
import { href } from "../router.js";

const PlusIcon = () => <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>;

export function UiOverviewPage() {
  return (
    <>
      <h1>Components</h1>
      <p className="lead">Interface primitives on the tokens: small, accessible, labelled by the host. Each page shows the component live, its code and its props.</p>
      <div className="gallery">
        <a href={href("ui/button")}><div className="gallery__preview"><Button>Primary</Button><Button variant="outline">Outline</Button></div><div className="gallery__name">Button</div></a>
        <a href={href("ui/badge")}><div className="gallery__preview"><Badge tone="primary">New</Badge><Badge tone="success" variant="solid">Published</Badge><Badge tone="warning" variant="outline">Pending</Badge></div><div className="gallery__name">Badge</div></a>
        <a href={href("ui/field")}><div className="gallery__preview"><div style={{ width: "12rem" }}><Field label="Email">{(control) => <Input {...control} readOnly value="ada@example.org" />}</Field></div></div><div className="gallery__name">Field, Input, Textarea</div></a>
        <a href={href("ui/select")}><div className="gallery__preview"><Select label="Language" value="fr" onChange={() => {}} options={[{ value: "fr", label: "Français" }, { value: "en", label: "English" }]} /></div><div className="gallery__name">Select</div></a>
        <a href={href("ui/choice")}><div className="gallery__preview"><Checkbox label="Remember me" checked readOnly /><Toggle label="Notifications" checked onCheckedChange={() => {}} /></div><div className="gallery__name">Checkbox and Toggle</div></a>
        <a href={href("ui/dialog")}><div className="gallery__preview"><div style={{ padding: "var(--elea-space-3) var(--elea-space-4)", background: "var(--elea-color-surface-default)", borderRadius: "var(--elea-radius-lg)", boxShadow: "var(--elea-shadow-lg)", fontSize: "var(--elea-font-size-sm)" }}><strong>Delete this article?</strong><div style={{ color: "var(--elea-color-text-muted)" }}>This cannot be undone.</div></div></div><div className="gallery__name">Dialog</div></a>
        <a href={href("ui/menu")}><div className="gallery__preview"><div className="elea-menu__list" style={{ position: "static" }}><div className="elea-menu__item">Edit</div><div className="elea-menu__item">Share</div><div className="elea-menu__item elea-menu__item--danger">Delete</div></div></div><div className="gallery__name">Menu</div></a>
        <a href={href("ui/tooltip")}><div className="gallery__preview"><span className="elea-tooltip__bubble" style={{ position: "static", opacity: 1, transform: "none", visibility: "visible" }}>Saves a draft</span></div><div className="gallery__name">Tooltip</div></a>
        <a href={href("ui/pagination")}><div className="gallery__preview"><Pagination page={2} pageCount={5} onPageChange={() => {}} labels={{ navigation: "Pagination", previous: "Previous", next: "Next", page: "Page {page}" }} /></div><div className="gallery__name">Pagination</div></a>
      </div>
      <h2>Conventions</h2>
      <ul>
        <li><strong>Labels by props.</strong> No component carries text of its own; the host passes labels, in its language.</li>
        <li><strong>Class names, not styles.</strong> Each component renders <code>elea-*</code> classes styled by the package stylesheet, on the tokens only. Add <code>className</code> for layout.</li>
        <li><strong>Native first.</strong> Buttons, inputs, checkboxes and dialogs wrap the native element and keep its behaviour, events and form participation.</li>
        <li><strong>Server-safe.</strong> Button, Badge, Field and Pagination render in server components; Dialog, Menu, Tooltip, Checkbox and Toggle carry the client boundary themselves.</li>
      </ul>
    </>
  );
}

export function ButtonsPage() {
  const [loading, setLoading] = useState(false);
  return (
    <>
      <h1>Button</h1>
      <p className="lead">The action of a form, a card, a toolbar. Five variants, three sizes, icons, a loading state that keeps the layout, and a link form.</p>
      <Demo title="Variants" code={`<Button>Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="danger">Danger</Button>`}>
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="danger">Danger</Button>
      </Demo>
      <Demo title="Sizes and icons" code={`<Button size="sm" icon={<PlusIcon />}>Small</Button>
<Button icon={<PlusIcon />}>Medium</Button>
<Button size="lg" trailingIcon={<PlusIcon />}>Large</Button>
<IconButton label="Add">{<PlusIcon />}</IconButton>`}>
        <Button size="sm" icon={<PlusIcon />}>Small</Button>
        <Button icon={<PlusIcon />}>Medium</Button>
        <Button size="lg" trailingIcon={<PlusIcon />}>Large</Button>
        <IconButton label="Add"><PlusIcon /></IconButton>
      </Demo>
      <Demo title="Loading and disabled" description="Click to load for two seconds." code={`<Button loading={loading} loadingLabel="Saving" onClick={save}>Save</Button>
<Button disabled>Disabled</Button>
<Button href="https://example.org" variant="outline">A link</Button>`}>
        <Button loading={loading} loadingLabel="Saving" onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 2000); }}>Save</Button>
        <Button disabled>Disabled</Button>
        <Button href="https://example.org" variant="outline">A link</Button>
      </Demo>
      <h2>Props</h2>
      <PropsTable rows={[
        { name: "variant", type: '"primary" | "secondary" | "outline" | "ghost" | "danger"', defaultValue: '"primary"', description: "Visual weight of the action." },
        { name: "size", type: '"sm" | "md" | "lg"', defaultValue: '"md"', description: "Height and type size." },
        { name: "icon, trailingIcon", type: "ReactNode", description: "Icons before and after the label, hidden from assistive technology." },
        { name: "loading", type: "boolean", defaultValue: "false", description: "Shows a spinner, keeps the label for layout, blocks interaction." },
        { name: "loadingLabel", type: "string", description: "Accessible name while loading." },
        { name: "href", type: "string", description: "Renders an anchor styled as a button." },
        { name: "fullWidth", type: "boolean", defaultValue: "false", description: "Stretches to the container." },
      ]} />
    </>
  );
}

export function BadgePage() {
  return (
    <>
      <h1>Badge</h1>
      <p className="lead">A small label for a status or a count.</p>
      <Demo title="Tones" code={`<Badge>Neutral</Badge>
<Badge tone="primary">Primary</Badge>
<Badge tone="success" variant="solid">Published</Badge>
<Badge tone="warning" variant="outline">Pending</Badge>
<Badge tone="danger" size="sm">3</Badge>`}>
        <Badge>Neutral</Badge>
        <Badge tone="primary">Primary</Badge>
        <Badge tone="secondary">Secondary</Badge>
        <Badge tone="success" variant="solid">Published</Badge>
        <Badge tone="warning" variant="outline">Pending</Badge>
        <Badge tone="danger" size="sm">3</Badge>
      </Demo>
      <h2>Props</h2>
      <PropsTable rows={[
        { name: "tone", type: '"neutral" | "primary" | "secondary" | "success" | "warning" | "danger"', defaultValue: '"neutral"', description: "Color meaning." },
        { name: "variant", type: '"subtle" | "solid" | "outline"', defaultValue: '"subtle"', description: "Fill style." },
        { name: "size", type: '"sm" | "md"', defaultValue: '"md"', description: "Compact or regular." },
        { name: "icon", type: "ReactNode", description: "Icon before the text." },
      ]} />
    </>
  );
}

export function FieldsPage() {
  const [email, setEmail] = useState("");
  const invalid = email.length > 0 && !email.includes("@");
  return (
    <>
      <h1>Field, Input, Textarea</h1>
      <p className="lead">A field pairs a control with its label, help text and error, and wires the ARIA attributes between them. The control is yours: the field hands it an id and the ids to reference.</p>
      <Demo title="A validated field" description="Type something without an @ to see the error." code={`<Field label="Email" help="We never share it" error={invalid ? "Enter a valid address" : undefined} required requiredMarker="*">
  {(control) => <Input {...control} type="email" value={email} onChange={(event) => setEmail(event.target.value)} invalid={invalid} />}
</Field>`}>
        <div style={{ width: "20rem" }}>
          <Field label="Email" help="We never share it" error={invalid ? "Enter a valid address" : undefined} required requiredMarker="*">
            {(control) => <Input {...control} type="email" value={email} onChange={(event) => setEmail(event.target.value)} invalid={invalid} />}
          </Field>
        </div>
      </Demo>
      <Demo title="Textarea and sizes" code={`<Input size="sm" placeholder="Small" />
<Input placeholder="Medium" />
<Input size="lg" placeholder="Large" />
<Textarea placeholder="A longer text" />`}>
        <div style={{ display: "grid", gap: "var(--elea-space-3)", width: "20rem" }}>
          <Input size="sm" placeholder="Small" aria-label="Small" />
          <Input placeholder="Medium" aria-label="Medium" />
          <Input size="lg" placeholder="Large" aria-label="Large" />
          <Textarea placeholder="A longer text" aria-label="A longer text" />
        </div>
      </Demo>
      <h2>Props of Field</h2>
      <PropsTable rows={[
        { name: "label", type: "ReactNode", description: "Visible label, linked to the control." },
        { name: "help, error", type: "ReactNode", description: "Texts under the control; the error is announced as an alert." },
        { name: "required, requiredMarker", type: "boolean, ReactNode", description: "Marks the field required; the marker is visual only." },
        { name: "children", type: "(control) => ReactNode", description: "Renders the control with id, aria-describedby, aria-invalid and required." },
      ]} />
    </>
  );
}

export function ChoicesPage() {
  const [checked, setChecked] = useState(false);
  const [on, setOn] = useState(true);
  return (
    <>
      <h1>Checkbox and Toggle</h1>
      <p className="lead">Native inputs underneath, so forms, labels and screen readers work as always. The toggle is a checkbox exposed as a switch.</p>
      <Demo title="Checkbox" code={`<Checkbox label="Send me the newsletter" description="Once a month, no more" onCheckedChange={setChecked} />
<Checkbox label="Partially selected" indeterminate />
<Checkbox label="Disabled" disabled />`}>
        <div style={{ display: "grid", gap: "var(--elea-space-3)" }}>
          <Checkbox label="Send me the newsletter" description="Once a month, no more" checked={checked} onCheckedChange={setChecked} />
          <Checkbox label="Partially selected" indeterminate readOnly />
          <Checkbox label="Disabled" disabled />
        </div>
      </Demo>
      <Demo title="Toggle" code={`<Toggle checked={on} onCheckedChange={setOn} label="Notifications" />`}>
        <Toggle checked={on} onCheckedChange={setOn} label="Notifications" />
        <Toggle checked={false} onCheckedChange={() => {}} label="Disabled" disabled />
      </Demo>
    </>
  );
}

export function DialogPage() {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);
  return (
    <>
      <h1>Dialog</h1>
      <p className="lead">A modal that takes the focus, keeps Tab inside, closes on Escape or on the backdrop, and gives the focus back to the opener.</p>
      <Demo title="Dialog and ConfirmDialog" code={`<Dialog open={open} onClose={() => setOpen(false)} title="Share this article" description="Choose who can read it." closeLabel="Close"
  actions={<><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => setOpen(false)}>Share</Button></>}>
  <Field label="Link">{(control) => <Input {...control} readOnly value="https://example.org/a/1" />}</Field>
</Dialog>

<ConfirmDialog open={confirm} onConfirm={...} onCancel={...} title="Delete this article?" description="This cannot be undone." tone="danger"
  confirmLabel="Delete" cancelLabel="Keep" closeLabel="Close" />`}>
        <Button onClick={() => setOpen(true)}>Open a dialog</Button>
        <Button variant="danger" onClick={() => setConfirm(true)}>Delete something</Button>
        <Dialog open={open} onClose={() => setOpen(false)} title="Share this article" description="Choose who can read it." closeLabel="Close" actions={<><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => setOpen(false)}>Share</Button></>}>
          <Field label="Link">{(control) => <Input {...control} readOnly value="https://example.org/a/1" />}</Field>
        </Dialog>
        <ConfirmDialog open={confirm} onConfirm={() => setConfirm(false)} onCancel={() => setConfirm(false)} title="Delete this article?" description="This cannot be undone." tone="danger" confirmLabel="Delete" cancelLabel="Keep" closeLabel="Close" />
      </Demo>
      <h2>Props</h2>
      <PropsTable rows={[
        { name: "open, onClose", type: "boolean, () => void", description: "Controlled visibility." },
        { name: "title, description", type: "ReactNode", description: "Named and described through ARIA." },
        { name: "closeLabel", type: "string", description: "Accessible name of the close control." },
        { name: "actions", type: "ReactNode", description: "Footer buttons." },
        { name: "size", type: '"sm" | "md" | "lg"', defaultValue: '"md"', description: "Maximum width." },
        { name: "dismissOnBackdrop", type: "boolean", defaultValue: "true", description: "A click outside closes the dialog." },
      ]} />
    </>
  );
}

export function MenuPage() {
  const [last, setLast] = useState("nothing yet");
  return (
    <>
      <h1>Menu</h1>
      <p className="lead">A dropdown: arrows move, Enter selects, Escape and a click outside close. Items are real buttons.</p>
      <Demo title="Actions menu" description={`Last action: ${last}`} code={`<Menu label="Article actions" items={[
  { id: "edit", label: "Edit", onSelect: () => ... },
  { id: "share", label: "Share", onSelect: () => ... },
  { id: "archive", label: "Archive", disabled: true, onSelect: () => ... },
  { id: "delete", label: "Delete", danger: true, onSelect: () => ... },
]} trigger={(props) => <Button variant="outline" {...props}>Actions</Button>} />`}>
        <Menu
          label="Article actions"
          items={[
            { id: "edit", label: "Edit", onSelect: () => setLast("edit") },
            { id: "share", label: "Share", onSelect: () => setLast("share") },
            { id: "archive", label: "Archive", disabled: true, onSelect: () => setLast("archive") },
            { id: "delete", label: "Delete", danger: true, onSelect: () => setLast("delete") },
          ]}
          trigger={(props) => <Button variant="outline" {...props}>Actions</Button>}
        />
      </Demo>
    </>
  );
}

export function TooltipPage() {
  return (
    <>
      <h1>Tooltip</h1>
      <p className="lead">A short hint on hover and focus, described to assistive technology.</p>
      <Demo title="On a button" code={`<Tooltip content="Saves a draft without publishing">
  <Button variant="outline">Save draft</Button>
</Tooltip>`}>
        <Tooltip content="Saves a draft without publishing"><Button variant="outline">Save draft</Button></Tooltip>
        <Tooltip content="Shown below" placement="bottom"><IconButton label="Help">?</IconButton></Tooltip>
      </Demo>
    </>
  );
}

export function PaginationPage() {
  const [page, setPage] = useState(3);
  return (
    <>
      <h1>Pagination</h1>
      <p className="lead">Previous, next, a window of pages around the current one, and an optional summary. Labels are yours.</p>
      <Demo title="Twelve pages" code={`<Pagination page={page} pageCount={12} onPageChange={setPage} totalItems={115} pageSize={10}
  labels={{ navigation: "Pagination", previous: "Previous page", next: "Next page", page: "Page {page}", summary: "{from}–{to} of {total}" }} />`}>
        <div style={{ width: "100%" }}>
          <Pagination page={page} pageCount={12} onPageChange={setPage} totalItems={115} pageSize={10} labels={{ navigation: "Pagination", previous: "Previous page", next: "Next page", page: "Page {page}", summary: "{from}–{to} of {total}" }} />
        </div>
      </Demo>
    </>
  );
}

export function SelectPage() {
  const [language, setLanguage] = useState<string | null>("fr");
  const [days, setDays] = useState<string[]>(["mon", "wed"]);
  const languages = [{ value: "fr", label: "Français" }, { value: "en", label: "English" }, { value: "de", label: "Deutsch", disabled: true }, { value: "es", label: "Español" }];
  const week = [{ value: "mon", label: "Monday" }, { value: "tue", label: "Tuesday" }, { value: "wed", label: "Wednesday" }, { value: "thu", label: "Thursday" }, { value: "fri", label: "Friday" }];
  return (
    <>
      <h1>Select</h1>
      <p className="lead">A button and a listbox in place of the native control, so it looks the same on every platform and takes the tokens. Arrows move, Enter and Space pick, Escape closes, typing jumps to the matching option. With <code>multiple</code> it becomes a checklist.</p>
      <Demo title="Single value" description={`Selected: ${language ?? "none"}`} code={`<Select label="Language" value={language} onChange={setLanguage} placeholder="Pick a language"
  options={[{ value: "fr", label: "Français" }, { value: "en", label: "English" }, { value: "de", label: "Deutsch", disabled: true }]} />`}>
        <Select label="Language" value={language} onChange={setLanguage} placeholder="Pick a language" options={languages} />
        <Select size="sm" label="Language, small" value={language} onChange={setLanguage} options={languages} />
        <Select label="Disabled" value="fr" onChange={() => {}} options={languages} disabled />
      </Demo>
      <Demo title="Checklist" description={`Selected: ${days.join(", ") || "none"}`} code={`<Select multiple label="Days" value={days} onChange={setDays} placeholder="Pick days"
  summary={(values) => \`\${values.length} day(s)\`} options={week} />`}>
        <Select multiple label="Days" value={days} onChange={setDays} placeholder="Pick days" summary={(values) => `${values.length} day(s)`} options={week} />
        <Select multiple label="Days, labels joined" value={days} onChange={setDays} placeholder="Pick days" options={week} />
      </Demo>
      <Demo title="In a field" code={`<Field label="Language">{(control) => <Select id={control.id} labelledBy={control["aria-labelledby"]} value={language} onChange={setLanguage} options={languages} />}</Field>`}>
        <div style={{ width: "16rem" }}>
          <Field label="Language" help="Used for every label of the editor.">{(control) => <Select id={control.id} value={language} onChange={setLanguage} options={languages} />}</Field>
        </div>
      </Demo>
      <h2>Props</h2>
      <PropsTable rows={[
        { name: "options", type: "{ value, label, disabled? }[]", description: "The choices; labels can be any content." },
        { name: "value, onChange", type: "string | null, (value) => void", description: "Controlled value; with multiple, a string array both ways." },
        { name: "multiple", type: "boolean", defaultValue: "false", description: "A checklist: the list stays open, each option toggles." },
        { name: "summary", type: "(values) => ReactNode", description: "What the trigger shows for several values; labels joined by default." },
        { name: "label, labelledBy", type: "string", description: "Accessible name, or the id of a visible label." },
        { name: "placeholder, size, disabled, invalid, name", type: "…", description: "As on a field; name adds hidden inputs for forms." },
      ]} />
    </>
  );
}
