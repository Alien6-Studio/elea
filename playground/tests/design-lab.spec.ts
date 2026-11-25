import { expect, test } from "@playwright/test";
import { textContrast } from "./contrast.js";

const path = "/elea/playground/#/design-lab";
const modes = ["light", "dark"] as const;

test("old Workspace links lead to the pinned capture for each direction and appearance", async ({ page }) => {
  const archive = "https://github.com/Alien6-Studio/elea/blob/83c13b41161a182ef763b908b67b5813e75294d2/docs/assets/design-lab";
  // The GitHub destinations are checked separately so site CI does not depend on GitHub's web UI.
  await page.route(`${archive}/**`, (route) => route.fulfill({ body: "Archived capture" }));
  const paths = {
    precision: "precision",
    editorial: "editorial-porcelain/reference/editorial-workspace",
    obsidian: "component-studies/obsidian-workspace",
  };
  for (const [direction, capture] of Object.entries(paths)) {
    for (const mode of modes) {
      await page.goto(`${path}/${direction}/${mode}`);
      await expect(page).toHaveURL(`${archive}/${capture}-${mode}.webp`);
    }
  }
});

const componentPath = `${path}/components`;

for (const direction of ["precision", "editorial", "obsidian"]) {
  for (const mode of ["light", "dark"]) {
    test(`Component Studies uses the ${direction} ${mode} treatment with an opposite host`, async ({ page }) => {
      const host = mode === "light" ? "dark" : "light";
      await page.emulateMedia({ colorScheme: host, reducedMotion: "reduce" });
      await page.goto(`${componentPath}/${direction}/${mode}`);
      const study = page.getByRole("region", { name: "Component Studies" });
      const root = page.locator("html");
      await expect(root).toHaveAttribute("data-theme", host);
      await expect(study).toHaveCSS("color-scheme", mode);
      const title = study.getByRole("textbox", { name: "Document title" });
      await title.fill("");
      await expect(title).toHaveAttribute("aria-invalid", "true");
      await expect(study.getByRole("button", { name: "Review changes" })).toBeDisabled();
      await title.fill("Review scope");
      await study.getByRole("textbox", { name: "Review note" }).fill("Verify the scope.");
      await study.getByRole("combobox", { name: "Reviewer" }).click();
      await study.getByRole("option", { name: "Legal" }).click();
      const tab = study.getByRole("tab", { name: "Summary" });
      await tab.focus();
      await page.keyboard.press("ArrowRight");
      await expect(study.getByRole("tabpanel", { name: "Activity" })).toContainText("Legal");
      const attachments = study.getByRole("checkbox", { name: "Include attachments" });
      await attachments.focus();
      await page.keyboard.press("Space");
      await expect(attachments).not.toBeChecked();
      const toggle = study.getByRole("switch", { name: "Notify reviewers" });
      await toggle.focus();
      await page.keyboard.press("Space");
      await expect(toggle).toBeChecked();

      await study.getByRole("button", { name: "Ref" }).click();
      await expect(study.getByRole("columnheader", { name: "Ref" })).toHaveAttribute("aria-sort", "ascending");
      await study.getByRole("button", { name: "Retention policy", exact: true }).click();
      await expect(title).toHaveValue("Retention policy");
      await study.getByRole("button", { name: "Review scope" }).click();
      const open = study.getByRole("button", { name: "Review changes" });
      await open.click();
      const dialog = page.getByRole("dialog", { name: "Confirm review" });
      await expect(dialog).toHaveCSS("color-scheme", mode);
      await expect(dialog.locator("..")).toHaveAttribute("data-elea-theme", `lab-study-${direction}-${mode}`);
      await expect(dialog).toContainText("Excluded");
      await expect(dialog).toContainText("Review scope");
      const confirm = dialog.getByRole("button", { name: "Confirm", exact: true });
      expect(await textContrast(confirm.locator(".elea-button__label"))).toBeGreaterThanOrEqual(4.5);
      await page.keyboard.press("Escape");
      await expect(open).toBeFocused();
      await expect(root).toHaveAttribute("data-theme", host);
    });
  }
}

test("Component Studies compares three geometries under one site identity", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto(path);
  const study = page.getByRole("region", { name: "Component Studies" });
  const title = study.getByRole("textbox", { name: "Document title" });
  await title.fill("Carry this edit");
  await study.getByRole("link", { name: "Use site colors and type" }).click();
  const signatures = [];
  const directions = page.getByRole("navigation", { name: "Art direction" });
  for (const direction of ["Precision", "Editorial", "Obsidian"]) {
    await directions.getByRole("link", { name: direction }).click();
    await expect(study).toHaveAttribute("data-elea-theme", new RegExp(`lab-study-site-${direction.toLowerCase()}-`));
    await expect(title).toHaveValue("Carry this edit");
    await expect.poll(() => page.evaluate(() => document.body.scrollWidth)).toBeLessThanOrEqual(320);
    signatures.push(await study.getByRole("button", { name: "Review changes" }).evaluate(el => {
      const style = getComputedStyle(el);
      return { height: style.minBlockSize, color: style.backgroundColor, font: style.fontFamily };
    }));
  }
  expect(new Set(signatures.map(s => s.height)).size).toBe(3);
  expect(new Set(signatures.map(s => s.color)).size).toBe(1);
  expect(new Set(signatures.map(s => s.font)).size).toBe(1);
  await study.getByRole("button", { name: "Reset draft" }).click();
  await expect(title).toHaveValue("Intake workflow");
  await title.fill("Saved study");
  await study.getByRole("button", { name: "Save draft" }).click();
  await expect(study.getByRole("status")).toHaveText("Draft saved for this tab.");
  await title.fill("Unsaved edit");
  await study.getByRole("button", { name: "Reset draft" }).click();
  await expect(title).toHaveValue("Saved study");
  await page.reload();
  await expect(title).toHaveValue("Saved study");
});

test("a host opts in a single region without changing its identity or neighboring controls", async ({ page }) => {
  await page.goto("/elea/playground/#/ui/button");
  const guide = page.locator(".demo").first();
  await expect(guide.getByRole("button", { name: "Primary", exact: true })).toBeVisible();
  await guide.evaluate(element => {
    const host = document.createElement("div");
    host.className = "client-app";
    element.before(host);
    host.append(element);
    const sibling = element.cloneNode(true) as HTMLElement;
    sibling.classList.add("client-baseline");
    host.append(sibling);
    element.classList.add("client-adoption");
    const button = document.createElement("button");
    button.textContent = "Client action";
    button.className = "client-native";
    element.prepend(button);
  });
  await page.addStyleTag({ content: `
    .client-app {
      --elea-color-primary-600: #365235;
      --elea-color-primary-700: #273c26;
      --elea-font-family-sans: Georgia, serif;
      font: 15px Georgia, serif;
    }
    .client-native {
      appearance: none;
      background: #efe6cb;
      color: #243520;
      font: inherit;
      border: 1px solid #36472a;
      border-radius: 2px;
      padding: 7px 13px;
    }
  ` });
  const adopted = page.locator(".client-adoption");
  const action = adopted.getByRole("button", { name: "Primary", exact: true });
  const baseline = page.locator(".client-baseline").getByRole("button", { name: "Primary", exact: true });
  const native = adopted.getByRole("button", { name: "Client action" });
  const styles = (node: Element) => {
    const style = getComputedStyle(node);
    return [style.backgroundColor, style.fontFamily, style.minHeight, style.paddingInlineStart, style.borderRadius];
  };
  await expect(action).toHaveCSS("background-color", "rgb(54, 82, 53)");
  await expect(baseline).toHaveCSS("background-color", "rgb(54, 82, 53)");
  const before = await action.evaluate(styles);
  const nativeBefore = await native.evaluate(styles);
  expect(await baseline.evaluate(styles)).toEqual(before);
  await page.addStyleTag({ content: `
    .client-adoption {
      --elea-control-height: 46px;
      --elea-control-padding-inline: 19px;
      --elea-control-font-size: 15px;
      --elea-control-radius: 7px;
    }
  ` });
  expect(await action.evaluate(styles)).toEqual([before[0], before[1], "46px", "19px", "7px"]);
  expect(await baseline.evaluate(styles)).toEqual(before);
  expect(await native.evaluate(styles)).toEqual(nativeBefore);
});
