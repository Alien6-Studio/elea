import { expect, test } from "@playwright/test";

const missing = (page: import("@playwright/test").Page) => page.getByRole("heading", { level: 1, name: "Page not found" });

test("the site ships a 404 page that works from any depth", async ({ page }) => {
  await page.goto("/404.html");
  await expect(page).toHaveTitle("Page not found · Elea");
  await expect(missing(page)).toBeVisible();
  await expect(page.locator("meta[name=robots]")).toHaveAttribute("content", "noindex");
  await expect(page.getByRole("main").getByRole("link", { name: "Go to the overview" })).toHaveAttribute("href", "/");
  // The host serves this file at the requested address, so nothing in it may be relative.
  const relative = await page.locator("link[href], script[src], img[src], a[href]").evaluateAll(nodes =>
    nodes.map(node => node.getAttribute("href") ?? node.getAttribute("src") ?? "").filter(url => !/^(\/|#|https?:|mailto:)/.test(url)));
  expect(relative).toEqual([]);
});

test("an unknown playground route says so instead of showing another page", async ({ page }) => {
  for (const route of ["#/nowhere", "#/ui/nowhere", "#/geometry"]) {
    await page.goto(`/playground/${route}`);
    await expect(missing(page)).toBeVisible();
    await expect(page).toHaveTitle("Page not found · Elea");
  }
  for (const route of ["", "#/playground", "#/ui", "#/ui/button"]) {
    await page.goto(`/playground/${route}`);
    await expect(page.getByRole("heading", { level: 1 }).first()).toBeVisible();
    await expect(missing(page)).toHaveCount(0);
  }
});

test("the research page lists its studies and is reachable from the navigation", async ({ page }) => {
  await page.goto("/research/");
  const nav = page.getByRole("navigation", { name: "Main" });
  await expect(nav.getByRole("link", { name: "Research", exact: true })).toHaveAttribute("aria-current", "true");
  const main = page.getByRole("main");
  await expect(main.getByRole("heading", { level: 1, name: "Research" })).toBeVisible();
  await expect(main.getByRole("link", { name: "Open the atlas" })).toHaveAttribute("href", "geometry-of-interfaces/atlas/");
  await expect(main.getByRole("link", { name: "Open the laboratory" })).toHaveAttribute("href", "geometry-of-interfaces/laboratory/");
  await main.getByRole("link", { name: "Read the study" }).click();
  await expect(page).toHaveURL(/\/research\/geometry-of-interfaces\/$/);
  await expect(nav.getByRole("link", { name: "Research", exact: true })).toHaveAttribute("aria-current", "true");
  await page.getByRole("navigation", { name: "Research" }).getByRole("link", { name: "All studies" }).click();
  await expect(page).toHaveURL(/\/research\/$/);
});
