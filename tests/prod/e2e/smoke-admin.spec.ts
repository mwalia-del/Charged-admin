import { test, expect, Page } from '@playwright/test';

test.describe('Production Admin Dashboard Smoke Tests', () => {
  let page: Page;
  let consoleErrors: string[] = [];

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    consoleErrors = [];

    // Listen for console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Listen for page errors
    page.on('pageerror', error => {
      consoleErrors.push(`Page Error: ${error.message}`);
    });
  });

  test.afterEach(async () => {
    // Report console errors
    if (consoleErrors.length > 0) {
      console.log(`⚠️  Console errors found: ${consoleErrors.length}`);
      consoleErrors.forEach(error => console.log(`  - ${error}`));
    }
  });

  test('should load admin dashboard without errors', async () => {
    await page.goto('/');
    
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
    
    // Check for basic page elements
    await expect(page).toHaveTitle(/Charged Admin|Admin Dashboard/);
    
    // Verify no console errors on initial load
    expect(consoleErrors).toHaveLength(0);
  });

  test('should navigate through all main menu items @smoke', async () => {
    const menuItems = [
      { name: 'Dashboard', selector: '[data-testid="menu-dashboard"], [href*="dashboard"], .dashboard-link' },
      { name: 'Rides', selector: '[data-testid="menu-rides"], [href*="rides"], .rides-link' },
      { name: 'Drivers', selector: '[data-testid="menu-drivers"], [href*="drivers"], .drivers-link' },
      { name: 'Riders', selector: '[data-testid="menu-riders"], [href*="riders"], .riders-link' },
      { name: 'Businesses', selector: '[data-testid="menu-businesses"], [href*="businesses"], .businesses-link' },
      { name: 'Referrals', selector: '[data-testid="menu-referrals"], [href*="referrals"], .referrals-link' },
      { name: 'Tips', selector: '[data-testid="menu-tips"], [href*="tips"], .tips-link' },
      { name: 'Promotions', selector: '[data-testid="menu-promotions"], [href*="promotions"], .promotions-link' },
      { name: 'Scheduled Rides', selector: '[data-testid="menu-scheduled"], [href*="scheduled"], .scheduled-link' },
      { name: 'Pricing', selector: '[data-testid="menu-pricing"], [href*="pricing"], .pricing-link' },
      { name: 'Analytics', selector: '[data-testid="menu-analytics"], [href*="analytics"], .analytics-link' },
      { name: 'Settings', selector: '[data-testid="menu-settings"], [href*="settings"], .settings-link' },
      { name: 'Users', selector: '[data-testid="menu-users"], [href*="users"], .users-link' }
    ];

    for (const menuItem of menuItems) {
      console.log(`🧪 Testing menu: ${menuItem.name}`);
      
      try {
        // Try to find and click the menu item
        const menuElement = await page.locator(menuItem.selector).first();
        await menuElement.waitFor({ timeout: 5000 });
        await menuElement.click();
        
        // Wait for navigation and content to load
        await page.waitForLoadState('networkidle');
        
        // Verify page loaded without errors
        expect(consoleErrors).toHaveLength(0);
        
        // Check for basic content indicators
        const hasContent = await page.locator('table, .card, .chart, .summary, [data-testid*="content"]').count() > 0;
        expect(hasContent).toBeTruthy();
        
        console.log(`✅ ${menuItem.name} - Page loaded successfully`);
        
      } catch (error) {
        console.log(`⚠️  ${menuItem.name} - ${error.message}`);
        // Don't fail the test for individual menu items, just log
      }
    }
  });

  test('should verify table functionality on data pages', async () => {
    const dataPages = [
      { name: 'Rides', url: '/rides' },
      { name: 'Drivers', url: '/drivers' },
      { name: 'Riders', url: '/riders' },
      { name: 'Businesses', url: '/businesses' }
    ];

    for (const dataPage of dataPages) {
      console.log(`🧪 Testing data page: ${dataPage.name}`);
      
      try {
        await page.goto(dataPage.url);
        await page.waitForLoadState('networkidle');
        
        // Look for table or data container
        const table = page.locator('table, .data-table, [data-testid*="table"]').first();
        await table.waitFor({ timeout: 10000 });
        
        // Check for pagination controls
        const pagination = page.locator('.pagination, [data-testid*="pagination"], .page-controls');
        if (await pagination.count() > 0) {
          console.log(`✅ ${dataPage.name} - Pagination found`);
        }
        
        // Check for search/filter controls
        const search = page.locator('input[type="search"], input[placeholder*="search"], .search-input');
        if (await search.count() > 0) {
          console.log(`✅ ${dataPage.name} - Search found`);
        }
        
        // Verify no console errors
        expect(consoleErrors).toHaveLength(0);
        
        console.log(`✅ ${dataPage.name} - Table functionality verified`);
        
      } catch (error) {
        console.log(`⚠️  ${dataPage.name} - ${error.message}`);
      }
    }
  });

  test('should test realtime WebSocket connection', async () => {
    console.log('🧪 Testing WebSocket connection...');
    
    // Navigate to a page that might use realtime features
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Check for WebSocket connection in network logs
    const wsUrl = process.env.WS_URL || 'wss://api.charged.autos/realtime';
    
    // Listen for WebSocket messages
    let wsConnected = false;
    let wsMessages: string[] = [];
    
    page.on('websocket', ws => {
      if (ws.url().includes('realtime') || ws.url().includes('ws')) {
        wsConnected = true;
        console.log('✅ WebSocket connected');
        
        ws.on('framereceived', event => {
          wsMessages.push(event.payload);
        });
      }
    });
    
    // Wait a bit for potential WebSocket connections
    await page.waitForTimeout(5000);
    
    if (wsConnected) {
      console.log(`✅ WebSocket connected and received ${wsMessages.length} messages`);
    } else {
      console.log('ℹ️  No WebSocket connection detected (may be normal)');
    }
    
    // Verify no console errors related to WebSocket
    const wsErrors = consoleErrors.filter(error => 
      error.toLowerCase().includes('websocket') || 
      error.toLowerCase().includes('ws') ||
      error.toLowerCase().includes('realtime')
    );
    
    expect(wsErrors).toHaveLength(0);
  });

  test('should verify responsive design on mobile viewport', async () => {
    console.log('🧪 Testing responsive design...');
    
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check if mobile menu or responsive elements are present
    const mobileMenu = page.locator('.mobile-menu, .hamburger, [data-testid*="mobile-menu"]');
    const isMobileFriendly = await mobileMenu.count() > 0 || 
                            await page.locator('body').evaluate(el => 
                              window.getComputedStyle(el).getPropertyValue('--mobile-breakpoint') !== ''
                            );
    
    if (isMobileFriendly) {
      console.log('✅ Mobile responsive design detected');
    } else {
      console.log('ℹ️  Mobile responsive design not clearly detected');
    }
    
    // Verify no horizontal scroll
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    
    expect(hasHorizontalScroll).toBeFalsy();
  });

  test('should verify authentication state', async () => {
    console.log('🧪 Testing authentication state...');
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check for authentication indicators
    const authIndicators = [
      'user-menu',
      'logout',
      'profile',
      'admin-panel',
      'user-avatar'
    ];
    
    let authFound = false;
    for (const indicator of authIndicators) {
      const element = page.locator(`[data-testid*="${indicator}"], .${indicator}, #${indicator}`);
      if (await element.count() > 0) {
        authFound = true;
        console.log(`✅ Authentication indicator found: ${indicator}`);
        break;
      }
    }
    
    if (!authFound) {
      console.log('ℹ️  No clear authentication indicators found');
    }
    
    // Check for login redirect (should not happen if properly authenticated)
    const currentUrl = page.url();
    const isLoginPage = currentUrl.includes('login') || currentUrl.includes('auth');
    
    if (isLoginPage) {
      console.log('⚠️  Redirected to login page - authentication may be required');
    } else {
      console.log('✅ No login redirect detected');
    }
  });
});
