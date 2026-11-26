import { expect, test } from "@playwright/test";
import { colorThemes } from "@alien6-studio/elea-tokens/palette";

test("the navbar applies each complete theme, including the static notebook and the button guide", async ({ page }) => {
  await page.goto("/elea/");
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
  await page.goto("/elea/typography/");
  await picker.click();
  await page.getByRole("option", { name: "Braise", exact: true }).click();
  await page.goto("/elea/playground/#/theme?scheme=reserve&radius=12px");
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

test("switching between Rasance and Réserve repaints the button face and keeps radius overrides distinct", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/elea/playground/#/ui/button");
  const picker = page.getByRole("combobox", { name: "Site theme", exact: true });
  const radius = page.locator("section.demo").filter({ has: page.getByRole("heading", { name: "Radius", exact: true }) });
  const inherited = radius.getByRole("button", { name: "Inherited shape", exact: true });
  for (const name of ["Rasance", "Réserve", "Rasance"]) {
    await picker.click();
    await page.getByRole("option", { name, exact: true }).click();
    await expect(picker).toHaveText(name);
    if (name === "Rasance") {
      await expect(inherited).toHaveCSS("background-color", "rgb(24, 24, 23)");
      await expect(inherited).toHaveCSS("box-shadow", /inset/);
      await expect(inherited).toHaveCSS("border-top-left-radius", "14px 4px");
      await expect(inherited).toHaveCSS("border-top-right-radius", "0px");
      continue;
    }
    await expect(inherited).toHaveCSS("background-color", "rgb(41, 38, 191)");
    await expect(inherited).toHaveCSS("box-shadow", "none");
    await expect(inherited).toHaveCSS("border-top-left-radius", /48%$/);
    await expect(inherited).toHaveCSS("border-top-right-radius", /40%$/);
    const explicit = await Promise.all(["None", "Small", "Medium", "Large", "Full"].map(name =>
      radius.getByRole("button", { name, exact: true }).evaluate(button => parseFloat(getComputedStyle(button).borderTopLeftRadius))));
    expect(explicit[0]).toBe(0);
    expect(new Set(explicit).size).toBe(5);
    expect(explicit).toEqual([...explicit].sort((left, right) => left - right));
  }
});
