// Centralized API configuration
const getApiBaseUrl = (): string => {
  // Check for environment variable first
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // Fallback to production URL
  return 'https://api.charged.autos';
};

export const API_BASE_URL = getApiBaseUrl();

// Environment detection
export const isDevelopment = process.env.NODE_ENV === 'development';
export const isProduction = process.env.NODE_ENV === 'production';

// Mock data configuration
export const shouldUseMockData = (): boolean => {
  return isDevelopment && process.env.REACT_APP_USE_MOCK_DATA === 'true';
};

// Logging configuration
export const shouldLogApiCalls = (): boolean => {
  return isDevelopment && process.env.REACT_APP_LOG_API_CALLS === 'true';
};

// API endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    ADMIN: '/admin',
    LOGIN: '/auth/login',
  },
  
  // Business
  BUSINESS: {
    LIST: '/businesses',
    DETAIL: (id: string) => `/businesses/${id}`,
  },
  
  // Drivers
  DRIVERS: {
    LIST: '/admin/getdrivers',
    DETAIL: (id: string) => `/ride/fetchdriver/${id}`,
    DOCS: (id: string) => `/admin/getdriverdocs/${id}`,
    UPDATE_STATUS: (id: string) => `/admin/updatestatus/${id}`,
  },
  
  // Riders
  RIDERS: {
    LIST: '/admin/getriders',
    DETAIL: (id: string) => `/ride/fetchrider/${id}`,
  },
  
  // Rides
  RIDES: {
    RECENT: '/admin/ride/fetchlatest',
    BY_USER: (userId: number) => `/admin/ride/userrides/${userId}`,
    DETAIL: (rideId: string) => `/admin/ride/fetchride/${rideId}`,
  },
  
  // Dashboard
  DASHBOARD: {
    STATS: '/admin/dashboardstats',
  },
  
  // Rewards
  REWARDS: {
    LIST: '/admin/rewards',
    CREATE: '/admin/rewards',
    DELETE: (id: number) => `/admin/rewards/${id}`,
    POINTS: (userId: number) => `/admin/rewardpoints/${userId}`,
  },
  
  // Documents
  DOCUMENTS: {
    TYPES: '/admin/documenttypes',
    CREATE_TYPE: '/admin/documenttypes',
    UPDATE_TYPE: (id: string) => `/admin/documenttypes/${id}`,
    DELETE_TYPE: (id: string) => `/admin/documenttypes/${id}`,
  },
  
  // Messages
  MESSAGES: {
    LIST: '/admin/messages',
    DETAIL: (id: string) => `/admin/messages/${id}`,
    CREATE: '/admin/messages',
    UPDATE: (id: string) => `/admin/messages/${id}`,
    DELETE: (id: string) => `/admin/messages/${id}`,
    PUBLISH: (id: string) => `/admin/messages/${id}/publish`,
    ARCHIVE: (id: string) => `/admin/messages/${id}/archive`,
    STATS: '/admin/messages/stats',
    RECIPIENTS: (id: string) => `/admin/messages/${id}/recipients`,
  },
  
  // Referrals
  REFERRALS: {
    ISSUANCES: '/admin/referrals/issuances',
    SUMMARY: '/admin/referrals/summary',
    WALLET: '/admin/referrals/wallet',
    WALLET_TRANSACTIONS: '/admin/referrals/wallet/transactions',
  },
  
  // Tips
  TIPS: {
    LIST: '/admin/tips',
    SUMMARY: '/admin/tips/summary',
    DRIVER: (driverId: string) => `/admin/tips/driver/${driverId}`,
    RIDER: (riderId: string) => `/admin/tips/rider/${riderId}`,
  },
  
  // Scheduled Rides
  SCHEDULED_RIDES: {
    LIST: '/admin/scheduled-rides',
    SUMMARY: '/admin/scheduled-rides/summary',
    DETAIL: (id: string) => `/admin/scheduled-rides/${id}`,
    ASSIGN_DRIVER: (id: string) => `/admin/scheduled-rides/${id}/assign-driver`,
    CANCEL: (id: string) => `/admin/scheduled-rides/${id}/cancel`,
    EXPORT: '/admin/scheduled-rides/export',
  },
  
  // Scheduled Rides (Legacy - for backward compatibility)
  SCHEDULED: {
    LIST: '/admin/scheduled-rides',
    DETAIL: (id: string) => `/admin/scheduled-rides/${id}`,
  },
  
  // Promotions
  PROMOTIONS: {
    LIST: '/promotions/admin',
    DETAIL: (id: string) => `/promotions/admin/${id}`,
    CREATE: '/promotions/admin',
    UPDATE: (id: string) => `/promotions/admin/${id}`,
    DELETE: (id: string) => `/promotions/admin/${id}`,
  },
  
  // Pricing
  PRICING: {
    RIDE_TYPES: '/ridetype',
    UPDATE_RIDE_TYPE: (id: number) => `/ridetype/${id}`,
  },
  
  // Wallet
  WALLET: {
    BALANCE: '/wallet/balance',
    TRANSACTIONS: '/wallet/transactions',
    PAYOUTS: '/wallet/payouts',
    REQUEST_PAYOUT: '/wallet/payout',
  },
} as const;

// Helper function to build full URLs
export const buildApiUrl = (endpoint: string): string => {
  return `${API_BASE_URL}${endpoint}`;
};

// Helper function to get query string from params
export const buildQueryString = (params: Record<string, any>): string => {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, value.toString());
    }
  });
  
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
};
