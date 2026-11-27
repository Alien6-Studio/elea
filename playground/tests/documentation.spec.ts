import { expect, test, type Locator } from "@playwright/test";
import { execFileSync } from "node:child_process";

const left = (element: Locator) => element.evaluate((node) => node.getBoundingClientRect().left);

test.describe("the static ELEA Sans specimen", () => {
  test.use({ javaScriptEnabled: false });

  test("downloads the installable and web fonts without JavaScript", async ({ page }) => {
    await page.goto("/typography/");
    const link = page.getByRole("link", { name: "Download ELEA Sans", exact: true });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("download", /.*/);
    const [download] = await Promise.all([page.waitForEvent("download"), link.click()]);
    expect(download.suggestedFilename()).toMatch(/\.zip$/i);
    const file = await download.path();
    if (!file) throw new Error("Missing downloaded font archive");
    const entries = execFileSync("python3", ["-c", [
      "import sys, zipfile",
      "with zipfile.ZipFile(sys.argv[1]) as archive:",
      "    assert archive.testzip() is None",
      "    print('\\n'.join(entry.filename for entry in archive.infolist() if entry.file_size))",
    ].join("\n"), file], { encoding: "utf8" }).trim().split("\n");
    expect(entries).toEqual(expect.arrayContaining([
      "ELEASans-Variable.ttf", "ELEASans-Italic-Variable.ttf",
      "ELEASans-Variable.woff2", "ELEASans-Italic-Variable.woff2", "elea-sans.css", "LICENSE",
    ]));
  });

  for (const width of [320, 1440]) {
    test(`shows the letterforms and nine weights at ${width}px without JavaScript`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/typography/");
      await page.evaluate(() => document.fonts.ready);
      const main = page.getByRole("main");
      await expect(main.getByRole("heading", { level: 1, name: "Typography" })).toBeVisible();
      await expect(main.getByText("ELEA Sans", { exact: true }).first()).toBeVisible();
      await expect(main.getByRole("heading", { name: "Letterforms" })).toBeVisible();
      for (const role of ["combobox", "slider", "switch", "textbox"] as const) {
        await expect(main.getByRole(role)).toHaveCount(0);
      }
      await expect(page.getByText(/Instrument Sans|Roboto|Source Serif 4/)).toHaveCount(0);

      const glyphs = main.locator(".type-glyphs");
      for (const text of ["ABCDEFGHIJKLMNOPQRSTUVWXYZ", "abcdefghijklmnopqrstuvwxyz", "0123456789"]) {
        await expect(glyphs.getByText(text, { exact: true })).toBeVisible();
      }
      const smallCaps = main.locator(".type-small-caps");
      await expect(smallCaps).toBeVisible();
      await expect(smallCaps).toContainText(/[a-z]/);
      await expect(smallCaps).toHaveCSS("font-variant-caps", /^(all-)?small-caps$/);
      const reading = main.locator(".type-reading");
      await expect(reading).toBeVisible();
      await expect(reading).toContainText(/[a-z][.!?]/i);
      await expect(reading).toHaveCSS("font-family", /^"ELEA Sans"/);

      await expect(main.getByRole("heading", { level: 2, name: "Anatomy of a", exact: true })).toBeVisible();
      const plate = main.getByRole("img", { name: "Construction of lowercase a", exact: true });
      await expect(plate).toBeVisible();
      await expect(plate).toHaveAccessibleDescription(/baseline|side[ -]?bearings?|alignment/i);
      const ink = await plate.evaluate(svg => {
        if (!(svg instanceof SVGSVGElement)) throw new Error("Expected an inline SVG construction plate");
        const { width, height } = svg.getBBox();
        return { width, height };
      });
      expect(ink.width).toBeGreaterThan(0);
      expect(ink.height).toBeGreaterThan(0);
      const bounds = (await plate.boundingBox())!;
      expect(bounds.x).toBeGreaterThanOrEqual(0);
      expect(bounds.x + bounds.width).toBeLessThanOrEqual(width);

      const table = main.getByRole("table", { name: "Weights in roman and italic" });
      await expect(table.getByRole("row")).toHaveCount(10);
      await expect(table.getByRole("rowheader")).toHaveCount(9);
      const cells = table.getByRole("cell");
      await expect(cells).toHaveCount(18);
      const styles = await cells.evaluateAll(elements => elements.map(cell => {
        const { fontFamily, fontStyle, fontWeight } = getComputedStyle(cell);
        return [fontFamily.split(",")[0], fontStyle, fontWeight];
      }));
      expect(styles).toEqual([100, 200, 300, 400, 500, 600, 700, 800, 900].flatMap(weight =>
        ["normal", "italic"].map(style => ['"ELEA Sans"', style, String(weight)])));
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    });
  }
});

test("the construction plate shows each Latin letter and its own advance", async ({ page }) => {
  await page.goto("/typography/");
  const main = page.getByRole("main");
  const next = main.getByRole("button", { name: "Next letter", exact: true });
  const previous = main.getByRole("button", { name: "Previous letter", exact: true });
  const letters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
    + "ÀÁÂÃÄÆÇÈÉÊËÌÍÎÏÑÒÓÔÕÖÙÚÛÜÝàáâãäæçèéêëìíîïñòóôõöùúûüýÿŒœŸ";
  const position = main.getByRole("region", { name: "Glyph anatomy" }).getByRole("status");
  await expect(position).toHaveText("1 / " + letters.length);
  const outlines = new Set<string>();
  const guides = main.locator('.type-plate__guide line:is([y1="-510"][y2="-510"], [y1="0"][y2="0"])');
  const guidePositions = () => guides.evaluateAll(lines => lines.map(line => {
    const { left, right, top } = line.getBoundingClientRect();
    return { left, right, top };
  }));
  await page.evaluate(() => document.fonts.ready);
  await next.scrollIntoViewIfNeeded();
  const reference = await guidePositions();
  expect(reference).toHaveLength(2);
  expect(reference[0]!.top).toBeLessThan(reference[1]!.top);
  for (const line of reference) expect(line.right).toBeGreaterThan(line.left);

  for (const letter of letters) {
    const letterCase = letter === letter.toUpperCase() ? "uppercase" : "lowercase";
    await expect(main.getByRole("heading", { level: 2, name: `Anatomy of ${letter}`, exact: true })).toBeVisible();
    const plate = main.getByRole("img", { name: `Construction of ${letterCase} ${letter}`, exact: true });
    await expect(plate.getByText("X-height", { exact: true })).toBeVisible();
    expect(await guidePositions(), `Construction guides for ${letter}`).toEqual(reference);
    const outline = await plate.locator("path#regular-glyph").getAttribute("d");
    expect(outline).toMatch(/^M/);
    outlines.add(outline!);
    if (letter === "a" || letter === "b") {
      await expect(plate.locator('use[href="#regular-glyph"]').first()).toBeVisible();
      await expect(plate.getByText(letter === "a" ? "490 units" : "537 units", { exact: true })).toBeVisible();
    }
    if (["E", "L", "A", "É", "Œ"].includes(letter)) {
      const advance = await page.evaluate(async character => {
        const font = '400 1000px "ELEA Sans"';
        if (!(await document.fonts.load(font, character)).length) throw new Error("ELEA Sans failed to load");
        const context = document.createElement("canvas").getContext("2d")!;
        context.font = font;
        return Math.round(context.measureText(character).width);
      }, letter);
      await expect(plate.getByText(`${advance} units`, { exact: true })).toBeVisible();
    }
    if (letter === "g") await expect(plate.locator("text").filter({ hasText: /descender/i })).toBeVisible();
    if (letter === "A") await expect(plate.locator("text").filter({ hasText: /cap[ -]?height/i })).toBeVisible();
    await next.click();
  }
  expect(outlines.size).toBe(letters.length);
  await expect(main.getByRole("img", { name: "Construction of lowercase a", exact: true })).toBeVisible();
  await previous.click();
  await expect(main.getByRole("img", { name: "Construction of uppercase Ÿ", exact: true })).toBeVisible();
  await expect(position).toHaveText(letters.length + " / " + letters.length);
});

test("figures and symbols use the font's outlines, advances and fixed guides", async ({ page }) => {
  await page.goto("/typography/");
  const main = page.getByRole("main");
  await main.getByRole("button", { name: "Figures", exact: true }).click();
  const plate = main.locator("#glyph-diagram");
  const viewBox = await plate.getAttribute("viewBox");
  const outlines = new Set<string>();
  for (const [set, character] of [["figure", "0"], ["figure", "9"], ["symbol", "@"], ["symbol", "€"]] as const) {
    const navigation = main.getByRole("group", { name: "Glyph navigation" });
    await navigation.getByRole("button").last().dispatchEvent("keydown", { key: character });
    await expect(plate).toHaveAccessibleName(`Construction of ${set} ${character}`);
    await expect(plate).toHaveAttribute("viewBox", viewBox!);
    const advance = await page.evaluate(async c => {
      const font = '400 1000px "ELEA Sans"';
      await document.fonts.load(font, c);
      const ctx = document.createElement("canvas").getContext("2d")!;
      ctx.font = font;
      return Math.round(ctx.measureText(c).width);
    }, character);
    await expect(plate.getByText(`${advance} units`, { exact: true })).toBeVisible();
    const path = await plate.locator("#regular-glyph").getAttribute("d");
    expect(path).toMatch(/^M/);
    outlines.add(path!);
  }
  expect(outlines.size).toBe(4);
  await main.getByRole("button", { name: "Symbols", exact: true }).click();
  await expect(plate).toHaveAccessibleName("Construction of symbol !");
  await main.getByRole("button", { name: "Previous symbol" }).click();
  await expect(plate).toHaveAccessibleName("Construction of symbol €");
});

test("letter navigation responds to keys only while its controls have focus", async ({ page }) => {
  await page.goto("/typography/");
  const main = page.getByRole("main");
  const previous = main.getByRole("button", { name: "Previous letter", exact: true });
  const next = main.getByRole("button", { name: "Next letter", exact: true });
  const heading = main.getByRole("heading", { level: 2, name: /^Anatomy of / });
  const outside = page.getByRole("navigation", { name: "Main", exact: true }).getByRole("link", { name: "Typography", exact: true });
  await outside.press("ArrowRight");
  await expect(outside).toBeFocused();
  await expect(heading).toHaveText("Anatomy of a");
  await next.press("ArrowRight");
  await expect(next).toBeFocused();
  await expect(heading).toHaveText("Anatomy of b");
  await previous.press("ArrowLeft");
  await expect(previous).toBeFocused();
  await expect(heading).toHaveText("Anatomy of a");
  await next.press("End");
  await expect(heading).toHaveText("Anatomy of Ÿ");
  await next.dispatchEvent("keydown", { key: "œ" });
  await expect(heading).toHaveText("Anatomy of œ");
  await previous.press("Home");
  await expect(heading).toHaveText("Anatomy of a");
});

test.describe("typography on a touch screen", () => {
  test.use({ hasTouch: true, viewport: { width: 390, height: 844 } });

  test("swiping the construction plate turns one letter", async ({ page }) => {
    await page.goto("/typography/");
    const plate = page.getByRole("img", { name: "Construction of lowercase a", exact: true });
    await expect(page.getByRole("button", { name: "Next letter" })).toBeVisible();
    await plate.scrollIntoViewIfNeeded();
    const box = (await plate.boundingBox())!;
    const y = Math.round(box.y + box.height / 2);
    const touch = await page.context().newCDPSession(page);
    for (const [index, fraction] of [0.75, 0.5, 0.25].entries()) {
      await touch.send("Input.dispatchTouchEvent", {
        type: index === 0 ? "touchStart" : "touchMove",
        touchPoints: [{ x: Math.round(box.x + box.width * fraction), y }],
      });
    }
    await touch.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await expect(page.getByRole("img", { name: "Construction of lowercase b", exact: true })).toBeVisible();
  });
});

test("the header and footer retain the Galet mark and ELEA lettering across site typefaces", async ({ page }) => {
  for (const route of ["/getting-started/", "/playground/#/ui"]) {
    await page.goto(route);
    const marks = ["banner", "contentinfo"] as const;
    for (const role of marks) {
      const link = page.getByRole(role).getByRole("link", { name: "Elea", exact: true });
      await expect(link).toHaveText("elea");
      await expect(link).toHaveCSS("font-family", /^"ELEA Sans"/);
      await expect(link).toHaveCSS("font-weight", "400");
      const mark = await link.evaluate(async element => {
        const style = getComputedStyle(element, "::before");
        const url = style.maskImage.match(/^url\("(.*)"\)$/)?.[1];
        if (!url) return null;
        const image = new Image();
        image.src = url;
        await image.decode();
        return { ink: style.backgroundColor, visible: image.naturalWidth > 0 && parseFloat(style.width) > 0 };
      });
      expect(mark?.visible).toBe(true);
      expect(mark?.ink).toBe(await link.evaluate(element => getComputedStyle(element).color));
    }
    await page.evaluate(() => document.documentElement.style.setProperty("--elea-font-family-sans", "Georgia, serif"));
    for (const role of marks) {
      await expect(page.getByRole(role).getByRole("link", { name: "Elea", exact: true })).toHaveCSS("font-family", /^"ELEA Sans"/);
    }
  }
});

for (const width of [1571, 1440, 850, 390, 320]) {
  test(`the guides and tools share a navigation grid at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/getting-started/");
    await page.evaluate(() => document.fonts.ready);
    const main = page.getByRole("navigation", { name: "Main", exact: true });
    const guides = page.getByRole("navigation", { name: "Documentation", exact: true });
    const docs = main.getByRole("link", { name: "Docs", exact: true });
    const firstGuide = guides.getByRole("link", { name: "Getting started" });
    const primaryDestinations = () => main.getByRole("link").evaluateAll((links) =>
      links.map((link) => ({ label: link.textContent, href: link.getAttribute("href") })),
    );
    const destinations = await primaryDestinations();
    expect(await main.evaluate(nav => nav.scrollWidth - nav.clientWidth)).toBe(0);

    await expect(docs).toHaveAttribute("aria-current", "true");
    await expect(firstGuide).toHaveAttribute("aria-current", "page");
    await expect(main.getByRole("link", { name: "Typography", exact: true })).toHaveAttribute("href", "/typography/");
    await expect(guides.getByRole("link", { name: "Typography", exact: true })).toHaveCount(0);
    expect(Math.abs(await left(docs) - await left(firstGuide))).toBeLessThan(1);
    const wordmark = (await page.getByRole("banner").getByRole("link", { name: "Elea", exact: true }).boundingBox())!;
    const searchBox = (await page.locator("#site-search input").boundingBox())!;
    expect(searchBox.x - wordmark.x - wordmark.width).toBeGreaterThanOrEqual(4);
    if (width >= 1024) {
      const title = page.getByRole("heading", { level: 1 });
      const search = page.locator("#site-search");
      expect(Math.abs(await left(docs) - await left(title))).toBeLessThan(1);
      expect(Math.abs(await left(search) - await left(title))).toBeLessThan(1);
      expect((await search.boundingBox())!.width).toBeGreaterThan(400);
      const guideBar = (await guides.boundingBox())!;
      expect(guideBar.height).toBeLessThanOrEqual(40);
      expect((await title.boundingBox())!.y - guideBar.y - guideBar.height).toBeLessThan(50);
    }
    const integration = guides.getByRole("link", { name: "UI integration" });
    const box = await integration.boundingBox();
    expect(box!.x + box!.width).toBeLessThanOrEqual(width);
    await integration.click();
    await expect(page).toHaveURL(/\/components\/$/);
    await expect(page.getByRole("heading", { level: 1, name: "UI integration" })).toBeVisible();
    await expect(integration).toHaveAttribute("aria-current", "page");

    const guide = page.getByRole("main").getByRole("article");
    const example = guide.locator("pre").first();
    await expect(example).toContainText("<Button");
    await expect(example).toBeInViewport({ ratio: 0.9 });
    await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    await guide.getByRole("link", { name: "Try Button states" }).press("Enter");
    await expect(page).toHaveURL(/#\/ui\/button$/);
    await expect(page.getByRole("heading", { level: 1, name: "Button", exact: true })).toBeVisible();

    const components = main.getByRole("link", { name: "Components", exact: true });
    await components.click();
    await expect(page).toHaveURL(/#\/ui$/);
    await expect(page.getByRole("heading", { level: 1, name: "Components" })).toBeVisible();
    await expect(components).toHaveAttribute("aria-current", "true");
    await expect(docs).not.toHaveAttribute("aria-current", "true");
    expect(await primaryDestinations()).toEqual(destinations);
  });
}

for (const width of [1440, 320]) {
  for (const theme of ["light", "dark"] as const) {
    test(`public navigation is visible and keyboard operable at ${width}px in ${theme}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ colorScheme: theme });
      await page.goto("/");
      const main = page.getByRole("main");
      const nav = page.getByRole("navigation", { name: "Main", exact: true });

      await page.keyboard.press("Tab");
      await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
      await page.keyboard.press("Enter");
      await expect(main).toBeFocused();

      const destinations = [
        { label: "Docs", heading: "Getting started", url: /\/getting-started\/$/ },
        { label: "Components", heading: "Components", url: /#\/ui$/ },
        { label: "Typography", heading: "Typography", url: /\/typography\/$/ },
        { label: "Colours", heading: "Colours", url: /#\/colours$/ },
        { label: "Theme studio", heading: "Theme studio", url: /#\/theme\?scheme=reserve$/ },
        { label: "Editorial workspace", heading: "Editorial workspace", url: /#\/playground\?scheme=reserve$/ },
        { label: "Research", heading: "Research", url: /\/research\/$/ },
      ] as const;
      const labels = destinations.map(destination => destination.label);
      for (const destination of destinations) {
        await expect(nav.getByRole("link")).toHaveText(labels);
        await expect.poll(() => nav.evaluate((node) => node.scrollWidth - node.clientWidth)).toBe(0);
        const link = nav.getByRole("link", { name: destination.label, exact: true });
        await link.focus();
        await expect(link).toBeFocused();
        await page.keyboard.press("Enter");
        await expect(page).toHaveURL(destination.url);
        await expect(main.getByRole("heading", { name: destination.heading, exact: true, level: 1 })).toBeVisible();
        await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
        await expect(link).toHaveAttribute("aria-current", "true");
        await expect(nav.locator("a[aria-current]")).toHaveText([destination.label]);
        await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      }

      await page.goBack();
      await expect(page).toHaveURL(/#\/playground\?scheme=reserve$/);
      await expect(main.getByRole("heading", { name: "Editorial workspace", exact: true, level: 1 })).toBeVisible();
      await expect(nav.locator("a[aria-current]")).toHaveText(["Editorial workspace"]);
      await page.getByRole("contentinfo").getByRole("link", { name: "Elea", exact: true }).press("Enter");
      await expect(page).toHaveURL(/\/$/);
    });
  }
}

test("the site build identifies the library and playground behind the examples", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("contentinfo").getByRole("link", { name: "Versions and changes" }).click();
  const guide = page.getByRole("article");
  await expect(guide.getByRole("heading", { name: "Versions and changes" })).toBeVisible();
  const libraryExample = await guide.getByRole("link", { name: "run the theme shapes example" }).getAttribute("href");
  const playgroundGuide = await guide.getByRole("link", { name: "Build the guided examples" }).getAttribute("href");
  expect(libraryExample).toMatch(/\/blob\/[0-9a-f]{40}\/docs\/examples\/theme-shapes\.mjs$/);
  await expect(guide.getByRole("link", { name: "Read the changelog for this build" }))
    .toHaveAttribute("href", libraryExample!.replace("docs/examples/theme-shapes.mjs", "CHANGELOG.md"));
  expect(playgroundGuide).toMatch(/\/blob\/[0-9a-f]{40}\/README\.md$/);
  for (const link of [libraryExample!, playgroundGuide!]) {
    const revision = link.split("/blob/")[1]!.split("/")[0]!;
    await expect(guide.getByRole("link", { name: revision.slice(0, 10), exact: true })).toHaveAttribute("href", new RegExp("/tree/" + revision + "$"));
  }
  await guide.getByRole("link", { name: "Compare the nine theme shapes" }).click();
  await expect(page.getByRole("heading", { level: 2 })).toHaveCount(9);
  const reserve = page.locator('[data-elea-theme="reserve"]');
  const title = reserve.getByRole("textbox", { name: "Publication title" });
  await title.fill("Proof");
  await reserve.getByRole("button", { name: "Reset settings" }).click();
  await expect(title).toHaveValue("Field notes");
});
