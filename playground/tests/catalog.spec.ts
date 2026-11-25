import { test, expect } from "@playwright/test";

const catalog = "/elea/playground/#/ui";

test("the catalogue combines category and search and recovers from an empty result", async ({ page }) => {
  await page.goto(catalog);
  const main = page.getByRole("main");
  const results = main.getByRole("status");
  await expect(results).toHaveText("24 component guides");
  await main.getByRole("button", { name: "Forms" }).click();
  await expect(results).toHaveText("5 component guides");
  const search = main.getByRole("searchbox", { name: "Search components" });
  await search.fill("radio");
  await expect(results).toHaveText("1 component guide");
  await expect(main.getByRole("link", { name: "RadioGroup", exact: true })).toBeVisible();
  await main.getByRole("button", { name: "Navigation" }).click();
  await expect(main.getByRole("heading", { name: "No components found" })).toBeVisible();
  await main.getByRole("button", { name: "Clear filters" }).click();
  await expect(search).toHaveValue("");
  await expect(results).toHaveText("24 component guides");
});

test("keyboard focus belongs to the catalogue navigation and to each button’s consumer styles", async ({ page }) => {
  await page.goto(`${catalog}/button`);
  const index = page.getByRole("navigation", { name: "Component index" }).getByRole("link", { name: "All components" });
  const primary = page.getByRole("button", { name: "Primary", exact: true });
  const disc = page.getByRole("button", { name: "Add", exact: true }).and(page.locator(".elea-button--disc"));
  await page.keyboard.press("Tab");
  await index.focus();
  await expect(index).toHaveCSS("outline-width", "2px");
  await expect(index).toHaveCSS("outline-offset", "3px");

  await page.locator(".catalog-guide").evaluate((element) => {
    (element as HTMLElement).style.setProperty("--elea-color-neutral-600", "#555d6a");
  });
  await disc.focus();
  await expect(disc).toHaveCSS("outline-color", "rgb(85, 93, 106)");
  await expect(disc).toHaveCSS("outline-offset", "2px");

  await page.locator(".catalog-guide").evaluate((element) => {
    (element as HTMLElement).style.setProperty("--elea-control-focus-outline", "3px dashed #258343");
  });
  for (const button of [primary, disc]) {
    await button.focus();
    await expect(button).toHaveCSS("outline-color", "rgb(37, 131, 67)");
    await expect(button).toHaveCSS("outline-width", "3px");
    await expect(button).toHaveCSS("outline-style", "dashed");
    await expect(button).toHaveCSS("outline-offset", "2px");
  }
});

test("the tab guide demonstrates keyboard navigation and exposes its example code", async ({ page }) => {
  await page.goto(catalog);
  await page.getByRole("link", { name: "Tabs", exact: true }).click();
  const list = page.getByRole("tablist", { name: "Article information" });
  await list.getByRole("tab", { name: "Details" }).focus();
  await page.keyboard.press("End");
  await expect(list.getByRole("tab", { name: "Revisions" })).toBeFocused();
  await expect(page.getByRole("tabpanel", { name: "Revisions" })).toContainText("Two revisions");
  await page.keyboard.press("ArrowRight");
  await expect(list.getByRole("tab", { name: "Details" })).toBeFocused();
  const code = page.locator("pre", { hasText: "<Tabs label" });
  await expect(code).toBeHidden();
  await page.getByText("View code", { exact: true }).first().click();
  await expect(code).toBeVisible();
  await expect(page.getByRole("button", { name: "Copy code" })).toBeVisible();
  await expect(page.getByRole("region", { name: "Component props" })).toContainText("keepMounted");
  await expect(page.getByRole("region", { name: "Component parts" })).toContainText("TabPanel");

  const segmented = page.getByRole("tablist", { name: "Article sections" });
  await expect(segmented).toHaveAttribute("data-elea-tabs", "segmented");
  await segmented.getByRole("tab", { name: "Details" }).press("ArrowRight");
  await expect(segmented.getByRole("tab", { name: "Revisions" })).toBeFocused();

  const composed = page.getByRole("tablist", { name: "Comments" });
  await expect(composed).toHaveAttribute("data-elea-tabs", "rail");
  await composed.getByRole("tab", { name: "Open 3" }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(composed.getByRole("tab", { name: "Resolved 12" })).toBeFocused();
  await expect(page.getByRole("tabpanel", { name: "Resolved 12" })).toContainText("Twelve comments");
  await expect(page.getByRole("heading", { name: "Keyboard and accessibility" })).toBeVisible();
});

test("the radio guide submits the selected value with native form behaviour", async ({ page }) => {
  await page.goto(`${catalog}/radio-group`);
  const group = page.getByRole("group", { name: "Email delivery" });
  await expect(group.getByRole("radio", { name: "Weekly digest" })).toBeChecked();
  await group.getByRole("radio", { name: "Weekly digest" }).focus();
  await page.keyboard.press("ArrowUp");
  await expect(group.getByRole("radio", { name: "Daily digest" })).toBeChecked();
  await expect(group.getByRole("radio", { name: "Every update" })).toBeDisabled();
  await page.getByRole("button", { name: "Save preferences" }).click();
  await expect(page.getByRole("status")).toHaveText("Saved delivery: daily");
});

test("a narrow viewport fits the catalogue and a guide with expanded code", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 760 });
  await page.goto(catalog);
  const main = page.getByRole("main");
  await expect(main.getByRole("heading", { name: "Components" })).toBeVisible();
  const pageWidth = () => page.locator("body").evaluate((element) => element.scrollWidth);
  expect(await pageWidth()).toBeLessThanOrEqual(320);
  await main.getByRole("link", { name: "Tabs", exact: true }).click();
  for (const toggle of await main.getByText("View code", { exact: true }).all()) await toggle.click();
  await expect(main.getByRole("region", { name: "Component props" })).toBeVisible();
  expect(await pageWidth()).toBeLessThanOrEqual(320);
  await main.getByRole("navigation", { name: "Breadcrumb" }).getByRole("link", { name: "Components" }).click();
  await expect(main.getByRole("searchbox", { name: "Search components" })).toBeVisible();
});

test("the display guides show cards, avatars and separators with their fallbacks", async ({ page }) => {
  await page.goto(catalog);
  const main = page.getByRole("main");
  await main.getByRole("button", { name: "Display" }).click();
  await expect(main.getByRole("status")).toHaveText("3 component guides");
  await main.getByRole("link", { name: "Card", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Autumn field notes", level: 3 })).toBeVisible();
  const interactive = page.locator(".elea-card--interactive").first();
  const box = (await interactive.boundingBox())!;
  await interactive.click({ position: { x: box.width - 6, y: box.height - 6 } });
  await expect(page).toHaveURL(/#\/ui\/button$/);

  await page.goto(`${catalog}/avatar`);
  await expect(page.getByRole("img", { name: "Grace Hopper" }).first()).toHaveText("GH");
  await expect(page.locator(".demo__stage img[alt='Ada Lovelace']")).toBeVisible();
  const editors = page.getByRole("group", { name: "Editors" });
  await expect(editors.locator(".elea-avatar")).toHaveCount(4);
  await expect(editors).toContainText("+2");

  await page.goto(`${catalog}/separator`);
  await expect(page.locator(".demo__stage .elea-separator", { hasText: "or" })).toBeVisible();
  const vertical = page.locator(".demo__stage .elea-separator--vertical").first();
  expect((await vertical.boundingBox())!.height).toBeGreaterThan(10);
});

test("the feedback guides dismiss an alert, advance a progress bar and swap a skeleton for content", async ({ page }) => {
  await page.goto(`${catalog}/alert`);
  const alert = page.locator(".elea-alert", { hasText: "Two people are editing this article" });
  await alert.getByRole("button", { name: "Dismiss" }).click();
  await expect(alert).toHaveCount(0);
  await page.getByRole("button", { name: "Show the alert again" }).click();
  await expect(alert).toBeVisible();

  await page.goto(`${catalog}/progress`);
  const bar = page.getByRole("progressbar", { name: "Uploading images" });
  await expect(bar).toHaveAttribute("aria-valuetext", "3 of 8 files");
  await page.getByRole("button", { name: "Upload next file" }).click();
  await expect(bar).toHaveAttribute("aria-valuenow", "4");
  await expect(page.getByText("4 of 8 files")).toBeVisible();
  await expect(page.getByRole("progressbar", { name: "Preparing the export" })).not.toHaveAttribute("aria-valuenow");

  await page.goto(`${catalog}/skeleton`);
  const article = page.getByRole("article", { name: "Article preview" });
  await expect(article).toHaveAttribute("aria-busy", "true");
  await expect(article.locator(".elea-skeleton")).toHaveCount(5);
  await page.getByText("Loading", { exact: true }).click();
  await expect(article).toHaveAttribute("aria-busy", "false");
  await expect(article).toContainText("Cranes crossed the valley");
});

test("each companion skeleton has the box of its loaded component", async ({ page }) => {
  await page.goto(`${catalog}/skeleton`);
  const targets = { avatar: ".elea-avatar", button: ".elea-button", badge: ".elea-badge", field: ".elea-field", card: ".elea-card", table: ".elea-table" };
  for (const [pair, target] of Object.entries(targets)) {
    const boxes = page.locator(`[data-pair="${pair}"] ${target}`);
    await expect(boxes).toHaveCount(2);
    const [skeleton, loaded] = await Promise.all([boxes.nth(0).boundingBox(), boxes.nth(1).boundingBox()]);
    expect(skeleton!.height, `${pair} height`).toBeGreaterThan(10);
    expect(skeleton!.height, `${pair} height`).toBeCloseTo(loaded!.height, 1);
    expect(skeleton!.width, `${pair} width`).toBeCloseTo(loaded!.width, 1);
  }
  const parts = { field: ".elea-field__label, .elea-ui-input, .elea-field__help", card: '[class^="elea-card__"]', table: "tr" };
  for (const [pair, part] of Object.entries(parts)) {
    const sides = page.locator(`[data-pair="${pair}"] > *`);
    const heights = (side: number) => sides.nth(side).locator(part).evaluateAll((nodes) => nodes.map((node) => Math.round(node.getBoundingClientRect().height * 10) / 10));
    const held = await heights(0);
    expect(held.length, `${pair} parts`).toBeGreaterThan(1);
    expect(held, `${pair} parts`).toEqual(await heights(1));
  }
});

test("a wrapping skeleton keeps the box of its children, and a region waits out its delay", async ({ page }) => {
  await page.goto(`${catalog}/skeleton`);
  const wrap = page.locator('[data-demo="wrap"]');
  // Offsets from the first box, so that scrolling the page between the two readings does not count.
  const boxes = () => wrap.locator(".elea-skeleton-wrap > *").evaluateAll((nodes) => {
    const origin = nodes[0]!.getBoundingClientRect();
    return nodes.map((node) => { const { x, y, width, height } = node.getBoundingClientRect(); return [x - origin.x, y - origin.y, width, height].map(Math.round); });
  });
  await expect(wrap.locator(".elea-skeleton-wrap--loading")).toHaveCount(4);
  await expect(wrap.getByRole("button")).toHaveCount(0);
  await expect(wrap.locator("strong")).toHaveCSS("color", "rgba(0, 0, 0, 0)");
  const loading = await boxes();
  await page.getByText("Loading the profile", { exact: true }).click();
  await expect(wrap.getByRole("button", { name: "Follow" })).toBeVisible();
  expect(await boxes()).toEqual(loading);
  await expect(page.locator('[data-demo="count"] .elea-skeleton--rect')).toHaveCount(3);
  const branded = page.locator('[data-demo="block-class"] .elea-skeleton');
  await expect(branded).toHaveCount(6);
  await expect(page.locator('[data-demo="block-class"] .catalog-skeleton-brand')).toHaveCount(6);
  for (const placeholder of await branded.all()) await expect(placeholder).toHaveCSS("border-radius", /^(9999px|3\.35544e\+07px)$/);

  const region = page.locator('[data-demo="region"]');
  const status = region.getByRole("status");
  await expect(region).toHaveAttribute("aria-busy", "false");
  await page.getByRole("button", { name: "Reload slowly" }).click();
  await expect(region).toHaveAttribute("aria-busy", "true");
  await expect(region.locator(".elea-skeleton").first()).toBeHidden();
  await expect(status).toHaveText("Loading orders");
  await expect(region.locator(".elea-skeleton").first()).toBeVisible();
  await expect(region.getByRole("cell", { name: "Shipped" })).toBeVisible();
  await expect(status).toHaveText("");
});

test("the new guides fit a narrow viewport", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 760 });
  for (const slug of ["card", "separator", "skeleton", "avatar", "alert", "progress", "table", "accordion", "slider", "toast", "popover", "sheet"]) {
    await page.goto(`${catalog}/${slug}`);
    await expect(page.getByRole("region", { name: "Component props" }).first()).toBeVisible();
    expect(await page.locator("body").evaluate((element) => element.scrollWidth), slug).toBeLessThanOrEqual(320);
  }
});

test("the table guide sorts its rows and keeps a wide table inside its region", async ({ page }) => {
  await page.goto(`${catalog}/table`);
  const region = page.getByRole("region", { name: "Articles" });
  const words = region.getByRole("columnheader", { name: "Words" });
  await expect(words).toHaveAttribute("aria-sort", "descending");
  await expect(region.getByRole("rowheader").first()).toHaveText("A winter herbarium");
  await words.getByRole("button").click();
  await expect(words).toHaveAttribute("aria-sort", "ascending");
  await expect(region.getByRole("rowheader").first()).toHaveText("Cranes over the valley");
  await region.getByRole("button", { name: "Article" }).click();
  await expect(words).toHaveAttribute("aria-sort", "none");
  await expect(region.getByRole("rowheader").first()).toHaveText("A winter herbarium");
  await expect(page.locator("tr[data-selected]")).toHaveCount(1);
  const revisions = page.getByRole("region", { name: "Revisions" });
  await revisions.evaluate((element) => { element.scrollTop = 200; });
  const top = (await revisions.boundingBox())!.y;
  expect(Math.abs((await revisions.getByRole("columnheader", { name: "Editor" }).boundingBox())!.y - top)).toBeLessThan(2);
});

test("the accordion guide folds sections and moves between headings with the arrow keys", async ({ page }) => {
  await page.goto(`${catalog}/accordion`);
  const publish = page.getByRole("button", { name: "Who can publish an article?" });
  const history = page.getByRole("button", { name: "How long are revisions kept?" });
  await expect(publish).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByRole("region", { name: "Who can publish an article?" })).toBeVisible();
  await expect(page.getByRole("region", { name: "How long are revisions kept?" })).toBeHidden();
  await publish.focus();
  await page.keyboard.press("ArrowDown");
  await expect(history).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(history).toHaveAttribute("aria-expanded", "true");
  await expect(publish).toHaveAttribute("aria-expanded", "false");
  await expect(page.getByRole("region", { name: "How long are revisions kept?" })).toContainText("Every revision of the last ninety days");
  await expect(page.getByRole("region", { name: "Who can publish an article?" })).toBeHidden();
  await page.getByRole("button", { name: "Billing" }).click();
  await expect(page.getByText("Open: members, billing")).toBeVisible();
  await expect(page.getByRole("button", { name: "Archive" })).toBeDisabled();
});

test("the slider guide moves with the keyboard and words its value", async ({ page }) => {
  await page.goto(`${catalog}/slider`);
  const volume = page.getByRole("slider", { name: "Volume" });
  await volume.focus();
  await page.keyboard.press("ArrowRight");
  await expect(volume).toHaveValue("41");
  await expect(page.locator(".demo__stage .elea-slider__value").first()).toHaveText("41");
  const width = page.getByRole("slider", { name: "Reading width" });
  await width.focus();
  await page.keyboard.press("End");
  await expect(width).toHaveAttribute("aria-valuetext", "96 characters");
  await expect(page.getByText("96 characters")).toBeVisible();
  await expect(page.getByRole("slider", { name: "Locked" })).toBeDisabled();
});

test("the toast guide shows, replaces and dismisses toasts without taking the focus", async ({ page }) => {
  await page.goto(`${catalog}/toast`);
  const region = page.getByRole("region", { name: "Notifications" });
  const success = page.getByRole("button", { name: "Success", exact: true });
  await success.click();
  await expect(success).toBeFocused();
  await expect(region.locator(".elea-toast--success")).toContainText("Article published");
  await page.getByRole("button", { name: "Danger", exact: true }).click();
  await expect(region.getByRole("alert")).toContainText("The article could not be saved");
  await region.getByRole("alert").getByRole("button", { name: "Dismiss" }).click();
  await expect(region.getByRole("alert")).toHaveCount(0);
  await page.getByRole("button", { name: "Archive the article" }).click();
  await region.getByRole("button", { name: "Undo" }).click();
  await expect(region.getByText("Article restored")).toBeVisible();
  await expect(region.getByText("Article moved to the archive")).toHaveCount(0);
  await page.getByRole("button", { name: "Dismiss all" }).click();
  await expect(region.locator(".elea-toast")).toHaveCount(0);
  await page.getByRole("button", { name: "Export the articles" }).click();
  await expect(region.getByText("Preparing the export…")).toBeVisible();
  await expect(region.getByText("Export ready")).toBeVisible();
  await expect(region.locator(".elea-toast")).toHaveCount(1);
  await page.getByRole("button", { name: "top-center" }).click();
  await expect(region).toHaveClass(/elea-toasts--top-center/);
  expect((await region.locator(".elea-toast").first().boundingBox())!.y).toBeLessThan(200);
});

test("the popover guide opens a form, keeps the page usable and returns the focus", async ({ page }) => {
  await page.goto(`${catalog}/popover`);
  const invite = page.getByRole("button", { name: "Invite" });
  await invite.click();
  const panel = page.getByRole("dialog", { name: "Invite a reader" });
  const email = panel.getByRole("textbox", { name: "Email" });
  await expect(email).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(panel).toBeHidden();
  await expect(invite).toBeFocused();
  await invite.click();
  await email.fill("reader@example.org");
  await panel.getByRole("button", { name: "Send" }).click();
  await expect(panel).toBeHidden();
  await expect(page.getByText("Last invitation: reader@example.org")).toBeVisible();
  const top = page.getByRole("button", { name: "Top end" });
  await top.click();
  const revision = page.getByRole("dialog", { name: "Last revision" });
  const triggerBox = (await top.boundingBox())!;
  // The panel grows into place, so its edges are read once the entrance has settled.
  await expect.poll(async () => { const box = (await revision.boundingBox())!; return Math.abs(box.x + box.width - (triggerBox.x + triggerBox.width)) < 1; }).toBe(true);
  const panelBox = (await revision.boundingBox())!;
  expect(panelBox.y + panelBox.height).toBeLessThanOrEqual(triggerBox.y);
  await page.getByRole("button", { name: "Filters" }).click();
  await expect(revision).toBeHidden();
  await expect(page.getByText("The popover is open. Showing: drafts")).toBeVisible();
  await page.getByRole("checkbox", { name: "Published" }).check();
  await page.getByRole("heading", { name: "Props", exact: true }).click();
  await expect(page.getByText("The popover is closed. Showing: drafts, published")).toBeVisible();
});

test("a click in a popover does not activate the row it is declared in", async ({ page }) => {
  await page.goto(`${catalog}/popover`);
  const row = page.locator('[data-demo="row"]');
  await row.getByRole("button", { name: "Rename" }).click();
  const panel = page.getByRole("dialog", { name: "Rename" });
  await panel.getByRole("textbox", { name: "Title" }).fill("Cranes at dawn");
  await panel.click({ position: { x: 4, y: 4 } });
  await panel.getByRole("button", { name: "Done" }).click();
  await expect(panel).toBeHidden();
  await expect(row.getByText("Cranes at dawn")).toBeVisible();
  await expect(page.getByText("The row was opened 0 times.")).toBeVisible();
  await row.getByText("Cranes at dawn").click();
  await expect(page.getByText("The row was opened 1 times.")).toBeVisible();
});

test("one confirmation serves every row of a scrolling list without being cut", async ({ page }) => {
  await page.goto(`${catalog}/popover`);
  const scroller = page.locator(".catalog-popover-scroll");
  const last = page.getByRole("button", { name: "Delete Changelog" });
  await last.scrollIntoViewIfNeeded();
  await last.focus();
  await page.keyboard.press("Enter");
  const panel = page.getByRole("alertdialog", { name: "Delete Changelog?" });
  const keep = panel.getByRole("button", { name: "Keep" });
  const confirm = panel.getByRole("button", { name: "Delete" });
  await expect(keep).toBeFocused();
  expect(await panel.evaluate((element) => element.matches(":popover-open"))).toBe(true);
  // The panel leaves the box of the scrolling container, and every edge of it is still painted.
  await expect.poll(async () => panel.evaluate((element) => element.getAnimations().length)).toBe(0);
  const clip = (await scroller.boundingBox())!;
  const box = (await panel.boundingBox())!;
  expect(box.y + box.height > clip.y + clip.height || box.y < clip.y).toBe(true);
  expect(await panel.evaluate((element) => {
    const { left, top, right, bottom } = element.getBoundingClientRect();
    const [x, y] = [(left + right) / 2, (top + bottom) / 2];
    const edges = [[left + 2, y], [right - 2, y], [x, top + 2], [x, bottom - 2]];
    return top >= 0 && left >= 0 && bottom <= window.innerHeight && right <= window.innerWidth && edges.every(([px, py]) => element.contains(document.elementFromPoint(px!, py!)));
  })).toBe(true);
  await page.keyboard.press("Tab");
  await expect(confirm).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(keep).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(confirm).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(panel).toBeHidden();
  await expect(last).toBeFocused();
  await expect(page.getByRole("alertdialog")).toHaveCount(0);

  const first = page.getByRole("button", { name: "Delete Field notes" });
  await first.click();
  const other = page.getByRole("alertdialog", { name: "Delete Field notes?" });
  await other.getByRole("button", { name: "Delete" }).click();
  await expect(other.getByRole("button", { name: "Keep" })).toBeDisabled();
  await expect(other.getByRole("button", { name: "Delete" })).toBeDisabled();
  await expect(other.getByRole("button", { name: "Delete" })).toHaveAttribute("aria-busy", "true");
  await expect(other).toBeHidden();
  await expect(first).toHaveCount(0);
  await expect(page.getByText("5 articles.")).toBeVisible();
});

test("a popover stays inside the viewport at its bottom and right edges, and follows its anchor", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 520 });
  await page.goto(`${catalog}/popover`);
  const inside = async (panel: import("@playwright/test").Locator) => {
    await expect.poll(async () => panel.evaluate((element) => element.getAnimations().length)).toBe(0);
    const box = (await panel.boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(360);
    expect(box.y + box.height).toBeLessThanOrEqual(520);
    return box;
  };
  // Bottom edge: the anchor sits on the last pixels of the viewport, so the panel opens above it.
  const archive = page.locator('button[aria-haspopup="dialog"]', { hasText: "Archive" });
  await archive.evaluate((element) => window.scrollBy(0, element.getBoundingClientRect().bottom - window.innerHeight + 4));
  await archive.click();
  const panel = page.getByRole("alertdialog", { name: "Archive this article?" });
  const box = await inside(panel);
  const anchor = (await archive.boundingBox())!;
  expect(box.y + box.height).toBeLessThanOrEqual(anchor.y);
  await expect(panel).toHaveAttribute("data-side", "top");
  // It follows the anchor when the page scrolls, and closes once the anchor is out of sight. The button moves a little under the pointer, hence the margin.
  await page.mouse.wheel(0, 40);
  await expect.poll(async () => { const now = (await panel.boundingBox())!; const at = (await archive.boundingBox())!; return Math.abs(now.y + now.height + 8 - at.y) < 3; }).toBe(true);
  await page.mouse.wheel(0, -2000);
  await expect(panel).toBeHidden();
  await expect(page.getByText("Last answer: Archive cancelled.")).toBeVisible();
  // Right edge: a virtual anchor on the last pixels of the zone, at the right of a narrow viewport.
  const zone = page.getByRole("button", { name: "Click anywhere in this area" });
  await zone.scrollIntoViewIfNeeded();
  const area = (await zone.boundingBox())!;
  await zone.click({ position: { x: area.width - 3, y: area.height / 2 } });
  const position = page.getByRole("dialog", { name: "Position" });
  await inside(position);
  await page.keyboard.press("Escape");
  await expect(position).toBeHidden();
});

test("the sheet guide docks a modal panel to each edge and scrolls its body", async ({ page }) => {
  await page.goto(`${catalog}/sheet`);
  const opener = page.getByRole("button", { name: "Edit details" });
  await opener.click();
  const sheet = page.getByRole("dialog", { name: "Article details" });
  await expect(sheet.getByRole("button", { name: "Close" })).toBeFocused();
  const viewport = page.viewportSize()!;
  await expect.poll(async () => { const box = (await sheet.boundingBox())!; return Math.round(box.x + box.width); }).toBe(viewport.width);
  expect((await sheet.boundingBox())!.height).toBe(viewport.height);
  await page.keyboard.press("Escape");
  await expect(sheet).toBeHidden();
  await expect(opener).toBeFocused();
  await page.getByRole("button", { name: "bottom", exact: true }).click();
  const revisions = page.getByRole("dialog", { name: "Revisions" });
  await expect.poll(async () => { const box = (await revisions.boundingBox())!; return Math.round(box.y + box.height); }).toBe(viewport.height);
  expect((await revisions.boundingBox())!.height).toBeLessThanOrEqual(viewport.height * 0.4 + 1);
  expect(await revisions.locator(".elea-sheet__body").evaluate((body) => body.scrollHeight > body.clientHeight)).toBe(true);
  await page.mouse.click(viewport.width / 2, 20);
  await expect(revisions).toBeHidden();
  await page.getByRole("button", { name: "start", exact: true }).click();
  await expect.poll(async () => (await revisions.boundingBox())!.x).toBe(0);
});

test("a confirmation collects a value with the answer", async ({ page }) => {
  await page.goto(`${catalog}/popover`);
  await page.getByRole("button", { name: "Reject", exact: true }).click();
  const reject = page.getByRole("alertdialog", { name: "Reject this article?" });
  const reason = reject.getByRole("textbox", { name: "Reason" });
  await expect(reason).toBeFocused();
  await reason.fill("  Off topic ");
  await reason.press("Enter");
  await expect(reject).toBeHidden();
  await expect(page.getByText('Received: "Off topic".')).toBeVisible();

  await page.getByRole("button", { name: "Refuse", exact: true }).click();
  const refuse = page.getByRole("alertdialog", { name: "Refuse the request" });
  const confirm = refuse.getByRole("button", { name: "Refuse" });
  await expect(confirm).toBeDisabled();
  await expect(confirm).toHaveAccessibleDescription("Comment");
  const comment = refuse.getByRole("textbox", { name: "Comment" });
  await comment.fill("Missing sources");
  await comment.press("Enter");
  await expect(refuse).toBeVisible();
  await comment.press("Control+Enter");
  await expect(refuse).toBeHidden();
  await expect(page.getByText("Received: \"Missing sources")).toBeVisible();

  await page.goto(`${catalog}/dialog`);
  await page.getByRole("button", { name: "Delete project" }).click();
  const remove = page.getByRole("dialog", { name: "Delete this project?" });
  const name = remove.getByRole("textbox");
  await expect(name).toBeFocused();
  await name.fill("field-note");
  await expect(remove.getByRole("button", { name: "Delete" })).toBeDisabled();
  await name.fill("field-notes");
  await remove.getByRole("button", { name: "Delete" }).click();
  await expect(remove).toBeHidden();
  await expect(page.getByText("Deleted: field-notes.")).toBeVisible();
});

test("pagination shows the labels of previous and next where there is room for them", async ({ page }) => {
  await page.goto(`${catalog}/pagination`);
  const wide = page.getByRole("navigation", { name: "Pagination", exact: true }).last();
  const next = wide.getByRole("button", { name: "Next" });
  await expect(next).toHaveText("Next›");
  await expect(next.locator(".elea-pagination__label")).toBeVisible();
  await expect(wide.getByRole("button", { name: "Previous" })).toHaveText("‹Previous");
  const narrow = page.getByRole("navigation", { name: "Pagination in a narrow container" });
  await expect(narrow.getByRole("button", { name: "Next" }).locator(".elea-pagination__label")).toBeHidden();
  await expect(narrow.getByRole("button", { name: "Next" }).locator(".elea-pagination__arrow")).toBeVisible();
  await narrow.getByRole("button", { name: "Next" }).click();
  await expect(narrow.getByRole("button", { name: "Page 4" })).toHaveAttribute("aria-current", "page");
});
