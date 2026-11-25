import { expect, test, type Locator } from "@playwright/test";

const left = (element: Locator) => element.evaluate((node) => node.getBoundingClientRect().left);

for (const width of [1440, 320]) {
  test(`the guides and tools share a navigation grid at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/elea/getting-started/");
    await page.evaluate(() => document.fonts.ready);
    const main = page.getByRole("navigation", { name: "Main", exact: true });
    const guides = page.getByRole("navigation", { name: "Documentation", exact: true });
    const docs = main.getByRole("link", { name: "Docs", exact: true });
    const firstGuide = guides.getByRole("link", { name: "Getting started" });
    const primaryDestinations = () => main.getByRole("link").evaluateAll((links) =>
      links.map((link) => ({ label: link.textContent, href: link.getAttribute("href") })),
    );
    const destinations = await primaryDestinations();

    await expect(docs).toHaveAttribute("aria-current", "true");
    await expect(firstGuide).toHaveAttribute("aria-current", "page");
    expect(Math.abs(await left(docs) - await left(firstGuide))).toBeLessThan(1);
    if (width >= 1024) {
      expect(Math.abs(await left(docs) - await left(page.getByRole("heading", { level: 1 })))).toBeLessThan(1);
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
      await page.goto("/elea/");
      const main = page.getByRole("main");
      const nav = page.getByRole("navigation", { name: "Main", exact: true });
      const labels = ["Docs", "Components", "Theme studio", "Editorial workspace"];

      await page.keyboard.press("Tab");
      await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
      await page.keyboard.press("Enter");
      await expect(main).toBeFocused();

      const destinations = [
        { heading: "Getting started", url: /\/getting-started\/$/ },
        { heading: "Components", url: /#\/ui$/ },
        { heading: "Theme studio", url: /#\/theme$/ },
        { heading: "Editorial workspace", url: /#\/playground$/ },
      ] as const;
      for (const [index, destination] of destinations.entries()) {
        await expect(nav.getByRole("link")).toHaveText(labels);
        await expect.poll(() => nav.evaluate((node) => node.scrollWidth - node.clientWidth)).toBe(0);
        const link = nav.getByRole("link", { name: labels[index], exact: true });
        await link.focus();
        await expect(link).toBeFocused();
        await page.keyboard.press("Enter");
        await expect(page).toHaveURL(destination.url);
        await expect(main.getByRole("heading", { name: destination.heading, exact: true, level: 1 })).toBeVisible();
        await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
        await expect(link).toHaveAttribute("aria-current", "true");
        await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      }

      await page.goBack();
      await expect(page).toHaveURL(/#\/theme$/);
      await expect(main.getByRole("heading", { name: "Theme studio", exact: true, level: 1 })).toBeVisible();
      await page.getByRole("contentinfo").getByRole("link", { name: "Elea", exact: true }).press("Enter");
      await expect(page).toHaveURL(/\/elea\/$/);
    });
  }
}
