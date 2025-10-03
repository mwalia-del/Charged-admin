import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import Pricing from '../../pages/Pricing';
import { usePricingStore } from '../../stores/pricingStore';
import pricingApi from '../../services/pricingApi';
import { websocketService } from '../../services/websocketService';

// Mock the store
jest.mock('../../stores/pricingStore');
const mockUsePricingStore = usePricingStore as jest.MockedFunction<typeof usePricingStore>;

// Mock the API service
jest.mock('../../services/pricingApi');
const mockedPricingApi = pricingApi as jest.Mocked<typeof pricingApi>;

// Mock the WebSocket service
jest.mock('../../services/websocketService');
const mockedWebsocketService = websocketService as jest.Mocked<typeof websocketService>;

// Mock react-hot-toast
jest.mock('react-hot-toast', () => ({
  success: jest.fn(),
  error: jest.fn(),
}));

const theme = createTheme();

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <ThemeProvider theme={theme}>
        {component}
      </ThemeProvider>
    </BrowserRouter>
  );
};

describe('PricingPage Integration', () => {
  const mockPricingRules = [
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

  const mockVehicleClasses = [
    {
      id: 'vc-1',
      code: 'charged_xl',
      display_name: 'Charged XL',
      is_enabled: true,
      updated_at: '2024-01-01T00:00:00Z',
    },
  ];

  const mockStoreState = {
    pricingRules: mockPricingRules,
    vehicleClasses: mockVehicleClasses,
    loading: false,
    vehicleClassesLoading: false,
    error: null,
    vehicleClassesError: null,
    savingRules: {},
    updatingVehicleClasses: {},
    isWebSocketConnected: true,
    fetchPricingRules: jest.fn(),
    fetchVehicleClasses: jest.fn(),
    updatePricingRule: jest.fn(),
    createPricingRule: jest.fn(),
    deletePricingRule: jest.fn(),
    toggleVehicleClass: jest.fn(),
    updateVehicleClass: jest.fn(),
    connectWebSocket: jest.fn(),
    disconnectWebSocket: jest.fn(),
    setError: jest.fn(),
    setVehicleClassesError: jest.fn(),
    clearErrors: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePricingStore.mockReturnValue(mockStoreState);
  });

  describe('Rendering', () => {
    it('should render pricing page with both tabs', () => {
      renderWithProviders(<Pricing />);

      expect(screen.getByText('Pricing & Vehicle Management')).toBeInTheDocument();
      expect(screen.getByText('Pricing Rules')).toBeInTheDocument();
      expect(screen.getByText('Vehicle Classes')).toBeInTheDocument();
    });

    it('should display WebSocket connection status', () => {
      renderWithProviders(<Pricing />);

      expect(screen.getByText('Live Updates')).toBeInTheDocument();
    });

    it('should show pricing rules when available', () => {
      renderWithProviders(<Pricing />);

      expect(screen.getByText('Electric')).toBeInTheDocument();
      expect(screen.getByDisplayValue('2.50')).toBeInTheDocument();
    });

    it('should show vehicle classes when available', () => {
      renderWithProviders(<Pricing />);

      // Switch to vehicle classes tab
      fireEvent.click(screen.getByText('Vehicle Classes'));

      expect(screen.getByText('Charged XL')).toBeInTheDocument();
    });
  });

  describe('Pricing Rules Tab', () => {
    it('should allow editing pricing rule fields', async () => {
      renderWithProviders(<Pricing />);

      const basePriceField = screen.getByDisplayValue('2.50');
      fireEvent.change(basePriceField, { target: { value: '3.00' } });

      expect(basePriceField).toHaveValue('3.00');
    });

    it('should show validation errors for invalid input', async () => {
      renderWithProviders(<Pricing />);

      const basePriceField = screen.getByDisplayValue('2.50');
      fireEvent.change(basePriceField, { target: { value: '-1.00' } });

      // The validation should prevent saving
      const saveButton = screen.getByText('Save Changes');
      expect(saveButton).toBeDisabled();
    });

    it('should save pricing rule when save button is clicked', async () => {
      const mockUpdatePricingRule = jest.fn().mockResolvedValue(undefined);
      mockUsePricingStore.mockReturnValue({
        ...mockStoreState,
        updatePricingRule: mockUpdatePricingRule,
      });

      renderWithProviders(<Pricing />);

      const saveButton = screen.getByText('Save Changes');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockUpdatePricingRule).toHaveBeenCalledWith(1, mockPricingRules[0]);
      });
    });

    it('should show create rule button', () => {
      renderWithProviders(<Pricing />);

      expect(screen.getByText('Create Rule')).toBeInTheDocument();
    });

    it('should show delete button for each rule', () => {
      renderWithProviders(<Pricing />);

      const deleteButtons = screen.getAllByLabelText('Delete Rule');
      expect(deleteButtons).toHaveLength(mockPricingRules.length);
    });
  });

  describe('Vehicle Classes Tab', () => {
    it('should toggle vehicle class when switch is clicked', async () => {
      const mockToggleVehicleClass = jest.fn().mockResolvedValue(undefined);
      mockUsePricingStore.mockReturnValue({
        ...mockStoreState,
        toggleVehicleClass: mockToggleVehicleClass,
      });

      renderWithProviders(<Pricing />);

      // Switch to vehicle classes tab
      fireEvent.click(screen.getByText('Vehicle Classes'));

      const toggleSwitch = screen.getByRole('checkbox');
      fireEvent.click(toggleSwitch);

      await waitFor(() => {
        expect(mockToggleVehicleClass).toHaveBeenCalledWith('charged_xl', false);
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error message when fetch fails', () => {
      mockUsePricingStore.mockReturnValue({
        ...mockStoreState,
        error: 'Failed to fetch pricing rules',
      });

      renderWithProviders(<Pricing />);

      expect(screen.getByText('Failed to fetch pricing rules')).toBeInTheDocument();
      expect(screen.getByText('Retry')).toBeInTheDocument();
    });

    it('should retry when retry button is clicked', async () => {
      const mockFetchPricingRules = jest.fn();
      const mockClearErrors = jest.fn();
      
      mockUsePricingStore.mockReturnValue({
        ...mockStoreState,
        error: 'Failed to fetch pricing rules',
        fetchPricingRules: mockFetchPricingRules,
        clearErrors: mockClearErrors,
      });

      renderWithProviders(<Pricing />);

      const retryButton = screen.getByText('Retry');
      fireEvent.click(retryButton);

      expect(mockClearErrors).toHaveBeenCalled();
      expect(mockFetchPricingRules).toHaveBeenCalled();
    });
  });

  describe('Loading States', () => {
    it('should show loading spinner when loading', () => {
      mockUsePricingStore.mockReturnValue({
        ...mockStoreState,
        loading: true,
        pricingRules: [],
      });

      renderWithProviders(<Pricing />);

      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('should show saving state on save button', () => {
      mockUsePricingStore.mockReturnValue({
        ...mockStoreState,
        savingRules: { '1': true },
      });

      renderWithProviders(<Pricing />);

      expect(screen.getByText('Saving...')).toBeInTheDocument();
    });
  });

  describe('WebSocket Integration', () => {
    it('should connect to WebSocket on mount', () => {
      const mockConnectWebSocket = jest.fn();
      mockUsePricingStore.mockReturnValue({
        ...mockStoreState,
        connectWebSocket: mockConnectWebSocket,
      });

      renderWithProviders(<Pricing />);

      expect(mockConnectWebSocket).toHaveBeenCalled();
    });

    it('should disconnect from WebSocket on unmount', () => {
      const mockDisconnectWebSocket = jest.fn();
      mockUsePricingStore.mockReturnValue({
        ...mockStoreState,
        disconnectWebSocket: mockDisconnectWebSocket,
      });

      const { unmount } = renderWithProviders(<Pricing />);
      unmount();

      expect(mockDisconnectWebSocket).toHaveBeenCalled();
    });
  });
});
