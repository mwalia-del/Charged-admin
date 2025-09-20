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
    console.log("🔍 Tips API - Request interceptor - User data found:", !!userString);
    
    if (userString) {
      const user = JSON.parse(userString);
      const token = user?.token;
      console.log("🔍 Tips API - Request interceptor - Token exists:", !!token);
      console.log("🔍 Tips API - Request interceptor - Token preview:", token ? `${token.substring(0, 20)}...` : 'None');
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log("🔍 Tips API - Request interceptor - Authorization header set");
      } else {
        console.log("❌ Tips API - Request interceptor - No token found in user data");
      }
    } else {
      console.log("❌ Tips API - Request interceptor - No user data found in localStorage");
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

    // Use the new admin endpoint for tips
    const url = `/admin/tips?${params.toString()}`;
    
    console.log('🔍 Tips API - Making request to:', url);
    console.log('🔍 Tips API - Filters:', filters);
    
    const response = await instance.get(url);
    
    console.log('🔍 Tips API - Response status:', response.status);
    console.log('🔍 Tips API - Response data:', response.data);
    
    // Backend returns: {status: true, data: {tips: [...], pagination: {...}}}
    // Frontend expects: {rows: [...], pagination: {...}}
    if (response.data?.status && response.data?.data) {
      const backendData = response.data.data;
      console.log('🔍 Tips API - Backend data structure:', backendData);
      console.log('🔍 Tips API - Backend pagination:', backendData.pagination);
      console.log('🔍 Tips API - Backend tips count:', backendData.tips?.length || 0);
      console.log('🔍 Tips API - Backend tips sample:', backendData.tips?.slice(0, 3) || []);
      
      // Map backend format to frontend format
      const mappedData = {
        rows: backendData.tips || backendData.rows || [],
        pagination: {
          page: backendData.pagination?.current_page || filters.page || 1,
          page_size: backendData.pagination?.items_per_page || filters.page_size || 25,
          total: backendData.pagination?.total_items || 0,
          total_pages: backendData.pagination?.total_pages || 0
        }
      };
      
      console.log('🔍 Tips API - Mapped data:', mappedData);
      return mappedData;
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

    const response = await instance.get(`/admin/tips/summary?${params.toString()}`);
    
    console.log('🔍 Tips Summary API - Response status:', response.status);
    console.log('🔍 Tips Summary API - Response data:', response.data);
    
    // Backend returns: {status: true, data: {...}}
    // Frontend expects: {...}
    if (response.data?.status && response.data?.data) {
      return response.data.data;
    }
    
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

    const response = await instance.get(`/admin/tips/driver/${driverId}?${params.toString()}`);
    
    // Backend returns: {status: true, data: {tips: [...], pagination: {...}}}
    // Frontend expects: {rows: [...], pagination: {...}}
    if (response.data?.status && response.data?.data) {
      const backendData = response.data.data;
      return {
        rows: backendData.tips || backendData.rows || [],
        pagination: backendData.pagination || {
          page: filters.page || 1,
          page_size: filters.page_size || 25,
          total: 0,
          total_pages: 0
        }
      };
    }
    
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
    const response = await instance.get(`/admin/tips/ride/${rideId}`);
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

  const response = await instance.get(`/admin/tips/export?${params.toString()}`, {
    responseType: 'blob'
  });
  return response.data;
};
