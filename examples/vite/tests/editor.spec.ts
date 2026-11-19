import { expect, test, type Page } from "@playwright/test";
import { fileURLToPath } from "node:url";

const PIXEL = fileURLToPath(new URL("./pixel.png", import.meta.url));

const editorPane = (page: Page) => page.getByTestId("editor-pane");
const viewerPane = (page: Page) => page.getByTestId("viewer-pane");
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
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Elea playground" })).toBeVisible();
});

test("the sample document renders in both panes", async ({ page }) => {
  await expect(viewerPane(page).locator(".elea-content .elea-block")).toHaveCount(12);
  await expect(viewerPane(page).getByRole("heading", { name: "Every block type" })).toBeVisible();
  await expect(editorPane(page).locator("[data-elea-block-id]")).toHaveCount(12);
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
  await page.getByTestId("reset").click();
  const editable = editorPane(page).locator('[contenteditable="true"]').first();
  await editable.click();
  await page.keyboard.type("Hello world from the playground");
  await selectInEditable(page, editable, 0, 5);
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

test("Shift+Enter starts a new block with the rest of the text", async ({ page }) => {
  await page.getByTestId("reset").click();
  const editable = editorPane(page).locator('[contenteditable="true"]').first();
  await editable.click();
  await page.keyboard.type("First part|second part");
  await selectInEditable(page, editable, 10, 10);
  await page.keyboard.press("Shift+Enter");
  await expect(editorPane(page).locator("[data-elea-block-id]")).toHaveCount(2);
  const paragraphs = viewerPane(page).locator(".elea-paragraph");
  await expect(paragraphs.nth(0)).toHaveText("First part");
  await expect(paragraphs.nth(1)).toHaveText("|second part");
});

test("blocks are added from the menu and lists grow with Enter", async ({ page }) => {
  await page.getByTestId("reset").click();
  await editorPane(page).getByRole("button", { name: "Add a block" }).click();
  await editorPane(page).getByRole("menuitem", { name: "List" }).click();
  const item = editorPane(page).getByRole("textbox", { name: "List item..." });
  await expect(item).toBeFocused();
  await item.fill("one");
  await item.press("Enter");
  await expect(editorPane(page).getByRole("textbox", { name: "List item..." })).toHaveCount(2);
  await editorPane(page).getByRole("textbox", { name: "List item..." }).nth(1).fill("two");
  await expect(viewerPane(page).locator(".elea-list .elea-list__item")).toHaveText(["one", "two"]);

  await editorPane(page).getByRole("button", { name: "Add a block" }).click();
  await editorPane(page).getByRole("menuitem", { name: "Heading" }).click();
  await editorPane(page).getByRole("textbox", { name: "Heading..." }).fill("A title");
  await editorPane(page).getByRole("combobox", { name: "Heading" }).selectOption("3");
  await expect(viewerPane(page).getByRole("heading", { level: 3, name: "A title" })).toBeVisible();
});

test("images upload through the host service and attachments come from the picker", async ({ page }) => {
  await page.getByTestId("reset").click();
  await editorPane(page).getByRole("button", { name: "Add a block" }).click();
  await editorPane(page).getByRole("menuitem", { name: "Image" }).click();
  await editorPane(page).locator('input[type="file"]').setInputFiles(PIXEL);
  await expect(editorPane(page).locator(".elea-media-block__image")).toHaveAttribute("src", /^data:image\/png/);
  await editorPane(page).getByRole("textbox", { name: "Image caption..." }).fill("A pixel");
  await expect(viewerPane(page).locator(".elea-caption")).toHaveText("A pixel");

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

  await page.getByRole("combobox", { name: "Language" }).selectOption("fr");
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
