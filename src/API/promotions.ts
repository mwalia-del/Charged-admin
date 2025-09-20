import { API_BASE_URL } from '../config/api';
import { Promotion, PromotionFilters } from '../types';

// Convert server promotion format to frontend format
const convertServerPromotion = (serverPromo: any): Promotion => {
  return {
    id: serverPromo.id.toString(),
    title: serverPromo.title,
    description: serverPromo.description || '',
    audience: serverPromo.audience || 'rider',
    reward_type: serverPromo.discount_type || serverPromo.reward_type,
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
  const serverPromo: any = {
    title: frontendPromo.title,
    description: frontendPromo.description || '',
    audience: frontendPromo.audience || 'rider',
    reward_type: frontendPromo.reward_type,
    start_at: frontendPromo.start_at,
    end_at: frontendPromo.end_at,
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
    serverPromo.reward_type = 'fixed_discount';
  }
  
  return serverPromo;
};

// Get all promotions with optional filters (Admin endpoint)
export const listPromotions = async (filters: PromotionFilters = {}): Promise<{ data: Promotion[]; total: number }> => {
  try {
    const userString = localStorage.getItem("charged_admin_user");
    const user = userString ? JSON.parse(userString) : null;
    const token = user?.token;

    if (!token) {
      throw new Error('No authentication token found');
    }

    const queryParams = new URLSearchParams();

    if (filters.search) {
      queryParams.append('search', filters.search);
    }
    if (filters.audience) {
      queryParams.append('audience', filters.audience);
    }
    if (filters.status !== undefined) {
      queryParams.append('is_active', filters.status.toString());
    }
    if (filters.from) {
      queryParams.append('from', filters.from);
    }
    if (filters.to) {
      queryParams.append('to', filters.to);
    }
    if (filters.page) {
      queryParams.append('page', filters.page.toString());
    }
    if (filters.page_size) {
      queryParams.append('page_size', filters.page_size.toString());
    }

    const response = await fetch(`${API_BASE_URL}/promotions/admin?${queryParams.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    const promotions = Array.isArray(result.data?.promotions) ? result.data.promotions : 
                     Array.isArray(result.promotions) ? result.promotions :
                     Array.isArray(result.data) ? result.data : 
                     Array.isArray(result) ? result : [];

    return {
      data: promotions.map(convertServerPromotion),
      total: result.data?.pagination?.total_items || result.total || promotions.length
    };
  } catch (error: any) {
    throw new Error(`Failed to fetch promotions: ${error.message || 'Unknown error'}`);
  }
};

// Get promotion summary statistics
export const getPromotionsSummary = async (): Promise<{
  total_promotions: number;
  active_promotions: number;
  scheduled_promotions: number;
  ended_promotions: number;
  total_redemptions: number;
  total_value_cents: number;
}> => {
  try {
    // Since there's no dedicated summary endpoint, calculate from list
    const { data: promotions } = await listPromotions();
    
    const now = new Date();
    const summary = {
      total_promotions: promotions.length,
      active_promotions: promotions.filter(p => p.is_active).length,
      scheduled_promotions: promotions.filter(p => p.is_active && new Date(p.start_at) > now).length,
      ended_promotions: promotions.filter(p => new Date(p.end_at) < now).length,
      total_redemptions: promotions.reduce((sum, p) => sum + (p.redemptions_count || 0), 0),
      total_value_cents: promotions.reduce((sum, p) => sum + (p.value_cents || 0), 0)
    };

    return summary;
  } catch (error: any) {
    throw new Error(`Failed to calculate promotions summary: ${error.message || 'Unknown error'}`);
  }
};

// Get single promotion by ID
export const getPromotion = async (id: string): Promise<Promotion> => {
  try {
    const userString = localStorage.getItem("charged_admin_user");
    const user = userString ? JSON.parse(userString) : null;
    const token = user?.token;

    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/promotions/admin/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return convertServerPromotion(result.data || result);
  } catch (error: any) {
    throw new Error(`Failed to fetch promotion: ${error.message || 'Unknown error'}`);
  }
};

// Create new promotion
export const createPromotion = async (promotion: Omit<Promotion, 'id' | 'created_at' | 'updated_at' | 'created_by' | 'updated_by' | 'redemptions_count' | 'global_redemptions_count'>): Promise<Promotion> => {
  try {
    const userString = localStorage.getItem("charged_admin_user");
    const user = userString ? JSON.parse(userString) : null;
    const token = user?.token;

    if (!token) {
      throw new Error('No authentication token found');
    }

    const serverPromotion = convertToServerPromotion(promotion);

    const response = await fetch(`${API_BASE_URL}/promotions/admin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(serverPromotion),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return convertServerPromotion(result.data || result);
  } catch (error: any) {
    throw new Error(`Failed to create promotion: ${error.message || 'Unknown error'}`);
  }
};

// Update existing promotion
export const updatePromotion = async (id: string, promotion: Partial<Promotion>): Promise<Promotion> => {
  try {
    const userString = localStorage.getItem("charged_admin_user");
    const user = userString ? JSON.parse(userString) : null;
    const token = user?.token;

    if (!token) {
      throw new Error('No authentication token found');
    }

    const serverPromotion = convertToServerPromotion(promotion);

    const response = await fetch(`${API_BASE_URL}/promotions/admin/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(serverPromotion),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return convertServerPromotion(result.data || result);
  } catch (error: any) {
    throw new Error(`Failed to update promotion: ${error.message || 'Unknown error'}`);
  }
};

// Delete promotion
export const deletePromotion = async (id: string): Promise<void> => {
  try {
    const userString = localStorage.getItem("charged_admin_user");
    const user = userString ? JSON.parse(userString) : null;
    const token = user?.token;

    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/promotions/admin/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
  } catch (error: any) {
    throw new Error(`Failed to delete promotion: ${error.message || 'Unknown error'}`);
  }
};

// Activate promotion
export const activatePromotion = async (id: string): Promise<Promotion> => {
  try {
    const userString = localStorage.getItem("charged_admin_user");
    const user = userString ? JSON.parse(userString) : null;
    const token = user?.token;

    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/promotions/admin/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ is_active: true }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return convertServerPromotion(result.data || result);
  } catch (error: any) {
    throw new Error(`Failed to activate promotion: ${error.message || 'Unknown error'}`);
  }
};

// Deactivate promotion
export const deactivatePromotion = async (id: string): Promise<Promotion> => {
  try {
    const userString = localStorage.getItem("charged_admin_user");
    const user = userString ? JSON.parse(userString) : null;
    const token = user?.token;

    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`${API_BASE_URL}/promotions/admin/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ is_active: false }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return convertServerPromotion(result.data || result);
  } catch (error: any) {
    throw new Error(`Failed to deactivate promotion: ${error.message || 'Unknown error'}`);
  }
};
