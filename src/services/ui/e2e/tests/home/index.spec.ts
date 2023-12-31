import { test, expect } from "@playwright/test";
import * as $ from "@/selectors";

test("has title", async ({ page }) => {
  await page.goto("/");

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/CMS OM Template/);
});

test("get issues link", async ({ page }) => {
  const navSelectors = new $.NavSelectors(page);
  await page.goto("/");

  // Click the issues link.
  await navSelectors.issuesDropDown.click();
  await navSelectors.allIssuesLink.click();

  // Expects the URL to contain intro.
  await expect(page).toHaveURL(/.*issues/);
});
