import { test, expect } from '@playwright/test';

test.describe('Promotions CRUD E2E Tests', () => {
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

  test('should create a new promotion', async ({ page }) => {
    await page.goto('/promotions');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Click create promotion button
    await page.click('text=Create Promotion');
    
    // Fill out the form
    await page.fill('input[name="title"]', 'Test Promotion');
    await page.fill('textarea[name="description"]', 'Test description');
    
    // Select audience
    await page.click('text=Audience');
    await page.click('text=Riders');
    
    // Select reward type
    await page.click('text=Reward Type');
    await page.click('text=Fixed Discount');
    
    // Fill value
    await page.fill('input[name="value_cents"]', '500');
    
    // Set dates
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    await page.fill('input[name="start_at"]', tomorrow.toISOString().slice(0, 16));
    await page.fill('input[name="end_at"]', nextWeek.toISOString().slice(0, 16));
    
    // Set priority
    await page.fill('input[name="priority"]', '5');
    
    // Fill promo code
    await page.fill('input[name="code"]', 'TEST5');
    
    // Submit form
    await page.click('text=Create');
    
    // Should show success or redirect
    await expect(page.locator('text=Test Promotion')).toBeVisible();
  });

  test('should edit an existing promotion', async ({ page }) => {
    await page.goto('/promotions');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Find and click edit button for first promotion
    const editButton = page.locator('[data-testid="edit-promotion"]').first();
    await editButton.click();
    
    // Update title
    await page.fill('input[name="title"]', 'Updated Promotion Title');
    
    // Submit form
    await page.click('text=Update');
    
    // Should show updated title
    await expect(page.locator('text=Updated Promotion Title')).toBeVisible();
  });

  test('should activate/deactivate promotion', async ({ page }) => {
    await page.goto('/promotions');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Find a promotion and toggle its status
    const activateButton = page.locator('[data-testid="activate-promotion"]').first();
    if (await activateButton.isVisible()) {
      await activateButton.click();
    } else {
      const deactivateButton = page.locator('[data-testid="deactivate-promotion"]').first();
      await deactivateButton.click();
    }
    
    // Status should change
    await expect(page.locator('[data-testid="promotion-status"]').first()).toBeVisible();
  });

  test('should filter promotions', async ({ page }) => {
    await page.goto('/promotions');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Test audience filter
    await page.click('text=Audience');
    await page.click('text=Riders');
    
    // Test status filter
    await page.click('text=Status');
    await page.click('text=Active');
    
    // Test search
    await page.fill('input[placeholder="Title, description, or code"]', 'Welcome');
    
    // Clear filters
    await page.click('text=Clear');
    
    // All promotions should be visible again
    await expect(page.locator('text=New Rider Welcome')).toBeVisible();
  });

  test('should delete promotion with confirmation', async ({ page }) => {
    await page.goto('/promotions');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Find and click delete button
    const deleteButton = page.locator('[data-testid="delete-promotion"]').first();
    await deleteButton.click();
    
    // Confirm deletion
    page.on('dialog', dialog => dialog.accept());
    
    // Promotion should be removed
    await expect(page.locator('text=New Rider Welcome')).not.toBeVisible();
  });

  test('should handle form validation', async ({ page }) => {
    await page.goto('/promotions');
    
    // Click create promotion button
    await page.click('text=Create Promotion');
    
    // Try to submit without required fields
    await page.click('text=Create');
    
    // Should show validation errors
    await expect(page.locator('text=Title is required')).toBeVisible();
  });
});
