import axios from 'axios';
import { rideTypes, VehicleClass, VehicleClassUpdate, VehicleClassesResponse } from '../types';

import { API_BASE_URL } from '../config/api';

const instance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth interceptor
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

// Add response interceptor for error handling
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem("charged_admin_user");
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const pricingApi = {
  // Pricing Rules (Ride Types) CRUD Operations
  async getPricingRules(): Promise<rideTypes[]> {
    try {
      const response = await instance.get('/ride/ridetype');
      return response.data;
    } catch (error) {
      console.error('Error fetching pricing rules:', error);
      throw new Error('Failed to fetch pricing rules');
    }
  },

  async getPricingRule(id: number): Promise<rideTypes> {
    try {
      const response = await instance.get(`/ride/ridetype/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching pricing rule:', error);
      throw new Error('Failed to fetch pricing rule');
    }
  },

  async createPricingRule(data: Omit<rideTypes, 'id' | 'created_at' | 'updated_at'>): Promise<rideTypes> {
    try {
      const response = await instance.post('/ride/ridetype', data);
      return response.data;
    } catch (error) {
      console.error('Error creating pricing rule:', error);
      throw new Error('Failed to create pricing rule');
    }
  },

  async updatePricingRule(id: number, data: Partial<rideTypes>): Promise<rideTypes> {
    try {
      const response = await instance.put(`/ride/ridetype/${id}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating pricing rule:', error);
      throw new Error('Failed to update pricing rule');
    }
  },

  async deletePricingRule(id: number): Promise<void> {
    try {
      await instance.delete(`/pricing/ridetype/${id}`);
    } catch (error) {
      console.error('Error deleting pricing rule:', error);
      throw new Error('Failed to delete pricing rule');
    }
  },

  // Vehicle Classes CRUD Operations
  async getVehicleClasses(): Promise<VehicleClassesResponse> {
    try {
      const response = await instance.get('/admin/vehicle-classes');
      return response.data;
    } catch (error) {
      console.error('Error fetching vehicle classes:', error);
      throw new Error('Failed to fetch vehicle classes');
    }
  },

  async getVehicleClass(code: string): Promise<VehicleClass> {
    try {
      const response = await instance.get(`/admin/vehicle-classes/${code}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching vehicle class:', error);
      throw new Error('Failed to fetch vehicle class');
    }
  },

  async createVehicleClass(data: Omit<VehicleClass, 'id' | 'updated_at'>): Promise<VehicleClass> {
    try {
      const response = await instance.post('/admin/vehicle-classes', data);
      return response.data;
    } catch (error) {
      console.error('Error creating vehicle class:', error);
      throw new Error('Failed to create vehicle class');
    }
  },

  async updateVehicleClass(code: string, data: VehicleClassUpdate): Promise<VehicleClass> {
    try {
      const response = await instance.patch(`/pricing/admin/vehicle-classes/${code}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating vehicle class:', error);
      throw new Error('Failed to update vehicle class');
    }
  },

  async deleteVehicleClass(code: string): Promise<void> {
    try {
      await instance.delete(`/admin/vehicle-classes/${code}`);
    } catch (error) {
      console.error('Error deleting vehicle class:', error);
      throw new Error('Failed to delete vehicle class');
    }
  },

  // Public catalog endpoint
  async getCatalogVehicleClasses(): Promise<VehicleClass[]> {
    try {
      const response = await instance.get('/catalog/vehicle-classes');
      return response.data.vehicle_classes;
    } catch (error) {
      console.error('Error fetching catalog vehicle classes:', error);
      throw new Error('Failed to fetch catalog vehicle classes');
    }
  },

  // Validation helpers
  validatePricingRule(data: Partial<rideTypes>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (data.base_price && (isNaN(Number(data.base_price)) || Number(data.base_price) < 0)) {
      errors.push('Base price must be a positive number');
    }

    if (data.price_per_km && (isNaN(Number(data.price_per_km)) || Number(data.price_per_km) < 0)) {
      errors.push('Price per km must be a positive number');
    }

    if (data.price_per_minute && (isNaN(Number(data.price_per_minute)) || Number(data.price_per_minute) < 0)) {
      errors.push('Price per minute must be a positive number');
    }

    if (data.commission_percentage && (isNaN(Number(data.commission_percentage)) || Number(data.commission_percentage) < 0 || Number(data.commission_percentage) > 100)) {
      errors.push('Commission percentage must be between 0 and 100');
    }

    if (data.govt_tax_percentage && (isNaN(Number(data.govt_tax_percentage)) || Number(data.govt_tax_percentage) < 0 || Number(data.govt_tax_percentage) > 100)) {
      errors.push('Government tax percentage must be between 0 and 100');
    }

    if (data.refund_distance_in_m && (isNaN(Number(data.refund_distance_in_m)) || Number(data.refund_distance_in_m) < 0)) {
      errors.push('Refund distance must be a positive number');
    }

    if (data.minimum_billable_distance && (isNaN(Number(data.minimum_billable_distance)) || Number(data.minimum_billable_distance) < 0)) {
      errors.push('Minimum billable distance must be a positive number');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
};

export default pricingApi;
