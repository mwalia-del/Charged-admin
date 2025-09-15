import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('charged_admin_user', JSON.stringify({
        id: 'admin-123',
        email: 'admin@test.com',
        name: 'Test Admin',
        role: 'admin',
        token: 'test-token-123',
      }));
    });
  });

  test('should not have any automatically detectable accessibility issues on Dashboard', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should not have any automatically detectable accessibility issues on Promotions page', async ({ page }) => {
    await page.goto('/promotions');
    await page.waitForLoadState('networkidle');
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should not have any automatically detectable accessibility issues on Drivers page', async ({ page }) => {
    await page.goto('/drivers');
    await page.waitForLoadState('networkidle');
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should not have any automatically detectable accessibility issues on Riders page', async ({ page }) => {
    await page.goto('/riders');
    await page.waitForLoadState('networkidle');
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should not have any automatically detectable accessibility issues on Business page', async ({ page }) => {
    await page.goto('/businesses');
    await page.waitForLoadState('networkidle');
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should not have any automatically detectable accessibility issues on Referrals page', async ({ page }) => {
    await page.goto('/referrals');
    await page.waitForLoadState('networkidle');
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should not have any automatically detectable accessibility issues on Tips page', async ({ page }) => {
    await page.goto('/tips');
    await page.waitForLoadState('networkidle');
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should not have any automatically detectable accessibility issues on Scheduled Rides page', async ({ page }) => {
    await page.goto('/scheduled');
    await page.waitForLoadState('networkidle');
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('should have proper heading structure', async ({ page }) => {
    await page.goto('/promotions');
    await page.waitForLoadState('networkidle');
    
    // Check for h1 heading
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
    await expect(h1).toHaveText('Promotions Management');
    
    // Check for proper heading hierarchy
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    expect(headings.length).toBeGreaterThan(0);
  });

  test('should have proper form labels', async ({ page }) => {
    await page.goto('/promotions');
    await page.waitForLoadState('networkidle');
    
    // Open create promotion dialog
    await page.click('text=Create Promotion');
    
    // Check for form labels
    await expect(page.locator('label[for="title"]')).toBeVisible();
    await expect(page.locator('label[for="audience"]')).toBeVisible();
    await expect(page.locator('label[for="reward_type"]')).toBeVisible();
  });

  test('should have proper button accessibility', async ({ page }) => {
    await page.goto('/promotions');
    await page.waitForLoadState('networkidle');
    
    // Check that buttons have proper roles and are focusable
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i);
      await expect(button).toHaveAttribute('type');
      await expect(button).toBeVisible();
    }
  });

  test('should have proper table accessibility', async ({ page }) => {
    await page.goto('/promotions');
    await page.waitForLoadState('networkidle');
    
    // Check for table headers
    const table = page.locator('table');
    await expect(table).toBeVisible();
    
    const headers = page.locator('th');
    const headerCount = await headers.count();
    expect(headerCount).toBeGreaterThan(0);
    
    // Check for proper table structure
    const rows = page.locator('tr');
    const rowCount = await rows.count();
    expect(rowCount).toBeGreaterThan(1); // Header + data rows
  });

  test('should support keyboard navigation', async ({ page }) => {
    await page.goto('/promotions');
    await page.waitForLoadState('networkidle');
    
    // Test tab navigation
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Should be able to navigate through interactive elements
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  test('should have proper color contrast', async ({ page }) => {
    await page.goto('/promotions');
    await page.waitForLoadState('networkidle');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    
    // Check for color contrast violations
    const colorContrastViolations = accessibilityScanResults.violations.filter(
      violation => violation.id === 'color-contrast'
    );
    
    expect(colorContrastViolations).toHaveLength(0);
  });

  test('should have proper focus management', async ({ page }) => {
    await page.goto('/promotions');
    await page.waitForLoadState('networkidle');
    
    // Open create promotion dialog
    await page.click('text=Create Promotion');
    
    // Check that focus is properly managed
    const dialog = page.locator('[role="dialog"]');
    await expect(dialog).toBeVisible();
    
    // First input should be focused
    const firstInput = page.locator('input').first();
    await expect(firstInput).toBeFocused();
  });
});
