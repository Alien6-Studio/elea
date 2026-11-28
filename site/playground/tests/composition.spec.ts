import { expect, test, type Page } from "@playwright/test";

const study = "/research/composition-of-interfaces/";
const laboratory = study + "laboratory/";

test("the research index opens the study, its measured plates and the working archive without JavaScript", async ({ browser, baseURL }) => {
  const page = await browser.newPage({ baseURL, javaScriptEnabled: false, viewport: { width: 320, height: 720 } });
  try {
    await page.goto("/research/");
    await page.getByRole("link", { name: "Read the composition study" }).click();
    await expect(page).toHaveURL(new RegExp(study + "$"));
    await expect(page.locator(".grid-plot")).toHaveCount(5);
    for (const name of ["Archive at 40 rem", "Archive at 46 rem", "Facing pages divided into ninths",
      "3 plus 3 columns", "2 plus 4 columns", "Departures with space before the platform", "Departures with space after the time",
      "Four module rows", "Two baseline sequences"]) {
      await expect(page.getByRole("img", { name })).toBeVisible();
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
    await page.getByRole("navigation", { name: "Composition of interfaces", exact: true }).getByRole("link", { name: "Laboratory" }).click();
    await expect(page.locator("#grid-frame")).toBeVisible();
    await page.getByLabel("Open collection navigation").check();
    const index = page.getByRole("navigation", { name: "Sound archive" }).getByRole("link", { name: "Collection index" });
    await index.press("Enter");
    await expect(page).toHaveURL(/#archive-index-title$/);
    await page.getByLabel("Allow 18 rem for the note").check();
    await expect(page.getByRole("heading", { name: "East landing and harbour wall microphones" })).toBeVisible();
  } finally {
    await page.close();
  }
});

async function archiveLayout(page: Page) {
  return page.locator(".archive-series__frame").evaluate(frame => {
    const rect = (selector: string) => frame.querySelector(selector)!.getBoundingClientRect();
    const passage = rect(".archive-passage");
    const note = rect(".archive-note");
    const firstTake = rect(".archive-take");
    const firstEntry = rect(".archive-index dl > div");
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
    return {
      frame: frame.getBoundingClientRect().width / rem,
      noteBeside: Math.abs(note.top - passage.top) < 1,
      paired: Math.abs(firstTake.top - rect(".archive-take:last-child").top) < 1,
      entries: [...frame.querySelectorAll(".archive-index dl > div")].filter(entry =>
        Math.abs(entry.getBoundingClientRect().top - firstEntry.top) < 1).length,
      commonEdge: [firstTake.left, firstEntry.left].every(x => Math.abs(passage.left - x) < 1),
    };
  });
}

test("each archive view changes at the width its content requires", async ({ page }) => {
  await page.goto(laboratory);
  const width = page.getByRole("slider", { name: "Available width" });
  for (const frame of [30.75, 31, 36.75, 37, 40, 41.75, 42, 44.75, 45, 54]) {
    await width.fill(String(frame));
    expect(await archiveLayout(page)).toEqual({
      frame, noteBeside: frame >= 42, paired: frame >= 37,
      entries: frame >= 45 ? 3 : frame >= 31 ? 2 : 1, commonEdge: true,
    });
  }
  await page.getByLabel("Allow 18 rem for the note").check();
  await width.fill("50.75");
  expect(await archiveLayout(page)).toMatchObject({ noteBeside: false, paired: true, entries: 3 });
  await width.fill("51");
  expect(await archiveLayout(page)).toMatchObject({ noteBeside: true, commonEdge: true });
  const passage = (await page.locator(".archive-passage").boundingBox())!;
  const note = (await page.locator(".archive-note").boundingBox())!;
  expect(note.width).toBeCloseTo(passage.width, 1);
  await page.getByLabel("Show column edges").uncheck();
  expect(await page.locator(".archive-note").boundingBox()).toEqual(note);
  await width.fill("56");
  expect(await archiveLayout(page)).toMatchObject({ frame: 54, noteBeside: true });
});

test("opening navigation changes the pane at a fixed window width and stacks on a narrow screen", async ({ page }) => {
  await page.goto(laboratory);
  const width = page.getByRole("slider", { name: "Available width" });
  const navigation = page.getByRole("navigation", { name: "Sound archive" });
  await width.fill("56");
  expect(await archiveLayout(page)).toMatchObject({ frame: 54, noteBeside: true, paired: true, entries: 3 });
  await page.getByLabel("Open collection navigation").check();
  await expect(navigation).toBeVisible();
  expect(await archiveLayout(page)).toEqual({ frame: 41, noteBeside: false, paired: true, entries: 2, commonEdge: true });
  await expect(page.locator(".archive-series__measure")).toContainText("Shared frame 41 rem");
  await page.setViewportSize({ width: 320, height: 740 });
  await expect.poll(() => width.inputValue().then(Number)).toBeLessThan(20);
  const nav = (await navigation.boundingBox())!;
  const pane = (await page.locator(".archive-series__frame").boundingBox())!;
  expect(pane.y).toBeGreaterThanOrEqual(nav.y + nav.height - .5);
  expect(await archiveLayout(page)).toMatchObject({ noteBeside: false, paired: false, entries: 1 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  await page.setViewportSize({ width: 1400, height: 1000 });
  await expect(width).toHaveValue("56");
  await page.getByLabel("Open collection navigation").uncheck();
  expect(await archiveLayout(page)).toMatchObject({ frame: 54, noteBeside: true, paired: true, entries: 3 });
});

test("one measured slot produces different line endings when only the typeface changes", async ({ page }) => {
  await page.goto(study);
  const settings = await page.locator(".composed-labels__line").evaluateAll(async elements => {
    await document.fonts.ready;
    return Promise.all(elements.map(async specimen => {
      const style = getComputedStyle(specimen);
      const faces = await document.fonts.load(`${style.fontWeight} ${style.fontSize} ${style.fontFamily}`, specimen.textContent!);
      const range = document.createRange();
      range.selectNodeContents(specimen);
      const lines = range.getClientRects().length;
      const slot = specimen.getBoundingClientRect().width;
      const copy = specimen.cloneNode(true) as HTMLElement;
      Object.assign(copy.style, { position: "absolute", visibility: "hidden", whiteSpace: "nowrap", inlineSize: "max-content" });
      document.body.append(copy);
      const short = copy.getBoundingClientRect().width;
      copy.textContent = "East landing and harbour wall microphones";
      const long = copy.getBoundingClientRect().width;
      copy.remove();
      return { faces: faces.length, lines, slot, short, long };
    }));
  });
  const [instrument, roboto] = settings;
  if (!instrument || !roboto) throw new Error("Both type specimens are required for the comparison.");
  expect(instrument.lines).toBe(2);
  expect(roboto.lines).toBe(1);
  expect(instrument.slot).toBeCloseTo(181.33, 1);
  expect(roboto.slot).toBeCloseTo(instrument.slot, 2);
  expect(instrument.short).toBeGreaterThan(instrument.slot);
  expect(roboto.short).toBeLessThan(roboto.slot);
  for (const setting of settings) {
    expect(setting.faces).toBeGreaterThan(0);
    expect(setting.long).toBeGreaterThan(288);
  }
});

test("the leading edge follows the reading direction and larger type brings the views into one column", async ({ page }) => {
  await page.setViewportSize({ width: 900, height: 900 });
  await page.goto(laboratory);
  const frame = page.locator(".archive-series__frame");
  await page.getByRole("slider", { name: "Available width" }).fill("46");
  await frame.evaluate(node => node.setAttribute("dir", "rtl"));
  const start = await frame.evaluate(node => {
    const bounds = (selector: string) => node.querySelector(selector)!.getBoundingClientRect();
    return {
      edge: bounds(".archive-passage").right,
      comparison: bounds(".archive-take").right,
      index: bounds(".archive-index dt").right,
      noteBeforePassage: bounds(".archive-note").right < bounds(".archive-passage").left,
      order: Array.from(node.querySelector(".archive-record")!.children, section => section.tagName),
    };
  });
  expect(start.comparison).toBeCloseTo(start.edge, 1);
  expect(start.index).toBeCloseTo(start.edge, 1);
  expect(start.noteBeforePassage).toBe(true);
  expect(start.order).toEqual(["DIV", "ASIDE"]);
  await page.evaluate(() => { document.documentElement.style.fontSize = "200%"; });
  await expect.poll(async () => (await archiveLayout(page)).frame).toBeLessThan(31);
  expect(await archiveLayout(page)).toMatchObject({ noteBeside: false, paired: false, entries: 1 });
});

async function checkConstruction(page: Page) {
  const setting = (name: string) => page.locator("#grid-" + name).inputValue().then(Number);
  const [columns, margin, gutter, span] = await Promise.all([
    setting("columns"), setting("margin"), setting("gutter"), setting("span"),
  ]);
  const frame = (await page.locator("#grid-frame").boundingBox())!;
  const lead = (await page.locator(".grid-sheet__lead").boundingBox())!;
  const track = (frame.width - 2 * margin - (columns - 1) * gutter) / columns;
  const spanSize = span * track + (span - 1) * gutter;
  for (const [key, size] of [["track", track], ["span", spanSize]] as const) {
    const value = await page.locator(`[data-readout="${key}"]`).textContent();
    expect(Math.abs(parseFloat(value!) - size)).toBeLessThan(.6);
  }
  expect(Math.abs(lead.x - frame.x - margin)).toBeLessThan(1);
  expect(Math.abs(lead.width - spanSize)).toBeLessThan(1);
}

test("the working grid allocates real spans as columns, margins and gutters change", async ({ page }) => {
  await page.goto(laboratory);
  await expect(page.locator("#grid-columns")).toBeEnabled();
  await checkConstruction(page);
  for (const name of ["columns", "margin", "gutter", "span"]) {
    const slider = page.locator("#grid-" + name);
    const old = await slider.inputValue();
    await slider.focus();
    await slider.press("ArrowRight");
    await expect(slider).not.toHaveValue(old);
    await checkConstruction(page);
  }
  const lead = page.locator(".grid-sheet__lead");
  const before = await lead.boundingBox();
  await page.locator("#grid-guides").uncheck();
  expect(await lead.boundingBox()).toEqual(before);
});

test("the preview measures its available width after reflow and responds to the baseline control", async ({ page }) => {
  await page.goto(laboratory);
  await expect(page.locator(".grid-sheet__lead")).toBeVisible();
  const initialWidth = (await page.locator("#grid-frame").boundingBox())!.width;
  const module = page.locator('[data-readout="module"]');
  const before = await module.textContent();
  await page.locator("#grid-baseline").press("ArrowRight");
  await expect(module).not.toHaveText(before!);
  await page.setViewportSize({ width: 320, height: 740 });
  await expect.poll(async () => (await page.locator("#grid-frame").boundingBox())!.width).toBeLessThan(initialWidth);
  await checkConstruction(page);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
});

test("one-column and fully occupied sheets still close at the far margin", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto(laboratory);
  await page.locator("#grid-width").press("Home");
  const columns = page.locator("#grid-columns");
  await columns.press("Home");
  await expect(page.locator("#grid-gutter")).toBeDisabled();
  await expect(page.locator("#grid-span")).toHaveValue("1");
  await checkConstruction(page);
  await expect(page.locator('[data-readout="reserve"]')).toHaveText("0 px");

  await columns.press("End");
  for (const control of ["margin", "gutter", "span"]) await page.locator("#grid-" + control).press("End");
  await expect(page.locator("#grid-span")).toHaveValue("12");
  await checkConstruction(page);
  await expect(page.locator('[data-readout="reserve"]')).toHaveText("0 px");
});
