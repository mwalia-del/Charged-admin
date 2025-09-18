import axios from "axios";
import { Tip, TipSummary, TipsFilters, TipsResponse } from "../types";

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
    console.error('Failed to fetch tips:', error);
    throw error;
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
    console.error('Failed to fetch tips summary:', error);
    throw error;
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
    console.error('Failed to fetch driver tips:', error);
    throw error;
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
    console.error('Failed to fetch rider tips:', error);
    throw error;
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
    console.error('Failed to fetch tip by ride ID:', error);
    throw error;
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
