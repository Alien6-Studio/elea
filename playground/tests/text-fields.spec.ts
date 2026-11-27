import { expect, test, type Locator, type Page } from "@playwright/test";

test("a compact classic field inherits its frame, limits plain text and submits formatted HTML", async ({ page, browserName }) => {
  await page.goto("/playground/#/ui/field");
  const form = page.getByRole("form", { name: "Exhibition caption" });
  const editor = form.locator(".elea-content-editor");
  const frame = form.locator(".elea-classic-editor");
  const canvas = frame.locator(".elea-classic-editor__canvas");
  const text = canvas.locator('[contenteditable="true"]').first();
  await form.evaluate(element => {
    element.style.setProperty("--elea-control-radius", "12px 2px 8px 3px");
    element.style.setProperty("--elea-control-border", "#64748b");
    element.style.setProperty("--elea-color-focus", "#136540");
    element.style.setProperty("--elea-color-selection", "#a62457");
  });
  await expect(frame).toHaveCSS("border-radius", "12px 2px 8px 3px");
  await expect(frame).toHaveCSS("border-top-color", "rgb(100, 116, 139)");
  await expect(canvas).toHaveCSS("height", "128px");
  expect((await editor.boundingBox())!.width).toBeCloseTo((await form.boundingBox())!.width, 0);
  await text.focus();
  await expect(frame).toHaveCSS("border-top-color", "rgb(19, 101, 64)");
  await expect(frame).toHaveCSS("box-shadow", /rgb\(19, 101, 64\)/);
  await text.press("End");
  await text.pressSequentially(" At dusk.");
  await form.getByRole("button", { name: "Save caption" }).click();
  const html = form.getByLabel("Saved HTML");
  await expect(html).toContainText("At dusk.");
  await expect(html).toHaveText(/<(em|i)>glacier<\/(em|i)>/);
  await text.focus();
  await text.press("End");
  await pasteInto(page, text, "x".repeat(160), browserName);
  await expect(form.getByText("140 / 140 characters", { exact: true })).toBeVisible();
  await text.pressSequentially("z");
  expect((await text.textContent())?.length).toBe(140);
  await expect(text).not.toContainText("z");
});

test("a caption can exceed its soft limit and recover", async ({ page }) => {
  await page.goto("/playground/#/ui/field");
  const caption = page.getByRole("textbox", { name: "Photo caption" });
  await expect(caption).toHaveAccessibleDescription("11 / 80");
  await caption.fill("a".repeat(81));
  await expect(caption).toHaveAccessibleDescription("81 / 80");
  await expect(caption).toHaveAttribute("aria-invalid", "true");
  await caption.press("Backspace");
  await expect(caption).toHaveAccessibleDescription("80 / 80");
  await expect(caption).not.toHaveAttribute("aria-invalid", "true");
});

test("archive number keeps the caret during grouped native edits and paste", async ({ page, context, browserName }) => {
  await page.goto("/playground/#/ui/field");
  const identifier = page.getByRole("textbox", { name: "Archive number" });
  await identifier.pressSequentially("123456");
  await expect(identifier).toHaveValue("123 456");
  await identifier.evaluate((node: HTMLInputElement) => node.setSelectionRange(4, 4));
  await identifier.press("Backspace");
  await expect(identifier).toHaveValue("124 56");
  expect(await identifier.evaluate((node: HTMLInputElement) => node.selectionStart)).toBe(2);
  await identifier.press("9");
  await expect(identifier).toHaveValue("129 456");
  await identifier.evaluate((node: HTMLInputElement) => node.setSelectionRange(3, 3));
  await identifier.press("Delete");
  await expect(identifier).toHaveValue("129 56");
  if (browserName === "chromium") {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.evaluate(() => navigator.clipboard.writeText("750-123-159"));
    await identifier.selectText();
    await identifier.press("ControlOrMeta+v");
    await expect(identifier).toHaveValue("750 123 159");
  }
});

test("the catalogue finds the field guide by each dedicated component name", async ({ page }) => {
  await page.goto("/playground/#/ui");
  const search = page.getByRole("searchbox", { name: "Search components" });
  for (const component of ["SirenInput", "SiretInput", "IbanInput", "CardNumberInput", "PhoneInput"]) {
    await search.fill(component);
    await expect(page.getByRole("heading", { name: "Field, Input, Textarea", exact: true })).toBeVisible();
  }
});

async function pasteInto(page: Page, field: Locator, text: string, browserName: string) {
  await field.focus();
  if (browserName === "chromium") {
    await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.evaluate(text => navigator.clipboard.writeText(text), text);
    await field.press("ControlOrMeta+v");
  } else {
    await field.evaluate((input, text) => {
      const clipboardData = new DataTransfer();
      clipboardData.setData("text/plain", text);
      input.dispatchEvent(new ClipboardEvent("paste", { clipboardData, bubbles: true, cancelable: true }));
    }, text);
  }
}

function formValue(page: Page, name: string) {
  return page.getByRole("form", { name: "Bank and business identifiers" })
    .evaluate((form: HTMLFormElement, name) => new FormData(form).getAll(name), name);
}

test("IBAN paste normalises FR, DE and GB accounts and submits each as one value", async ({ page, browserName }) => {
  await page.goto("/playground/#/ui/field");
  const group = page.getByRole("group", { name: "IBAN", exact: true });
  const inputs = group.getByRole("textbox");
  for (const sample of [
    "fr76 3000 6000 0112 3456 7890 189",
    "de89 3704 0044 0532 0130 00",
    "gb82 west 1234 5698 7654 32",
  ]) {
    await page.reload();
    await pasteInto(page, inputs.first(), sample, browserName);
    const groups = sample.toUpperCase().split(" ");
    for (const [index, value] of groups.entries()) {
      await expect(inputs.nth(index)).toHaveValue(value);
    }
    await expect.poll(() => formValue(page, "iban")).toEqual([groups.join("")]);
  }
});

test("SIREN and SIRET retain leading zeros and allow a middle group to be replaced", async ({ page, browserName }) => {
  await page.goto("/playground/#/ui/field");
  for (const [name, sample] of [["SIREN", "000 123 456"], ["SIRET", "000 123 456 00009"]] as const) {
    const inputs = page.getByRole("group", { name, exact: true }).getByRole("textbox");
    const groups = sample.split(" ");
    await pasteInto(page, inputs.first(), sample, browserName);
    await inputs.nth(1).fill("00");
    await expect(inputs.nth(2)).toHaveValue("456");
    await inputs.nth(1).press("End");
    await inputs.nth(1).press("7");
    await expect(inputs.nth(2)).toBeFocused();
    groups[1] = "007";
    for (const [index, value] of groups.entries()) {
      await expect(inputs.nth(index)).toHaveValue(value);
    }
    await expect.poll(() => formValue(page, name.toLowerCase())).toEqual([groups.join("")]);
  }
});

test("the card preview and editable groups follow the card number", async ({ page, browserName }) => {
  await page.goto("/playground/#/ui/field");
  const group = page.getByRole("group", { name: "Test card number", exact: true });
  const inputs = group.getByRole("textbox");
  for (const [network, sample] of [["visa", "4242 4242 4242 4242"], ["amex", "3782 822463 10005"]] as const) {
    await page.reload();
    await pasteInto(page, inputs.first(), sample, browserName);
    await expect(group.locator(`[data-network="${network}"][aria-hidden="true"]`)).toBeVisible();
    const groups = sample.split(" ");
    await expect(inputs).toHaveCount(groups.length);
    for (const [index, value] of groups.entries()) await expect(inputs.nth(index)).toHaveValue(value);
    await expect.poll(() => formValue(page, "card")).toEqual([sample.replaceAll(" ", "")]);
  }
});

test("a fifth Visa group only appears when the seventeenth digit is entered", async ({ page }) => {
  await page.goto("/playground/#/ui/field");
  const inputs = page.getByRole("group", { name: "Test card number", exact: true }).getByRole("textbox");
  await inputs.first().focus();
  await page.keyboard.type("4242424242424242");
  await expect(inputs).toHaveCount(4);
  await expect(inputs.nth(3)).toBeFocused();
  await page.keyboard.type("0");
  await expect(inputs).toHaveCount(5);
  await expect(inputs.nth(4)).toBeFocused();
  await expect(inputs.nth(4)).toHaveValue("0");
  await page.keyboard.type("09");
  await expect(inputs.nth(4)).toHaveValue("009");
  await expect.poll(() => formValue(page, "card")).toEqual(["4242424242424242009"]);
});

test("all editing groups fit on a narrow phone", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 750 });
  await page.goto("/playground/#/ui/field");
  for (const name of ["IBAN", "Test card number", "SIREN", "SIRET"]) {
    const group = page.getByRole("group", { name, exact: true });
    await expect(group).toBeVisible();
    for (const input of await group.getByRole("textbox").all()) {
      const bounds = await input.boundingBox();
      expect(bounds!.x).toBeGreaterThanOrEqual(0);
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(320);
    }
  }
});

test("a searchable country field formats national and international telephone numbers", async ({ page }) => {
  await page.goto("/playground/#/ui/field");
  const country = page.getByRole("combobox", { name: "Country or region" });
  const phone = page.getByRole("textbox", { name: "Telephone number" });
  const international = page.getByRole("status", { name: "International number (E.164)" });
  await expect(country).toHaveValue("France (+33)");
  await expect(phone).toHaveValue("01 99 00 01 23");
  await expect(international).toHaveText("+33199000123");

  await country.fill("United Kingdom");
  await country.press("Enter");
  await phone.fill("02079460012");
  await expect(phone).toHaveValue("020 7946 0012");
  await expect(international).toHaveText("+442079460012");

  await country.fill("United States");
  await country.press("Enter");
  await phone.fill("2025550123");
  await expect(phone).toHaveValue("(202) 555-0123");
  await expect(international).toHaveText("+12025550123");

  await phone.fill("+44 20 7946 0012");
  await expect(phone).toHaveValue("+44 20 7946 0012");
  await expect(international).toHaveText("+442079460012");
  await phone.fill("20");
  await expect(international).toHaveText("Enter a complete number");

  await country.fill("+81");
  await expect(page.getByRole("option", { name: "Japan (+81)" })).toBeVisible();
  await country.press("Escape");
  await expect(country).toHaveValue("United States (+1)");
});
