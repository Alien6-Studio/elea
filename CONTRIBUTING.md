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

Use synthetic content, identities and endpoints in examples and tests: reserved
example domains only, no real mailbox. `npm run check:references` enforces it and
runs with every check. Never commit customer data or secrets. Sign commits and include a `Signed-off-by`
line. Contributions are provided under Apache-2.0.
