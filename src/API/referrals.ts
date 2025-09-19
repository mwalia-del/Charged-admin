import axios from "axios";
import {
  ReferralSummary,
  ReferralFilters,
  ReferralIssuancesResponse,
  ReferralClaimResponse,
  VoidReferralResponse,
  ReferralWallet,
  ReferralWalletTransaction,
  ReferralWalletResponse,
} from "../types";
// Removed unifiedMockData imports - using real API only

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

    const response = await instance.get(`/referral/admin?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch referral issuances:', error);
    throw error;
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
    console.error('Failed to fetch referral summary:', error);
    throw error;
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
    console.error('Failed to void referral:', error);
    throw error;
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
    console.error('Failed to claim referral:', error);
    throw error;
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
    console.error('Failed to fetch driver referral issuances:', error);
    throw error;
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
    console.error('Failed to fetch referral summary:', error);
    throw error;
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
    console.error('Failed to fetch rider referral issuances:', error);
    throw error;
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
    console.error('Failed to fetch referral summary:', error);
    throw error;
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
    console.error('Failed to export referral data:', error);
    throw error;
  }
};

// ===== WALLET FUNCTIONS =====

// Get driver referral wallet
export const getDriverReferralWallet = async (driverId: string): Promise<ReferralWalletResponse> => {
  try {
    const response = await instance.get(`/drivers/${driverId}/referral-wallet`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch driver referral wallet:', error);
    throw error;
  }
};

// Get rider referral wallet
export const getRiderReferralWallet = async (riderId: string): Promise<ReferralWalletResponse> => {
  try {
    const response = await instance.get(`/riders/${riderId}/referral-wallet`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch rider referral wallet:', error);
    throw error;
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
    console.error('Failed to fetch driver referral wallet transactions:', error);
    throw error;
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
    console.error('Failed to fetch rider referral wallet transactions:', error);
    throw error;
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
    console.error('Failed to request referral payout:', error);
    throw error;
  }
};

// Get driver referral details by user ID (Admin)
export const getDriverReferralDetails = async (userId: string): Promise<any> => {
  try {
    const response = await instance.get(`/admin/referral/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch driver referral details:', error);
    throw error;
  }
};

// Get driver referral statistics (Admin)
export const getDriverReferralStats = async (userId: string): Promise<any> => {
  try {
    const response = await instance.get(`/admin/referral/stats/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch driver referral stats:', error);
    throw error;
  }
};

// Get driver referral tier information (Admin)
export const getDriverReferralTier = async (userId: string): Promise<any> => {
  try {
    const response = await instance.get(`/admin/referral/tier/${userId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch driver referral tier:', error);
    throw error;
  }
};

// Admin: Get all referral wallets summary
export const getAllReferralWallets = async (): Promise<{ drivers: ReferralWallet[]; riders: ReferralWallet[] }> => {
  try {
    const response = await instance.get('/admin/referral-wallets');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch all referral wallets:', error);
    throw error;
  }
};
