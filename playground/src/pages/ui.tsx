import { useState, type CSSProperties } from "react";
import { Badge, Button, Checkbox, ConfirmDialog, Dialog, DialogBody, DialogClose, DialogDescription, DialogFooter, DialogHeader, DialogRoot, DialogTitle, Field, Footer, IconButton, Input, Menu, MenuContent, MenuGroup, MenuItem, MenuRoot, MenuSeparator, MenuTrigger, Pagination, RadioGroup, Select, Tab, TabList, TabPanel, Tabs, TabsRoot, Textarea, Toggle, Tooltip } from "@alien6-studio/elea-ui";
import { Demo, PropsTable } from "../components/Demo.js";
import { sitePath } from "../links.js";
import { brandRoute, type BrandTheme } from "./brandTheme.js";

const TrashIcon = () => <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" /></svg>;
const PlusIcon = () => <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>;

export function ButtonsPage() {
  const [loading, setLoading] = useState(false);
  return (
    <>
      <h1>Button</h1>
      <p className="lead">Give a form or toolbar a clear primary action. Choose a variant for each action and use a loading state while work is in progress.</p>
      <Demo title="Variants" code={`<Button>Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="danger">Danger</Button>
<Button variant="success">Success</Button>
<Button variant="info">Info</Button>`}>
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="danger">Danger</Button>
        <Button variant="success">Success</Button>
        <Button variant="info">Info</Button>
      </Demo>
      <Demo title="An info colour of its own" description="The info variant reads the info colour, like the info tone of an alert, a badge, a toast or a progress bar. It starts as the link colour and follows the theme, until a host sets it." code={`<div style={{ "--elea-color-info": "light-dark(#0e7490, #67e8f9)" }}>
  <Button variant="info">Teal info</Button>
</div>`}>
        <div style={{ "--elea-color-info": "light-dark(#0e7490, #67e8f9)" } as CSSProperties}>
          <Button variant="info">Teal info</Button>
        </div>
      </Demo>
      <Demo title="Sizes and icons" description="Five sizes, from a compact toolbar action to a landing page call to action." code={`<Button size="xs">Extra small</Button>
<Button size="sm" icon={<PlusIcon />}>Small</Button>
<Button icon={<PlusIcon />}>Medium</Button>
<Button size="lg" trailingIcon={<PlusIcon />}>Large</Button>
<Button size="xl">Extra large</Button>
<IconButton variant="disc" label="Add"><PlusIcon /></IconButton>`}>
        <Button size="xs">Extra small</Button>
        <Button size="sm" icon={<PlusIcon />}>Small</Button>
        <Button icon={<PlusIcon />}>Medium</Button>
        <Button size="lg" trailingIcon={<PlusIcon />}>Large</Button>
        <Button size="xl">Extra large</Button>
        <IconButton variant="disc" label="Add"><PlusIcon /></IconButton>
      </Demo>
      <Demo title="Radius" description="From square corners to a pill. The default follows the corner style of the theme." code={`<Button radius="none">None</Button>
<Button radius="sm">Small</Button>
<Button>Medium</Button>
<Button radius="lg">Large</Button>
<Button radius="full">Full</Button>
<IconButton variant="outline" radius="full" label="Add"><PlusIcon /></IconButton>`}>
        <Button radius="none">None</Button>
        <Button radius="sm">Small</Button>
        <Button>Medium</Button>
        <Button radius="lg">Large</Button>
        <Button radius="full">Full</Button>
        <IconButton variant="outline" radius="full" label="Add"><PlusIcon /></IconButton>
      </Demo>
      <Demo title="Shadow" description="The default follows the theme. An explicit shadow adds elevation on a busy surface." code={`<Button>Theme default</Button>
<Button shadow="sm">Small shadow</Button>
<Button shadow="md">Medium shadow</Button>
<Button variant="outline" shadow="md" radius="full">Outline pill</Button>`}>
        <Button>Theme default</Button>
        <Button shadow="sm">Small shadow</Button>
        <Button shadow="md">Medium shadow</Button>
        <Button variant="outline" shadow="md" radius="full">Outline pill</Button>
      </Demo>
      <Demo title="Loading and disabled" description="Save shows a pending state for two seconds." code={`<Button loading={loading} loadingLabel="Saving" onClick={save}>Save</Button>
<Button disabled>Disabled</Button>
<Button href="https://example.org" variant="outline">A link</Button>`}>
        <Button loading={loading} loadingLabel="Saving" onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 2000); }}>Save</Button>
        <Button disabled>Disabled</Button>
        <Button href="https://example.org" variant="outline">A link</Button>
      </Demo>
      <Demo title="Motion" description="Once the page or a container opts in, a button moves on a damped spring: it lifts on hover, its icons lean in and a press compresses it before it bounces back. The Expressive motion switch of this gallery sets it on the page. Motion stays off by default and never runs when the visitor prefers reduced motion." code={`<html data-elea-motion="on">

<Button trailingIcon={<PlusIcon />}>Continue</Button>
<Button variant="secondary" icon={<PlusIcon />}>Add a page</Button>
<Button variant="outline">Follows the page</Button>
<Button variant="outline" motion={false}>Always still</Button>`}>
        <Button trailingIcon={<PlusIcon />}>Continue</Button>
        <Button variant="secondary" icon={<PlusIcon />}>Add a page</Button>
        <Button variant="outline">Follows the page</Button>
        <Button variant="outline" motion={false}>Always still</Button>
      </Demo>
      <Demo title="Effects" description="The effect names the gesture a button plays under expressive motion. Hover and press each one: push sinks onto its edge, ripple spreads from the press, spotlight, magnetic and tilt follow the pointer." code={`<Button effect="lift">Lift</Button>
<Button effect="scale" radius="full">Scale</Button>
<Button effect="push" variant="secondary">Push</Button>
<Button effect="shine">Shine</Button>
<Button effect="ripple" variant="outline">Ripple</Button>
<Button effect="spotlight" variant="secondary">Spotlight</Button>
<Button effect="magnetic" radius="full" shadow="md">Magnetic</Button>
<Button effect="tilt" size="lg">Tilt</Button>`}>
        <Button effect="lift">Lift</Button>
        <Button effect="scale" radius="full">Scale</Button>
        <Button effect="push" variant="secondary">Push</Button>
        <Button effect="shine">Shine</Button>
        <Button effect="ripple" variant="outline">Ripple</Button>
        <Button effect="spotlight" variant="secondary">Spotlight</Button>
        <Button effect="magnetic" radius="full" shadow="md">Magnetic</Button>
        <Button effect="tilt" size="lg">Tilt</Button>
      </Demo>
      <h2>Props</h2>
      <PropsTable rows={[
        { name: "variant", type: '"primary" | "secondary" | "outline" | "ghost" | "danger" | "success" | "info"', defaultValue: '"primary"', description: "Visual weight of the action." },
        { name: "size", type: '"xs" | "sm" | "md" | "lg" | "xl"', defaultValue: '"md"', description: "Height and type size." },
        { name: "radius", type: '"none" | "sm" | "md" | "lg" | "full"', defaultValue: '"md"', description: "Corner rounding, from square to pill." },
        { name: "shadow", type: '"none" | "sm" | "md"', defaultValue: '"none"', description: "A resting shadow that lifts the button off the surface." },
        { name: "effect", type: '"lift" | "scale" | "push" | "shine" | "ripple" | "spotlight" | "magnetic" | "tilt"', defaultValue: '"lift"', description: "The gesture played under expressive motion. It does nothing while motion is off." },
        { name: "icon, trailingIcon", type: "ReactNode", description: "Icons before and after the label, hidden from assistive technology." },
        { name: "loading", type: "boolean", defaultValue: "false", description: "Shows a spinner, keeps the label for layout, blocks interaction." },
        { name: "loadingLabel", type: "string", description: "Accessible name while loading." },
        { name: "href", type: "string", description: "Renders an anchor styled as a button." },
        { name: "fullWidth", type: "boolean", defaultValue: "false", description: "Stretches to the container." },
        { name: "motion", type: "boolean", description: "Turns expressive motion on or off for this button. By default it follows the nearest data-elea-motion container." },
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
<Badge tone="info">Scheduled</Badge>
<Badge tone="warning" variant="outline">Pending</Badge>
<Badge tone="danger" size="sm">3</Badge>`}>
        <Badge>Neutral</Badge>
        <Badge tone="primary">Primary</Badge>
        <Badge tone="secondary">Secondary</Badge>
        <Badge tone="success" variant="solid">Published</Badge>
        <Badge tone="info">Scheduled</Badge>
        <Badge tone="warning" variant="outline">Pending</Badge>
        <Badge tone="danger" size="sm">3</Badge>
      </Demo>
      <h2>Props</h2>
      <PropsTable rows={[
        { name: "tone", type: '"neutral" | "primary" | "secondary" | "success" | "info" | "warning" | "danger"', defaultValue: '"neutral"', description: "Color meaning." },
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
      <p className="lead">Pair a native control with its label, help and validation message. Spread the provided control props to associate all three.</p>
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
      <h2>Props of Input and Textarea</h2>
      <PropsTable rows={[
        { name: "invalid", type: "boolean", description: "Paints the error state and sets aria-invalid." },
        { name: "size", type: '"sm" | "md" | "lg"', description: "Height and type size of an Input." },
        { name: "ref", type: "Ref<HTMLInputElement | HTMLTextAreaElement>", description: "Reaches the native control, so register() from a form library spreads onto it." },
        { name: "className", type: "string", description: "Added after Elea’s classes; see UI integration for the order to keep with Tailwind utilities." },
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
      <p className="lead">Use a checkbox for an independent choice and a toggle for an on/off setting. Both use native form controls.</p>
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
      <h2>Props</h2>
      <PropsTable rows={[
        { name: "label", type: "ReactNode", description: "Visible name for either control." },
        { name: "checked, onCheckedChange", type: "boolean, (checked: boolean) => void", description: "Connect the state to your form. Toggle requires both props." },
        { name: "defaultChecked", type: "boolean", description: "Initial state for an uncontrolled Checkbox." },
        { name: "indeterminate", type: "boolean", defaultValue: "false", description: "Display a Checkbox with a mixed state." },
        { name: "disabled", type: "boolean", description: "Prevent the control from changing or participating in form submission." },
      ]} />
    </>
  );
}

export function DialogPage({ brand }: { brand?: BrandTheme }) {
  const theme = brand ? "brand" : "editorial";
  const themeOpener = brand ? "Open themed dialog" : "Open in Editorial";
  const themeTitle = brand ? "Themed dialog" : "Editorial edition";
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [composed, setComposed] = useState(false);
  const [themed, setThemed] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [removed, setRemoved] = useState("nothing yet");
  return (
    <>
      <h1>Dialog</h1>
      <p className="lead">Bring a decision into focus. Ask someone to share an article or confirm its deletion before they return to the page.</p>
      <Demo title="Dialog and ConfirmDialog" code={`<Dialog open={open} onClose={() => setOpen(false)} title="Share this article" description="Choose who can read it." closeLabel="Close"
  actions={<><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => setOpen(false)}>Share</Button></>}>
  <Field label="Link">{(control) => <Input {...control} readOnly value="https://example.org/a/1" />}</Field>
</Dialog>

<ConfirmDialog open={confirm} onConfirm={() => setConfirm(false)} onCancel={() => setConfirm(false)} title="Delete this article?" description="This cannot be undone." tone="danger" icon={<TrashIcon />}
  confirmLabel="Delete" cancelLabel="Keep" closeLabel="Close" />`}>
        <Button onClick={() => setOpen(true)}>Share article</Button>
        <Button variant="danger" onClick={() => setConfirm(true)}>Delete article</Button>
        <Dialog open={open} onClose={() => setOpen(false)} title="Share this article" description="Choose who can read it." closeLabel="Close" actions={<><Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => setOpen(false)}>Share</Button></>}>
          <Field label="Link">{(control) => <Input {...control} readOnly value="https://example.org/a/1" />}</Field>
        </Dialog>
        <ConfirmDialog open={confirm} onConfirm={() => setConfirm(false)} onCancel={() => setConfirm(false)} title="Delete this article?" description="This cannot be undone." tone="danger" icon={<TrashIcon />} confirmLabel="Delete" cancelLabel="Keep" closeLabel="Close" />
      </Demo>
      <Demo title="A typed confirmation" description={`Deleted: ${removed}. ConfirmDialog takes the same field as ConfirmPopover. With expected, the confirm button stays disabled until the text matches exactly, and it is described by the label of the field.`} code={`<ConfirmDialog open={open} tone="danger" icon={<TrashIcon />} title="Delete this project?" description="Type the name of the project to delete it."
  field={{ label: "Name of the project: field-notes", expected: "field-notes" }}
  confirmLabel="Delete" cancelLabel="Keep" closeLabel="Close"
  onConfirm={(name) => remove(name)} onCancel={close} />`}>
        <Button variant="danger" onClick={() => setRemoving(true)}>Delete project</Button>
        <ConfirmDialog open={removing} tone="danger" icon={<TrashIcon />} title="Delete this project?" description="Type the name of the project to delete it."
          field={{ label: "Name of the project: field-notes", expected: "field-notes" }}
          confirmLabel="Delete" cancelLabel="Keep" closeLabel="Close"
          onConfirm={(value) => { setRemoved(value ?? ""); setRemoving(false); }} onCancel={() => setRemoving(false)} />
      </Demo>
      <Demo title="Inside a themed container" description="A dialog leaves its container for the end of the page and keeps the theme it was opened from: it copies the nearest data-elea-theme." code={`<section data-elea-theme="${theme}">
  <Button onClick={() => setOpen(true)}>${themeOpener}</Button>
  <Dialog open={open} onClose={() => setOpen(false)} title="${themeTitle}" description="The tokens of the container reach this dialog." closeLabel="Close"
    actions={<Button onClick={() => setOpen(false)}>Done</Button>} />
</section>`}>
        <section data-elea-theme={theme}>
          <Button onClick={() => setThemed(true)}>{themeOpener}</Button>
          <Dialog open={themed} onClose={() => setThemed(false)} title={themeTitle} description="The tokens of the container reach this dialog." closeLabel="Close" actions={<Button onClick={() => setThemed(false)}>Done</Button>} />
        </section>
      </Demo>
      <Demo title="Composed from its parts" description="DialogRoot keeps the focus trap, Escape and the backdrop; the parts give the header, the body and the footer another shape." code={`<DialogRoot open={open} onClose={() => setOpen(false)} size="lg">
  <DialogHeader>
    <DialogTitle>Publish this article <Badge tone="primary" variant="subtle">Step 2 of 2</Badge></DialogTitle>
    <DialogClose label="Close" />
  </DialogHeader>
  <DialogDescription>Readers see it as soon as you publish.</DialogDescription>
  <DialogBody>
    <Field label="Summary">{(control) => <Textarea {...control} rows={3} />}</Field>
  </DialogBody>
  <DialogFooter>
    <Checkbox label="Notify subscribers" />
    <Button onClick={() => setOpen(false)}>Publish</Button>
  </DialogFooter>
</DialogRoot>`}>
        <Button variant="outline" onClick={() => setComposed(true)}>Publish article</Button>
        <DialogRoot open={composed} onClose={() => setComposed(false)} size="lg">
          <DialogHeader>
            <DialogTitle>Publish this article <Badge tone="primary" variant="subtle">Step 2 of 2</Badge></DialogTitle>
            <DialogClose label="Close" />
          </DialogHeader>
          <DialogDescription>Readers see it as soon as you publish.</DialogDescription>
          <DialogBody>
            <Field label="Summary">{(control) => <Textarea {...control} rows={3} />}</Field>
          </DialogBody>
          <DialogFooter>
            <Checkbox label="Notify subscribers" />
            <Button onClick={() => setComposed(false)}>Publish</Button>
          </DialogFooter>
        </DialogRoot>
      </Demo>
      <h2>Props</h2>
      <PropsTable rows={[
        { name: "open, onClose", type: "boolean, () => void", description: "Controlled visibility." },
        { name: "title, description", type: "ReactNode", description: "Named and described through ARIA." },
        { name: "closeLabel", type: "string", description: "Accessible name of the close control." },
        { name: "actions", type: "ReactNode", description: "Footer buttons." },
        { name: "size", type: '"sm" | "md" | "lg"', defaultValue: '"md"', description: "Maximum width." },
        { name: "dismissOnBackdrop", type: "boolean", defaultValue: "true", description: "A click outside closes the dialog." },
        { name: "motion", type: "boolean", description: "Turns the entrance on or off for this dialog. A dialog is rendered in a portal, so by default it follows data-elea-motion on the page, not on its container." },
      ]} />
      <p>ConfirmDialog adds <code>onConfirm</code>, <code>onCancel</code>, the two labels, <code>tone</code>, <code>icon</code>, <code>loading</code> and an optional <code>field</code> that collects a value with the answer: see <a href={brandRoute("ui/popover", brand)}>ConfirmField</a>.</p>
      <h2>Parts</h2>
      <PropsTable parts rows={[
        { name: "DialogRoot", type: "open, onClose, size, dismissOnBackdrop, motion", description: "The modal surface alone. Its DialogTitle names it." },
        { name: "DialogHeader", type: "children", description: "The row that holds the title and the close control." },
        { name: "DialogTitle", type: "children", description: "The heading that names the dialog." },
        { name: "DialogClose", type: "label: string", description: "The close control, with its accessible name." },
        { name: "DialogDescription", type: "children", description: "Describes the dialog through ARIA while it is rendered." },
        { name: "DialogBody, DialogFooter", type: "children", description: "The content and the row of actions." },
      ]} />
    </>
  );
}

export function MenuPage() {
  const [last, setLast] = useState("nothing yet");
  return (
    <>
      <h1>Menu</h1>
      <p className="lead">Group related article actions under one control. Keep destructive choices identifiable and disable actions that are unavailable.</p>
      <Demo title="Actions menu" description={`Last action: ${last}`} code={`<Menu label="Article actions" items={[
  { id: "edit", label: "Edit", onSelect: () => setLast("edit") },
  { id: "share", label: "Share", onSelect: () => setLast("share") },
  { id: "archive", label: "Archive", disabled: true, onSelect: () => setLast("archive") },
  { id: "delete", label: "Delete", danger: true, onSelect: () => setLast("delete") },
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
      <Demo title="Separators and groups" description="Compose the menu from its parts when the actions need sorting. The arrow keys cross the groups and skip what is disabled." code={`<MenuRoot>
  <MenuTrigger>{(props) => <Button variant="outline" {...props}>More</Button>}</MenuTrigger>
  <MenuContent label="More actions">
    <MenuItem onSelect={() => setLast("rename")}>Rename</MenuItem>
    <MenuItem onSelect={() => setLast("duplicate")}>Duplicate</MenuItem>
    <MenuSeparator />
    <MenuGroup label="Share">
      <MenuItem onSelect={() => setLast("copy link")}>Copy link</MenuItem>
      <MenuItem onSelect={() => setLast("send by mail")} disabled>Send by mail</MenuItem>
    </MenuGroup>
    <MenuSeparator />
    <MenuItem onSelect={() => setLast("delete")} danger>Delete</MenuItem>
  </MenuContent>
</MenuRoot>`}>
        <MenuRoot>
          <MenuTrigger>{(props) => <Button variant="outline" {...props}>More</Button>}</MenuTrigger>
          <MenuContent label="More actions">
            <MenuItem onSelect={() => setLast("rename")}>Rename</MenuItem>
            <MenuItem onSelect={() => setLast("duplicate")}>Duplicate</MenuItem>
            <MenuSeparator />
            <MenuGroup label="Share">
              <MenuItem onSelect={() => setLast("copy link")}>Copy link</MenuItem>
              <MenuItem onSelect={() => setLast("send by mail")} disabled>Send by mail</MenuItem>
            </MenuGroup>
            <MenuSeparator />
            <MenuItem onSelect={() => setLast("delete")} danger>Delete</MenuItem>
          </MenuContent>
        </MenuRoot>
      </Demo>
      <h2>Props</h2>
      <PropsTable rows={[
        { name: "label", type: "string", description: "Accessible name of the menu." },
        { name: "trigger", type: "(props) => ReactNode", description: "Render the trigger and spread its keyboard, click and ARIA props." },
        { name: "items", type: "MenuItemData[]", description: "Each action has an id, label and onSelect callback. It may also be destructive or disabled." },
        { name: "align", type: '"start" | "end"', defaultValue: '"start"', description: "Align the menu to an edge of its trigger." },
      ]} />
      <h2>Parts</h2>
      <PropsTable parts rows={[
        { name: "MenuRoot", type: "children", description: "Holds the open state; a click outside closes the menu." },
        { name: "MenuTrigger", type: "(props) => ReactNode", description: "Render the trigger and spread its keyboard, click and ARIA props." },
        { name: "MenuContent", type: "label, align", description: "The list, present while the menu is open." },
        { name: "MenuItem", type: "onSelect, icon, disabled, danger", description: "One action. Choosing it closes the menu and returns the focus to the trigger." },
        { name: "MenuSeparator", type: "—", description: "A line between two sets of actions." },
        { name: "MenuGroup", type: "label: ReactNode", description: "Actions that belong together, under the heading that names them." },
      ]} />
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
      <Demo title="Over truncated text" code={`<div style={{ width: "7.5rem", overflow: "hidden" }}>
  <Tooltip content="Quarterly revenue by region">
    <span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
      Quarterly revenue by region
    </span>
  </Tooltip>
</div>`}>
        <div style={{ width: "7.5rem", overflow: "hidden", border: "1px solid var(--elea-color-border-default)", borderRadius: "var(--elea-radius-md)", padding: "0.25rem 0.5rem" }}>
          <Tooltip content="Quarterly revenue by region">
            <span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>Quarterly revenue by region</span>
          </Tooltip>
        </div>
        <span><Tooltip content="Bare text takes a hint too">Plain text</Tooltip></span>
      </Demo>
      <p>The pointer can move onto the hint, and Escape dismisses it. The hint is rendered only while it shows, above any container that clips its content, and it flips or shifts to stay inside the viewport. The wrapper generates no box, so the trigger keeps its own layout.</p>
      <h2>Props</h2>
      <PropsTable rows={[
        { name: "content", type: "ReactNode", description: "Short hint associated with the trigger." },
        { name: "children", type: "ReactNode", description: "Text, an element or a component. A single element gets aria-describedby while the hint shows." },
        { name: "placement", type: '"top" | "bottom"', defaultValue: '"top"', description: "Preferred side of the hint, which moves to the other one when this one lacks room." },
      ]} />
    </>
  );
}

export function PaginationPage() {
  const [page, setPage] = useState(3);
  const [labelled, setLabelled] = useState(3);
  const [narrow, setNarrow] = useState(3);
  const stepLabels = { navigation: "Pagination", previous: "Previous", next: "Next", page: "Page {page}" };
  return (
    <>
      <h1>Pagination</h1>
      <p className="lead">Help readers browse a long list. Show the pages around their current position, with an optional count of the results in view.</p>
      <Demo title="Twelve pages" code={`<Pagination page={page} pageCount={12} onPageChange={setPage} totalItems={115} pageSize={10}
  labels={{ navigation: "Pagination", previous: "Previous page", next: "Next page", page: "Page {page}", summary: "{from}–{to} of {total}" }} />`}>
        <div style={{ width: "100%" }}>
          <Pagination page={page} pageCount={12} onPageChange={setPage} totalItems={115} pageSize={10} labels={{ navigation: "Pagination", previous: "Previous page", next: "Next page", page: "Page {page}", summary: "{from}–{to} of {total}" }} />
        </div>
      </Demo>
      <Demo title="Previous and next with their labels" description="With showLabels the two buttons show labels.previous and labels.next beside an arrow the component draws, mirrors in right-to-left and hides from assistive technology. In a narrow container, like the second one, the text gives way to the arrows and the accessible names stay." code={`<Pagination showLabels page={page} pageCount={12} onPageChange={setPage}
  labels={{ navigation: "Pagination", previous: "Previous", next: "Next", page: "Page {page}" }} />`}>
        <div style={{ width: "100%" }}>
          <Pagination showLabels page={labelled} pageCount={12} onPageChange={setLabelled} labels={stepLabels} />
        </div>
        <div style={{ width: "100%", maxWidth: "24rem" }}>
          <Pagination showLabels page={narrow} pageCount={12} onPageChange={setNarrow} labels={{ ...stepLabels, navigation: "Pagination in a narrow container" }} />
        </div>
      </Demo>
      <h2>Props</h2>
      <PropsTable rows={[
        { name: "page, pageCount", type: "number", description: "Current page, starting at one, and the total number of pages." },
        { name: "onPageChange", type: "(page: number) => void", description: "Update the page and its results." },
        { name: "labels", type: "PaginationLabels", description: "Names for navigation and buttons, plus an optional summary template." },
        { name: "totalItems, pageSize", type: "number", description: "Use these to calculate the visible range in the summary." },
        { name: "window", type: "number", defaultValue: "5", description: "Size of the page window around the current page." },
        { name: "showLabels", type: "boolean", defaultValue: "false", description: "Show labels.previous and labels.next as text beside the arrows. The navigation then measures its own width, so give it a container to fill." },
      ]} />
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
      <p className="lead">Offer a compact list of options. Choose a single language, or enable <code>multiple</code> to pick several days of the week.</p>
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
      <Demo title="In a field" code={`<Field label="Language">{(control) => <Select id={control.id} triggerProps={{ "aria-describedby": control["aria-describedby"] }} value={language} onChange={setLanguage} options={languages} />}</Field>`}>
        <div style={{ width: "16rem" }}>
          <Field label="Language" help="Used for every label of the editor.">{(control) => <Select id={control.id} triggerProps={{ "aria-describedby": control["aria-describedby"] }} value={language} onChange={setLanguage} options={languages} />}</Field>
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

const deliveryOptions = [
  { value: "daily", label: "Daily digest", description: "Receive a summary each morning." },
  { value: "weekly", label: "Weekly digest", description: "Receive one summary on Monday." },
  { value: "instant", label: "Every update", disabled: true },
];

export function RadiosPage() {
  const [saved, setSaved] = useState<string>();
  return (
    <>
      <h1>RadioGroup</h1>
      <p className="lead">Let people compare a short list of mutually exclusive choices. Each option can include a description.</p>
      <Demo title="Notification preferences" description="Choose a delivery schedule and save to read the submitted form value." code={`<form onSubmit={(event) => {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  setSaved(String(form.get("delivery")));
}}>
  <RadioGroup
    label="Email delivery"
    name="delivery"
    defaultValue="weekly"
    options={[
      { value: "daily", label: "Daily digest", description: "Receive a summary each morning." },
      { value: "weekly", label: "Weekly digest", description: "Receive one summary on Monday." },
      { value: "instant", label: "Every update", disabled: true },
    ]}
  />
  <Button type="submit">Save preferences</Button>
</form>`}>
        <form className="catalog-form" onSubmit={(event) => {
          event.preventDefault();
          setSaved(String(new FormData(event.currentTarget).get("delivery")));
        }}>
          <RadioGroup label="Email delivery" name="delivery" defaultValue="weekly" options={deliveryOptions} />
          <Button type="submit">Save preferences</Button>
          <output aria-live="polite">{saved && `Saved delivery: ${saved}`}</output>
        </form>
      </Demo>
      <h2>Props</h2>
      <PropsTable rows={[
        { name: "label, name", type: "ReactNode, string", description: "Visible group name and the form key shared by its radios." },
        { name: "options", type: "readonly RadioOption[]", description: "Each option has a unique value, label and optional description or disabled state." },
        { name: "defaultValue", type: "string", description: "Initial choice for an uncontrolled form." },
        { name: "value, onChange", type: "string | null, (value: string) => void", description: "Keep the selection in your application state." },
        { name: "help, error", type: "ReactNode", description: "Attach instructions or validation to the group." },
        { name: "required, disabled", type: "boolean", description: "Applies to the group as a whole." },
      ]} />
    </>
  );
}

const publicationTabs = [
  { value: "details", label: "Details", panel: <p>Review the article title, author and publication date.</p> },
  { value: "revisions", label: "Revisions", panel: <p>Two revisions are available for this article.</p> },
  { value: "analytics", label: "Analytics", panel: null, disabled: true },
];

export function TabsPage() {
  return (
    <>
      <h1>Tabs</h1>
      <p className="lead">Switch between related views of a document while keeping the surrounding page in place.</p>
      <Demo title="Document inspector" description="The theme chooses the presentation. Use the arrow keys to move between tabs." code={`<Tabs label="Article information" defaultValue="details" items={[
  { value: "details", label: "Details", panel: <p>Review the article title, author and publication date.</p> },
  { value: "revisions", label: "Revisions", panel: <p>Two revisions are available for this article.</p> },
  { value: "analytics", label: "Analytics", panel: null, disabled: true },
]} />`}>
        <Tabs className="catalog-tabs" label="Article information" defaultValue="details" items={publicationTabs} />
      </Demo>
      <Demo title="Segmented tabs" description="The selected view sits in a capsule."
        code={`<Tabs presentation="segmented" label="Article sections" defaultValue="details" items={publicationTabs} />`}>
        <Tabs presentation="segmented" label="Article sections" defaultValue="details" items={publicationTabs} />
      </Demo>
      <Demo title="Composed rail" description="The selected view has a top border. The list and panels can sit where the layout needs them." code={`<TabsRoot defaultValue="open">
  <TabList label="Comments" presentation="rail">
    <Tab value="open">Open <Badge tone="primary" variant="subtle">3</Badge></Tab>
    <Tab value="resolved">Resolved <Badge variant="subtle">12</Badge></Tab>
  </TabList>
  <p>Comments on “Field notes”</p>
  <TabPanel value="open">Three comments wait for an answer.</TabPanel>
  <TabPanel value="resolved">Twelve comments were resolved this month.</TabPanel>
</TabsRoot>`}>
        <TabsRoot className="catalog-tabs" defaultValue="open">
          <TabList label="Comments" presentation="rail">
            <Tab value="open">Open <Badge tone="primary" variant="subtle">3</Badge></Tab>
            <Tab value="resolved">Resolved <Badge variant="subtle">12</Badge></Tab>
          </TabList>
          <p><strong>Comments on “Field notes”</strong></p>
          <TabPanel value="open">Three comments wait for an answer.</TabPanel>
          <TabPanel value="resolved">Twelve comments were resolved this month.</TabPanel>
        </TabsRoot>
      </Demo>
      <h2>Props</h2>
      <PropsTable rows={[
        { name: "label", type: "string", description: "Accessible name for the tab list." },
        { name: "items", type: "readonly TabItem[]", description: "Tabs with a unique value, label, panel and optional disabled state." },
        { name: "defaultValue", type: "string", description: "Initial selection when the tab set manages its own state." },
        { name: "value, onChange", type: "string, (value: string) => void", description: "Connect the active view to application state." },
        { name: "keepMounted", type: "boolean", description: "Keep inactive panels mounted to retain their local state." },
        { name: "presentation", type: '"underline" | "segmented" | "rail"', defaultValue: "Theme", description: "Set a presentation explicitly to override the theme. Standalone tabs use an underline." },
      ]} />
      <h2>Parts</h2>
      <PropsTable parts rows={[
        { name: "TabsRoot", type: "value, defaultValue, onChange, keepMounted", description: "Holds the selection. Without value or defaultValue, no tab starts selected." },
        { name: "TabList", type: "label: string, presentation", description: "The row of tabs and its keyboard navigation." },
        { name: "Tab", type: "value: string, disabled", description: "One tab; its children are free." },
        { name: "TabPanel", type: "value: string, keepMounted", description: "The content of the tab with the same value." },
      ]} />
    </>
  );
}

export function FooterPage() {
  const links = [{ label: "Resources", links: [{ label: "Documentation", href: `${sitePath}getting-started/` }] }];
  return (
    <>
      <h1>Footer</h1>
      <p className="lead">Bring product identity, grouped navigation and a studio signature together at the end of a page.</p>
      <Demo title="Product footer" code={`<Footer brand={<strong>Field notes</strong>} groups={[
  { label: "Resources", links: [{ label: "Documentation", href: "/elea/getting-started/" }] },
]}>
  Editorial workspace
</Footer>`}>
        <Footer brand={<strong>Field notes</strong>} groups={links}>Editorial workspace</Footer>
      </Demo>
      <h2>Props</h2>
      <PropsTable rows={[
        { name: "brand", type: "ReactNode", description: "Product identity or a short description in the leading column." },
        { name: "groups", type: "readonly FooterGroup[]", description: "Named navigation groups containing links with labels and hrefs." },
        { name: "children", type: "ReactNode", description: "A signature or legal links in the lower row." },
      ]} />
    </>
  );
}
