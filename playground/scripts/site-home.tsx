import type { EleaBlock } from "@alien6-studio/elea-content";
import { ContentView } from "@alien6-studio/elea-content-viewer";
import { Badge, Button, Tabs } from "@alien6-studio/elea-ui";
import { alien6ContactUrl, repositoryUrl, sitePath } from "../src/links.js";
import { brandRoute, defaultSiteTheme } from "../src/pages/brandTheme.js";
import { glacierImage, notebookSummary, notebookTitle } from "../src/notebook.js";

const interactive = `${sitePath}playground/#/`;
const notebook = {
  blocks: [
    { id: "title", type: "header", data: { text: notebookTitle, level: 2 } },
    { id: "intro", type: "paragraph", data: { text: notebookSummary } },
    glacierImage,
  ] satisfies EleaBlock[],
};

function NotebookPreview() {
  return (
    <fieldset className="notebook">
      <legend className="site__visually-hidden">Document view</legend>
      <input className="site__visually-hidden" type="radio" name="document-view" id="show-document" defaultChecked />
      <input className="site__visually-hidden" type="radio" name="document-view" id="show-blocks" />
      <div className="notebook__bar">
        <span>Field notes</span>
        <div className="notebook__switch">
          <label htmlFor="show-document">Preview</label>
          <label htmlFor="show-blocks">Block JSON</label>
        </div>
      </div>
      <div className="notebook__panes">
        <div className="notebook__document"><ContentView data={notebook} /></div>
        <div className="notebook__blocks">
          <pre tabIndex={0} aria-label="Document block data"><code>{JSON.stringify(notebook, null, 2)}</code></pre>
        </div>
      </div>
      <div className="notebook__foot">
        <span>Rendered with <code>ContentView</code></span>
        <a href={`${sitePath}playground/${brandRoute("playground", defaultSiteTheme)}`}>Edit this notebook <span aria-hidden="true">→</span></a>
      </div>
    </fieldset>
  );
}

const componentSamples = [
  { slug: "button", label: "Button", preview: <Button size="sm">Save draft</Button> },
  { slug: "badge", label: "Badge", preview: <Badge tone="success" size="md">Published</Badge> },
  {
    slug: "tabs", label: "Tabs", preview: <Tabs label="Publication views" items={[
      { value: "write", label: "Write", panel: null }, { value: "read", label: "Read", panel: null },
    ]} />,
  },
];

export function SiteHome() {
  return (
    <>
      <section className="home-intro" aria-labelledby="home-title">
        <div className="site-container home-spread">
          <div className="home-copy">
            <p className="home-eyebrow">Open-source React library</p>
            <h1 id="home-title">A design system<br />for <span>rich content.</span></h1>
            <p className="home-lead">Build a member portal or a publishing tool with React components, a block editor and a theme that fits your brand.</p>
            <div className="home-actions">
              <Button href={`${interactive}ui`} size="lg" trailingIcon="→">Explore components</Button>
              <a href={`${sitePath}getting-started/`}>Read the docs</a>
            </div>
            <p className="home-compat"><span>React 18 &amp; 19</span><a href={`${repositoryUrl}/blob/main/LICENSE`}>Apache 2.0</a></p>
          </div>
          <NotebookPreview />
        </div>
      </section>
      <section className="site-container home-editions" aria-labelledby="home-theme">
        <div className="home-editions__heading">
          <div>
            <h2 id="home-theme">Publication themes</h2>
            <p>Explore four themes, then tune their colours, type and reading density in the studio.</p>
          </div>
          <a href={`${interactive}theme`}>Open theme studio <span aria-hidden="true">→</span></a>
        </div>
      </section>
      <div className="site-container home-tools">
        <section className="home-tool" aria-labelledby="home-components">
          <h2 id="home-components"><a href={`${interactive}ui`}>Component library <span aria-hidden="true">↗</span></a></h2>
          <p>Open a component to try its states, test the keyboard behaviour and copy the React example.</p>
          <div className="home-specimens">
            {componentSamples.map(({ slug, label, preview }) => (
              <div className="home-specimen" key={slug}>
                <div className="home-specimen__demo" inert aria-hidden="true">{preview}</div>
                <a href={`${interactive}ui/${slug}`}>{label}</a>
              </div>
            ))}
          </div>
        </section>
        <section className="home-tool home-services" aria-labelledby="services-title">
          <h2 id="services-title">Integrate Elea with Alien6</h2>
          <p>Get help migrating an existing editor, building custom blocks or adapting the system to your brand.</p>
          <Button href={alien6ContactUrl} variant="outline" trailingIcon="↗">Contact Alien6</Button>
        </section>
      </div>
    </>
  );
}
