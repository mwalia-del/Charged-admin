import { test, expect } from '@playwright/test';

test.describe('Pricing Management', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to pricing page
    await page.goto('/pricing');
    
    // Wait for the page to load
    await page.waitForSelector('[data-testid="pricing-page"]', { timeout: 10000 });
  });

  test('should display pricing page with both tabs', async ({ page }) => {
    // Check page title
    await expect(page.getByText('Pricing & Vehicle Management')).toBeVisible();
    
    // Check tabs are present
    await expect(page.getByText('Pricing Rules')).toBeVisible();
    await expect(page.getByText('Vehicle Classes')).toBeVisible();
    
    // Check WebSocket status indicator
    await expect(page.getByText('Live Updates')).toBeVisible();
  });

  test('should switch between tabs correctly', async ({ page }) => {
    // Start on pricing rules tab
    await expect(page.getByText('Pricing Rules')).toHaveClass(/Mui-selected/);
    
    // Switch to vehicle classes tab
    await page.getByText('Vehicle Classes').click();
    await expect(page.getByText('Vehicle Classes')).toHaveClass(/Mui-selected/);
    
    // Switch back to pricing rules tab
    await page.getByText('Pricing Rules').click();
    await expect(page.getByText('Pricing Rules')).toHaveClass(/Mui-selected/);
  });

  test('should display pricing rules when available', async ({ page }) => {
    // Check that pricing rules are displayed
    await expect(page.getByText('Pricing Rules (1)')).toBeVisible();
    
    // Check for pricing rule card
    await expect(page.getByText('Electric')).toBeVisible();
    
    // Check for form fields
    await expect(page.getByDisplayValue('2.50')).toBeVisible();
    await expect(page.getByDisplayValue('1.20')).toBeVisible();
    await expect(page.getByDisplayValue('0.15')).toBeVisible();
  });

  test('should allow editing pricing rule fields', async ({ page }) => {
    // Edit base price field
    const basePriceField = page.getByDisplayValue('2.50');
    await basePriceField.clear();
    await basePriceField.fill('3.00');
    
    // Verify the value changed
    await expect(basePriceField).toHaveValue('3.00');
    
    // Edit price per km field
    const pricePerKmField = page.getByDisplayValue('1.20');
    await pricePerKmField.clear();
    await pricePerKmField.fill('1.50');
    
    // Verify the value changed
    await expect(pricePerKmField).toHaveValue('1.50');
  });

  test('should validate pricing rule fields', async ({ page }) => {
    // Enter invalid base price (negative number)
    const basePriceField = page.getByDisplayValue('2.50');
    await basePriceField.clear();
    await basePriceField.fill('-1.00');
    
    // Check that save button is disabled
    const saveButton = page.getByText('Save Changes');
    await expect(saveButton).toBeDisabled();
    
    // Check for validation error message
    await expect(page.getByText('Must be a positive number')).toBeVisible();
  });

  test('should save pricing rule successfully', async ({ page }) => {
    // Edit a field
    const basePriceField = page.getByDisplayValue('2.50');
    await basePriceField.clear();
    await basePriceField.fill('3.00');
    
    // Click save button
    const saveButton = page.getByText('Save Changes');
    await saveButton.click();
    
    // Check for success message
    await expect(page.getByText('Successfully updated Electric pricing rules')).toBeVisible();
  });

  test('should show create rule dialog', async ({ page }) => {
    // Click create rule button
    await page.getByText('Create Rule').click();
    
    // Check dialog is open
    await expect(page.getByText('Create New Pricing Rule')).toBeVisible();
    await expect(page.getByText('Create a new pricing rule for a ride type. All fields are required.')).toBeVisible();
    
    // Close dialog
    await page.getByText('Cancel').click();
    
    // Check dialog is closed
    await expect(page.getByText('Create New Pricing Rule')).not.toBeVisible();
  });

  test('should show delete confirmation dialog', async ({ page }) => {
    // Click delete button
    await page.getByLabel('Delete Rule').click();
    
    // Check dialog is open
    await expect(page.getByText('Delete Pricing Rule')).toBeVisible();
    await expect(page.getByText('Are you sure you want to delete the pricing rule "Electric"?')).toBeVisible();
    
    // Cancel deletion
    await page.getByText('Cancel').click();
    
    // Check dialog is closed
    await expect(page.getByText('Delete Pricing Rule')).not.toBeVisible();
  });

  test('should manage vehicle classes', async ({ page }) => {
    // Switch to vehicle classes tab
    await page.getByText('Vehicle Classes').click();
    
    // Check vehicle class is displayed
    await expect(page.getByText('Charged XL')).toBeVisible();
    await expect(page.getByText('Enabled')).toBeVisible();
    
    // Toggle vehicle class
    const toggleSwitch = page.getByRole('checkbox');
    await toggleSwitch.click();
    
    // Check for success message
    await expect(page.getByText('ChargedXL disabled successfully! Changes are live across all platforms.')).toBeVisible();
  });

  test('should show error handling', async ({ page }) => {
    // Mock network error by going offline
    await page.context().setOffline(true);
    
    // Try to refresh data
    await page.getByText('Retry').click();
    
    // Check for error message
    await expect(page.getByText('Failed to load pricing data')).toBeVisible();
    
    // Go back online
    await page.context().setOffline(false);
  });

  test('should show loading states', async ({ page }) => {
    // Check that loading indicators are present when appropriate
    // This would require mocking slow API responses
    await expect(page.getByRole('progressbar')).not.toBeVisible();
  });

  test('should handle WebSocket disconnection', async ({ page }) => {
    // Check WebSocket status indicator
    await expect(page.getByText('Live Updates')).toBeVisible();
    
    // Simulate WebSocket disconnection
    // This would require mocking WebSocket behavior
    // The status should change to "Offline"
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Check that the page is still functional
    await expect(page.getByText('Pricing & Vehicle Management')).toBeVisible();
    
    // Check that tabs are still accessible
    await expect(page.getByText('Pricing Rules')).toBeVisible();
    await expect(page.getByText('Vehicle Classes')).toBeVisible();
  });

  test('should handle keyboard navigation', async ({ page }) => {
    // Test tab navigation
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Test form field navigation
    const basePriceField = page.getByDisplayValue('2.50');
    await basePriceField.focus();
    await page.keyboard.press('Tab');
    
    // Check that focus moved to next field
    const pricePerKmField = page.getByDisplayValue('1.20');
    await expect(pricePerKmField).toBeFocused();
  });

  test('should handle form submission with Enter key', async ({ page }) => {
    // Focus on a form field
    const basePriceField = page.getByDisplayValue('2.50');
    await basePriceField.focus();
    
    // Press Enter to trigger save
    await page.keyboard.press('Enter');
    
    // Check that save was triggered
    await expect(page.getByText('Successfully updated Electric pricing rules')).toBeVisible();
  });
});
