import { Promotion, PromotionSummary, PromotionRedemption, PromotionFilters } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://api.charged.autos';

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    console.error('❌ API Error Response:', {
      status: response.status,
      statusText: response.statusText,
      errorData
    });
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }
  return response.json();
};

// Convert server promotion format to frontend format
const convertServerPromotion = (serverPromo: any): Promotion => {
  return {
    id: serverPromo.id.toString(),
    title: serverPromo.title, // Backend uses 'title'
    description: serverPromo.description || '',
    audience: serverPromo.audience || 'rider',
    reward_type: serverPromo.discount_type || serverPromo.reward_type, // Backend database ACTUALLY returns 'discount_type' (map to 'reward_type')
    value_cents: serverPromo.value_cents || undefined,
    percent_off: serverPromo.percent_off || undefined,
    start_at: serverPromo.start_at,
    end_at: serverPromo.end_at,
    priority: serverPromo.priority || 0,
    is_active: serverPromo.is_active,
    max_uses_per_user: serverPromo.max_uses_per_user || undefined,
    global_cap: serverPromo.global_cap || undefined,
    code: serverPromo.code || '',
    criteria_json: serverPromo.criteria_json || {},
    created_by: serverPromo.created_by || 'admin',
    updated_by: serverPromo.updated_by || 'admin',
    created_at: serverPromo.created_at,
    updated_at: serverPromo.updated_at,
    redemptions_count: serverPromo.redemptions_count || 0,
    global_redemptions_count: serverPromo.redemptions_count || 0,
  };
};

// Convert frontend promotion format to server format
const convertToServerPromotion = (frontendPromo: any) => {
  console.log('🔍 Frontend Promotion Input:', frontendPromo);
  
  const serverPromo: any = {
    title: frontendPromo.title, // Backend expects 'title' (not 'name')
    description: frontendPromo.description || '',
    audience: frontendPromo.audience || 'rider',
    reward_type: frontendPromo.reward_type, // Backend SQL expects 'reward_type'
    start_at: frontendPromo.start_at, // Backend expects 'start_at' (not 'valid_from')
    end_at: frontendPromo.end_at, // Backend expects 'end_at' (not 'valid_until')
    priority: frontendPromo.priority || 0,
    is_active: frontendPromo.is_active || false,
  };

  // Only include value_cents if it's a fixed discount type
  if (frontendPromo.reward_type === 'fixed_discount' || frontendPromo.reward_type === 'ride_credit' || frontendPromo.reward_type === 'cash_bonus') {
    serverPromo.value_cents = frontendPromo.value_cents || 0;
  }

  // Only include percent_off if it's a percent discount type
  if (frontendPromo.reward_type === 'percent_discount' || frontendPromo.reward_type === 'org_credit') {
    serverPromo.percent_off = frontendPromo.percent_off || 0;
  }

  // Only include optional fields if they have values
  if (frontendPromo.max_uses_per_user !== undefined && frontendPromo.max_uses_per_user !== null) {
    serverPromo.max_uses_per_user = frontendPromo.max_uses_per_user;
  }

  if (frontendPromo.global_cap !== undefined && frontendPromo.global_cap !== null) {
    serverPromo.global_cap = frontendPromo.global_cap;
  }

  if (frontendPromo.code && frontendPromo.code.trim()) {
    serverPromo.code = frontendPromo.code.trim();
  }

  if (frontendPromo.criteria_json && Object.keys(frontendPromo.criteria_json).length > 0) {
    serverPromo.criteria_json = frontendPromo.criteria_json;
  }
  
  // Ensure reward_type is not null/undefined
  if (!serverPromo.reward_type) {
    console.error('❌ ERROR: reward_type is null/undefined!', {
      reward_type: frontendPromo.reward_type
    });
    serverPromo.reward_type = 'fixed_discount';
  }
  
  console.log('🔍 Server Promotion Output:', serverPromo);
  console.log('🔍 Final reward_type value:', serverPromo.reward_type);
  return serverPromo;
};

// Test basic authentication first
export const testPromotionAuth = async (): Promise<boolean> => {
  try {
    const userString = localStorage.getItem("charged_admin_user");
    const user = userString ? JSON.parse(userString) : null;
    const token = user?.token;
    
    if (!token) {
      console.error('❌ No authentication token found');
      return false;
    }
    
    console.log('🔍 Testing promotion auth with token:', token.substring(0, 20) + '...');
    
    const response = await fetch(`${API_BASE_URL}/admin/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    
    console.log('🔍 Auth test response:', response.status, response.statusText);
    return response.ok;
  } catch (error) {
    console.error('❌ Auth test failed:', error);
    return false;
  }
};

// Get all promotions with optional filters (Admin endpoint)
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
    
    if (filters.from) {
      queryParams.append('from', filters.from);
    }
    
    if (filters.to) {
      queryParams.append('to', filters.to);
    }

    const url = `${API_BASE_URL}/promotions/admin${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    // Get authentication token
    const userString = localStorage.getItem("charged_admin_user");
    const user = userString ? JSON.parse(userString) : null;
    const token = user?.token;
    
    // Debug logging
    console.log('🔍 Promotion API Request:', {
      url,
      method: 'GET',
      hasToken: !!token,
      tokenPreview: token ? `${token.substring(0, 20)}...` : 'None'
    });
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    console.log('🔍 Promotion API Response:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });

    const result = await handleResponse(response);
    console.log('🔍 Promotion API Response Data:', result);
    
    // Backend returns: { status: true, data: { promotions: [...], pagination: {...} } }
    const serverPromotions = result.data?.promotions || result.promotions || result.data || result;
    const convertedPromotions = serverPromotions.map(convertServerPromotion);
    
    return {
      data: convertedPromotions,
      total: result.data?.pagination?.total_items || convertedPromotions.length
    };
  } catch (error) {
    console.error('Error fetching promotions:', error);
    throw error;
  }
};

// Get promotion by ID
export const getPromotion = async (id: string): Promise<Promotion> => {
  try {
    const userString = localStorage.getItem("charged_admin_user");
    const user = userString ? JSON.parse(userString) : null;
    const token = user?.token;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}/promotions/admin/${id}`, {
      method: 'GET',
      headers,
    });

    const result = await handleResponse(response);
    return convertServerPromotion(result.data || result);
  } catch (error) {
    console.error('Error fetching promotion:', error);
    throw error;
  }
};

// Create new promotion (Admin endpoint)
export const createPromotion = async (promotion: Omit<Promotion, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by' | 'redemptions_count' | 'global_redemptions_count'>): Promise<Promotion> => {
  try {
    const serverPromotion = convertToServerPromotion(promotion);
    
    // Get authentication token
    const userString = localStorage.getItem("charged_admin_user");
    const user = userString ? JSON.parse(userString) : null;
    const token = user?.token;
    
    // Debug logging
    console.log('🔍 Create Promotion API Request:', {
      url: `${API_BASE_URL}/promotions/admin`,
      method: 'POST',
      hasToken: !!token,
      tokenPreview: token ? `${token.substring(0, 20)}...` : 'None',
      tokenLength: token ? token.length : 0,
      body: serverPromotion
    });
    
    // Check if token is valid format
    if (token) {
      try {
        const tokenParts = token.split('.');
        console.log('🔍 Token Analysis:', {
          hasThreeParts: tokenParts.length === 3,
          headerLength: tokenParts[0]?.length || 0,
          payloadLength: tokenParts[1]?.length || 0,
          signatureLength: tokenParts[2]?.length || 0
        });
      } catch (e) {
        console.error('🔍 Token Analysis Error:', e);
      }
    }
    
    // Log the exact data being sent
    console.log('🔍 Exact Server Promotion Data:', JSON.stringify(serverPromotion, null, 2));
    console.log('🔍 Field Check - reward_type:', serverPromotion.reward_type);
    console.log('🔍 Field Check - title:', serverPromotion.title);
    console.log('🔍 Field Check - audience:', serverPromotion.audience);
    console.log('🔍 Field Check - start_at:', serverPromotion.start_at);
    console.log('🔍 Field Check - end_at:', serverPromotion.end_at);
    console.log('🔍 All Fields in Object:', Object.keys(serverPromotion));
    console.log('🔍 Field Values:', Object.entries(serverPromotion).map(([key, value]) => `${key}: ${value}`));
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}/promotions/admin`, {
      method: 'POST',
      headers,
      body: JSON.stringify(serverPromotion),
    });

    console.log('🔍 Create Promotion API Response:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });

    // Log response body for debugging
    const responseText = await response.text();
    console.log('🔍 Create Promotion API Response Body:', responseText);

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = JSON.parse(responseText);
        errorMessage = errorData.message || errorData.error || errorMessage;
        console.error('🔍 Backend Error Details:', errorData);
      } catch (e) {
        console.error('🔍 Raw Error Response:', responseText);
      }
      throw new Error(errorMessage);
    }

    const result = JSON.parse(responseText);
    console.log('🔍 Create Promotion API Response Data:', result);
    
    return convertServerPromotion(result.data || result);
  } catch (error) {
    console.error('Error creating promotion:', error);
    throw error;
  }
};

// Update promotion (Admin endpoint)
export const updatePromotion = async (id: string, promotion: Partial<Promotion>): Promise<Promotion> => {
  try {
    const serverPromotion = convertToServerPromotion(promotion);
    
    const userString = localStorage.getItem("charged_admin_user");
    const user = userString ? JSON.parse(userString) : null;
    const token = user?.token;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}/promotions/admin/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(serverPromotion),
    });

    const result = await handleResponse(response);
    return convertServerPromotion(result.data || result);
  } catch (error) {
    console.error('Error updating promotion:', error);
    throw error;
  }
};

// Delete promotion (Admin endpoint)
export const deletePromotion = async (id: string): Promise<void> => {
  try {
    const userString = localStorage.getItem("charged_admin_user");
    const user = userString ? JSON.parse(userString) : null;
    const token = user?.token;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}/promotions/admin/${id}`, {
      method: 'DELETE',
      headers,
    });

    await handleResponse(response);
  } catch (error) {
    console.error('Error deleting promotion:', error);
    throw error;
  }
};

// Activate promotion (using update endpoint)
export const activatePromotion = async (id: string): Promise<Promotion> => {
  try {
    const userString = localStorage.getItem("charged_admin_user");
    const user = userString ? JSON.parse(userString) : null;
    const token = user?.token;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}/promotions/admin/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ is_active: true }),
    });

    const result = await handleResponse(response);
    return convertServerPromotion(result.data || result);
  } catch (error) {
    console.error('Error activating promotion:', error);
    throw error;
  }
};

// Deactivate promotion (using update endpoint)
export const deactivatePromotion = async (id: string): Promise<Promotion> => {
  try {
    const userString = localStorage.getItem("charged_admin_user");
    const user = userString ? JSON.parse(userString) : null;
    const token = user?.token;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}/promotions/admin/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ is_active: false }),
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

// Get promotions summary (calculated from promotions list since backend doesn't have summary endpoint)
export const getPromotionsSummary = async (audience?: string): Promise<PromotionSummary> => {
  try {
    // Get all promotions and calculate summary
    const promotionsResult = await listPromotions({});
    const promotions = promotionsResult.data;
    
    const now = new Date();
    let activeCount = 0;
    let scheduledCount = 0;
    let endedCount = 0;
    let totalRedemptions = 0;
    let totalValueCents = 0;
    
    promotions.forEach(promo => {
      if (promo.is_active) {
        const startAt = promo.start_at ? new Date(promo.start_at) : null;
        const endAt = promo.end_at ? new Date(promo.end_at) : null;
        
        if (startAt && startAt > now) {
          scheduledCount++;
        } else if (endAt && endAt < now) {
          endedCount++;
        } else {
          activeCount++;
        }
      } else {
        endedCount++;
      }
      
      totalRedemptions += promo.redemptions_count || 0;
      totalValueCents += (promo.value_cents || 0) * (promo.redemptions_count || 0);
    });
    
    return {
      total_promotions: promotions.length,
      active_promotions: activeCount,
      scheduled_promotions: scheduledCount,
      ended_promotions: endedCount,
      total_redemptions: totalRedemptions,
      total_value_cents: totalValueCents,
    };
  } catch (error) {
    console.error('Error calculating promotions summary:', error);
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
    throw error;
  }
};