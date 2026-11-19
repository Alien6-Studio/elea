import { cssVar, tokens } from "@alien6-studio/elea-tokens";
import { Button, Badge } from "@alien6-studio/elea-ui";

const group = (prefix: string) => tokens.filter((token) => token.path.startsWith(`${prefix}.`));
const scales = ["neutral", "primary", "secondary"];

const ROLES: { path: string; use: string }[] = [
  { path: "color.text.default", use: "Body text" },
  { path: "color.text.muted", use: "Secondary text, descriptions" },
  { path: "color.text.subtle", use: "Placeholders, hints, captions" },
  { path: "color.text.link", use: "Links" },
  { path: "color.text.inverse", use: "Text on inverse surfaces" },
  { path: "color.surface.default", use: "Page background" },
  { path: "color.surface.subtle", use: "Panels, quiet areas" },
  { path: "color.surface.muted", use: "Hover states, chips" },
  { path: "color.surface.inverse", use: "Code blocks, dark panels" },
  { path: "color.border.default", use: "Dividers, cards" },
  { path: "color.border.strong", use: "Form controls" },
  { path: "color.border.accent", use: "Quotes, highlights" },
  { path: "color.focus", use: "Focus rings" },
  { path: "color.success", use: "Confirmations" },
  { path: "color.warning", use: "Pending states" },
  { path: "color.danger", use: "Errors, destructive actions" },
];

export function ColorPage() {
  return (
    <>
      <h1>Color</h1>
      <p className="lead">Three scales and a set of roles. Components only use the roles, so a product changes its look by remapping them, and the dark theme is a second mapping of the same roles.</p>
      <p>The palette comes from the name. Elea is the woman found asleep under the Antarctic ice in Barjavel's <em>La Nuit des temps</em>: the greys are ice, tinted cold; the primary is a deep glacier blue; the secondary is the gold of the sphere that kept her world, used sparingly, for accents and the mark. The dark theme is the night of time.</p>
      <h2>Roles</h2>
      <p>Switch the theme in the top bar: every swatch below follows, because they read the variables of the page.</p>
      <div className="roles">
        {ROLES.map((role) => (
          <div key={role.path} className="role">
            <div className="role__color" style={{ background: cssVar(role.path) }} />
            <div><code>{role.path.replace("color.", "")}</code><span>{role.use}</span></div>
          </div>
        ))}
      </div>
      <h2>Scales</h2>
      <p>The raw palette the roles are built from. Use it only to define new roles, never directly in a component.</p>
      {scales.map((scale) => (
        <div key={scale}>
          <h3>{scale}</h3>
          <div className="swatches">
            {group(`color.${scale}`).map((token) => (
              <div key={token.path} className="swatch">
                <div className="swatch__color" style={{ background: cssVar(token.path) }} />
                <code>{token.path.split(".").pop()}</code>
                <span>{String(token.value)}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
      <h2>In CSS</h2>
      <pre><code>{`.notice {
  color: var(--elea-color-text-muted);
  background: var(--elea-color-surface-subtle);
  border-left: 4px solid var(--elea-color-border-accent);
}`}</code></pre>
      <h2>In Tailwind</h2>
      <p>With <code>@alien6-studio/elea-tokens/theme.css</code> imported after Tailwind, the roles are utilities: <code>text-elea-text-muted</code>, <code>bg-elea-surface-subtle</code>, <code>border-elea-border-accent</code>.</p>
    </>
  );
}

export function TypographyPage() {
  return (
    <>
      <h1>Typography</h1>
      <p className="lead">Three families with three jobs: a sans for the interface and headings, a reading family for what people write, a mono for code. The scale is shared by the viewer, the editor and the primitives, so a heading looks the same wherever it appears.</p>
      <h2>Families</h2>
      <p>The tokens ship system stacks, so nothing is downloaded by default. This site overrides two of them, as a product would, with Instrument Sans for the interface and Source Serif 4 for reading.</p>
      <h3><code>font.family.sans</code></h3>
      <p className="specimen">Interface, headings, labels and controls.</p>
      <h3><code>font.family.content</code></h3>
      <p className="specimen specimen--serif">Paragraphs, lists and quotes in documents: what people read and write.</p>
      <h3><code>font.family.mono</code></h3>
      <p className="specimen specimen--mono">Code blocks, raw output, token names.</p>
      <h2>Weights</h2>
      <div className="weights">
        {group("font.weight").map((token) => (
          <div key={token.path} style={{ fontWeight: cssVar(token.path) }}>Aa Elea<span>{token.path.split(".").pop()} {String(token.value)}</span></div>
        ))}
      </div>
      <h2>Scale</h2>
      <div className="scale">
        {group("font.size").map((token) => (
          <div key={token.path} className="scale__row">
            <code>{token.path.split(".").pop()} · {String(token.value)}</code>
            <span style={{ fontSize: cssVar(token.path), lineHeight: 1.2 }}>Content people can write</span>
          </div>
        ))}
      </div>
      <h2>Leading</h2>
      <div className="scale">
        {group("font.leading").map((token) => (
          <div key={token.path} className="scale__row">
            <code>{token.path.split(".").pop()} · {String(token.value)}</code>
            <span style={{ lineHeight: cssVar(token.path), display: "block", maxWidth: "28rem" }}>Line height sets the texture of a paragraph. Tight for headings, normal for interface text, relaxed for reading.</span>
          </div>
        ))}
      </div>
      <h2>In documents</h2>
      <p>The viewer sets <code>font.size.lg</code> and <code>font.leading.relaxed</code> on documents, capped at <code>size.measure</code> so lines stay readable. Headings in documents use the same sizes as headings in the interface.</p>
    </>
  );
}

export function SpacingPage() {
  return (
    <>
      <h1>Spacing, radius, elevation</h1>
      <p className="lead">A spacing scale on a 4px grid, four radii and three shadows. Components compose these; they never carry their own pixel values.</p>
      <h2>Spacing</h2>
      <div className="scale">
        {group("space").map((token) => (
          <div key={token.path} className="scale__row">
            <code>{token.path.split(".").pop()} · {String(token.value)}</code>
            <div className="scale__bar" style={{ width: cssVar(token.path) }} />
          </div>
        ))}
      </div>
      <h2>Radius</h2>
      <div className="boxes">
        {group("radius").map((token) => (
          <div key={token.path} className="box" style={{ borderRadius: cssVar(token.path) }}>{token.path.split(".").pop()}</div>
        ))}
      </div>
      <h2>Elevation</h2>
      <div className="boxes">
        {group("shadow").map((token) => (
          <div key={token.path} className="box box--shadow" style={{ boxShadow: cssVar(token.path) }}>{token.path.split(".").pop()}</div>
        ))}
      </div>
      <h2>Measure</h2>
      <p>Documents are capped at <code>size.measure</code>, {String(group("size").find((token) => token.path === "size.measure")?.value)}, roughly 75 characters of reading text. The editor adds its gutter to that width so the text aligns with the rendered page.</p>
      <h2>Where they appear</h2>
      <div className="demo__stage" style={{ borderRadius: "var(--elea-radius-lg)" }}>
        <Button>space.2 by space.4</Button>
        <Badge tone="primary">radius.full</Badge>
        <div style={{ padding: "var(--elea-space-4)", borderRadius: "var(--elea-radius-lg)", boxShadow: "var(--elea-shadow-md)", background: "var(--elea-color-surface-default)", fontSize: "var(--elea-font-size-sm)" }}>space.4, radius.lg, shadow.md</div>
      </div>
    </>
  );
}

export function ThemingPage() {
  return (
    <>
      <h1>Theming</h1>
      <p className="lead">A theme is a set of variable overrides. Nothing in Elea reads a hard-coded value, so every surface, control and document follows the overrides, in any scope.</p>
      <h2>Light and dark</h2>
      <p>The dark theme is shipped. It applies with the system preference, or when the root element carries <code>data-theme="dark"</code>; <code>data-theme="light"</code> pins the light theme.</p>
      <pre><code>{`<html data-theme="dark">`}</code></pre>
      <h2>A brand</h2>
      <p>Override the roles after importing the tokens. Scope the overrides to an element to theme a part of a page, as the card on the right does.</p>
      <div className="theme-demo">
        <div>
          <h3>Default tokens</h3>
          <p>The roles as shipped.</p>
          <Button>Publish</Button>
        </div>
        <div className="theme-demo--brand">
          <h3>Three overrides</h3>
          <p>Primary remapped to violet, medium radius set to a pill, a serif for the interface.</p>
          <Button>Publish</Button>
        </div>
      </div>
      <pre><code>{`@import "@alien6-studio/elea-tokens/elea.css";

:root {
  --elea-color-primary-600: #7c3aed;
  --elea-color-primary-700: #6d28d9;
  --elea-radius-md: 999px;
  --elea-font-family-sans: "Your Sans", system-ui, sans-serif;
  --elea-font-family-content: "Your Serif", Georgia, serif;
}`}</code></pre>
      <h2>Your own tokens</h2>
      <p>The source is a DTCG JSON file. The package exports it flattened and typed, with <code>toStylesheet</code> and <code>toTailwindTheme</code> to generate your own CSS from a merged set.</p>
      <pre><code>{`import { tokens, darkTokens, mergeTokens, toStylesheet } from "@alien6-studio/elea-tokens";

const brand = mergeTokens(tokens, myTokens);
writeFileSync("brand.css", toStylesheet(brand, darkTokens));`}</code></pre>
    </>
  );
}
