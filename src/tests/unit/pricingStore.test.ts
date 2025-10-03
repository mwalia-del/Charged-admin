import { renderHook, act } from '@testing-library/react';
import { usePricingStore } from '../../stores/pricingStore';
import pricingApi from '../../services/pricingApi';
import { websocketService } from '../../services/websocketService';

// Mock the API service
jest.mock('../../services/pricingApi');
const mockedPricingApi = pricingApi as jest.Mocked<typeof pricingApi>;

// Mock the WebSocket service
jest.mock('../../services/websocketService');
const mockedWebsocketService = websocketService as jest.Mocked<typeof websocketService>;

describe('PricingStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset store state
    act(() => {
      usePricingStore.getState().clearErrors();
    });
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => usePricingStore());
      
      expect(result.current.pricingRules).toEqual([]);
      expect(result.current.vehicleClasses).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.isWebSocketConnected).toBe(false);
    });
  });

  describe('fetchPricingRules', () => {
    it('should fetch pricing rules successfully', async () => {
      const mockRules = [
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

      mockedPricingApi.getPricingRules.mockResolvedValue(mockRules);

      const { result } = renderHook(() => usePricingStore());

      await act(async () => {
        await result.current.fetchPricingRules();
      });

      expect(result.current.pricingRules).toEqual(mockRules);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle fetch pricing rules error', async () => {
      const errorMessage = 'Network error';
      mockedPricingApi.getPricingRules.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => usePricingStore());

      await act(async () => {
        await result.current.fetchPricingRules();
      });

      expect(result.current.pricingRules).toEqual([]);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(errorMessage);
    });
  });

  describe('updatePricingRule', () => {
    it('should update pricing rule successfully', async () => {
      const initialRule = {
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
      };

      const updatedRule = { ...initialRule, base_price: '3.00' };

      mockedPricingApi.updatePricingRule.mockResolvedValue(updatedRule);
      mockedWebsocketService.emitPricingRuleChange = jest.fn();

      const { result } = renderHook(() => usePricingStore());

      // Set initial state
      act(() => {
        result.current.pricingRules = [initialRule];
      });

      await act(async () => {
        await result.current.updatePricingRule(1, { base_price: '3.00' });
      });

      expect(result.current.pricingRules[0]).toEqual(updatedRule);
      expect(mockedWebsocketService.emitPricingRuleChange).toHaveBeenCalledWith(1, 'updated');
    });

    it('should handle validation errors', async () => {
      const invalidData = { base_price: '-2.50' };
      
      mockedPricingApi.validatePricingRule.mockReturnValue({
        isValid: false,
        errors: ['Base price must be a positive number'],
      });

      const { result } = renderHook(() => usePricingStore());

      await act(async () => {
        await expect(result.current.updatePricingRule(1, invalidData)).rejects.toThrow();
      });

      expect(mockedPricingApi.updatePricingRule).not.toHaveBeenCalled();
    });
  });

  describe('toggleVehicleClass', () => {
    it('should toggle vehicle class successfully', async () => {
      const initialVehicleClass = {
        id: 'vc-1',
        code: 'charged_xl',
        display_name: 'Charged XL',
        is_enabled: true,
        updated_at: '2024-01-01T00:00:00Z',
      };

      const updatedVehicleClass = { ...initialVehicleClass, is_enabled: false };

      mockedPricingApi.updateVehicleClass.mockResolvedValue(updatedVehicleClass);
      mockedWebsocketService.emitVehicleClassChange = jest.fn();

      const { result } = renderHook(() => usePricingStore());

      // Set initial state
      act(() => {
        result.current.vehicleClasses = [initialVehicleClass];
      });

      await act(async () => {
        await result.current.toggleVehicleClass('charged_xl', false);
      });

      expect(result.current.vehicleClasses[0]).toEqual(updatedVehicleClass);
      expect(mockedWebsocketService.emitVehicleClassChange).toHaveBeenCalledWith('charged_xl', 'updated');
    });
  });

  describe('WebSocket Integration', () => {
    it('should connect to WebSocket successfully', async () => {
      const mockSocket = {
        on: jest.fn(),
        emit: jest.fn(),
        disconnect: jest.fn(),
      };

      mockedWebsocketService.connect.mockResolvedValue(mockSocket as any);

      const { result } = renderHook(() => usePricingStore());

      await act(async () => {
        await result.current.connectWebSocket();
      });

      expect(result.current.isWebSocketConnected).toBe(true);
      expect(mockedWebsocketService.connect).toHaveBeenCalled();
    });

    it('should handle WebSocket connection error', async () => {
      mockedWebsocketService.connect.mockRejectedValue(new Error('Connection failed'));

      const { result } = renderHook(() => usePricingStore());

      await act(async () => {
        await result.current.connectWebSocket();
      });

      expect(result.current.isWebSocketConnected).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should set and clear errors correctly', () => {
      const { result } = renderHook(() => usePricingStore());

      act(() => {
        result.current.setError('Test error');
      });

      expect(result.current.error).toBe('Test error');

      act(() => {
        result.current.clearErrors();
      });

      expect(result.current.error).toBeNull();
    });
  });
});
