import { expect, test } from "@playwright/test";

test("the Carousel guide presents three independent layouts with their own navigation", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/elea/playground/#/ui/carousel");
  const single = page.getByRole("region", { name: "Single plate", exact: true });
  const sheet = page.getByRole("region", { name: "Contact sheet", exact: true });
  const film = page.getByRole("region", { name: "Filmstrip", exact: true });

  await expect(single.getByRole("img")).toHaveCount(1);
  await expect(sheet.getByRole("img")).toHaveCount(2);
  await expect(film.getByRole("img")).toHaveCount(3);
  await expect(page.getByRole("group", { name: "Display settings" })).toHaveCount(0);
  await expect(page.locator(".demo").getByRole("combobox")).toHaveCount(0);
  await expect(page.locator(".demo").getByRole("switch")).toHaveCount(0);

  const next = { name: "Next plate", exact: true };
  const dots = { name: /^Show plate \d+$/ };
  await expect(single.getByRole("button", dots)).toHaveCount(0);
  await expect(single.getByRole("status")).toHaveText("1 / 9");
  await expect(single.getByRole("status")).toHaveCSS("clip-path", "none");
  await expect(sheet.getByRole("button", next)).toHaveCount(0);
  await expect(sheet.getByRole("button", { name: "Show plate 8", exact: true })).toBeVisible();
  await expect(film.getByRole("button", { name: "Show plate 7", exact: true })).toBeVisible();
  const singleImage = await single.getByRole("img").boundingBox();
  const singleNext = await single.getByRole("button", next).boundingBox();
  expect(singleNext!.y + singleNext!.height).toBeLessThanOrEqual(singleImage!.y);
  for (const carousel of [sheet, film]) {
    const image = await carousel.getByRole("img").first().boundingBox();
    const controls = await carousel.getByRole("group").boundingBox();
    expect(controls!.y).toBeGreaterThanOrEqual(image!.y + image!.height);
  }
  const sheetBox = await sheet.boundingBox();
  const sheetControls = await sheet.getByRole("group").boundingBox();
  expect(sheetControls!.x + sheetControls!.width / 2).toBeCloseTo(sheetBox!.x + sheetBox!.width / 2, 0);

  await sheet.getByRole("button", { name: "Show plate 3", exact: true }).click();
  await expect(sheet.getByRole("status")).toHaveText("3–4 / 9");
  await expect(film.getByRole("status")).toHaveText("4–6 / 9");
  await expect(single.getByRole("status")).toHaveText("1 / 9");
  await film.getByRole("button", next).click();
  await expect(film.getByRole("status")).toHaveText("5–7 / 9");
  await expect(film.getByRole("button", { name: "Show plate 5" })).toHaveAttribute("aria-current", "true");
  await expect(sheet.getByRole("status")).toHaveText("3–4 / 9");
  await expect(single.getByRole("status")).toHaveText("1 / 9");

  for (const name of ["Single plate", "Contact sheet", "Filmstrip"]) {
    const demo = page.locator(".demo").filter({ has: page.getByRole("heading", { name, exact: true }) });
    await demo.getByText("View code", { exact: true }).click();
    await expect(demo.getByLabel(name + " source", { exact: true })).toContainText("<Carousel");
    await expect(demo.getByRole("button", { name: "Copy code" })).toBeVisible();
  }
});
