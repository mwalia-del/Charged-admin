import axios from 'axios';
import { 
  ScheduledRide, 
  ScheduledRideRequest, 
  ScheduledRideUpdate, 
  ScheduledRideFilters, 
  ScheduledRideSummary, 
  ScheduledRidesResponse,
  AssignDriverRequest,
  CancelScheduledRequest
} from '../types';
import { API_ENDPOINTS, buildApiUrl, shouldUseMockData } from '../config/api';

import { API_BASE_URL } from '../config/api';

const instance = axios.create({
  baseURL: API_BASE_URL,
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
      if (user.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ===== ADMIN ENDPOINTS =====

export const getScheduledRides = async (filters: ScheduledRideFilters = {}): Promise<ScheduledRidesResponse> => {
  try {
    const params = new URLSearchParams();
    
    if (filters.status) params.append('status', filters.status);
    if (filters.source) params.append('source', filters.source);
    if (filters.org_id) params.append('org_id', filters.org_id);
    if (filters.rider_id) params.append('rider_id', filters.rider_id);
    if (filters.from) params.append('from', filters.from);
    if (filters.to) params.append('to', filters.to);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.page_size) params.append('page_size', filters.page_size.toString());

    const response = await instance.get(buildApiUrl(API_ENDPOINTS.SCHEDULED_RIDES.LIST) + `?${params.toString()}`);
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch scheduled rides:', error);
    
    // SECURITY FIX: Don't fallback to mock data in production
    if (shouldUseMockData()) {
      console.log('🎭 Development mode: Using mock data fallback');
      return {
        data: [],
        pagination: {
          page: filters.page || 1,
          page_size: filters.page_size || 10,
          total: 0,
          total_pages: 0
        }
      };
    }
    
    // In production, throw the error instead of returning fake data
    throw new Error(`Failed to fetch scheduled rides: ${error.message || 'Unknown error'}`);
  }
};

export const getScheduledRideSummary = async (filters: ScheduledRideFilters = {}): Promise<ScheduledRideSummary> => {
  try {
    const params = new URLSearchParams();
    
    if (filters.status) params.append('status', filters.status);
    if (filters.source) params.append('source', filters.source);
    if (filters.org_id) params.append('org_id', filters.org_id);
    if (filters.rider_id) params.append('rider_id', filters.rider_id);
    if (filters.from) params.append('from', filters.from);
    if (filters.to) params.append('to', filters.to);

    const response = await instance.get(buildApiUrl(API_ENDPOINTS.SCHEDULED_RIDES.SUMMARY) + `?${params.toString()}`);
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch scheduled ride summary:', error);
    
    // SECURITY FIX: Don't fallback to mock data in production
    if (shouldUseMockData()) {
      console.log('🎭 Development mode: Using mock summary data');
      return {
        scheduled_count: 0,
        converted_24h: 0,
        converted_7d: 0,
        cancelled_count: 0,
        failed_count: 0,
        upcoming_count: 0
      };
    }
    
    // In production, throw the error instead of returning fake data
    throw new Error(`Failed to fetch scheduled ride summary: ${error.message || 'Unknown error'}`);
  }
};

export const assignDriver = async (scheduledRideId: string, request: AssignDriverRequest): Promise<{ success: boolean; message: string }> => {
  try {
    await instance.post(buildApiUrl(API_ENDPOINTS.SCHEDULED_RIDES.ASSIGN_DRIVER(scheduledRideId)), request);
    return { success: true, message: 'Driver assigned successfully' };
  } catch (error: any) {
    console.error('Failed to assign driver:', error);
    return { 
      success: false, 
      message: error.response?.data?.message || 'Failed to assign driver' 
    };
  }
};

export const cancelScheduledRide = async (scheduledRideId: string, request: CancelScheduledRequest): Promise<{ success: boolean; message: string }> => {
  try {
    await instance.post(buildApiUrl(API_ENDPOINTS.SCHEDULED_RIDES.CANCEL(scheduledRideId)), request);
    return { success: true, message: 'Scheduled ride cancelled successfully' };
  } catch (error: any) {
    console.error('Failed to cancel scheduled ride:', error);
    return { 
      success: false, 
      message: error.response?.data?.message || 'Failed to cancel scheduled ride' 
    };
  }
};

export const exportScheduledRidesCSV = async (filters: ScheduledRideFilters = {}): Promise<Blob> => {
  try {
    const params = new URLSearchParams();
    
    if (filters.status) params.append('status', filters.status);
    if (filters.source) params.append('source', filters.source);
    if (filters.org_id) params.append('org_id', filters.org_id);
    if (filters.rider_id) params.append('rider_id', filters.rider_id);
    if (filters.from) params.append('from', filters.from);
    if (filters.to) params.append('to', filters.to);

    const response = await instance.get(buildApiUrl(API_ENDPOINTS.SCHEDULED_RIDES.EXPORT) + `?${params.toString()}`, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    console.error('Failed to export scheduled rides:', error);
    throw new Error('Failed to export scheduled rides');
  }
};

// ===== RIDER ENDPOINTS =====

export const createRiderScheduledRide = async (request: ScheduledRideRequest): Promise<ScheduledRide> => {
  try {
    const response = await instance.post('/riders/me/scheduled-rides', request);
    return response.data;
  } catch (error: any) {
    console.error('Failed to create scheduled ride:', error);
    throw new Error(error.response?.data?.message || 'Failed to create scheduled ride');
  }
};

export const getRiderScheduledRides = async (filters: ScheduledRideFilters = {}): Promise<ScheduledRidesResponse> => {
  try {
    const params = new URLSearchParams();
    
    if (filters.status) params.append('status', filters.status);
    if (filters.from) params.append('from', filters.from);
    if (filters.to) params.append('to', filters.to);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.page_size) params.append('page_size', filters.page_size.toString());

    const response = await instance.get(`/riders/me/scheduled-rides?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch rider scheduled rides:', error);
    // Return empty data
    return {
      data: [],
      pagination: {
        page: filters.page || 1,
        page_size: filters.page_size || 10,
        total: 0,
        total_pages: 0
      }
    };
  }
};

export const updateRiderScheduledRide = async (scheduledRideId: string, update: ScheduledRideUpdate): Promise<ScheduledRide> => {
  try {
    const response = await instance.patch(`/riders/me/scheduled-rides/${scheduledRideId}`, update);
    return response.data;
  } catch (error: any) {
    console.error('Failed to update scheduled ride:', error);
    throw new Error(error.response?.data?.message || 'Failed to update scheduled ride');
  }
};

export const deleteRiderScheduledRide = async (scheduledRideId: string): Promise<{ success: boolean; message: string }> => {
  try {
    await instance.delete(`/riders/me/scheduled-rides/${scheduledRideId}`);
    return { success: true, message: 'Scheduled ride cancelled successfully' };
  } catch (error: any) {
    console.error('Failed to delete scheduled ride:', error);
    return { 
      success: false, 
      message: error.response?.data?.message || 'Failed to cancel scheduled ride' 
    };
  }
};

// ===== BUSINESS ENDPOINTS =====

export const createBusinessScheduledRide = async (orgId: string, request: ScheduledRideRequest): Promise<ScheduledRide> => {
  try {
    const response = await instance.post(`/businesses/${orgId}/scheduled-rides`, request);
    return response.data;
  } catch (error: any) {
    console.error('Failed to create business scheduled ride:', error);
    throw new Error(error.response?.data?.message || 'Failed to create scheduled ride');
  }
};

export const getBusinessScheduledRides = async (orgId: string, filters: ScheduledRideFilters = {}): Promise<ScheduledRidesResponse> => {
  try {
    const params = new URLSearchParams();
    
    if (filters.status) params.append('status', filters.status);
    if (filters.from) params.append('from', filters.from);
    if (filters.to) params.append('to', filters.to);
    if (filters.page) params.append('page', filters.page.toString());
    if (filters.page_size) params.append('page_size', filters.page_size.toString());

    const response = await instance.get(`/businesses/${orgId}/scheduled-rides?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch business scheduled rides:', error);
    // Return empty data
    return {
      data: [],
      pagination: {
        page: filters.page || 1,
        page_size: filters.page_size || 10,
        total: 0,
        total_pages: 0
      }
    };
  }
};

export const updateBusinessScheduledRide = async (orgId: string, scheduledRideId: string, update: ScheduledRideUpdate): Promise<ScheduledRide> => {
  try {
    const response = await instance.patch(`/businesses/${orgId}/scheduled-rides/${scheduledRideId}`, update);
    return response.data;
  } catch (error: any) {
    console.error('Failed to update business scheduled ride:', error);
    throw new Error(error.response?.data?.message || 'Failed to update scheduled ride');
  }
};

export const deleteBusinessScheduledRide = async (orgId: string, scheduledRideId: string): Promise<{ success: boolean; message: string }> => {
  try {
    await instance.delete(`/businesses/${orgId}/scheduled-rides/${scheduledRideId}`);
    return { success: true, message: 'Scheduled ride cancelled successfully' };
  } catch (error: any) {
    console.error('Failed to delete business scheduled ride:', error);
    return { 
      success: false, 
      message: error.response?.data?.message || 'Failed to cancel scheduled ride' 
    };
  }
};
