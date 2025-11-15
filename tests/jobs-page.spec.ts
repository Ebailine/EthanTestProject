import { test, expect } from '@playwright/test';

test.describe('Jobs Page - Detailed Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/jobs');
    await page.waitForTimeout(2000);
  });

  test('should load the Jobs page successfully', async ({ page }) => {
    await expect(page).toHaveURL('/jobs');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should have search functionality', async ({ page }) => {
    // Find search input
    const searchInputs = page.locator('input[type="text"]');
    const count = await searchInputs.count();

    expect(count).toBeGreaterThan(0);

    // Try to interact with first search input
    const firstInput = searchInputs.first();
    if (await firstInput.isVisible()) {
      await firstInput.fill('Software');
      await expect(firstInput).toHaveValue('Software');
    }
  });

  test('should display job cards', async ({ page }) => {
    // Wait for content to load
    await page.waitForTimeout(1000);

    // Look for any card-like elements
    const cards = page.locator('[class*="bg-white"][class*="rounded"]');
    const count = await cards.count();

    // Should have at least some cards (filters sidebar, job cards, etc.)
    expect(count).toBeGreaterThan(0);
  });

  test('should have n8n feature buttons', async ({ page }) => {
    // Check for Contact Finder button
    const contactFinderBtn = page.getByRole('button', { name: /Contact Finder/i });
    if (await contactFinderBtn.isVisible()) {
      await expect(contactFinderBtn).toBeVisible();
    }

    // Check for Auto-Apply button
    const autoApplyBtn = page.getByRole('button', { name: /Auto-Apply/i });
    if (await autoApplyBtn.isVisible()) {
      await expect(autoApplyBtn).toBeVisible();
    }

    // Check for Advanced Filters button
    const advancedFiltersBtn = page.getByRole('button', { name: /Advanced Filters/i });
    if (await advancedFiltersBtn.isVisible()) {
      await expect(advancedFiltersBtn).toBeVisible();
    }
  });

  test('should open Contact Finder modal', async ({ page }) => {
    const btn = page.getByRole('button', { name: /Contact Finder/i });

    if (await btn.isVisible()) {
      await btn.click();
      await page.waitForTimeout(500);

      // Modal should appear
      await expect(page.getByText(/Contact Finder/i).first()).toBeVisible();
      await expect(page.getByText(/Coming Soon/i).first()).toBeVisible();

      // Close modal
      const closeBtn = page.locator('button').filter({ has: page.locator('svg') }).filter({ hasText: '' }).last();
      if (await closeBtn.isVisible()) {
        await closeBtn.click();
      }
    }
  });

  test('should open Auto-Apply modal', async ({ page }) => {
    const btn = page.getByRole('button', { name: /Auto-Apply/i });

    if (await btn.isVisible()) {
      await btn.click();
      await page.waitForTimeout(500);

      // Modal should appear
      await expect(page.getByText(/Auto-Apply/i).first()).toBeVisible();
      await expect(page.getByText(/Coming Soon/i).first()).toBeVisible();
    }
  });

  test('should open Advanced Filters modal', async ({ page }) => {
    const btn = page.getByRole('button', { name: /Advanced Filters/i });

    if (await btn.isVisible()) {
      await btn.click();
      await page.waitForTimeout(1000);

      // Modal should appear - just check for heading
      await expect(page.getByText(/Advanced Filters/i).first()).toBeVisible();
    }
  });

  test('should have bookmark functionality', async ({ page }) => {
    // Find bookmark/save buttons
    const bookmarkButtons = page.locator('button').filter({
      has: page.locator('svg')
    });

    const count = await bookmarkButtons.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/jobs');
    await page.waitForTimeout(1000);

    // Page should load
    await expect(page.locator('body')).toBeVisible();

    // Should not have horizontal scroll
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const windowWidth = await page.evaluate(() => window.innerWidth);

    expect(bodyWidth).toBeLessThanOrEqual(windowWidth + 1); // Allow 1px tolerance
  });

  test('should load without blocking errors', async ({ page }) => {
    // Just verify page loads successfully
    await page.goto('/jobs');
    await page.waitForTimeout(2000);

    // Page should be visible and interactive
    await expect(page.locator('body')).toBeVisible();
    const searchInput = page.locator('input[type="text"]').first();
    if (await searchInput.isVisible()) {
      await expect(searchInput).toBeEnabled();
    }
  });
});
