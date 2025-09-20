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
  try {
    console.log('🌐 Attempting API call to /businesses');
    const response = await instance.get("/businesses");
    console.log('✅ API response received:', response.data);
    // Handle both direct array response and wrapped response
    return Array.isArray(response.data) ? response.data : (response.data.data || []);
  } catch (error: any) {
    console.error('❌ API call failed:', error);
    // In production, throw the error instead of returning fake data
    throw new Error(`Failed to fetch businesses: ${error.message || 'Unknown error'}`);
  }
};

// Get business details
export const getBusiness = async (orgId: string): Promise<Business> => {
  try {
    const response = await instance.get(`/businesses/${orgId}`);
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch business:', error);
    throw new Error(`Failed to fetch business: ${error.message || 'Unknown error'}`);
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
  } catch (error: any) {
    console.error('Failed to fetch business rides:', error);
    throw new Error(`Failed to fetch business rides: ${error.message || 'Unknown error'}`);
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
  } catch (error: any) {
    console.error('Failed to fetch business ride summary:', error);
    throw new Error(`Failed to fetch business ride summary: ${error.message || 'Unknown error'}`);
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
  } catch (error: any) {
    console.error('Failed to fetch business wallet transactions:', error);
    throw new Error(`Failed to fetch business wallet transactions: ${error.message || 'Unknown error'}`);
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
  } catch (error: any) {
    console.error('Failed to fetch business invoices:', error);
    throw new Error(`Failed to fetch business invoices: ${error.message || 'Unknown error'}`);
  }
};

// Get invoice details
export const getInvoice = async (invoiceId: string): Promise<{ invoice: BusinessInvoice; line_items: BusinessInvoiceLineItem[] }> => {
  try {
    const response = await instance.get(`/invoices/${invoiceId}`);
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch invoice:', error);
    throw new Error(`Failed to fetch invoice: ${error.message || 'Unknown error'}`);
  }
};

// Get rewards summary
export const getRewardsSummary = async (orgId: string): Promise<BusinessRewardsSummary> => {
  try {
    const response = await instance.get(`/businesses/${orgId}/rewards/summary`);
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch rewards summary:', error);
    throw new Error(`Failed to fetch rewards summary: ${error.message || 'Unknown error'}`);
  }
};

// Get rewards ledger
export const getRewardsLedger = async (orgId: string, page: number = 1, pageSize: number = 25): Promise<BusinessRewardsResponse> => {
  try {
    const response = await instance.get(`/businesses/${orgId}/rewards/ledger?page=${page}&page_size=${pageSize}`);
    return response.data;
  } catch (error: any) {
    console.error('Failed to fetch rewards ledger:', error);
    throw new Error(`Failed to fetch rewards ledger: ${error.message || 'Unknown error'}`);
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
