import { expect, test } from "@playwright/test";
import { textContrast } from "./contrast.js";
import { readFile } from "node:fs/promises";

for (const colorScheme of ["light", "dark"] as const) {
  test(`button states and badge examples meet text contrast in ${colorScheme} mode`, async ({ page }) => {
    await page.emulateMedia({ colorScheme });
    await page.goto("/elea/playground/#/ui/button");
    await expect(page.locator("html")).toHaveAttribute("data-theme", colorScheme);
    await page.addStyleTag({ content: "* { transition: none !important; }" });
    for (const name of ["Primary", "Secondary", "Outline", "Ghost", "Danger", "Success", "Info", "Warning"]) {
      const button = page.getByRole("button", { name, exact: true });
      expect(await textContrast(button), name).toBeGreaterThanOrEqual(4.5);
      await button.hover();
      expect(await textContrast(button), `${name} hovered`).toBeGreaterThanOrEqual(4.5);
    }

    await page.goto("/elea/playground/#/ui/badge");
    await expect(page.getByRole("heading", { name: "Badge", exact: true })).toBeVisible();
    const badges = page.locator(".elea-badge");
    await expect(badges).toHaveCount(7);
    for (const badge of await badges.all()) {
      expect(await textContrast(badge), await badge.innerText()).toBeGreaterThanOrEqual(4.5);
    }
  });
}

test("loading the editor stylesheet after UI keeps standalone button styling", async ({ page }) => {
  await page.goto("/elea/playground/#/ui/button");
  const button = page.getByRole("button", { name: "Outline", exact: true });
  const styling = () => button.evaluate((element) => {
    const { backgroundColor, padding, fontSize } = getComputedStyle(element);
    return { backgroundColor, padding, fontSize };
  });
  const before = await styling();
  const stylesheet = await readFile(new URL(import.meta.resolve("@alien6-studio/elea-content-editor/styles.css")), "utf8");
  await page.addStyleTag({ content: stylesheet });
  expect(await styling()).toEqual(before);
});

test("button motion follows its container, the prop and the visitor preference", async ({ page }) => {
  await page.goto("/elea/playground/#/ui/button");
  await page.addStyleTag({ content: "* { transition: none !important; }" });
  const follows = page.getByRole("button", { name: "Follows the page", exact: true });
  const still = page.getByRole("button", { name: "Always still", exact: true });
  const transform = (button: typeof follows) => button.evaluate((element) => getComputedStyle(element).translate);
  await follows.hover();
  expect(await transform(follows)).toBe("0px -2px");
  await still.hover();
  expect(await transform(still)).toMatch(/^(none|0px)$/);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await follows.hover();
  expect(await transform(follows)).toMatch(/^(none|0px)$/);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.getByText("Expressive motion", { exact: true }).click();
  await expect(page.getByRole("switch", { name: "Expressive motion" })).not.toBeChecked();
  await follows.hover();
  expect(await transform(follows)).toMatch(/^(none|0px)$/);
});

test("Réserve previews every button effect on the same primary action", async ({ page }) => {
  await page.goto("/elea/playground/#/ui/button?scheme=reserve");
  const demo = page.locator("section.demo").filter({ has: page.getByRole("heading", { name: "Effects", exact: true }) });
  const buttons = demo.getByRole("button");
  await expect(buttons).toHaveText(["Lift", "Scale", "Push", "Shine", "Ripple", "Spotlight", "Magnetic", "Tilt"]);

  const appearance = (button: typeof buttons) => button.evaluate(element => {
    const { width, height } = element.getBoundingClientRect();
    const style = getComputedStyle(element);
    return {
      width, height, background: style.backgroundColor, text: style.color,
      corners: [style.borderTopLeftRadius, style.borderTopRightRadius, style.borderBottomRightRadius, style.borderBottomLeftRadius],
    };
  });
  const primary = await appearance(page.getByRole("button", { name: "Primary", exact: true }));
  const width = (await appearance(buttons.first())).width;
  expect(new Set(primary.corners).size).toBe(4);
  for (const button of await buttons.all()) {
    const name = await button.innerText();
    await expect(button).not.toHaveClass(/elea-button--(?:radius|shadow)-/);
    expect(await appearance(button), name).toEqual({ ...primary, width });
  }
  // Push rests on the edge it sinks into when pressed.
  await expect(demo.getByRole("button", { name: "Push", exact: true })).not.toHaveCSS("box-shadow", "none");
});

test("buttons take a size, a radius, a shadow and an effect that follows the pointer", async ({ page }) => {
  await page.goto("/elea/playground/#/ui/button");
  await page.addStyleTag({ content: "* { transition: none !important; }" });
  const named = (name: string) => page.getByRole("button", { name, exact: true });
  const style = (name: string, property: string) => named(name).evaluate((element, key) => getComputedStyle(element).getPropertyValue(key), property);
  expect([await style("Extra small", "min-height"), await style("Extra large", "min-height")]).toEqual(["26px", "58px"]);
  expect([await style("Publish (None)", "border-radius"), await style("Publish (Full)", "border-radius")]).toEqual(["0px", "9999px"]);
  const resting = await style("Theme default", "box-shadow");
  const elevated = await style("Medium shadow", "box-shadow");
  expect(resting).toBe("none");
  expect(elevated).not.toBe(resting);
  expect(elevated).toContain("7px 12px -9px");
  const hoverAt = async (name: string, x: number, y: number) => {
    const box = (await named(name).boundingBox())!;
    await page.mouse.move(box.x + box.width * x, box.y + box.height * y);
  };
  await named("Magnetic").scrollIntoViewIfNeeded();
  await hoverAt("Scale", 0.5, 0.5);
  expect(await style("Scale", "scale")).toBe("1.05");
  await page.mouse.down();
  expect(await style("Scale", "scale")).toBe("0.94");
  await page.mouse.up();
  await hoverAt("Push", 0.5, 0.5);
  await page.mouse.down();
  expect(await style("Push", "translate")).toBe("0px 4px");
  await page.mouse.up();
  await hoverAt("Magnetic", 0.5, 0.5);
  await hoverAt("Magnetic", 0.9, 0.5);
  const [pull] = (await style("Magnetic", "translate")).split(" ");
  expect(parseFloat(pull!)).toBeGreaterThan(3);
  await hoverAt("Tilt", 0.9, 0.5);
  expect(await style("Tilt", "transform")).toContain("matrix3d");
  await hoverAt("Spotlight", 0.25, 0.5);
  expect(await style("Spotlight", "background-image")).toContain("radial-gradient");
  await page.getByText("Expressive motion", { exact: true }).click();
  await hoverAt("Magnetic", 0.9, 0.5);
  expect(await style("Magnetic", "translate")).toMatch(/^(none|0px)$/);
  await hoverAt("Tilt", 0.9, 0.5);
  expect(await style("Tilt", "transform")).toMatch(/^(none|matrix\(1, 0, 0, 1, 0, 0\))$/);
});

test("the gallery switch sets motion for every guide and leaves the other pages alone", async ({ page }) => {
  await page.goto("/elea/playground/#/ui");
  const html = page.locator("html");
  const gallery = page.locator(".catalog");
  await expect(page.getByRole("switch", { name: "Expressive motion" })).toBeChecked();
  await expect(gallery).toHaveAttribute("data-elea-motion", "on");
  await expect(html).not.toHaveAttribute("data-elea-motion");
  await page.goto("/elea/playground/#/ui/choice");
  await page.addStyleTag({ content: "* { transition: none !important; }" });
  const toggle = page.locator(".elea-toggle", { hasText: "Notifications" });
  const pressedWidth = async () => {
    await toggle.hover();
    await page.mouse.down();
    const width = await toggle.locator(".elea-toggle__thumb").evaluate((thumb) => getComputedStyle(thumb).width);
    await page.mouse.up();
    return width;
  };
  expect(await pressedWidth()).toBe("24px");
  await page.getByText("Expressive motion", { exact: true }).click();
  await expect(gallery).toHaveAttribute("data-elea-motion", "off");
  expect(await pressedWidth()).toBe("20px");
  await page.goto("/elea/playground/#/ui/menu");
  await expect(page.getByRole("switch", { name: "Expressive motion" })).not.toBeChecked();
  // Each component has its own gesture, and every one of them scales to nothing with the switch.
  // Reloading drops the style that froze transitions above; the switch is remembered.
  await page.reload();
  await expect(page.getByRole("switch", { name: "Expressive motion" })).not.toBeChecked();
  const gestures = () => gallery.evaluate((demo) => {
    const probe = (className: string, property: string, pseudo?: string) => {
      const element = demo.appendChild(document.createElement("div"));
      element.className = className;
      const value = getComputedStyle(element, pseudo).getPropertyValue(property);
      element.remove();
      return value;
    };
    return [probe("elea-tabs__tab", "transition-duration", "::after"), probe("elea-button__icon", "transition-timing-function")];
  });
  expect(await gestures()).toEqual(["0s", "cubic-bezier(0.2, 0, 0, 1)"]);
  await page.getByText("Expressive motion", { exact: true }).click();
  expect(await gestures()).toEqual(["0.25s", "cubic-bezier(0.34, 1.56, 0.64, 1)"]);
  await page.getByText("Expressive motion", { exact: true }).click();
  await page.goto("/elea/playground/#/playground");
  await expect(html).not.toHaveAttribute("data-elea-motion");
});

test("a tooltip over truncated text escapes its clipping box and stays in the viewport", async ({ page }) => {
  await page.goto("/elea/playground/#/ui/tooltip");
  const label = page.getByText("Quarterly revenue by region", { exact: true }).first();
  // The wrapper leaves the label truncated inside its 120 px box.
  expect(await label.evaluate((element) => [getComputedStyle(element.parentElement!).display, element.scrollWidth > element.clientWidth])).toEqual(["contents", true]);
  await expect(page.getByRole("tooltip")).toHaveCount(0);
  await label.hover();
  const tooltip = page.getByRole("tooltip");
  await expect(tooltip).toBeVisible();
  const [bubble, box] = [await tooltip.boundingBox(), await label.boundingBox()];
  expect(bubble!.width).toBeGreaterThan(box!.width);
  expect(Math.abs(bubble!.x + bubble!.width / 2 - (box!.x + box!.width / 2))).toBeLessThan(2);
  expect(await tooltip.evaluate((element) => element.matches(":popover-open"))).toBe(true);
  // The pointer crosses the gap and rests on the hint; Escape dismisses it where the pointer stands.
  await page.mouse.move(box!.x + box!.width / 2, box!.y - 2, { steps: 4 });
  await page.mouse.move(bubble!.x + bubble!.width / 2, bubble!.y + bubble!.height / 2, { steps: 4 });
  await expect(tooltip).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("tooltip")).toHaveCount(0);
  await label.hover();
  await expect(tooltip).toBeVisible();
  await page.mouse.move(0, 0);
  await expect(page.getByRole("tooltip")).toHaveCount(0);
  await page.getByText("Plain text", { exact: true }).hover();
  await expect(page.getByRole("tooltip")).toHaveText("Bare text takes a hint too");
  await page.mouse.move(0, 0);
  // Against the left edge of a narrow screen the hint shifts inside instead of centring.
  await page.setViewportSize({ width: 320, height: 640 });
  await label.hover();
  const shifted = await page.getByRole("tooltip").boundingBox();
  expect(shifted!.x).toBeGreaterThanOrEqual(8);
  expect(shifted!.x + shifted!.width).toBeLessThanOrEqual(312);
});

test("the gallery opens component examples without focusing their static previews", async ({ page }) => {
  await page.goto("/elea/playground/#/ui");
  const button = page.getByRole("link", { name: "Button", exact: true });
  const badge = page.getByRole("link", { name: "Badge", exact: true });
  await button.focus();
  await page.keyboard.press("Tab");
  await expect(badge).toBeFocused();
  await badge.press("Enter");
  await expect(page.getByRole("heading", { name: "Badge", exact: true })).toBeVisible();
});

test("the Elea overview shows a rendered document, its blocks, and the Alien6 contact link", async ({ page }) => {
  await page.goto("/elea/");
  const main = page.getByRole("main");
  await expect(main.getByRole("heading", { name: "A design system for rich content." })).toBeVisible();
  const documentTitle = main.getByRole("heading", { name: "The glacier notebook" });
  await expect(documentTitle).toBeVisible();
  const notebook = main.getByRole("group", { name: "Document view" });
  await expect(notebook).toHaveCSS("border-top-width", "0px");
  await expect(notebook.locator(".notebook__switch")).toHaveCSS("border-top-width", "0px");
  const photo = main.getByRole("img", { name: "Blue crevasses and white ridges seen from above a glacier" });
  await expect.poll(() => photo.evaluate((image) => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  const preview = main.getByRole("radio", { name: "Preview" });
  await preview.focus();
  await preview.press("ArrowRight");
  const json = main.getByRole("radio", { name: "Block JSON" });
  await expect(json).toBeChecked();
  await expect(notebook.locator('label[for="show-blocks"]')).toHaveCSS("outline-width", "2px");
  const source = main.locator('pre[aria-label="Document block data"]');
  await expect(source).toBeVisible();
  await expect(source).toContainText('"blocks"');
  await expect(documentTitle).toBeHidden();
  await json.press("ArrowLeft");
  await expect(documentTitle).toBeVisible();
  await expect(main.getByRole("heading", { name: "Integrate Elea with Alien6", exact: true })).toBeVisible();
  const contact = main.getByRole("link", { name: "Contact Alien6", exact: true });
  await expect(contact).toHaveAttribute("href", "https://alien6.com/en/contact/");
  await page.keyboard.press("Tab");
  await contact.focus();
  await expect(contact).toHaveCSS("outline-offset", "-2px");
  await expect(contact).toHaveCSS("outline-width", "2px");
  const footer = page.getByRole("contentinfo");
  await expect(footer.getByRole("link", { name: "Contact Alien6", exact: true })).toHaveCount(0);
  const signature = footer.getByRole("link", { name: "Built by Alien6" });
  await expect(signature).toHaveAttribute("href", "https://alien6.com");
  const logo = signature.getByRole("img", { name: "Alien6" });
  await logo.scrollIntoViewIfNeeded();
  await expect.poll(() => logo.evaluate((image) => (image as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  await expect(logo).toHaveCSS("filter", "brightness(0) invert(1)");
  await footer.getByRole("link", { name: "Editorial workspace" }).click();
  await expect(page.getByRole("heading", { name: "Editorial workspace" })).toBeVisible();
  await expect(page.getByRole("contentinfo").getByRole("img", { name: "Alien6" })).toHaveCSS("filter", "brightness(0) invert(1)");
});

test("the notebook cover and block view fill the same frame", async ({ page }) => {
  await page.goto("/elea/");
  const notebook = page.getByRole("group", { name: "Document view" });
  const preview = notebook.getByRole("radio", { name: "Preview" });
  const json = notebook.getByRole("radio", { name: "Block JSON" });
  const cover = notebook.getByRole("img");
  const source = notebook.locator("pre");
  await page.evaluate(() => document.fonts.ready);

  for (const width of [320, 912, 913, 1571]) {
    await test.step(`${width}px`, async () => {
      await page.setViewportSize({ width, height: 850 });
      const frame = (await notebook.boundingBox())!;
      const image = (await cover.boundingBox())!;
      expect(image.x).toBeCloseTo(frame.x, 0);
      expect(image.x + image.width).toBeCloseTo(frame.x + frame.width, 0);

      await preview.press("ArrowRight");
      await expect(json).toBeChecked();
      const code = (await source.boundingBox())!;
      expect(code.x).toBeCloseTo(frame.x, 0);
      expect(code.x + code.width).toBeCloseTo(frame.x + frame.width, 0);
      await json.press("ArrowLeft");
      await expect(preview).toBeChecked();
    });
  }
});

test("the documentation fits a mobile screen and can be navigated", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 760 });
  await page.goto("/elea/");
  await expect(page.getByRole("main").getByRole("link", { name: "Explore components" })).toBeVisible();
  expect(await page.locator("body").evaluate((body) => body.scrollWidth)).toBeLessThanOrEqual(320);
  // A button that is a link keeps the colour of a button, not that of the links of the page
  expect(await textContrast(page.getByRole("main").getByRole("link", { name: "Explore components" }))).toBeGreaterThanOrEqual(4.5);
  await page.goto("/elea/playground/#/ui/button");
  const outline = page.getByRole("button", { name: "Outline", exact: true });
  await expect(page.getByRole("link", { name: "A link" })).toHaveCSS("color", await outline.evaluate((button) => getComputedStyle(button).color));
  await page.goto("/elea/");

  await page.getByRole("navigation", { name: "Main", exact: true }).getByRole("link", { name: "Docs", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Getting started", exact: true })).toBeVisible();
  await page.getByRole("navigation", { name: "Documentation", exact: true }).getByRole("link", { name: "Content", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Content", exact: true })).toBeVisible();
  const example = page.locator(".docs-article pre").first();
  expect(await example.evaluate((block) => block.scrollWidth)).toBeLessThanOrEqual(await example.evaluate((block) => block.clientWidth));
  await expect(page.getByRole("contentinfo").getByRole("img", { name: "Alien6" })).toBeVisible();
});

test("a theme choice and the site navigation carry from the home page into the tools and docs", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/elea/");
  await page.getByRole("button", { name: "Switch to the dark theme" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");

  await page.getByRole("main").getByRole("link", { name: "Open theme studio" }).click();
  const theme = page.getByRole("combobox", { name: "Theme", exact: true });
  await theme.press("Enter");
  await page.getByRole("option", { name: "Braise", exact: true }).click();
  await expect(theme).toHaveText("Braise");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  const nav = page.getByRole("navigation", { name: "Main", exact: true });
  await nav.getByRole("link", { name: "Docs", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Getting started", exact: true })).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.getByRole("button", { name: "Switch to the light theme" }).click();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});

test("quote attributions are legible on both sides of the editorial workspace", async ({ page }) => {
  await page.goto("/elea/playground/");
  const authorField = page.getByRole("textbox", { name: "— Author" });
  const attribution = page.getByTestId("viewer-pane").locator("cite");
  await expect(authorField).toHaveValue("From the field notebook");
  await expect(attribution).toContainText("From the field notebook");
  for (const theme of ["light", "dark"] as const) {
    await page.emulateMedia({ colorScheme: theme });
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    for (const caption of [authorField, attribution]) {
      expect(await textContrast(caption)).toBeGreaterThanOrEqual(4.5);
    }
  }
});

test("the static notebook links to the same theme in the editor", async ({ page }) => {
  await page.goto("/elea/");
  await expect(page.locator("#home-title span")).toHaveCSS("font-style", "normal");
  const main = page.getByRole("main");
  await expect(main.getByRole("group", { name: "Preview a publication theme" })).toHaveCount(0);
  const sampleTitle = main.getByRole("heading", { name: "The glacier notebook" });
  await expect(sampleTitle).toHaveCSS("font-family", /^"ELEA Sans"/);
  const faces = await page.evaluate(async () => (await document.fonts.load('400 1em "ELEA Sans"')).length);
  expect(faces).toBe(1);
  const open = main.getByRole("link", { name: "Edit this notebook" });
  expect(await textContrast(open)).toBeGreaterThanOrEqual(4.5);
  await expect(open).toHaveAttribute("href", /#\/playground\?scheme=reserve$/);
  await open.press("Enter");
  await expect(page.getByTestId("viewer-pane").getByRole("heading", { name: "The glacier notebook" })).toBeVisible();
});

test("the notebook and links to the studio and editor remain visible without JavaScript", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto("/elea/#home-theme");
    const main = page.getByRole("main");
    await expect(main.getByRole("link", { name: "Open theme studio" })).toHaveAttribute("href", "/elea/playground/#/theme");
    await expect(main.getByRole("link", { name: "Edit this notebook" })).toHaveAttribute("href", /#\/playground\?scheme=reserve$/);
    await expect(main.getByRole("heading", { name: "The glacier notebook" })).toBeVisible();
    await expect(main.getByRole("heading", { name: "Publication themes" })).toHaveAttribute("id", "home-theme");
  } finally {
    await context.close();
  }
});

test("a host utility and a plain host rule win over a component default without raising specificity", async ({ page }) => {
  await page.goto("/elea/playground/#/ui/button");
  const button = page.getByRole("button", { name: "Primary", exact: true });
  await expect(button).toBeVisible();
  await button.evaluate((element) => element.parentElement!.style.setProperty("--elea-shape-action", "3px / 7px"));
  await expect(button).toHaveCSS("border-top-left-radius", "3px 7px");
  // Tailwind v4 keeps its utilities in a layer; one class there, and one outside any layer.
  await page.addStyleTag({ content: "@layer utilities { .rounded-xl { border-radius: 12px; } } .host-wide { letter-spacing: 0.2em; }" });
  await button.evaluate((element) => element.classList.add("rounded-xl", "host-wide"));
  await expect(button).toHaveCSS("border-top-left-radius", "12px");
  expect(await button.evaluate((element) => getComputedStyle(element).letterSpacing)).not.toBe("normal");
});

test("a dialog opened from a themed container uses the tokens of that container", async ({ page }) => {
  await page.goto("/elea/playground/#/ui/dialog");
  const fill = (name: string) => page.getByRole("button", { name, exact: true }).evaluate((element) => getComputedStyle(element).backgroundColor);
  const opener = page.getByRole("button", { name: "Open in Editorial", exact: true });
  await opener.click();
  const dialog = page.getByRole("dialog", { name: "Editorial edition" });
  await expect(dialog).toBeVisible();
  expect(await dialog.evaluate((element) => element.closest("[data-elea-theme]")?.getAttribute("data-elea-theme"))).toBe("editorial");
  expect(await dialog.evaluate((element) => element.closest("section") === null)).toBe(true);
  const editorial = await fill("Open in Editorial");
  expect(await fill("Done")).toBe(editorial);
  await page.keyboard.press("Escape");
  expect(await fill("Share article")).not.toBe(editorial);
});

test("the info variant reads the info colour, which a host can set apart from its links", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/elea/playground/#/ui/button");
  const fill = (name: string) => page.getByRole("button", { name, exact: true }).evaluate((element) => getComputedStyle(element).backgroundColor);
  await expect(page.getByRole("button", { name: "Teal info", exact: true })).toBeVisible();
  expect(await fill("Info")).toBe("rgb(71, 101, 164)");
  expect(await fill("Teal info")).toBe("rgb(14, 116, 144)");
});
