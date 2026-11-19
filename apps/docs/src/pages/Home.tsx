import { Button } from "@alien6-studio/elea-ui";
import { LiveEditor } from "../components/LiveEditor.js";
import { href } from "../router.js";
import { heroBlocks } from "../samples.js";

export function HomePage() {
  return (
    <>
      <section className="hero">
        <h1>Content people can write, components products can trust.</h1>
        <p>Elea is the design system of Alien6 Studio. It starts where products usually struggle: a document model for rich content, a viewer that renders it on the server, an editor with the habits of a modern writing tool, and the tokens and primitives around them.</p>
        <div className="hero__actions">
          <Button href={href("getting-started")}>Get started</Button>
          <Button href={href("playground")} variant="outline">Open the playground</Button>
          <span className="hero__install">npm install @alien6-studio/elea-content-editor</span>
        </div>
      </section>
      <LiveEditor initial={heroBlocks} title="A short article" summary="Edit anything here. The panel on the right is computed from the blocks as you type." />
      <section className="pillars">
        <div>
          <h3>Tokens first</h3>
          <p>Every color, size, radius and shadow is a design token, delivered as CSS custom properties and a Tailwind theme. A product themes Elea by overriding variables, not by forking components.</p>
          <a href={href("theming")}>How theming works</a>
        </div>
        <div>
          <h3>Logic without a DOM</h3>
          <p>The document model, the sanitization policy, the link rules and the Markdown and HTML converters run on any JavaScript runtime. React is the first rendering layer, kept thin so another one can follow.</p>
          <a href={href("interchange")}>Markdown and HTML</a>
        </div>
        <div>
          <h3>Server-rendered reading</h3>
          <p>The viewer has no hook and no state: it renders in React server components and streams complete HTML. Stored content is sanitized, URLs are checked after resolution, external links get opener protection.</p>
          <a href={href("blocks")}>The blocks</a>
        </div>
        <div>
          <h3>Accessible primitives</h3>
          <p>Buttons, fields, dialogs, menus, tooltips and pagination with the ARIA wiring done, labels passed by the host, and an axe audit in every test.</p>
          <a href={href("ui")}>The components</a>
        </div>
      </section>
      <h2>Packages</h2>
      <p>One version for all six. Install the ones you need; the editor pulls the viewer, the media components and the content model.</p>
      <table className="packages">
        <thead><tr><th>Package</th><th>What it holds</th><th>Runs on</th></tr></thead>
        <tbody>
          <tr><td><code>elea-tokens</code></td><td>Design tokens, light and dark, CSS variables, Tailwind theme, typed access</td><td>Any</td></tr>
          <tr><td><code>elea-content</code></td><td>Document model, block registry, sanitization policy, link rules, Markdown and HTML converters, messages</td><td>Any</td></tr>
          <tr><td><code>elea-content-viewer</code></td><td>The block renderer and its CSS, built for server components</td><td>Server, browser</td></tr>
          <tr><td><code>elea-media</code></td><td>Drop zone for files, image cropper with zoom and rotation, crop geometry</td><td>Server, browser</td></tr>
          <tr><td><code>elea-content-editor</code></td><td>The block editor: writing flow, paste, selection, history, drag and drop, media blocks</td><td>Browser</td></tr>
          <tr><td><code>elea-ui</code></td><td>Interface primitives on the tokens</td><td>Server, browser</td></tr>
        </tbody>
      </table>
    </>
  );
}
