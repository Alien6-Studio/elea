import "./test/dom.js";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { afterEach, test } from "node:test";
import type { ReactElement } from "react";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import axe from "axe-core";
import { Avatar, AvatarSkeleton } from "./Avatar.js";
import { Badge, BadgeSkeleton } from "./Badge.js";
import { Button, ButtonSkeleton } from "./Button.js";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardSkeleton, CardTitle } from "./Card.js";
import { Field, FieldSkeleton, Input } from "./Field.js";
import { Skeleton } from "./Skeleton.js";
import { SkeletonRegion } from "./SkeletonRegion.js";
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow, TableSkeleton } from "./Table.js";

afterEach(cleanup);

async function violations(node: Element) {
  const results = await axe.run(node, { rules: { "color-contrast": { enabled: false }, region: { enabled: false } } });
  return results.violations.map((violation) => violation.id);
}

/**
 * What decides the box of a component here is its classes, since every size comes from the
 * stylesheet, and its tag where it has none. Text, state and ARIA are dropped: two trees with the
 * same outline lay out alike.
 */
function outline(node: Element, select: string): string[] {
  return Array.from(node.querySelectorAll(select), (element) => (element.className ? `.${element.className}` : element.tagName.toLowerCase()));
}

function sameOutline(skeleton: ReactElement, loaded: ReactElement, select: string) {
  const held = outline(render(skeleton).container, select);
  cleanup();
  assert.ok(held.length > 0);
  assert.deepEqual(held, outline(render(loaded).container, select));
  cleanup();
}

test("Skeleton stacks a count of placeholders", () => {
  const { container } = render(<><Skeleton variant="rect" count={3} height={40} width="50%" className="x" /><Skeleton count={2} lines={2} /></>);
  const [blocks, paragraphs] = Array.from(container.children) as HTMLElement[];
  assert.equal(blocks?.className, "elea-skeleton-stack x");
  assert.equal(blocks?.getAttribute("aria-hidden"), "true");
  assert.equal(blocks?.style.width, "50%");
  assert.equal(blocks?.querySelectorAll(":scope > .elea-skeleton--rect").length, 3);
  assert.equal((blocks?.firstElementChild as HTMLElement).style.height, "40px");
  assert.equal(paragraphs?.querySelectorAll(":scope > .elea-skeleton-lines").length, 2);
});

test("Skeleton hands blockClassName to every placeholder, and className to what holds them", () => {
  const { container } = render(<><Skeleton variant="rect" count={3} className="x" blockClassName="mine" /><Skeleton count={2} lines={2} blockClassName="mine" /><Skeleton lines={3} className="x" blockClassName="mine" /><Skeleton className="x" blockClassName="mine" /></>);
  const [blocks, paragraphs, lines, single] = Array.from(container.children) as HTMLElement[];
  assert.equal(blocks?.className, "elea-skeleton-stack x");
  assert.deepEqual(Array.from(blocks?.children ?? [], (block) => block.className), Array.from({ length: 3 }, () => "elea-skeleton elea-skeleton--rect mine"));
  assert.equal(paragraphs?.querySelectorAll(".elea-skeleton-lines > .elea-skeleton.mine").length, 4);
  assert.equal(paragraphs?.querySelectorAll(".mine").length, 4, "a group of lines is not a placeholder");
  assert.equal(lines?.className, "elea-skeleton-lines x");
  assert.equal(lines?.querySelectorAll(":scope > .elea-skeleton--text.mine").length, 3);
  assert.equal(single?.className, "elea-skeleton elea-skeleton--text mine x");
});

test("Skeleton around children keeps them in place, out of sight and out of reach, then hands them back", async () => {
  function Example({ pending }: Readonly<{ pending: boolean }>) {
    return (
      <p>
        <Skeleton loading={pending} className="x" data-testid="wrap"><input aria-label="Name" /></Skeleton>
        <Skeleton loading={pending}>Ada Lovelace</Skeleton>
        <Skeleton loading={pending}>{42}</Skeleton>
      </p>
    );
  }
  const { container, rerender } = render(<Example pending />);
  const wrap = screen.getByTestId("wrap");
  const input = wrap.querySelector("input");
  assert.equal(wrap.tagName, "SPAN");
  assert.equal(wrap.className, "elea-skeleton-wrap elea-skeleton-wrap--loading x");
  assert.equal(wrap.getAttribute("aria-hidden"), "true");
  assert.ok(wrap.hasAttribute("inert"));
  assert.equal(screen.queryByRole("textbox"), null);
  assert.equal(screen.getByText("Ada Lovelace").parentElement?.className, "elea-skeleton-wrap elea-skeleton-wrap--loading", "bare text gets a box to paint");
  assert.equal(screen.getByText("42").tagName, "SPAN");
  assert.deepEqual(await violations(container), []);

  rerender(<Example pending={false} />);
  assert.equal(wrap.className, "elea-skeleton-wrap x");
  assert.equal(wrap.getAttribute("aria-hidden"), null);
  assert.equal(wrap.hasAttribute("inert"), false);
  assert.equal(screen.getByRole("textbox", { name: "Name" }), input, "the child is the same element before and after");
  assert.match(renderToStaticMarkup(<Skeleton><b>x</b></Skeleton>), /^<span aria-hidden="true" inert="" class="elea-skeleton-wrap elea-skeleton-wrap--loading"><b>x<\/b><\/span>$/);
});

test("the wrapping styles paint the child and never size it", () => {
  const css = readFileSync(new URL("./css/skeleton.css", import.meta.url), "utf8");
  assert.match(css, /\.elea-skeleton-wrap \{ display: contents; \}/);
  const rules = Array.from(css.matchAll(/([^{}]*\.elea-skeleton-wrap--loading[^{}]*)\{([^}]*)\}/g), (rule) => rule[2] ?? "");
  assert.ok(rules.length >= 5);
  const properties = rules.flatMap((body) => Array.from(body.matchAll(/([\w-]+)\s*:/g), (property) => property[1]));
  const painting = ["animation", "background-color", "background-image", "background-repeat", "background-size", "border-color", "border-radius", "box-shadow", "color", "object-fit", "object-position", "pointer-events", "user-select", "visibility"];
  assert.deepEqual(properties.filter((property) => !painting.includes(property ?? "")), []);
});

test("AvatarSkeleton has the box of the avatar", async () => {
  sameOutline(<AvatarSkeleton size="lg" shape="square" className="mine" />, <Avatar name="Ada Lovelace" size="lg" shape="square" className="mine" />, ".elea-avatar");
  const { container } = render(<AvatarSkeleton />);
  assert.equal(container.firstElementChild?.className, "elea-skeleton-wrap elea-skeleton-wrap--loading");
  assert.equal(container.querySelector(".elea-avatar")?.className, "elea-avatar elea-avatar--md elea-avatar--circle elea-avatar--neutral");
  assert.deepEqual(await violations(container), []);
});

test("ButtonSkeleton has the box of the button, and of its label when it is known", async () => {
  sameOutline(<ButtonSkeleton size="lg" radius="full" fullWidth className="mine">Save changes</ButtonSkeleton>, <Button size="lg" radius="full" fullWidth className="mine">Save changes</Button>, "button, button *");
  const { container } = render(<><ButtonSkeleton>Save changes</ButtonSkeleton><ButtonSkeleton /></>);
  const [known, unknown] = Array.from(container.querySelectorAll("button"));
  assert.equal(known?.textContent, "Save changes");
  assert.equal(known?.tabIndex, -1);
  assert.equal(unknown?.textContent?.length, 4);
  assert.equal(screen.queryByRole("button"), null);
  assert.deepEqual(await violations(container), []);
});

test("BadgeSkeleton has the box of the badge", async () => {
  sameOutline(<BadgeSkeleton size="sm" className="mine">Draft</BadgeSkeleton>, <Badge size="sm" className="mine">Draft</Badge>, ".elea-badge");
  const { container } = render(<BadgeSkeleton />);
  assert.equal(container.querySelector(".elea-badge")?.textContent?.length, 3);
  assert.equal(container.firstElementChild?.getAttribute("aria-hidden"), "true");
  assert.deepEqual(await violations(container), []);
});

test("FieldSkeleton has the box of a field: label, input and help", async () => {
  sameOutline(
    <FieldSkeleton size="lg" help className="mine" />,
    <Field label="Email" help="We never share it." className="mine">{(control) => <Input {...control} size="lg" />}</Field>,
    ".elea-field, .elea-field__label, .elea-ui-input, .elea-field__help",
  );
  const { container } = render(<FieldSkeleton />);
  assert.equal(container.querySelector(".elea-field")?.getAttribute("aria-hidden"), "true");
  assert.equal(container.querySelector(".elea-field__help"), null);
  assert.equal(container.querySelector("input")?.disabled, true);
  assert.equal(container.querySelector("input")?.parentElement?.className, "elea-skeleton-wrap elea-skeleton-wrap--loading");
  assert.equal(container.querySelectorAll(".elea-skeleton--text").length, 1);
  assert.deepEqual(await violations(container), []);
});

test("CardSkeleton has the box of the card and of the parts it is asked for", async () => {
  sameOutline(
    <CardSkeleton variant="elevated" padding="lg" className="mine" description lines={2} footer={<ButtonSkeleton>Open</ButtonSkeleton>} />,
    <Card variant="elevated" padding="lg" className="mine">
      <CardHeader><CardTitle>Report</CardTitle><CardDescription>Today</CardDescription></CardHeader>
      <CardContent>Two lines<br />of content</CardContent>
      <CardFooter><Button>Open</Button></CardFooter>
    </Card>,
    '[class^="elea-card"], .elea-button',
  );
  const { container } = render(<><CardSkeleton media={<Skeleton variant="rect" height={160} />} /><CardSkeleton title={false} lines={0} /><CardSkeleton title={false} description /></>);
  const [full, bare, described] = Array.from(container.children);
  assert.equal(full?.getAttribute("aria-hidden"), "true");
  assert.equal(full?.firstElementChild?.className, "elea-skeleton elea-skeleton--rect");
  assert.equal(full?.querySelector("h3.elea-card__title > .elea-skeleton--text")?.getAttribute("style"), "width: 50%;");
  assert.equal(full?.querySelectorAll(".elea-card__content .elea-skeleton--text").length, 3);
  assert.equal(full?.querySelector(".elea-card__footer"), null);
  assert.equal(bare?.childElementCount, 0);
  assert.equal(described?.querySelector(".elea-card__title"), null);
  assert.ok(described?.querySelector(".elea-card__description > .elea-skeleton"));
  assert.deepEqual(await violations(container), []);
});

test("TableSkeleton has the box of a table of as many rows and columns", async () => {
  sameOutline(
    <TableSkeleton rows={2} columns={2} density="sm" striped className="mine" />,
    <Table density="sm" striped className="mine">
      <TableHead><TableRow><TableHeaderCell>Name</TableHeaderCell><TableHeaderCell>Role</TableHeaderCell></TableRow></TableHead>
      <TableBody>
        <TableRow><TableCell>Ada</TableCell><TableCell>Engineer</TableCell></TableRow>
        <TableRow><TableCell>Grace</TableCell><TableCell>Admiral</TableCell></TableRow>
      </TableBody>
    </Table>,
    ".elea-table, table, thead, tbody, tr, th, td",
  );
  const { container } = render(<><TableSkeleton /><TableSkeleton header={false} rows={1} columns={4} /></>);
  const [standard, headless] = Array.from(container.querySelectorAll("table"));
  assert.equal(standard?.getAttribute("aria-hidden"), "true");
  assert.equal(standard?.querySelectorAll("thead th").length, 3);
  assert.equal(standard?.querySelectorAll("tbody tr").length, 3);
  assert.equal(standard?.querySelectorAll("td > .elea-skeleton--text").length, 9);
  assert.equal(headless?.querySelector("thead"), null);
  assert.equal(headless?.querySelectorAll("td").length, 4);
  assert.deepEqual(await violations(container), []);
});

test("SkeletonRegion is busy while it loads and announces its label once the delay has passed", async () => {
  function Example({ pending, delay }: Readonly<{ pending: boolean; delay?: number }>) {
    return (
      <SkeletonRegion loading={pending} label="Loading orders" delay={delay} className="mine" data-testid="region">
        {pending ? <Skeleton lines={2} /> : <p>3 orders</p>}
      </SkeletonRegion>
    );
  }
  const { rerender } = render(<Example pending delay={30} />);
  const region = screen.getByTestId("region");
  const status = screen.getByRole("status");
  assert.equal(region.getAttribute("aria-busy"), "true");
  assert.equal(region.className, "elea-skeleton-region elea-skeleton-region--waiting mine");
  assert.equal(status.className, "elea-skeleton-region__label");
  assert.equal(status.textContent, "", "nothing is said before the placeholders show");
  assert.ok(region.querySelector(".elea-skeleton-lines"), "the placeholders hold their space from the start");
  await waitFor(() => assert.equal(status.textContent, "Loading orders"));
  assert.equal(region.className, "elea-skeleton-region mine");
  assert.deepEqual(await violations(region), []);

  rerender(<Example pending={false} delay={30} />);
  assert.equal(region.getAttribute("aria-busy"), "false");
  assert.equal(status.textContent, "");
  assert.equal(screen.getByText("3 orders").parentElement, region);

  rerender(<Example pending delay={30} />);
  rerender(<Example pending={false} delay={30} />);
  await new Promise((resolve) => setTimeout(resolve, 60));
  assert.equal(status.textContent, "", "a load that ends within the delay is never announced");

  rerender(<Example pending />);
  assert.equal(region.className, "elea-skeleton-region mine", "without a delay the placeholders show at once");
  await waitFor(() => assert.equal(status.textContent, "Loading orders"));
});
