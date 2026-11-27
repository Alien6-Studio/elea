import { expect, test, type Locator } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { colorThemes } from "@alien6-studio/elea-tokens/palette";
import { textContrast } from "./contrast";

for (const reducedMotion of ["reduce", "no-preference"] as const) {
  test(`navbar switches legible colour pairs together with ${reducedMotion} motion`, async ({ page }) => {
    await page.emulateMedia({ colorScheme: "light", reducedMotion });
    await page.goto("/playground/#/ui/button?scheme=reserve");
    const picker = page.getByRole("combobox", { name: "Site theme", exact: true });
    const sample = page.getByRole("button", { name: "info solid", exact: true });
    await picker.click();
    const next = page.getByRole("option", { name: "Braise", exact: true });
    await expect(next).toBeVisible();
    expect(await textContrast(sample)).toBeGreaterThanOrEqual(4.5);
    const transitions = await sample.evaluate(element => getComputedStyle(element).transitionProperty);
    const recording = await sample.evaluateHandle(element => {
      const pairs = new Set<string>();
      let frame: number;
      function pair() {
        const styles = getComputedStyle(element);
        return `${styles.color} on ${styles.backgroundColor}`;
      }
      function record() {
        pairs.add(pair());
        frame = requestAnimationFrame(record);
      }
      record();
      return async () => {
        await new Promise(requestAnimationFrame);
        await Promise.allSettled(element.getAnimations().filter(animation => "transitionProperty" in animation).map(animation => animation.finished));
        cancelAnimationFrame(frame);
        pairs.add(pair());
        return [...pairs];
      };
    });
    await next.click();
    await expect(picker).toHaveText("Braise");
    const pairs = await recording.evaluate(stop => stop());
    expect(pairs).toHaveLength(2);
    expect(await textContrast(sample)).toBeGreaterThanOrEqual(4.5);
    await expect(sample).toHaveCSS("transition-property", transitions);
  });
}

test("the navbar applies each complete theme, including the static notebook and the button guide", async ({ page }) => {
  await page.goto("/");
  const picker = page.getByRole("combobox", { name: "Site theme", exact: true });
  const cta = page.getByRole("link", { name: "Explore components" });
  async function checkPrimary(id: keyof typeof colorThemes) {
    const colour = colorThemes[id].colours.primary;
    const rgb = colour.slice(1).match(/../g)!.map(hex => parseInt(hex, 16));
    await expect(cta).toHaveCSS("background-color", `rgb(${rgb.join(", ")})`);
  }
  const profiles = Object.entries(colorThemes).filter(([, theme]) => "profile" in theme);
  await expect(picker).toHaveText("Réserve");
  for (const [id, theme] of profiles) {
    await picker.click();
    const options = page.getByRole("listbox", { name: "Site theme" });
    await expect(options.getByRole("option")).toHaveCount(profiles.length);
    await options.getByRole("option", { name: theme.name, exact: true }).click();
    await checkPrimary(id as keyof typeof colorThemes);
    await expect(page.locator("body")).toHaveCSS("background-color", "rgb(255, 255, 255)");
    await expect(page.getByRole("link", { name: "Edit this notebook" })).toHaveAttribute("href", new RegExp("scheme=" + id + "$"));
  }
  await page.getByRole("navigation", { name: "Main", exact: true }).getByRole("link", { name: "Typography" }).click();
  await expect(picker).toHaveText("Lisière");
  await page.reload();
  await expect(picker).toHaveText("Lisière");
  await page.getByRole("navigation", { name: "Main", exact: true }).getByRole("link", { name: "Components" }).click();
  await page.getByRole("link", { name: "Button", exact: true }).click();
  const primary = page.getByRole("button", { name: "Primary", exact: true });
  await expect(primary).toHaveCSS("background-color", "rgb(34, 111, 104)");
  await picker.click();
  await page.getByRole("option", { name: "Braise", exact: true }).click();
  await expect(page).toHaveURL(/#\/ui\/button\?scheme=braise$/);
  await expect(primary).toHaveCSS("background-color", "rgb(240, 170, 112)");
});

test("shared settings survive navigation and take priority over the saved navbar theme", async ({ page }) => {
  const picker = page.getByRole("combobox", { name: "Site theme", exact: true });
  await page.goto("/typography/");
  await picker.click();
  await page.getByRole("option", { name: "Braise", exact: true }).click();
  await page.goto("/playground/#/theme?scheme=reserve&radius=12px");
  await expect(picker).toHaveText("Custom theme");
  await expect(page.getByRole("textbox", { name: "Corner radius" })).toHaveValue("12px");
  const open = page.getByRole("link", { name: "Open themed gallery" });
  // The medium button uses three quarters of the supplied radius scale.
  await expect(open).toHaveCSS("border-top-left-radius", "9px");
  await open.click();
  await page.goBack();
  await expect(picker).toHaveText("Custom theme");
  await picker.click();
  await page.getByRole("option", { name: "Réserve", exact: true }).click();
  await expect(page.getByRole("textbox", { name: "Corner radius" })).toHaveValue("");
  await expect(open).not.toHaveCSS("border-top-left-radius", "9px");
  await expect(page).toHaveURL(/#\/theme\?scheme=reserve$/);
});

function cornerValues(button: Locator) {
  return button.evaluate(element => {
    const style = getComputedStyle(element);
    return [style.borderTopLeftRadius, style.borderTopRightRadius, style.borderBottomRightRadius, style.borderBottomLeftRadius];
  });
}

test("the Button guide shows the selected profile’s corners at equal widths", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/playground/#/ui/button");
  const picker = page.getByRole("combobox", { name: "Site theme", exact: true });
  const demo = page.locator("section.demo").filter({ has: page.getByRole("heading", { name: "Radius", exact: true }) });
  const sample = (label: string) => demo.getByRole("button", { name: `Publish (${label})`, exact: true });
  const smallCorners = {
    Rasance: ["7px 2px", "0px", "7px 2px", "0px"],
    Réserve: ["min(15%, 30px) 24%", "min(8.5%, 17px) 20%", "min(14.5%, 29px) 27%", "min(10.5%, 21px) 19%"],
    Braise: Array(4).fill("7px 3px"),
    "Hors champ": Array(4).fill("1.5px"),
    "Hors registre": ["1px", "7px", "1px", "7px"],
    "Échappée": ["9px", "9px", "9px", "0px"],
    "Grand bain": ["9px 5px", "9px 5px", "0px", "0px"],
    Ponctuation: Array(4).fill("12px"),
    "Lisière": ["12px 6px", "3px 4px", "8px", "6px 3px"],
  };
  for (const [name, small] of [...Object.entries(smallCorners), ["Rasance", smallCorners.Rasance] as const]) {
    await picker.click();
    await page.getByRole("option", { name, exact: true }).click();
    await expect(picker).toHaveText(name);
    await expect.poll(() => cornerValues(sample("Small"))).toEqual(small);
    const inherited = await cornerValues(sample("Inherited"));
    expect(await cornerValues(sample("Large"))).toEqual(inherited);
    const medium = await cornerValues(sample("Medium"));
    expect(medium).not.toEqual(small);
    expect(medium).not.toEqual(inherited);
    await expect(sample("None")).toHaveCSS("border-radius", "0px");
    await expect(sample("Full")).toHaveCSS("border-radius", "9999px");
    if (name === "Rasance") {
      await expect(sample("Inherited")).toHaveCSS("background-color", "rgb(24, 24, 23)");
      await expect(sample("Inherited")).toHaveCSS("box-shadow", /inset/);
      expect(medium).toEqual(["10.5px 3px", "0px", "10.5px 3px", "0px"]);
    } else if (name === "Réserve") {
      await expect(sample("Inherited")).toHaveCSS("background-color", "rgb(41, 38, 191)");
      await expect(sample("Inherited")).toHaveCSS("box-shadow", "none");
      expect(medium).toEqual(["min(22.5%, 45px) 36%", "min(12.75%, 25.5px) 30%", "min(21.75%, 43.5px) 40.5%", "min(15.75%, 31.5px) 28.5%"]);
    }
  }
  const widths = await demo.getByRole("button", { name: /^Publish/ }).evaluateAll(buttons => buttons.map(button => button.getBoundingClientRect().width));
  expect(widths).toHaveLength(6);
  expect(Math.max(...widths) - Math.min(...widths)).toBeLessThan(1);
});

test("Studio exports the same scaled action shape as a shared Button guide", async ({ page }) => {
  await page.goto("/playground/#/theme?edition=precision&scheme=braise&shape=reserve");
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("link", { name: "Download CSS" }).click(),
  ]);
  const file = await download.path();
  if (!file) throw new Error("Expected the exported CSS file");
  const css = await readFile(file, "utf8");
  await page.getByRole("link", { name: "Open themed gallery" }).click();
  await page.getByRole("link", { name: "Button", exact: true }).click();
  await page.reload();
  const small = page.getByRole("button", { name: "Publish (Small)", exact: true });
  await expect(small).toHaveCSS("background-color", "rgb(240, 170, 112)");
  await expect(small).toHaveCSS("border-top-left-radius", "min(15%, 30px) 24%");
  const corners = await cornerValues(small);

  const consumer = await page.context().newPage();
  await consumer.setContent('<section data-elea-theme="brand"><button class="elea-button elea-button--primary elea-button--md elea-button--radius-sm">Publish</button></section>');
  for (const asset of ["@alien6-studio/elea-tokens/elea.css", "@alien6-studio/elea-ui/styles.css"]) {
    await consumer.addStyleTag({ content: await readFile(new URL(import.meta.resolve(asset)), "utf8") });
  }
  await consumer.addStyleTag({ content: css });
  const exported = consumer.getByRole("button", { name: "Publish" });
  await expect(exported).toHaveCSS("background-color", "rgb(240, 170, 112)");
  expect(await cornerValues(exported)).toEqual(corners);
  await consumer.close();
});
