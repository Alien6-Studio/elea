import { useState } from "react";
import {
  Alert, Avatar, AvatarGroup, Badge, Button, Card, CardContent, CardDescription, CardFooter, CardHeader, CardImage, CardTitle, Carousel,
  AvatarSkeleton, BadgeSkeleton, ButtonSkeleton, CardSkeleton, Field, FieldSkeleton, Input, Progress, Separator, Skeleton, SkeletonRegion,
  Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow, TableSkeleton, Toggle, type CarouselProps,
} from "@alien6-studio/elea-ui";
import { glacierImage, notebookSummary, notebookTitle } from "../notebook.js";
import { Demo, PropsTable } from "../components/Demo.js";
import { colourPlates } from "../data/colourPlates.js";
import { brandRoute, type BrandTheme } from "./brandTheme.js";
// A local portrait, so the guide loads no remote image.
import portrait from "./portrait.svg";

const InfoIcon = () => <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 7.5v.5" /></svg>;

const exhibitionPlates = Object.values(colourPlates);
type Plate = (typeof exhibitionPlates)[number];
type PlateLayout = Pick<CarouselProps<Plate>, "defaultIndex" | "itemsPerView" | "minItemWidth" | "gap" | "navigation" | "controlsPosition" | "controlsAlign" | "showCounter">;

const presentations = [
  { title: "Single plate", layout: { navigation: "arrows" } },
  { title: "Contact sheet", layout: {
    defaultIndex: 1, itemsPerView: 2, minItemWidth: 100, gap: "sm", navigation: "dots", controlsPosition: "bottom", controlsAlign: "center",
  } },
  { title: "Filmstrip", layout: {
    defaultIndex: 3, itemsPerView: 3, minItemWidth: 72, gap: "none", navigation: "both", controlsPosition: "bottom", controlsAlign: "start", showCounter: true,
  } },
] satisfies { title: string; layout: PlateLayout }[];

export function PlateCarousel({ label = "Exhibition plates", ...layout }: PlateLayout & { label?: string }) {
  return <Carousel items={exhibitionPlates} itemKey={plate => plate.src} loop className="catalog-plate-carousel"
    label={label} roleDescription="carousel" previousLabel="Previous plate" nextLabel="Next plate"
    getDotLabel={index => `Show plate ${index + 1}`} {...layout}
    renderItem={plate => <img src={plate.src} alt={plate.alt} width={840} height={plate.height ?? 560} loading="lazy" />} />;
}

function plateExample(title: string, layout: PlateLayout) {
  const props = Object.entries(layout).map(([key, value]) =>
    typeof value === "string" ? `${key}="${value}"` : `${key}={${value}}`);
  return `<Carousel items={plates} itemKey={plate => plate.src} loop
  label="${title}" roleDescription="carousel"
  previousLabel="Previous plate" nextLabel="Next plate"
  ${props.join("\n  ")}
  getDotLabel={index => "Show plate " + (index + 1)}
  renderItem={plate => <img src={plate.src} alt={plate.alt} width={840} height={560} />} />`;
}

export function CarouselPage() {
  return <>
    <h1>Carousel</h1>
    <p className="lead">Browse the plates from the colour atlas one at a time, in pairs or as a continuous strip.</p>
    <div className="carousel-gallery">
      {presentations.map(({ title, layout }) => (
        <Demo key={title} title={title} code={plateExample(title, layout)}>
          <PlateCarousel label={title} {...layout} />
        </Demo>
      ))}
    </div>
    <h2>Props</h2>
    <PropsTable rows={[
      { name: "items, itemKey, renderItem", type: "Array and render callbacks", description: "Provide the collection, a stable key and the content of each slide." },
      { name: "label, previousLabel, nextLabel", type: "string", description: "Name the collection and its two navigation actions." },
      { name: "navigation, getDotLabel", type: '"arrows" | "dots" | "both", (index: number) => string', description: "Choose the navigation controls and give each dot a localised accessible name." },
      { name: "controlsPosition, controlsAlign", type: '"top" | "bottom", "start" | "center" | "end"', description: "Place the controls above or below the slides and align them along the row." },
      { name: "showCounter", type: "boolean", description: "Display the visible slide numbers and collection size." },
      { name: "itemsPerView, minItemWidth", type: "number", description: "Set a slide count. Add a minimum width in pixels to fit fewer slides in narrower containers." },
      { name: "gap", type: '"none" | "sm" | "md" | "lg"', description: "Set the spacing between visible slides." },
      { name: "index, onIndexChange", type: "number, (index: number) => void", description: "Control the first visible item using a zero-based index." },
      { name: "defaultIndex", type: "number", defaultValue: "0", description: "Choose the starting item in an uncontrolled carousel." },
      { name: "loop", type: "boolean", defaultValue: "false", description: "Continue at the opposite end when reaching a boundary." },
    ]} />
  </>;
}

export function CardPage({ brand }: { brand?: BrandTheme }) {
  return (
    <>
      <h1>Card</h1>
      <p className="lead">Group related content on one surface. Use an image, a heading and a footer action when they help someone decide what to open.</p>
      <Demo title="Editorial card" code={`<Card>
  <CardImage src={coverUrl} alt="Blue crevasses and white ridges seen from above a glacier"
    width={1050} height={525} />
  <CardHeader>
    <CardTitle>The glacier notebook</CardTitle>
    <CardDescription>Field notes on the shapes that ice leaves behind.</CardDescription>
  </CardHeader>
  <CardContent><Badge tone="warning">In review</Badge></CardContent>
  <CardFooter>
    <Button href={notebookUrl} size="sm">Open notebook</Button>
  </CardFooter>
</Card>`}>
        <Card className="catalog-card-demo">
          <CardImage src={glacierImage.data.file.url} alt={glacierImage.data.alt} width={1050} height={525} />
          <CardHeader>
            <CardTitle>{notebookTitle}</CardTitle>
            <CardDescription>{notebookSummary}</CardDescription>
          </CardHeader>
          <CardContent><Badge tone="warning">In review</Badge></CardContent>
          <CardFooter>
            <Button href={brandRoute("playground", brand)} size="sm">Open notebook</Button>
          </CardFooter>
        </Card>
      </Demo>
      <Demo title="Variants" description="An outline for lists, an elevation for content that floats, a subtle fill for secondary information." code={`<Card>
  <CardHeader>
    <CardTitle>Outline</CardTitle>
    <CardDescription>A border on the page surface.</CardDescription>
  </CardHeader>
</Card>
<Card variant="elevated">…</Card>
<Card variant="subtle">…</Card>`}>
        <div className="catalog-cards">
          <Card>
            <CardHeader><CardTitle>Outline</CardTitle><CardDescription>A border on the page surface.</CardDescription></CardHeader>
          </Card>
          <Card variant="elevated">
            <CardHeader><CardTitle>Elevated</CardTitle><CardDescription>A shadow lifts it off the page.</CardDescription></CardHeader>
          </Card>
          <Card variant="subtle">
            <CardHeader><CardTitle>Subtle</CardTitle><CardDescription>A quiet fill, without a border.</CardDescription></CardHeader>
          </Card>
        </div>
      </Demo>
      <Demo title="Interactive card" description="The link in the title covers the whole card. Under expressive motion the card lifts on hover." code={`<Card interactive>
  <CardHeader>
    <CardTitle><a href="/ui/button">Button</a></CardTitle>
    <CardDescription>Trigger an action or lead to another page.</CardDescription>
  </CardHeader>
</Card>`}>
        <div className="catalog-cards">
          <Card interactive>
            <CardHeader><CardTitle><a href={brandRoute("ui/button", brand)}>Button</a></CardTitle><CardDescription>Trigger an action or lead to another page.</CardDescription></CardHeader>
          </Card>
          <Card interactive>
            <CardHeader><CardTitle><a href={brandRoute("ui/alert", brand)}>Alert</a></CardTitle><CardDescription>Tell people what happened and what to do next.</CardDescription></CardHeader>
          </Card>
        </div>
      </Demo>
      <Demo title="Padding" code={`<Card padding="sm">Small</Card>
<Card>Medium</Card>
<Card padding="lg">Large</Card>
<Card padding="none"><img src="cover.jpg" alt="" /></Card>`}>
        <Card padding="sm">Small</Card>
        <Card>Medium</Card>
        <Card padding="lg">Large</Card>
      </Demo>
      <h2>Props</h2>
      <PropsTable rows={[
        { name: "variant", type: '"outline" | "elevated" | "subtle"', defaultValue: '"outline"', description: "How the surface stands out from the page." },
        { name: "padding", type: '"none" | "sm" | "md" | "lg"', defaultValue: '"md"', description: "Space around the parts; none lets an image reach the edges." },
        { name: "interactive", type: "boolean", defaultValue: "false", description: "The link in CardTitle covers the card, which answers hover and focus." },
        { name: "CardImage", type: "Native image props", description: "Set alt and the intrinsic width and height. Use srcSet and sizes for responsive sources." },
        { name: "CardHeader, CardContent, CardFooter", type: "children", description: "Group the heading, body and actions. Each part is optional." },
        { name: "CardTitle as", type: '"h2" … "h6"', defaultValue: '"h3"', description: "Heading level that fits the outline of the page." },
        { name: "className, ref", type: "string, Ref<HTMLDivElement>", description: "Every part takes className; Card forwards its ref." },
      ]} />
    </>
  );
}

export function SeparatorPage() {
  return (
    <>
      <h1>Separator</h1>
      <p className="lead">Draw a line between two groups of content, across the page or between inline items, with an optional label.</p>
      <Demo title="Horizontal, with a label" code={`<Button variant="outline">Continue with a passkey</Button>
<Separator>or</Separator>
<Button>Sign in with email</Button>`}>
        <div className="catalog-stack catalog-fill">
          <Button variant="outline">Continue with a passkey</Button>
          <Separator>or</Separator>
          <Button>Sign in with email</Button>
        </div>
      </Demo>
      <Demo title="Vertical" description="A vertical separator takes the height of its row." code={`<span>Draft</span>
<Separator orientation="vertical" />
<span>1 240 words</span>
<Separator orientation="vertical" />
<span>6 min read</span>`}>
        <div className="catalog-row">
          <span>Draft</span>
          <Separator orientation="vertical" />
          <span>1 240 words</span>
          <Separator orientation="vertical" />
          <span>6 min read</span>
        </div>
      </Demo>
      <h2>Props</h2>
      <PropsTable rows={[
        { name: "orientation", type: '"horizontal" | "vertical"', defaultValue: '"horizontal"', description: "Direction of the line." },
        { name: "decorative", type: "boolean", defaultValue: "true", description: "Set to false where the line separates content, to expose it as a separator." },
        { name: "children", type: "ReactNode", description: "A short label in the middle of a horizontal line." },
      ]} />
    </>
  );
}

export function SkeletonPage() {
  const [loading, setLoading] = useState(true);
  const [wrapped, setWrapped] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [wait, setWait] = useState(1500);
  function reload(duration: number) {
    setWait(duration);
    setFetching(true);
    setTimeout(() => setFetching(false), duration);
  }
  return (
    <>
      <h1>Skeleton</h1>
      <p className="lead">Hold the shape of content while it loads, so the page does not jump when it arrives.</p>
      <Demo title="Loading an article" description="Under expressive motion a light sweeps across the placeholders; otherwise they pulse gently." code={`<Toggle label="Loading" checked={loading} onCheckedChange={setLoading} />
<article aria-busy={loading}>
  {loading ? (
    <>
      <Skeleton variant="circle" width={40} height={40} />
      <Skeleton width="40%" />
      <Skeleton lines={3} />
    </>
  ) : (
    <Article />
  )}
</article>`}>
        <div className="catalog-stack catalog-fill">
          <Toggle label="Loading" checked={loading} onCheckedChange={setLoading} />
          <article className="catalog-loading" aria-busy={loading} aria-label="Article preview">
            {loading ? <>
              <Skeleton variant="circle" width={40} height={40} />
              <div className="catalog-stack">
                <Skeleton width="40%" />
                <Skeleton lines={3} />
              </div>
            </> : <>
              <Avatar name="Ada Lovelace" />
              <div className="catalog-stack">
                <strong>Ada Lovelace</strong>
                <span>Cranes crossed the valley at dawn, earlier than any year on record. The count reached four hundred before noon.</span>
              </div>
            </>}
          </article>
        </div>
      </Demo>
      <Demo title="Shapes" code={`<Skeleton variant="circle" width={48} height={48} />
<Skeleton variant="rect" width={160} height={96} />
<Skeleton width={180} />`}>
        <Skeleton variant="circle" width={48} height={48} />
        <Skeleton variant="rect" width={160} height={96} />
        <Skeleton width={180} />
      </Demo>
      <Demo title="A count of blocks" description="Stack the same placeholder for the rows of a list." code={`<Skeleton variant="rect" height={44} count={3} />`}>
        <div className="catalog-fill" data-demo="count"><Skeleton variant="rect" height={44} count={3} /></div>
      </Demo>
      <Demo title="A class on every placeholder" description="className names what holds the blocks or the lines; blockClassName reaches each placeholder, so a class of your theme colours and shapes all of them." code={`.brand-placeholder { background-color: color-mix(in srgb, var(--elea-color-primary-500) 30%, transparent); border-radius: var(--elea-radius-full); }

<Skeleton variant="rect" height={28} count={3} blockClassName="brand-placeholder" />
<Skeleton lines={3} blockClassName="brand-placeholder" />`}>
        <div className="catalog-fill catalog-stack" data-demo="block-class">
          <Skeleton variant="rect" height={28} count={3} blockClassName="catalog-skeleton-brand" />
          <Skeleton lines={3} blockClassName="catalog-skeleton-brand" />
        </div>
      </Demo>
      <Demo title="Around the real content" description="With children, the skeleton takes no size of its own: each child stays in the layout, hidden from sight and from assistive technology, and is painted as the placeholder. Nothing moves when the content arrives." code={`<Toggle label="Loading" checked={loading} onCheckedChange={setLoading} />
<Skeleton loading={loading}><Avatar name="Ada Lovelace" /></Skeleton>
<Skeleton loading={loading}><strong>Ada Lovelace</strong></Skeleton>
<Skeleton loading={loading}>Member since 2019</Skeleton>
<Skeleton loading={loading}><Button variant="secondary">Follow</Button></Skeleton>`}>
        <div className="catalog-stack catalog-fill">
          <Toggle label="Loading the profile" checked={wrapped} onCheckedChange={setWrapped} />
          <div className="catalog-row" data-demo="wrap">
            <Skeleton loading={wrapped}><Avatar name="Ada Lovelace" /></Skeleton>
            <div className="catalog-stack">
              <Skeleton loading={wrapped}><strong>Ada Lovelace</strong></Skeleton>
              <Skeleton loading={wrapped}>Member since 2019</Skeleton>
            </div>
            <Skeleton loading={wrapped}><Button variant="secondary">Follow</Button></Skeleton>
          </div>
        </div>
      </Demo>
      <Demo title="Companions" description="A component with a stable shape exports its skeleton, built from the component itself: on each line the skeleton, then the loaded component, with the same box." code={`<AvatarSkeleton size="lg" />
<ButtonSkeleton>Save changes</ButtonSkeleton>
<BadgeSkeleton>Draft</BadgeSkeleton>
<FieldSkeleton help />
<CardSkeleton description lines={2} footer={<ButtonSkeleton size="sm">Open</ButtonSkeleton>} />
<TableSkeleton rows={2} columns={3} />`}>
        <div className="catalog-pairs">
          <div className="catalog-pair" data-pair="avatar"><AvatarSkeleton size="lg" /><Avatar name="Ada Lovelace" size="lg" /></div>
          <div className="catalog-pair" data-pair="button"><ButtonSkeleton>Save changes</ButtonSkeleton><Button>Save changes</Button></div>
          <div className="catalog-pair" data-pair="badge"><BadgeSkeleton>Draft</BadgeSkeleton><Badge>Draft</Badge></div>
          <div className="catalog-pair catalog-pair--wide" data-pair="field">
            <FieldSkeleton help />
            <Field label="Email" help="We never share it.">{(control) => <Input {...control} placeholder="ada@example.org" />}</Field>
          </div>
          <div className="catalog-pair catalog-pair--wide" data-pair="card">
            <CardSkeleton description lines={2} footer={<ButtonSkeleton size="sm">Open</ButtonSkeleton>} />
            <Card>
              <CardHeader><CardTitle>Weekly report</CardTitle><CardDescription>Updated today</CardDescription></CardHeader>
              <CardContent>Four hundred cranes by noon.<br />Earlier than any year on record.</CardContent>
              <CardFooter><Button size="sm">Open</Button></CardFooter>
            </Card>
          </div>
          <div className="catalog-pair catalog-pair--wide" data-pair="table">
            <TableSkeleton rows={2} columns={3} />
            <Table>
              <TableHead><TableRow><TableHeaderCell>Name</TableHeaderCell><TableHeaderCell>Role</TableHeaderCell><TableHeaderCell>Joined</TableHeaderCell></TableRow></TableHead>
              <TableBody>
                <TableRow><TableCell>Ada</TableCell><TableCell>Engineer</TableCell><TableCell>2019</TableCell></TableRow>
                <TableRow><TableCell>Grace</TableCell><TableCell>Admiral</TableCell><TableCell>2021</TableCell></TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      </Demo>
      <Demo title="A region that loads" description="The region is busy while it loads and announces one label for every placeholder inside. With a delay, a fast load never flashes the placeholders, and their space is kept all along." code={`<SkeletonRegion loading={fetching} label="Loading orders" delay={300}>
  {fetching ? <TableSkeleton rows={2} columns={2} /> : <Orders />}
</SkeletonRegion>`}>
        <div className="catalog-stack catalog-fill">
          <div className="catalog-row">
            <Button variant="secondary" disabled={fetching} onClick={() => reload(1500)}>Reload slowly</Button>
            <Button variant="secondary" disabled={fetching} onClick={() => reload(150)}>Reload fast</Button>
          </div>
          <SkeletonRegion loading={fetching} label="Loading orders" delay={300} data-demo="region" data-wait={wait}>
            {fetching ? <TableSkeleton rows={2} columns={2} /> : (
              <Table>
                <TableHead><TableRow><TableHeaderCell>Order</TableHeaderCell><TableHeaderCell>Status</TableHeaderCell></TableRow></TableHead>
                <TableBody>
                  <TableRow><TableCell>#1042</TableCell><TableCell>Shipped</TableCell></TableRow>
                  <TableRow><TableCell>#1043</TableCell><TableCell>Packed</TableCell></TableRow>
                </TableBody>
              </Table>
            )}
          </SkeletonRegion>
        </div>
      </Demo>
      <h2>The rule</h2>
      <p>Components ship their skeleton, pages compose them. A companion is built from the markup of its component, so the two cannot drift apart; a page lays the companions out the way it lays out the loaded components. The library holds no page-level skeleton: the shape of a page belongs to the application.</p>
      <h2>Props</h2>
      <PropsTable rows={[
        { name: "variant", type: '"text" | "rect" | "circle"', defaultValue: '"text"', description: "Text follows the surrounding type size, rect holds a block, circle an avatar." },
        { name: "width, height", type: "string | number", description: "A CSS length; numbers are pixels." },
        { name: "lines", type: "number", defaultValue: "1", description: "Lines of text to hold; the last one is shorter." },
        { name: "count", type: "number", defaultValue: "1", description: "Placeholders to stack, such as the rows of a list." },
        { name: "className", type: "string", description: "A class for the element itself: the placeholder, or what holds the lines or the stacked blocks." },
        { name: "blockClassName", type: "string", description: "A class for every placeholder: each block of a count, each of the lines." },
        { name: "children", type: "ReactNode", description: "The real content: it keeps its place and its size while the placeholder covers it." },
        { name: "loading", type: "boolean", defaultValue: "true", description: "With children, whether they are still loading." },
      ]} />
      <h3>Companions</h3>
      <PropsTable rows={[
        { name: "AvatarSkeleton", type: "size, shape", description: "The box of an avatar." },
        { name: "ButtonSkeleton", type: "size, radius, fullWidth, children", description: "The box of a button; pass the label as children when it is known, for the exact width." },
        { name: "BadgeSkeleton", type: "size, children", description: "The box of a badge; pass the label when it is known." },
        { name: "FieldSkeleton", type: "size, help", description: "A label, an input and, with help, a line of help." },
        { name: "CardSkeleton", type: "variant, padding, media, title, description, lines, footer", description: "A card with the parts asked for; media and footer take other skeletons." },
        { name: "TableSkeleton", type: "rows, columns, header, density, striped", description: "A table of rows by columns, with a header by default." },
      ]} />
      <h3>SkeletonRegion</h3>
      <PropsTable rows={[
        { name: "loading", type: "boolean", description: "Sets aria-busy on the region." },
        { name: "label", type: "string", description: "Announced once to assistive technology when the placeholders show." },
        { name: "delay", type: "number", defaultValue: "0", description: "Milliseconds before the placeholders show and the label is announced." },
      ]} />
    </>
  );
}

export function AvatarPage() {
  return (
    <>
      <h1>Avatar</h1>
      <p className="lead">Show who wrote, edited or owns something. An avatar shows a picture and falls back to initials when there is none or when it fails to load.</p>
      <Demo title="Picture and initials" code={`<Avatar name="Ada Lovelace" src="/people/ada.jpg" />
<Avatar name="Ada Lovelace" />
<Avatar name="Grace Hopper" tone="primary" />
<Avatar name="Alan Turing" tone="secondary" />
<Avatar name="Field notes" shape="square" />`}>
        <Avatar name="Ada Lovelace" src={portrait} />
        <Avatar name="Ada Lovelace" />
        <Avatar name="Grace Hopper" tone="primary" />
        <Avatar name="Alan Turing" tone="secondary" />
        <Avatar name="Field notes" shape="square" />
      </Demo>
      <Demo title="Sizes" code={`<Avatar size="xs" name="Ada Lovelace" />
<Avatar size="sm" name="Ada Lovelace" />
<Avatar name="Ada Lovelace" />
<Avatar size="lg" name="Ada Lovelace" />
<Avatar size="xl" name="Ada Lovelace" />`}>
        <Avatar size="xs" name="Ada Lovelace" />
        <Avatar size="sm" name="Ada Lovelace" />
        <Avatar name="Ada Lovelace" />
        <Avatar size="lg" name="Ada Lovelace" />
        <Avatar size="xl" name="Ada Lovelace" />
      </Demo>
      <Demo title="Group" description="Past max, the rest is counted." code={`<AvatarGroup aria-label="Editors" max={3}>
  <Avatar name="Ada Lovelace" tone="primary" />
  <Avatar name="Grace Hopper" />
  <Avatar name="Alan Turing" tone="secondary" />
  <Avatar name="Katherine Johnson" />
  <Avatar name="Hedy Lamarr" />
</AvatarGroup>`}>
        <AvatarGroup aria-label="Editors" max={3}>
          <Avatar name="Ada Lovelace" tone="primary" />
          <Avatar name="Grace Hopper" />
          <Avatar name="Alan Turing" tone="secondary" />
          <Avatar name="Katherine Johnson" />
          <Avatar name="Hedy Lamarr" />
        </AvatarGroup>
      </Demo>
      <h2>Props</h2>
      <PropsTable rows={[
        { name: "name", type: "string", description: "Accessible name and source of the initials. Leave it empty where the name is written beside the avatar." },
        { name: "src", type: "string", description: "Picture; the initials take over when it is missing or fails to load." },
        { name: "size", type: '"xs" | "sm" | "md" | "lg" | "xl"', defaultValue: '"md"', description: "From a dense list to a profile header." },
        { name: "shape", type: '"circle" | "square"', defaultValue: '"circle"', description: "A square suits a product or an organisation." },
        { name: "tone", type: '"neutral" | "primary" | "secondary"', defaultValue: '"neutral"', description: "Colour behind the initials." },
        { name: "children", type: "ReactNode", description: "Replaces the initials, for example with an icon." },
        { name: "AvatarGroup max, size", type: "number, AvatarSize", description: "Avatars shown before the rest is counted, and the size of that count." },
      ]} />
    </>
  );
}

export function AlertPage() {
  const [dismissed, setDismissed] = useState(false);
  return (
    <>
      <h1>Alert</h1>
      <p className="lead">Tell people what happened and what they can do about it, in the flow of the page. Warnings and errors are announced at once, the other tones politely.</p>
      <Demo title="Tones" code={`<Alert title="Draft saved">Your changes are kept on this device.</Alert>
<Alert tone="primary" icon={<InfoIcon />} title="A new version is available" />
<Alert tone="success" title="Article published">It is now visible to everyone.</Alert>
<Alert tone="info" icon={<InfoIcon />} title="Maintenance is planned for Sunday" />
<Alert tone="warning" title="Your session ends in five minutes" />
<Alert tone="danger" title="The article could not be saved">Check your connection and try again.</Alert>`}>
        <div className="catalog-stack catalog-fill">
          <Alert title="Draft saved">Your changes are kept on this device.</Alert>
          <Alert tone="primary" icon={<InfoIcon />} title="A new version is available" />
          <Alert tone="success" title="Article published">It is now visible to everyone.</Alert>
          <Alert tone="info" icon={<InfoIcon />} title="Maintenance is planned for Sunday" />
          <Alert tone="warning" role="status" title="Your session ends in five minutes" />
          <Alert tone="danger" role="status" title="The article could not be saved">Check your connection and try again.</Alert>
        </div>
      </Demo>
      <Demo title="Actions and dismissal" description="A dismissible alert names its close button." code={`<Alert
  variant="outline"
  tone="primary"
  icon={<InfoIcon />}
  title="Two people are editing this article"
  actions={<Button size="sm" variant="outline">See who</Button>}
  onDismiss={() => setDismissed(true)}
  dismissLabel="Dismiss"
>
  Your changes merge as you type.
</Alert>`}>
        <div className="catalog-stack catalog-fill">
          {dismissed
            ? <Button variant="outline" size="sm" onClick={() => setDismissed(false)}>Show the alert again</Button>
            : <Alert variant="outline" tone="primary" icon={<InfoIcon />} title="Two people are editing this article" actions={<Button size="sm" variant="outline">See who</Button>} onDismiss={() => setDismissed(true)} dismissLabel="Dismiss">
              Your changes merge as you type.
            </Alert>}
        </div>
      </Demo>
      <h2>Props</h2>
      <PropsTable rows={[
        { name: "tone", type: '"neutral" | "primary" | "success" | "info" | "warning" | "danger"', defaultValue: '"neutral"', description: "Meaning of the message. Warning and danger take role alert, the others role status." },
        { name: "variant", type: '"subtle" | "outline"', defaultValue: '"subtle"', description: "A tinted fill or a border on the page surface." },
        { name: "title, children", type: "ReactNode", description: "A short heading and the message under it." },
        { name: "icon, actions", type: "ReactNode", description: "A leading icon, and buttons or links under the message." },
        { name: "onDismiss, dismissLabel", type: "() => void, string", description: "Adds a close button; its label is required with it." },
        { name: "role", type: "string", description: "Overrides how the message is announced." },
      ]} />
    </>
  );
}

export function ProgressPage() {
  const [files, setFiles] = useState(3);
  return (
    <>
      <h1>Progress</h1>
      <p className="lead">Show how far a task has come, or that work is under way when the amount is unknown.</p>
      <Demo title="Measured progress" description="Upload the next file to move the bar." code={`<Progress
  label="Uploading images"
  value={files}
  max={8}
  showValue
  formatValue={(value, max) => \`\${value} of \${max} files\`}
/>
<Button onClick={() => setFiles((count) => (count >= 8 ? 0 : count + 1))}>Upload next file</Button>`}>
        <div className="catalog-stack catalog-fill">
          <Progress label="Uploading images" value={files} max={8} showValue formatValue={(value, max) => `${value} of ${max} files`} />
          <div><Button size="sm" variant="outline" onClick={() => setFiles((count) => (count >= 8 ? 0 : count + 1))}>{files >= 8 ? "Start again" : "Upload next file"}</Button></div>
        </div>
      </Demo>
      <Demo title="Indeterminate" description="Without a value, the bar travels along its track." code={`<Progress label="Preparing the export" />`}>
        <div className="catalog-fill"><Progress label="Preparing the export" /></div>
      </Demo>
      <Demo title="Sizes and tones" code={`<Progress size="sm" value={30} aria-label="Storage used" />
<Progress tone="success" value={100} label="Published" showValue />
<Progress tone="info" value={45} label="Import" showValue />
<Progress tone="warning" value={82} label="Storage" showValue />
<Progress size="lg" tone="danger" value={96} label="Quota" showValue />`}>
        <div className="catalog-stack catalog-fill">
          <Progress size="sm" value={30} aria-label="Storage used" />
          <Progress tone="success" value={100} label="Published" showValue />
          <Progress tone="info" value={45} label="Import" showValue />
          <Progress tone="warning" value={82} label="Storage" showValue />
          <Progress size="lg" tone="danger" value={96} label="Quota" showValue />
        </div>
      </Demo>
      <h2>Props</h2>
      <PropsTable rows={[
        { name: "value, max", type: "number", defaultValue: "—, 100", description: "Work done between 0 and max. Leave value out while the amount is unknown." },
        { name: "label", type: "ReactNode", description: "Visible name of the task; without one, name the bar with aria-label." },
        { name: "showValue", type: "boolean", defaultValue: "false", description: "Shows the value beside the label, as a percentage unless formatValue words it." },
        { name: "formatValue", type: "(value: number, max: number) => string", description: "Words the value for the eye and for assistive technology." },
        { name: "size", type: '"sm" | "md" | "lg"', defaultValue: '"md"', description: "Thickness of the track." },
        { name: "tone", type: '"primary" | "success" | "info" | "warning" | "danger"', defaultValue: '"primary"', description: "Colour of the bar." },
      ]} />
    </>
  );
}
