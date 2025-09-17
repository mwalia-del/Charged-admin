import { test, expect } from '@playwright/test';

test.describe('Referral Model E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto('http://localhost:3000');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Skip authentication for now - we'll test the mock data directly
    // The application should work with mock data in development mode
  });

  test('Driver Referral Model - Complete Flow', async ({ page }) => {
    // Test 1: Verify Driver page shows referral codes
    await page.click('text=Drivers');
    await page.waitForLoadState('networkidle');
    
    // Wait for the page to load and check for referral codes
    await page.waitForSelector('[data-testid="driver-referral-code"]', { timeout: 10000 });
    
    // Check that drivers have referral codes displayed
    const driverReferralCodes = await page.locator('[data-testid="driver-referral-code"]').all();
    expect(driverReferralCodes.length).toBeGreaterThan(0);
    
    // Verify referral code format (DRV + 8 alphanumeric characters)
    const firstDriverCode = await driverReferralCodes[0].textContent();
    expect(firstDriverCode).toMatch(/^DRV[A-Z0-9]{8}$/);
    
    console.log('✅ Driver referral codes found:', driverReferralCodes.length);
    console.log('✅ First driver code:', firstDriverCode);
  });

  test('Rider Referral Model - Complete Flow', async ({ page }) => {
    // Test 1: Verify Rider page shows referral codes
    await page.click('text=Riders');
    await page.waitForLoadState('networkidle');
    
    // Wait for the page to load and check for referral codes
    await page.waitForSelector('[data-testid="rider-referral-code"]', { timeout: 10000 });
    
    // Check that riders have referral codes displayed
    const riderReferralCodes = await page.locator('[data-testid="rider-referral-code"]').all();
    expect(riderReferralCodes.length).toBeGreaterThan(0);
    
    // Verify referral code format (RID + 8 alphanumeric characters)
    const firstRiderCode = await riderReferralCodes[0].textContent();
    expect(firstRiderCode).toMatch(/^RID[A-Z0-9]{8}$/);
    
    console.log('✅ Rider referral codes found:', riderReferralCodes.length);
    console.log('✅ First rider code:', firstRiderCode);
  });

  test('Referral Model Business Rules Validation', async ({ page }) => {
    // Test 1: Verify referral code uniqueness
    await page.click('text=Drivers');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('[data-testid="driver-referral-code"]', { timeout: 10000 });
    
    const driverCodes = await page.locator('[data-testid="driver-referral-code"]').allTextContents();
    const uniqueDriverCodes = new Set(driverCodes);
    expect(uniqueDriverCodes.size).toBe(driverCodes.length);
    
    console.log('✅ Driver codes uniqueness verified:', uniqueDriverCodes.size, 'unique out of', driverCodes.length);
  });

  test('Referral Model Integration - Basic Navigation', async ({ page }) => {
    // Test basic navigation between pages
    await page.click('text=Drivers');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('[data-testid="driver-referral-code"]', { timeout: 10000 });
    
    await page.click('text=Riders');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('[data-testid="rider-referral-code"]', { timeout: 10000 });
    
    console.log('✅ Basic navigation between Drivers and Riders pages successful');
  });
});
