import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Common test utilities
export const user = userEvent.setup();

// Wait for element to appear
export const waitForElement = async (selector: string) => {
  return await waitFor(() => screen.getByTestId(selector));
};

// Wait for text to appear
export const waitForText = async (text: string) => {
  return await waitFor(() => screen.getByText(text));
};

// Wait for element to disappear
export const waitForElementToDisappear = async (selector: string) => {
  return await waitFor(() => {
    expect(screen.queryByTestId(selector)).not.toBeInTheDocument();
  });
};

// Mock API responses
export const mockApiResponse = (data: any, status = 200) => {
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: status >= 200 && status < 300,
    status,
    json: async () => data,
    text: async () => JSON.stringify(data),
  });
};

// Mock API error
export const mockApiError = (status = 500, message = 'Internal Server Error') => {
  (global.fetch as jest.Mock).mockRejectedValueOnce(
    new Error(`HTTP ${status}: ${message}`)
  );
};

// Mock localStorage
export const mockLocalStorage = (data: Record<string, string>) => {
  Object.keys(data).forEach(key => {
    localStorage.setItem(key, data[key]);
  });
};

// Clear all mocks
export const clearAllMocks = () => {
  jest.clearAllMocks();
  localStorage.clear();
  sessionStorage.clear();
};

// Generate test data
export const generateTestUser = (overrides = {}) => ({
  id: 'test-user-123',
  email: 'test@example.com',
  name: 'Test User',
  role: 'admin',
  token: 'test-token-123',
  ...overrides,
});

export const generateTestDriver = (overrides = {}) => ({
  id: 'test-driver-123',
  name: 'Test Driver',
  email: 'driver@test.com',
  phone: '+1234567890',
  vehicle_type: 'Charged X',
  status: 'active',
  rating: 4.5,
  total_rides: 100,
  created_at: '2024-01-01T00:00:00Z',
  ...overrides,
});

export const generateTestRider = (overrides = {}) => ({
  id: 'test-rider-123',
  name: 'Test Rider',
  email: 'rider@test.com',
  phone: '+1234567890',
  status: 'active',
  rating: 4.8,
  total_rides: 50,
  created_at: '2024-01-01T00:00:00Z',
  ...overrides,
});

export const generateTestRide = (overrides = {}) => ({
  id: 'test-ride-123',
  ride_number: 'RIDE-001',
  rider_id: 'test-rider-123',
  driver_id: 'test-driver-123',
  status: 'completed',
  fare_cents: 1500,
  distance_km: 5.2,
  duration_minutes: 15,
  started_at: '2024-01-01T10:00:00Z',
  completed_at: '2024-01-01T10:15:00Z',
  ...overrides,
});

// Test assertions
export const expectElementToBeInDocument = (selector: string) => {
  expect(screen.getByTestId(selector)).toBeInTheDocument();
};

export const expectElementNotToBeInDocument = (selector: string) => {
  expect(screen.queryByTestId(selector)).not.toBeInTheDocument();
};

export const expectTextToBeInDocument = (text: string) => {
  expect(screen.getByText(text)).toBeInTheDocument();
};

export const expectTextNotToBeInDocument = (text: string) => {
  expect(screen.queryByText(text)).not.toBeInTheDocument();
};
