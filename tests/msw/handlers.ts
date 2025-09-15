import { rest } from 'msw';
import userFixtures from '../fixtures/user.json';
import rideFixtures from '../fixtures/ride.json';
import promotionFixtures from '../fixtures/promotion.json';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://api.charged.autos';

export const handlers = [
  // Auth endpoints
  rest.post(`${API_BASE_URL}/auth/login`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        user: userFixtures.admin,
        token: 'test-token-123',
      })
    );
  }),

  rest.post(`${API_BASE_URL}/auth/logout`, (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ message: 'Logged out successfully' }));
  }),

  // Drivers endpoints
  rest.get(`${API_BASE_URL}/admin/drivers`, (req, res, ctx) => {
    const drivers = [
      { ...userFixtures.driver, id: 'driver-1' },
      { ...userFixtures.driver, id: 'driver-2', name: 'Driver Two' },
    ];
    return res(
      ctx.status(200),
      ctx.json({
        drivers,
        pagination: {
          page: 1,
          page_size: 20,
          total: 2,
          total_pages: 1,
        },
      })
    );
  }),

  rest.get(`${API_BASE_URL}/admin/drivers/:id`, (req, res, ctx) => {
    const { id } = req.params;
    return res(
      ctx.status(200),
      ctx.json({ ...userFixtures.driver, id })
    );
  }),

  // Riders endpoints
  rest.get(`${API_BASE_URL}/admin/riders`, (req, res, ctx) => {
    const riders = [
      { ...userFixtures.rider, id: 'rider-1' },
      { ...userFixtures.rider, id: 'rider-2', name: 'Rider Two' },
    ];
    return res(
      ctx.status(200),
      ctx.json({
        riders,
        pagination: {
          page: 1,
          page_size: 20,
          total: 2,
          total_pages: 1,
        },
      })
    );
  }),

  // Rides endpoints
  rest.get(`${API_BASE_URL}/admin/rides`, (req, res, ctx) => {
    const rides = [
      rideFixtures.completed,
      rideFixtures.in_progress,
      rideFixtures.cancelled,
    ];
    return res(
      ctx.status(200),
      ctx.json({
        rides,
        pagination: {
          page: 1,
          page_size: 20,
          total: 3,
          total_pages: 1,
        },
      })
    );
  }),

  // Promotions endpoints
  rest.get(`${API_BASE_URL}/admin/promotions`, (req, res, ctx) => {
    const promotions = [
      promotionFixtures.active,
      promotionFixtures.scheduled,
      promotionFixtures.ended,
    ];
    return res(
      ctx.status(200),
      ctx.json({
        promotions,
        pagination: {
          page: 1,
          page_size: 20,
          total: 3,
          total_pages: 1,
        },
      })
    );
  }),

  rest.post(`${API_BASE_URL}/admin/promotions`, (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json({
        ...promotionFixtures.active,
        id: 'promo-new-123',
        title: 'New Promotion',
      })
    );
  }),

  rest.patch(`${API_BASE_URL}/admin/promotions/:id`, (req, res, ctx) => {
    const { id } = req.params;
    return res(
      ctx.status(200),
      ctx.json({
        ...promotionFixtures.active,
        id,
        title: 'Updated Promotion',
      })
    );
  }),

  rest.post(`${API_BASE_URL}/admin/promotions/:id/activate`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        ...promotionFixtures.active,
        is_active: true,
      })
    );
  }),

  rest.post(`${API_BASE_URL}/admin/promotions/:id/deactivate`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        ...promotionFixtures.active,
        is_active: false,
      })
    );
  }),

  rest.delete(`${API_BASE_URL}/admin/promotions/:id`, (req, res, ctx) => {
    return res(ctx.status(204));
  }),

  // Tips endpoints
  rest.get(`${API_BASE_URL}/admin/tips`, (req, res, ctx) => {
    const tips = [
      {
        id: 'tip-123',
        ride_id: 'ride-123',
        rider_id: 'rider-123',
        driver_id: 'driver-123',
        amount_cents: 500,
        currency: 'CAD',
        status: 'settled',
        created_at: '2024-01-01T10:15:00Z',
      },
    ];
    return res(
      ctx.status(200),
      ctx.json({
        tips,
        pagination: {
          page: 1,
          page_size: 20,
          total: 1,
          total_pages: 1,
        },
      })
    );
  }),

  // Business endpoints
  rest.get(`${API_BASE_URL}/admin/businesses`, (req, res, ctx) => {
    const businesses = [
      {
        id: 'business-123',
        name: 'Test Business',
        email: 'business@test.com',
        org_id: 'org-123',
        status: 'active',
        created_at: '2024-01-01T00:00:00Z',
      },
    ];
    return res(
      ctx.status(200),
      ctx.json({
        businesses,
        pagination: {
          page: 1,
          page_size: 20,
          total: 1,
          total_pages: 1,
        },
      })
    );
  }),

  // Referrals endpoints
  rest.get(`${API_BASE_URL}/admin/referrals/issuances`, (req, res, ctx) => {
    const issuances = [
      {
        id: 'issuance-123',
        ride_id: 'ride-123',
        referred_rider_id: 'rider-123',
        referrer_type: 'driver',
        referrer_id: 'driver-123',
        tier: 1,
        amount_cents: 250,
        currency: 'CAD',
        status: 'issued',
        created_at: '2024-01-01T10:15:00Z',
      },
    ];
    return res(
      ctx.status(200),
      ctx.json({
        issuances,
        pagination: {
          page: 1,
          page_size: 20,
          total: 1,
          total_pages: 1,
        },
      })
    );
  }),

  // Scheduled rides endpoints
  rest.get(`${API_BASE_URL}/admin/scheduled-rides`, (req, res, ctx) => {
    const scheduledRides = [
      {
        id: 'scheduled-123',
        rider_id: 'rider-123',
        pickup_address: '123 Main St, Halifax, NS',
        dropoff_address: '456 University Ave, Halifax, NS',
        scheduled_for: '2024-01-02T10:00:00Z',
        window_minutes: 10,
        status: 'scheduled',
        source: 'rider',
        created_at: '2024-01-01T09:00:00Z',
      },
    ];
    return res(
      ctx.status(200),
      ctx.json({
        scheduled_rides: scheduledRides,
        pagination: {
          page: 1,
          page_size: 20,
          total: 1,
          total_pages: 1,
        },
      })
    );
  }),

  // Vehicle Classes endpoints
  rest.get(`${API_BASE_URL}/admin/vehicle-classes`, (req, res, ctx) => {
    const vehicleClasses = [
      {
        id: 'vc-1',
        code: 'charged_x',
        display_name: 'Charged X',
        is_enabled: true,
        base_fare_cents: 500,
        per_km_cents: 180,
        per_min_cents: 25,
        updated_at: '2024-01-01T00:00:00Z',
      },
      {
        id: 'vc-2',
        code: 'charged_black',
        display_name: 'Charged Black',
        is_enabled: true,
        base_fare_cents: 600,
        per_km_cents: 200,
        per_min_cents: 30,
        updated_at: '2024-01-01T00:00:00Z',
      },
      {
        id: 'vc-3',
        code: 'charged_xl',
        display_name: 'Charged XL',
        is_enabled: true,
        base_fare_cents: 800,
        per_km_cents: 250,
        per_min_cents: 35,
        updated_at: '2024-01-01T00:00:00Z',
      },
    ];
    return res(
      ctx.status(200),
      ctx.json({
        vehicle_classes: vehicleClasses,
        pagination: {
          page: 1,
          page_size: 20,
          total: vehicleClasses.length,
          total_pages: 1,
        },
      })
    );
  }),

  rest.patch(`${API_BASE_URL}/admin/vehicle-classes/:code`, (req, res, ctx) => {
    const { code } = req.params;
    return res(
      ctx.status(200),
      ctx.json({
        id: `vc-${code}`,
        code,
        display_name: `Charged ${code.toUpperCase()}`,
        is_enabled: true,
        base_fare_cents: 500,
        per_km_cents: 180,
        per_min_cents: 25,
        updated_at: new Date().toISOString(),
      })
    );
  }),

  // Public catalog endpoint
  rest.get(`${API_BASE_URL}/catalog/vehicle-classes`, (req, res, ctx) => {
    const vehicleClasses = [
      {
        id: 'vc-1',
        code: 'charged_x',
        display_name: 'Charged X',
        is_enabled: true,
        base_fare_cents: 500,
        per_km_cents: 180,
        per_min_cents: 25,
        updated_at: '2024-01-01T00:00:00Z',
      },
      {
        id: 'vc-2',
        code: 'charged_black',
        display_name: 'Charged Black',
        is_enabled: true,
        base_fare_cents: 600,
        per_km_cents: 200,
        per_min_cents: 30,
        updated_at: '2024-01-01T00:00:00Z',
      },
      {
        id: 'vc-3',
        code: 'charged_xl',
        display_name: 'Charged XL',
        is_enabled: false, // This would be disabled in the test
        base_fare_cents: 800,
        per_km_cents: 250,
        per_min_cents: 35,
        updated_at: '2024-01-01T00:00:00Z',
      },
    ];
    return res(
      ctx.status(200),
      ctx.json({
        vehicle_classes: vehicleClasses,
      })
    );
  }),

  // Error handlers
  rest.get(`${API_BASE_URL}/admin/*`, (req, res, ctx) => {
    return res(
      ctx.status(500),
      ctx.json({ error: 'Internal Server Error' })
    );
  }),

  rest.post(`${API_BASE_URL}/admin/*`, (req, res, ctx) => {
    return res(
      ctx.status(500),
      ctx.json({ error: 'Internal Server Error' })
    );
  }),
];
