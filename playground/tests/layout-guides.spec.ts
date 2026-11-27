import { expect, test } from "@playwright/test";

const catalog = "/elea/playground/#/ui";

for (const width of [320, 1440]) {
  test(`hero photography selects the right source at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(`${catalog}/hero`);
    const cover = page.getByRole("img", { name: /crevasses/ });
    await expect(cover).toHaveAttribute("srcset", "/elea/assets/glacier-560.webp 560w, /elea/assets/glacier.webp 1050w");
    await expect(cover).toHaveAttribute("sizes", "(min-width: 75rem) 52rem, (min-width: 55rem) 65vw, 100vw");
    await cover.scrollIntoViewIfNeeded();
    // Browsers choose a resolution based on density, available resources and cache state.
    await expect.poll(() => cover.evaluate((img: HTMLImageElement) =>
      img.complete && img.naturalWidth > 0 ? new URL(img.currentSrc).pathname : ""
    )).toMatch(/^\/elea\/assets\/glacier(?:-560)?\.webp$/);
    const availableWidths = await cover.evaluate((img: HTMLImageElement) => Promise.all(
      img.srcset.split(",").map(async candidate => {
        const rendition = new Image();
        rendition.src = candidate.trim().split(" ")[0]!;
        await rendition.decode();
        return rendition.naturalWidth;
      })
    ));
    expect(availableWidths).toEqual([560, 1050]);

    const feature = page.getByRole("img", { name: /lighthouse/ });
    const expectedCrop = width === 320 ? "harbour-light-square.webp" : "harbour-light.webp";
    await feature.scrollIntoViewIfNeeded();
    await expect.poll(() => feature.evaluate((img: HTMLImageElement) =>
      img.complete && img.naturalWidth > 0 ? new URL(img.currentSrc).pathname : ""
    )).toBe(`/elea/assets/${expectedCrop}`);
  });
}

test("the catalogue links to a photographic cover and a responsive image-led feature", async ({ page }) => {
  await page.goto(catalog);
  const main = page.getByRole("main");
  await expect(main.getByRole("region", { name: "Components" })).toBeVisible();
  await main.getByRole("searchbox", { name: "Search components" }).fill("Hero");
  await main.getByRole("link", { name: "Hero", exact: true }).click();

  const cover = main.getByRole("region", { name: "The glacier notebook" });
  const coverImage = cover.getByRole("img", { name: /crevasses/ });
  await expect.poll(() => coverImage.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
  const coverHeading = await cover.getByRole("heading").boundingBox();
  const image = await coverImage.boundingBox();
  expect(coverHeading!.y).toBeGreaterThan(image!.y);
  expect(coverHeading!.y + coverHeading!.height).toBeLessThan(image!.y + image!.height);

  const feature = main.getByRole("region", { name: "Harbour light" });
  const photo = feature.getByRole("img", { name: /lighthouse/ });
  expect((await photo.boundingBox())!.x).toBeLessThan((await feature.getByRole("heading").boundingBox())!.x);
  await page.setViewportSize({ width: 320, height: 800 });
  const action = feature.getByRole("button", { name: "Compare crops" });
  const button = (await action.boundingBox())!;
  expect((await photo.boundingBox())!.y).toBeGreaterThan(button.y + button.height);
  await action.click();
  await expect(action).toHaveAttribute("aria-pressed", "true");
  await expect.poll(() => photo.evaluate((img: HTMLImageElement) => new URL(img.currentSrc).pathname)).toBe("/elea/assets/harbour-light.webp");
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  await cover.getByRole("button", { name: "Open the notebook" }).press("Enter");
  await expect(cover.getByRole("button", { name: "Close the notebook" })).toBeVisible();
  const atlas = main.getByRole("region", { name: "The colour atlas" });
  await atlas.getByRole("button", { name: "Explore the palettes" }).click();
  await expect(atlas.getByText("Réserve", { exact: true })).toBeVisible();
  await expect(page).toHaveURL(/#\/ui\/hero$/);
});

test("the responsive masthead opens chapters, preserves focus on resize and keeps its utility visible", async ({ page, browserName }) => {
  await page.goto(`${catalog}/navbar?scheme=braise`);
  const navbar = page.getByRole("navigation", { name: "Design handbook", exact: true });
  const toggle = navbar.getByRole("button", { name: "Menu", exact: true });
  const current = navbar.getByRole("link", { name: "Colour atlas", exact: true });
  const browse = navbar.getByLabel("Browse guides");
  await expect(current).toHaveAttribute("aria-current", "page");
  await expect(toggle).toBeHidden();
  await browse.press("Enter");
  const first = navbar.getByRole("link", { name: "Hero", exact: true });
  const last = navbar.getByRole("link", { name: "Sidebar", exact: true });
  await expect(first).toBeVisible();
  const [firstBox, lastBox] = await Promise.all([first.boundingBox(), last.boundingBox()]);
  expect(lastBox!.y).toBeGreaterThanOrEqual(firstBox!.y + firstBox!.height);
  expect(Math.abs(lastBox!.x - firstBox!.x)).toBeLessThan(1);
  await browse.press("Escape");
  await expect(browse).toBeFocused();
  await expect(first).toBeHidden();

  await page.getByRole("heading", { name: "Navbar", exact: true, level: 1 }).click();
  await page.setViewportSize({ width: 320, height: 800 });
  await expect(current).toBeHidden();
  await expect(navbar.getByRole("link", { name: "Studio" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Editorial tools" }).getByRole("link", { name: "Editor" })).toBeVisible();
  await toggle.press("Enter");
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press(browserName === "webkit" && process.platform === "darwin" ? "Alt+Tab" : "Tab");
  await expect(browse).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(toggle).toBeFocused();
  await page.setViewportSize({ width: 1400, height: 800 });
  await expect(browse).toBeFocused();
  await page.setViewportSize({ width: 320, height: 800 });
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await expect(browse).toBeFocused();
  await browse.press("Enter");
  await last.press("Enter");
  await expect(page.getByRole("heading", { name: "Sidebar", exact: true, level: 3 })).toBeVisible();
  await expect(toggle).toBeFocused();
  await expect(page).toHaveURL(/#\/ui\/navbar\?scheme=braise$/);
  await toggle.press("Enter");
  await browse.press("Enter");
  await expect(last).toHaveAttribute("aria-current", "page");
});

test("the columns menu changes its own preview and keeps the guide URL and site theme", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(`${catalog}/navbar?scheme=rasance`);
  const tools = page.getByRole("navigation", { name: "Editorial tools", exact: true });
  const handbook = page.getByRole("navigation", { name: "Design handbook", exact: true });
  const trigger = tools.locator("summary").filter({ hasText: "Tools" });
  const crop = tools.getByRole("link", { name: "Image crop", exact: true });
  const studio = tools.getByRole("link", { name: "Theme studio", exact: true });
  await trigger.click();
  await expect(crop).toBeVisible();
  const [first, second] = await Promise.all([crop.boundingBox(), studio.boundingBox()]);
  expect(Math.abs(second!.y - first!.y)).toBeLessThan(1);
  expect(second!.x).toBeGreaterThanOrEqual(first!.x + first!.width);
  await crop.click();
  await expect(page.getByRole("heading", { name: "Image crop", exact: true, level: 3 })).toBeVisible();
  await expect(crop).toBeHidden();
  await trigger.click();
  await expect(crop).toHaveAttribute("aria-current", "page");
  await expect(handbook.getByRole("link", { name: "Colour atlas", exact: true })).toHaveAttribute("aria-current", "page");
  const study = page.getByRole("button", { name: "Rasance", exact: true });
  await study.click();
  await expect(study).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("region", { name: "Handbook preview" }).getByRole("heading", { name: "Rasance" })).toBeVisible();
  await expect(page.getByRole("region", { name: "Tool preview" }).getByRole("heading", { name: "Image crop" })).toBeVisible();
  await handbook.getByRole("link", { name: "Design handbook", exact: true }).click();
  await expect(page.getByRole("region", { name: "Handbook preview" }).getByRole("heading", { name: "Design handbook" })).toBeVisible();
  await expect(page).toHaveURL(/#\/ui\/navbar\?scheme=rasance$/);
});

test("the handbook contents reveal the current chapter and navigate from a mobile drawer", async ({ page, browserName }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto(`${catalog}/sidebar`);
  const siteNav = page.getByRole("navigation", { name: "Design handbook" });
  await expect(siteNav.getByRole("button", { name: "Handbook menu" })).toBeVisible();
  const sidebar = page.getByRole("navigation", { name: "Library sections" });
  await expect(sidebar.getByRole("link", { name: "Letterforms", exact: true })).toHaveAttribute("aria-current", "page");
  const type = sidebar.getByLabel("Browse typography");
  await type.press("Enter");
  await expect(sidebar.getByRole("link", { name: "Letterforms", exact: true })).toBeHidden();
  await type.press("Enter");
  const trigger = page.getByRole("button", { name: "Contents", exact: true });
  await trigger.press("Enter");
  const drawer = page.getByRole("dialog", { name: "Handbook contents" });
  await expect(drawer.getByRole("link", { name: "Letterforms", exact: true })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(drawer).toBeHidden();
  await expect(trigger).toBeFocused();
  await trigger.press("Space");
  await drawer.locator("summary", { hasText: "Page layout" }).press("Enter");
  const hero = drawer.getByRole("link", { name: "Hero", exact: true });
  await page.keyboard.press(browserName === "webkit" && process.platform === "darwin" ? "Alt+Tab" : "Tab");
  await expect(hero).toBeFocused();
  await hero.press("Enter");
  await expect(drawer).toBeHidden();
  await expect(trigger).toBeFocused();
  await expect(page.getByRole("heading", { name: "Hero", exact: true, level: 3 })).toBeVisible();
  await expect(sidebar.getByRole("link", { name: "Letterforms", exact: true })).toHaveAttribute("aria-current", "page");
  await trigger.click();
  await expect(drawer.getByRole("link", { name: "Hero", exact: true })).toHaveAttribute("aria-current", "page");
  await expect(page).toHaveURL(/#\/ui\/sidebar$/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
});
