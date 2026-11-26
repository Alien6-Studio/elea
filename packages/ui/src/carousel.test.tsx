import "./test/dom.js";
import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { Carousel } from "./Carousel.js";

afterEach(cleanup);

const props = { label: "Editions", controlsLabel: "Browse editions", previousLabel: "Previous edition",
  nextLabel: "Next edition", itemKey: (item: string) => item, renderItem: (item: string) => item,
  items: ["First", "Second", "Third", "Fourth"] };

test("the server renders one item and hydration adds labelled navigation without replacing it", () => {
  const carousel = <Carousel {...props} roleDescription="carrousel" heading={<h2>Editions</h2>} toolbar={<button>Filters</button>} />;
  const host = document.createElement("div");
  host.innerHTML = renderToString(carousel);
  document.body.append(host);
  const original = host.querySelector(".elea-carousel__slide");
  assert.equal(original?.textContent, "First");
  assert.equal(host.querySelector("button"), null);
  const errors: unknown[] = [];
  render(carousel, { container: host, hydrate: true, onRecoverableError: error => errors.push(error) });
  assert.deepEqual(errors, []);
  assert.equal(screen.getByRole("region", { name: "Editions" }).getAttribute("aria-roledescription"), "carrousel");
  assert.equal(host.querySelector(".elea-carousel__slide"), original);
  const next = screen.getByRole("button", { name: "Next edition" });
  assert.ok(document.getElementById(next.getAttribute("aria-controls")!)?.contains(original));
  assert.ok(screen.getByRole("button", { name: "Filters" }));
  assert.ok(screen.getByRole("group", { name: "Browse editions" }));
  const previous = screen.getByRole("button", { name: "Previous edition" });
  assert.equal(previous.getAttribute("aria-disabled"), "true");
  fireEvent.click(previous);
  assert.equal(screen.getByRole("status").textContent, "1 / 4");
  next.focus();
  fireEvent.click(next);
  assert.equal(screen.getByRole("status").textContent, "2 / 4");
  fireEvent.keyDown(next, { key: "End" });
  assert.equal(document.activeElement, next);
  assert.equal(next.getAttribute("aria-disabled"), "true");
  fireEvent.keyDown(next, { key: "Home" });
  fireEvent.keyDown(next, { key: "ArrowRight", ctrlKey: true });
  fireEvent.keyDown(next, { key: "a" });
  assert.equal(screen.getByRole("status").textContent, "1 / 4");
});

test("controlled and looping collections respect RTL, host updates and changes in item count", () => {
  const changes: number[] = [];
  const carousel = <Carousel {...props} loop index={0} onIndexChange={index => changes.push(index)} />;
  const { rerender } = render(carousel);
  const navigation = screen.getByRole("group", { name: "Browse editions" });
  navigation.style.direction = "rtl";
  const next = screen.getByRole("button", { name: "Next edition" });
  fireEvent.keyDown(next, { key: "ArrowRight" });
  fireEvent.keyDown(next, { key: "ArrowLeft" });
  assert.deepEqual(changes, [3, 1]);
  assert.equal(screen.getByRole("status").textContent, "1 / 4");
  rerender(<Carousel {...props} loop index={3} />);
  assert.equal(screen.getByRole("status").textContent, "4 / 4");
  rerender(<Carousel {...props} items={["Only"]} index={3} />);
  assert.equal(screen.queryByRole("button"), null);
  assert.ok(screen.getByText("Only"));
  rerender(<Carousel {...props} items={[]} />);
  assert.equal(screen.queryByRole("region"), null);
  rerender(<Carousel {...props} index={NaN} />);
  assert.ok(screen.getByText("First"));
});

test("resetting the surrounding form keeps the live position in sync with its slide", () => {
  const { container } = render(<form><Carousel {...props} /></form>);
  fireEvent.click(screen.getByRole("button", { name: "Next edition" }));
  container.querySelector("form")!.reset();
  assert.equal(screen.getByRole("status").textContent, "2 / 4");
  assert.ok(screen.getByText("Second"));
});

test("a responsive strip moves focus between actions without selecting them", async () => {
  const picked: string[] = [];
  const strip = <Carousel {...props} minItemWidth={160}
    renderItem={item => <button onClick={() => picked.push(item)}>{item}</button>} />;
  const { container } = render(strip);
  const viewport = container.querySelector<HTMLElement>(".elea-carousel__viewport")!;
  let width = 330;
  Object.defineProperty(viewport, "clientWidth", { get: () => width });
  viewport.style.columnGap = "10px";
  fireEvent(window, new window.Event("resize"));
  assert.equal(screen.getByRole("status").textContent, "1–2 / 4");
  const first = screen.getByRole("button", { name: "First" });
  first.focus();
  fireEvent.keyDown(first, { key: "ArrowRight" });
  const second = screen.getByRole("button", { name: "Second" });
  assert.ok(document.activeElement === second, "focus moves to the neighbouring slide");
  fireEvent.keyDown(second, { key: "End" });
  const fourth = screen.getByRole("button", { name: "Fourth" });
  await waitFor(() => assert.ok(document.activeElement === fourth, "focus follows the newly visible slide"));
  assert.deepEqual(picked, []);
  fireEvent.click(fourth);
  assert.deepEqual(picked, ["Fourth"]);
  width = 800;
  act(() => window.dispatchEvent(new window.Event("resize")));
  assert.equal(screen.queryByRole("group"), null);
  assert.equal(container.querySelectorAll(".elea-carousel__slide").length, 4);
});

function pointer(node: Element, type: string, x: number, y: number, pointerType = "touch") {
  const event = new window.Event(type, { bubbles: true });
  Object.assign(event, { pointerId: 4, pointerType, isPrimary: true, clientX: x, clientY: y });
  fireEvent(node, event);
}

test("horizontal swipes navigate without activating an action and vertical gestures leave the slide in place", () => {
  const picked: string[] = [];
  render(<Carousel {...props} renderItem={item => <button onClick={() => picked.push(item)}>{item}</button>} />);
  const first = screen.getByRole("button", { name: "First" });
  pointer(first, "pointerdown", 100, 0);
  pointer(first, "pointerup", 90, 160);
  assert.ok(screen.getByText("First"));
  pointer(first, "pointerdown", 100, 0);
  pointer(first, "pointercancel", 70, 0);
  pointer(first, "pointerup", 20, 0);
  assert.ok(screen.getByText("First"));
  pointer(first, "pointerdown", 100, 0);
  pointer(first, "pointerup", 20, 0);
  const second = screen.getByRole("button", { name: "Second" });
  fireEvent.click(second, { detail: 1 });
  assert.deepEqual(picked, []);
  pointer(second, "pointerdown", 12, 5);
  pointer(second, "pointerup", 12, 5);
  fireEvent.click(second, { detail: 1 });
  assert.deepEqual(picked, ["Second"]);
  pointer(second, "pointerdown", 100, 0);
  pointer(second, "pointerup", 20, 0);
  const third = screen.getByRole("button", { name: "Third" });
  pointer(third, "pointerdown", 12, 5, "mouse");
  pointer(third, "pointerup", 12, 5, "mouse");
  fireEvent.click(third, { detail: 1 });
  assert.deepEqual(picked, ["Second", "Third"]);
  third.closest<HTMLElement>(".elea-carousel__viewport")!.dir = "rtl";
  pointer(third, "pointerdown", 20, 0);
  pointer(third, "pointerup", 100, 0);
  assert.ok(screen.getByText("Fourth"));
});

test("embedded controls retain their own arrow keys and touch gestures", () => {
  render(<Carousel {...props} renderItem={item => <input type="range" aria-label={item} />} />);
  const slider = screen.getByRole("slider", { name: "First" });
  assert.ok(fireEvent.keyDown(slider, { key: "ArrowRight" }));
  pointer(slider, "pointerdown", 150, 0);
  pointer(slider, "pointerup", 30, 0);
  assert.equal(screen.getByRole("status").textContent, "1 / 4");
});

test("dot navigation keeps distant positions reachable and a single dot in the tab order", async () => {
  const items = Array.from({ length: 40 }, (_, index) => String(index));
  const { container } = render(<Carousel {...props} items={items} navigation="dots" defaultIndex={17}
    controlsPosition="bottom" controlsAlign="center" getDotLabel={index => `Show item ${index + 1}`} />);
  const group = screen.getByRole("group");
  assert.ok(container.querySelector(".elea-carousel__viewport + .elea-carousel__footer")?.contains(group));
  assert.equal(group.dataset.align, "center");
  assert.equal(screen.getByRole("status").dataset.visible, "false");
  assert.equal(screen.getAllByRole("button").length, 5);
  assert.deepEqual(screen.getAllByRole("button").filter(button => button.tabIndex === 0), [screen.getByRole("button", { current: true })]);
  const current = screen.getByRole("button", { name: "Show item 18" });
  current.focus();
  group.style.direction = "rtl";
  fireEvent.keyDown(current, { key: "ArrowLeft" });
  const next = screen.getByRole("button", { name: "Show item 19", current: true });
  await waitFor(() => assert.ok(document.activeElement === next));
  fireEvent.keyDown(next, { key: "End" });
  const last = screen.getByRole("button", { name: "Show item 40", current: true });
  await waitFor(() => assert.ok(document.activeElement === last));
  fireEvent.click(screen.getByRole("button", { name: "Show item 1" }));
  assert.equal(screen.getByRole("status").textContent, "1 / 40");
});

test("fixed counts cap responsive rows and combined controls identify the actual range", () => {
  const carousel = <Carousel {...props} itemsPerView={2} gap="lg" navigation="both" showCounter />;
  const host = document.createElement("div");
  host.innerHTML = renderToString(carousel);
  assert.equal(host.querySelectorAll(".elea-carousel__slide").length, 2);
  const { container, rerender } = render(carousel);
  const viewport = container.querySelector<HTMLElement>(".elea-carousel__viewport")!;
  assert.equal(viewport.dataset.gap, "lg");
  assert.equal(screen.getByRole("status").dataset.visible, "true");
  fireEvent.click(screen.getByRole("button", { name: "3–4 / 4" }));
  assert.equal(screen.getByRole("status").textContent, "3–4 / 4");
  fireEvent.click(screen.getByRole("button", { name: "Previous edition" }));
  assert.equal(screen.getByRole("button", { current: true }).getAttribute("aria-label"), "2–3 / 4");
  let width = 800;
  Object.defineProperty(viewport, "clientWidth", { get: () => width });
  rerender(<Carousel {...props} itemsPerView={2} minItemWidth={160} />);
  assert.equal(viewport.children.length, 2);
  width = 220;
  fireEvent(window, new window.Event("resize"));
  assert.equal(viewport.children.length, 1);
});
