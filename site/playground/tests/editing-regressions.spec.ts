import { dirname, join } from "node:path";
import { expect, test, type Page } from "@playwright/test";

async function openReference(page: Page) {
  await page.route("https://www.youtube.com/embed/**", route => route.fulfill({ contentType: "text/html", body: "<!doctype html>" }));
  await page.goto("/playground/");
  await page.getByRole("combobox", { name: "Document", exact: true }).click();
  await page.getByRole("option", { name: "Block reference" }).click();
}

const editor = (page: Page) => page.getByTestId("editor-pane");
const reader = (page: Page) => page.getByTestId("viewer-pane");

test("formatting in the editor survives the document preview", async ({ page }) => {
  await openReference(page);
  await page.getByText("Import Markdown", { exact: true }).click();
  await page.getByLabel("Markdown to import").fill("## Field guide\n\nBirch\n\nElm\n\nAsh\n\n- Spore\n- Seed\n\n1. Observe\n2. Draw\n\n> Measure twice");
  await page.getByTestId("import-markdown").click();

  const fields = editor(page).locator('[data-elea-block-type="paragraph"] [contenteditable="true"]');
  for (const [index, key] of ["b", "i", "u"].entries()) {
    const field = fields.nth(index);
    await field.click();
    await field.press("Home");
    await field.press("Shift+End");
    await field.press(`ControlOrMeta+${key}`);
  }
  await page.getByTestId("preview-toggle").click();
  const preview = editor(page).locator(".elea-content");
  for (const surface of [preview, reader(page).locator(".elea-content")]) {
    await expect(surface.getByRole("heading", { name: "Field guide", level: 2 })).toBeVisible();
    await expect(surface.locator("strong")).toHaveText("Birch");
    await expect(surface.locator("em")).toHaveText("Elm");
    await expect(surface.locator("u")).toHaveText("Ash");
    await expect(surface.locator("ul li")).toHaveText(["Spore", "Seed"]);
    await expect(surface.locator("ol li")).toHaveText(["Observe", "Draw"]);
    await expect(surface.locator("blockquote")).toContainText("Measure twice");
  }
});

test("media controls overlay the frame on hover or keyboard focus", async ({ page }) => {
  await openReference(page);
  const image = editor(page).locator('[data-elea-block-type="image"]');
  const frame = image.locator(".elea-media-block__frame");
  const actions = frame.locator(".elea-media-block__actions");
  await frame.scrollIntoViewIfNeeded();
  await page.mouse.move(0, 0);
  await expect(actions).toHaveCSS("opacity", "0");
  await image.getByRole("button", { name: "Replace the image" }).focus();
  await expect(actions).toHaveCSS("opacity", "1");
  await image.getByRole("button", { name: "Replace the image" }).blur();
  await frame.hover();
  await expect(actions).toHaveCSS("opacity", "1");
  const bounds = await frame.boundingBox();
  const buttons = await actions.boundingBox();
  expect(bounds && buttons && buttons.y >= bounds.y && buttons.y + buttons.height <= bounds.y + bounds.height).toBeTruthy();
  const chooser = page.waitForEvent("filechooser");
  await image.getByRole("button", { name: "Replace the image" }).click();
  await (await chooser).setFiles(join(dirname(test.info().file), "pixel.png"));
  await image.getByRole("button", { name: "Use this image" }).click();
  await expect(reader(page).locator('[data-elea-block-type="image"] img')).toHaveAttribute("src", /^data:image\/png/);
  await frame.hover();
  await image.getByRole("button", { name: "Remove the image" }).click();
  await expect(reader(page).locator('[data-elea-block-type="image"] img')).toHaveCount(0);

  const video = editor(page).locator('[data-elea-block-type="video"]');
  const videoFrame = video.locator(".elea-media-block__frame");
  await videoFrame.hover();
  const player = video.locator("iframe");
  await expect(player).toBeVisible();
  expect(await player.evaluate(frame => {
    const bounds = frame.getBoundingClientRect();
    return document.elementFromPoint(bounds.left + bounds.width / 2, bounds.top + bounds.height / 2) === frame;
  })).toBe(true);
  await video.getByRole("button", { name: "Change URL" }).click();
  const url = video.getByRole("textbox", { name: /video url/i });
  await expect(url).not.toHaveValue("");
  await url.press("Escape");
  await expect(video.locator("iframe")).toBeVisible();
  await videoFrame.hover();
  await video.getByRole("button", { name: "Change URL" }).click();
  await url.fill("https://www.youtube.com/watch?v=aqz-KE-bpKQ");
  await url.press("Enter");
  await expect(reader(page).locator('[data-elea-block-type="video"] iframe')).toHaveAttribute("src", /aqz-KE-bpKQ/);
  await videoFrame.hover();
  await video.getByRole("button", { name: "Remove the video" }).click();
  await expect(url).toHaveValue("");
  await expect(reader(page).locator('[data-elea-block-type="video"] iframe')).toHaveCount(0);
});

test("attachment actions appear on the card and cancelling keeps the current file", async ({ page }) => {
  await openReference(page);
  const card = editor(page).locator(".elea-attachment-card");
  const actions = card.locator(".elea-media-block__actions");
  const replace = card.getByRole("button", { name: "Replace attachment" });
  await card.scrollIntoViewIfNeeded();
  await page.mouse.move(0, 0);
  await expect(actions).toHaveCSS("opacity", "0");
  await replace.focus();
  await expect(actions).toHaveCSS("opacity", "1");
  await replace.click();
  await expect(reader(page).getByText("Quarterly report")).toBeVisible();
  await editor(page).getByRole("button", { name: "Cancel" }).click();
  await expect(replace).toBeFocused();
  await card.hover();
  await replace.click();
  await page.getByTestId("picker").getByRole("button", { name: "Budget sheet" }).click();
  await expect(card).toContainText("Budget sheet");
  await expect(reader(page).getByText("Budget sheet")).toBeVisible();
  await card.getByRole("button", { name: "Remove attachment" }).click();
  await expect(page.getByTestId("picker")).toBeVisible();
});

test.describe("touch media controls", () => {
  test.use({ hasTouch: true });

  test("images, videos and files have separate circular actions on touch", async ({ page }) => {
    await openReference(page);
    await page.getByRole("combobox", { name: "Language", exact: true }).tap();
    await page.getByRole("option", { name: "English", exact: true }).tap();
    const labels = {
      image: ["Adjust crop", "Replace the image", "Remove the image"],
      video: ["Change URL", "Remove the video"],
      attachment: ["Replace attachment", "Remove attachment"],
    };
    for (const [type, names] of Object.entries(labels)) {
      const actions = editor(page).locator(`[data-elea-block-type="${type}"] .elea-media-block__actions`);
      await actions.scrollIntoViewIfNeeded();
      await expect(actions).toHaveCSS("opacity", "1");
      await expect(actions).toHaveCSS("background-color", "rgba(0, 0, 0, 0)");
      await expect(actions.getByRole("button")).toHaveCount(names.length);
      let previousRight = -Infinity;
      for (const name of names) {
        const button = actions.getByRole("button", { name, exact: true });
        await button.tap({ trial: true });
        await expect(button).toHaveCSS("border-radius", "50%");
        const disc = await button.evaluate(node => {
          const rect = node.getBoundingClientRect();
          const color = getComputedStyle(node).backgroundColor.match(/\d+/g)!.map(Number);
          return { left: rect.left, right: rect.right, width: rect.width, height: rect.height, color };
        });
        expect(disc.left).toBeGreaterThan(previousRight);
        previousRight = disc.right;
        expect(disc.width).toBe(disc.height);
        expect(disc.width).toBeGreaterThanOrEqual(44);
        expect(Math.min(...disc.color)).toBeGreaterThan(200);
        expect(Math.max(...disc.color) - Math.min(...disc.color)).toBeLessThan(24);
      }
    }
    const image = editor(page).locator('[data-elea-block-type="image"]');
    const adjust = image.getByRole("button", { name: "Adjust crop", exact: true });
    await adjust.tap();
    await image.getByRole("button", { name: "Cancel", exact: true }).tap();
    await expect(adjust).toBeFocused();
  });
});

test.describe("native clipboard", () => {
  // The two operations share the system clipboard.
  test.describe.configure({ mode: "default" });

  test("copy non-adjacent blocks and paste them after a picture in the same document", async ({ page, context }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await openReference(page);
    const pane = editor(page);
    const image = pane.locator('[data-elea-block-id="image"] img');
    await pane.locator('[data-elea-block-id="how"] [contenteditable="true"]').click();
    await image.click({ modifiers: ["ControlOrMeta"] });
    await expect(pane.locator(".elea-block-editor--selected")).toHaveCount(2);
    await pane.getByRole("button", { name: "Copy the selection" }).click();

    await image.click();
    await page.keyboard.press("ControlOrMeta+v");
    const slots = pane.locator(".elea-block-editor");
    const order = await slots.evaluateAll(nodes => nodes.map(node => node.getAttribute("data-elea-block-id")));
    const destination = order.indexOf("image");
    await expect(slots.nth(destination + 1)).toHaveAttribute("data-elea-block-type", "paragraph");
    await expect(slots.nth(destination + 2)).toHaveAttribute("data-elea-block-type", "image");
    expect(order[destination + 1]).not.toBe("how");
    expect(order[destination + 2]).not.toBe("image");
    const bar = pane.getByRole("toolbar", { name: "2 blocks selected" });
    await expect(bar).toBeVisible();
    const previous = await slots.nth(destination).boundingBox();
    const controls = await bar.boundingBox();
    const firstCopy = await slots.nth(destination + 1).boundingBox();
    expect(previous && controls && firstCopy &&
      previous.y + previous.height <= controls.y + 1 && controls.y + controls.height <= firstCopy.y + 1).toBeTruthy();
  });

  for (const operation of ["copy", "cut"] as const) {
    test(`${operation} a mixed selection into a separate empty editor and undo the paste`, async ({ page, context }) => {
      await context.grantPermissions(["clipboard-read", "clipboard-write"]);
      await openReference(page);
      await page.getByRole("tab", { name: "JSON", exact: true }).click();
      const json = page.getByTestId("document-json");
      type Block = { id: string; type: string; data: Record<string, unknown> };
      const original = (JSON.parse(await json.innerText()) as { blocks: Block[] }).blocks;
      const first = original.findIndex(block => block.id === "list");
      const last = original.findIndex(block => block.id === "image");
      const source = original.slice(first, last + 1);
      expect(source.map(block => block.type)).toEqual(["list", "quote", "image"]);
      const sourceEditor = editor(page);
      await sourceEditor.locator('[data-elea-block-id="list"] [contenteditable="true"]').click();
      await sourceEditor.locator('[data-elea-block-id="image"] img').click({ modifiers: ["Shift"] });
      await expect(sourceEditor.locator(".elea-block-editor--selected")).toHaveCount(source.length);
      if (operation === "copy") {
        await page.keyboard.press("ControlOrMeta+c");
      } else {
        await sourceEditor.getByRole("button", { name: "Cut the selection" }).click();
        await expect(sourceEditor.locator("[data-elea-block-type]")).toHaveCount(original.length - source.length);
      }

      const target = await context.newPage();
      await openReference(target);
      await target.getByTestId("reset").click();
      const field = editor(target).locator('[contenteditable="true"]').first();
      await field.click();
      await target.keyboard.press("ControlOrMeta+v");
      await expect(editor(target).locator("[data-elea-block-type]")).toHaveCount(source.length);
      await target.getByRole("tab", { name: "JSON", exact: true }).click();
      const pasted = (JSON.parse(await target.getByTestId("document-json").innerText()) as { blocks: Block[] }).blocks;
      expect(pasted.map(({ type, data }) => ({ type, data }))).toEqual(source.map(({ type, data }) => ({ type, data })));
      expect(new Set([...source, ...pasted].map(block => block.id)).size).toBe(source.length * 2);
      await editor(target).locator('[contenteditable="true"]').first().click();
      await target.keyboard.press("ControlOrMeta+z");
      await expect(editor(target).locator("[data-elea-block-type]")).toHaveCount(1);
      await expect(editor(target).locator('[data-elea-block-type="paragraph"] [contenteditable="true"]')).toHaveText("");
    });
  }
});
