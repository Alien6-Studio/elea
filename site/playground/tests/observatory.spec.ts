import { expect, test, type Page } from "@playwright/test";

const study = "/research/interaction-observatory/";
const route = study + "laboratory/";

async function expectFiguresWithinReadingColumn(page: Page, figureCount: number) {
  const figures = page.locator(".docs-article > .elea-card");
  await expect(figures).toHaveCount(figureCount);
  for (const width of [320, 390, 768, 1024, 1152, 1440, 1571]) {
    await page.setViewportSize({ width, height: 740 });
    const prose = (await page.locator(".docs-article > p").first().boundingBox())!;
    const edges = await figures.evaluateAll(cards => cards.map(card => {
      const { left, right } = card.getBoundingClientRect();
      return { left, right };
    }));
    for (const [index, { left, right }] of edges.entries()) {
      const figure = `Figure ${index + 1} at ${width}px`;
      expect(Math.abs(left - prose.x), `${figure} left edge`).toBeLessThanOrEqual(1);
      expect(Math.abs(right - (prose.x + prose.width)), `${figure} right edge`).toBeLessThanOrEqual(1);
    }
    const overflow = await page.evaluate(() => {
      const article = document.querySelector(".docs-article")!;
      const blocks = [document.documentElement, article, ...article.querySelectorAll("*")];
      return blocks.filter(element => element.clientWidth > 0
        && ["block", "grid", "flex", "table", "table-cell"].includes(getComputedStyle(element).display)
        && element.scrollWidth - element.clientWidth > 1)
        .map(element => element.getAttribute("aria-label") ?? element.className);
    });
    expect(overflow, `Overflow at ${width}px`).toEqual([]);
  }
}

test("Research presents the computed figures without loading the laboratory", async ({ baseURL, browser }) => {
  const page = await browser.newPage({ baseURL, javaScriptEnabled: false, viewport: { width: 320, height: 740 } });
  try {
    await page.goto("/research/");
    await page.getByRole("link", { name: "Read the interaction study" }).click();
    await expect(page).toHaveURL(new RegExp(study + "$"));
    await expect(page.getByRole("heading", { name: "Interaction Observatory", level: 1 })).toBeVisible();
    await expect(page.getByRole("img", { name: /timing of intersection/i })).toBeVisible();
    const trials = page.getByRole("region", { name: "Synthetic attempt outcomes" });
    const bounds = trials.getByRole("row", { name: /Save bounds/ });
    await expect(bounds.getByRole("cell")).toHaveText(["56%–76%", "60%–65%"]);
    await expect(page.locator('script[src*="interaction-lab.js"]')).toHaveCount(0);
    await expectFiguresWithinReadingColumn(page, 2);
    const parts = page.getByRole("navigation", { name: "Interaction Observatory", exact: true });
    await parts.getByRole("link", { name: "Atlas" }).click();
    await expect(page).toHaveURL(new RegExp(study + "atlas/$"));
    await expect(parts.getByRole("link", { name: "Atlas" })).toHaveAttribute("aria-current", "page");
    await expect(page.getByRole("heading", { name: "Interaction atlas", level: 1 })).toBeVisible();
    await expect(page.getByRole("region", { name: "Order within the last time bucket" }).getByRole("cell", { name: "2,260 ms" })).toHaveCount(2);
    await expect(page.getByRole("img", { name: /continuous and interrupted exposure/i })).toBeVisible();
    await expect(page.locator('script[src*="interaction-lab.js"]')).toHaveCount(0);
    await expectFiguresWithinReadingColumn(page, 4);
    await parts.getByRole("link", { name: "Laboratory" }).click();
    await expect(page).toHaveURL(new RegExp(route + "$"));
    await expect(page.getByRole("heading", { name: "Interaction laboratory" })).toBeVisible();
  } finally {
    await page.close();
  }
});

test("the former documentation URL opens the research laboratory", async ({ page }) => {
  await page.goto("/observatory/?from=bookmark");
  await expect(page).toHaveURL(/research\/interaction-observatory\/laboratory\/\?from=bookmark$/);
  await expect(page.getByRole("button", { name: "Start local session" })).toBeVisible();
});

test("the observatory tracks only an enabled workbench and keeps its event records local", async ({ page, browserName }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.addInitScript(() => {
    let bindings = 0;
    const add = EventTarget.prototype.addEventListener;
    const remove = EventTarget.prototype.removeEventListener;
    const isBinding = (target: EventTarget, type: string) => target instanceof Element
      && target.id.startsWith("observe-action-") && ["click", "focus", "blur"].includes(type);
    EventTarget.prototype.addEventListener = function (type, callback, options) {
      if (isBinding(this, type)) bindings++;
      add.call(this, type, callback, options);
    };
    EventTarget.prototype.removeEventListener = function (type, callback, options) {
      if (isBinding(this, type)) bindings--;
      remove.call(this, type, callback, options);
    };
    const observed = new Set<IntersectionObserver>();
    const observe = IntersectionObserver.prototype.observe;
    const disconnect = IntersectionObserver.prototype.disconnect;
    IntersectionObserver.prototype.observe = function (target) {
      if (target.id === "observe-preview") observed.add(this);
      observe.call(this, target);
    };
    IntersectionObserver.prototype.disconnect = function () {
      observed.delete(this);
      disconnect.call(this);
    };
    Object.defineProperties(window, {
      workbenchBindings: { get: () => bindings },
      workbenchObservers: { get: () => observed.size },
    });
  });

  const requests: string[] = [];
  await page.goto(route, { waitUntil: "networkidle" });
  page.on("request", request => requests.push(request.url()));
  const storage = () => page.evaluate(() => ({
    cookies: document.cookie, local: JSON.stringify(localStorage), session: JSON.stringify(sessionStorage),
  }));
  const wiring = () => page.evaluate(() => ({
    listeners: Reflect.get(window, "workbenchBindings") as number,
    observers: Reflect.get(window, "workbenchObservers") as number,
  }));
  const priorStorage = await storage();
  const workbench = page.getByRole("region", { name: "Workbench" });
  const preview = workbench.getByRole("button", { name: "Preview" });
  const ledger = page.getByRole("list", { name: "Event sequence" });
  const inspector = page.getByRole("region", { name: "Event structure" });
  const row = (pattern: RegExp) => ledger.getByRole("button", { name: pattern });

  await expect(workbench.getByText("Collection off")).toBeVisible();
  await preview.click();
  await workbench.getByRole("button", { name: "Save example" }).press("Enter");
  await expect(ledger).toHaveCount(0);
  expect(await wiring()).toEqual({ listeners: 0, observers: 0 });
  await workbench.getByRole("button", { name: "Reset" }).click();

  await workbench.getByRole("button", { name: "Start local session" }).click();
  await expect(workbench.getByText("Local collection on")).toBeVisible();
  expect(await wiring()).toEqual({ listeners: 11, observers: 1 });
  // A script-generated click does not stand in for the demo participant.
  await preview.evaluate(element => (element as HTMLElement).click());
  await expect(ledger).toHaveCount(0);

  await preview.click();
  await expect(row(/Activation · preview/)).toHaveCount(1);
  await expect(row(/Exposure · preview-region/)).toHaveCount(1);
  const zone = page.getByRole("region", { name: "Activation map" }).locator(".elea-measurement__cell")
    .filter({ hasText: "Preview" });
  await expect(zone.locator("dd")).toHaveText("1");

  await preview.focus();
  await page.keyboard.press(browserName === "webkit" ? "ArrowRight" : "Tab");
  await expect(workbench.getByRole("button", { name: "Change layout" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(row(/State change · workbench-layout/)).toHaveCount(1);
  await page.keyboard.press("ArrowRight");
  await expect(workbench.getByRole("button", { name: "Save example" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(row(/Task result · save-status/)).toHaveCount(1);
  await row(/Activation · save/).click();
  const payload = JSON.parse((await inspector.locator("code").innerText()));
  expect(payload).toEqual({
    schemaVersion: 1, kind: "interaction.activated",
    target: { surface: "workbench", component: "button", slot: "save", role: "button", state: null, variant: "outline" },
    context: { theme: "workbench", appearance: "light", density: "standard", experiment: null },
    detail: { source: "application-command", modality: "keyboard" },
  });
  await expect(row(/Focus · save/).first()).toBeVisible();

  await workbench.getByRole("button", { name: "Stop and clear" }).click();
  await expect(ledger).toHaveCount(0);
  expect(await wiring()).toEqual({ listeners: 0, observers: 0 });
  await preview.click();
  await expect(ledger).toHaveCount(0);
  expect(await storage()).toEqual(priorStorage);
  expect(requests).toEqual([]);
});

test("synthetic data stays separate and the mobile workbench has no horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto(route);
  const data = page.getByRole("group", { name: "Data source" });
  await data.getByRole("button", { name: "Synthetic example" }).press("Enter");
  await expect(page.getByRole("list", { name: "Event sequence" }).getByRole("listitem")).toHaveCount(5);
  await expect(page.getByText("Prepared records", { exact: false })).toBeVisible();
  await expect(page.getByRole("button", { name: "Start local session" })).toHaveCount(0);
  const width = () => page.evaluate(() => document.documentElement.scrollWidth);
  expect(await width()).toBeLessThanOrEqual(320);
  await data.getByRole("button", { name: "Local session" }).press("Enter");
  await expect(page.getByText("Collection off")).toBeVisible();
  await expect(page.getByRole("list", { name: "Event sequence" })).toHaveCount(0);
  const workbench = page.getByRole("region", { name: "Workbench" });
  await workbench.getByRole("button", { name: "Start local session" }).press("Enter");
  await workbench.getByRole("button", { name: "Preview", exact: true }).press("Enter");
  await expect(page.getByRole("region", { name: "Document preview" })).toBeVisible();
  const overflowingControls = await page.evaluate(() =>
    [...document.querySelectorAll('[id^="observe-action-"]')]
      .filter(element => element.scrollWidth - element.clientWidth > 1)
      .map(element => element.id),
  );
  expect(overflowingControls).toEqual([]);
  expect(await width()).toBeLessThanOrEqual(320);
});
