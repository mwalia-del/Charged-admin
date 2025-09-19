import axios from "axios";
import {
  Business,
  BusinessRideSummary,
  BusinessInvoice,
  BusinessInvoiceLineItem,
  BusinessRewardsSummary,
  BusinessFilters,
  BusinessRidesResponse,
  BusinessWalletResponse,
  BusinessInvoicesResponse,
  BusinessRewardsResponse,
} from "../types";
import { generateMockBusinesses, generateMockBusinessRides, generateMockBusinessWalletTransactions, generateMockBusinessInvoices, generateMockBusinessRewards } from "./mockBusinessData";

const instance = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:3001",
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

// Get business list
export const getBusinessList = async (): Promise<Business[]> => {
  // For development, always use mock data
  if (process.env.NODE_ENV === 'development') {
    console.log('🎭 Development mode: Using mock data');
    const mockData = generateMockBusinesses(5);
    console.log('🎭 Generated mock data:', mockData.length, 'businesses');
    return mockData;
  }

  try {
    console.log('🌐 Attempting API call to /businesses');
    const response = await instance.get("/businesses");
    console.log('✅ API response received:', response.data);
    // Handle both direct array response and wrapped response
    return Array.isArray(response.data) ? response.data : (response.data.data || []);
  } catch (error: any) {
    // SECURITY FIX: Don't fallback to mock data in production
    console.error('❌ API call failed:', error);
    if (process.env.NODE_ENV === 'development' && process.env.REACT_APP_USE_MOCK_DATA === 'true') {
      console.log('🎭 Development mode: Using mock data fallback');
      const mockData = generateMockBusinesses(5);
      return mockData;
    }
    // In production, throw the error instead of returning fake data
    throw new Error(`Failed to fetch businesses: ${error.message || 'Unknown error'}`);
  }
};

// Get business details
export const getBusiness = async (orgId: string): Promise<Business> => {
  try {
    const response = await instance.get(`/businesses/${orgId}`);
    return response.data;
  } catch (error) {
    // Fallback to mock data for development
    console.warn('API call failed, using mock data:', error);
    const mockBusinesses = generateMockBusinesses(1);
    return { ...mockBusinesses[0], org_id: orgId };
  }
};

// Set business enrollment mode
export const setEnrollment = async (orgId: string, mode: "invoice" | "credit"): Promise<{ success: boolean }> => {
  try {
    const response = await instance.post(`/businesses/${orgId}/enrollment`, { mode });
    return response.data;
  } catch (error) {
    // Fallback for development
    console.warn('API call failed, using mock response:', error);
    return { success: true };
  }
};

// Get business rides
export const getBusinessRides = async (orgId: string, filters: BusinessFilters): Promise<BusinessRidesResponse> => {
  try {
    const params = new URLSearchParams();
    
    if (filters.range) params.append("range", filters.range);
    if (filters.start_date) params.append("start_date", filters.start_date);
    if (filters.end_date) params.append("end_date", filters.end_date);
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.page_size) params.append("page_size", filters.page_size.toString());

    const response = await instance.get(`/businesses/${orgId}/rides?${params.toString()}`);
    return response.data;
  } catch (error) {
    // Fallback to mock data for development
    console.warn('API call failed, using mock data:', error);
    const mockRides = generateMockBusinessRides(50);
    const page = filters.page || 1;
    const pageSize = filters.page_size || 25;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    
    return {
      rows: mockRides.slice(startIndex, endIndex),
      pagination: {
        page: page,
        page_size: pageSize,
        total: mockRides.length,
        total_pages: Math.ceil(mockRides.length / pageSize)
      }
    };
  }
};

// Get business ride summary
export const getBusinessRideSummary = async (orgId: string, filters: BusinessFilters): Promise<BusinessRideSummary> => {
  try {
    const params = new URLSearchParams();
    
    if (filters.range) params.append("range", filters.range);
    if (filters.start_date) params.append("start_date", filters.start_date);
    if (filters.end_date) params.append("end_date", filters.end_date);

    const response = await instance.get(`/businesses/${orgId}/rides/summary?${params.toString()}`);
    return response.data;
  } catch (error) {
    // Fallback to mock data for development
    console.warn('API call failed, using mock data:', error);
    const mockRides = generateMockBusinessRides(50);
    const totalBillable = mockRides.reduce((sum, ride) => sum + ride.billable_amount_cents, 0);
    
    return {
      total_rides: mockRides.length,
      total_billable_cents: totalBillable,
      by_driver: [
        { driver_id: "driver_1", driver_name: "Driver 1", total_cents: totalBillable / 2, count: 25 },
        { driver_id: "driver_2", driver_name: "Driver 2", total_cents: totalBillable / 2, count: 25 }
      ],
      by_day: mockRides.slice(0, 7).map((ride, index) => ({
        date: new Date(Date.now() - index * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        total_cents: ride.billable_amount_cents,
        count: 1
      }))
    };
  }
};

// Create credit purchase
export const createCreditPurchase = async (orgId: string, amountCents: number, currency: string = "CAD", idempotencyKey: string): Promise<{ ledger_entry_id: string; balance_cents: number }> => {
  try {
    const response = await instance.post(`/businesses/${orgId}/wallet/credit-purchase`, {
      amount_cents: amountCents,
      currency: currency
    }, {
      headers: {
        'Idempotency-Key': idempotencyKey
      }
    });
    return response.data;
  } catch (error) {
    // Fallback for development
    console.warn('API call failed, using mock response:', error);
    return {
      ledger_entry_id: `entry_${Date.now()}`,
      balance_cents: amountCents
    };
  }
};

// Get wallet transactions
export const getWalletTransactions = async (orgId: string, page: number = 1, pageSize: number = 25): Promise<BusinessWalletResponse> => {
  try {
    const response = await instance.get(`/businesses/${orgId}/wallet/transactions?page=${page}&page_size=${pageSize}`);
    return response.data;
  } catch (error) {
    // Fallback to mock data for development
    console.warn('API call failed, using mock data:', error);
    const mockTransactions = generateMockBusinessWalletTransactions(50);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    
    return {
      transactions: mockTransactions.slice(startIndex, endIndex),
      pagination: {
        page: page,
        page_size: pageSize,
        total: mockTransactions.length,
        total_pages: Math.ceil(mockTransactions.length / pageSize)
      }
    };
  }
};

// Generate invoice
export const generateInvoice = async (orgId: string, periodStart: string, periodEnd: string): Promise<{ invoice_id: string; period_start: string; period_end: string; total_cents: number; line_items_count: number }> => {
  try {
    const response = await instance.post(`/businesses/${orgId}/invoices/generate`, {
      period_start: periodStart,
      period_end: periodEnd
    });
    return response.data;
  } catch (error) {
    // Fallback for development
    console.warn('API call failed, using mock response:', error);
    return {
      invoice_id: `inv_${Date.now()}`,
      period_start: periodStart,
      period_end: periodEnd,
      total_cents: 50000, // $500.00
      line_items_count: 25
    };
  }
};

// Get business invoices
export const getBusinessInvoices = async (orgId: string, page: number = 1, pageSize: number = 25): Promise<BusinessInvoicesResponse> => {
  try {
    const response = await instance.get(`/businesses/${orgId}/invoices?page=${page}&page_size=${pageSize}`);
    return response.data;
  } catch (error) {
    // Fallback to mock data for development
    console.warn('API call failed, using mock data:', error);
    const mockInvoices = generateMockBusinessInvoices(20);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    
    return {
      invoices: mockInvoices.slice(startIndex, endIndex),
      pagination: {
        page: page,
        page_size: pageSize,
        total: mockInvoices.length,
        total_pages: Math.ceil(mockInvoices.length / pageSize)
      }
    };
  }
};

// Get invoice details
export const getInvoice = async (invoiceId: string): Promise<{ invoice: BusinessInvoice; line_items: BusinessInvoiceLineItem[] }> => {
  try {
    const response = await instance.get(`/invoices/${invoiceId}`);
    return response.data;
  } catch (error) {
    // Fallback to mock data for development
    console.warn('API call failed, using mock data:', error);
    const mockInvoices = generateMockBusinessInvoices(1);
    return {
      invoice: mockInvoices[0],
      line_items: Array.from({ length: 10 }, (_, i) => ({
        ride_id: `ride_${i + 1}`,
        ride_number: `R${(i + 1).toString().padStart(6, '0')}`,
        amount_cents: 2000 + (i * 100),
        completed_at: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString()
      }))
    };
  }
};

// Get rewards summary
export const getRewardsSummary = async (orgId: string): Promise<BusinessRewardsSummary> => {
  try {
    const response = await instance.get(`/businesses/${orgId}/rewards/summary`);
    return response.data;
  } catch (error) {
    // Fallback to mock data for development
    console.warn('API call failed, using mock data:', error);
    return {
      points: 1500,
      lifetime_points: 5000,
      last_earned_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    };
  }
};

// Get rewards ledger
export const getRewardsLedger = async (orgId: string, page: number = 1, pageSize: number = 25): Promise<BusinessRewardsResponse> => {
  try {
    const response = await instance.get(`/businesses/${orgId}/rewards/ledger?page=${page}&page_size=${pageSize}`);
    return response.data;
  } catch (error) {
    // Fallback to mock data for development
    console.warn('API call failed, using mock data:', error);
    const mockEntries = generateMockBusinessRewards(50);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    
    return {
      entries: mockEntries.slice(startIndex, endIndex),
      pagination: {
        page: page,
        page_size: pageSize,
        total: mockEntries.length,
        total_pages: Math.ceil(mockEntries.length / pageSize)
      }
    };
  }
};

// Adjust rewards
export const adjustRewards = async (orgId: string, deltaPoints: number, reason: string): Promise<{ success: boolean }> => {
  try {
    const response = await instance.post(`/businesses/${orgId}/rewards/adjust`, {
      delta_points: deltaPoints,
      reason: reason
    });
    return response.data;
  } catch (error) {
    // Fallback for development
    console.warn('API call failed, using mock response:', error);
    return { success: true };
  }
};
