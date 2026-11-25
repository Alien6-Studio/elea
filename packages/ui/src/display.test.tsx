import "./test/dom.js";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import { afterEach, test } from "node:test";
import { createRef } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import axe from "axe-core";
import { Alert } from "./Alert.js";
import { Avatar, AvatarGroup } from "./Avatar.js";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./Card.js";
import { Progress } from "./Progress.js";
import { Separator } from "./Separator.js";
import { Skeleton } from "./Skeleton.js";

afterEach(cleanup);

test("Card composes a surface from its parts and hands its element to a ref", () => {
  const ref = createRef<HTMLDivElement>();
  render(
    <Card ref={ref} variant="elevated" padding="lg" interactive className="w-full" data-testid="card">
      <CardHeader className="head">
        <CardTitle as="h2"><a href="/report">Quarterly report</a></CardTitle>
        <CardDescription>Updated today</CardDescription>
      </CardHeader>
      <CardContent>Body</CardContent>
      <CardFooter>Footer</CardFooter>
    </Card>,
  );
  const card = screen.getByTestId("card");
  assert.equal(ref.current, card);
  assert.equal(card.className, "elea-card elea-card--elevated elea-card--pad-lg elea-card--interactive w-full");
  assert.equal(screen.getByRole("heading", { level: 2, name: "Quarterly report" }).className, "elea-card__title");
  assert.equal(screen.getByText("Updated today").tagName, "P");
  assert.equal(card.firstElementChild?.className, "elea-card__header head");
  assert.equal(screen.getByText("Footer").className, "elea-card__footer");
  cleanup();
  render(<Card data-testid="plain"><CardTitle>Plain</CardTitle></Card>);
  assert.equal(screen.getByTestId("plain").className, "elea-card elea-card--outline elea-card--pad-md");
  assert.equal(screen.getByRole("heading", { level: 3 }).textContent, "Plain");
});

test("Separator is decorative unless it separates content, and can carry a label", () => {
  const { container } = render(<><Separator /><Separator decorative={false} orientation="vertical" className="x" /><Separator decorative={false}>or</Separator></>);
  const [line, vertical, labelled] = Array.from(container.children);
  assert.equal(line?.getAttribute("role"), "none");
  assert.equal(line?.className, "elea-separator elea-separator--horizontal");
  assert.equal(vertical?.getAttribute("role"), "separator");
  assert.equal(vertical?.getAttribute("aria-orientation"), "vertical");
  assert.equal(vertical?.className, "elea-separator elea-separator--vertical x");
  assert.equal(labelled?.getAttribute("aria-orientation"), null);
  assert.equal(labelled?.textContent, "or");
});

test("Skeleton holds the shape of loading content and stays out of the accessibility tree", () => {
  const { container } = render(<><Skeleton /><Skeleton variant="circle" width={48} className="x" /><Skeleton variant="rect" height="8rem" style={{ margin: 4 }} /><Skeleton lines={3} width="20rem" /></>);
  const [text, circle, rect, lines] = Array.from(container.children) as HTMLElement[];
  assert.equal(text?.className, "elea-skeleton elea-skeleton--text");
  assert.equal(text?.getAttribute("aria-hidden"), "true");
  assert.equal(circle?.className, "elea-skeleton elea-skeleton--circle x");
  assert.equal(circle?.style.width, "48px");
  assert.equal(rect?.style.height, "8rem");
  assert.equal(rect?.style.margin, "4px");
  assert.equal(lines?.className, "elea-skeleton-lines");
  assert.equal(lines?.getAttribute("aria-hidden"), "true");
  assert.equal(lines?.style.width, "20rem");
  assert.equal(lines?.children.length, 3);
});

test("Avatar shows the picture, and the initials when there is none or it fails", () => {
  render(<Avatar name="Ada Lovelace" src="/ada.png" size="lg" shape="square" className="x" data-testid="ada" />);
  const picture = screen.getByRole("img", { name: "Ada Lovelace" });
  assert.equal(picture.tagName, "IMG");
  assert.equal(screen.getByTestId("ada").className, "elea-avatar elea-avatar--lg elea-avatar--square elea-avatar--neutral x");
  fireEvent.error(picture);
  const fallback = screen.getByRole("img", { name: "Ada Lovelace" });
  assert.equal(fallback.tagName, "SPAN");
  assert.equal(fallback.textContent, "AL");
  cleanup();
  render(<><Avatar name="  élodie " tone="primary" /><Avatar name="Jean Michel de la Tour" /><Avatar name="Robot"><i>R2</i></Avatar><Avatar name="" data-testid="beside" /></>);
  assert.equal(screen.getByRole("img", { name: "élodie" }).textContent, "É");
  assert.equal(screen.getByRole("img", { name: "Jean Michel de la Tour" }).textContent, "JT");
  assert.equal(screen.getByRole("img", { name: "Robot" }).textContent, "R2");
  assert.equal(screen.getByTestId("beside").getAttribute("aria-hidden"), "true");
  assert.equal(screen.getByTestId("beside").getAttribute("role"), null);
});

test("AvatarGroup counts the avatars beyond its maximum", () => {
  const people = ["Ada Lovelace", "Alan Turing", "Grace Hopper", "Edsger Dijkstra"].map((name) => <Avatar key={name} name={name} size="sm" />);
  render(<AvatarGroup aria-label="Reviewers" max={2} size="sm" className="x">{people}</AvatarGroup>);
  const group = screen.getByRole("group", { name: "Reviewers" });
  assert.equal(group.className, "elea-avatar-group x");
  assert.equal(screen.getAllByRole("img").length, 2);
  assert.equal(group.lastElementChild?.textContent, "+2");
  assert.equal(group.lastElementChild?.className, "elea-avatar elea-avatar--sm");
  cleanup();
  render(<AvatarGroup aria-label="All">{people}</AvatarGroup>);
  assert.equal(screen.getAllByRole("img").length, 4);
  assert.equal(screen.getByRole("group").children.length, 4);
});

test("Alert announces by tone, shows its parts and can be dismissed", () => {
  const ref = createRef<HTMLDivElement>();
  let dismissed = 0;
  render(
    <Alert ref={ref} tone="danger" variant="outline" title="Payment failed" icon={<i>!</i>} actions={<button type="button">Retry</button>} onDismiss={() => { dismissed += 1; }} dismissLabel="Dismiss" className="x">
      The card was declined.
    </Alert>,
  );
  const alert = screen.getByRole("alert");
  assert.equal(ref.current, alert);
  assert.equal(alert.className, "elea-alert elea-alert--danger elea-alert--outline x");
  assert.equal(alert.querySelector(".elea-alert__icon")?.getAttribute("aria-hidden"), "true");
  assert.equal(alert.querySelector(".elea-alert__title")?.textContent, "Payment failed");
  assert.ok(screen.getByRole("button", { name: "Retry" }));
  fireEvent.click(screen.getByRole("button", { name: "Dismiss" }));
  assert.equal(dismissed, 1);
  cleanup();
  render(<><Alert tone="warning">Careful</Alert><Alert>Saved</Alert><Alert tone="success" role="note">Quiet</Alert></>);
  assert.equal(screen.getByRole("alert").textContent, "Careful");
  const status = screen.getByRole("status");
  assert.equal(status.className, "elea-alert elea-alert--neutral elea-alert--subtle");
  assert.equal(status.querySelector("button, .elea-alert__title, .elea-alert__icon, .elea-alert__actions"), null);
  assert.equal(screen.getByRole("note").textContent, "Quiet");
});

test("Progress exposes its value, clamps it, words it, and travels when it is unknown", () => {
  const ref = createRef<HTMLDivElement>();
  const { rerender } = render(<Progress ref={ref} label="Upload" value={3} max={8} showValue formatValue={(value, max) => `${value} of ${max} files`} size="lg" tone="success" className="x" />);
  const bar = screen.getByRole("progressbar", { name: "Upload" });
  assert.equal(ref.current?.className, "elea-progress elea-progress--lg elea-progress--success x");
  assert.equal(bar.getAttribute("aria-valuenow"), "3");
  assert.equal(bar.getAttribute("aria-valuemax"), "8");
  assert.equal(bar.getAttribute("aria-valuetext"), "3 of 8 files");
  assert.equal(screen.getByText("3 of 8 files").className, "elea-progress__value");
  assert.equal((bar.firstElementChild as HTMLElement).style.inlineSize, "37.5%");
  rerender(<Progress aria-label="Sync" value={140} showValue />);
  const clamped = screen.getByRole("progressbar", { name: "Sync" });
  assert.equal(clamped.getAttribute("aria-valuenow"), "100");
  assert.equal(clamped.getAttribute("aria-valuetext"), null);
  assert.equal(screen.getByText("100%").className, "elea-progress__value");
  rerender(<Progress aria-label="Sync" value={-5} />);
  assert.equal(screen.getByRole("progressbar").getAttribute("aria-valuenow"), "0");
  assert.equal(screen.getByRole("progressbar").parentElement?.children.length, 1);
  rerender(<Progress aria-label="Sync" showValue />);
  const unknown = screen.getByRole("progressbar");
  assert.equal(unknown.getAttribute("aria-valuenow"), null);
  assert.equal(unknown.firstElementChild?.className, "elea-progress__bar elea-progress__bar--indeterminate");
  assert.equal(unknown.parentElement?.children.length, 1);
});

test("the display components render on the server and pass an axe audit", async () => {
  const page = (
    <main>
      <Card><CardHeader><CardTitle as="h2">Team</CardTitle><CardDescription>Who reviews</CardDescription></CardHeader>
        <CardContent>
          <AvatarGroup aria-label="Reviewers" max={1}><Avatar name="Ada Lovelace" src="/ada.png" /><Avatar name="Alan Turing" /></AvatarGroup>
          <Separator decorative={false} />
          <Skeleton lines={2} />
          <Progress label="Review" value={40} showValue />
          <Progress aria-label="Loading" />
        </CardContent>
      </Card>
      <Alert tone="primary" title="Heads up" onDismiss={() => {}} dismissLabel="Dismiss">A new version is available.</Alert>
    </main>
  );
  const html = renderToStaticMarkup(page);
  assert.match(html, /class="elea-card elea-card--outline elea-card--pad-md"/);
  assert.match(html, /role="progressbar" aria-labelledby/);
  const { container } = render(page);
  const results = await axe.run(container, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] }, rules: { "color-contrast": { enabled: false } } });
  assert.deepEqual(results.violations.map((violation) => `${violation.id}: ${violation.nodes.map((node) => node.html).join(" | ")}`), []);
});

test("every component sheet is published on its own and declared in the package exports", () => {
  const sheets = readdirSync(new URL("./css", import.meta.url)).filter((name) => name.endsWith(".css")).sort();
  const manifest = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8")) as { exports: Record<string, unknown> };
  const declared = Object.keys(manifest.exports).filter((key) => key.startsWith("./css/")).map((key) => key.slice(6)).sort();
  assert.deepEqual(declared, sheets);
  for (const name of sheets) assert.equal(manifest.exports[`./css/${name}`], `./dist/css/${name}`);
  assert.ok(sheets.includes("motion.css") && sheets.includes("button-effects.css"));
});
