import { expect, test } from "@playwright/test";

test("guide permalinks survive reload, history and shared themes", async ({ page }) => {
  const base = "/elea/playground/#/ui/button";
  await page.goto(base + "?scheme=braise");
  await page.getByText("On this page", { exact: true }).click();
  const toc = page.getByRole("navigation", { name: "On this page" });
  await toc.getByRole("link", { name: "Router links", exact: true }).click();
  await expect(page).toHaveURL(/#\/ui\/button\/router-links\?scheme=braise$/);
  const heading = page.getByRole("heading", { name: "Router links", exact: true });
  await expect(heading).toBeFocused();
  await expect(heading.getByRole("link")).toHaveAttribute("href", "#/ui/button/router-links?scheme=braise");
  await page.reload();
  await expect(heading).toBeFocused();
  await expect(heading).toBeInViewport();
  await page.getByText("On this page", { exact: true }).click();
  await toc.getByRole("link", { name: "Keyboard and accessibility" }).click();
  await expect(page.getByRole("heading", { name: "Keyboard and accessibility" })).toBeFocused();
  await page.goBack();
  await expect(heading).toBeFocused();
});

test("the mobile component index opens by keyboard and follows the current theme", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 320, height: 760 });
  await page.goto("/elea/playground/#/ui/table?scheme=braise");
  const toggle = page.getByRole("button", { name: "Browse components" });
  const index = page.getByRole("navigation", { name: "Component index" });
  await expect(index).toBeHidden();
  await toggle.focus();
  await page.keyboard.press("Enter");
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await index.getByRole("link", { name: "Button", exact: true }).click();
  await expect(page).toHaveURL(/#\/ui\/button\?scheme=braise$/);
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(index).toBeHidden();
  await expect(page.getByRole("heading", { name: "Button", exact: true })).toBeInViewport();
  await page.getByText("On this page", { exact: true }).click();
  const contents = page.getByRole("navigation", { name: "On this page" });
  await expect(contents.getByRole("link", { name: "Router links" })).toBeVisible();
  const path = testInfo.outputPath("mobile-contents.png");
  await page.screenshot({ path, animations: "disabled" });
  await testInfo.attach("Mobile guide navigation", { path, contentType: "image/png" });
});

test("every guide lists a unique destination for each live example", async ({ page }) => {
  await page.goto("/elea/playground/#/ui");
  const cards = page.locator(".gallery__name");
  await expect(cards.first()).toBeVisible();
  const routes = await cards.evaluateAll(links => links.map(link => (link as HTMLAnchorElement).href));
  for (const route of routes) {
    await page.goto(route);
    await page.getByText("On this page", { exact: true }).click();
    const toc = page.getByRole("navigation", { name: "On this page" });
    const destinations = await toc.getByRole("link").evaluateAll(links => links.map(link => (link as HTMLAnchorElement).href));
    expect(new Set(destinations).size, route).toBe(destinations.length);
    const examples = page.locator(".catalog-demos .demo > h2.demo__title > a");
    expect(await examples.count(), route).toBe(await page.locator(".catalog-demos .demo").count());
    const permalinks = await examples.evaluateAll(links => links.map(link => (link as HTMLAnchorElement).href));
    expect(destinations, route).toEqual(expect.arrayContaining(permalinks));
  }
});
