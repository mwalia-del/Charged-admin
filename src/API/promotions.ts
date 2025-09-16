import { Promotion, PromotionSummary, PromotionRedemption, PromotionFilters } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://api.charged.autos';

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Convert server promotion format to frontend format
const convertServerPromotion = (serverPromo: any): Promotion => {
  return {
    id: serverPromo.id.toString(),
    title: serverPromo.title,
    description: serverPromo.description || '',
    audience: serverPromo.audience || 'rider', // Use server audience field
    reward_type: serverPromo.discount_type === 'percentage' ? 'percent_discount' : 'fixed_discount',
    value_cents: serverPromo.discount_type === 'fixed_amount' ? Math.round(serverPromo.discount_value * 100) : undefined,
    percent_off: serverPromo.discount_type === 'percentage' ? serverPromo.discount_value : undefined,
    start_at: serverPromo.created_at,
    end_at: serverPromo.expires_at || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    priority: 0, // Default since server doesn't have this field
    is_active: serverPromo.is_active,
    max_uses_per_user: undefined, // Default since server doesn't have this field
    global_cap: undefined, // Default since server doesn't have this field
    code: serverPromo.code || '',
    criteria_json: {}, // Default since server doesn't have this field
    created_by: 'admin', // Default since server doesn't have this field
    updated_by: 'admin', // Default since server doesn't have this field
    created_at: serverPromo.created_at,
    updated_at: serverPromo.updated_at,
    redemptions_count: 0, // Default since server doesn't have this field
    global_redemptions_count: 0, // Default since server doesn't have this field
  };
};

// Convert frontend promotion format to server format
const convertToServerPromotion = (frontendPromo: any) => {
  return {
    title: frontendPromo.title,
    description: frontendPromo.description || '',
    discount_type: frontendPromo.reward_type === 'percent_discount' ? 'percentage' : 'fixed_amount',
    discount_value: frontendPromo.reward_type === 'percent_discount' 
      ? frontendPromo.percent_off 
      : (frontendPromo.value_cents ? frontendPromo.value_cents / 100 : 0),
    code: frontendPromo.code || '',
    expires_at: frontendPromo.end_at,
    is_active: frontendPromo.is_active || false,
  };
};

// Get all promotions with optional filters
export const listPromotions = async (filters: PromotionFilters = {}): Promise<{ data: Promotion[]; total: number }> => {
  try {
    const queryParams = new URLSearchParams();
    
    if (filters.audience) {
      queryParams.append('audience', filters.audience);
    }
    
    if (filters.status) {
      queryParams.append('status', filters.status);
    }
    
    if (filters.search) {
      queryParams.append('search', filters.search);
    }

    const url = `${API_BASE_URL}/promotions${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await handleResponse(response);
    const serverPromotions = result.data || result;
    const convertedPromotions = serverPromotions.map(convertServerPromotion);
    
    return {
      data: convertedPromotions,
      total: convertedPromotions.length
    };
  } catch (error) {
    console.error('Error fetching promotions:', error);
    throw error;
  }
};

// Get promotion by ID
export const getPromotion = async (id: string): Promise<Promotion> => {
  try {
    const response = await fetch(`${API_BASE_URL}/promotions/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${getAuthToken()}`,
      },
    });

    const result = await handleResponse(response);
    return result.data || result;
  } catch (error) {
    console.error('Error fetching promotion:', error);
    throw error;
  }
};

// Create new promotion
export const createPromotion = async (promotion: Omit<Promotion, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by' | 'redemptions_count' | 'global_redemptions_count'>): Promise<Promotion> => {
  try {
    const serverPromotion = convertToServerPromotion(promotion);
    const response = await fetch(`${API_BASE_URL}/promotions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(serverPromotion),
    });

    const result = await handleResponse(response);
    return convertServerPromotion(result.data || result);
  } catch (error) {
    console.error('Error creating promotion:', error);
    throw error;
  }
};

// Update promotion
export const updatePromotion = async (id: string, promotion: Partial<Promotion>): Promise<Promotion> => {
  try {
    const serverPromotion = convertToServerPromotion(promotion);
    const response = await fetch(`${API_BASE_URL}/promotions/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(serverPromotion),
    });

    const result = await handleResponse(response);
    return convertServerPromotion(result.data || result);
  } catch (error) {
    console.error('Error updating promotion:', error);
    throw error;
  }
};

// Delete promotion
export const deletePromotion = async (id: string): Promise<void> => {
  try {
    const response = await fetch(`${API_BASE_URL}/promotions/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    await handleResponse(response);
  } catch (error) {
    console.error('Error deleting promotion:', error);
    throw error;
  }
};

// Activate promotion
export const activatePromotion = async (id: string): Promise<Promotion> => {
  try {
    const response = await fetch(`${API_BASE_URL}/promotions/${id}/activate`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await handleResponse(response);
    return convertServerPromotion(result.data || result);
  } catch (error) {
    console.error('Error activating promotion:', error);
    throw error;
  }
};

// Deactivate promotion
export const deactivatePromotion = async (id: string): Promise<Promotion> => {
  try {
    const response = await fetch(`${API_BASE_URL}/promotions/${id}/deactivate`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await handleResponse(response);
    return convertServerPromotion(result.data || result);
  } catch (error) {
    console.error('Error deactivating promotion:', error);
    throw error;
  }
};

// Get active promotions for specific audience
export const getActivePromotions = async (audience?: string): Promise<Promotion[]> => {
  try {
    const queryParams = new URLSearchParams();
    if (audience) {
      queryParams.append('audience', audience);
    }
    
    const url = `${API_BASE_URL}/promotions/active${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await handleResponse(response);
    const serverPromotions = result.data || result;
    return serverPromotions.map(convertServerPromotion);
  } catch (error) {
    console.error('Error fetching active promotions:', error);
    throw error;
  }
};

// Get promotions summary
export const getPromotionsSummary = async (audience?: string): Promise<PromotionSummary> => {
  try {
    const queryParams = new URLSearchParams();
    if (audience) {
      queryParams.append('audience', audience);
    }
    
    const url = `${API_BASE_URL}/promotions/stats/summary${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await handleResponse(response);
    const summaryData = result.data || result;
    
    // If we have audience-specific data, return it directly
    if (audience && summaryData.length > 0) {
      const data = summaryData[0];
      return {
        total_promotions: parseInt(data.total_promotions) || 0,
        active_promotions: parseInt(data.active_promotions) || 0,
        scheduled_promotions: 0,
        ended_promotions: (parseInt(data.total_promotions) || 0) - (parseInt(data.active_promotions) || 0),
        total_redemptions: 0,
        total_value_cents: 0,
      };
    }
    
    // For all audiences, calculate totals
    const total = summaryData.reduce((sum: number, item: any) => sum + (parseInt(item.total_promotions) || 0), 0);
    const active = summaryData.reduce((sum: number, item: any) => sum + (parseInt(item.active_promotions) || 0), 0);
    
    return {
      total_promotions: total,
      active_promotions: active,
      scheduled_promotions: 0,
      ended_promotions: total - active,
      total_redemptions: 0,
      total_value_cents: 0,
    };
  } catch (error) {
    console.error('Error fetching promotions summary:', error);
    throw error;
  }
};

// Get promotion redemptions
export const getPromotionRedemptions = async (promotionId: string, page: number = 1, pageSize: number = 20): Promise<{ data: PromotionRedemption[]; total: number }> => {
  try {
    const response = await fetch(`${API_BASE_URL}/promotions/${promotionId}/redemptions?page=${page}&page_size=${pageSize}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${getAuthToken()}`,
      },
    });

    const result = await handleResponse(response);
    return {
      data: result.data || result,
      total: result.total || result.data?.length || 0
    };
  } catch (error) {
    console.error('Error fetching promotion redemptions:', error);
    // Fallback to mock data for development
    const { generateMockPromotionRedemptions } = await import('./mockPromotionsData');
    return {
      data: generateMockPromotionRedemptions(promotionId),
      total: 20
    };
  }
};