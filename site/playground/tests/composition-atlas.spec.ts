import { expect, test, type Locator } from "@playwright/test";

const atlas = "/research/composition-of-interfaces/atlas/";
test.use({ javaScriptEnabled: false });

async function box(element: Locator) {
  return element.evaluate(node => {
    const { left, right, top, bottom, width, height } = node.getBoundingClientRect();
    return { left, right, top, bottom, width, height };
  });
}

test("three working layouts preserve the brief, both sessions and both meeting places", async ({ page }) => {
  await page.goto(atlas);
  const plates = page.locator(".composition-plate");
  await expect(plates).toHaveCount(3);
  await expect(page.getByRole("main").getByRole("heading", { level: 2 })).toHaveText([
    "Axial poster", "Asymmetric spread", "Programme index",
  ]);
  for (const plate of await plates.all()) {
    const programme = plate.getByRole("article", { name: "Soundings", exact: true });
    const construction = plate.locator(".programme-grid summary");
    const guides = () => programme.evaluate(node => getComputedStyle(node, "::before").content);
    expect(await guides()).toBe('""');
    await construction.press("Enter");
    expect(["none", "normal"]).toContain(await guides());
    await construction.press("Enter");
    expect(await guides()).toBe('""');
    await expect(programme.getByRole("heading", { level: 3 })).toHaveText("Soundings");
    await expect(programme.locator("header time")).toHaveText("17 May");
    await expect(programme.locator("header span")).toHaveText("Quay House");
    await expect(programme.locator(".programme__intro")).toHaveText("A day of listening at the water’s edge.");
    const photo = programme.getByRole("img", { name: "A red lighthouse at the end of a concrete breakwater." });
    await photo.scrollIntoViewIfNeeded();
    await expect.poll(() => photo.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBe(1536);
    const frame = await box(photo);
    expect(frame.width / frame.height).toBeCloseTo(1.5, 2);

    const sessions = programme.getByRole("group", { name: "Sessions" }).locator("details");
    await expect(sessions.locator("summary time")).toHaveText(["10:00", "14:00"]);
    await expect(sessions.locator("summary span")).toHaveText(["Harbour walk", "Listening room"]);
    const notes = [
      "Meet at the east steps for a walk along the breakwater.",
      "Meet in the upstairs studio to hear recordings from the quay.",
    ];
    for (const [i, note] of notes.entries()) {
      const disclosure = sessions.nth(i);
      const trigger = disclosure.locator("summary");
      await expect(disclosure.locator("p")).toBeHidden();
      await trigger.press("Enter");
      await expect(disclosure.locator("p")).toBeVisible();
      await expect(disclosure.locator("p")).toHaveText(note);
      await trigger.press("Enter");
      await expect(disclosure.locator("p")).toBeHidden();
    }
  }
});

test("the wide poster has a centre axis, the spread an unequal split, the index a time column", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(atlas);
  const poster = page.locator(".programme--axial");
  const posterFrame = await box(poster);
  const axis = posterFrame.left + posterFrame.width / 2;
  for (const selector of ["header", "img", ".programme__sessions"]) {
    const element = await box(poster.locator(selector));
    expect(Math.abs(element.left + element.width / 2 - axis)).toBeLessThan(1);
  }
  const posterMorning = await box(poster.locator("summary").first());
  const posterAfternoon = await box(poster.locator("summary").last());
  expect(posterAfternoon.left).toBeGreaterThan(posterMorning.right);
  expect(posterAfternoon.top).toBeCloseTo(posterMorning.top, 0);
  expect(posterAfternoon.width).toBeCloseTo(posterMorning.width, 0);

  const spread = page.locator(".programme--spread");
  const lead = await box(spread.locator("header"));
  const photograph = await box(spread.locator("img"));
  const schedule = await box(spread.locator(".programme__sessions"));
  expect(photograph.left).toBeGreaterThan(lead.right);
  expect(photograph.width / lead.width).toBeCloseTo(1.5, 2);
  expect(schedule.top).toBeGreaterThan(photograph.bottom);
  expect(schedule.left).toBeCloseTo(lead.left, 1);
  expect(schedule.right).toBeCloseTo(photograph.right, 1);
  expect((await box(spread.locator("details").first())).width).toBeCloseTo(lead.width, 1);
  expect((await box(spread.locator("details").last())).left).toBeCloseTo(photograph.left, 1);

  const index = page.locator(".programme--index");
  const rail = await box(index.locator("header"));
  const indexSchedule = await box(index.locator(".programme__sessions"));
  expect(indexSchedule.left).toBeGreaterThan(rail.right);
  expect(indexSchedule.width / rail.width).toBeCloseTo(2, 2);
  const morningTime = await box(index.locator("summary time").first());
  const afternoonTime = await box(index.locator("summary time").last());
  expect(afternoonTime.left).toBeCloseTo(morningTime.left, 1);
  expect(afternoonTime.top).toBeGreaterThan(morningTime.bottom);
});

test("all three programmes keep a single reading order and visible session details at 320px", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto(atlas);
  for (const programme of await page.locator(".programme").all()) {
    expect(await programme.evaluate(container => Array.from(container.children, child => child.tagName)))
      .toEqual(["HEADER", "IMG", "DIV"]);
    const lead = await box(programme.locator("header"));
    const photograph = await box(programme.locator("img"));
    const morning = await box(programme.locator("summary").first());
    const afternoon = await box(programme.locator("summary").last());
    expect(photograph.top).toBeGreaterThan(lead.bottom);
    expect(morning.top).toBeGreaterThan(photograph.bottom);
    expect(afternoon.top).toBeGreaterThanOrEqual(morning.bottom);
    await programme.locator("summary").last().click();
    const meeting = programme.getByText("Meet in the upstairs studio to hear recordings from the quay.");
    await expect(meeting).toBeVisible();
    const opened = await box(meeting);
    expect(opened.left).toBeGreaterThanOrEqual(0);
    expect(opened.right).toBeLessThanOrEqual(320);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
});
