import { test, expect } from '@playwright/test';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://api.charged.autos';

test.describe('API Contract Tests', () => {
  const authHeaders = {
    'Authorization': 'Bearer test-token-123',
    'Content-Type': 'application/json',
  };

  test('should validate promotions endpoints', async ({ request }) => {
    // Test GET /admin/promotions
    const promotionsResponse = await request.get(`${API_BASE_URL}/admin/promotions`, {
      headers: authHeaders,
    });
    
    expect(promotionsResponse.status()).toBe(200);
    const promotionsData = await promotionsResponse.json();
    
    // Validate response structure
    expect(promotionsData).toHaveProperty('promotions');
    expect(promotionsData).toHaveProperty('pagination');
    expect(Array.isArray(promotionsData.promotions)).toBe(true);
    
    // Validate pagination structure
    expect(promotionsData.pagination).toHaveProperty('page');
    expect(promotionsData.pagination).toHaveProperty('page_size');
    expect(promotionsData.pagination).toHaveProperty('total');
    expect(promotionsData.pagination).toHaveProperty('total_pages');
    
    // Validate promotion structure if any exist
    if (promotionsData.promotions.length > 0) {
      const promotion = promotionsData.promotions[0];
      expect(promotion).toHaveProperty('id');
      expect(promotion).toHaveProperty('title');
      expect(promotion).toHaveProperty('audience');
      expect(promotion).toHaveProperty('reward_type');
      expect(promotion).toHaveProperty('is_active');
      expect(promotion).toHaveProperty('created_at');
    }
  });

  test('should validate drivers endpoints', async ({ request }) => {
    const driversResponse = await request.get(`${API_BASE_URL}/admin/drivers`, {
      headers: authHeaders,
    });
    
    expect(driversResponse.status()).toBe(200);
    const driversData = await driversResponse.json();
    
    expect(driversData).toHaveProperty('drivers');
    expect(driversData).toHaveProperty('pagination');
    expect(Array.isArray(driversData.drivers)).toBe(true);
  });

  test('should validate riders endpoints', async ({ request }) => {
    const ridersResponse = await request.get(`${API_BASE_URL}/admin/riders`, {
      headers: authHeaders,
    });
    
    expect(ridersResponse.status()).toBe(200);
    const ridersData = await ridersResponse.json();
    
    expect(ridersData).toHaveProperty('riders');
    expect(ridersData).toHaveProperty('pagination');
    expect(Array.isArray(ridersData.riders)).toBe(true);
  });

  test('should validate rides endpoints', async ({ request }) => {
    const ridesResponse = await request.get(`${API_BASE_URL}/admin/rides`, {
      headers: authHeaders,
    });
    
    expect(ridesResponse.status()).toBe(200);
    const ridesData = await ridesResponse.json();
    
    expect(ridesData).toHaveProperty('rides');
    expect(ridesData).toHaveProperty('pagination');
    expect(Array.isArray(ridesData.rides)).toBe(true);
  });

  test('should validate tips endpoints', async ({ request }) => {
    const tipsResponse = await request.get(`${API_BASE_URL}/admin/tips`, {
      headers: authHeaders,
    });
    
    expect(tipsResponse.status()).toBe(200);
    const tipsData = await tipsResponse.json();
    
    expect(tipsData).toHaveProperty('tips');
    expect(tipsData).toHaveProperty('pagination');
    expect(Array.isArray(tipsData.tips)).toBe(true);
  });

  test('should validate business endpoints', async ({ request }) => {
    const businessResponse = await request.get(`${API_BASE_URL}/admin/businesses`, {
      headers: authHeaders,
    });
    
    expect(businessResponse.status()).toBe(200);
    const businessData = await businessResponse.json();
    
    expect(businessData).toHaveProperty('businesses');
    expect(businessData).toHaveProperty('pagination');
    expect(Array.isArray(businessData.businesses)).toBe(true);
  });

  test('should validate referrals endpoints', async ({ request }) => {
    const referralsResponse = await request.get(`${API_BASE_URL}/admin/referrals/issuances`, {
      headers: authHeaders,
    });
    
    expect(referralsResponse.status()).toBe(200);
    const referralsData = await referralsResponse.json();
    
    expect(referralsData).toHaveProperty('issuances');
    expect(referralsData).toHaveProperty('pagination');
    expect(Array.isArray(referralsData.issuances)).toBe(true);
  });

  test('should validate scheduled rides endpoints', async ({ request }) => {
    const scheduledResponse = await request.get(`${API_BASE_URL}/admin/scheduled-rides`, {
      headers: authHeaders,
    });
    
    expect(scheduledResponse.status()).toBe(200);
    const scheduledData = await scheduledResponse.json();
    
    expect(scheduledData).toHaveProperty('scheduled_rides');
    expect(scheduledData).toHaveProperty('pagination');
    expect(Array.isArray(scheduledData.scheduled_rides)).toBe(true);
  });

  test('should handle authentication errors', async ({ request }) => {
    // Test without auth header
    const unauthorizedResponse = await request.get(`${API_BASE_URL}/admin/promotions`);
    expect(unauthorizedResponse.status()).toBe(401);
  });

  test('should handle invalid endpoints', async ({ request }) => {
    const notFoundResponse = await request.get(`${API_BASE_URL}/admin/invalid-endpoint`, {
      headers: authHeaders,
    });
    expect(notFoundResponse.status()).toBe(404);
  });

  test('should validate POST endpoints', async ({ request }) => {
    const newPromotion = {
      title: 'Test Promotion',
      description: 'Test description',
      audience: 'rider',
      reward_type: 'fixed_discount',
      value_cents: 500,
      start_at: new Date().toISOString(),
      end_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      priority: 5,
      is_active: false,
      code: 'TEST5',
    };

    const createResponse = await request.post(`${API_BASE_URL}/admin/promotions`, {
      headers: authHeaders,
      data: newPromotion,
    });
    
    expect(createResponse.status()).toBe(201);
    const createdData = await createResponse.json();
    expect(createdData).toHaveProperty('id');
    expect(createdData.title).toBe('Test Promotion');
  });

  test('should validate PATCH endpoints', async ({ request }) => {
    const updateData = {
      title: 'Updated Promotion',
    };

    const updateResponse = await request.patch(`${API_BASE_URL}/admin/promotions/test-id`, {
      headers: authHeaders,
      data: updateData,
    });
    
    expect(updateResponse.status()).toBe(200);
    const updatedData = await updateResponse.json();
    expect(updatedData.title).toBe('Updated Promotion');
  });

  test('should validate DELETE endpoints', async ({ request }) => {
    const deleteResponse = await request.delete(`${API_BASE_URL}/admin/promotions/test-id`, {
      headers: authHeaders,
    });
    
    expect(deleteResponse.status()).toBe(204);
  });
});
