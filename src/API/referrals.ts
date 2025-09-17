import axios from "axios";
import {
  ReferralSummary,
  ReferralFilters,
  ReferralIssuancesResponse,
  ReferralClaimResponse,
  VoidReferralResponse,
  ReferralIssuance,
  ReferralWallet,
  ReferralWalletTransaction,
  ReferralWalletResponse,
} from "../types";
import { 
  getUnifiedReferralIssuances,
  getUnifiedReferralSummary,
  getUnifiedReferralWallet,
  getUnifiedReferralWalletTransactions,
  getUnifiedDrivers,
  getUnifiedRiders
} from "./unifiedMockData";

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

// Get referral issuances (Admin)
export const getIssuances = async (filters: ReferralFilters): Promise<ReferralIssuancesResponse> => {
  try {
    const params = new URLSearchParams();
    
    if (filters.range) params.append("range", filters.range);
    if (filters.start_date) params.append("start_date", filters.start_date);
    if (filters.end_date) params.append("end_date", filters.end_date);
    if (filters.actor_type) params.append("actor_type", filters.actor_type);
    if (filters.actor_id) params.append("actor_id", filters.actor_id);
    if (filters.referral_id) params.append("referral_id", filters.referral_id);
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.page_size) params.append("page_size", filters.page_size.toString());

    const response = await instance.get(`/admin/referrals/issuances?${params.toString()}`);
    return response.data;
  } catch (error) {
    // Fallback to unified mock data for development
    console.warn('API call failed, using unified mock data:', error);
    let mockIssuances = getUnifiedReferralIssuances();
    
    // Apply referral_id filter if provided
    if (filters.referral_id) {
      const referralId = filters.referral_id.toUpperCase();
      mockIssuances = mockIssuances.filter(issuance => 
        issuance.referrer_id === referralId || 
        issuance.referred_rider_id === referralId ||
        issuance.issuance_id.includes(referralId)
      );
    }
    
    const page = filters.page || 1;
    const pageSize = filters.page_size || 25;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    
    return {
      rows: mockIssuances.slice(startIndex, endIndex),
      pagination: {
        page: page,
        page_size: pageSize,
        total: mockIssuances.length,
        total_pages: Math.ceil(mockIssuances.length / pageSize)
      }
    };
  }
};

// Get referral summary (Admin)
export const getSummary = async (filters: ReferralFilters): Promise<ReferralSummary> => {
  try {
    const params = new URLSearchParams();
    
    if (filters.range) params.append("range", filters.range);
    if (filters.start_date) params.append("start_date", filters.start_date);
    if (filters.end_date) params.append("end_date", filters.end_date);
    if (filters.actor_type) params.append("actor_type", filters.actor_type);
    if (filters.actor_id) params.append("actor_id", filters.actor_id);
    if (filters.referral_id) params.append("referral_id", filters.referral_id);

    const response = await instance.get(`/admin/referrals/summary?${params.toString()}`);
    return response.data;
  } catch (error) {
    // Fallback to mock data for development
    console.warn('API call failed, using mock data:', error);
    return getUnifiedReferralSummary();
  }
};

// Void referral issuance (Admin)
export const voidIssuance = async (issuanceId: string, reason: string): Promise<VoidReferralResponse> => {
  try {
    const response = await instance.post(`/admin/referrals/issuances/${issuanceId}/void`, {
      reason: reason
    });
    return response.data;
  } catch (error) {
    // Fallback for development
    console.warn('API call failed, using mock response:', error);
    return { status: 'voided' };
  }
};

// Claim referral (Rider)
export const claimReferral = async (code: string): Promise<ReferralClaimResponse> => {
  try {
    const response = await instance.post('/referrals/claim', {
      code: code
    });
    return response.data;
  } catch (error) {
    // Fallback for development
    console.warn('API call failed, using mock response:', error);
    return {
      referred_rider_id: 'rider_mock',
      referrer_type: 'driver',
      referrer_id: 'driver_mock',
      created_at: new Date().toISOString()
    };
  }
};

// Get driver referral issuances
export const getDriverIssuances = async (filters: ReferralFilters): Promise<ReferralIssuancesResponse> => {
  try {
    const params = new URLSearchParams();
    
    if (filters.range) params.append("range", filters.range);
    if (filters.start_date) params.append("start_date", filters.start_date);
    if (filters.end_date) params.append("end_date", filters.end_date);
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.page_size) params.append("page_size", filters.page_size.toString());

    const response = await instance.get(`/drivers/me/referrals/issuances?${params.toString()}`);
    return response.data;
  } catch (error) {
    // Fallback to mock data for development
    console.warn('API call failed, using mock data:', error);
    const mockIssuances = getUnifiedReferralIssuances().filter((issuance: ReferralIssuance) => issuance.referrer_type === 'driver');
    const page = filters.page || 1;
    const pageSize = filters.page_size || 25;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    
    return {
      rows: mockIssuances.slice(startIndex, endIndex),
      pagination: {
        page: page,
        page_size: pageSize,
        total: mockIssuances.length,
        total_pages: Math.ceil(mockIssuances.length / pageSize)
      }
    };
  }
};

// Get driver referral summary
export const getDriverSummary = async (filters: ReferralFilters): Promise<ReferralSummary> => {
  try {
    const params = new URLSearchParams();
    
    if (filters.range) params.append("range", filters.range);
    if (filters.start_date) params.append("start_date", filters.start_date);
    if (filters.end_date) params.append("end_date", filters.end_date);

    const response = await instance.get(`/drivers/me/referrals/summary?${params.toString()}`);
    return response.data;
  } catch (error) {
    // Fallback to mock data for development
    console.warn('API call failed, using mock data:', error);
    return getUnifiedReferralSummary();
  }
};

// Get rider referral issuances
export const getRiderIssuances = async (filters: ReferralFilters): Promise<ReferralIssuancesResponse> => {
  try {
    const params = new URLSearchParams();
    
    if (filters.range) params.append("range", filters.range);
    if (filters.start_date) params.append("start_date", filters.start_date);
    if (filters.end_date) params.append("end_date", filters.end_date);
    if (filters.page) params.append("page", filters.page.toString());
    if (filters.page_size) params.append("page_size", filters.page_size.toString());

    const response = await instance.get(`/riders/me/referrals/issuances?${params.toString()}`);
    return response.data;
  } catch (error) {
    // Fallback to mock data for development
    console.warn('API call failed, using mock data:', error);
    const mockIssuances = getUnifiedReferralIssuances().filter((issuance: ReferralIssuance) => issuance.referrer_type === 'rider');
    const page = filters.page || 1;
    const pageSize = filters.page_size || 25;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    
    return {
      rows: mockIssuances.slice(startIndex, endIndex),
      pagination: {
        page: page,
        page_size: pageSize,
        total: mockIssuances.length,
        total_pages: Math.ceil(mockIssuances.length / pageSize)
      }
    };
  }
};

// Get rider referral summary
export const getRiderSummary = async (filters: ReferralFilters): Promise<ReferralSummary> => {
  try {
    const params = new URLSearchParams();
    
    if (filters.range) params.append("range", filters.range);
    if (filters.start_date) params.append("start_date", filters.start_date);
    if (filters.end_date) params.append("end_date", filters.end_date);

    const response = await instance.get(`/riders/me/referrals/summary?${params.toString()}`);
    return response.data;
  } catch (error) {
    // Fallback to mock data for development
    console.warn('API call failed, using mock data:', error);
    return getUnifiedReferralSummary();
  }
};

// Export referrals to CSV
export const exportReferralsToCSV = async (filters: ReferralFilters): Promise<Blob> => {
  try {
    const params = new URLSearchParams();
    
    if (filters.range) params.append("range", filters.range);
    if (filters.start_date) params.append("start_date", filters.start_date);
    if (filters.end_date) params.append("end_date", filters.end_date);
    if (filters.actor_type) params.append("actor_type", filters.actor_type);
    if (filters.actor_id) params.append("actor_id", filters.actor_id);

    const response = await instance.get(`/admin/referrals/issuances/export?${params.toString()}`, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error) {
    // Fallback for development - create a simple CSV
    console.warn('API call failed, creating mock CSV:', error);
    const mockIssuances = getUnifiedReferralIssuances();
    const csvContent = [
      'Date,Ride #,Referred Rider,Referrer Type,Referrer Name,Tier,Amount (CAD),Status,Issuance ID',
      ...mockIssuances.map((issuance: ReferralIssuance) => 
        `${issuance.created_at.split('T')[0]},${issuance.ride_number},${issuance.referred_rider_name},${issuance.referrer_type},${issuance.referrer_name},${issuance.tier},$${(issuance.amount_cents / 100).toFixed(2)},${issuance.status},${issuance.issuance_id}`
      )
    ].join('\n');
    
    return new Blob([csvContent], { type: 'text/csv' });
  }
};

// ===== WALLET FUNCTIONS =====

// Get driver referral wallet
export const getDriverReferralWallet = async (driverId: string): Promise<ReferralWalletResponse> => {
  try {
    const response = await instance.get(`/drivers/${driverId}/referral-wallet`);
    return response.data;
  } catch (error) {
    console.warn('API call failed, using mock data:', error);
    const wallet = getUnifiedReferralWallet(driverId);
    const defaultWallet = { user_id: driverId, user_type: 'driver' as const, total_earnings_cents: 0, total_referral_credits_cents: 0, available_balance_cents: 0, pending_balance_cents: 0, currency: 'CAD', last_updated: new Date().toISOString() };
    return { 
      wallet: wallet || defaultWallet,
      recent_transactions: [],
      pagination: { page: 1, page_size: 10, total: 0, total_pages: 0 }
    };
  }
};

// Get rider referral wallet
export const getRiderReferralWallet = async (riderId: string): Promise<ReferralWalletResponse> => {
  try {
    const response = await instance.get(`/riders/${riderId}/referral-wallet`);
    return response.data;
  } catch (error) {
    console.warn('API call failed, using mock data:', error);
    const wallet = getUnifiedReferralWallet(riderId);
    const defaultWallet = { user_id: riderId, user_type: 'rider' as const, total_earnings_cents: 0, total_referral_credits_cents: 0, available_balance_cents: 0, pending_balance_cents: 0, currency: 'CAD', last_updated: new Date().toISOString() };
    return { 
      wallet: wallet || defaultWallet,
      recent_transactions: [],
      pagination: { page: 1, page_size: 10, total: 0, total_pages: 0 }
    };
  }
};

// Get driver referral wallet transactions
export const getDriverReferralWalletTransactions = async (
  driverId: string, 
  page: number = 1, 
  pageSize: number = 10
): Promise<{ transactions: ReferralWalletTransaction[]; pagination: any }> => {
  try {
    const response = await instance.get(`/drivers/${driverId}/referral-wallet/transactions?page=${page}&page_size=${pageSize}`);
    return response.data;
  } catch (error) {
    console.warn('API call failed, using mock data:', error);
    const mockTransactions = getUnifiedReferralWalletTransactions(driverId);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    
    return {
      transactions: mockTransactions.slice(startIndex, endIndex),
      pagination: {
        page,
        page_size: pageSize,
        total: mockTransactions.length,
        total_pages: Math.ceil(mockTransactions.length / pageSize)
      }
    };
  }
};

// Get rider referral wallet transactions
export const getRiderReferralWalletTransactions = async (
  riderId: string, 
  page: number = 1, 
  pageSize: number = 10
): Promise<{ transactions: ReferralWalletTransaction[]; pagination: any }> => {
  try {
    const response = await instance.get(`/riders/${riderId}/referral-wallet/transactions?page=${page}&page_size=${pageSize}`);
    return response.data;
  } catch (error) {
    console.warn('API call failed, using mock data:', error);
    const mockTransactions = getUnifiedReferralWalletTransactions(riderId);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    
    return {
      transactions: mockTransactions.slice(startIndex, endIndex),
      pagination: {
        page,
        page_size: pageSize,
        total: mockTransactions.length,
        total_pages: Math.ceil(mockTransactions.length / pageSize)
      }
    };
  }
};

// Request payout (Driver only)
export const requestReferralPayout = async (driverId: string, amountCents: number): Promise<{ success: boolean; payoutId?: string; message: string }> => {
  try {
    const response = await instance.post(`/drivers/${driverId}/referral-wallet/payout`, {
      amount_cents: amountCents
    });
    return response.data;
  } catch (error) {
    console.warn('API call failed, using mock response:', error);
    return {
      success: true,
      payoutId: `payout_${Date.now()}`,
      message: 'Payout request submitted successfully'
    };
  }
};

// Admin: Get all referral wallets summary
export const getAllReferralWallets = async (): Promise<{ drivers: ReferralWallet[]; riders: ReferralWallet[] }> => {
  try {
    const response = await instance.get('/admin/referral-wallets');
    return response.data;
  } catch (error) {
    console.warn('API call failed, using mock data:', error);
    return {
      drivers: getUnifiedDrivers().map((driver: any) => getUnifiedReferralWallet(driver.id)).filter((wallet): wallet is ReferralWallet => wallet !== undefined),
      riders: getUnifiedRiders().map((rider: any) => getUnifiedReferralWallet(rider.id)).filter((wallet): wallet is ReferralWallet => wallet !== undefined)
    };
  }
};
