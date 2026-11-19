import { expect, test, type Page } from "@playwright/test";
import { fileURLToPath } from "node:url";

const PIXEL = fileURLToPath(new URL("./pixel.png", import.meta.url));

const editorPane = (page: Page) => page.getByTestId("editor-pane");
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
  await page.goto("/elea/#/playground");
  await expect(page.getByRole("heading", { name: "Elea playground" })).toBeVisible();
});

test("the sample document renders in both panes", async ({ page }) => {
  await expect(viewerPane(page).locator(".elea-content .elea-block")).toHaveCount(13);
  await expect(viewerPane(page).getByRole("heading", { name: "Every block type" })).toBeVisible();
  await expect(editorPane(page).locator("[data-elea-block-id]")).toHaveCount(13);
  await expect(viewerPane(page).locator(".elea-table")).toBeVisible();
  const external = viewerPane(page).locator('a[href="https://example.org/docs"]');
  await expect(external).toHaveAttribute("target", "_blank");
  await expect(viewerPane(page).locator('a[href="/about"]')).not.toHaveAttribute("target", "_blank");
});

test("typing in a paragraph updates the viewer", async ({ page }) => {
  const editable = firstParagraph(page);
  await editable.click();
  await page.keyboard.press("End");
  await page.keyboard.type(" Typed live.");
  await expect(viewerPane(page).locator('[data-elea-block-id="intro"]')).toContainText("Typed live.");
});

test("the toolbar formats the selection and creates links", async ({ page }) => {
  await pick(page.getByTestId("mode-select"), "Toolbar");
  await page.getByTestId("reset").click();
  const editable = editorPane(page).locator('[contenteditable="true"]').first();
  await editable.click();
  await page.keyboard.type("Hello world from the playground");
  await selectInEditable(page, editable, 0, 5);
  // The toolbar floats in a portal above the selection, outside the editor pane
  await editorPane(page).getByRole("button", { name: "Bold (Ctrl+B)" }).click();
  await expect(viewerPane(page).locator(".elea-paragraph strong")).toHaveText("Hello");

  await selectInEditable(page, editable, 6, 11);
  await editorPane(page).getByRole("button", { name: "Link (Ctrl+K)" }).click();
  const dialog = page.getByRole("dialog", { name: "Enter the link URL:" });
  await expect(dialog).toBeVisible();
  await dialog.getByRole("textbox").fill("example.org/page");
  await page.keyboard.press("Enter");
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

test("Enter starts a new paragraph with the rest of the text, Backspace at its start merges back", async ({ page }) => {
  await page.getByTestId("reset").click();
  const editable = editorPane(page).locator('[contenteditable="true"]').first();
  await editable.click();
  await page.keyboard.type("First part|second part");
  await selectInEditable(page, editable, 10, 10);
  await page.keyboard.press("Enter");
  await expect(editorPane(page).locator("[data-elea-block-id]")).toHaveCount(2);
  const paragraphs = viewerPane(page).locator(".elea-paragraph");
  await expect(paragraphs.nth(0)).toHaveText("First part");
  await expect(paragraphs.nth(1)).toHaveText("|second part");
  await expect(editorPane(page).locator('[contenteditable="true"]').nth(1)).toBeFocused();
  await page.keyboard.press("Backspace");
  await expect(editorPane(page).locator("[data-elea-block-id]")).toHaveCount(1);
  await expect(paragraphs.nth(0)).toHaveText("First part|second part");
  await page.keyboard.type("+");
  await expect(paragraphs.nth(0)).toHaveText("First part+|second part");
});

test("a mouse drag across blocks selects them, Delete removes them", async ({ page }) => {
  const blocks = editorPane(page).locator("[data-elea-block-id]");
  const first = blocks.nth(1);
  const third = blocks.nth(3);
  const from = await first.boundingBox();
  const to = await third.boundingBox();
  if (!from || !to) throw new Error("blocks must be laid out");
  await page.mouse.move(from.x + 40, from.y + from.height / 2);
  await page.mouse.down();
  await page.mouse.move(to.x + 40, to.y + to.height / 2, { steps: 8 });
  await page.mouse.up();
  await expect(editorPane(page).locator(".elea-block-editor--selected")).toHaveCount(3);
  await expect(editorPane(page).getByRole("toolbar", { name: "3 blocks selected" })).toBeVisible();
  await page.keyboard.press("Delete");
  await expect(blocks).toHaveCount(10);
  await expect(editorPane(page).locator(".elea-block-editor--selected")).toHaveCount(0);
});

test("blocks are added from the menu and lists grow with Enter", async ({ page }) => {
  await page.getByTestId("reset").click();
  await editorPane(page).getByRole("button", { name: "Add a block" }).click();
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
  await page.keyboard.press("End");
  await page.keyboard.press("Tab");
  await expect(viewerPane(page).locator(".elea-list .elea-list .elea-list__item")).toHaveText(["two"]);

  await editorPane(page).getByRole("button", { name: "Add a block" }).click();
  await editorPane(page).getByRole("menuitem", { name: "Heading" }).click();
  await editorPane(page).getByRole("textbox", { name: "Heading..." }).fill("A title");
  await pick(editorPane(page).getByRole("combobox", { name: "Heading" }), "H3");
  await expect(viewerPane(page).getByRole("heading", { level: 3, name: "A title" })).toBeVisible();
});

test("images upload through the host service and attachments come from the picker", async ({ page }) => {
  await page.getByTestId("reset").click();
  await editorPane(page).getByRole("button", { name: "Add a block" }).click();
  await editorPane(page).getByRole("menuitem", { name: "Image" }).click();
  await editorPane(page).locator('input[type="file"]').first().setInputFiles(PIXEL);
  // The picture is framed before it goes up; the export comes out of a canvas as PNG
  await expect(editorPane(page).getByRole("img", { name: "Picture to frame" })).toBeVisible();
  await editorPane(page).getByRole("button", { name: "Use this image" }).click();
  await expect(editorPane(page).locator(".elea-media-block__image")).toHaveAttribute("src", /^data:image\/png/);
  await editorPane(page).getByRole("textbox", { name: "Image caption..." }).fill("A pixel");
  await expect(viewerPane(page).locator(".elea-caption")).toHaveText("A pixel");
  // Removing the picture brings the drop zone back, the caption kept for the next one
  await editorPane(page).getByRole("button", { name: "Remove the image" }).click();
  await expect(editorPane(page).locator('input[type="file"]').first()).toBeAttached();

  await editorPane(page).getByRole("button", { name: "Add a block" }).click();
  await editorPane(page).getByRole("menuitem", { name: "Attachment" }).click();
  await page.getByTestId("picker").getByRole("button", { name: "Budget sheet" }).click();
  await expect(viewerPane(page).locator(".elea-attachment__title")).toHaveText("Budget sheet");
  await expect(viewerPane(page).locator(".elea-attachment__icon--spreadsheet")).toBeVisible();
  await editorPane(page).getByRole("button", { name: "Remove attachment" }).click();
  await expect(page.getByTestId("picker")).toBeVisible();
});

test("preview, language and theme switches", async ({ page }) => {
  await page.getByTestId("preview-toggle").click();
  await expect(editorPane(page).locator(".elea-content-editor--preview .elea-content")).toBeVisible();
  await page.getByTestId("preview-toggle").click();
  await expect(editorPane(page).locator('[contenteditable="true"]').first()).toBeVisible();

  await pick(page.getByRole("combobox", { name: "Language" }), "Français");
  await expect(editorPane(page).getByRole("button", { name: "Ajouter un bloc" })).toBeVisible();

  const surface = () => page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--elea-color-surface-default").trim());
  const light = await surface();
  await page.getByTestId("theme-toggle").click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  expect(await surface()).not.toBe(light);
});

test("the document JSON keeps the EditorJS shape", async ({ page }) => {
  await page.getByTestId("tab-json").click();
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
  await page.getByTestId("tab-html").click();
  await expect(page.getByTestId("document-html")).toContainText('<h2 class="elea-heading elea-heading--2">Every block type</h2>');
  await page.getByTestId("tab-markdown").click();
  await expect(page.getByTestId("document-markdown")).toContainText("## Every block type");
  await expect(page.getByTestId("document-markdown")).toContainText("- Paragraphs with rich text");
  await page.locator("summary", { hasText: "Import Markdown" }).click();
  await page.getByRole("textbox", { name: "Markdown to import" }).fill("# Imported\n\nA **strong** start.\n\n1. one\n2. two");
  await page.getByTestId("import-markdown").click();
  await page.getByTestId("tab-rendered").click();
  await expect(viewerPane(page).getByRole("heading", { level: 1, name: "Imported" })).toBeVisible();
  await expect(viewerPane(page).locator(".elea-paragraph strong")).toHaveText("strong");
  await expect(viewerPane(page).locator(".elea-list--ordered .elea-list__item")).toHaveText(["one", "two"]);
  await expect(editorPane(page).locator("[data-elea-block-id]")).toHaveCount(3);
});

test("typing shortcuts and the slash menu insert blocks from the keyboard", async ({ page }) => {
  await page.getByTestId("reset").click();
  const editable = editorPane(page).locator('[contenteditable="true"]').first();
  await editable.click();
  await page.keyboard.type("## ");
  const heading = editorPane(page).getByRole("textbox", { name: "Heading..." });
  await expect(heading).toBeFocused();
  await page.keyboard.type("A typed heading");
  await expect(viewerPane(page).getByRole("heading", { level: 2, name: "A typed heading" })).toBeVisible();
  await page.keyboard.press("Enter");
  const paragraph = editorPane(page).locator('[contenteditable="true"]').first();
  await expect(paragraph).toBeFocused();
  await page.keyboard.type("/");
  await expect(page.getByRole("listbox")).toBeVisible();
  await page.keyboard.type("lis");
  await expect(page.getByRole("listbox").getByRole("option")).toHaveCount(1);
  await page.keyboard.press("Enter");
  const item = editorPane(page).getByRole("textbox", { name: "List item..." });
  await expect(item).toBeFocused();
  await page.keyboard.type("from the slash menu");
  await expect(viewerPane(page).locator(".elea-list .elea-list__item")).toHaveText(["from the slash menu"]);
  await expect(page.getByRole("listbox")).toHaveCount(0);
});

test("selecting text shows a floating toolbar above it", async ({ page }) => {
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
  await pick(page.getByTestId("mode-select"), "Toolbar");
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
  // Ctrl+A: the paragraph's text first, then every block
  await paragraph.click();
  await page.keyboard.press("ControlOrMeta+a");
  expect(await selectedBlocks()).toBe(0);
  expect((await selectedText()).startsWith("Write here")).toBe(true);
  await page.keyboard.press("ControlOrMeta+a");
  expect(await selectedBlocks()).toBe(13);
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
  await expect(editorPane(page).locator("[data-elea-block-id]")).toHaveCount(12);
  await expect(viewerPane(page).locator(".elea-paragraph").nth(1)).toHaveText("Z");
});

test("the classic mode shows a fixed bar above a continuous document, nothing around the blocks", async ({ page }) => {
  await pick(page.getByTestId("mode-select"), "Classic");
  const bar = editorPane(page).locator(".elea-doc-toolbar");
  await expect(bar).toBeVisible();
  await expect(editorPane(page).locator(".elea-block-editor__gutter")).toHaveCount(0);
  await expect(editorPane(page).locator(".elea-block-editor__head")).toHaveCount(0);
  // The bar idles until a paragraph has the focus, then formats it; no floating bar appears
  await expect(bar.locator(".elea-doc-toolbar__group--idle")).toHaveCount(1);
  const paragraph = firstParagraph(page);
  await paragraph.click({ position: { x: 10, y: 10 } });
  await expect(bar.locator(".elea-doc-toolbar__group--idle")).toHaveCount(0);
  await page.keyboard.press("Home");
  await page.keyboard.press("Shift+End");
  await expect(page.locator("[data-elea-bubble]")).toHaveCount(0);
  await bar.getByRole("button", { name: "Underlined (Ctrl+U)" }).click();
  await expect(viewerPane(page).locator('[data-elea-block-id="intro"] u').filter({ hasText: "Elea renders" })).toHaveCount(1);
  // The bar inserts after the focused block and undoes it
  const types = () => editorPane(page).locator("[data-elea-block-id]").evaluateAll((nodes) => nodes.map((node) => node.getAttribute("data-elea-block-id")));
  await page.waitForTimeout(700);
  await paragraph.click();
  await bar.getByRole("group", { name: "Insert" }).getByRole("button", { name: "Quote" }).click();
  expect((await types()).slice(0, 2)).toEqual(["intro", expect.any(String)]);
  await expect(editorPane(page).getByRole("textbox", { name: "Quote..." }).first()).toBeFocused();
  await bar.getByRole("button", { name: "Undo (Ctrl+Z)" }).click();
  expect((await types()).slice(0, 2)).toEqual(["intro", "how"]);
  await pick(page.getByTestId("mode-select"), "Default");
  await expect(editorPane(page).locator(".elea-doc-toolbar")).toHaveCount(0);
  // Default mode: no bar on the paragraph, the floating one carries the headings too
  await firstParagraph(page).click();
  await expect(editorPane(page).getByRole("toolbar")).toHaveCount(0);
  await page.keyboard.press("Home");
  await page.keyboard.press("Shift+End");
  await expect(page.locator("[data-elea-bubble]").getByRole("button", { name: "Heading 2" })).toBeVisible();
});
