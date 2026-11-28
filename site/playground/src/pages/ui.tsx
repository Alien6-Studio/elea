import { GuideSearch } from "../examples/field/GuideSearch.js";
import { ButtonVariants } from "../examples/button/ButtonVariants.js";
import { ButtonSizes } from "../examples/button/ButtonSizes.js";
import { ButtonShadows } from "../examples/button/ButtonShadows.js";
import { LoadingButton } from "../examples/button/LoadingButton.js";
import { BadgeTones } from "../examples/badge/BadgeTones.js";
import { ArticleSearch } from "../examples/field/ArticleSearch.js";
import { NotificationToggles } from "../examples/choice/NotificationToggles.js";
import { ShareArticle } from "../examples/dialog/ShareArticle.js";
import { PublishArticle } from "../examples/dialog/PublishArticle.js";
import { ProofReading } from "../examples/dialog/ProofReading.js";
import { SaveDraftTooltips } from "../examples/tooltip/SaveDraftTooltips.js";
import { SegmentedTabs } from "../examples/tabs/SegmentedTabs.js";
import { TrashIcon } from "../examples/icons.js";
import buttonVariantsSource from "../examples/button/ButtonVariants.tsx?raw";
import actionPaletteSource from "../examples/button/ActionPalette.tsx?raw";
import tealInfoSource from "../examples/button/TealInfo.tsx?raw";
import buttonSizesSource from "../examples/button/ButtonSizes.tsx?raw";
import publicationActionsSource from "../examples/button/PublicationActions.tsx?raw";
import buttonShadowsSource from "../examples/button/ButtonShadows.tsx?raw";
import loadingButtonSource from "../examples/button/LoadingButton.tsx?raw";
import guideLinksSource from "../examples/button/GuideLinks.tsx?raw";
import buttonMotionSource from "../examples/button/ButtonMotion.tsx?raw";
import badgeTonesSource from "../examples/badge/BadgeTones.tsx?raw";
import validatedFieldSource from "../examples/field/ValidatedField.tsx?raw";
import inputSizesSource from "../examples/field/InputSizes.tsx?raw";
import articleSearchSource from "../examples/field/ArticleSearch.tsx?raw";
import newsletterCheckboxesSource from "../examples/choice/NewsletterCheckboxes.tsx?raw";
import notificationTogglesSource from "../examples/choice/NotificationToggles.tsx?raw";
import shareArticleSource from "../examples/dialog/ShareArticle.tsx?raw";
import deleteProjectSource from "../examples/dialog/DeleteProject.tsx?raw";
import themedDialogSource from "../examples/dialog/ThemedDialog.tsx?raw";
import publishArticleSource from "../examples/dialog/PublishArticle.tsx?raw";
import proofReadingSource from "../examples/dialog/ProofReading.tsx?raw";
import accountMenuSource from "../examples/menu/AccountMenu.tsx?raw";
import articleActionsSource from "../examples/menu/ArticleActions.tsx?raw";
import moreActionsSource from "../examples/menu/MoreActions.tsx?raw";
import saveDraftTooltipsSource from "../examples/tooltip/SaveDraftTooltips.tsx?raw";
import truncatedTitleSource from "../examples/tooltip/TruncatedTitle.tsx?raw";
import articlePagesSource from "../examples/pagination/ArticlePages.tsx?raw";
import pageLabelsSource from "../examples/pagination/PageLabels.tsx?raw";
import languageSelectSource from "../examples/select/LanguageSelect.tsx?raw";
import daysSelectSource from "../examples/select/DaysSelect.tsx?raw";
import publicationLanguageSource from "../examples/select/PublicationLanguage.tsx?raw";
import emailDeliverySource from "../examples/radio-group/EmailDelivery.tsx?raw";
import documentInspectorSource from "../examples/tabs/DocumentInspector.tsx?raw";
import segmentedTabsSource from "../examples/tabs/SegmentedTabs.tsx?raw";
import commentsRailSource from "../examples/tabs/CommentsRail.tsx?raw";
import productFooterSource from "../examples/footer/ProductFooter.tsx?raw";
import buttonEffectsSource from "../examples/button/ButtonEffects.tsx?raw";
import buttonRadiiSource from "../examples/button/ButtonRadii.tsx?raw";
import guideSearchSource from "../examples/field/GuideSearch.tsx?raw";
import { TextFieldExamples } from "./TextFieldExamples.js";
import { useState, type CSSProperties } from "react";
import type { ButtonLinkRenderProps } from "@alien6-studio/elea-ui";
import { Badge, Button, Checkbox, ConfirmDialog, Dialog, Field, Footer, Input, Menu, MenuContent, MenuGroup, MenuItem, MenuRoot, MenuSeparator, MenuTrigger, Pagination, RadioGroup, Select, Tab, TabList, TabPanel, Tabs, TabsRoot, Textarea, Tooltip } from "@alien6-studio/elea-ui";
import { Demo, PropsTable } from "../components/Demo.js";
import { sitePath } from "../links.js";
import { brandRoute, defaultSiteTheme, type BrandTheme } from "./brandTheme.js";


const buttonEffects = ["lift", "scale", "push", "shine", "ripple", "spotlight", "magnetic", "tilt"] as const;
const effectLabel = (effect: typeof buttonEffects[number]) => effect[0]!.toUpperCase() + effect.slice(1);

const tones = ["primary", "secondary", "tertiary", "neutral", "danger", "warning", "success", "info"] as const;
const surfaces = ["solid", "outline", "ghost"] as const;
const actionShape = {
  "--elea-shape-action": "1.5rem 0.25rem 1rem 0.5rem",
  "--elea-button-radius-sm": "0.75rem 0.125rem 0.5rem 0.25rem",
} as CSSProperties;
const toolbarShape = { "--elea-control-radius": "0.25rem 1rem 0.5rem 0" } as CSSProperties;

function GuideLink({ to, ...props }: Omit<ButtonLinkRenderProps, "href"> & { to: string }) {
  return <a href={to} {...props} />;
}

const renderGuideLink = ({ href, ...props }: ButtonLinkRenderProps) => <GuideLink {...props} to={href} />;

const radiusSamples = [
  { label: "Inherited", radius: undefined }, { label: "None", radius: "none" },
  { label: "Small", radius: "sm" }, { label: "Medium", radius: "md" },
  { label: "Large", radius: "lg" }, { label: "Full", radius: "full" },
] as const;

const tealInfo = {
  "--elea-color-action-info": "light-dark(#0e7490, #67e8f9)",
  "--elea-color-action-info-text": "light-dark(white, black)",
  "--elea-color-action-info-hover": "color-mix(in srgb, var(--elea-color-action-info) 90%, light-dark(black, white))",
  "--elea-color-action-info-pressed": "color-mix(in srgb, var(--elea-color-action-info) 80%, light-dark(black, white))",
} as CSSProperties;

export function ButtonsPage({ brand = defaultSiteTheme }: Readonly<{ brand?: BrandTheme }>) {
  const radiusDescription = brand.buttonRadiusScale === "profile" && brand.shape && !brand.radius
    ? "Small and Medium tighten each curve of the theme’s silhouette and Large matches Inherited. None gives square corners and Full gives a pill."
    : "Inherited follows the current theme. Small, Medium and Large use its corner radius values. None gives square corners and Full gives a pill.";
  return (
    <>
      <h1>Button</h1>
      <p className="lead">A button inherits its shape and palette from the active theme. Choose its tone for meaning, its variant for emphasis and its size for the layout.</p>
      <Demo title="Variants" description={<>A plain <code>&lt;Button&gt;</code> uses the primary colour at medium size. Each variant below draws from the same theme and inherits its action shape.</>} code={buttonVariantsSource}>
        <ButtonVariants />
      </Demo>
      <Demo title="Tone and emphasis" description={<>Each row uses the same eight colour roles. Compare a tone across solid, outline and ghost, then switch the theme in the navbar. <code>variant="danger"</code> is shorthand for <code>variant="solid" tone="danger"</code>.</>} code={actionPaletteSource}>
        <div style={{ display: "grid", gap: "var(--elea-space-5)", width: "100%" }}>
          {surfaces.map(surface => (
            <div role="group" aria-label={surface} key={surface}>
              <strong>{surface.charAt(0).toUpperCase() + surface.slice(1)}</strong>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--elea-space-2)", marginTop: "var(--elea-space-2)" }}>
                {tones.map(tone => <Button key={tone} variant={surface} tone={tone} aria-label={`${tone} ${surface}`}>{tone}</Button>)}
              </div>
            </div>
          ))}
        </div>
      </Demo>
      <Demo title="An info colour of its own" description="The Info button above uses the active theme. This example gives one button a teal fill and defines its text, hover and pressed colours for light and dark appearances." code={tealInfoSource}>
        <Button variant="info" style={tealInfo}>Teal info</Button>
      </Demo>
      <Demo title="Sizes and icons" description="Five sizes, from a compact toolbar action to a landing page call to action." code={buttonSizesSource}>
        <ButtonSizes />
      </Demo>
      <Demo title="Radius" description={radiusDescription} code={buttonRadiiSource}>
        <div className="catalog-button-radii">
          {radiusSamples.map(({ label, radius }) => (
            <figure key={label}>
              <Button radius={radius} aria-label={`Publish (${label})`}>Publish</Button>
              <figcaption>{label}</figcaption>
            </figure>
          ))}
        </div>
      </Demo>
      <Demo title="Asymmetric corners" description="Read the four corners clockwise from the top left. Publish uses the theme silhouette. Save draft has an explicit small radius. Filter inherits the toolbar’s control radius." code={publicationActionsSource}>
        <div className="catalog-button-radii" style={actionShape}>
          <figure><Button>Publish</Button><figcaption>Action silhouette</figcaption></figure>
          <figure><Button size="sm" radius="sm">Save draft</Button><figcaption>Small radius</figcaption></figure>
          <figure style={toolbarShape}><Button>Filter</Button><figcaption>Toolbar override</figcaption></figure>
        </div>
      </Demo>
      <Demo title="Shadow" description="The default follows the theme. An explicit shadow adds elevation on a busy surface." code={buttonShadowsSource}>
        <ButtonShadows />
      </Demo>
      <Demo title="Loading and disabled" description="Save shows a pending state for two seconds." code={loadingButtonSource}>
        <LoadingButton />
      </Demo>
      <Demo title="Router links" description={<>The first link opens the Card guide. Pass the button’s children and event handlers to your router link, mapping <code>href</code> to <code>to</code>. When disabled or loading, ELEA renders an unfocusable anchor with <code>aria-disabled</code> and no destination.</>} code={guideLinksSource}>
        <Button href={brandRoute("ui/card", brand)} render={renderGuideLink}>Open Card guide</Button>
        <Button href={brandRoute("ui/card", brand)} render={renderGuideLink} disabled>Guide unavailable</Button>
      </Demo>
      <Demo title="Motion" description="Hover or press these two buttons. The first follows the gallery’s Expressive motion switch. The second stays still. Both respect the visitor’s reduced-motion preference." code={buttonMotionSource}>
        <Button>Follows the page</Button>
        <Button motion={false}>Always still</Button>
      </Demo>
      <Demo title="Effects"
        description="Try each gesture on the same primary button. All eight share the theme’s colour, shape and size. With expressive motion on, Push has a raised edge that sinks when pressed."
        code={buttonEffectsSource}>
        <div className="catalog-button-effects">
          {buttonEffects.map(effect => <Button key={effect} effect={effect}>{effectLabel(effect)}</Button>)}
        </div>
      </Demo>
      <h2>Props</h2>
      <PropsTable rows={[
        { name: "variant", type: '"solid" | "outline" | "ghost" | "primary" | "secondary" | "tertiary" | "danger" | "success" | "info" | "warning"', defaultValue: '"primary"', description: "Surface treatment. Colour variants are shorthands for solid buttons." },
        { name: "tone", type: '"primary" | "secondary" | "tertiary" | "neutral" | "danger" | "warning" | "success" | "info"', description: "Colour role for the surface. An explicit tone takes precedence over a colour variant." },
        { name: "size", type: '"xs" | "sm" | "md" | "lg" | "xl"', defaultValue: '"md"', description: "Height and type size." },
        { name: "radius", type: '"none" | "sm" | "md" | "lg" | "full"', defaultValue: "Theme shape", description: "Override the inherited action shape with an explicit corner radius." },
        { name: "shadow", type: '"none" | "sm" | "md"', defaultValue: '"none"', description: "A resting shadow that lifts the button off the surface." },
        { name: "effect", type: '"lift" | "scale" | "push" | "shine" | "ripple" | "spotlight" | "magnetic" | "tilt"', defaultValue: '"lift"', description: "The gesture played under expressive motion. It does nothing while motion is off." },
        { name: "icon, trailingIcon", type: "ReactNode", description: "Icons before and after the label, hidden from assistive technology." },
        { name: "loading", type: "boolean", defaultValue: "false", description: "Shows a spinner, keeps the label for layout, blocks interaction." },
        { name: "loadingLabel", type: "string", description: "Accessible name while loading." },
        { name: "href", type: "string", description: "Renders an anchor styled as a button." },
        { name: "render", type: "(props: ButtonLinkRenderProps) => ReactElement", description: "Renders the active link through a host router. Requires href." },
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
      <Demo title="Tones" code={badgeTonesSource}>
        <BadgeTones />
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

const guideDestinations = [
  { id: "calendar", label: "Calendar", description: "Forms", href: "#/ui/calendar" },
  { id: "card", label: "Card", description: "Display", href: "#/ui/card" },
  { id: "carousel", label: "Carousel", description: "Navigation", href: "#/ui/carousel" },
];

export function FieldsPage() {
  const [email, setEmail] = useState("");
  const invalid = email.length > 0 && !email.includes("@");
  return (
    <>
      <h1>Field, Input, Textarea</h1>
      <p className="lead">Pair a native control with its label, help and validation message. Spread the provided control props to associate all three.</p>
      <Demo title="A validated field" description="Type something without an @ to see the error." code={validatedFieldSource}>
        <div style={{ width: "20rem" }}>
          <Field label="Email" help="We never share it" error={invalid ? "Enter a valid address" : undefined} required requiredMarker="*">
            {(control) => <Input {...control} type="email" value={email} onChange={(event) => setEmail(event.target.value)} invalid={invalid} />}
          </Field>
        </div>
      </Demo>
      <Demo title="Textarea and sizes" code={inputSizesSource}>
        <div style={{ display: "grid", gap: "var(--elea-space-3)", width: "20rem" }}>
          <Input size="sm" placeholder="Small" aria-label="Small" />
          <Input placeholder="Medium" aria-label="Medium" />
          <Input size="lg" placeholder="Large" aria-label="Large" />
          <Textarea placeholder="A longer text" aria-label="A longer text" />
        </div>
      </Demo>
      <TextFieldExamples />
      <Demo title="SearchField" description="Type a query and use the clear button to start again. Pass value and onValueChange to filter a collection as you type." code={articleSearchSource}>
        <ArticleSearch />
      </Demo>
      <Demo title="SearchAutocomplete" description="Type to find a destination. Use the arrow keys to explore matches and Enter to follow a link." code={guideSearchSource}>
        <GuideSearch destinations={guideDestinations} />
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
        { name: "counter", type: "{ max: number }", description: "Show a live character count and flag overflow. Use native maxLength for a hard limit." },
        { name: "format", type: "InputFormat (Input)", description: "Format bank details, business identifiers or telephone numbers while editing. The preset parses display text into a compact value." },
        { name: "mask", type: "string (Input)", description: "Use # for a digit and literals for separators, such as ### ### ###." },
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
  return (
    <>
      <h1>Checkbox and Toggle</h1>
      <p className="lead">Use a checkbox for an independent choice and a toggle for an on/off setting. Both use native form controls.</p>
      <Demo title="Checkbox" code={newsletterCheckboxesSource}>
        <div style={{ display: "grid", gap: "var(--elea-space-3)" }}>
          <Checkbox label="Send me the newsletter" description="Once a month, no more" checked={checked} onCheckedChange={setChecked} />
          <Checkbox label="Partially selected" indeterminate readOnly />
          <Checkbox label="Disabled" disabled />
        </div>
      </Demo>
      <Demo title="Toggle" code={notificationTogglesSource}>
        <NotificationToggles />
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

export function DialogPage({ brand }: Readonly<{ brand?: BrandTheme }>) {
  const theme = brand ? "brand" : "editorial";
  const themeOpener = brand ? "Open themed dialog" : "Open in Editorial";
  const themeTitle = brand ? "Themed dialog" : "Editorial edition";
  const [themed, setThemed] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [removed, setRemoved] = useState("nothing yet");
  return (
    <>
      <h1>Dialog</h1>
      <p className="lead">Bring a decision into focus. Ask someone to share an article or confirm its deletion before they return to the page.</p>
      <Demo title="Dialog and ConfirmDialog" code={shareArticleSource}>
        <ShareArticle />
      </Demo>
      <Demo title="A typed confirmation" description={`Deleted: ${removed}. ConfirmDialog takes the same field as ConfirmPopover. With expected, the confirm button stays disabled until the text matches exactly, and it is described by the label of the field.`} code={deleteProjectSource}>
        <Button variant="danger" onClick={() => setRemoving(true)}>Delete project</Button>
        <ConfirmDialog open={removing} tone="danger" icon={<TrashIcon />} title="Delete this project?" description="Type the name of the project to delete it."
          field={{ label: "Name of the project: field-notes", expected: "field-notes" }}
          confirmLabel="Delete" cancelLabel="Keep" closeLabel="Close"
          onConfirm={(value) => { setRemoved(value ?? ""); setRemoving(false); }} onCancel={() => setRemoving(false)} />
      </Demo>
      <Demo title="Inside a themed container" description="A dialog leaves its container for the end of the page and keeps the theme it was opened from: it copies the nearest data-elea-theme." code={themedDialogSource}>
        <section data-elea-theme={theme}>
          <Button onClick={() => setThemed(true)}>{themeOpener}</Button>
          <Dialog open={themed} onClose={() => setThemed(false)} title={themeTitle} description="The tokens of the container reach this dialog." closeLabel="Close" actions={<Button onClick={() => setThemed(false)}>Done</Button>} />
        </section>
      </Demo>
      <Demo title="Composed from its parts" description="DialogRoot keeps the focus trap, Escape and the backdrop; the parts give the header, the body and the footer another shape." code={publishArticleSource}>
        <PublishArticle />
      </Demo>
      <Demo title="Wide content and a scrolling body" description={<>The <code>xl</code> size gives a long document room, and <code>full</code> takes the window less its margin. With <code>scroll="body"</code> the title and the actions stay in place while the content scrolls.</>} code={proofReadingSource}>
        <ProofReading />
      </Demo>
      <h2>Props</h2>
      <PropsTable rows={[
        { name: "open, onClose", type: "boolean, () => void", description: "Controlled visibility." },
        { name: "title, description", type: "ReactNode", description: "Named and described through ARIA." },
        { name: "closeLabel", type: "string", description: "Accessible name of the close control." },
        { name: "actions", type: "ReactNode", description: "Footer buttons." },
        { name: "size", type: '"sm" | "md" | "lg" | "xl" | "full"', defaultValue: '"md"', description: "Maximum width. full takes the window, less its margin." },
        { name: "scroll", type: '"surface" | "body"', defaultValue: '"surface"', description: "What scrolls when the content outgrows the window. With body, the header and the actions stay in place." },
        { name: "dismissOnBackdrop", type: "boolean", defaultValue: "true", description: "A click outside closes the dialog." },
        { name: "motion", type: "boolean", description: "Turns the entrance on or off for this dialog. A dialog is rendered in a portal, so by default it follows data-elea-motion on the page, not on its container." },
      ]} />
      <p>ConfirmDialog adds <code>onConfirm</code>, <code>onCancel</code>, the two labels, <code>tone</code>, <code>icon</code>, <code>loading</code> and an optional <code>field</code> that collects a value with the answer: see <a href={brandRoute("ui/popover", brand)}>ConfirmField</a>.</p>
      <h2>Parts</h2>
      <PropsTable parts rows={[
        { name: "DialogRoot", type: "open, onClose, size, scroll, dismissOnBackdrop, motion", description: "The modal surface alone. Its DialogTitle names it." },
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
      <Demo title="Actions menu" description={`Last action: ${last}`} code={articleActionsSource}>
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
      <Demo title="Separators and groups" description="Compose the menu from its parts when the actions need sorting. The arrow keys cross the groups and skip what is disabled." code={moreActionsSource}>
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
      <Demo title="Links and a header" description={<>An item with <code>href</code> is a link: here the first two open the Typography and Colours pages of this site. Pass <code>render</code> to hand it to your router link, as with Button. The header names the account and describes the menu to assistive technology.</>} code={accountMenuSource}>
        <MenuRoot>
          <MenuTrigger>{(props) => <Button variant="outline" {...props}>Account</Button>}</MenuTrigger>
          <MenuContent label="Account" header={<><strong>Maya Okafor</strong><br />Harbour Press</>}>
            <MenuItem href={`${sitePath}typography/`} render={renderGuideLink}>Typography</MenuItem>
            <MenuItem href={`${sitePath}playground/#/colours`} render={renderGuideLink}>Colours</MenuItem>
            <MenuItem href={`${sitePath}playground/#/colours`} render={renderGuideLink} disabled>Billing</MenuItem>
            <MenuSeparator />
            <MenuItem onSelect={() => setLast("sign out")}>Sign out</MenuItem>
          </MenuContent>
        </MenuRoot>
      </Demo>
      <h2>Props</h2>
      <PropsTable rows={[
        { name: "label", type: "string", description: "Accessible name of the menu." },
        { name: "trigger", type: "(props) => ReactNode", description: "Render the trigger and spread its keyboard, click and ARIA props." },
        { name: "items", type: "MenuItemData[]", description: "Each item has an id and a label, then an onSelect callback for an action or an href for a link, with an optional render for your router. It may also be destructive or disabled." },
        { name: "header", type: "ReactNode", description: "Content above the items, such as a name and a company. It describes the menu." },
        { name: "align", type: '"start" | "end"', defaultValue: '"start"', description: "Align the menu to an edge of its trigger." },
      ]} />
      <h2>Parts</h2>
      <PropsTable parts rows={[
        { name: "MenuRoot", type: "children", description: "Holds the open state; a click outside closes the menu." },
        { name: "MenuTrigger", type: "(props) => ReactNode", description: "Render the trigger and spread its keyboard, click and ARIA props." },
        { name: "MenuContent", type: "label, align, header", description: "The list, present while the menu is open." },
        { name: "MenuItem", type: "onSelect, href, render, icon, disabled, danger", description: "One action, or a link when href is given. Choosing it closes the menu and returns the focus to the trigger." },
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
      <Demo title="On a button" code={saveDraftTooltipsSource}>
        <SaveDraftTooltips />
      </Demo>
      <Demo title="Over truncated text" code={truncatedTitleSource}>
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
      <Demo title="Twelve pages" code={articlePagesSource}>
        <div style={{ width: "100%" }}>
          <Pagination page={page} pageCount={12} onPageChange={setPage} totalItems={115} pageSize={10} labels={{ navigation: "Pagination", previous: "Previous page", next: "Next page", page: "Page {page}", summary: "{from}–{to} of {total}" }} />
        </div>
      </Demo>
      <Demo title="Previous and next with their labels" description="With showLabels the two buttons show labels.previous and labels.next beside an arrow the component draws, mirrors in right-to-left and hides from assistive technology. In a narrow container, like the second one, the text gives way to the arrows and the accessible names stay." code={pageLabelsSource}>
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
  const [fieldLanguage, setFieldLanguage] = useState<string | null>(null);
  const languages = [{ value: "fr", label: "Français" }, { value: "en", label: "English" }, { value: "de", label: "Deutsch", disabled: true }, { value: "es", label: "Español" }];
  const week = [{ value: "mon", label: "Monday" }, { value: "tue", label: "Tuesday" }, { value: "wed", label: "Wednesday" }, { value: "thu", label: "Thursday" }, { value: "fri", label: "Friday" }];
  return (
    <>
      <h1>Select</h1>
      <p className="lead">Offer a compact list of options. Choose a single language, or enable <code>multiple</code> to pick several days of the week.</p>
      <Demo title="Single value" description={`Selected: ${language ?? "none"}`} code={languageSelectSource}>
        <Select label="Language" value={language} onChange={setLanguage} placeholder="Pick a language" options={languages} />
        <Select size="sm" label="Language, small" value={language} onChange={setLanguage} options={languages} />
        <Select label="Disabled" value="fr" onChange={() => {}} options={languages} disabled />
      </Demo>
      <Demo title="Checklist" description={`Selected: ${days.join(", ") || "none"}`} code={daysSelectSource}>
        <Select multiple label="Days" value={days} onChange={setDays} placeholder="Pick days" summary={(values) => `${values.length} day(s)`} options={week} />
        <Select multiple label="Days, labels joined" value={days} onChange={setDays} placeholder="Pick days" options={week} />
      </Demo>
      <Demo title="In a field" code={publicationLanguageSource}>
        <div style={{ width: "16rem" }}>
          <Field label="Publication language" required help="Used for publication labels."
            error={fieldLanguage === null ? "Choose a language." : undefined}>
            {({ id, required, ...accessibility }) => (
              <Select id={id} triggerProps={{ ...accessibility, "aria-required": required }}
                value={fieldLanguage} onChange={setFieldLanguage} placeholder="Pick a language" options={languages} />
            )}
          </Field>
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
      <Demo title="Notification preferences" description="Choose a delivery schedule and save to read the submitted form value." code={emailDeliverySource}>
        <form className="catalog-form" onSubmit={(event) => {
          event.preventDefault();
          const delivery = new FormData(event.currentTarget).get("delivery");
          if (typeof delivery === "string") setSaved(delivery);
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
      <Demo title="Document inspector" description="The theme chooses the presentation. Use the arrow keys to move between tabs." code={documentInspectorSource}>
        <Tabs className="catalog-tabs" label="Article information" defaultValue="details" items={publicationTabs} />
      </Demo>
      <Demo title="Segmented tabs" description="The selected view is inset from the border of the list."
        code={segmentedTabsSource}>
        <SegmentedTabs />
      </Demo>
      <Demo title="Composed rail" description="The selected view has a top border. The list and panels can sit where the layout needs them." code={commentsRailSource}>
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
      <Demo title="Product footer" code={productFooterSource}>
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
