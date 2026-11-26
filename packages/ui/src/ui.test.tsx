import "./test/dom.js";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { afterEach, test } from "node:test";
import { createRef, useState } from "react";
import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { hydrateRoot, type Root } from "react-dom/client";
import { renderToStaticMarkup, renderToString } from "react-dom/server";
import { createThemeProfile, makeBrandTheme } from "@alien6-studio/elea-tokens/brand";
import axe from "axe-core";
import { Badge } from "./Badge.js";
import { Select } from "./Select.js";
import { Button, IconButton } from "./Button.js";
import { Card, CardImage } from "./Card.js";
import { Checkbox, Toggle } from "./Checkbox.js";
import { cx } from "./cx.js";
import { ConfirmDialog, Dialog } from "./Dialog.js";
import { Field, Input, Label, Textarea } from "./Field.js";
import { Footer } from "./Footer.js";
import { Menu } from "./Menu.js";
import { Pagination, paginationRange } from "./Pagination.js";
import { RadioGroup } from "./RadioGroup.js";
import { Tooltip } from "./Tooltip.js";

afterEach(cleanup);

async function violations(element: React.ReactElement): Promise<string[]> {
  const { container } = render(element);
  const results = await axe.run(container, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] }, rules: { "color-contrast": { enabled: false }, region: { enabled: false } } });
  return results.violations.map((violation) => `${violation.id}: ${violation.nodes.map((node) => node.html).join(" | ")}`);
}

test("cx joins truthy classes", () => {
  assert.equal(cx("a", false, null, undefined, "b"), "a b");
});

test("Button renders variants, sizes, icons, loading and links", () => {
  const clicks: number[] = [];
  const { rerender } = render(<Button onClick={() => clicks.push(1)} icon={<i>i</i>} trailingIcon={<i>t</i>}>Go</Button>);
  const button = screen.getByRole("button", { name: "Go" });
  assert.equal(button.className, "elea-button elea-button--primary elea-button--md");
  assert.equal(button.getAttribute("type"), "button");
  fireEvent.click(button);
  assert.deepEqual(clicks, [1]);
  rerender(<Button variant="danger" size="lg" fullWidth loading loadingLabel="Saving" onClick={() => clicks.push(2)}>Go</Button>);
  const loading = screen.getByRole("button", { name: "Saving" });
  assert.ok(loading.className.includes("elea-button--loading") && loading.className.includes("elea-button--full") && loading.className.includes("elea-button--lg"));
  assert.equal((loading as HTMLButtonElement).disabled, true);
  assert.equal(loading.getAttribute("aria-busy"), "true");
  assert.ok(loading.querySelector(".elea-button__spinner"));
  rerender(<Button href="https://example.org" variant="outline">Visit</Button>);
  const link = screen.getByRole("link", { name: "Visit" });
  assert.equal(link.getAttribute("href"), "https://example.org");
  rerender(<Button href="https://example.org" disabled>Visit</Button>);
  const disabledLink = screen.getByRole("link", { name: "Visit" });
  assert.equal(disabledLink.getAttribute("href"), null);
  assert.equal(disabledLink.getAttribute("aria-disabled"), "true");
  rerender(<IconButton label="Close" size="sm"><span>x</span></IconButton>);
  const icon = screen.getByRole("button", { name: "Close" });
  assert.ok(icon.className.includes("elea-button--icon") && icon.className.includes("elea-button--ghost"));
  assert.equal(icon.getAttribute("title"), "Close");
});

test("Button takes five sizes, a radius, a shadow and an effect", () => {
  const { rerender } = render(<Button size="xs" radius="full" shadow="md" effect="scale">Go</Button>);
  assert.equal(screen.getByRole("button", { name: "Go" }).className, "elea-button elea-button--primary elea-button--xs elea-button--radius-full elea-button--shadow-md elea-button--fx-scale");
  rerender(<Button size="xl" radius="md" shadow="none" effect="lift">Go</Button>);
  assert.equal(screen.getByRole("button", { name: "Go" }).className, "elea-button elea-button--primary elea-button--xl elea-button--radius-md");
  rerender(<IconButton label="Close" size="xl" radius="none" shadow="sm" effect="push"><span>x</span></IconButton>);
  assert.equal(screen.getByRole("button", { name: "Close" }).className, "elea-button elea-button--icon elea-button--ghost elea-button--xl elea-button--radius-none elea-button--shadow-sm elea-button--fx-push");
});

test("scoped shapes distinguish actions, controls, surfaces and selections", () => {
  const sheets = ["button", "field", "card", "checkbox"].map(name =>
    readFileSync(new URL(`css/${name}.css`, import.meta.url), "utf8"));
  const { container } = render(<>
    <style>{sheets.join("\n")}</style>
    <Button>Publish</Button><Button radius="md">Save</Button><Button radius="sm">Back</Button>
    <Input aria-label="Title" /><Checkbox label="Include image" checked readOnly />
    <Card padding="none"><CardImage alt="Cover" /></Card>
  </>);
  container.style.setProperty("--elea-radius-sm", "2px");
  container.style.setProperty("--elea-radius-md", "4px");
  const publish = screen.getByRole("button", { name: "Publish" });
  const save = screen.getByRole("button", { name: "Save" });
  const back = screen.getByRole("button", { name: "Back" });
  const input = screen.getByRole("textbox");
  const image = screen.getByRole("img");
  const check = container.querySelector(".elea-checkbox__box")!;
  const top = (element: Element) => getComputedStyle(element).borderTopRightRadius;
  assert.equal(top(publish), "4px");
  container.style.setProperty("--elea-shape-action", "3px 12px 3px 2px");
  container.style.setProperty("--elea-shape-control", "5px");
  container.style.setProperty("--elea-shape-surface", "1px 20px 4px 2px / 1px 8px 4px 2px");
  container.style.setProperty("--elea-shape-indicator", "9px");
  assert.equal(top(publish), "12px");
  assert.equal(top(save), "4px");
  assert.equal(top(input), "5px");
  assert.equal(top(check), "9px");
  assert.equal(top(image.parentElement!), "20px 8px");
  assert.equal(top(image), "20px 8px");
  assert.equal(getComputedStyle(image).borderBottomLeftRadius, "0px");
  container.style.setProperty("--elea-control-radius", "6px");
  assert.equal(top(publish), "6px");
  assert.equal(top(save), "6px");
  assert.equal(top(back), "2px");
  assert.equal(top(input), "6px");
});

test("explicit Button radii are uniform and distinct within a square shape profile", () => {
  const { css } = makeBrandTheme(createThemeProfile("reserve"));
  const sheet = readFileSync(new URL("css/button.css", import.meta.url), "utf8");
  const { container } = render(<div className="elea-brand">
    <style>{css + sheet}</style>
    {(["sm", "md", "lg"] as const).map(radius => <Button key={radius} radius={radius}>{radius}</Button>)}
  </div>);
  for (const [size, radius] of Object.entries({ sm: "4px", md: "6px", lg: "12px" })) {
    const style = getComputedStyle(screen.getByRole("button", { name: size }));
    assert.equal(style.borderTopLeftRadius, radius);
    assert.equal(style.borderBottomRightRadius, radius);
  }
  container.style.setProperty("--elea-control-radius", "9px");
  assert.equal(getComputedStyle(screen.getByRole("button", { name: "md" })).borderTopLeftRadius, "9px");
});

test("an opt-in profile scales the action corners and respects nested brand and host overrides", () => {
  const brand = createThemeProfile("echappee");
  const outer = makeBrandTheme({ ...brand, buttonRadiusScale: "profile" }, "outer").css;
  const inner = makeBrandTheme(brand, "inner").css;
  const sheet = readFileSync(new URL("css/button.css", import.meta.url), "utf8");
  render(<div className="outer" data-testid="outer">
    <style>{outer + inner + sheet}</style>
    <Button radius="sm">Small</Button><Button radius="md">Medium</Button><Button radius="lg">Large</Button>
    <div className="inner"><Button radius="sm">Uniform</Button></div>
  </div>);
  const corners = (name: string) => {
    const style = getComputedStyle(screen.getByRole("button", { name }));
    return [style.borderTopRightRadius, style.borderBottomLeftRadius];
  };
  assert.deepEqual(corners("Small"), ["9px", "0px"]);
  assert.deepEqual(corners("Medium"), ["13.5px", "0px"]);
  assert.deepEqual(corners("Large"), ["18px", "0px"]);
  assert.deepEqual(corners("Uniform"), ["4px", "4px"]);
  const scope = screen.getByTestId("outer");
  scope.style.setProperty("--elea-control-radius", "5px");
  scope.style.setProperty("--elea-shape-action", "8px 0px");
  assert.deepEqual(corners("Medium"), ["5px", "5px"]);
  assert.deepEqual(corners("Large"), ["0px", "0px"]);
});

test("Button publishes the pointer to the effects that follow it", () => {
  const seen: string[] = [];
  const handlers = { onPointerDown: () => seen.push("down"), onPointerMove: () => seen.push("move"), onPointerLeave: () => seen.push("leave") };
  const { rerender } = render(<Button effect="magnetic" {...handlers}>Go</Button>);
  const box = (button: HTMLElement) => {
    Object.defineProperties(button, { offsetWidth: { value: 100 }, offsetHeight: { value: 40 } });
    button.getBoundingClientRect = () => ({ left: 10, top: 20, width: 200, height: 80 }) as DOMRect;
    return button;
  };
  const button = box(screen.getByRole("button", { name: "Go" }));
  fireEvent.pointerMove(button, { clientX: 160, clientY: 40 });
  assert.deepEqual(["--elea-x", "--elea-y", "--elea-px", "--elea-py"].map((name) => button.style.getPropertyValue(name)), ["75px", "10px", "0.5", "-0.5"]);
  fireEvent.pointerLeave(button);
  assert.deepEqual([button.style.getPropertyValue("--elea-x"), button.style.getPropertyValue("--elea-px")], ["75px", ""]);
  fireEvent.pointerDown(button, { clientX: 10, clientY: 20 });
  assert.equal(button.style.getPropertyValue("--elea-px"), "-1");
  assert.deepEqual(seen, ["move", "leave", "down"]);
  rerender(<Button href="https://example.org" effect="ripple">Go</Button>);
  const link = box(screen.getByRole("link", { name: "Go" }));
  fireEvent.pointerDown(link, { clientX: 110, clientY: 60 });
  assert.equal(link.style.getPropertyValue("--elea-x"), "50px");
  rerender(<IconButton label="Close" effect="tilt" {...handlers}><span>x</span></IconButton>);
  const icon = box(screen.getByRole("button", { name: "Close" }));
  fireEvent.pointerMove(icon, { clientX: 210, clientY: 100 });
  assert.equal(icon.style.getPropertyValue("--elea-py"), "1");
  rerender(<Button effect="shine" {...handlers}>Go</Button>);
  const still = screen.getByRole("button", { name: "Go" });
  fireEvent.pointerMove(still, { clientX: 5, clientY: 5 });
  assert.equal(still.style.getPropertyValue("--elea-x"), "");
  assert.deepEqual(seen.slice(3), ["move", "move"]);
});

test("Button motion follows its ancestors unless the prop decides", () => {
  const { rerender } = render(<Button>Go</Button>);
  assert.equal(screen.getByRole("button", { name: "Go" }).hasAttribute("data-elea-motion"), false);
  rerender(<Button motion>Go</Button>);
  assert.equal(screen.getByRole("button", { name: "Go" }).getAttribute("data-elea-motion"), "on");
  rerender(<Button href="https://example.org" motion={false}>Go</Button>);
  assert.equal(screen.getByRole("link", { name: "Go" }).getAttribute("data-elea-motion"), "off");
  rerender(<IconButton label="Close" motion><span>x</span></IconButton>);
  assert.equal(screen.getByRole("button", { name: "Close" }).getAttribute("data-elea-motion"), "on");
});

test("Button preserves host accessibility attributes and blocks disabled links", () => {
  const clicks: string[] = [];
  const click = () => clicks.push("click");
  const auxClick = () => clicks.push("auxclick");
  const href = "#article";
  const { rerender } = render(
    <Button href={href} aria-label="Open article" aria-busy={false} onClick={click} onAuxClick={auxClick}>Open</Button>,
  );
  const activeLink = screen.getByRole("link", { name: "Open article" });
  assert.equal(activeLink.getAttribute("aria-busy"), "false");
  fireEvent(activeLink, new window.MouseEvent("auxclick", { bubbles: true, button: 1 }));
  fireEvent.click(activeLink);
  assert.deepEqual(clicks, ["auxclick", "click"]);

  rerender(<Button href={href} loading aria-label="Open article" onClick={click} onAuxClick={auxClick}>Open</Button>);
  const loadingLink = screen.getByRole("link", { name: "Open article" });
  assert.equal(loadingLink.getAttribute("aria-busy"), "true");
  assert.equal(loadingLink.getAttribute("aria-disabled"), "true");
  assert.equal(loadingLink.getAttribute("href"), null);
  assert.equal(loadingLink.tabIndex, -1);
  fireEvent(loadingLink, new window.MouseEvent("auxclick", { bubbles: true, button: 1 }));
  fireEvent.click(loadingLink);
  assert.deepEqual(clicks, ["auxclick", "click"]);
});

test("Badge tones and variants", () => {
  render(<Badge tone="danger" variant="solid" size="sm" icon={<i>!</i>} className="x">Late</Badge>);
  const badge = screen.getByText("Late");
  assert.equal(badge.className, "elea-badge elea-badge--danger elea-badge--solid elea-badge--sm x");
  assert.ok(badge.querySelector(".elea-badge__icon"));
});

test("Footer renders a landmark with labelled links and a host signature", () => {
  render(
    <Footer
      brand={<a href="/">Product</a>}
      className="product-footer"
      groups={[{ label: "Resources", links: [{ label: "Documentation", href: "/docs" }] }]}
    >
      <a href="https://example.org">Studio</a>
    </Footer>,
  );
  const footer = screen.getByRole("contentinfo");
  assert.equal(footer.className, "elea-footer product-footer");
  assert.ok(within(footer).getByRole("link", { name: "Product" }));
  const links = within(footer).getByRole("navigation", { name: "Resources" });
  assert.equal(within(links).getByRole("link", { name: "Documentation" }).getAttribute("href"), "/docs");
  assert.ok(within(footer).getByRole("link", { name: "Studio" }));
  assert.equal(renderToStaticMarkup(<Footer />), '<footer class="elea-footer"></footer>');
});

test("Field wires label, help and error to its control", () => {
  const { rerender } = render(
    <Field label="Name" help="Your full name" required requiredMarker="*">
      {(control) => <Input {...control} placeholder="Jane" />}
    </Field>,
  );
  const input = screen.getByRole("textbox", { name: "Name" });
  assert.equal(input.getAttribute("aria-describedby"), `${input.id}-help`);
  assert.equal(input.getAttribute("aria-invalid"), null);
  assert.equal((input as HTMLInputElement).required, true);
  assert.equal(screen.getByText("Your full name").id, `${input.id}-help`);
  rerender(
    <Field label="Name" id="name" error="Required" help="Hint">
      {(control) => <Textarea {...control} invalid />}
    </Field>,
  );
  const area = screen.getByRole("textbox", { name: "Name" });
  assert.equal(area.id, "name");
  assert.equal(area.getAttribute("aria-describedby"), "name-help name-error");
  assert.equal(area.getAttribute("aria-invalid"), "true");
  assert.equal(screen.getByRole("alert").textContent, "Required");
  assert.ok(area.className.includes("elea-ui-textarea") && area.className.includes("elea-ui-input--invalid"));
  render(<Label htmlFor="z">Zed</Label>);
  assert.equal(screen.getByText("Zed").className, "elea-field__label");
  render(<Input size="sm" aria-label="small" />);
  assert.ok(screen.getByRole("textbox", { name: "small" }).className.includes("elea-ui-input--sm"));
});

test("RadioGroup submits and resets native choices in its associated form", () => {
  const options = [
    { value: "instant", label: "Instant", description: "After each update" },
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly", disabled: true },
  ];
  const formId = "digest-preferences";
  const props = { name: "digest", form: formId, label: "Delivery", options, defaultValue: "daily" };
  const { rerender } = render(<><form id={formId} /><RadioGroup {...props} /></>);
  const form = document.getElementById(formId) as HTMLFormElement;
  const result = () => new window.FormData(form).get("digest");
  const instant = screen.getByRole("radio", { name: "Instant", description: "After each update" });
  assert.equal(result(), "daily");
  fireEvent.click(instant);
  assert.equal(result(), "instant");
  form.reset();
  assert.equal(result(), "daily");
  assert.equal((screen.getByRole("radio", { name: "Weekly" }) as HTMLInputElement).disabled, true);
  rerender(<><form id={formId} /><RadioGroup {...props} disabled /></>);
  assert.equal(result(), null);
});

test("RadioGroup exposes required and controlled state alongside group feedback", () => {
  const changes: string[] = [];
  const props = {
    id: "delivery", name: "delivery", label: "Delivery", required: true, requiredMarker: "*",
    options: [{ value: "daily", label: "Daily" }], onChange: (value: string) => changes.push(value),
  };
  const { rerender } = render(<RadioGroup {...props} value={null} help="Choose a frequency" error="Choose one" />);
  const group = screen.getByRole("group", { name: "Delivery", description: "Choose a frequency Choose one" });
  const radio = within(group).getByRole("radio", { name: "Daily" }) as HTMLInputElement;
  assert.equal(group.getAttribute("aria-invalid"), "true");
  assert.equal(radio.validity.valueMissing, true);
  assert.equal(within(group).getByRole("alert").textContent, "Choose one");
  fireEvent.click(radio);
  assert.deepEqual(changes, ["daily"]);
  assert.equal(radio.checked, false);
  rerender(<RadioGroup {...props} value="daily" />);
  assert.equal(radio.checked, true);
  assert.equal(radio.checkValidity(), true);
  assert.equal(group.getAttribute("aria-invalid"), null);
});

test("form controls hand their native element to a ref, as form libraries expect", () => {
  const input = createRef<HTMLInputElement>();
  const area = createRef<HTMLTextAreaElement>();
  const box = createRef<HTMLInputElement>();
  const toggle = createRef<HTMLInputElement>();
  let seen: HTMLInputElement | null = null;
  render(
    <>
      <Input ref={input} aria-label="Name" className="w-full" />
      <Textarea ref={area} aria-label="Bio" />
      <Checkbox ref={box} label="Agree" indeterminate />
      <Checkbox ref={(element) => { seen = element; }} label="Other" />
      <Toggle ref={toggle} checked onCheckedChange={() => {}} label="On" />
    </>,
  );
  assert.equal(input.current, screen.getByRole("textbox", { name: "Name" }));
  assert.ok(input.current?.className.endsWith("w-full"));
  assert.equal(area.current?.tagName, "TEXTAREA");
  assert.equal(box.current?.indeterminate, true);
  assert.equal(seen, screen.getByRole("checkbox", { name: "Other" }));
  assert.equal(toggle.current, screen.getByRole("switch", { name: "On" }));
  cleanup();
});

test("Checkbox and Toggle report changes and expose their state", () => {
  const checked: boolean[] = [];
  render(<Checkbox label="Agree" description="Terms" onCheckedChange={(next) => checked.push(next)} />);
  const box = screen.getByRole("checkbox", { name: /Agree/ });
  fireEvent.click(box);
  assert.deepEqual(checked, [true]);
  cleanup();
  render(<Checkbox aria-label="partial" indeterminate disabled />);
  const partial = screen.getByRole("checkbox", { name: "partial" }) as HTMLInputElement;
  assert.equal(partial.indeterminate, true);
  assert.equal(partial.disabled, true);
  assert.ok(partial.closest("label")?.className.includes("elea-checkbox--disabled"));
  cleanup();
  function Switch() {
    const [on, setOn] = useState(false);
    return <Toggle checked={on} onCheckedChange={setOn} label="Notifications" />;
  }
  render(<Switch />);
  const toggle = screen.getByRole("switch", { name: "Notifications" });
  assert.equal(toggle.getAttribute("aria-checked"), "false");
  fireEvent.click(toggle);
  assert.equal(toggle.getAttribute("aria-checked"), "true");
  assert.ok(toggle.closest("label")?.className.includes("elea-toggle--on"));
});

test("Dialog traps focus, closes on Escape and the backdrop, and returns focus", () => {
  const closes: number[] = [];
  function Host() {
    const [open, setOpen] = useState(false);
    return (
      <>
        <button type="button" onClick={() => setOpen(true)}>open</button>
        <Dialog open={open} onClose={() => { closes.push(1); setOpen(false); }} title="Confirm" description="Sure?" closeLabel="Close" actions={<Button onClick={() => setOpen(false)}>Ok</Button>}>
          <Input aria-label="inside" />
        </Dialog>
      </>
    );
  }
  render(<Host />);
  const opener = screen.getByRole("button", { name: "open" });
  opener.focus();
  fireEvent.click(opener);
  const dialog = screen.getByRole("dialog", { name: "Confirm" });
  assert.equal(dialog.getAttribute("aria-modal"), "true");
  assert.equal(dialog.getAttribute("aria-describedby") && screen.getByText("Sure?").id, dialog.getAttribute("aria-describedby"));
  assert.ok(document.activeElement === within(dialog).getByRole("button", { name: "Close" }), "first focusable takes focus");
  assert.equal(document.body.style.overflow, "hidden");
  within(dialog).getByRole("button", { name: "Ok" }).focus();
  fireEvent.keyDown(document, { key: "Tab" });
  assert.ok(document.activeElement === within(dialog).getByRole("button", { name: "Close" }), "Tab wraps to the first");
  fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
  assert.ok(document.activeElement === within(dialog).getByRole("button", { name: "Ok" }), "Shift+Tab wraps to the last");
  fireEvent.keyDown(document, { key: "Escape" });
  assert.equal(screen.queryByRole("dialog"), null);
  assert.deepEqual(closes, [1]);
  assert.ok(document.activeElement === opener, "focus returns to the opener");
  assert.equal(document.body.style.overflow, "");
  fireEvent.click(opener);
  fireEvent.mouseDown(document.querySelector(".elea-dialog-backdrop") as HTMLElement);
  assert.equal(screen.queryByRole("dialog"), null);
  fireEvent.click(opener);
  fireEvent.mouseDown(screen.getByRole("dialog"));
  assert.ok(screen.getByRole("dialog"));
  fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Close" }));
  assert.equal(screen.queryByRole("dialog"), null);
});

test("ConfirmDialog wires its two buttons", () => {
  const events: string[] = [];
  render(<ConfirmDialog open onConfirm={() => events.push("confirm")} onCancel={() => events.push("cancel")} title="Delete?" closeLabel="Close" confirmLabel="Delete" cancelLabel="Keep" tone="danger" />);
  fireEvent.click(screen.getByRole("button", { name: "Keep" }));
  fireEvent.click(screen.getByRole("button", { name: "Delete" }));
  assert.deepEqual(events, ["cancel", "confirm"]);
  assert.ok(screen.getByRole("button", { name: "Delete" }).className.includes("elea-button--danger"));
  cleanup();
  render(<Dialog open={false} onClose={() => {}} title="Hidden" closeLabel="Close" />);
  assert.equal(screen.queryByRole("dialog"), null);
  render(<Dialog open onClose={() => {}} title="Empty" closeLabel="Close" dismissOnBackdrop={false} size="lg" motion />);
  assert.equal(document.querySelector(".elea-dialog-backdrop")?.getAttribute("data-elea-motion"), "on");
  fireEvent.mouseDown(document.querySelector(".elea-dialog-backdrop") as HTMLElement);
  assert.ok(screen.getByRole("dialog", { name: "Empty" }).className.includes("elea-dialog--lg"));
});

test("Dialog keeps the focused field on update and Escape calls the latest handler", () => {
  const closes: string[] = [];
  function Host() {
    const [value, setValue] = useState("");
    const [open, setOpen] = useState(false);
    return (
      <>
        <button onClick={() => setOpen(true)}>Edit</button>
        <Dialog open={open} title="Edit" closeLabel="Close" onClose={() => { closes.push(value); setOpen(false); }}>
          <Input aria-label="Title" value={value} onChange={(event) => setValue(event.target.value)} />
        </Dialog>
      </>
    );
  }
  render(<Host />);
  const opener = screen.getByRole("button", { name: "Edit" });
  opener.focus();
  fireEvent.click(opener);
  const field = screen.getByRole("textbox", { name: "Title" });
  field.focus();
  fireEvent.change(field, { target: { value: "New title" } });
  assert.equal(document.activeElement, field);
  fireEvent.keyDown(field, { key: "Escape" });
  assert.deepEqual(closes, ["New title"]);
  assert.equal(document.activeElement, opener);
});

test("Field ids survive hydration and an initially open Dialog mounts", async () => {
  const form = (
    <>
      <Field label="Title" help="Document name">{(control) => <Input {...control} />}</Field>
      <Dialog open title="Edit" closeLabel="Close" onClose={() => {}} />
    </>
  );
  const container = document.createElement("div");
  container.innerHTML = renderToString(form);
  assert.equal(container.querySelector('[role="dialog"]'), null);
  document.body.append(container);
  const errors: unknown[] = [];
  const originalError = console.error;
  console.error = (...args: unknown[]) => errors.push(args);
  let root: Root | undefined;
  try {
    await act(async () => {
      root = hydrateRoot(container, form, { onRecoverableError: (error) => errors.push(error) });
    });
    assert.deepEqual(errors, []);
    assert.ok(screen.getByRole("dialog", { name: "Edit" }));
    const input = screen.getByRole("textbox", { name: "Title" });
    assert.equal(input.getAttribute("aria-describedby"), screen.getByText("Document name").id);
  } finally {
    console.error = originalError;
    await act(async () => root?.unmount());
    container.remove();
  }
});

test("Menu opens from its trigger, moves with the keyboard, selects and closes", () => {
  const picked: string[] = [];
  render(
    <Menu
      label="Actions"
      align="end"
      items={[
        { id: "edit", label: "Edit", onSelect: () => picked.push("edit") },
        { id: "off", label: "Off", disabled: true, onSelect: () => picked.push("off") },
        { id: "delete", label: "Delete", danger: true, icon: <i>d</i>, onSelect: () => picked.push("delete") },
      ]}
      trigger={(props) => <button type="button" {...props}>More</button>}
    />,
  );
  const trigger = screen.getByRole("button", { name: "More" });
  assert.equal(trigger.getAttribute("aria-expanded"), "false");
  fireEvent.click(trigger);
  const menu = screen.getByRole("menu", { name: "Actions" });
  assert.equal(trigger.getAttribute("aria-expanded"), "true");
  assert.equal(trigger.getAttribute("aria-controls"), menu.id);
  const items = within(menu).getAllByRole("menuitem");
  assert.ok(document.activeElement === items[0], "first item focused");
  fireEvent.keyDown(menu, { key: "ArrowDown" });
  assert.ok(document.activeElement === items[2], "disabled items are skipped");
  fireEvent.keyDown(menu, { key: "ArrowDown" });
  assert.ok(document.activeElement === items[0], "wraps around");
  fireEvent.keyDown(menu, { key: "End" });
  assert.ok(document.activeElement === items[2]);
  fireEvent.keyDown(menu, { key: "Home" });
  fireEvent.keyDown(menu, { key: "ArrowUp" });
  assert.ok(document.activeElement === items[2]);
  fireEvent.mouseEnter(items[0] as HTMLElement);
  fireEvent.mouseEnter(items[1] as HTMLElement);
  fireEvent.click(items[2] as HTMLElement);
  assert.deepEqual(picked, ["delete"]);
  assert.equal(screen.queryByRole("menu"), null);
  fireEvent.keyDown(trigger, { key: "ArrowUp" });
  assert.ok(document.activeElement === within(screen.getByRole("menu")).getAllByRole("menuitem")[2]);
  fireEvent.keyDown(screen.getByRole("menu"), { key: "Escape" });
  assert.equal(screen.queryByRole("menu"), null);
  fireEvent.keyDown(trigger, { key: "Enter" });
  fireEvent.keyDown(screen.getByRole("menu"), { key: "Tab" });
  assert.equal(screen.queryByRole("menu"), null);
  fireEvent.keyDown(trigger, { key: " " });
  fireEvent.mouseDown(document.body);
  assert.equal(screen.queryByRole("menu"), null);
  fireEvent.click(trigger);
  fireEvent.click(trigger);
  assert.equal(screen.queryByRole("menu"), null);
});

test("Tooltip exists only while shown and preserves its child's description", () => {
  render(<>
    <span id="details">Details</span>
    <Tooltip content="More info" placement="bottom"><button type="button" aria-describedby="details">?</button></Tooltip>
  </>);
  const button = screen.getByRole("button", { name: "?" });
  assert.equal(screen.queryByRole("tooltip"), null);
  assert.equal(button.getAttribute("aria-describedby"), "details");
  assert.equal(button.parentElement?.className, "elea-tooltip");
  fireEvent.mouseEnter(button);
  const bubble = screen.getByRole("tooltip");
  assert.equal(bubble.textContent, "More info");
  assert.equal(bubble.dataset.side, "bottom");
  assert.equal(button.getAttribute("aria-describedby"), `details ${bubble.id}`);
  fireEvent.mouseLeave(button);
  assert.equal(screen.queryByRole("tooltip"), null);
  assert.equal(button.getAttribute("aria-describedby"), "details");
  fireEvent.focus(button);
  assert.ok(screen.getByRole("tooltip"));
  fireEvent.blur(button);
  assert.equal(screen.queryByRole("tooltip"), null);
  fireEvent.focus(button);
  fireEvent.scroll(document.body);
  assert.equal(screen.queryByRole("tooltip"), null);
  fireEvent.mouseEnter(button);
  fireEvent(window, new window.Event("resize"));
  assert.equal(screen.queryByRole("tooltip"), null);
  // The pointer may rest on the hint, and Escape dismisses it without moving the pointer or the focus
  fireEvent.mouseEnter(button);
  fireEvent.mouseOver(screen.getByRole("tooltip"));
  assert.ok(screen.getByRole("tooltip"));
  fireEvent.keyDown(button, { key: "Escape" });
  assert.equal(screen.queryByRole("tooltip"), null);
});

test("Tooltip wraps bare text and components that forward nothing", () => {
  const Label = () => <em>Quarterly revenue</em>;
  render(<p><Tooltip content="Plain">Truncated label</Tooltip><Tooltip content="Opaque"><Label /></Tooltip><Tooltip content="Several"><>a<b>b</b></></Tooltip></p>);
  fireEvent.mouseEnter(screen.getByText("Truncated label"));
  assert.equal(screen.getByRole("tooltip").textContent, "Plain");
  fireEvent.mouseLeave(screen.getByText("Truncated label"));
  fireEvent.mouseEnter(screen.getByText("Quarterly revenue"));
  assert.equal(screen.getByRole("tooltip").textContent, "Opaque");
  assert.equal(screen.getByText("Quarterly revenue").hasAttribute("aria-describedby"), false);
  fireEvent.mouseLeave(screen.getByText("Quarterly revenue"));
  fireEvent.mouseEnter(screen.getByText("b"));
  assert.equal(screen.getByRole("tooltip").textContent, "Several");
});

test("Tooltip flips and shifts to stay inside the viewport", () => {
  const rangeRect = window.Range.prototype.getBoundingClientRect;
  const sizes = { offsetWidth: 200, offsetHeight: 30 };
  for (const [name, value] of Object.entries(sizes)) Object.defineProperty(window.HTMLElement.prototype, name, { configurable: true, get: () => value });
  const shown = (anchor: { top: number; left: number; width: number; height: number }, placement: "top" | "bottom") => {
    window.Range.prototype.getBoundingClientRect = () => ({ ...anchor, bottom: anchor.top + anchor.height, right: anchor.left + anchor.width }) as DOMRect;
    const { unmount } = render(<Tooltip content="Hint" placement={placement}>Label</Tooltip>);
    fireEvent.mouseEnter(screen.getByText("Label"));
    const { dataset, style } = screen.getByRole("tooltip");
    unmount();
    return [dataset.side, style.top, style.left];
  };
  try {
    // jsdom's viewport is 1024 by 768
    assert.deepEqual(shown({ top: 300, left: 400, width: 100, height: 20 }, "top"), ["top", "266px", "350px"]);
    assert.deepEqual(shown({ top: 300, left: 400, width: 100, height: 20 }, "bottom"), ["bottom", "324px", "350px"]);
    assert.deepEqual(shown({ top: 10, left: 0, width: 60, height: 20 }, "top"), ["bottom", "34px", "8px"]);
    assert.deepEqual(shown({ top: 740, left: 1000, width: 24, height: 20 }, "bottom"), ["top", "706px", "816px"]);
    // No room on either side: the preferred one stays
    window.Range.prototype.getBoundingClientRect = rangeRect;
    Object.defineProperty(window.HTMLElement.prototype, "offsetHeight", { configurable: true, get: () => 800 });
    assert.equal(shown({ top: 300, left: 400, width: 100, height: 20 }, "top")[0], "top");
    assert.equal(shown({ top: 300, left: 400, width: 100, height: 20 }, "bottom")[0], "bottom");
  } finally {
    window.Range.prototype.getBoundingClientRect = rangeRect;
    for (const name of Object.keys(sizes)) Reflect.deleteProperty(window.HTMLElement.prototype, name);
  }
});

test("Pagination range and rendering", () => {
  assert.deepEqual(paginationRange(1, 5), [1, 2, 3, 4, 5]);
  assert.deepEqual(paginationRange(1, 20), [1, 2, 3, 4, 5, 6, null, 20]);
  assert.deepEqual(paginationRange(10, 20), [1, null, 8, 9, 10, 11, 12, null, 20]);
  assert.deepEqual(paginationRange(20, 20), [1, null, 15, 16, 17, 18, 19, 20]);
  const pages: number[] = [];
  const labels = { navigation: "Pages", previous: "Previous", next: "Next", page: "Page {page}", summary: "{from}–{to} of {total}" };
  const { rerender } = render(<Pagination page={3} pageCount={10} onPageChange={(page) => pages.push(page)} labels={labels} totalItems={95} pageSize={10} />);
  const nav = screen.getByRole("navigation", { name: "Pages" });
  assert.equal(within(nav).getByText("21–30 of 95").className, "elea-pagination__summary");
  assert.equal(within(nav).getByRole("button", { name: "Page 3" }).getAttribute("aria-current"), "page");
  fireEvent.click(within(nav).getByRole("button", { name: "Next" }));
  fireEvent.click(within(nav).getByRole("button", { name: "Previous" }));
  fireEvent.click(within(nav).getByRole("button", { name: "Page 10" }));
  assert.deepEqual(pages, [4, 2, 10]);
  assert.equal(within(nav).getByRole("button", { name: "Page 3" }).getAttribute("aria-current"), "page");
  assert.ok(within(nav).getByText("21–30 of 95"));
  rerender(<Pagination page={10} pageCount={10} onPageChange={(page) => pages.push(page)} labels={labels} totalItems={95} pageSize={10} />);
  assert.equal(within(nav).getByRole("button", { name: "Page 10" }).getAttribute("aria-current"), "page");
  assert.ok(within(nav).getByText("91–95 of 95"));
  const lastNext = within(nav).getByRole<HTMLButtonElement>("button", { name: "Next" });
  assert.equal(lastNext.disabled, true);
  fireEvent.click(lastNext);
  assert.deepEqual(pages, [4, 2, 10]);

  rerender(<Pagination page={1} pageCount={0} onPageChange={() => {}} labels={labels} totalItems={0} pageSize={10} />);
  assert.ok(screen.getByText("0–0 of 0"));
  assert.equal(screen.queryByRole("list"), null);
  rerender(<Pagination page={1} pageCount={1} onPageChange={() => {}} labels={labels} />);
  assert.equal(screen.queryByRole("navigation"), null);
  rerender(<Pagination page={1} pageCount={1} onPageChange={() => {}} labels={labels} totalItems={3} pageSize={10} />);
  assert.ok(screen.getByText("1–3 of 3"));
  assert.equal(screen.queryByRole("list"), null);
  rerender(<Pagination page={1} pageCount={2} onPageChange={() => {}} labels={labels} />);
  assert.equal((screen.getByRole("button", { name: "Previous" }) as HTMLButtonElement).disabled, true);
});

test("Pagination shows the labels of previous and next beside their arrows when asked", () => {
  const labels = { navigation: "Pages", previous: "Previous", next: "Next", page: "Page {page}" };
  const pages: number[] = [];
  const { rerender } = render(<Pagination page={2} pageCount={4} onPageChange={(page) => pages.push(page)} labels={labels} />);
  const plain = screen.getByRole("navigation").innerHTML;
  assert.equal(screen.getByRole("navigation").className, "elea-pagination");
  assert.equal(screen.getByRole("button", { name: "Previous" }).textContent, "‹");
  assert.equal(screen.getByRole("button", { name: "Next" }).outerHTML, '<button type="button" class="elea-pagination__button" aria-label="Next">›</button>');
  rerender(<Pagination page={2} pageCount={4} onPageChange={(page) => pages.push(page)} labels={labels} showLabels={false} />);
  assert.equal(screen.getByRole("navigation").innerHTML, plain, "off is the default");

  rerender(<Pagination page={2} pageCount={4} onPageChange={(page) => pages.push(page)} labels={labels} showLabels />);
  assert.equal(screen.getByRole("navigation").className, "elea-pagination elea-pagination--labels");
  const previous = screen.getByRole("button", { name: "Previous" });
  const next = screen.getByRole("button", { name: "Next" });
  assert.equal(previous.textContent, "‹Previous");
  assert.equal(next.textContent, "Next›");
  assert.equal(previous.className, "elea-pagination__button elea-pagination__button--step");
  for (const button of [previous, next]) {
    assert.equal(button.querySelector(".elea-pagination__arrow")?.getAttribute("aria-hidden"), "true");
    assert.equal(button.querySelectorAll(".elea-pagination__label").length, 1);
  }
  assert.equal(screen.getByRole("button", { name: "Page 2" }).className, "elea-pagination__button elea-pagination__button--current", "the page buttons stay as they are");
  fireEvent.click(next);
  fireEvent.click(previous);
  assert.deepEqual(pages, [3, 1]);

  const sheet = readFileSync(new URL("css/pagination.css", import.meta.url), "utf8");
  assert.match(sheet, /\.elea-pagination--labels \{ container-type: inline-size; \}/);
  assert.match(sheet, /@container \(max-width: [\d.]+rem\) \{\s+\.elea-pagination__label \{ display: none; \}/, "the text leaves a narrow navigation, where the name of the button stays");
  assert.match(sheet, /\.elea-pagination__arrow:dir\(rtl\) \{ scale: -1 1; \}/);
});

test("the primitives render on the server and pass an axe audit", async () => {
  const markup = renderToStaticMarkup(<Button>Server</Button>);
  assert.equal(markup, '<button class="elea-button elea-button--primary elea-button--md" type="button"><span class="elea-button__label">Server</span></button>');
  const problems = await violations(
    <main>
      <Button icon={<i>i</i>}>Save</Button>
      <IconButton label="Close">x</IconButton>
      <Badge tone="primary">New</Badge>
      <Field label="Email" help="We never share it" error="Invalid">{(control) => <Input {...control} type="email" />}</Field>
      <Checkbox label="Agree" />
      <RadioGroup label="Digest" name="digest" options={[{ value: "day", label: "Daily", description: "Every evening" }]} />
      <Toggle checked onCheckedChange={() => {}} label="On" />
      <Tooltip content="Hint"><button type="button">Hover</button></Tooltip>
      <Pagination page={2} pageCount={4} onPageChange={() => {}} labels={{ navigation: "Pages", previous: "Previous", next: "Next", page: "Page {page}" }} />
      <Menu label="Actions" items={[{ id: "a", label: "A", onSelect: () => {} }]} trigger={(props) => <button type="button" {...props}>More</button>} />
    </main>,
  );
  assert.deepEqual(problems, []);
  act(() => {});
});

test("disabling an open Select closes the choices and omits its value on submit", () => {
  const props = { label: "Title", name: "title", options: [{ value: "a", label: "A" }], value: "a", onChange() {} };
  const { rerender, container } = render(<form><Select {...props} /></form>);
  const form = container.querySelector("form") as HTMLFormElement;
  assert.equal(new window.FormData(form).get("title"), "a");
  fireEvent.click(screen.getByRole("combobox"));
  assert.ok(screen.getByRole("listbox"));
  rerender(<form><Select {...props} disabled /></form>);
  assert.equal(screen.queryByRole("listbox"), null);
  assert.equal(new window.FormData(form).get("title"), null);
  rerender(<form><Select {...props} /></form>);
  assert.equal(screen.queryByRole("listbox"), null);
  assert.equal(new window.FormData(form).get("title"), "a");
});

test("Select picks with the mouse and the keyboard, jumps by typing, and lists a checklist when multiple", async () => {
  const picked: string[] = [];
  const options = [{ value: "fr", label: "Français" }, { value: "en", label: "English" }, { value: "de", label: "Deutsch", disabled: true }, { value: "es", label: "Español" }];
  const { container, rerender } = render(<Select label="Language" value="en" onChange={(value) => picked.push(value)} options={options} name="lang" placeholder="Pick" />);
  const trigger = screen.getByRole("combobox", { name: "Language" });
  assert.equal(trigger.textContent, "English");
  assert.equal((container.querySelector("input[name=lang]") as HTMLInputElement).value, "en");
  fireEvent.click(trigger);
  const list = screen.getByRole("listbox", { name: "Language" });
  assert.equal(within(list).getAllByRole("option").length, 4);
  assert.equal(within(list).getByRole("option", { name: "English" }).getAttribute("aria-selected"), "true");
  fireEvent.click(within(list).getByRole("option", { name: "Français" }));
  assert.deepEqual(picked, ["fr"]);
  assert.equal(screen.queryByRole("listbox"), null);
  // Keyboard: open on the current value, move past the disabled option, pick with Enter
  fireEvent.keyDown(trigger, { key: "ArrowDown" });
  fireEvent.keyDown(trigger, { key: "ArrowDown" });
  assert.equal(trigger.getAttribute("aria-activedescendant"), screen.getByRole("option", { name: "Español" }).id);
  fireEvent.keyDown(trigger, { key: "Enter" });
  assert.deepEqual(picked, ["fr", "es"]);
  fireEvent.keyDown(trigger, { key: " " });
  fireEvent.keyDown(trigger, { key: "End" });
  fireEvent.keyDown(trigger, { key: "Home" });
  assert.equal(trigger.getAttribute("aria-activedescendant"), screen.getByRole("option", { name: "Français" }).id);
  fireEvent.keyDown(trigger, { key: "Escape" });
  assert.equal(screen.queryByRole("listbox"), null);
  // Typing on the closed control picks straight away
  fireEvent.keyDown(trigger, { key: "e" });
  assert.equal(picked.at(-1), "en");
  // A click outside closes
  fireEvent.click(trigger);
  fireEvent.mouseDown(document.body);
  assert.equal(screen.queryByRole("listbox"), null);
  assert.deepEqual((await axe.run(container)).violations, []);
  rerender(<Select label="Language" value={null} onChange={() => {}} options={options} placeholder="Pick" disabled />);
  assert.equal(screen.getByRole("combobox", { name: "Language" }).textContent, "Pick");
  fireEvent.click(screen.getByRole("combobox", { name: "Language" }));
  assert.equal(screen.queryByRole("listbox"), null);
  cleanup();

  const values: string[][] = [];
  const { container: multi } = render(<Select multiple label="Days" value={["mon"]} onChange={(next) => values.push(next)} options={[{ value: "mon", label: "Monday" }, { value: "tue", label: "Tuesday" }]} summary={(selected) => `${selected.length} day(s)`} />);
  const days = screen.getByRole("combobox", { name: "Days" });
  assert.equal(days.textContent, "1 day(s)");
  fireEvent.click(days);
  assert.equal(screen.getByRole("listbox").getAttribute("aria-multiselectable"), "true");
  fireEvent.click(screen.getByRole("option", { name: "Tuesday" }));
  assert.deepEqual(values.at(-1), ["mon", "tue"]);
  // The list stays open for more picks; picking again unticks
  fireEvent.click(screen.getByRole("option", { name: "Monday" }));
  assert.deepEqual(values.at(-1), []);
  assert.deepEqual((await axe.run(multi)).violations, []);
});

test("Select keeps focus on its trigger: Tab closes, ArrowUp wraps to the last choice, typing moves while open, and a closed multiple ignores letters", () => {
  const picked: string[] = [];
  const options = [{ value: "fr", label: "Français" }, { value: "en", label: "English" }, { value: "es", label: "Español" }];
  render(<Select label="Language" value="fr" onChange={(value) => picked.push(value)} options={options} />);
  const trigger = screen.getByRole("combobox", { name: "Language" });
  fireEvent.keyDown(trigger, { key: "ArrowUp" });
  fireEvent.keyDown(trigger, { key: "ArrowUp" });
  assert.equal(trigger.getAttribute("aria-activedescendant"), screen.getByRole("option", { name: "Español" }).id);
  fireEvent.keyDown(trigger, { key: "e" });
  assert.equal(trigger.getAttribute("aria-activedescendant"), screen.getByRole("option", { name: "English" }).id);
  assert.deepEqual(picked, []);
  fireEvent.keyDown(trigger, { key: "Tab" });
  assert.equal(screen.queryByRole("listbox"), null);
  cleanup();

  const values: string[][] = [];
  render(<Select multiple label="Days" value={[]} onChange={(next) => values.push(next)} options={[{ value: "mon", label: "Monday" }]} />);
  fireEvent.keyDown(screen.getByRole("combobox", { name: "Days" }), { key: "m" });
  assert.deepEqual(values, []);
  assert.equal(screen.queryByRole("listbox"), null);
});
