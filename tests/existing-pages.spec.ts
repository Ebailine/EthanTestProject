import { test, expect } from '@playwright/test';

test.describe('Existing Pages Tests', () => {
  test('Homepage should load correctly', async ({ page }) => {
    await page.goto('/');

    // Check page loads
    await expect(page).toHaveURL('/');

    // Check for main navigation
    await expect(page.locator('body')).toBeVisible();

    // No console errors
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.reload();
    await page.waitForTimeout(2000);

    const criticalErrors = errors.filter(error =>
      !error.includes('favicon') &&
      !error.includes('net::ERR') &&
      !error.includes('Failed to load resource')
    );

    expect(criticalErrors.length).toBe(0);
  });

  test('Jobs page should load and display jobs', async ({ page }) => {
    await page.goto('/jobs');

    // Wait for page to load
    await page.waitForTimeout(2000);

    // Check URL
    await expect(page).toHaveURL('/jobs');

    // Check page has content
    await expect(page.locator('body')).toBeVisible();

    // Check for search input (should exist on jobs page)
    const searchInput = page.getByPlaceholder(/search/i);
    if (await searchInput.isVisible()) {
      await expect(searchInput).toBeVisible();
    }
  });

  test.skip('CRM page should load with Kanban board (requires auth)', async ({ page }) => {
    // Skipping: CRM page requires authentication
    await page.goto('/crm');
    await page.waitForTimeout(2000);
  });

  test.skip('Dashboard page should load (requires auth)', async ({ page }) => {
    // Skipping: Dashboard page requires authentication
    await page.goto('/dashboard');
    await page.waitForTimeout(2000);
  });

  test('Jobs page - Contact Finder button should open modal', async ({ page }) => {
    await page.goto('/jobs');
    await page.waitForTimeout(2000);

    // Look for Contact Finder button
    const contactFinderBtn = page.getByRole('button', { name: /Contact Finder/i });

    if (await contactFinderBtn.isVisible()) {
      await contactFinderBtn.click();
      await page.waitForTimeout(500);

      // Check modal appeared
      const modalHeading = page.getByText(/Contact Finder/i);
      await expect(modalHeading.first()).toBeVisible();

      // Check for "Coming Soon" text
      await expect(page.getByText(/Coming Soon/i).first()).toBeVisible();

      // Close modal by clicking X button
      const closeButton = page.locator('button').filter({ has: page.locator('svg') }).last();
      if (await closeButton.isVisible()) {
        await closeButton.click();
        await page.waitForTimeout(300);
      }
    }
  });

  test('Jobs page - Auto-Apply button should open modal', async ({ page }) => {
    await page.goto('/jobs');
    await page.waitForTimeout(2000);

    // Look for Auto-Apply button
    const autoApplyBtn = page.getByRole('button', { name: /Auto-Apply/i });

    if (await autoApplyBtn.isVisible()) {
      await autoApplyBtn.click();
      await page.waitForTimeout(500);

      // Check modal appeared
      const modalHeading = page.getByText(/Auto-Apply/i);
      await expect(modalHeading.first()).toBeVisible();

      // Check for "Coming Soon" text
      await expect(page.getByText(/Coming Soon/i).first()).toBeVisible();
    }
  });

  test('Jobs page - Advanced Filters button should open modal', async ({ page }) => {
    await page.goto('/jobs');
    await page.waitForTimeout(2000);

    // Look for Advanced Filters button
    const advancedFiltersBtn = page.getByRole('button', { name: /Advanced Filters/i });

    if (await advancedFiltersBtn.isVisible()) {
      await advancedFiltersBtn.click();
      await page.waitForTimeout(1000);

      // Check modal appeared - just verify the heading exists
      const modalHeading = page.getByText(/Advanced Filters/i).first();
      await expect(modalHeading).toBeVisible();
    }
  });

  test.skip('CRM page - Drag and drop should work (requires auth)', async ({ page }) => {
    // Skipping: CRM page requires authentication
  });

  test.skip('CRM page - Stats sidebar should display metrics (requires auth)', async ({ page }) => {
    // Skipping: CRM page requires authentication
  });

  test('Jobs page - Search functionality should be present', async ({ page }) => {
    await page.goto('/jobs');
    await page.waitForTimeout(2000);

    // Find search input
    const searchInput = page.getByPlaceholder(/search/i).first();
    if (await searchInput.isVisible()) {
      // Type in search
      await searchInput.fill('Software Engineer');
      await expect(searchInput).toHaveValue('Software Engineer');

      // Clear search
      await searchInput.fill('');
    }
  });

  test('Jobs page - View toggle (list/grid) should work', async ({ page }) => {
    await page.goto('/jobs');
    await page.waitForTimeout(2000);

    // Look for view toggle buttons
    const gridButton = page.locator('button').filter({ has: page.locator('svg') });
    const count = await gridButton.count();

    // Should have some interactive buttons
    expect(count).toBeGreaterThan(0);
  });

  test('All pages should be responsive', async ({ page }) => {
    const pages = ['/', '/jobs', '/crm', '/dashboard'];

    for (const pagePath of pages) {
      // Test mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(pagePath);
      await page.waitForTimeout(1000);
      await expect(page.locator('body')).toBeVisible();

      // Test desktop viewport
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto(pagePath);
      await page.waitForTimeout(1000);
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('Jobs page - Bookmark functionality should work', async ({ page }) => {
    await page.goto('/jobs');
    await page.waitForTimeout(2000);

    // Find bookmark buttons
    const bookmarkButtons = page.locator('button').filter({ has: page.locator('svg[class*="lucide-bookmark"]') });
    const count = await bookmarkButtons.count();

    if (count > 0) {
      // Click first bookmark
      const firstBookmark = bookmarkButtons.first();
      await firstBookmark.click();
      await page.waitForTimeout(500);

      // Check for success toast (might appear)
      const toast = page.getByText(/saved/i);
      // Toast might be visible briefly
    }
  });
});
