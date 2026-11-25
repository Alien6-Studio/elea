import { expect, test, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const PIXEL = fileURLToPath(new URL("./pixel.png", import.meta.url));

const editorPane = (page: Page) => page.getByTestId("editor-pane");
const commands = (page: Page) => editorPane(page).getByRole("button", { name: /^Editor mode/ });
async function chooseMode(page: Page, name: string) {
  await commands(page).click();
  await editorPane(page).getByRole("menuitemradio", { name, exact: true }).click();
}
const add = (page: Page) => editorPane(page).locator(".elea-content-editor__add, .elea-doc-toolbar").getByRole("button", { name: "Add a block" });
const viewerPane = (page: Page) => page.getByTestId("viewer-pane");
/** Picks an option of an Elea select, by its trigger and the option's label. */
const pick = async (trigger: ReturnType<Page["locator"]>, option: string) => {
  await trigger.click();
  await trigger.page().getByRole("option", { name: option }).click();
};
const firstParagraph = (page: Page) => editorPane(page).locator('[data-elea-block-id="intro"] [contenteditable="true"]');

/** Selects a character range of the editable's visible text, across its text nodes, as a mouse drag would. */
async function selectInEditable(page: Page, locator: ReturnType<Page["locator"]>, start: number, end: number) {
  await locator.evaluate(
    (element, range) => {
      const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
      const positions: { node: Text; from: number }[] = [];
      let total = 0;
      for (let node = walker.nextNode() as Text | null; node; node = walker.nextNode() as Text | null) {
        positions.push({ node, from: total });
        total += node.data.length;
      }
      const locate = (offset: number) => {
        const entry = [...positions].reverse().find((candidate) => candidate.from <= offset) ?? positions[0];
        if (!entry) throw new Error("no text to select");
        return { node: entry.node, offset: Math.min(offset - entry.from, entry.node.data.length) };
      };
      const first = locate(range.start);
      const last = locate(range.end);
      const selection = window.getSelection() as Selection;
      const domRange = document.createRange();
      domRange.setStart(first.node, first.offset);
      domRange.setEnd(last.node, last.offset);
      selection.removeAllRanges();
      selection.addRange(domRange);
    },
    { start, end },
  );
}

test.beforeEach(async ({ page }) => {
  // A static frame keeps the video provider's overlays from taking keyboard focus.
  await page.route("https://www.youtube.com/embed/**", (route) => route.fulfill({ contentType: "text/html", body: "<!doctype html>" }));
  await page.goto("/elea/playground/");
  await expect(page.getByRole("heading", { name: "Editorial workspace" })).toBeVisible();
  await pick(page.getByRole("combobox", { name: "Document", exact: true }), "Block reference");
});

test("the sample document renders in both panes", async ({ page }) => {
  await expect(viewerPane(page).locator(".elea-content .elea-block")).toHaveCount(14);
  await expect(viewerPane(page).getByRole("heading", { name: "Every block type" })).toBeVisible();
  await expect(editorPane(page).locator("[data-elea-block-id]")).toHaveCount(14);
  await expect(viewerPane(page).locator(".elea-table")).toBeVisible();
  const external = viewerPane(page).locator('a[href="https://github.com/Alien6-Studio/elea"]');
  await expect(external).toHaveAttribute("target", "_blank");
  await expect(viewerPane(page).locator('a[href="/elea/content/"]')).not.toHaveAttribute("target", "_blank");
});

test("the mode menu takes the place of history on a narrow screen and returns focus to the pencil", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  const pane = editorPane(page);
  const trigger = commands(page);
  const undo = pane.getByRole("button", { name: /Undo/ });
  const redo = pane.getByRole("button", { name: /Redo/ });
  await trigger.focus();
  const origin = await undo.boundingBox();
  await trigger.press("Enter");
  const menu = pane.getByRole("menu", { name: "Editor mode" });
  const writing = menu.getByRole("menuitemradio", { name: "Writing", checked: true });
  const options = menu.getByRole("menuitemradio");
  await expect(writing).toBeFocused();
  await expect(menu).toHaveAttribute("aria-orientation", "horizontal");
  await expect(options).toHaveCount(4);
  await expect(menu.getByRole("menuitem")).toHaveCount(0);
  await expect(undo).toHaveCount(0);
  await expect(redo).toHaveCount(0);
  const bounds = await menu.boundingBox();
  expect(bounds!.x).toBeCloseTo(origin!.x);
  expect(bounds!.y).toBeCloseTo(origin!.y);
  expect(bounds!.height).toBe(origin!.height);
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(320);
  for (const option of await options.all()) {
    const box = await option.boundingBox();
    expect(box!.y).toBeCloseTo(bounds!.y);
    expect(box!.height).toBe(bounds!.height);
    expect(box!.x + box!.width).toBeLessThanOrEqual(bounds!.x + bounds!.width + 1);
  }
  await writing.press("ArrowRight");
  await expect(menu.getByRole("menuitemradio", { name: "Toolbar" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(menu).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(undo).toBeVisible();
  await expect(redo).toBeVisible();
  expect(await undo.boundingBox()).toEqual(origin);
});

test("the pencil releases a second drop before the menu unfolds horizontally", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const trigger = commands(page);
  await expect(trigger).toHaveText("");
  const sizes = await trigger.evaluate(async button => {
    const root = button.parentElement!;
    const surface = root.querySelector<HTMLElement>(".elea-add-block__surface")!;
    const origin = surface.getBoundingClientRect();
    (button as HTMLButtonElement).click();
    await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
    const tracks = root.getAnimations({ subtree: true });
    const sample = (time: number) => {
      for (const track of tracks) { track.pause(); track.currentTime = time; }
      const shape = surface.getBoundingClientRect();
      const drop = root.querySelector(".elea-add-block__drop")!.getBoundingClientRect();
      return { offset: Math.abs(shape.x - origin.x), drop: Math.abs(drop.x - origin.x), width: shape.width, height: shape.height };
    };
    const contracted = sample(55);
    const neck = sample(180);
    const extended = sample(252);
    for (const track of tracks) track.finish();
    return { diameter: origin.width, contracted, neck, extended, fill: getComputedStyle(surface).backgroundColor };
  });
  expect(sizes.fill).toBe(await editorPane(page).locator(".elea-media-block__actions button").first().evaluate(el => getComputedStyle(el).backgroundColor));
  expect(sizes.contracted.width).toBeLessThan(sizes.diameter * 0.85);
  expect(sizes.neck.width).toBeCloseTo(sizes.diameter);
  expect(sizes.neck.offset).toBeGreaterThan(sizes.diameter * 0.65);
  expect(sizes.neck.drop).toBeCloseTo(sizes.neck.offset);
  expect(sizes.extended.width).toBeGreaterThan(sizes.diameter * 2);
  expect(sizes.extended.height).toBeCloseTo(sizes.diameter);
  const menu = editorPane(page).getByRole("menu", { name: "Editor mode" });
  const surface = trigger.locator("..").locator(".elea-add-block__surface");
  const panel = await menu.boundingBox();
  expect((await surface.boundingBox())!.width).toBeCloseTo(panel!.width);
  await expect(surface).toHaveCSS("border-radius", `${sizes.diameter / 2}px`);
  const history = editorPane(page).locator(".elea-doc-toolbar__group--history");
  await expect(history).toBeHidden();
  await page.keyboard.press("Escape");
  await expect(history).toBeHidden();
  await expect(history).toBeVisible();
  expect((await surface.boundingBox())!.width).toBeCloseTo(sizes.diameter);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await trigger.click();
  await expect(menu.getByRole("menuitemradio", { name: "Writing" })).toBeFocused();
  expect(await trigger.evaluate(button => button.parentElement!.getAnimations({ subtree: true }).length)).toBe(0);
  expect((await surface.boundingBox())!.width).toBeCloseTo(panel!.width);
});

test("the opaque heading list stays above the text and inside either edge of the viewport", async ({ page }) => {
  const heading = editorPane(page).locator('[data-elea-block-id="heading"]');
  const picker = heading.getByRole("combobox", { name: "Heading" });
  await page.setViewportSize({ width: 1366, height: 760 });
  await picker.evaluate(button => window.scrollBy({ top: button.getBoundingClientRect().bottom - innerHeight + 12, behavior: "instant" }));
  await heading.hover();
  await picker.click();
  const list = heading.getByRole("listbox");
  await expect(list).toHaveAttribute("data-above", "");
  const upper = await list.boundingBox();
  expect(upper!.y).toBeGreaterThanOrEqual(0);
  expect(upper!.y + upper!.height).toBeLessThanOrEqual((await picker.boundingBox())!.y);
  await picker.evaluate(button => window.scrollBy({ top: button.getBoundingClientRect().top - 100, behavior: "instant" }));
  await expect(list).not.toHaveAttribute("data-above", "");
  const options = heading.getByRole("option");
  await expect(options).toHaveCount(6);
  const visible = await options.evaluateAll(items => items.every(item => {
    const rect = item.getBoundingClientRect();
    const hit = document.elementFromPoint(rect.x + rect.width / 2, rect.y + rect.height / 2);
    return item.contains(hit) && getComputedStyle(item.closest(".elea-ui-select")!).opacity === "1";
  }));
  expect(visible).toBe(true);
  await heading.getByRole("option", { name: "H4" }).click();
  await expect(viewerPane(page).getByRole("heading", { name: "Every block type", level: 4 })).toBeVisible();
});

test("history uses the same neutral disc as the media and keeps a single pair in every mode", async ({ page }) => {
  const pane = editorPane(page);
  const undo = pane.getByRole("button", { name: /Undo/ });
  const redo = pane.getByRole("button", { name: /Redo/ });
  const media = pane.locator(".elea-media-block__actions button").first();
  const reference = await media.evaluate(el => getComputedStyle(el).backgroundColor);
  for (const mode of ["Writing", "Toolbar", "Classic", "Markdown"]) {
    await chooseMode(page, mode);
    const header = pane.locator(".elea-content-editor__mode");
    const [pencil, back, forward] = await Promise.all([commands(page), undo, redo].map(button => button.boundingBox()));
    expect(pencil!.x).toBeCloseTo((await header.boundingBox())!.x);
    expect(back!.x - (pencil!.x + pencil!.width)).toBeGreaterThanOrEqual(0);
    expect(back!.x - (pencil!.x + pencil!.width)).toBeLessThan(12);
    expect(forward!.x - back!.x).toBeCloseTo(back!.x - pencil!.x);
    expect(forward!.y).toBeCloseTo(pencil!.y);
    for (const disc of [undo, redo]) {
      await expect(disc).toHaveCount(1);
      await expect(disc).toHaveCSS("background-color", reference);
      const box = await disc.boundingBox();
      expect(box!.width).toBe(44);
      expect(box!.height).toBe(box!.width);
    }
  }
  const source = pane.getByRole("textbox", { name: "Markdown source" });
  const before = await source.inputValue();
  await source.fill(before + "\n\nDraft");
  await undo.click();
  await expect(source).toHaveValue(before);
  await redo.click();
  await expect(source).toHaveValue(before + "\n\nDraft");
});

test("typing in a paragraph updates the viewer", async ({ page }) => {
  const editable = firstParagraph(page);
  await editable.click();
  await page.keyboard.press("End");
  await page.keyboard.type(" Typed live.");
  await expect(viewerPane(page).locator('[data-elea-block-id="intro"]')).toContainText("Typed live.");
});

test("Toolbar inserts directly after the active block and appends when no block is active", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await chooseMode(page, "Toolbar");
  const pane = editorPane(page);
  const insert = pane.getByRole("group", { name: "Insert", exact: true });
  const actions = insert.getByRole("button", { name: /^Add / });
  await expect(actions).toHaveCount(7);
  const buttonsFit = await actions.evaluateAll(buttons => buttons.every(button => {
    const rect = button.getBoundingClientRect();
    return rect.left >= 0 && rect.right <= innerWidth && rect.height >= 24;
  }));
  expect(buttonsFit).toBe(true);
  await expect(pane.getByRole("button", { name: "Add a block" })).toHaveCount(0);
  const blocks = pane.locator("[data-elea-block-id]");
  const original = await blocks.count();
  const addQuote = insert.getByRole("button", { name: "Add Quote" });
  await addQuote.focus();
  await addQuote.press("Enter");
  await expect(blocks).toHaveCount(original + 1);
  await expect(blocks.last()).toHaveAttribute("data-elea-block-type", "quote");
  await firstParagraph(page).click();
  await insert.getByRole("button", { name: "Add Paragraph" }).click();
  const added = blocks.nth(1);
  await expect(added.getByRole("textbox")).toBeFocused();
  await expect(pane.getByRole("button", { name: "Add a block" })).toHaveCount(0);
  await insert.getByRole("button", { name: "Add List" }).click();
  await expect(blocks.nth(2)).toHaveAttribute("data-elea-block-type", "list");
  await expect(blocks.nth(2).getByRole("textbox").first()).toBeFocused();
  await expect(pane.getByRole("button", { name: "Indent list items" })).toBeEnabled();
  await expect(page.locator("[data-elea-bubble]")).toHaveCount(0);
});

test("the toolbar formats the selection and creates links across appearance changes", async ({ page }) => {
  const desk = page.locator(".workspace-desk");
  await desk.evaluate((element) => {
    element.setAttribute("data-elea-theme", "editorial");
    element.setAttribute("data-elea-appearance", "dark");
  });
  await chooseMode(page, "Toolbar");
  await page.getByTestId("reset").click();
  const editable = editorPane(page).locator('[contenteditable="true"]').first();
  await editable.click();
  await page.keyboard.type("Hello world from the playground");
  await selectInEditable(page, editable, 0, 5);
  await expect(page.locator("[data-elea-bubble]")).toHaveCount(0);
  await expect(editorPane(page).getByRole("toolbar")).toHaveCount(1);
  await editorPane(page).getByRole("button", { name: "Bold (Ctrl+B)" }).click();
  await expect(viewerPane(page).locator(".elea-paragraph strong")).toHaveText("Hello");

  await selectInEditable(page, editable, 6, 11);
  await editorPane(page).getByRole("button", { name: "Link (Ctrl+K)" }).click();
  const dialog = page.getByRole("dialog", { name: "Enter the link URL:" });
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAttribute("data-elea-theme", "editorial");
  await expect(dialog).toHaveCSS("color-scheme", "dark");
  const url = dialog.getByRole("textbox");
  await expect(url).toBeFocused();
  await url.fill("example.org");
  await desk.evaluate((element) => {
    element.setAttribute("data-elea-theme", "obsidian");
    element.setAttribute("data-elea-appearance", "light");
  });
  await expect(dialog).toHaveAttribute("data-elea-theme", "obsidian");
  await expect(dialog).toHaveCSS("color-scheme", "light");
  await expect(url).toBeFocused();
  await expect(url).toHaveValue("example.org");
  await page.keyboard.type("/page");
  await page.keyboard.press("Enter");
  await expect(editable).toBeFocused();
  const link = viewerPane(page).locator('.elea-paragraph a[href="https://example.org/page"]');
  await expect(link).toHaveText("world");
  await expect(link).toHaveAttribute("rel", "noopener noreferrer");

  await selectInEditable(page, editable, 0, 5);
  await editorPane(page).getByRole("button", { name: "Link (Ctrl+K)" }).click();
  await page.getByRole("dialog").getByRole("textbox").fill("javascript:alert(1)");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("alert")).toContainText("Only http:// and https:// links are allowed");
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("One Enter breaks the line, a second starts a paragraph, and Backspace merges it", async ({ page }) => {
  await page.getByTestId("reset").click();
  const editable = editorPane(page).locator('[contenteditable="true"]').first();
  await editable.click();
  await page.keyboard.type("First part|second part");
  await selectInEditable(page, editable, 10, 10);
  await page.keyboard.press("Enter");
  await expect(editorPane(page).locator("[data-elea-block-id]")).toHaveCount(1);
  await expect(viewerPane(page).locator(".elea-paragraph br")).toHaveCount(1);
  await page.keyboard.press("Enter");
  await expect(editorPane(page).locator("[data-elea-block-id]")).toHaveCount(2);
  const paragraphs = viewerPane(page).locator(".elea-paragraph");
  await expect(paragraphs.nth(0)).toHaveText("First part");
  await expect(paragraphs.nth(1)).toHaveText("|second part");
  await expect(editorPane(page).locator('[contenteditable="true"]').nth(1)).toBeFocused();
  await page.keyboard.press("Backspace");
  await expect(editorPane(page).locator("[data-elea-block-id]")).toHaveCount(1);
  await expect(paragraphs.nth(0)).toHaveText("First part|second part");
  await expect(editable).toBeFocused();
  await page.keyboard.type("+");
  await expect(paragraphs.nth(0)).toHaveText("First part+|second part");
});

test("a mouse drag across blocks selects them, Delete removes them", async ({ page }) => {
  const editor = editorPane(page);
  const blocks = editor.locator("[data-elea-block-id]");
  const title = editor.getByRole("textbox", { name: "Your content title..." });
  const titleOffset = () => title.evaluate((element) => (element as HTMLElement).offsetTop);
  const initialTitleTop = await titleOffset();
  const first = blocks.nth(1);
  const third = blocks.nth(3);
  const from = await first.boundingBox();
  const to = await third.boundingBox();
  if (!from || !to) throw new Error("blocks must be laid out");
  await page.mouse.move(from.x + 40, from.y + from.height / 2);
  await page.mouse.down();
  await page.mouse.move(to.x + 40, to.y + to.height / 2, { steps: 8 });
  await page.mouse.up();
  const selected = editor.locator(".elea-block-editor--selected");
  await expect(selected).toHaveCount(3);
  const toolbar = editor.locator(".elea-block-slot:has(> .elea-block-editor--selected)").first().getByRole("toolbar", { name: "3 blocks selected" });
  await expect(toolbar).toBeVisible();
  await expect(toolbar).toHaveClass(/\belea-toolbar\b/);
  expect(await titleOffset()).toBe(initialTitleTop);
  const highlights = await selected.locator(".elea-block-editor__card").evaluateAll((cards) => cards.map((card) => {
    const rect = card.getBoundingClientRect();
    const style = getComputedStyle(card, "::before");
    return { top: rect.top + parseFloat(style.top), bottom: rect.bottom - parseFloat(style.bottom) };
  }));
  expect(highlights[0]!.bottom).toBeLessThan(highlights[1]!.top);
  expect(highlights[1]!.bottom).toBeLessThan(highlights[2]!.top);
  await page.keyboard.press("Delete");
  await expect(blocks).toHaveCount(11);
  await expect(editorPane(page).locator(".elea-block-editor--selected")).toHaveCount(0);
});

test("the add menu unfolds as a single-row pill that stays inside the editor", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const width of [1280, 360]) {
    await page.setViewportSize({ width, height: 844 });
    await add(page).click();
    const menu = editorPane(page).getByRole("menu", { name: "Available block types" });
    await expect(menu).toHaveAttribute("aria-orientation", "horizontal");
    const bounds = (await menu.boundingBox())!;
    const trigger = (await add(page).boundingBox())!;
    const editor = (await editorPane(page).locator(".elea-content-editor").boundingBox())!;
    expect(bounds.height).toBeGreaterThanOrEqual(32);
    expect(bounds.y + bounds.height / 2).toBeCloseTo(trigger.y + trigger.height / 2, 0);
    expect(bounds.x + bounds.width).toBeLessThanOrEqual(editor.x + editor.width);
    expect(await menu.evaluate((node) => getComputedStyle(node).borderRadius)).toBe(`${bounds.height / 2}px`);
    for (const item of await menu.getByRole("menuitem").all()) {
      const box = (await item.evaluate((node) => { const rect = node.getBoundingClientRect(); return { y: rect.y, height: rect.height }; }));
      expect(box.y).toBeCloseTo(bounds.y, 0);
      expect(box.height).toBeCloseTo(bounds.height, 0);
    }
    // Arrow keys reach the types that wait beyond the edge of the pill.
    await page.keyboard.press("End");
    await expect(menu.getByRole("menuitem").last()).toBeFocused();
    await expect(menu.getByRole("menuitem").last()).toBeInViewport();
    await page.keyboard.press("Escape");
    await expect(add(page)).toBeFocused();
  }
});

test("on a narrow screen the plus of an empty paragraph stands alone, inside the editor", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await add(page).click();
  await editorPane(page).getByRole("menuitem", { name: "Paragraph" }).click();
  const gutter = editorPane(page).locator(".elea-block-editor--focused .elea-block-editor__gutter");
  const plus = gutter.getByRole("button", { name: "Add a block" });
  await expect(plus).toBeVisible();
  await expect(gutter.locator(".elea-block-editor__grip")).toBeHidden();
  const editor = (await editorPane(page).locator(".elea-content-editor").boundingBox())!;
  expect((await plus.boundingBox())!.x).toBeGreaterThanOrEqual(editor.x);
  await plus.click();
  const menu = (await editorPane(page).getByRole("menu", { name: "Available block types" }).boundingBox())!;
  expect(menu.x + menu.width).toBeLessThanOrEqual(editor.x + editor.width);
});

test("blocks are added from the menu and lists grow with Enter", async ({ page }) => {
  await page.getByTestId("reset").click();
  await add(page).click();
  await editorPane(page).getByRole("menuitem", { name: "List" }).click();
  const list = editorPane(page).getByRole("textbox", { name: "List item..." });
  await expect(list).toBeFocused();
  await page.keyboard.type("one");
  await page.keyboard.press("Enter");
  await page.keyboard.type("two");
  await expect(list.locator("li")).toHaveCount(2);
  await expect(viewerPane(page).locator(".elea-list .elea-list__item")).toHaveText(["one", "two"]);
  // Text selects across items and takes the marks; Tab nests the item
  await page.keyboard.press("Shift+ArrowUp");
  await page.keyboard.press("Shift+Home");
  await page.locator("[data-elea-bubble]").getByRole("button", { name: "Bold (Ctrl+B)" }).click();
  await expect(viewerPane(page).locator(".elea-list .elea-list__item strong")).toHaveCount(2);
  await selectInEditable(page, list.getByRole("listitem").last(), 3, 3);
  await page.keyboard.press("Tab");
  await expect(viewerPane(page).locator(".elea-list .elea-list .elea-list__item")).toHaveText(["two"]);

  await add(page).click();
  await editorPane(page).getByRole("menuitem", { name: "Heading" }).click();
  await editorPane(page).getByRole("textbox", { name: "Heading..." }).fill("A title");
  await pick(editorPane(page).getByRole("combobox", { name: "Heading" }), "H3");
  await expect(viewerPane(page).getByRole("heading", { level: 3, name: "A title" })).toBeVisible();
});

test("the list toolbar changes the selected sublist and moves its selected items together", async ({ page }) => {
  const editor = editorPane(page).locator('[data-elea-block-id="list"]');
  const viewer = viewerPane(page).locator('[data-elea-block-id="list"]');
  const nested = editor.locator("li > ol");
  const itemText = (await nested.textContent()) ?? "";
  await editor.getByRole("textbox", { name: "List item..." }).focus();
  await selectInEditable(page, nested, 0, itemText.length);
  const toolbar = page.locator("[data-elea-bubble]");
  const nestedList = viewer.locator(".elea-list--level-1");
  await toolbar.getByRole("button", { name: "Square bullets" }).click();
  await expect(nestedList).toHaveCSS("list-style-type", "square");
  await expect(viewer.locator(".elea-list--level-0")).toHaveCSS("list-style-type", "disc");
  await toolbar.getByRole("button", { name: "Numbers" }).click();
  await expect(nestedList).toHaveCSS("list-style-type", "decimal");
  await expect(nestedList.locator(":scope > li")).toHaveText(["Second level", "Still synthetic"]);

  await toolbar.getByRole("button", { name: "Outdent list items" }).click();
  await expect(nestedList).toHaveCount(0);
  await expect(viewer.locator(".elea-list--level-0 > li")).toHaveText([
    "Paragraphs with rich text", "Nested lists", "Second level", "Still synthetic", "Quotes, images, videos, attachments",
  ]);
  await toolbar.getByRole("button", { name: "Indent list items" }).click();
  await expect(nestedList.locator(":scope > li")).toHaveText(["Second level", "Still synthetic"]);
  await toolbar.getByRole("button", { name: "Roman numerals" }).click();
  await expect(nestedList).toHaveCSS("list-style-type", "lower-roman");

  await chooseMode(page, "Markdown");
  await expect(editorPane(page).getByRole("textbox", { name: "Markdown source" })).toHaveValue(/Second level/);
  await chooseMode(page, "Writing");
  await expect(editor.locator("ol.elea-list-marker-lower-roman")).toHaveCSS("list-style-type", "lower-roman");
});

test("the toolbar and Shift+Tab turn first-level items into paragraphs", async ({ page }) => {
  const editor = editorPane(page).locator('[data-elea-block-id="list"]');
  const list = editorPane(page).getByRole("textbox", { name: "List item..." }).first();
  const items = list.locator(":scope > ul > li");
  await list.focus();
  await selectInEditable(page, items.first(), 0, 0);
  await page.keyboard.press("Shift+Tab");
  await expect(editor).toHaveAttribute("data-elea-block-type", "paragraph");
  await expect(editor.getByRole("textbox")).toBeFocused();

  const lastItem = "Quotes, images, videos, attachments";
  await list.focus();
  await selectInEditable(page, items.last(), 0, lastItem.length);
  await page.locator("[data-elea-bubble]").getByRole("button", { name: "Outdent list items" }).click();
  const viewer = viewerPane(page);
  await expect(viewer.locator('[data-elea-block-id="list"]')).toHaveText("Paragraphs with rich text");
  await expect(viewer.locator(".elea-paragraph").filter({ hasText: lastItem })).toBeVisible();
  await expect(viewer.locator(".elea-list--level-1 > li")).toHaveText(["Second level", "Still synthetic"]);
});

test("a checklist keeps the state of its tasks while a label is edited, and a box is ticked in the editor", async ({ page }) => {
  const editor = editorPane(page).locator('[data-elea-block-id="checklist"]');
  const boxes = viewerPane(page).locator('[data-elea-block-id="checklist"] input[type="checkbox"]');
  const states = () => boxes.evaluateAll((all) => all.map((box) => (box as HTMLInputElement).checked));
  await expect(boxes).toHaveCount(3);
  expect(await states()).toEqual([true, true, false]);

  const tasks = editor.locator("li");
  await selectInEditable(page, tasks.first(), 0, 0);
  await page.keyboard.type("Always ");
  await expect(viewerPane(page).locator('[data-elea-block-id="checklist"] li').first()).toHaveText("Always Read the state of each task");
  expect(await states()).toEqual([true, true, false]);

  // The box sits in the margin of the task: a press there ticks it, and Ctrl+Enter does from the keyboard
  await tasks.last().click({ position: { x: 8, y: 8 } });
  await expect.poll(states).toEqual([true, true, true]);
  await selectInEditable(page, tasks.last(), 0, 0);
  await page.keyboard.press("ControlOrMeta+Enter");
  await expect.poll(states).toEqual([true, true, false]);

  await page.getByRole("tab", { name: "JSON", exact: true }).click();
  const json = JSON.parse(await page.getByTestId("document-json").textContent() ?? "{}") as { blocks: { id: string; data: { style?: string; items?: { meta?: { checked?: boolean } }[] } }[] };
  const saved = json.blocks.find((block) => block.id === "checklist")?.data;
  expect(saved?.style).toBe("checklist");
  expect(saved?.items?.map((item) => item.meta?.checked)).toEqual([true, true, false]);
});

test("images upload through the host service and attachments come from the picker", async ({ page }) => {
  await page.getByTestId("reset").click();
  await add(page).click();
  await editorPane(page).getByRole("menuitem", { name: "Image" }).click();
  await editorPane(page).locator('input[type="file"]').first().setInputFiles(PIXEL);
  // The picture is framed before it goes up; the export comes out of a canvas as PNG
  await expect(editorPane(page).getByRole("img", { name: "Picture to frame" })).toBeVisible();
  await editorPane(page).getByRole("button", { name: "Use this image" }).click();
  // The host says what it is doing; the phase is announced through the live region
  await expect(editorPane(page).getByRole("status").filter({ hasText: "Checking the picture…" })).toBeAttached();
  await expect(editorPane(page).locator(".elea-media-block__image")).toHaveAttribute("src", /^data:image\/png/);
  await editorPane(page).getByRole("textbox", { name: "Image caption..." }).fill("A pixel");
  await expect(viewerPane(page).locator(".elea-caption")).toHaveText("A pixel");
  // Removing the picture brings the drop zone back, the caption kept for the next one
  await editorPane(page).locator(".elea-media-block__image").hover();
  await editorPane(page).getByRole("button", { name: "Remove the image" }).click();
  await expect(editorPane(page).locator('input[type="file"]').first()).toBeAttached();

  await add(page).click();
  await editorPane(page).getByRole("menuitem", { name: "Attachment" }).click();
  await page.getByTestId("picker").getByRole("button", { name: "Budget sheet" }).click();
  await expect(viewerPane(page).locator(".elea-attachment__title")).toHaveText("Budget sheet");
  await expect(viewerPane(page).locator(".elea-attachment__icon--spreadsheet")).toBeVisible();
  await editorPane(page).getByRole("button", { name: "Remove attachment" }).click();
  await expect(page.getByTestId("picker")).toBeVisible();
});

test("Markdown edits the document and accepts a dropped image with cropping", async ({ page }) => {
  await chooseMode(page, "Markdown");
  const editor = editorPane(page);
  const viewer = viewerPane(page);
  const source = editor.getByRole("textbox", { name: "Markdown source" });
  const existing = await source.inputValue();
  expect(existing).not.toContain("elea:block");
  expect(existing).toContain("![");
  expect(existing).toContain("Quarterly report");
  const revised = existing.replace("## Every block type", "### Revised heading") + "\n";
  await source.fill(revised);
  const sourceFrame = editor.locator(".elea-markdown-editor__source");
  await expect(sourceFrame).toHaveCSS("outline-offset", "-2px");
  await expect(sourceFrame).toHaveCSS("border-top-color", "rgba(0, 0, 0, 0)");
  await expect(viewer.getByRole("heading", { name: "Revised heading", level: 3 })).toBeVisible();
  await expect(viewer.locator(".elea-attachment__title")).toHaveText("Quarterly report");

  await editor.getByText("Add an image", { exact: true }).click();
  const dropZone = editor.locator(".elea-dropzone");
  await page.keyboard.press("Tab");
  await dropZone.locator("label").focus();
  await expect(dropZone).toHaveCSS("outline-offset", "-2px");
  await expect(dropZone).toHaveCSS("border-top-color", "rgba(0, 0, 0, 0)");
  const file = (await readFile(PIXEL)).toString("base64");
  const dataTransfer = await page.evaluateHandle((encoded) => {
    const bytes = Uint8Array.from(atob(encoded), (character) => character.charCodeAt(0));
    const transfer = new DataTransfer();
    transfer.items.add(new File([bytes], "sample.png", { type: "image/png" }));
    return transfer;
  }, file);
  await dropZone.dispatchEvent("dragover", { dataTransfer });
  await expect(dropZone).toHaveClass(/elea-dropzone--active/);
  await dropZone.dispatchEvent("drop", { dataTransfer });
  await dataTransfer.dispose();
  await expect(editor.getByRole("img", { name: "Picture to frame" })).toBeVisible();
  await editor.getByRole("slider", { name: "Zoom" }).press("ArrowRight");
  const confirmImage = editor.getByRole("button", { name: "Use this image" });
  await confirmImage.focus();
  await expect(confirmImage).toHaveCSS("outline-width", "2px");
  await expect(confirmImage).toHaveCSS("border-top-color", "rgba(0, 0, 0, 0)");
  await confirmImage.click();
  await expect(viewer.locator('img[src^="data:image/png"]')).toHaveCount(1);
  expect((await source.inputValue()).startsWith(revised)).toBe(true);

  await chooseMode(page, "Classic");
  await expect(editor.locator(".elea-doc-toolbar")).toBeVisible();
  await expect(editor.locator('.elea-media-block__image[src^="data:image/png"]')).toHaveCount(1);
  await chooseMode(page, "Writing");
  await expect(editor.locator("[data-elea-block-id='intro'] u")).toHaveText("editor");
  await expect(viewer.getByRole("heading", { name: "Revised heading", level: 3 })).toBeVisible();
});

test("preview, language and theme switches", async ({ page }) => {
  await page.getByTestId("preview-toggle").click();
  await expect(editorPane(page).locator(".elea-content-editor--preview .elea-content")).toBeVisible();
  await page.getByTestId("preview-toggle").click();
  await expect(editorPane(page).locator('[contenteditable="true"]').first()).toBeVisible();

  await pick(page.getByRole("combobox", { name: "Language" }), "Français");
  await expect(editorPane(page).getByRole("button", { name: "Mode d’édition · Écriture" })).toBeVisible();

  const surface = () => page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--elea-color-surface-default").trim());
  const light = await surface();
  await page.getByTestId("theme-toggle").click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  expect(await surface()).not.toBe(light);
});

test("the document JSON keeps the EditorJS shape", async ({ page }) => {
  await page.getByRole("tab", { name: "JSON", exact: true }).click();
  const json = JSON.parse(await page.getByTestId("document-json").textContent() ?? "{}") as { version: string; blocks: { id: string; type: string }[] };
  expect(json.version).toBe("1.0.0");
  expect(json.blocks[0]).toMatchObject({ id: "intro", type: "paragraph" });
});

test("pasting rich HTML splits it into blocks", async ({ page }) => {
  await page.getByTestId("reset").click();
  const editable = editorPane(page).locator('[contenteditable="true"]').first();
  await editable.click();
  await page.keyboard.type("Intro ");
  await editable.evaluate((element) => {
    const transfer = new DataTransfer();
    transfer.setData("text/html", '<b style="font-weight:normal"><p>pasted <span style="font-weight:700">bold</span></p><h2>Pasted heading</h2><ul><li>alpha</li><li>beta</li></ul></b>');
    element.dispatchEvent(new ClipboardEvent("paste", { clipboardData: transfer, bubbles: true, cancelable: true }));
  });
  await expect(editorPane(page).locator("[data-elea-block-id]")).toHaveCount(3);
  await expect(viewerPane(page).locator(".elea-paragraph").first()).toContainText("Intro pasted bold");
  await expect(viewerPane(page).locator(".elea-paragraph strong").first()).toHaveText("bold");
  await expect(viewerPane(page).getByRole("heading", { level: 2, name: "Pasted heading" })).toBeVisible();
  await expect(viewerPane(page).locator(".elea-list .elea-list__item")).toHaveText(["alpha", "beta"]);
  await expect(editorPane(page).getByRole("textbox", { name: "List item..." }).first()).toBeFocused();
});

test("HTML and Markdown outputs, and a Markdown import that replaces the document", async ({ page }) => {
  await page.getByRole("tab", { name: "HTML", exact: true }).click();
  await expect(page.getByTestId("document-html")).toHaveClass("elea-code");
  await expect(page.getByTestId("document-html")).toContainText('<h2 class="elea-heading elea-heading--2">Every block type</h2>');
  await page.getByRole("tab", { name: "Markdown", exact: true }).click();
  await expect(page.getByTestId("document-markdown")).toContainText("## Every block type");
  await expect(page.getByTestId("document-markdown")).toContainText("- Paragraphs with rich text");
  await page.locator("summary", { hasText: "Import Markdown" }).click();
  await page.getByRole("textbox", { name: "Markdown to import" }).fill("# Imported\n\nA **strong** start.\n\n1. first\n   item\n2. second\n\n3. third\n   item\n\n```sh\nprintf ok\n```");
  await page.getByTestId("import-markdown").click();
  await page.getByRole("tab", { name: "Article", exact: true }).click();
  await expect(viewerPane(page).getByRole("heading", { level: 1, name: "Imported" })).toBeVisible();
  await expect(viewerPane(page).locator(".elea-paragraph strong")).toHaveText("strong");
  const list = viewerPane(page).locator("ol");
  await expect(list).toHaveCount(1);
  await expect(list.getByRole("listitem")).toHaveText(["first item", "second", "third item"]);
  const code = viewerPane(page).locator("pre.elea-code");
  await expect(code.locator("code")).toHaveText("printf ok");
  const strip = await code.evaluate(node => getComputedStyle(node, "::before").backgroundImage);
  expect(strip.match(/radial-gradient/g)).toHaveLength(3);
  await expect(editorPane(page).locator("[data-elea-block-id]")).toHaveCount(4);
});

test("typing shortcuts and the slash menu keep working across appearance changes", async ({ page }) => {
  const desk = page.locator(".workspace-desk");
  await desk.evaluate((element) => {
    element.setAttribute("data-elea-theme", "editorial");
    element.setAttribute("data-elea-appearance", "dark");
  });
  await page.getByTestId("reset").click();
  const editable = editorPane(page).locator('[contenteditable="true"]').first();
  await editable.click();
  await page.keyboard.type("## ");
  const heading = editorPane(page).getByRole("textbox", { name: "Heading..." });
  await expect(heading).toBeFocused();
  await page.keyboard.type("A typed heading");
  await expect(viewerPane(page).getByRole("heading", { level: 2, name: "A typed heading" })).toBeVisible();
  await page.keyboard.press("Enter");
  const paragraph = editorPane(page).locator('[data-elea-block-type="paragraph"] [contenteditable="true"]');
  await expect(paragraph).toBeFocused();
  await page.keyboard.type("/");
  const menu = page.getByRole("listbox");
  await expect(menu).toHaveAttribute("data-elea-theme", "editorial");
  await expect(menu).toHaveCSS("color-scheme", "dark");
  await page.keyboard.press("ArrowDown");
  const active = menu.getByRole("option", { selected: true });
  const activeLabel = await active.innerText();
  await desk.evaluate((element) => {
    element.setAttribute("data-elea-theme", "obsidian");
    element.setAttribute("data-elea-appearance", "light");
  });
  await expect(menu).toHaveAttribute("data-elea-theme", "obsidian");
  await expect(menu).toHaveCSS("color-scheme", "light");
  await expect(paragraph).toBeFocused();
  await expect(active).toHaveText(activeLabel);
  await page.keyboard.type("lis");
  await expect(page.getByRole("listbox").getByRole("option")).toHaveCount(1);
  await page.keyboard.press("Enter");
  const item = editorPane(page).getByRole("textbox", { name: "List item..." });
  await expect(item).toBeFocused();
  await page.keyboard.type("from the slash menu");
  await expect(viewerPane(page).locator(".elea-list .elea-list__item")).toHaveText(["from the slash menu"]);
  await expect(page.getByRole("listbox")).toHaveCount(0);
});

test("the floating toolbar keeps the selection across appearance changes", async ({ page }) => {
  const desk = page.locator(".workspace-desk");
  await desk.evaluate((element) => {
    element.setAttribute("data-elea-theme", "editorial");
    element.setAttribute("data-elea-appearance", "dark");
  });
  await page.getByTestId("reset").click();
  const editable = editorPane(page).locator('[contenteditable="true"]').first();
  await editable.click();
  await page.keyboard.type("Floating words");
  await expect(page.locator("[data-elea-bubble]")).toHaveCount(0);
  await selectInEditable(page, editable, 0, 8);
  const bubble = page.locator("[data-elea-bubble]");
  await expect(bubble).toBeVisible();
  const box = await bubble.boundingBox();
  const text = await editable.boundingBox();
  expect(box && text && box.y < text.y).toBeTruthy();
  await expect(bubble).toHaveAttribute("data-elea-theme", "editorial");
  await expect(bubble).toHaveCSS("color-scheme", "dark");
  await desk.evaluate((element) => {
    element.setAttribute("data-elea-theme", "obsidian");
    element.setAttribute("data-elea-appearance", "light");
  });
  await expect(bubble).toHaveAttribute("data-elea-theme", "obsidian");
  await expect(bubble).toHaveCSS("color-scheme", "light");
  await expect(editable).toBeFocused();
  await expect.poll(() => page.evaluate(() => window.getSelection()?.toString())).toBe("Floating");
  await bubble.getByRole("button", { name: "Italic (Ctrl+I)" }).click();
  await expect(viewerPane(page).locator(".elea-paragraph em")).toHaveText("Floating");
});

test("undo and redo with the keyboard", async ({ page }) => {
  await page.getByTestId("reset").click();
  // The reset is a history entry of its own; typing right after would join it
  await page.waitForTimeout(700);
  const editable = editorPane(page).locator('[contenteditable="true"]').first();
  await editable.click();
  await page.keyboard.type("First burst");
  await page.waitForTimeout(700);
  await page.keyboard.type(" then more");
  await expect(viewerPane(page).locator(".elea-paragraph").first()).toHaveText("First burst then more");
  await page.keyboard.press("ControlOrMeta+z");
  await expect(viewerPane(page).locator(".elea-paragraph").first()).toHaveText("First burst");
  await page.keyboard.press("ControlOrMeta+z");
  await expect(viewerPane(page).locator(".elea-paragraph")).toHaveCount(0);
  await page.keyboard.press("ControlOrMeta+Shift+z");
  await expect(viewerPane(page).locator(".elea-paragraph").first()).toHaveText("First burst");
});

test("blocks are reordered by dragging their grip and with the keyboard", async ({ page }) => {
  const types = () => editorPane(page).locator("[data-elea-block-id]").evaluateAll((nodes) => nodes.map((node) => node.getAttribute("data-elea-block-type")));
  expect((await types()).slice(0, 4)).toEqual(["paragraph", "paragraph", "header", "list"]);
  // Native drag and drop driven through the browser's pipeline is timing-sensitive under CI
  // load; the HTML drag events are dispatched from the page instead, with a real DataTransfer
  await page.evaluate(async () => {
    const grip = document.querySelector('[data-elea-block-id="quote"] .elea-block-editor__grip') as HTMLElement;
    const target = document.querySelector('[data-elea-block-slot="intro"]') as HTMLElement;
    const transfer = new DataTransfer();
    const rect = target.getBoundingClientRect();
    // Each event in its own task, as the browser does, so React commits between them
    const settle = () => new Promise((resolve) => setTimeout(resolve, 0));
    grip.dispatchEvent(new DragEvent("dragstart", { bubbles: true, cancelable: true, dataTransfer: transfer }));
    await settle();
    target.dispatchEvent(new DragEvent("dragover", { bubbles: true, cancelable: true, dataTransfer: transfer, clientY: rect.top + 2 }));
    await settle();
    target.dispatchEvent(new DragEvent("drop", { bubbles: true, cancelable: true, dataTransfer: transfer, clientY: rect.top + 2 }));
    await settle();
    grip.dispatchEvent(new DragEvent("dragend", { bubbles: true, cancelable: true, dataTransfer: transfer }));
    await settle();
  });
  expect((await types()).slice(0, 2)).toEqual(["quote", "paragraph"]);
  await expect(editorPane(page).locator(".elea-block-slot--dragging")).toHaveCount(0);

  const heading = editorPane(page).getByRole("textbox", { name: "Heading..." }).first();
  await heading.click();
  await page.keyboard.press("ControlOrMeta+Shift+ArrowUp");
  await page.keyboard.press("ControlOrMeta+Shift+ArrowUp");
  await page.keyboard.press("ControlOrMeta+Shift+ArrowUp");
  expect((await types()).slice(0, 2)).toEqual(["header", "quote"]);
  await expect(viewerPane(page).locator(".elea-block").first()).toHaveClass(/elea-block--header/);
});

test("the block menu in the margin changes the shape of a text block and keeps its text", async ({ page }) => {
  const types = () => editorPane(page).locator("[data-elea-block-id]").evaluateAll((nodes) => nodes.map((node) => node.getAttribute("data-elea-block-type")));
  // In toolbar mode a fixed bar sits above the document, no selection needed
  await chooseMode(page, "Toolbar");
  await firstParagraph(page).click();
  await expect(editorPane(page).locator(".elea-doc-toolbar")).toBeVisible();
  // The heading becomes a bullet list with the same text, then a paragraph again
  await editorPane(page).locator('[data-elea-block-id="heading"]').hover();
  await editorPane(page).locator('[data-elea-block-id="heading"]').getByRole("button", { name: "Block options" }).click();
  await editorPane(page).getByRole("menuitemradio", { name: "Bullet list" }).click();
  expect((await types())[2]).toBe("list");
  await expect(viewerPane(page).locator(".elea-list .elea-list__item").first()).toHaveText("Every block type");
  await editorPane(page).locator('[data-elea-block-id="heading"]').hover();
  await editorPane(page).locator('[data-elea-block-id="heading"]').getByRole("button", { name: "Block options" }).click();
  await editorPane(page).getByRole("menuitemradio", { name: "Paragraph" }).click();
  expect((await types())[2]).toBe("paragraph");
  await expect(viewerPane(page).locator(".elea-paragraph").nth(2)).toHaveText("Every block type");
  // Deleting goes through the same menu
  await editorPane(page).locator('[data-elea-block-id="heading"]').getByRole("button", { name: "Block options" }).click();
  await editorPane(page).getByRole("menuitem", { name: "Delete this block" }).click();
  await expect(editorPane(page).locator('[data-elea-block-id="heading"]')).toHaveCount(0);
});

test("text and blocks never select together: Shift+arrows, Ctrl+A, release outside, typing over blocks", async ({ page }) => {
  const paragraph = editorPane(page).locator('[data-elea-block-id="how"] [contenteditable="true"]');
  const selectedBlocks = () => editorPane(page).locator(".elea-block-editor--selected").count();
  const selectedText = () => page.evaluate(() => getSelection()?.toString() ?? "");
  // Shift+Down on the first line of a long paragraph extends the text, not the blocks
  await paragraph.click({ position: { x: 20, y: 10 } });
  await page.keyboard.press("Home");
  await page.keyboard.press("Shift+ArrowDown");
  expect(await selectedBlocks()).toBe(0);
  expect((await selectedText()).length).toBeGreaterThan(10);
  // On the last line, the next Shift+Down takes the blocks and the caret leaves the field
  // Line by line to the last one, whatever the wrap width, then the blocks take over
  await page.keyboard.press("End");
  let presses = 0;
  while ((await selectedBlocks()) === 0 && presses < 8) {
    await page.keyboard.press("Shift+ArrowDown");
    presses += 1;
  }
  expect(presses).toBeGreaterThan(1);
  expect(await selectedBlocks()).toBe(2);
  await page.keyboard.press("Shift+ArrowDown");
  expect(await selectedBlocks()).toBe(3);
  await expect(editorPane(page).locator('[contenteditable="true"]:focus')).toHaveCount(0);
  // A plain arrow releases the blocks and puts the caret in the last one
  await page.keyboard.press("ArrowDown");
  expect(await selectedBlocks()).toBe(0);
  await expect(editorPane(page).locator('[data-elea-block-id="list"] [contenteditable="true"]')).toBeFocused();
  // Ctrl+A: the paragraph's text first, then every block
  await paragraph.click();
  await page.keyboard.press("ControlOrMeta+a");
  expect(await selectedBlocks()).toBe(0);
  expect(await selectedText()).toBe(await paragraph.innerText());
  await page.keyboard.press("ControlOrMeta+a");
  expect(await selectedBlocks()).toBe(14);
  await page.keyboard.press("Escape");
  expect(await selectedBlocks()).toBe(0);
  // Releasing outside the editor ends the drag: hovering blocks afterwards selects nothing
  const box = await paragraph.boundingBox();
  if (!box) throw new Error("paragraph must be laid out");
  await page.mouse.move(box.x + 30, box.y + 10);
  await page.mouse.down();
  // Straight out to the right, over the output pane, so no other block is crossed on the way
  await page.mouse.move(1250, box.y + 10, { steps: 5 });
  await page.mouse.up();
  const quote = await editorPane(page).locator('[data-elea-block-id="quote"]').boundingBox();
  if (!quote) throw new Error("quote must be laid out");
  await page.mouse.move(quote.x + 100, quote.y + 10, { steps: 5 });
  expect(await selectedBlocks()).toBe(0);
  // Typing over a block selection replaces it with a paragraph holding the key
  await paragraph.click();
  await page.keyboard.press("End");
  presses = 0;
  while ((await selectedBlocks()) === 0 && presses < 8) {
    await page.keyboard.press("Shift+ArrowDown");
    presses += 1;
  }
  expect(await selectedBlocks()).toBe(2);
  await page.keyboard.type("Z");
  expect(await selectedBlocks()).toBe(0);
  await expect(editorPane(page).locator("[data-elea-block-id]")).toHaveCount(13);
  await expect(viewerPane(page).locator(".elea-paragraph").nth(1)).toHaveText("Z");
});

test("the classic mode shows a fixed bar above a continuous document, nothing around the blocks", async ({ page }) => {
  await chooseMode(page, "Classic");
  const bar = editorPane(page).locator(".elea-doc-toolbar");
  await expect(bar).toBeVisible();
  await expect(editorPane(page).locator(".elea-block-editor__gutter")).toHaveCount(0);
  await expect(editorPane(page).locator(".elea-block-editor__head")).toHaveCount(0);
  // The bar idles until a paragraph has the focus, then formats it; no floating bar appears
  await expect(bar.locator(".elea-doc-toolbar__group--idle")).toHaveCount(1);
  const paragraph = firstParagraph(page);
  await paragraph.click({ position: { x: 10, y: 10 } });
  const frame = editorPane(page).locator(".elea-classic-editor");
  await expect(frame).toHaveCSS("outline-offset", "-2px");
  await expect(frame).toHaveCSS("border-top-color", "rgba(0, 0, 0, 0)");
  await expect(bar.locator(".elea-doc-toolbar__group--idle")).toHaveCount(0);
  await selectInEditable(page, paragraph, 0, "Elea renders".length);
  await expect(page.locator("[data-elea-bubble]")).toHaveCount(0);
  await bar.getByRole("button", { name: "Underlined (Ctrl+U)" }).click();
  await expect(viewerPane(page).locator('[data-elea-block-id="intro"] u').filter({ hasText: "Elea renders" })).toHaveCount(1);
  // The bar inserts after the focused block and undoes it
  const types = () => editorPane(page).locator("[data-elea-block-id]").evaluateAll((nodes) => nodes.map((node) => node.getAttribute("data-elea-block-id")));
  await page.waitForTimeout(700);
  await paragraph.click();
  await add(page).click();
  await editorPane(page).getByRole("menuitem", { name: "Quote" }).click();
  expect((await types()).slice(0, 2)).toEqual(["intro", expect.any(String)]);
  await expect(editorPane(page).getByRole("textbox", { name: "Quote..." }).first()).toBeFocused();
  await editorPane(page).locator(".elea-content-editor__mode").getByRole("button", { name: "Undo (Ctrl+Z)" }).click();
  expect((await types()).slice(0, 2)).toEqual(["intro", "how"]);
  await chooseMode(page, "Writing");
  await expect(editorPane(page).locator(".elea-doc-toolbar")).toHaveCount(0);
  // Default mode: no bar on the paragraph, the floating one carries the headings too
  await firstParagraph(page).click();
  await expect(editorPane(page).getByRole("toolbar")).toHaveCount(0);
  await page.keyboard.press("Home");
  await page.keyboard.press("Shift+End");
  await expect(page.locator("[data-elea-bubble]").getByRole("button", { name: "Heading 2" })).toBeVisible();
});

test("the notebook opens as a publication and keeps draft changes between examples and tools", async ({ page }) => {
  await page.reload();
  const document = page.getByRole("combobox", { name: "Document", exact: true });
  await expect(document).toHaveText("The glacier notebook");
  const title = editorPane(page).getByRole("textbox", { name: "Your content title..." });
  await title.fill("The ice atlas");
  await expect(viewerPane(page).getByRole("heading", { name: "The ice atlas" })).toBeVisible();
  await expect(viewerPane(page).locator("iframe")).toHaveCount(0);
  await pick(document, "Block reference");
  await pick(document, "The ice atlas");
  await expect(title).toHaveValue("The ice atlas");
  await page.getByRole("link", { name: "Edit theme" }).click();
  await expect(page.getByRole("heading", { name: "Theme studio", level: 1 })).toBeVisible();
  await page.goBack();
  await expect(title).toHaveValue("The ice atlas");
  await page.getByRole("tab", { name: "JSON" }).click();
  const file = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download .json" }).click();
  const download = await file;
  expect(download.suggestedFilename()).toBe("the-ice-atlas.json");
  const path = await download.path();
  if (!path) throw new Error("Expected a document download");
  const data = JSON.parse(await readFile(path, "utf8"));
  expect(data.blocks.map((block: { id: string }) => block.id)).toContain("observation");
});

test("a mobile reader can move directly between a draft and its output", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 760 });
  await page.reload();
  const switcher = page.getByRole("group", { name: "Workspace view" });
  await expect(editorPane(page)).toBeVisible();
  await expect(viewerPane(page)).toHaveCount(0);
  await switcher.getByRole("button", { name: "Output" }).click();
  await expect(editorPane(page)).toBeHidden();
  await expect(viewerPane(page).getByRole("heading", { name: "The glacier notebook" })).toBeVisible();
  await page.getByRole("tab", { name: "HTML" }).click();
  expect(await page.locator("body").evaluate((body) => body.scrollWidth)).toBeLessThanOrEqual(320);
  await switcher.getByRole("button", { name: "Manuscript" }).click();
  await expect(editorPane(page).getByRole("textbox", { name: "Your content title..." })).toHaveValue("The glacier notebook");
});
