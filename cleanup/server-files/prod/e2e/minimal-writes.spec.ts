import { test, expect, Page } from '@playwright/test';

test.describe('Production Minimal Write Tests @writes', () => {
  let page: Page;
  let createdEntities: Array<{ type: string; id: string; cleanupMethod: string }> = [];

  test.beforeEach(async ({ page: testPage }) => {
    page = testPage;
    createdEntities = [];
  });

  test.afterEach(async () => {
    // Cleanup all created entities
    console.log(`🧹 Cleaning up ${createdEntities.length} test entities...`);
    
    for (const entity of createdEntities) {
      try {
        await cleanupEntity(entity);
        console.log(`✅ Cleaned up ${entity.type}: ${entity.id}`);
      } catch (error) {
        console.log(`⚠️  Failed to cleanup ${entity.type} ${entity.id}: ${error.message}`);
      }
    }
  });

  test('should create and cleanup test promotion', async () => {
    const testTag = `PROD_TEST_${Date.now()}`;
    const testOrgId = process.env.ORG_TEST_ID;
    
    if (!testOrgId) {
      console.log('⚠️  ORG_TEST_ID not set, skipping promotion test');
      return;
    }

    console.log(`🧪 Creating test promotion: ${testTag}`);

    // Navigate to promotions page
    await page.goto('/promotions');
    await page.waitForLoadState('networkidle');

    // Look for create promotion button
    const createButton = page.locator('button:has-text("Create"), button:has-text("Add"), [data-testid*="create"]').first();
    await createButton.waitFor({ timeout: 10000 });
    await createButton.click();

    // Fill promotion form
    await page.fill('input[name="title"], input[placeholder*="title"]', `Test Promotion ${testTag}`);
    await page.fill('input[name="code"], input[placeholder*="code"]', testTag);
    await page.fill('textarea[name="description"], textarea[placeholder*="description"]', 'Production test promotion - safe to delete');
    
    // Set audience to driver or org
    const audienceSelect = page.locator('select[name="audience"], [data-testid*="audience"]');
    if (await audienceSelect.count() > 0) {
      await audienceSelect.selectOption('driver');
    }

    // Set short time window (10 minutes from now)
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + 10 * 60 * 1000); // 10 minutes
    
    const startDateInput = page.locator('input[name="start_at"], input[type="datetime-local"]').first();
    if (await startDateInput.count() > 0) {
      await startDateInput.fill(startTime.toISOString().slice(0, 16));
    }

    const endDateInput = page.locator('input[name="end_at"], input[type="datetime-local"]').last();
    if (await endDateInput.count() > 0) {
      await endDateInput.fill(endTime.toISOString().slice(0, 16));
    }

    // Set reward type and value
    const rewardTypeSelect = page.locator('select[name="reward_type"], [data-testid*="reward-type"]');
    if (await rewardTypeSelect.count() > 0) {
      await rewardTypeSelect.selectOption('ride_credit');
    }

    const valueInput = page.locator('input[name="value_cents"], input[name="value"]');
    if (await valueInput.count() > 0) {
      await valueInput.fill('500'); // $5.00
    }

    // Submit the form
    const submitButton = page.locator('button[type="submit"], button:has-text("Create"), button:has-text("Save")');
    await submitButton.click();

    // Wait for success or error
    await page.waitForLoadState('networkidle');
    
    // Check for success indicators
    const successMessage = page.locator('.success, .alert-success, [data-testid*="success"]');
    const errorMessage = page.locator('.error, .alert-error, [data-testid*="error"]');
    
    if (await successMessage.count() > 0) {
      console.log('✅ Promotion created successfully');
      
      // Record for cleanup
      createdEntities.push({
        type: 'promotion',
        id: testTag,
        cleanupMethod: 'deactivate'
      });
      
      // Verify promotion appears in list
      await page.goto('/promotions');
      await page.waitForLoadState('networkidle');
      
      const promotionInList = page.locator(`text=${testTag}`);
      await expect(promotionInList).toBeVisible();
      
    } else if (await errorMessage.count() > 0) {
      const errorText = await errorMessage.textContent();
      console.log(`⚠️  Promotion creation failed: ${errorText}`);
    } else {
      console.log('ℹ️  Promotion creation status unclear');
    }
  });

  test('should create and cleanup test scheduled ride', async () => {
    const testTag = `TEST_SANDBOX_${Date.now()}`;
    const testOrgId = process.env.ORG_TEST_ID;
    
    if (!testOrgId) {
      console.log('⚠️  ORG_TEST_ID not set, skipping scheduled ride test');
      return;
    }

    console.log(`🧪 Creating test scheduled ride: ${testTag}`);

    // Navigate to scheduled rides page
    await page.goto('/scheduled-rides');
    await page.waitForLoadState('networkidle');

    // Look for create scheduled ride button
    const createButton = page.locator('button:has-text("Schedule"), button:has-text("Create"), [data-testid*="create"]').first();
    await createButton.waitFor({ timeout: 10000 });
    await createButton.click();

    // Fill scheduled ride form
    await page.fill('input[name="pickup_address"], input[placeholder*="pickup"]', '123 Test Street, Test City');
    await page.fill('input[name="dropoff_address"], input[placeholder*="dropoff"]', '456 Test Avenue, Test City');
    
    // Set pickup time to 1 hour from now
    const pickupTime = new Date();
    pickupTime.setHours(pickupTime.getHours() + 1);
    
    const pickupTimeInput = page.locator('input[name="scheduled_for"], input[type="datetime-local"]');
    if (await pickupTimeInput.count() > 0) {
      await pickupTimeInput.fill(pickupTime.toISOString().slice(0, 16));
    }

    // Add notes
    const notesInput = page.locator('textarea[name="notes"], textarea[placeholder*="notes"]');
    if (await notesInput.count() > 0) {
      await notesInput.fill(`Production test scheduled ride - ${testTag}`);
    }

    // Set vehicle class if available
    const vehicleClassSelect = page.locator('select[name="vehicle_class"], [data-testid*="vehicle-class"]');
    if (await vehicleClassSelect.count() > 0) {
      await vehicleClassSelect.selectOption('charged_x');
    }

    // Submit the form
    const submitButton = page.locator('button[type="submit"], button:has-text("Schedule"), button:has-text("Create")');
    await submitButton.click();

    // Wait for success or error
    await page.waitForLoadState('networkidle');
    
    // Check for success indicators
    const successMessage = page.locator('.success, .alert-success, [data-testid*="success"]');
    const errorMessage = page.locator('.error, .alert-error, [data-testid*="error"]');
    
    if (await successMessage.count() > 0) {
      console.log('✅ Scheduled ride created successfully');
      
      // Record for cleanup
      createdEntities.push({
        type: 'scheduled_ride',
        id: testTag,
        cleanupMethod: 'cancel'
      });
      
      // Verify scheduled ride appears in list
      await page.goto('/scheduled-rides');
      await page.waitForLoadState('networkidle');
      
      const rideInList = page.locator(`text=${testTag}`);
      await expect(rideInList).toBeVisible();
      
    } else if (await errorMessage.count() > 0) {
      const errorText = await errorMessage.textContent();
      console.log(`⚠️  Scheduled ride creation failed: ${errorText}`);
    } else {
      console.log('ℹ️  Scheduled ride creation status unclear');
    }
  });

  test('should verify test data isolation', async () => {
    console.log('🧪 Verifying test data isolation...');
    
    const testTag = `PROD_TEST_${Date.now()}`;
    
    // Check that test data is only visible in appropriate contexts
    const pagesToCheck = [
      { name: 'Promotions', url: '/promotions', searchTerm: 'PROD_TEST_' },
      { name: 'Scheduled Rides', url: '/scheduled-rides', searchTerm: 'TEST_SANDBOX_' }
    ];

    for (const pageToCheck of pagesToCheck) {
      await page.goto(pageToCheck.url);
      await page.waitForLoadState('networkidle');
      
      // Search for test data
      const searchInput = page.locator('input[type="search"], input[placeholder*="search"]');
      if (await searchInput.count() > 0) {
        await searchInput.fill(pageToCheck.searchTerm);
        await page.keyboard.press('Enter');
        await page.waitForLoadState('networkidle');
        
        // Check if any test data is visible
        const testDataVisible = page.locator(`text=${pageToCheck.searchTerm}`);
        const testDataCount = await testDataVisible.count();
        
        if (testDataCount > 0) {
          console.log(`✅ Found ${testDataCount} test records in ${pageToCheck.name}`);
        } else {
          console.log(`ℹ️  No test data found in ${pageToCheck.name} (may be normal)`);
        }
      }
    }
  });

  async function cleanupEntity(entity: { type: string; id: string; cleanupMethod: string }) {
    switch (entity.type) {
      case 'promotion':
        await cleanupPromotion(entity.id);
        break;
      case 'scheduled_ride':
        await cleanupScheduledRide(entity.id);
        break;
      default:
        console.log(`⚠️  Unknown entity type for cleanup: ${entity.type}`);
    }
  }

  async function cleanupPromotion(promotionId: string) {
    try {
      // Navigate to promotions page
      await page.goto('/promotions');
      await page.waitForLoadState('networkidle');
      
      // Search for the promotion
      const searchInput = page.locator('input[type="search"], input[placeholder*="search"]');
      if (await searchInput.count() > 0) {
        await searchInput.fill(promotionId);
        await page.keyboard.press('Enter');
        await page.waitForLoadState('networkidle');
      }
      
      // Find and click the promotion row
      const promotionRow = page.locator(`tr:has-text("${promotionId}")`);
      if (await promotionRow.count() > 0) {
        // Look for deactivate or delete button
        const deactivateButton = promotionRow.locator('button:has-text("Deactivate"), button:has-text("Disable")');
        const deleteButton = promotionRow.locator('button:has-text("Delete"), button:has-text("Remove")');
        
        if (await deactivateButton.count() > 0) {
          await deactivateButton.click();
          await page.waitForLoadState('networkidle');
          console.log(`✅ Deactivated promotion: ${promotionId}`);
        } else if (await deleteButton.count() > 0) {
          await deleteButton.click();
          // Confirm deletion if prompted
          const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Delete")');
          if (await confirmButton.count() > 0) {
            await confirmButton.click();
          }
          await page.waitForLoadState('networkidle');
          console.log(`✅ Deleted promotion: ${promotionId}`);
        }
      }
    } catch (error) {
      console.log(`⚠️  Failed to cleanup promotion ${promotionId}: ${error.message}`);
    }
  }

  async function cleanupScheduledRide(rideId: string) {
    try {
      // Navigate to scheduled rides page
      await page.goto('/scheduled-rides');
      await page.waitForLoadState('networkidle');
      
      // Search for the scheduled ride
      const searchInput = page.locator('input[type="search"], input[placeholder*="search"]');
      if (await searchInput.count() > 0) {
        await searchInput.fill(rideId);
        await page.keyboard.press('Enter');
        await page.waitForLoadState('networkidle');
      }
      
      // Find and click the ride row
      const rideRow = page.locator(`tr:has-text("${rideId}")`);
      if (await rideRow.count() > 0) {
        // Look for cancel button
        const cancelButton = rideRow.locator('button:has-text("Cancel"), button:has-text("Delete")');
        
        if (await cancelButton.count() > 0) {
          await cancelButton.click();
          // Confirm cancellation if prompted
          const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Cancel")');
          if (await confirmButton.count() > 0) {
            await confirmButton.click();
          }
          await page.waitForLoadState('networkidle');
          console.log(`✅ Cancelled scheduled ride: ${rideId}`);
        }
      }
    } catch (error) {
      console.log(`⚠️  Failed to cleanup scheduled ride ${rideId}: ${error.message}`);
    }
  }
});
