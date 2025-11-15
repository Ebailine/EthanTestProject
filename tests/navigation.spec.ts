import { test, expect } from '@playwright/test';

test.describe('Navigation Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display all navigation dropdowns correctly', async ({ page }) => {
    // Test Product dropdown
    const productButton = page.getByRole('button', { name: /Product/i });
    await expect(productButton).toBeVisible();

    await productButton.hover();
    await page.waitForTimeout(200); // Wait for dropdown to appear

    const featuresLink = page.getByRole('link', { name: /Features/i }).first();
    await expect(featuresLink).toBeVisible();

    const pricingLink = page.getByRole('link', { name: /Pricing/i }).first();
    await expect(pricingLink).toBeVisible();
  });

  test('should navigate to Features page from Product dropdown', async ({ page }) => {
    const productButton = page.getByRole('button', { name: /Product/i });
    await productButton.hover();
    await page.waitForTimeout(200);

    const featuresLink = page.getByRole('link', { name: /Features/i }).first();
    await featuresLink.click();

    await expect(page).toHaveURL('/features');
    await expect(page.getByRole('heading', { name: /Everything you need to succeed/i })).toBeVisible();
  });

  test('should navigate to Pricing page from Product dropdown', async ({ page }) => {
    const productButton = page.getByRole('button', { name: /Product/i });
    await productButton.hover();
    await page.waitForTimeout(200);

    const pricingLink = page.getByRole('link', { name: /Pricing/i }).first();
    await pricingLink.click();

    await expect(page).toHaveURL('/pricing');
  });

  test('should show Solutions dropdown with Jobs and CRM links', async ({ page }) => {
    const solutionsButton = page.getByRole('button', { name: /Solutions/i });
    await expect(solutionsButton).toBeVisible();

    await solutionsButton.hover();
    await page.waitForTimeout(200);

    const jobsLink = page.getByRole('link', { name: /Browse Jobs/i }).first();
    await expect(jobsLink).toBeVisible();

    const crmLink = page.getByRole('link', { name: /CRM/i }).first();
    await expect(crmLink).toBeVisible();
  });

  test('should navigate to Jobs page from Solutions dropdown', async ({ page }) => {
    const solutionsButton = page.getByRole('button', { name: /Solutions/i });
    await solutionsButton.hover();
    await page.waitForTimeout(200);

    const jobsLink = page.getByRole('link', { name: /Browse Jobs/i }).first();
    await jobsLink.click();

    await expect(page).toHaveURL('/jobs');
  });

  test('should show Resources dropdown with Blog, Help, and Changelog', async ({ page }) => {
    const resourcesButton = page.getByRole('button', { name: /Resources/i });
    await expect(resourcesButton).toBeVisible();

    await resourcesButton.hover();
    await page.waitForTimeout(200);

    const blogLink = page.getByRole('link', { name: /Blog/i }).first();
    await expect(blogLink).toBeVisible();

    const helpLink = page.getByRole('link', { name: /Help Center/i }).first();
    await expect(helpLink).toBeVisible();

    const changelogLink = page.getByRole('link', { name: /Changelog/i }).first();
    await expect(changelogLink).toBeVisible();
  });

  test('should navigate to Blog page from Resources dropdown', async ({ page }) => {
    const resourcesButton = page.getByRole('button', { name: /Resources/i });
    await resourcesButton.hover();
    await page.waitForTimeout(200);

    const blogLink = page.getByRole('link', { name: /Blog/i }).first();
    await blogLink.click();

    await expect(page).toHaveURL('/blog');
  });

  test('should navigate to Help Center from Resources dropdown', async ({ page }) => {
    const resourcesButton = page.getByRole('button', { name: /Resources/i });
    await resourcesButton.hover();
    await page.waitForTimeout(200);

    const helpLink = page.getByRole('link', { name: /Help Center/i }).first();
    await helpLink.click();

    await expect(page).toHaveURL('/help');
  });

  test('should navigate to Changelog from Resources dropdown', async ({ page }) => {
    const resourcesButton = page.getByRole('button', { name: /Resources/i });
    await resourcesButton.hover();
    await page.waitForTimeout(200);

    const changelogLink = page.getByRole('link', { name: /Changelog/i }).first();
    await changelogLink.click();

    await expect(page).toHaveURL('/changelog');
  });

  test('should have Get Started and Sign In buttons', async ({ page }) => {
    const getStartedButton = page.getByRole('link', { name: /Get Started/i });
    await expect(getStartedButton).toBeVisible();

    const signInButton = page.getByRole('link', { name: /Sign In/i });
    await expect(signInButton).toBeVisible();
  });
});
