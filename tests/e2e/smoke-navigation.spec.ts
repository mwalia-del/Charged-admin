import { test, expect } from '@playwright/test';

test.describe('Smoke Navigation Tests', () => {
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

  test('should navigate to all main pages', async ({ page }) => {
    await page.goto('/');
    
    // Test Dashboard
    await page.click('text=Dashboard');
    await expect(page).toHaveURL('/');
    await expect(page.locator('h1')).toContainText('Dashboard');
    
    // Test Rides
    await page.click('text=Rides');
    await expect(page).toHaveURL('/rides');
    await expect(page.locator('h1')).toContainText('Rides');
    
    // Test Drivers
    await page.click('text=Drivers');
    await expect(page).toHaveURL('/drivers');
    await expect(page.locator('h1')).toContainText('Drivers');
    
    // Test Riders
    await page.click('text=Riders');
    await expect(page).toHaveURL('/riders');
    await expect(page.locator('h1')).toContainText('Riders');
    
    // Test Business
    await page.click('text=Business');
    await expect(page).toHaveURL('/businesses');
    await expect(page.locator('h1')).toContainText('Business');
    
    // Test Referrals
    await page.click('text=Referrals');
    await expect(page).toHaveURL('/referrals');
    await expect(page.locator('h1')).toContainText('Referrals');
    
    // Test Tips
    await page.click('text=Tips');
    await expect(page).toHaveURL('/tips');
    await expect(page.locator('h1')).toContainText('Tips');
    
    // Test Promotions
    await page.click('text=Promotions');
    await expect(page).toHaveURL('/promotions');
    await expect(page.locator('h1')).toContainText('Promotions Management');
    
    // Test Scheduled Rides
    await page.click('text=Scheduled Rides');
    await expect(page).toHaveURL('/scheduled');
    await expect(page.locator('h1')).toContainText('Scheduled Rides');
  });

  test('should load page content without errors', async ({ page }) => {
    const pages = [
      { name: 'Dashboard', url: '/', title: 'Dashboard' },
      { name: 'Rides', url: '/rides', title: 'Rides' },
      { name: 'Drivers', url: '/drivers', title: 'Drivers' },
      { name: 'Riders', url: '/riders', title: 'Riders' },
      { name: 'Business', url: '/businesses', title: 'Business' },
      { name: 'Referrals', url: '/referrals', title: 'Referrals' },
      { name: 'Tips', url: '/tips', title: 'Tips' },
      { name: 'Promotions', url: '/promotions', title: 'Promotions Management' },
      { name: 'Scheduled Rides', url: '/scheduled', title: 'Scheduled Rides' },
    ];

    for (const pageInfo of pages) {
      await page.goto(pageInfo.url);
      
      // Check for console errors
      const errors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });
      
      // Wait for page to load
      await page.waitForLoadState('networkidle');
      
      // Check title
      await expect(page.locator('h1')).toContainText(pageInfo.title);
      
      // Check for no critical errors
      expect(errors.filter(error => 
        !error.includes('Warning') && 
        !error.includes('Deprecation')
      )).toHaveLength(0);
    }
  });

  test('should have responsive navigation', async ({ page }) => {
    await page.goto('/');
    
    // Test desktop navigation
    await expect(page.locator('[data-testid="navigation-drawer"]')).toBeVisible();
    
    // Test mobile navigation (simulate mobile viewport)
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Mobile menu should be accessible
    const mobileMenuButton = page.locator('[data-testid="mobile-menu-button"]');
    await mobileMenuButton.click();
    await expect(page.locator('[data-testid="mobile-navigation"]')).toBeVisible();
  });
});
