import { expect, test } from "@playwright/test";

const catalog = "/elea/playground/#/ui";

test("the Stepper gallery entry opens a working proof with keyboard navigation", async ({ page }) => {
  await page.goto(catalog);
  await page.getByRole("button", { name: "Navigation", exact: true }).click();
  await page.getByRole("link", { name: "Stepper", exact: true }).click();
  await expect(page.getByRole("navigation", { name: "Component index" }).getByRole("link", { name: "Stepper", exact: true })).toHaveAttribute("aria-current", "page");
  const proof = page.getByRole("navigation", { name: "Proof sections" });
  const images = proof.getByRole("button", { name: "Images", exact: true });
  const credits = proof.getByRole("button", { name: /Credits/ });
  await expect(images).toHaveAttribute("aria-current", "step");
  await expect(images).toHaveText("Images");
  await expect(images).toHaveAccessibleDescription("1 open note");
  await expect(credits).toHaveAccessibleDescription("0 open notes");
  await images.press("End");
  await expect(credits).toBeFocused();
  await expect(images).toHaveAttribute("aria-current", "step");
  await credits.press("Enter");
  await expect(credits).toHaveAttribute("aria-current", "step");
  await expect(page.getByRole("region", { name: "Proof notes" })).toContainText("All credits have been checked.");
  await proof.getByRole("button", { name: /Copy/ }).click();
  await expect(page.getByRole("region", { name: "Proof notes" }).getByRole("listitem")).toHaveCount(2);
  const imageStep = proof.getByRole("listitem").filter({ has: page.getByRole("button", { name: "Images", exact: true }) });
  const imageNumber = imageStep.getByText("2", { exact: true });
  await imageNumber.scrollIntoViewIfNeeded();
  const marker = (await imageNumber.boundingBox())!;
  await page.mouse.click(marker.x + marker.width / 2, marker.y + marker.height / 2);
  await expect(images).toHaveAttribute("aria-current", "step");
});

test("the linear issue workflow keeps changes and offers the final action on its last step", async ({ page }) => {
  await page.goto(catalog + "/stepper");
  const nav = page.getByRole("navigation", { name: "Issue preparation" });
  const proof = nav.getByRole("button", { name: /Proof/ });
  await expect(proof).toBeDisabled();
  const title = page.getByRole("textbox", { name: "Issue title" });
  await title.fill("Tide tables");
  const next = page.getByRole("button", { name: "Next", exact: true });
  const previous = page.getByRole("button", { name: "Previous", exact: true });
  await next.click();
  await page.getByRole("combobox", { name: "Readers" }).click();
  await page.getByRole("option", { name: "Everyone", exact: true }).click();
  await previous.click();
  await expect(title).toHaveValue("Tide tables");
  await next.click();
  await next.click();
  await expect(next).toHaveCount(0);
  await expect(proof).toHaveAttribute("aria-current", "step");
  await expect(page.getByRole("region", { name: "Issue proof" })).toContainText("Tide tables");
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(page.getByText("Draft saved for everyone.", { exact: true })).toBeVisible();
});

test("the step examples fit a phone and the loading preview stays outside the tab order", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto(catalog + "/stepper");
  const nav = page.getByRole("navigation", { name: "Proof sections" });
  await expect(nav.getByRole("button")).toHaveCount(3);
  expect(await nav.getByRole("list").evaluate(element => element.scrollWidth <= element.clientWidth + 1)).toBe(true);
  const skeleton = page.locator(".demo").filter({ has: page.getByRole("heading", { name: "Loading", exact: true }) }).locator(".demo__stage");
  await expect(skeleton).toBeVisible();
  await expect(skeleton.locator("button, a[href], [tabindex='0']")).toHaveCount(0);
  for (const stage of await page.locator(".demo__stage").all()) {
    expect(await stage.evaluate(element => element.scrollWidth <= element.clientWidth + 1)).toBe(true);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await nav.getByRole("button", { name: /Credits/ }).click();
  await expect(page.getByRole("region", { name: "Proof notes" })).toContainText("All credits have been checked.");
});
