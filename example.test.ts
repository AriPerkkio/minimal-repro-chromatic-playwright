import { expect, takeSnapshot, test } from "@chromatic-com/playwright";

test("example test", async ({ page }, testInfo) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { level: 1, name: "Example page" }),
  ).toBeVisible();

  await takeSnapshot(page, "1st snapshot", testInfo);
  await takeSnapshot(page, "2nd snapshot", testInfo);
  await takeSnapshot(page, "3rd snapshot", testInfo);
  await takeSnapshot(page, "4th snapshot", testInfo);
  await takeSnapshot(page, "5th snapshot", testInfo);
});
