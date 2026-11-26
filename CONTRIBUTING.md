# Contributing

Open an issue describing the use case before adding a component or a block
type. Keep design tokens, framework-free logic, styles and React rendering in
their own packages: logic that runs without a DOM belongs in a `core` package,
React packages only render and wire events.

Run `npm ci && npm run check`. Add a test next to every change, keep the
packaged consumer check green for packaging changes, and declare new source
files in `attest.yaml`.

Labels, placeholders and messages are passed by props or provider, never
hard-coded. Styles use the `--elea-*` tokens only.

## Component API conventions

Document which native element an integrator can focus, measure or label. Forward
its ref (including under React 18), native attributes, DOM events, `style` and
`className` to that element. Merge the class with ELEA's class. When a wrapper
provides layout, document any separate target: on `Table`, the class styles
the scrolling wrapper and the ref, inline style and attributes target the table.

Keep component-owned semantics such as `aria-current`, decorative visibility and
the names of internal controls with the component. Support host descriptions and
data attributes. Name domain callbacks for their intent and document their value
and when it fires. Use existing slots or exported parts for structured content.
Test the public targets and callbacks alongside keyboard and accessible names.

## Contributions

Use synthetic content, identities and endpoints in examples and tests: reserved
example domains only, no real mailbox. Never commit customer data or secrets. Sign commits and include a `Signed-off-by`
line. Contributions are provided under Apache-2.0.
