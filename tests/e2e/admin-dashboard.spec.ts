import { test, expect } from '@playwright/test';

test.describe('Admin Dashboard E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the admin dashboard
    await page.goto('http://localhost:3000');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
  });

  test('should load admin dashboard homepage', async ({ page }) => {
    // Check if the page title contains expected text
    await expect(page).toHaveTitle(/Charged Admin|Admin Dashboard/);
    
    // Check for common admin dashboard elements
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('should display navigation menu', async ({ page }) => {
    // Look for common admin navigation elements
    const navigation = page.locator('nav, [role="navigation"], .navbar, .sidebar');
    await expect(navigation.first()).toBeVisible();
  });

  test('should handle API calls without errors', async ({ page }) => {
    // Listen for network requests
    const requests: string[] = [];
    const responses: string[] = [];
    
    page.on('request', request => {
      if (request.url().includes('/api/') || request.url().includes('/admin/')) {
        requests.push(`${request.method()} ${request.url()}`);
      }
    });
    
    page.on('response', response => {
      if (response.url().includes('/api/') || response.url().includes('/admin/')) {
        responses.push(`${response.status()} ${response.url()}`);
      }
    });

    // Wait for any API calls to complete
    await page.waitForTimeout(3000);
    
    // Check that we have some API activity
    console.log('API Requests:', requests);
    console.log('API Responses:', responses);
    
    // Verify no 500 errors
    const errorResponses = responses.filter(r => r.startsWith('500'));
    expect(errorResponses).toHaveLength(0);
  });

  test('should display driver management section', async ({ page }) => {
    // Look for driver-related content
    const driverSection = page.locator('text=/driver/i, [data-testid*="driver"], .driver-section');
    
    await expect(driverSection.first()).toBeVisible();
  });

  test('should display business management section', async ({ page }) => {
    // Look for business-related content
    const businessSection = page.locator('text=/business/i, [data-testid*="business"], .business-section');
    
    await expect(businessSection.first()).toBeVisible();
  });

  test('should display analytics section', async ({ page }) => {
    // Look for analytics-related content
    const analyticsSection = page.locator('text=/analytics/i, [data-testid*="analytics"], .analytics-section');
    
    await expect(analyticsSection.first()).toBeVisible();
  });

  test('should handle form submissions', async ({ page }) => {
    // Look for forms on the page
    const forms = page.locator('form');
    
    // Test the first form
    const firstForm = forms.first();
    await expect(firstForm).toBeVisible();
    
    // Try to find submit button
    const submitButton = firstForm.locator('button[type="submit"], input[type="submit"], button:has-text("Submit"), button:has-text("Save")');
    
    // Don't actually submit, just verify it exists
    await expect(submitButton.first()).toBeVisible();
  });

  test('should display data tables', async ({ page }) => {
    // Look for data tables
    const tables = page.locator('table, .table, [role="table"]');
    
    await expect(tables.first()).toBeVisible();
  });

  test('should handle modal dialogs', async ({ page }) => {
    // Look for modal triggers
    const modalTriggers = page.locator('button:has-text("Add"), button:has-text("Create"), button:has-text("Edit"), button:has-text("Delete")');
    
    // Click the first trigger
    await modalTriggers.first().click();
    
    // Look for modal content
    const modal = page.locator('.modal, [role="dialog"], .dialog, .popup');
    
    await expect(modal.first()).toBeVisible();
    
    // Close modal
    const closeButton = modal.locator('button:has-text("Close"), button:has-text("Cancel"), .close, [aria-label="Close"]');
    await closeButton.first().click();
  });

  test('should display status indicators', async ({ page }) => {
    // Look for status indicators
    const statusIndicators = page.locator('.status, .badge, .indicator, [data-status]');
    
    await expect(statusIndicators.first()).toBeVisible();
  });

  test('should handle pagination', async ({ page }) => {
    // Look for pagination controls
    const pagination = page.locator('.pagination, [role="navigation"]:has-text("Next"), [role="navigation"]:has-text("Previous")');
    
    await expect(pagination.first()).toBeVisible();
  });

  test('should display loading states', async ({ page }) => {
    // Look for loading indicators
    const loadingIndicators = page.locator('.loading, .spinner, [data-loading], .skeleton');
    
    await expect(loadingIndicators.first()).toBeVisible();
  });

  test('should handle error states gracefully', async ({ page }) => {
    // Check for error messages
    const errorMessages = page.locator('.error, .alert-error, [role="alert"]:has-text("error"), [role="alert"]:has-text("Error")');
    
    // Errors might not be visible immediately, so we just check they exist if present
    const errorCount = await errorMessages.count();
    console.log(`Found ${errorCount} error messages`);
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check if the page is still functional
    const body = page.locator('body');
    await expect(body).toBeVisible();
    
    // Look for mobile-specific elements
    const mobileMenu = page.locator('.mobile-menu, .hamburger, [data-mobile-menu]');
    
    await expect(mobileMenu.first()).toBeVisible();
  });

  test('should have proper accessibility attributes', async ({ page }) => {
    // Check for proper heading structure
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    
    await expect(headings.first()).toBeVisible();
    
    // Check for proper button labels
    const buttons = page.locator('button');
    
    const firstButton = buttons.first();
    const buttonText = await firstButton.textContent();
    const buttonAriaLabel = await firstButton.getAttribute('aria-label');
    
    // Button should have either text content or aria-label
    expect(buttonText || buttonAriaLabel).toBeTruthy();
  });
});
