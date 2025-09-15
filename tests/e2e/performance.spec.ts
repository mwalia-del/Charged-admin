import { test, expect } from '@playwright/test';

test.describe('Performance Tests', () => {
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

  test('should load Dashboard within performance budget @perf', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Performance budget: 2.5 seconds
    expect(loadTime).toBeLessThan(2500);
    
    // Check for performance metrics
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
      };
    });
    
    expect(performanceMetrics.domContentLoaded).toBeLessThan(1000);
    expect(performanceMetrics.loadComplete).toBeLessThan(2000);
  });

  test('should load Promotions page within performance budget @perf', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/promotions');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Performance budget: 2.5 seconds
    expect(loadTime).toBeLessThan(2500);
    
    // Check for performance metrics
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime || 0,
        firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
      };
    });
    
    expect(performanceMetrics.domContentLoaded).toBeLessThan(1000);
    expect(performanceMetrics.loadComplete).toBeLessThan(2000);
  });

  test('should load Drivers page within performance budget @perf', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/drivers');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Performance budget: 2.5 seconds
    expect(loadTime).toBeLessThan(2500);
  });

  test('should load Riders page within performance budget @perf', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/riders');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Performance budget: 2.5 seconds
    expect(loadTime).toBeLessThan(2500);
  });

  test('should load Business page within performance budget @perf', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/businesses');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Performance budget: 2.5 seconds
    expect(loadTime).toBeLessThan(2500);
  });

  test('should load Referrals page within performance budget @perf', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/referrals');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Performance budget: 2.5 seconds
    expect(loadTime).toBeLessThan(2500);
  });

  test('should load Tips page within performance budget @perf', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/tips');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Performance budget: 2.5 seconds
    expect(loadTime).toBeLessThan(2500);
  });

  test('should load Scheduled Rides page within performance budget @perf', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/scheduled');
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Performance budget: 2.5 seconds
    expect(loadTime).toBeLessThan(2500);
  });

  test('should have reasonable bundle size', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Get resource sizes
    const resourceSizes = await page.evaluate(() => {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      const jsResources = resources.filter(r => r.name.includes('.js'));
      const cssResources = resources.filter(r => r.name.includes('.css'));
      
      return {
        totalJSSize: jsResources.reduce((sum, r) => sum + (r.transferSize || 0), 0),
        totalCSSSize: cssResources.reduce((sum, r) => sum + (r.transferSize || 0), 0),
        jsCount: jsResources.length,
        cssCount: cssResources.length,
      };
    });
    
    // Bundle size budgets (in bytes)
    expect(resourceSizes.totalJSSize).toBeLessThan(2 * 1024 * 1024); // 2MB
    expect(resourceSizes.totalCSSSize).toBeLessThan(500 * 1024); // 500KB
    
    // Reasonable number of resources
    expect(resourceSizes.jsCount).toBeLessThan(20);
    expect(resourceSizes.cssCount).toBeLessThan(10);
  });

  test('should handle large datasets efficiently', async ({ page }) => {
    await page.goto('/promotions');
    await page.waitForLoadState('networkidle');
    
    // Simulate large dataset by checking table performance
    const tableRenderStart = Date.now();
    
    // Wait for table to render
    await page.waitForSelector('table');
    
    const tableRenderTime = Date.now() - tableRenderStart;
    
    // Table should render quickly even with large datasets
    expect(tableRenderTime).toBeLessThan(1000);
  });

  test('should have efficient navigation between pages', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const pages = ['/promotions', '/drivers', '/riders', '/businesses', '/referrals', '/tips', '/scheduled'];
    
    for (const pageUrl of pages) {
      const startTime = Date.now();
      
      await page.goto(pageUrl);
      await page.waitForLoadState('networkidle');
      
      const navigationTime = Date.now() - startTime;
      
      // Navigation should be fast (under 1 second for subsequent pages)
      expect(navigationTime).toBeLessThan(1000);
    }
  });

  test('should handle form interactions efficiently', async ({ page }) => {
    await page.goto('/promotions');
    await page.waitForLoadState('networkidle');
    
    // Test form opening performance
    const formOpenStart = Date.now();
    
    await page.click('text=Create Promotion');
    await page.waitForSelector('[role="dialog"]');
    
    const formOpenTime = Date.now() - formOpenStart;
    
    // Form should open quickly
    expect(formOpenTime).toBeLessThan(500);
    
    // Test form interaction performance
    const formInteractionStart = Date.now();
    
    await page.fill('input[name="title"]', 'Test Promotion');
    await page.fill('textarea[name="description"]', 'Test description');
    
    const formInteractionTime = Date.now() - formInteractionStart;
    
    // Form interactions should be responsive
    expect(formInteractionTime).toBeLessThan(200);
  });
});
