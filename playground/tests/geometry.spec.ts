import { expect, test } from "@playwright/test";
import { auditSite } from "../scripts/audit-geometry.js";
import { auditContours, collectBoxes } from "../src/geometry/audit.js";

const study = "/research/geometry-of-interfaces/";
const atlas = study + "atlas/";
const route = study + "laboratory/";
const readout = (name: string) => `[data-readout="${name}"]`;

test("the atlas names its six plates and describes every drawing", async ({ page }) => {
  await page.goto(atlas);
  await expect(page).toHaveTitle("Geometry of interfaces, atlas · Elea");
  await expect(page.getByRole("heading", { level: 1, name: "Atlas" })).toBeVisible();
  const studies = page.getByRole("navigation", { name: "Research", exact: true });
  await expect(studies.getByRole("link")).toHaveText(["All studies", "Geometry of interfaces", "Composition of interfaces"]);
  await expect(studies.getByRole("link", { name: "Geometry of interfaces" })).toHaveAttribute("aria-current", "true");
  const guide = page.getByRole("navigation", { name: "Geometry of interfaces", exact: true });
  await expect(guide.getByRole("link")).toHaveText(["Study", "Atlas", "Laboratory"]);
  await expect(guide.getByRole("link", { name: "Atlas" })).toHaveAttribute("aria-current", "page");
  await expect(guide.getByRole("link", { name: "Laboratory" })).not.toHaveAttribute("aria-current");
  await expect(page.locator(".geo-lab")).toHaveCount(0);
  await expect(guide.getByRole("link", { name: "Study" })).toHaveAttribute("href", "../");
  const plates = page.locator(".geo-plate");
  await expect(plates).toHaveCount(6);
  for (const title of ["A corner is a transition", "Curvature, drawn", "One family, one parameter",
    "Contours inside contours", "Corrections for the eye", "Shape as character"]) {
    await expect(page.getByRole("heading", { level: 3, name: title })).toBeVisible();
  }
  const drawings = page.locator(".geo-plate svg[role=img]");
  await expect(drawings).toHaveCount(5);
  for (const drawing of await drawings.all()) {
    expect(await drawing.locator("title").textContent()).not.toBe("");
    expect(await drawing.locator("desc").textContent()).not.toBe("");
  }
  await expect(page.locator(".geo-specimens > li")).toHaveCount(9);
  await page.getByRole("link", { name: "Open the laboratory" }).click();
  await expect(page).toHaveURL(/\/laboratory\/$/);
});

test("the laboratory is operated from the keyboard and reports what it draws", async ({ page }) => {
  await page.goto(route);
  await expect(page).toHaveTitle("Geometry of interfaces, laboratory · Elea");
  await expect(page.getByRole("heading", { level: 1, name: "Laboratory" })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Geometry of interfaces", exact: true }).getByRole("link", { name: "Laboratory" }))
    .toHaveAttribute("aria-current", "page");
  await expect(page.locator(".geo-plate")).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Open the atlas" })).toHaveAttribute("href", /\/atlas\/$/);
  const lab = page.locator(".geo-lab");
  await expect(lab.locator(readout("radius"))).toHaveText("44.2 px");
  await expect(lab.locator(readout("cut"))).toHaveText("9.9 px");
  await expect(lab.locator(readout("gap"))).toHaveText("12 px to 14.3 px");

  const outline = lab.locator(".geo-lab__stage .gp-curve--squircle");
  const before = await outline.getAttribute("d");
  const radius = lab.getByRole("slider", { name: "Radius" });
  await radius.focus();
  await page.keyboard.press("ArrowRight");
  await expect(radius).toHaveValue("25");
  await expect(lab.locator(readout("cut"))).toHaveText("10.4 px");
  expect(await outline.getAttribute("d")).not.toBe(before);

  // A circular arc keeps the same gap all the way round a concentric inner contour.
  const curve = lab.getByRole("slider", { name: "Curve K" });
  await curve.focus();
  for (let step = 0; step < 4; step += 1) await page.keyboard.press("ArrowLeft");
  await expect(curve).toHaveValue("1");
  await expect(lab.locator(readout("radius"))).toHaveText("25 px");
  await expect(lab.locator(readout("gap"))).toHaveText("12 px to 12 px");
});

test("the construction leaves themed shapes alone and keeps the focus outline whole", async ({ page }) => {
  await page.goto(route);
  const shape = (scope: string) => page.locator(`${scope} .elea-button`).first().evaluate(button => {
    const style = getComputedStyle(button);
    return { radius: style.borderTopLeftRadius, clip: style.clipPath, mask: style.maskImage, overflow: style.overflow };
  });
  const production = await shape("[aria-labelledby=geo-lab-current]");
  const experiment = await shape(".geo-lab__experiment");
  expect(experiment.radius).not.toBe(production.radius);
  expect(experiment.clip).toBe("none");
  expect(experiment.mask).toBe("none");

  const button = page.locator(".geo-lab__experiment .elea-button").first();
  await page.keyboard.press("Tab");
  await button.focus();
  const focus = await button.evaluate(element => {
    const style = getComputedStyle(element);
    let clipped = false;
    for (let parent = element.parentElement; parent && !parent.classList.contains("geo-lab"); parent = parent.parentElement) {
      clipped ||= getComputedStyle(parent).overflow !== "visible";
    }
    return { visible: element.matches(":focus-visible"), style: style.outlineStyle, width: Number.parseFloat(style.outlineWidth), clipped };
  });
  expect(focus.visible).toBe(true);
  expect(focus.style).not.toBe("none");
  expect(focus.width).toBeGreaterThanOrEqual(2);
  expect(focus.clipped).toBe(false);

  await page.locator(".geo-lab").getByRole("slider", { name: "Radius" }).fill("40");
  expect((await shape("[aria-labelledby=geo-lab-current]")).radius).toBe(production.radius);
});

test("the page fits a narrow screen and wide plates scroll inside a focusable frame", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto(atlas);
  await expect(page.locator(".geo-plate")).toHaveCount(6);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
  const sheet = page.locator(".geo-plate__sheet").nth(1);
  expect(await sheet.evaluate(element => element.scrollWidth > element.clientWidth)).toBe(true);
  await sheet.focus();
  await expect(sheet).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect.poll(() => sheet.evaluate(element => element.scrollLeft)).toBeGreaterThan(0);
});

test("the study keeps wide tables in keyboard-scrollable regions on a phone", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto(study);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0);
  for (const name of ["Corner measurements", "Geometry, perception and artistic decisions"]) {
    const region = page.getByRole("region", { name, exact: true });
    await expect(region.getByRole("table")).toBeVisible();
    expect(await region.evaluate(element => element.scrollWidth > element.clientWidth)).toBe(true);
    await region.focus();
    await expect(region).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await expect.poll(() => region.evaluate(element => element.scrollLeft)).toBeGreaterThan(0);
  }
});

test("the audit reads the shape and radius of an independently styled corner", async ({ page }) => {
  await page.setContent(`
    <div class="corner-sample" style="width: 160px; height: 160px; background: red;
      border-radius: 80px 4px 0 0; corner-top-right-shape: squircle"></div>
  `);
  const boxes = await page.evaluate(collectBoxes, ".corner-sample");
  const result = auditContours(boxes, { radiusScale: [4, 6, 8, 12] });
  for (const id of ["radius-and-curve", "continuity-on-large-contours"]) {
    const rule = result.find(entry => entry.rule === id);
    expect(rule).toMatchObject({ assessed: 1, passed: false });
    expect(rule?.findings.map(finding => finding.label)).toEqual(["div.corner-sample (top right)"]);
  }
});

test("the laboratory redraws within a frame budget", async ({ page }) => {
  await page.goto(route);
  const radius = page.locator(".geo-lab").getByRole("slider", { name: "Radius" });
  await radius.focus();
  const worst = await page.evaluate(async () => {
    let longest = 0;
    const observer = new PerformanceObserver(list => {
      for (const entry of list.getEntries()) longest = Math.max(longest, entry.duration);
    });
    observer.observe({ type: "longtask", buffered: false });
    const slider = document.activeElement as HTMLInputElement;
    const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!;
    for (let step = 0; step <= 64; step += 1) {
      set.call(slider, String(step));
      slider.dispatchEvent(new Event("input", { bubbles: true }));
      await new Promise(resolve => requestAnimationFrame(resolve));
    }
    observer.disconnect();
    return longest;
  });
  await expect(page.locator(readout("radius"))).toHaveText("80 px");
  expect(worst).toBeLessThan(100);
});

test("every page and every guide in every theme follows the rules of the study", async ({ page, baseURL }) => {
  test.setTimeout(600_000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  const { broken, report } = await auditSite(page, baseURL!);
  expect(broken, report).toBe(0);
});
