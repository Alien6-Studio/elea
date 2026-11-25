import { expect, test } from "@playwright/test";

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
