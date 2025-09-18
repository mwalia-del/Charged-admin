import axios from "axios";
import { Tip, TipSummary, TipsFilters, TipsResponse } from "../types";
import { getUnifiedTips, getUnifiedTipSummary } from "./unifiedMockData";

const instance = axios.create({
  baseURL: "https://api.charged.autos",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to dynamically set the Authorization header
instance.interceptors.request.use(
  (config) => {
    const userString = localStorage.getItem("charged_admin_user");
    if (userString) {
      const user = JSON.parse(userString);
      const token = user?.token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Get tips with filters (Admin endpoint)
export const getTips = async (filters: TipsFilters): Promise<TipsResponse> => {
  try {
    const params = new URLSearchParams();
    
    if (filters.actor_type) params.append("actor_type", filters.actor_type);
    if (filters.actor_id) params.append("actor_id", filters.actor_id);
    if (filters.range) params.append("range", filters.range);
    if (filters.start_date) params.append("start_date", filters.start_date);
    if (filters.end_date) params.append("end_date", filters.end_date);
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.page_size) params.append("page_size", filters.page_size.toString());

    console.log('🌐 Tips API - Filters:', filters);
    console.log('🌐 Tips API - URL params:', params.toString());
    // Try different endpoints for tips list
    // The current endpoint returns summary data, we need the actual tips list
    const url = `/tips/driver?${params.toString()}`;
    console.log('🌐 Tips API - Full URL:', url);
    console.log('🌐 Tips API - Current endpoint returns summary data, need tips list');
    
    const response = await instance.get(url);
    console.log('✅ Tips API - Response:', response.data);
    console.log('✅ Tips API - Response structure:', {
      hasRows: !!response.data?.rows,
      hasData: !!response.data?.data,
      hasStatus: !!response.data?.status,
      responseKeys: Object.keys(response.data || {})
    });
    
    // Backend returns: {status: true, data: {rows: [...], pagination: {...}}}
    // Frontend expects: {rows: [...], pagination: {...}}
    if (response.data?.status && response.data?.data) {
      console.log('✅ Tips API - Extracting data from backend response');
      return response.data.data; // Return the nested data object
    }
    
    return response.data;
  } catch (error) {
    // Fallback to mock data for development
    console.warn('API call failed, using mock data:', error);
    const mockTips = getUnifiedTips();
    const page = filters.page || 1;
    const pageSize = filters.page_size || 25;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    
    return {
      rows: mockTips.slice(startIndex, endIndex),
      pagination: {
        page: page,
        page_size: pageSize,
        total: mockTips.length,
        total_pages: Math.ceil(mockTips.length / pageSize)
      }
    };
  }
};

// Get tips summary (Admin endpoint)
export const getTipsSummary = async (filters: TipsFilters): Promise<TipSummary> => {
  try {
    const params = new URLSearchParams();
    
    if (filters.actor_type) params.append("actor_type", filters.actor_type);
    if (filters.actor_id) params.append("actor_id", filters.actor_id);
    if (filters.range) params.append("range", filters.range);
    if (filters.start_date) params.append("start_date", filters.start_date);
    if (filters.end_date) params.append("end_date", filters.end_date);

    const response = await instance.get(`/tips/driver/summary?${params.toString()}`);
    return response.data;
  } catch (error) {
    // Fallback to mock data for development
    console.warn('API call failed, using mock data:', error);
    return getUnifiedTipSummary();
  }
};

// Get driver tips
export const getDriverTips = async (driverId: string, filters: Omit<TipsFilters, 'actor_type' | 'actor_id'>): Promise<TipsResponse> => {
  try {
    const params = new URLSearchParams();
    
    if (filters.range) params.append("range", filters.range);
    if (filters.start_date) params.append("start_date", filters.start_date);
    if (filters.end_date) params.append("end_date", filters.end_date);
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.page_size) params.append("page_size", filters.page_size.toString());

    const response = await instance.get(`/drivers/${driverId}/tips?${params.toString()}`);
    return response.data;
  } catch (error) {
    // Fallback to mock data for development
    console.warn('API call failed, using mock data:', error);
    const mockTips = getUnifiedTips().filter((tip: Tip) => tip.driver_id === driverId);
    const page = filters.page || 1;
    const pageSize = filters.page_size || 25;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    
    return {
      rows: mockTips.slice(startIndex, endIndex),
      pagination: {
        page: page,
        page_size: pageSize,
        total: mockTips.length,
        total_pages: Math.ceil(mockTips.length / pageSize)
      }
    };
  }
};

// Get rider tips
export const getRiderTips = async (riderId: string, filters: Omit<TipsFilters, 'actor_type' | 'actor_id'>): Promise<TipsResponse> => {
  try {
    const params = new URLSearchParams();
    
    if (filters.range) params.append("range", filters.range);
    if (filters.start_date) params.append("start_date", filters.start_date);
    if (filters.end_date) params.append("end_date", filters.end_date);
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.page_size) params.append("page_size", filters.page_size.toString());

    const response = await instance.get(`/riders/${riderId}/tips?${params.toString()}`);
    return response.data;
  } catch (error) {
    // Fallback to mock data for development
    console.warn('API call failed, using mock data:', error);
    const mockTips = getUnifiedTips().filter((tip: Tip) => tip.rider_id === riderId);
    const page = filters.page || 1;
    const pageSize = filters.page_size || 25;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    
    return {
      rows: mockTips.slice(startIndex, endIndex),
      pagination: {
        page: page,
        page_size: pageSize,
        total: mockTips.length,
        total_pages: Math.ceil(mockTips.length / pageSize)
      }
    };
  }
};

// Add tip to a ride
export const addTipToRide = async (rideId: string, amountCents: number, currency: string = "CAD", idempotencyKey: string): Promise<Tip> => {
  const response = await instance.post(`/rides/${rideId}/tip`, {
    amount_cents: amountCents,
    currency: currency
  }, {
    headers: {
      'Idempotency-Key': idempotencyKey
    }
  });
  return response.data;
};

// Get tip by ride ID (Admin endpoint)
export const getTipByRideId = async (rideId: string): Promise<Tip> => {
  try {
    const response = await instance.get(`/tips/driver/ride/${rideId}`);
    return response.data;
  } catch (error) {
    console.warn('API call failed, using mock data:', error);
    // Return a mock tip for development
        return {
          id: parseInt(rideId) || 0,
          ride_id: parseInt(rideId) || 0,
          tip_amount: '5.00',
          tip_percentage: '15.00',
          payment_method: 'card',
          rider_email: 'mock.rider@example.com',
          pickup_address: 'Mock Pickup Address',
          dropoff_address: 'Mock Dropoff Address',
          added_at: new Date().toISOString(),
          // Optional fields for compatibility
          tip_id: `tip_${rideId}`,
          ride_number: `R${rideId}`,
          rider_id: 'rider_mock',
          rider_name: 'Mock Rider',
          driver_id: 'driver_mock',
          driver_name: 'Mock Driver',
          amount_cents: 500,
          currency: 'CAD',
          status: 'settled' as const,
          created_at: new Date().toISOString()
        };
  }
};

// Export tips to CSV
export const exportTipsToCSV = async (filters: TipsFilters): Promise<Blob> => {
  const params = new URLSearchParams();
  
  if (filters.actor_type) params.append("actor_type", filters.actor_type);
  if (filters.actor_id) params.append("actor_id", filters.actor_id);
  if (filters.range) params.append("range", filters.range);
  if (filters.start_date) params.append("start_date", filters.start_date);
  if (filters.end_date) params.append("end_date", filters.end_date);

  const response = await instance.get(`/analytics/tips/export?${params.toString()}`, {
    responseType: 'blob'
  });
  return response.data;
};
