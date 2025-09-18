import axios from 'axios';
import {
  VehicleClass,
  VehicleClassUpdate,
  VehicleClassesResponse,
  CatalogVehicleClassesResponse,
} from '../types';

const instance = axios.create({
  baseURL: "https://api.charged.autos",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

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

// Admin endpoints
export const listVehicleClasses = async (): Promise<VehicleClassesResponse> => {
  try {
    const response = await instance.get('/admin/vehicle-classes');
    return response.data;
  } catch (error) {
    console.error('Error fetching vehicle classes:', error);
    throw error;
  }
};

export const getVehicleClassByCode = async (code: string): Promise<VehicleClass> => {
  try {
    const response = await instance.get(`/admin/vehicle-classes/${code}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching vehicle class:', error);
    throw error;
  }
};

export const createVehicleClass = async (payload: Omit<VehicleClass, 'code'>): Promise<VehicleClass> => {
  try {
    const response = await instance.post('/admin/vehicle-classes', payload);
    return response.data;
  } catch (error) {
    console.error('Error creating vehicle class:', error);
    throw error;
  }
};

export const updateVehicleClass = async (
  code: string,
  payload: VehicleClassUpdate
): Promise<VehicleClass> => {
  try {
    const response = await instance.patch(`/admin/vehicle-classes/${code}`, payload);
    return response.data;
  } catch (error) {
    console.error('Error updating vehicle class:', error);
    throw error;
  }
};

export const deleteVehicleClass = async (code: string): Promise<void> => {
  try {
    await instance.delete(`/admin/vehicle-classes/${code}`);
  } catch (error) {
    console.error('Error deleting vehicle class:', error);
    throw error;
  }
};

// Public catalog endpoint (for client apps)
export const getCatalogVehicleClasses = async (): Promise<CatalogVehicleClassesResponse> => {
  try {
    const response = await instance.get('/catalog/vehicle-classes');
    return response.data;
  } catch (error) {
    console.error('Error fetching catalog vehicle classes:', error);
    throw error;
  }
};

// Realtime subscription helper
export const subscribeToVehicleClassUpdates = (
  callback: (update: { code: string; is_enabled: boolean; updated_at: string }) => void
) => {
  // This would integrate with your realtime service
  // For now, we'll simulate with a mock implementation
  console.log('Subscribing to vehicle class updates...');
  
  // Mock realtime subscription
  const mockSubscription = {
    unsubscribe: () => {
      console.log('Unsubscribed from vehicle class updates');
    }
  };
  
  return mockSubscription;
};
