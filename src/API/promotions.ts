import axios from 'axios';
import { 
  Promotion, 
  PromotionFilters, 
  PromotionSummary, 
  PromotionsResponse, 
  PromotionRedemption,
  PromotionPreview,
  PromotionPreviewRequest,
  ApplyPromotionRequest,
  ApplyPromotionResponse
} from '../types';

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

// Admin CRUD operations
export const listPromotions = async (filters: PromotionFilters = {}): Promise<PromotionsResponse> => {
  const params = new URLSearchParams();
  
  if (filters.audience) params.append('audience', filters.audience);
  if (filters.status) params.append('status', filters.status);
  if (filters.from) params.append('from', filters.from);
  if (filters.to) params.append('to', filters.to);
  if (filters.search) params.append('q', filters.search);
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.page_size) params.append('page_size', filters.page_size.toString());

  const response = await instance.get(`/admin/promotions?${params.toString()}`);
  return response.data;
};

export const getPromotion = async (id: string): Promise<Promotion> => {
  const response = await instance.get(`/admin/promotions/${id}`);
  return response.data;
};

export const createPromotion = async (promotion: Partial<Promotion>): Promise<Promotion> => {
  const response = await instance.post('/admin/promotions', promotion);
  return response.data;
};

export const updatePromotion = async (id: string, promotion: Partial<Promotion>): Promise<Promotion> => {
  const response = await instance.patch(`/admin/promotions/${id}`, promotion);
  return response.data;
};

export const activatePromotion = async (id: string): Promise<Promotion> => {
  const response = await instance.post(`/admin/promotions/${id}/activate`);
  return response.data;
};

export const deactivatePromotion = async (id: string): Promise<Promotion> => {
  const response = await instance.post(`/admin/promotions/${id}/deactivate`);
  return response.data;
};

export const deletePromotion = async (id: string): Promise<void> => {
  await instance.delete(`/admin/promotions/${id}`);
};

export const getPromotionRedemptions = async (id: string, page: number = 1, pageSize: number = 20): Promise<{ redemptions: PromotionRedemption[]; pagination: any }> => {
  const response = await instance.get(`/admin/promotions/${id}/redemptions?page=${page}&page_size=${pageSize}`);
  return response.data;
};

export const previewPromotion = async (id: string, previewRequest: PromotionPreviewRequest): Promise<PromotionPreview> => {
  const response = await instance.post(`/admin/promotions/${id}/preview`, previewRequest);
  return response.data;
};

export const getPromotionsSummary = async (filters: PromotionFilters = {}): Promise<PromotionSummary> => {
  const params = new URLSearchParams();
  
  if (filters.audience) params.append('audience', filters.audience);
  if (filters.status) params.append('status', filters.status);
  if (filters.from) params.append('from', filters.from);
  if (filters.to) params.append('to', filters.to);

  const response = await instance.get(`/admin/promotions/summary?${params.toString()}`);
  return response.data;
};

// Client fetch operations
export const getRiderActivePromotions = async (now?: string, region?: string, appVersion?: string): Promise<Promotion[]> => {
  const params = new URLSearchParams();
  if (now) params.append('now', now);
  if (region) params.append('region', region);
  if (appVersion) params.append('app_version', appVersion);

  const response = await instance.get(`/riders/me/promotions/active?${params.toString()}`);
  return response.data;
};

export const getDriverActivePromotions = async (now?: string, region?: string, appVersion?: string): Promise<Promotion[]> => {
  const params = new URLSearchParams();
  if (now) params.append('now', now);
  if (region) params.append('region', region);
  if (appVersion) params.append('app_version', appVersion);

  const response = await instance.get(`/drivers/me/promotions/active?${params.toString()}`);
  return response.data;
};

export const getBusinessActivePromotions = async (orgId: string, now?: string, region?: string, appVersion?: string): Promise<Promotion[]> => {
  const params = new URLSearchParams();
  if (now) params.append('now', now);
  if (region) params.append('region', region);
  if (appVersion) params.append('app_version', appVersion);

  const response = await instance.get(`/businesses/${orgId}/promotions/active?${params.toString()}`);
  return response.data;
};

// Redemption operations
export const applyPromotionToRide = async (rideId: string, request: ApplyPromotionRequest): Promise<ApplyPromotionResponse> => {
  const response = await instance.post(`/rides/${rideId}/apply-promotion`, request);
  return response.data;
};
