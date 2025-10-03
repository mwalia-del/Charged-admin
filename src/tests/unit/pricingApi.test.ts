import pricingApi from '../../services/pricingApi';
import { rideTypes, VehicleClass } from '../../types';

// Mock axios
jest.mock('axios');
import axios from 'axios';
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('PricingApi', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(JSON.stringify({ token: 'test-token' }));
  });

  describe('Pricing Rules', () => {
    it('should fetch pricing rules successfully', async () => {
      const mockRules: rideTypes[] = [
        {
          id: 1,
          name: 'Electric',
          description: 'Electric vehicle rides',
          base_price: '2.50',
          price_per_km: '1.20',
          price_per_minute: '0.15',
          min_fare: '5.00',
          icon: 'https://example.com/electric-icon.png',
          is_active: true,
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          cancel_fee: '3.00',
          refund_distance_in_m: 500,
          minimum_billable_distance: '2.0',
          commission_percentage: '15.0',
          govt_tax_percentage: '5.0',
        },
      ];

      mockedAxios.create.mockReturnValue({
        get: jest.fn().mockResolvedValue({ data: mockRules }),
        post: jest.fn(),
        put: jest.fn(),
        patch: jest.fn(),
        delete: jest.fn(),
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() },
        },
      } as any);

      const result = await pricingApi.getPricingRules();
      expect(result).toEqual(mockRules);
    });

    it('should handle fetch pricing rules error', async () => {
      mockedAxios.create.mockReturnValue({
        get: jest.fn().mockRejectedValue(new Error('Network error')),
        post: jest.fn(),
        put: jest.fn(),
        patch: jest.fn(),
        delete: jest.fn(),
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() },
        },
      } as any);

      await expect(pricingApi.getPricingRules()).rejects.toThrow('Failed to fetch pricing rules');
    });

    it('should update pricing rule successfully', async () => {
      const mockRule: rideTypes = {
        id: 1,
        name: 'Electric',
        description: 'Electric vehicle rides',
        base_price: '3.00',
        price_per_km: '1.50',
        price_per_minute: '0.20',
        min_fare: '6.00',
        icon: 'https://example.com/electric-icon.png',
        is_active: true,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        cancel_fee: '3.00',
        refund_distance_in_m: 500,
        minimum_billable_distance: '2.0',
        commission_percentage: '15.0',
        govt_tax_percentage: '5.0',
      };

      mockedAxios.create.mockReturnValue({
        get: jest.fn(),
        post: jest.fn(),
        put: jest.fn().mockResolvedValue({ data: mockRule }),
        patch: jest.fn(),
        delete: jest.fn(),
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() },
        },
      } as any);

      const result = await pricingApi.updatePricingRule(1, { base_price: '3.00' });
      expect(result).toEqual(mockRule);
    });
  });

  describe('Vehicle Classes', () => {
    it('should fetch vehicle classes successfully', async () => {
      const mockResponse = {
        vehicle_classes: [
          {
            id: 'vc-1',
            code: 'charged_xl',
            display_name: 'Charged XL',
            is_enabled: true,
            updated_at: '2024-01-01T00:00:00Z',
          },
        ],
        pagination: {
          page: 1,
          page_size: 20,
          total: 1,
          total_pages: 1,
        },
      };

      mockedAxios.create.mockReturnValue({
        get: jest.fn().mockResolvedValue({ data: mockResponse }),
        post: jest.fn(),
        put: jest.fn(),
        patch: jest.fn(),
        delete: jest.fn(),
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() },
        },
      } as any);

      const result = await pricingApi.getVehicleClasses();
      expect(result).toEqual(mockResponse);
    });

    it('should update vehicle class successfully', async () => {
      const mockVehicleClass: VehicleClass = {
        id: 'vc-1',
        code: 'charged_xl',
        display_name: 'Charged XL',
        is_enabled: false,
        updated_at: '2024-01-01T00:00:00Z',
      };

      mockedAxios.create.mockReturnValue({
        get: jest.fn(),
        post: jest.fn(),
        put: jest.fn(),
        patch: jest.fn().mockResolvedValue({ data: mockVehicleClass }),
        delete: jest.fn(),
        interceptors: {
          request: { use: jest.fn() },
          response: { use: jest.fn() },
        },
      } as any);

      const result = await pricingApi.updateVehicleClass('charged_xl', { is_enabled: false });
      expect(result).toEqual(mockVehicleClass);
    });
  });

  describe('Validation', () => {
    it('should validate pricing rule data correctly', () => {
      const validData = {
        base_price: '2.50',
        price_per_km: '1.20',
        commission_percentage: '15.0',
        govt_tax_percentage: '5.0',
      };

      const result = pricingApi.validatePricingRule(validData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect invalid pricing rule data', () => {
      const invalidData = {
        base_price: '-2.50',
        price_per_km: 'invalid',
        commission_percentage: '150.0',
        govt_tax_percentage: '-5.0',
      };

      const result = pricingApi.validatePricingRule(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Base price must be a positive number');
      expect(result.errors).toContain('Price per km must be a positive number');
      expect(result.errors).toContain('Commission percentage must be between 0 and 100');
      expect(result.errors).toContain('Government tax percentage must be between 0 and 100');
    });
  });
});
