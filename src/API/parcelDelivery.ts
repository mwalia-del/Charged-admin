import axios from 'axios';
import { API_BASE_URL } from '../config/api';

// Types for parcel delivery pricing
export interface ParcelDeliveryPricing {
  id: number;
  name: string;
  description: string;
  base_price: string;
  price_per_km: string;
  price_per_minute: string;
  service_fee: string;
  min_fare: string;
  minimum_billable_distance: string;
  commission_percentage: string;
  govt_tax_percentage: string;
  cancel_fee: string;
  refund_distance_in_m: number;
  keyword: string;
  icon: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface ParcelDeliveryPricingResponse {
  status: boolean;
  data: ParcelDeliveryPricing[];
  timestamp: string;
}

export interface ParcelDeliveryPricingUpdate {
  base_price?: number;
  price_per_km?: number;
  price_per_minute?: number;
  service_fee?: number;
  min_fare?: number;
  commission_percentage?: number;
  govt_tax_percentage?: number;
  description?: string;
}

export interface WebSocketInfo {
  url: string;
  channel: string;
}

// Use the same axios instance configuration as the main API
const instance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add the same request interceptor as the main API for authentication
instance.interceptors.request.use(
  (config) => {
    const userString = localStorage.getItem("charged_admin_user");
    if (userString) {
      const user = JSON.parse(userString);
      const token = user?.token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } else {
      console.log("❌ No user found in localStorage for parcel delivery API");
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Add response interceptor to handle authentication errors
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    console.error("❌ Parcel Delivery API Error:", error.response?.status, error.config?.url);
    console.error("❌ Error details:", error.response?.data);
    
    // Handle 401 errors by refreshing token (same as main API)
    if (error.response?.status === 401) {
      const userString = localStorage.getItem("charged_admin_user");
      if (userString) {
        const user = JSON.parse(userString);
        console.log("🔄 Attempting to refresh token due to 401 error in parcel delivery API");
        
        try {
          const { auth } = await import("../firebase/firebaseConfig");
          if (auth.currentUser) {
            const newToken = await auth.currentUser.getIdToken(true);
            const updatedUser = { ...user, token: newToken };
            localStorage.setItem("charged_admin_user", JSON.stringify(updatedUser));
            
            // Retry the original request with new token
            error.config.headers.Authorization = `Bearer ${newToken}`;
            console.log("🔄 Retrying parcel delivery request with refreshed token");
            return instance.request(error.config);
          }
        } catch (refreshError) {
          console.error("❌ Token refresh failed for parcel delivery API:", refreshError);
          localStorage.removeItem("charged_admin_user");
          window.location.href = "/login";
        }
      }
    }
    
    return Promise.reject(error);
  },
);

// Get parcel delivery pricing rules
export const getParcelDeliveryPricing = async (): Promise<ParcelDeliveryPricingResponse> => {
  try {
    // console.log('🔍 API: Making GET request to /admin/parcel-delivery-pricing');
    const response = await instance.get('/admin/parcel-delivery-pricing');
    // console.log('🔍 API: GET response received:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching parcel delivery pricing:', error);
    throw error;
  }
};

// Update parcel delivery pricing rules using the standard endpoint
export const updateParcelDeliveryPricing = async (
  updates: ParcelDeliveryPricingUpdate
): Promise<ParcelDeliveryPricingResponse> => {
  try {
    // console.log('🔍 API: Making PUT request to /admin/parcel-delivery-pricing/standard with data:', updates);
    const response = await instance.put('/admin/parcel-delivery-pricing/standard', updates);
    // console.log('🔍 API: PUT response received:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating parcel delivery pricing:', error);
    throw error;
  }
};

// Get WebSocket information for real-time updates
export const getParcelDeliveryWebSocketInfo = async (): Promise<WebSocketInfo> => {
  try {
    const response = await instance.get('/admin/parcel-delivery-pricing/websocket-info');
    return response.data;
  } catch (error) {
    console.error('Error fetching WebSocket info:', error);
    throw error;
  }
};
