import { Breadcrumb } from "@alien6-studio/elea-ui";
import { Demo, PropsTable } from "../components/Demo.js";
import { ArchiveBreadcrumb } from "../examples/breadcrumb/ArchiveBreadcrumb.js";
import archiveSource from "../examples/breadcrumb/ArchiveBreadcrumb.tsx?raw";
import trailSource from "../examples/breadcrumb/ComponentTrail.tsx?raw";

export function BreadcrumbPage() {
  return <>
    <h1>Breadcrumb</h1>
    <p className="lead">Show where a page sits in a collection and give each parent a direct link.</p>
    <Demo title="Component trail" code={trailSource}>
      <Breadcrumb label="Component location" overflowLabel="Earlier pages" separator="›"
        items={[{ id: "ui", label: "Components", href: "#/ui" }, { id: "breadcrumb", label: "Breadcrumb" }]} />
    </Demo>
    <Demo title="A longer trail" description="Expand the ellipsis to reveal earlier sections. Follow an ancestor to shorten the trail." code={archiveSource}>
      <ArchiveBreadcrumb />
    </Demo>
    <h2>Props</h2>
    <PropsTable rows={[
      { name: "items", type: "readonly BreadcrumbItem[]", description: "Ordered entries with a stable id, a label and an optional href. The last entry names the current page." },
      { name: "label, overflowLabel", type: "string", description: "Translated names for the navigation landmark and the disclosure button." },
      { name: "maxItems", type: "number", defaultValue: "5", description: "Maximum visible entries, including the disclosure. At least the first and last entries are shown." },
      { name: "separator", type: "ReactNode", defaultValue: "/", description: "Decoration between entries, hidden from assistive technology." },
      { name: "render", type: "(props: ButtonLinkRenderProps) => ReactElement", description: "Render ancestor links using the same router adapter as Button." },
    ]} />
  </>;
}
