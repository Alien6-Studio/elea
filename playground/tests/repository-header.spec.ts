import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, test } from "@playwright/test";
import { RepositoryLink } from "../src/components/RepositoryLink.js";
import { loadRepositoryMetadata } from "../scripts/repository-metadata.js";

test("the repository link reports zero and announces the exact compact count", async ({ page }) => {
  const snapshot = await loadRepositoryMetadata(async url => Response.json(String(url).endsWith("/latest")
    ? { tag_name: "v1.0.3" }
    : { stargazers_count: 1250, forks_count: 0 }));
  await page.setContent(renderToStaticMarkup(createElement(RepositoryLink, { snapshot })));
  const link = page.getByRole("link", { name: "Alien6-Studio/elea on GitHub, Latest release v1.0.3, 1,250 stars, 0 forks" });
  await expect(link).toHaveAttribute("href", "https://github.com/Alien6-Studio/elea");
  await expect(link.locator(".site-repo__fact")).toHaveText(["v1.0.3", "1.3K", "0"]);
});

test("an unavailable API leaves a working repository link and preserves known facts", async ({ page }) => {
  const unknown = await loadRepositoryMetadata(async () => { throw new Error("offline"); });
  await page.setContent(renderToStaticMarkup(createElement(RepositoryLink, { snapshot: unknown })));
  const link = page.getByRole("link", { name: /Alien6-Studio\/elea on GitHub, Latest release v[\w.-]+$/ });
  await expect(link.locator(".site-repo__fact")).toHaveCount(1);
  await expect(link.locator(".site-repo__fact")).toHaveText(/^v\d+\.\d+\.\d+/);
  const partial = await loadRepositoryMetadata(async url => String(url).endsWith("/latest")
    ? new Response(null, { status: 404 }) : Response.json({ stargazers_count: 0, forks_count: 2 }));
  expect(partial).toEqual({ release: unknown.release, stars: 0, forks: 2 });
});

test("the static and playground headers carry the same repository facts", async ({ page }) => {
  const link = page.locator("header").getByRole("link", { name: /^Alien6-Studio\/elea on GitHub/ });
  await page.goto("/elea/");
  await expect(link).toBeVisible();
  await expect(link.locator(".site-repo__fact").first()).toHaveText(/^v\d+\.\d+\.\d+/);
  const staticLabel = await link.getAttribute("aria-label");
  await page.goto("/elea/playground/#/ui");
  await expect(link).toHaveAttribute("aria-label", staticLabel!);
  await expect(link).toHaveAttribute("href", "https://github.com/Alien6-Studio/elea");
});
