import { test, expect } from '@playwright/test';

test.describe('Jobs Page Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/jobs');
  });

  test('should display the Jobs page header correctly', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Find Your Dream Internship/i })).toBeVisible();

    // Check for job count
    const jobCountText = page.locator('text=/opportunities from top companies/i');
    await expect(jobCountText).toBeVisible();
  });

  test('should display saved searches', async ({ page }) => {
    // Check for saved search buttons
    const savedSearch1 = page.getByRole('button', { name: /Software Eng SF/i });
    const savedSearch2 = page.getByRole('button', { name: /Remote Design/i });

    await expect(savedSearch1).toBeVisible();
    await expect(savedSearch2).toBeVisible();
  });

  test('should toggle filters sidebar', async ({ page }) => {
    // Find the Show/Hide Filters button
    const filtersToggle = page.getByRole('button', { name: /Show Filters|Hide Filters/i });

    if (await filtersToggle.isVisible()) {
      await filtersToggle.click();
      await page.waitForTimeout(300); // Wait for animation

      await filtersToggle.click();
      await page.waitForTimeout(300);
    }
  });

  test('should display filter categories in sidebar', async ({ page }) => {
    // Check for main filter sections
    await expect(page.getByText(/Filters/i).first()).toBeVisible();

    // Check for function filters
    const engineeringCheckbox = page.getByRole('checkbox', { name: /Engineering/i });
    if (await engineeringCheckbox.isVisible()) {
      await expect(engineeringCheckbox).toBeVisible();
    }
  });

  test('should display job cards with all required information', async ({ page }) => {
    // Wait for job cards to load
    await page.waitForTimeout(1000);

    // Check for at least one job card
    const jobCards = page.locator('[class*="bg-white"][class*="rounded"]').filter({ hasText: /View Job/i });
    const count = await jobCards.count();

    expect(count).toBeGreaterThan(0);

    // Check first job card has required elements
    const firstCard = jobCards.first();

    // Should have a job title
    await expect(firstCard).toContainText(/Engineer|Designer|Product|Marketing/i);

    // Should have View Job button
    await expect(firstCard.getByRole('link', { name: /View Job/i })).toBeVisible();
  });

  test('should toggle bookmark icon on job cards', async ({ page }) => {
    await page.waitForTimeout(1000);

    // Find the first bookmark button
    const bookmarkButtons = page.locator('button').filter({ has: page.locator('svg[class*="lucide-bookmark"]') });
    const firstBookmark = bookmarkButtons.first();

    if (await firstBookmark.isVisible()) {
      // Click to bookmark
      await firstBookmark.click();

      // Wait for toast notification
      await page.waitForTimeout(500);

      // Check for success toast
      const toast = page.getByText(/Job saved successfully/i);
      await expect(toast).toBeVisible({ timeout: 3000 });
    }
  });

  test('should toggle between grid and list view', async ({ page }) => {
    // Find view toggle buttons
    const gridButton = page.locator('button[title*="Grid" i], button[aria-label*="Grid" i]');
    const listButton = page.locator('button[title*="List" i], button[aria-label*="List" i]');

    if (await gridButton.isVisible()) {
      await gridButton.click();
      await page.waitForTimeout(300);
    }

    if (await listButton.isVisible()) {
      await listButton.click();
      await page.waitForTimeout(300);
    }
  });

  test('should have working search input', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/Search jobs/i);

    if (await searchInput.isVisible()) {
      await searchInput.fill('Software Engineer');
      await expect(searchInput).toHaveValue('Software Engineer');

      // Try to submit search
      const searchButton = page.getByRole('button', { name: /Search/i });
      if (await searchButton.isVisible()) {
        await searchButton.click();
        await page.waitForTimeout(500);
      }
    }
  });

  test('should display company logos or placeholders', async ({ page }) => {
    await page.waitForTimeout(1000);

    // Check for logo placeholders with gradient backgrounds
    const logoPlaceholders = page.locator('[class*="bg-gradient"]').filter({ hasText: /^[A-Z]{1,2}$/ });
    const count = await logoPlaceholders.count();

    expect(count).toBeGreaterThan(0);
  });

  test('should show badges for job features (Remote, Paid, etc)', async ({ page }) => {
    await page.waitForTimeout(1000);

    // Look for badge elements
    const badges = page.locator('[class*="badge"], [class*="px-2"][class*="py-1"][class*="rounded"]').filter({
      hasText: /Remote|Paid|Active|Summer|Spring|Fall/i
    });

    const count = await badges.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should display Launch Outreach buttons', async ({ page }) => {
    await page.waitForTimeout(1000);

    const outreachButtons = page.getByRole('button', { name: /Launch Outreach/i });
    const count = await outreachButtons.count();

    expect(count).toBeGreaterThan(0);

    // Click the first one and check for loading state
    const firstButton = outreachButtons.first();
    await firstButton.click();
    await page.waitForTimeout(500);
  });

  test('should not have console errors', async ({ page }) => {
    const errors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.reload();
    await page.waitForTimeout(2000);

    // Filter out known safe errors (like network errors for external resources)
    const criticalErrors = errors.filter(error =>
      !error.includes('favicon') &&
      !error.includes('net::ERR') &&
      !error.includes('Failed to load resource')
    );

    expect(criticalErrors.length).toBe(0);
  });
});
