import { expect, test, type Locator } from "@playwright/test";
import { editions, makeBrandTheme } from "@alien6-studio/elea-tokens/brand";
import { textContrast } from "./contrast.js";

const lab = "/elea/playground/#/ui/";
const brand = makeBrandTheme(editions.Editorial, "journal");
const opposite = (mode: "light" | "dark") => mode === "light" ? "dark" : "light";
const roles = [
  "text-default", "text-muted", "text-subtle", "text-inverse", "text-on-brand", "text-accent",
  "text-link", "text-link-hover", "surface-default", "surface-subtle", "surface-muted", "surface-inverse",
  "border-default", "border-strong", "border-accent", "focus", "success", "warning", "danger", "info",
];

async function colors(scope: Locator) {
  return scope.evaluate((element, names) => {
    const sample = document.createElement("span");
    element.appendChild(sample);
    const values = names.map(name => {
      sample.style.color = `var(--elea-color-${name})`;
      return getComputedStyle(sample).color;
    });
    sample.remove();
    return values;
  }, roles);
}

async function scope(container: Locator, mode: string) {
  await container.evaluate((element, value) => {
    element.setAttribute("data-elea-appearance", value);
    element.setAttribute("data-elea-theme", "journal");
  }, mode);
}

for (const host of ["light", "dark"] as const) {
  const local = opposite(host);
  test(`one brand supports nested and adjacent appearances in a ${host} host`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: local });
    await page.goto(lab + "button");
    const html = page.locator("html");
    await html.evaluate((element, mode) => element.setAttribute("data-theme", mode), host);
    await page.addStyleTag({ content: brand.css });
    await page.locator("main").evaluate((main, { host, local }) => {
      const root = document.createElement("div");
      root.dataset.eleaTheme = "journal";
      root.innerHTML = `<section id="same" data-elea-appearance="${host}"></section>
        <section id="opposite" data-elea-appearance="${local}">
          <section id="nested" data-elea-appearance="${host}"></section>
          <section id="nested-brand" data-elea-theme="journal"></section>
        </section><section id="auto" data-elea-appearance="auto"></section>`;
      main.appendChild(root);
    }, { host, local });
    const outer = await colors(html);
    const same = await colors(page.locator("#same"));
    const independent = await colors(page.locator("#opposite"));
    expect(same).toHaveLength(20);
    expect(independent.filter((value, index) => value !== same[index]).length).toBeGreaterThanOrEqual(16);
    await expect(page.locator("#opposite")).toHaveCSS("color-scheme", local);
    await expect(page.locator("#auto")).toHaveCSS("color-scheme", "light dark");
    expect(await colors(page.locator("#auto"))).toEqual(independent);
    expect(await colors(page.locator("#nested"))).toEqual(same);
    expect(await colors(page.locator("#nested-brand"))).toEqual(independent);
    await page.locator("#opposite").evaluate((element, mode) => element.setAttribute("data-elea-appearance", mode), host);
    expect(await colors(page.locator("#opposite"))).toEqual(same);
    expect(await colors(html)).toEqual(outer);

    const variants = page.locator(".demo").first();
    await scope(variants, local);
    for (const name of ["Primary", "Secondary", "Outline", "Ghost", "Danger", "Success", "Info"]) {
      const button = variants.getByRole("button", { name, exact: true });
      const label = button.locator(".elea-button__label");
      expect(await textContrast(label), name).toBeGreaterThanOrEqual(4.5);
      await button.hover();
      await expect.poll(() => textContrast(label)).toBeGreaterThanOrEqual(4.5);
    }
  });

  test(`an open React portal switches appearance in a ${host} host`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: host });
    await page.goto(lab + "dialog");
    await page.addStyleTag({ content: brand.css });
    const main = page.getByRole("main");
    await scope(main, local);
    const opener = main.getByRole("button", { name: "Share article" });
    await opener.click();
    const dialog = page.getByRole("dialog", { name: "Share this article" });
    const backdrop = dialog.locator("..");
    await expect(backdrop).toHaveAttribute("data-elea-theme", "journal");
    await expect(backdrop).toHaveAttribute("data-elea-appearance", local);
    await expect(dialog.getByRole("textbox")).toHaveCSS("color-scheme", local);
    expect(await colors(dialog)).toEqual(await colors(main));
    const before = await colors(page.locator("html"));
    const control = dialog.getByRole("textbox");
    await control.focus();
    await scope(main, host);
    await expect(backdrop).toHaveAttribute("data-elea-appearance", host);
    await expect(control).toBeFocused();
    expect(await colors(dialog)).toEqual(await colors(main));
    expect(await colors(page.locator("html"))).toEqual(before);
    await page.keyboard.press("Escape");
    await expect(opener).toBeFocused();
  });
}

for (const host of ["light", "dark"] as const) {
  for (const fallback of [false, true]) {
    test(`overlays retain local appearance in a ${host} host (${fallback ? "fallback" : "native top layer"})`, async ({ page }) => {
      await page.emulateMedia({ colorScheme: host, reducedMotion: "reduce" });
      if (fallback) await page.addInitScript(() => { Reflect.deleteProperty(HTMLElement.prototype, "showPopover"); });
      const main = page.getByRole("main");
      const button = (name: string) => main.getByRole("button", { name, exact: true }).first();
      const cases = [
        { route: "popover", trigger: "Invite", surface: () => page.getByRole("dialog", { name: "Invite a reader" }), native: true },
        { route: "popover", trigger: "Reject", surface: () => page.getByRole("alertdialog", { name: "Reject this article?" }), native: true },
        { route: "tooltip", trigger: "", surface: () => page.getByRole("tooltip"), native: true },
        { route: "sheet", trigger: "Edit details", surface: () => page.getByRole("dialog", { name: "Article details" }) },
        { route: "toast", trigger: "Danger", surface: () => page.getByRole("region", { name: "Notifications" }) },
        { route: "dialog", trigger: "Delete project", surface: () => page.getByRole("dialog", { name: "Delete this project?" }) },
        { route: "menu", trigger: "Actions", surface: () => page.getByRole("menu", { name: "Article actions" }) },
        { route: "select", trigger: "", surface: () => page.getByRole("listbox").first() },
      ];

      for (const { route, trigger, surface, native } of cases) {
        if (fallback && !native) continue;
        await page.goto(lab + route);
        await page.reload();
        await page.addStyleTag({ content: brand.css });
        await scope(main, opposite(host));
        if (trigger) await button(trigger).click();
        else if (route === "tooltip") await page.getByText("Quarterly revenue by region", { exact: true }).first().hover();
        else await main.getByRole("combobox").first().click();

        const overlay = surface();
        await expect(overlay).toBeVisible();
        await expect(overlay).toHaveCSS("color-scheme", opposite(host));
        expect(await colors(overlay)).toEqual(await colors(main));
        if (native) expect(await overlay.evaluate(node => node.hasAttribute("popover"))).toBe(!fallback);
        await scope(main, host);
        await expect(overlay).toHaveCSS("color-scheme", host);
        expect(await colors(overlay)).toEqual(await colors(main));
        await expect(page.locator("html")).toHaveAttribute("data-theme", host);
      }
    });
  }
}
