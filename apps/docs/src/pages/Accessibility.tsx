export function AccessibilityPage() {
  return (
    <>
      <h1>Accessibility</h1>
      <p className="lead">Every component is tested with axe-core and driven with the keyboard in its tests. Labels are never hard-coded: the host passes them, in its language, so assistive technology hears the product's own words.</p>
      <h2>What the components do</h2>
      <ul>
        <li><strong>Names and descriptions.</strong> Fields link their label, help and error with <code>aria-describedby</code>; icon buttons take a required <code>label</code>; dialogs are named by their title.</li>
        <li><strong>Focus.</strong> Dialogs take the focus, keep Tab inside and return it to the opener. Menus move with the arrows and close on Escape. Focus rings use <code>color.focus</code> and are never removed.</li>
        <li><strong>Native controls.</strong> Checkboxes and toggles are real inputs; the toggle is exposed as a switch. Buttons are buttons; links styled as buttons stay links.</li>
        <li><strong>Documents.</strong> Headings keep their level, nested lists are announced with their depth, images carry alt text, external links say they open a new tab through their attributes, videos are titled by their caption.</li>
        <li><strong>Motion.</strong> Skeletons and transitions respect <code>prefers-reduced-motion</code>.</li>
        <li><strong>Color.</strong> Text roles keep a contrast ratio of at least 4.5:1 on their surfaces in both themes.</li>
      </ul>
      <h2>What the host does</h2>
      <ul>
        <li>Pass messages in the language of the page; <code>en</code> and <code>fr</code> ship with the content package, and <code>withDefaultMessages</code> fills partial translations.</li>
        <li>Set <code>lang</code> on the document and give the editor page a heading of its own.</li>
        <li>Resolve asset URLs to real images with meaningful alt text; the editor stores what people type as the caption and alt.</li>
      </ul>
      <h2>In the tests</h2>
      <pre><code>{`import axe from "axe-core";

const { container } = render(<Dialog open title="Share" closeLabel="Close" onClose={() => {}}>...</Dialog>);
const results = await axe.run(container);
assert.deepEqual(results.violations, []);`}</code></pre>
    </>
  );
}
