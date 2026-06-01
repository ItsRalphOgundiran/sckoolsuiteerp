/**
 * E2E tests: Setup Wizard UX hardening
 *
 * Requires the dev server to be running on http://localhost:3001
 * and a seeded DB with at least one school record.
 *
 * Run: npx playwright test tests/e2e/setup-wizard.spec.ts
 */

import { test, expect, type Page } from "@playwright/test";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function loginAsAdmin(page: Page) {
  await page.goto("/login");
  await page.getByPlaceholder(/email/i).fill("admin@example.com");
  await page.getByPlaceholder(/password/i).fill("password123");
  await page.getByRole("button", { name: /sign in|log in/i }).click();
  await page.waitForURL(/\/admin/, { timeout: 15_000 });
}

async function gotoSetupWizard(page: Page) {
  await page.goto("/admin/setup");
  await page.waitForSelector('[data-testid="setup-wizard"]', { timeout: 15_000 });
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test.describe("Setup Wizard", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test("wizard loads and shows step navigation", async ({ page }) => {
    await gotoSetupWizard(page);

    const wizard = page.locator('[data-testid="setup-wizard"]');
    await expect(wizard).toBeVisible();

    // All step nav buttons should be present
    for (const stepId of [
      "school-profile",
      "academic-setup",
      "classes-arms",
      "subjects",
      "grading-assessment",
      "finance-setup",
      "users-roles",
      "review-activate",
    ]) {
      await expect(page.locator(`[data-testid="step-nav-${stepId}"]`)).toBeVisible();
    }
  });

  test("clicking Next on empty School Profile shows validation errors", async ({ page }) => {
    await gotoSetupWizard(page);

    // Navigate to school-profile step (first step)
    await page.locator('[data-testid="step-nav-school-profile"]').click();

    // Clear all fields just in case
    const inputs = page.locator("input[placeholder]");
    const count = await inputs.count();
    for (let i = 0; i < count; i++) {
      await inputs.nth(i).fill("");
    }

    // Click Next without filling required fields
    await page.locator('[data-testid="btn-next"]').click();

    // Validation errors panel should appear
    await expect(page.locator('[data-testid="validation-errors"]')).toBeVisible();
  });

  test("School Profile: filling required fields clears validation and advances", async ({ page }) => {
    await gotoSetupWizard(page);

    await page.locator('[data-testid="step-nav-school-profile"]').click();

    await page.getByPlaceholder(/greenfield academy/i).fill("Test School");
    await page.getByPlaceholder(/school road/i).fill("1 Test Lane");
    await page.getByPlaceholder(/08012/i).fill("08011111111");
    await page.getByPlaceholder(/admin@school/i).fill("admin@test.ng");

    await page.locator('[data-testid="btn-next"]').click();

    // Should NOT show validation errors
    await expect(page.locator('[data-testid="validation-errors"]')).not.toBeVisible();

    // Should now be on academic-setup step
    await expect(page.locator('[data-testid="step-nav-academic-setup"]')).toHaveClass(/bg-slate-900/);
  });

  test("Academic Setup: missing dates block Next", async ({ page }) => {
    await gotoSetupWizard(page);
    await page.locator('[data-testid="step-nav-academic-setup"]').click();

    // Clear date fields
    await page.locator("input[type='date']").first().fill("");

    await page.locator('[data-testid="btn-next"]').click();
    await expect(page.locator('[data-testid="validation-errors"]')).toBeVisible();
  });

  test("Classes & Arms: empty list blocks Next", async ({ page }) => {
    await gotoSetupWizard(page);
    await page.locator('[data-testid="step-nav-classes-arms"]').click();

    // Remove all existing rows if any
    const removeButtons = page.getByRole("button", { name: /remove/i });
    const count = await removeButtons.count();
    for (let i = 0; i < count; i++) {
      await removeButtons.first().click();
    }

    await page.locator('[data-testid="btn-next"]').click();
    await expect(page.locator('[data-testid="validation-errors"]')).toBeVisible();
  });

  test("Classes & Arms: adding a class row allows navigation", async ({ page }) => {
    await gotoSetupWizard(page);
    await page.locator('[data-testid="step-nav-classes-arms"]').click();

    // Remove all and add fresh row
    const removeButtons = page.getByRole("button", { name: /remove/i });
    const existing = await removeButtons.count();
    for (let i = 0; i < existing; i++) {
      await removeButtons.first().click();
    }

    await page.getByRole("button", { name: /add class/i }).click();

    const nameInputs = page.getByPlaceholder(/year 1/i);
    await nameInputs.last().fill("Year 1");

    const armsInputs = page.getByPlaceholder(/a, b, c/i);
    await armsInputs.last().fill("A, B");

    await page.locator('[data-testid="btn-next"]').click();
    await expect(page.locator('[data-testid="validation-errors"]')).not.toBeVisible();
  });

  test("Review screen shows Fix-it links for incomplete steps", async ({ page }) => {
    await gotoSetupWizard(page);
    await page.locator('[data-testid="step-nav-review-activate"]').click();

    // At least one Fix-it button should be present if setup not complete
    const fixButtons = page.getByRole("button", { name: /fix it/i });
    const count = await fixButtons.count();

    // We only assert that if setup is incomplete, the buttons exist
    // (if fully complete they may not exist – that's also valid)
    const activateBtn = page.locator('[data-testid="btn-activate"]');
    const isActivatable = await activateBtn.isVisible().catch(() => false);

    if (!isActivatable) {
      expect(count).toBeGreaterThan(0);
    }
  });

  test("Activate button shows confirmation panel before activating", async ({ page }) => {
    await gotoSetupWizard(page);
    await page.locator('[data-testid="step-nav-review-activate"]').click();

    const activateBtn = page.locator('[data-testid="btn-activate"]');
    const isVisible = await activateBtn.isVisible().catch(() => false);

    if (!isVisible) {
      test.skip(true, "Activation button not visible — setup not yet complete in this seed");
      return;
    }

    await activateBtn.click();

    // Confirmation panel should appear
    await expect(page.getByText(/confirm school activation/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /confirm activation/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /cancel/i })).toBeVisible();
  });

  test("Activation confirmation: cancel dismisses the panel", async ({ page }) => {
    await gotoSetupWizard(page);
    await page.locator('[data-testid="step-nav-review-activate"]').click();

    const activateBtn = page.locator('[data-testid="btn-activate"]');
    const isVisible = await activateBtn.isVisible().catch(() => false);
    if (!isVisible) {
      test.skip(true, "Setup not complete in this seed — skipping activation test");
      return;
    }

    await activateBtn.click();
    await expect(page.getByText(/confirm school activation/i)).toBeVisible();

    await page.getByRole("button", { name: /cancel/i }).click();
    await expect(page.getByText(/confirm school activation/i)).not.toBeVisible();
    await expect(page.locator('[data-testid="btn-activate"]')).toBeVisible();
  });

  test("Admin dashboard banner is visible when setup is incomplete", async ({ page }) => {
    await page.goto("/admin/dashboard");

    const banner = page.locator('[data-testid="setup-incomplete-banner"]');
    const setupCompleted = !(await banner.isVisible().catch(() => false));

    if (setupCompleted) {
      test.skip(true, "Setup already completed in this seed — banner not shown");
      return;
    }

    await expect(banner).toBeVisible();
    await expect(page.locator('[data-testid="banner-continue-setup"]')).toBeVisible();
    await expect(banner.getByText(/invoice|result|locked/i)).toBeVisible();
  });

  test("Save Step button saves without navigating away", async ({ page }) => {
    await gotoSetupWizard(page);
    await page.locator('[data-testid="step-nav-school-profile"]').click();

    // Fill required fields first
    const nameField = page.getByPlaceholder(/greenfield academy/i);
    const currentValue = await nameField.inputValue();
    if (!currentValue) {
      await nameField.fill("Test School");
      await page.getByPlaceholder(/school road/i).fill("1 Test Lane");
      await page.getByPlaceholder(/08012/i).fill("08011111111");
      await page.getByPlaceholder(/admin@school/i).fill("admin@test.ng");
    }

    await page.locator('[data-testid="btn-save"]').click();

    // Should remain on school-profile step
    const profileNavBtn = page.locator('[data-testid="step-nav-school-profile"]');
    await expect(profileNavBtn).toHaveClass(/bg-slate-900/);
  });
});
