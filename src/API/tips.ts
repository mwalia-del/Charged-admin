import axios from "axios";
import { Tip, TipSummary, TipsFilters, TipsResponse } from "../types";
import { generateMockTips, generateMockSummary } from "./mockTipsData";

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

// Get tips with filters
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

    const response = await instance.get(`/analytics/tips?${params.toString()}`);
    return response.data;
  } catch (error) {
    // Fallback to mock data for development
    console.warn('API call failed, using mock data:', error);
    const mockTips = generateMockTips(50);
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

// Get tips summary
export const getTipsSummary = async (filters: TipsFilters): Promise<TipSummary> => {
  try {
    const params = new URLSearchParams();
    
    if (filters.actor_type) params.append("actor_type", filters.actor_type);
    if (filters.actor_id) params.append("actor_id", filters.actor_id);
    if (filters.range) params.append("range", filters.range);
    if (filters.start_date) params.append("start_date", filters.start_date);
    if (filters.end_date) params.append("end_date", filters.end_date);

    const response = await instance.get(`/analytics/tips/summary?${params.toString()}`);
    return response.data;
  } catch (error) {
    // Fallback to mock data for development
    console.warn('API call failed, using mock data:', error);
    const mockTips = generateMockTips(50);
    return generateMockSummary(mockTips);
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
    const mockTips = generateMockTips(50).filter(tip => tip.driver_id === driverId);
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
    const mockTips = generateMockTips(50).filter(tip => tip.rider_id === riderId);
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
