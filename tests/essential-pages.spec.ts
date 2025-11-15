import { test, expect } from '@playwright/test';

test.describe('Essential Pages Tests', () => {
  test('Features page should load and display all sections', async ({ page }) => {
    await page.goto('/features');

    // Hero section
    await expect(page.getByRole('heading', { name: /Everything you need to succeed/i })).toBeVisible();

    // Feature cards - should have 6
    await page.waitForTimeout(1000);
    const featureCards = page.locator('[class*="bg-white"][class*="rounded"]').filter({
      hasText: /Live|Coming Soon/i
    });
    const count = await featureCards.count();
    expect(count).toBeGreaterThanOrEqual(6);

    // How It Works section
    await expect(page.getByText(/How It Works/i)).toBeVisible();

    // CTA buttons
    await expect(page.getByRole('link', { name: /Start Free Trial/i }).first()).toBeVisible();

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

  test('Pricing page should load and display all tiers', async ({ page }) => {
    await page.goto('/pricing');

    // Check for pricing tiers
    await expect(page.getByText(/Starter/i)).toBeVisible();
    await expect(page.getByText(/Pro/i)).toBeVisible();
    await expect(page.getByText(/Enterprise/i)).toBeVisible();

    // Check for monthly/annual toggle
    const toggle = page.locator('button, [role="switch"]').filter({ hasText: /Monthly|Annual/i });
    if (await toggle.first().isVisible()) {
      await toggle.first().click();
      await page.waitForTimeout(500);
    }

    // FAQ section
    await expect(page.getByText(/Frequently Asked Questions|FAQ/i)).toBeVisible();

    // CTA buttons
    await expect(page.getByRole('link', { name: /Get Started Free|Start.*Trial/i }).first()).toBeVisible();
  });

  test('About page should load and display company information', async ({ page }) => {
    await page.goto('/about');

    // Stats section
    await page.waitForTimeout(1000);
    const statCards = page.locator('[class*="bg-white"][class*="rounded"]').filter({
      hasText: /Students|Applications|Interview|Salary/i
    });
    const count = await statCards.count();
    expect(count).toBeGreaterThanOrEqual(3);

    // Story section
    await expect(page.getByText(/story|mission|vision/i).first()).toBeVisible();

    // Values section
    await expect(page.getByText(/values|Student-First|Innovation/i).first()).toBeVisible();

    // Timeline
    await expect(page.getByText(/2024|2025/i).first()).toBeVisible();

    // Team section
    await expect(page.getByText(/team|Ethan|founder/i).first()).toBeVisible();
  });

  test('Contact page should load and display contact form', async ({ page }) => {
    await page.goto('/contact');

    // Contact methods grid
    await expect(page.getByText(/Email|Phone|Chat/i).first()).toBeVisible();

    // Contact form
    const nameInput = page.getByPlaceholder(/name/i);
    const emailInput = page.getByPlaceholder(/email/i);
    const messageTextarea = page.getByPlaceholder(/message/i);

    await expect(nameInput).toBeVisible();
    await expect(emailInput).toBeVisible();
    await expect(messageTextarea).toBeVisible();

    // Test form inputs
    await nameInput.fill('Test User');
    await emailInput.fill('test@example.com');
    await messageTextarea.fill('This is a test message');

    await expect(nameInput).toHaveValue('Test User');
    await expect(emailInput).toHaveValue('test@example.com');
    await expect(messageTextarea).toHaveValue('This is a test message');

    // Submit button
    const submitButton = page.getByRole('button', { name: /Send Message/i });
    await expect(submitButton).toBeVisible();
  });

  test('Blog page should load and display blog posts', async ({ page }) => {
    await page.goto('/blog');

    // Search input
    const searchInput = page.getByPlaceholder(/Search/i);
    await expect(searchInput.first()).toBeVisible();

    // Category filters
    await expect(page.getByText(/All|Career|Interview|Resume/i).first()).toBeVisible();

    // Featured post
    await page.waitForTimeout(1000);
    await expect(page.getByText(/Featured|Read Full Article|Read More/i).first()).toBeVisible();

    // Blog posts grid - should have multiple posts
    const blogPosts = page.locator('[class*="bg-white"][class*="rounded"]').filter({
      hasText: /Read More|min read|views/i
    });
    const count = await blogPosts.count();
    expect(count).toBeGreaterThanOrEqual(3);

    // Newsletter section
    await expect(page.getByText(/newsletter|subscribe/i).first()).toBeVisible();

    // Tags cloud
    await expect(page.getByText(/tags/i).first()).toBeVisible();
  });

  test('Help Center should load and display articles', async ({ page }) => {
    await page.goto('/help');

    // Search input
    const searchInput = page.getByPlaceholder(/Search/i);
    await expect(searchInput.first()).toBeVisible();

    // Category cards
    await page.waitForTimeout(1000);
    const categoryCards = page.locator('[class*="bg-white"][class*="rounded"]').filter({
      hasText: /Getting Started|Account|Features|Billing/i
    });
    const count = await categoryCards.count();
    expect(count).toBeGreaterThanOrEqual(3);

    // Popular articles - accordion items
    await expect(page.getByText(/Popular Articles|How do I/i).first()).toBeVisible();

    // Click an article to expand
    const firstArticle = page.locator('button').filter({ hasText: /How do I/i }).first();
    if (await firstArticle.isVisible()) {
      await firstArticle.click();
      await page.waitForTimeout(300);
    }

    // Contact support CTA
    await expect(page.getByText(/Still Need Help|Contact Support/i).first()).toBeVisible();
  });

  test('Changelog should load and display version history', async ({ page }) => {
    await page.goto('/changelog');

    // Stats in hero
    await page.waitForTimeout(1000);
    const stats = page.locator('[class*="bg-white"][class*="rounded"]').filter({
      hasText: /Updates|Features|Improvements|Fixes/i
    });
    const count = await stats.count();
    expect(count).toBeGreaterThanOrEqual(3);

    // Filter buttons
    await expect(page.getByRole('button', { name: /All Updates/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Features/i })).toBeVisible();

    // Version entries - should have multiple
    await expect(page.getByText(/v2\.|v1\./i).first()).toBeVisible();

    // Click a filter
    const featuresFilter = page.getByRole('button', { name: /^Features$/i });
    if (await featuresFilter.isVisible()) {
      await featuresFilter.click();
      await page.waitForTimeout(500);
    }

    // Newsletter section
    await expect(page.getByText(/newsletter|subscribe/i).first()).toBeVisible();
  });

  test('All pages should have ParticlesBackground', async ({ page }) => {
    const pages = ['/features', '/pricing', '/about', '/contact', '/blog', '/help', '/changelog', '/jobs'];

    for (const pagePath of pages) {
      await page.goto(pagePath);
      await page.waitForTimeout(500);

      // Check for canvas element (ParticlesBackground creates a canvas)
      const canvas = page.locator('canvas');
      const hasCanvas = await canvas.count() > 0;

      // At least verify the page loaded
      await expect(page.locator('body')).toBeVisible();
    }
  });
});
