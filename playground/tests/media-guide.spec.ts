import { expect, test, type Page } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const route = "/elea/playground/#/ui/media";
const glacier = fileURLToPath(new URL("../../docs/assets/glacier.webp", import.meta.url));

async function chooseFormat(page: Page, label: string) {
  const trigger = page.getByRole("combobox", { name: "Crop format" });
  await trigger.click();
  await page.getByRole("option", { name: label, exact: true }).click();
  await expect(trigger).toBeFocused();
}

async function downloadSize(page: Page, name: string, slot: "Article cover" | "Feature card" = "Article cover") {
  const link = page.getByRole("region", { name: slot, exact: true }).getByRole("link", { name: "Download PNG" });
  const [download] = await Promise.all([page.waitForEvent("download"), link.click()]);
  expect(download.suggestedFilename()).toBe(name);
  const file = await download.path();
  if (!file) throw new Error("Missing downloaded crop");
  const png = await readFile(file);
  expect(png.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
  expect(png.toString("ascii", 12, 16)).toBe("IHDR");
  return [png.readUInt32BE(16), png.readUInt32BE(20)];
}

test("a local image can be framed with the keyboard, downloaded and replaced", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const uploads: string[] = [];
  page.on("request", request => { if (request.method() === "POST") uploads.push(request.url()); });
  await page.goto(route);
  await expect(page.getByRole("heading", { level: 1, name: "Image upload and crop" })).toBeVisible();
  await page.getByRole("button", { name: "Replace image" }).click();
  await page.locator('input[type="file"]').setInputFiles(glacier);
  const frame = page.getByRole("group", { name: "Cover crop" });
  await expect.poll(() => frame.locator("img").evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const stage = await page.locator(".demo__stage").boundingBox();
  expect((await frame.boundingBox())!.width).toBeLessThanOrEqual(stage!.width);
  const format = page.getByRole("combobox", { name: "Crop format" });
  await expect(page.getByRole("heading", { name: "Frame the cover" })).toBeFocused();
  await expect(format).toHaveText("Article cover · 1600 × 900");
  const zoom = page.getByRole("slider", { name: "Zoom" });
  await zoom.press("ArrowRight");
  await expect(zoom).toHaveValue("1.01");
  const rotation = page.getByRole("slider", { name: "Rotation" });
  await rotation.press("ArrowRight");
  await expect(rotation).toHaveValue("1");
  await page.getByRole("button", { name: "Apply crop" }).click();
  const image = page.getByRole("region", { name: "Article cover", exact: true }).getByRole("img");
  await expect.poll(() => image.evaluate((img: HTMLImageElement) => img.naturalWidth / img.naturalHeight)).toBeCloseTo(16 / 9, 2);
  await expect(page.getByRole("region", { name: "Article cover", exact: true }).getByRole("button", { name: "Adjust crop" })).toBeFocused();
  expect(await downloadSize(page, "glacier-cover.png")).toEqual([1600, 900]);
  await page.getByRole("button", { name: "Replace image" }).click();
  await expect(image).toHaveCount(0);
  expect(uploads).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("the square preset exports its specified pixel dimensions", async ({ page }) => {
  await page.goto(route);
  await chooseFormat(page, "Square · 1080 × 1080");
  await page.getByRole("group", { name: "Cover crop" }).locator("img").evaluate((img: HTMLImageElement) => img.decode());
  await page.getByRole("button", { name: "Apply crop" }).click();
  expect(await downloadSize(page, "harbour-light-cover.png")).toEqual([1080, 1080]);
});

test("the crop window changes shape, position and size over the full photo", async ({ page }) => {
  await page.goto(route);
  const frame = page.getByRole("group", { name: "Cover crop" });
  const photo = frame.locator("img");
  await photo.evaluate((img: HTMLImageElement) => img.decode());
  const format = page.getByRole("combobox", { name: "Crop format" });
  const window = frame.locator(".elea-cropper__crop-window");
  const ratio = () => window.evaluate(el => el.getBoundingClientRect().width / el.getBoundingClientRect().height);
  await chooseFormat(page, "Square · 1080 × 1080");
  await expect.poll(ratio).toBeCloseTo(1, 2);
  const frameSize = await frame.evaluate(el => [el.clientWidth, el.clientHeight]);
  const photoSize = await photo.evaluate(el => [el.clientWidth, el.clientHeight]);
  const cropBounds = () => window.evaluate((el: HTMLElement) => [el.offsetLeft, el.offsetTop, el.offsetWidth, el.offsetHeight]);
  const squareBounds = await cropBounds();
  await format.press("Enter");
  await expect(page.getByRole("option", { name: "Free ratio", exact: true })).toBeVisible();
  await format.press("ArrowDown");
  await format.press("Escape");
  await expect(page.getByRole("listbox", { name: "Crop format" })).toHaveCount(0);
  await expect(format).toBeFocused();
  await expect(format).toHaveText("Square · 1080 × 1080");
  expect(await cropBounds()).toEqual(squareBounds);
  expect(await photo.evaluate(el => [el.clientWidth, el.clientHeight])).toEqual(photoSize);
  await chooseFormat(page, "Portrait · 1080 × 1350");
  await expect.poll(ratio).toBeCloseTo(4 / 5, 2);
  expect(await frame.evaluate(el => [el.clientWidth, el.clientHeight])).toEqual(frameSize);
  expect(await photo.evaluate(el => [el.clientWidth, el.clientHeight])).toEqual(photoSize);

  const before = await window.boundingBox();
  await frame.getByLabel("Move crop area").press("ArrowRight");
  await expect.poll(async () => (await window.boundingBox())!.x).toBeGreaterThan(before!.x);
  await frame.getByLabel("Resize from bottom right").press("ArrowLeft");
  await expect.poll(async () => (await window.boundingBox())!.width).toBeLessThan(before!.width);
  await expect.poll(ratio).toBeCloseTo(4 / 5, 2);
  await page.getByRole("button", { name: "Apply crop" }).click();
  expect(await downloadSize(page, "harbour-light-cover.png")).toEqual([1080, 1350]);
});

test("custom crop dimensions validate before exporting the requested size", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(route);
  const format = page.getByRole("combobox", { name: "Crop format" });
  await format.click();
  await expect(page.getByRole("option", { name: "Original ratio" })).toBeVisible();
  await page.getByRole("option", { name: "Custom dimensions" }).click();
  const width = page.getByLabel("Width (px)", { exact: true });
  const height = page.getByLabel("Height (px)", { exact: true });
  const confirm = page.getByRole("button", { name: "Apply crop" });
  await width.fill("0");
  await expect(confirm).toBeDisabled();
  await expect(page.getByText("Use whole pixels from 1 to 8192 per side, up to 16,777,216 pixels in total.", { exact: true })).toBeVisible();
  await width.fill("8192");
  await height.fill("8192");
  await expect(confirm).toBeDisabled();
  await width.fill("640");
  await height.fill("480");
  await expect(confirm).toBeEnabled();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole("group", { name: "Cover crop" }).locator("img").evaluate((img: HTMLImageElement) => img.decode());
  await confirm.click();
  expect(await downloadSize(page, "harbour-light-cover.png")).toEqual([640, 480]);
});

test("the file picker explains a rejection and recovers with the sample", async ({ page }) => {
  await page.goto(route);
  await page.getByRole("button", { name: "Replace image" }).click();
  await page.locator('input[type="file"]').setInputFiles({ name: "notes.txt", mimeType: "text/plain", buffer: Buffer.from("Field notes") });
  await expect(page.getByRole("alert")).toHaveText("Choose a JPEG, PNG or WebP image.");
  await page.locator('input[type="file"]').setInputFiles({ name: "broken.png", mimeType: "image/png", buffer: Buffer.from("No image data") });
  await expect(page.getByRole("alert")).toContainText("could not be opened");
  await page.getByRole("button", { name: "Use sample photo" }).click();
  await expect(page.getByRole("alert")).toHaveCount(0);
  await expect.poll(() => page.getByRole("group", { name: "Cover crop" }).locator("img").evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
  await page.getByRole("button", { name: "Apply crop" }).click();
  await expect(page.getByRole("link", { name: "Download PNG" })).toBeVisible();
});

test("each destination reopens its crop on the original and cancellation preserves the saved output", async ({ page }) => {
  await page.goto(route);
  const cover = page.getByRole("region", { name: "Article cover", exact: true });
  const card = page.getByRole("region", { name: "Feature card", exact: true });
  const frame = page.getByRole("group", { name: "Cover crop" });
  await frame.locator("img").evaluate((image: HTMLImageElement) => image.decode());
  const original = await frame.locator("img").getAttribute("src");
  const mask = frame.locator(".elea-cropper__crop-window");
  const rectangle = () => mask.evaluate(element => element.getAttribute("style"));
  await frame.getByRole("button", { name: "Move crop area" }).press("Shift+ArrowLeft");
  const crop = await rectangle();
  await page.getByRole("button", { name: "Apply crop" }).click();
  const first = cover.getByRole("img");
  await expect(first).toHaveAttribute("src", /^blob:/);
  const saved = await first.getAttribute("src");
  await card.getByRole("button", { name: "Adjust crop" }).click();
  await expect(page.getByRole("combobox", { name: "Crop format" })).toHaveText("Feature card · 1080 × 1350");
  await page.getByRole("button", { name: "Apply crop" }).click();
  expect(await downloadSize(page, "harbour-light-card.png", "Feature card")).toEqual([1080, 1350]);
  await expect(first).toHaveAttribute("src", saved!);
  await cover.getByRole("button", { name: "Adjust crop" }).click();
  await expect(frame.locator("img")).toHaveAttribute("src", original!);
  await expect.poll(rectangle).toBe(crop);
  await frame.getByRole("button", { name: "Move crop area" }).press("Shift+ArrowLeft");
  await page.getByRole("button", { name: "Cancel" }).click();
  await expect(first).toHaveAttribute("src", saved!);
  await expect(card.getByRole("link", { name: "Download PNG" })).toBeVisible();
});
