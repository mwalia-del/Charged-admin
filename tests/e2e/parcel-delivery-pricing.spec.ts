import { test, expect, Page } from '@playwright/test';

// Test configuration
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@charged.autos';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';

// Test data
const testPricingData = {
  base_price: '6.00',
  price_per_km: '1.75',
  price_per_minute: '0.30',
  service_fee: '2.50',
  min_fare: '10.00',
  commission_percentage: '15.00',
  govt_tax_percentage: '13.00',
  description: 'Updated via e2e test'
};

const originalPricingData = {
  base_price: '5.00',
  price_per_km: '1.50',
  price_per_minute: '0.25',
  service_fee: '2.00',
  min_fare: '8.00',
  commission_percentage: '15.00',
  govt_tax_percentage: '13.00'
};

// Helper functions
async function loginAsAdmin(page: Page) {
  await page.goto('/login');
  await page.fill('input[type="email"]', ADMIN_EMAIL);
  await page.fill('input[type="password"]', ADMIN_PASSWORD);
  await page.click('button[type="submit"]');
  await page.waitForURL('/dashboard');
}

async function navigateToParcelDeliveryPricing(page: Page) {
  await page.goto('/pricing');
  await page.click('text=Parcel Delivery');
  await page.waitForSelector('[data-testid="parcel-delivery-pricing-form"]', { timeout: 10000 });
}

async function fillPricingForm(page: Page, data: any) {
  await page.fill('input[name="base_price"]', data.base_price);
  await page.fill('input[name="price_per_km"]', data.price_per_km);
  await page.fill('input[name="price_per_minute"]', data.price_per_minute);
  await page.fill('input[name="service_fee"]', data.service_fee);
  await page.fill('input[name="min_fare"]', data.min_fare);
  await page.fill('input[name="commission_percentage"]', data.commission_percentage);
  await page.fill('input[name="govt_tax_percentage"]', data.govt_tax_percentage);
  if (data.description) {
    await page.fill('textarea[name="description"]', data.description);
  }
}

async function getPricingFormValues(page: Page) {
  return {
    base_price: await page.inputValue('input[name="base_price"]'),
    price_per_km: await page.inputValue('input[name="price_per_km"]'),
    price_per_minute: await page.inputValue('input[name="price_per_minute"]'),
    service_fee: await page.inputValue('input[name="service_fee"]'),
    min_fare: await page.inputValue('input[name="min_fare"]'),
    commission_percentage: await page.inputValue('input[name="commission_percentage"]'),
    govt_tax_percentage: await page.inputValue('input[name="govt_tax_percentage"]'),
    description: await page.inputValue('textarea[name="description"]')
  };
}

// Test suite
test.describe('Parcel Delivery Pricing Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test('should display parcel delivery pricing form', async ({ page }) => {
    await navigateToParcelDeliveryPricing(page);
    
    // Check if the form is visible
    await expect(page.locator('text=Standard Delivery Pricing')).toBeVisible();
    await expect(page.locator('input[name="base_price"]')).toBeVisible();
    await expect(page.locator('input[name="price_per_km"]')).toBeVisible();
    await expect(page.locator('input[name="price_per_minute"]')).toBeVisible();
    await expect(page.locator('input[name="service_fee"]')).toBeVisible();
    await expect(page.locator('input[name="min_fare"]')).toBeVisible();
    await expect(page.locator('input[name="commission_percentage"]')).toBeVisible();
    await expect(page.locator('input[name="govt_tax_percentage"]')).toBeVisible();
    await expect(page.locator('button:has-text("Save Parcel Delivery Pricing")')).toBeVisible();
  });

  test('should load existing pricing data', async ({ page }) => {
    await navigateToParcelDeliveryPricing(page);
    
    // Wait for data to load
    await page.waitForSelector('input[name="base_price"]:not([value=""])', { timeout: 10000 });
    
    // Check if form is populated with existing data
    const formValues = await getPricingFormValues(page);
    expect(formValues.base_price).toBeTruthy();
    expect(formValues.price_per_km).toBeTruthy();
    expect(formValues.price_per_minute).toBeTruthy();
    expect(formValues.service_fee).toBeTruthy();
    expect(formValues.min_fare).toBeTruthy();
    expect(formValues.commission_percentage).toBeTruthy();
    expect(formValues.govt_tax_percentage).toBeTruthy();
  });

  test('should validate form fields', async ({ page }) => {
    await navigateToParcelDeliveryPricing(page);
    
    // Test negative values
    await page.fill('input[name="base_price"]', '-5');
    await page.click('button:has-text("Save Parcel Delivery Pricing")');
    await expect(page.locator('text=Must be a positive number')).toBeVisible();
    
    // Test percentage validation
    await page.fill('input[name="commission_percentage"]', '150');
    await page.click('button:has-text("Save Parcel Delivery Pricing")');
    await expect(page.locator('text=Must be between 0 and 100')).toBeVisible();
    
    // Test empty required fields
    await page.fill('input[name="base_price"]', '');
    await page.click('button:has-text("Save Parcel Delivery Pricing")');
    await expect(page.locator('text=Must be a positive number')).toBeVisible();
  });

  test('should update pricing successfully', async ({ page }) => {
    await navigateToParcelDeliveryPricing(page);
    
    // Wait for initial data to load
    await page.waitForSelector('input[name="base_price"]:not([value=""])', { timeout: 10000 });
    
    // Fill form with test data
    await fillPricingForm(page, testPricingData);
    
    // Save the form
    await page.click('button:has-text("Save Parcel Delivery Pricing")');
    
    // Wait for success message
    await expect(page.locator('text=Parcel delivery pricing updated successfully!')).toBeVisible({ timeout: 10000 });
    
    // Verify the form still shows the updated values
    const formValues = await getPricingFormValues(page);
    expect(formValues.base_price).toBe(testPricingData.base_price);
    expect(formValues.price_per_km).toBe(testPricingData.price_per_km);
    expect(formValues.price_per_minute).toBe(testPricingData.price_per_minute);
    expect(formValues.service_fee).toBe(testPricingData.service_fee);
    expect(formValues.min_fare).toBe(testPricingData.min_fare);
    expect(formValues.commission_percentage).toBe(testPricingData.commission_percentage);
    expect(formValues.govt_tax_percentage).toBe(testPricingData.govt_tax_percentage);
  });

  test('should show loading state during save', async ({ page }) => {
    await navigateToParcelDeliveryPricing(page);
    
    // Wait for initial data to load
    await page.waitForSelector('input[name="base_price"]:not([value=""])', { timeout: 10000 });
    
    // Fill form with test data
    await fillPricingForm(page, testPricingData);
    
    // Click save and check loading state
    await page.click('button:has-text("Save Parcel Delivery Pricing")');
    
    // Check if button shows loading state
    await expect(page.locator('button:has-text("Saving...")')).toBeVisible();
    await expect(page.locator('button:has-text("Saving...")')).toBeDisabled();
  });

  test('should display pricing calculation example', async ({ page }) => {
    await navigateToParcelDeliveryPricing(page);
    
    // Wait for initial data to load
    await page.waitForSelector('input[name="base_price"]:not([value=""])', { timeout: 10000 });
    
    // Check if pricing calculation example is visible
    await expect(page.locator('text=Example Calculation')).toBeVisible();
    await expect(page.locator('text=5.5km delivery, 15 minutes:')).toBeVisible();
    await expect(page.locator('text=Base Fare:')).toBeVisible();
    await expect(page.locator('text=Distance Fare:')).toBeVisible();
    await expect(page.locator('text=Time Fare:')).toBeVisible();
    await expect(page.locator('text=Total Fare:')).toBeVisible();
    await expect(page.locator('text=Driver Earnings:')).toBeVisible();
    await expect(page.locator('text=Platform Fee:')).toBeVisible();
  });

  test('should update pricing calculation when values change', async ({ page }) => {
    await navigateToParcelDeliveryPricing(page);
    
    // Wait for initial data to load
    await page.waitForSelector('input[name="base_price"]:not([value=""])', { timeout: 10000 });
    
    // Get initial calculation values
    const initialBaseFare = await page.locator('text=Base Fare: $').textContent();
    
    // Change base price
    await page.fill('input[name="base_price"]', '10.00');
    
    // Wait a moment for calculation to update
    await page.waitForTimeout(1000);
    
    // Check if calculation updated
    const updatedBaseFare = await page.locator('text=Base Fare: $').textContent();
    expect(updatedBaseFare).not.toBe(initialBaseFare);
    expect(updatedBaseFare).toContain('10.00');
  });

  test('should handle authentication errors gracefully', async ({ page }) => {
    // Clear authentication token
    await page.evaluate(() => {
      localStorage.removeItem('charged_admin_user');
    });
    
    await navigateToParcelDeliveryPricing(page);
    
    // Should show authentication error
    await expect(page.locator('text=Authentication failed. Please log in again.')).toBeVisible();
  });

  test('should handle network errors gracefully', async ({ page }) => {
    await navigateToParcelDeliveryPricing(page);
    
    // Intercept network requests and return error
    await page.route('**/admin/parcel-delivery-pricing*', route => {
      route.abort('failed');
    });
    
    // Try to save form
    await fillPricingForm(page, testPricingData);
    await page.click('button:has-text("Save Parcel Delivery Pricing")');
    
    // Should show network error
    await expect(page.locator('text=Network error. Please check your connection and try again.')).toBeVisible();
  });

  test('should restore original pricing after test', async ({ page }) => {
    await navigateToParcelDeliveryPricing(page);
    
    // Wait for initial data to load
    await page.waitForSelector('input[name="base_price"]:not([value=""])', { timeout: 10000 });
    
    // Restore original pricing
    await fillPricingForm(page, originalPricingData);
    await page.click('button:has-text("Save Parcel Delivery Pricing")');
    
    // Wait for success message
    await expect(page.locator('text=Parcel delivery pricing updated successfully!')).toBeVisible({ timeout: 10000 });
  });
});

// API Integration Tests
test.describe('Parcel Delivery Pricing API Integration', () => {
  test('should authenticate API requests properly', async ({ request }) => {
    // This test requires a valid admin token
    const response = await request.get(`${API_BASE_URL}/admin/parcel-delivery-pricing`, {
      headers: {
        'Authorization': 'Bearer invalid-token'
      }
    });
    
    expect(response.status()).toBe(401);
  });

  test('should validate API request data', async ({ request }) => {
    // This test would require a valid admin token
    const response = await request.put(`${API_BASE_URL}/admin/parcel-delivery-pricing/1`, {
      data: {
        base_price: -5, // Invalid negative value
        price_per_km: 'invalid', // Invalid string
        commission_percentage: 150 // Invalid percentage
      }
    });
    
    expect(response.status()).toBe(400);
  });
});

// WebSocket Integration Tests
test.describe('Parcel Delivery Pricing WebSocket Integration', () => {
  test('should connect to WebSocket for real-time updates', async ({ page }) => {
    await loginAsAdmin(page);
    await navigateToParcelDeliveryPricing(page);
    
    // Check if WebSocket connection indicator is visible
    await expect(page.locator('text=Live Updates')).toBeVisible();
    
    // Check if WebSocket status shows as connected
    await expect(page.locator('[data-testid="websocket-status"]')).toHaveClass(/connected/);
  });

  test('should receive real-time updates', async ({ page, context }) => {
    await loginAsAdmin(page);
    await navigateToParcelDeliveryPricing(page);
    
    // Open a second tab to simulate another admin user
    const secondPage = await context.newPage();
    await loginAsAdmin(secondPage);
    await navigateToParcelDeliveryPricing(secondPage);
    
    // Make changes in the first tab
    await fillPricingForm(page, testPricingData);
    await page.click('button:has-text("Save Parcel Delivery Pricing")');
    await expect(page.locator('text=Parcel delivery pricing updated successfully!')).toBeVisible();
    
    // Check if the second tab receives the update
    await expect(secondPage.locator('text=Parcel delivery pricing updated via real-time sync')).toBeVisible({ timeout: 10000 });
  });
});

// Performance Tests
test.describe('Parcel Delivery Pricing Performance', () => {
  test('should load pricing form within acceptable time', async ({ page }) => {
    const startTime = Date.now();
    
    await loginAsAdmin(page);
    await navigateToParcelDeliveryPricing(page);
    
    // Wait for form to be fully loaded
    await page.waitForSelector('input[name="base_price"]:not([value=""])', { timeout: 10000 });
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(5000); // Should load within 5 seconds
  });

  test('should save pricing changes within acceptable time', async ({ page }) => {
    await loginAsAdmin(page);
    await navigateToParcelDeliveryPricing(page);
    
    // Wait for initial data to load
    await page.waitForSelector('input[name="base_price"]:not([value=""])', { timeout: 10000 });
    
    const startTime = Date.now();
    
    // Fill and save form
    await fillPricingForm(page, testPricingData);
    await page.click('button:has-text("Save Parcel Delivery Pricing")');
    await expect(page.locator('text=Parcel delivery pricing updated successfully!')).toBeVisible();
    
    const saveTime = Date.now() - startTime;
    expect(saveTime).toBeLessThan(10000); // Should save within 10 seconds
  });
});

// Accessibility Tests
test.describe('Parcel Delivery Pricing Accessibility', () => {
  test('should be keyboard navigable', async ({ page }) => {
    await loginAsAdmin(page);
    await navigateToParcelDeliveryPricing(page);
    
    // Tab through form elements
    await page.keyboard.press('Tab');
    await expect(page.locator('input[name="base_price"]:focus')).toBeVisible();
    
    await page.keyboard.press('Tab');
    await expect(page.locator('input[name="price_per_km"]:focus')).toBeVisible();
    
    await page.keyboard.press('Tab');
    await expect(page.locator('input[name="price_per_minute"]:focus')).toBeVisible();
  });

  test('should have proper ARIA labels', async ({ page }) => {
    await loginAsAdmin(page);
    await navigateToParcelDeliveryPricing(page);
    
    // Check for proper labels
    await expect(page.locator('input[name="base_price"]')).toHaveAttribute('aria-label');
    await expect(page.locator('input[name="price_per_km"]')).toHaveAttribute('aria-label');
    await expect(page.locator('button:has-text("Save Parcel Delivery Pricing")')).toHaveAttribute('aria-label');
  });

  test('should show validation errors with proper ARIA attributes', async ({ page }) => {
    await loginAsAdmin(page);
    await navigateToParcelDeliveryPricing(page);
    
    // Trigger validation error
    await page.fill('input[name="base_price"]', '-5');
    await page.click('button:has-text("Save Parcel Delivery Pricing")');
    
    // Check for proper error attributes
    await expect(page.locator('input[name="base_price"]')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator('text=Must be a positive number')).toBeVisible();
  });
});
