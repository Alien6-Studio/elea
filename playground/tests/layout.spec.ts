import { expect, test } from "@playwright/test";
import { auditSite } from "../scripts/audit-layout.js";

test("every page and component guide keeps to the columns of the layout at each width", async ({ page, baseURL }) => {
  test.setTimeout(300_000);
  const { broken, report } = await auditSite(page, baseURL!);
  expect(broken, report).toBe(0);
});
