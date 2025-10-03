// Simple fallback store without Zustand
import React from 'react';
import { rideTypes, VehicleClass } from '../types';
import { serverSyncService, ServerSyncStatus } from '../services/serverSyncService';
import { API_BASE_URL } from '../config/api';

interface SimplePricingState {
  pricingRules: rideTypes[];
  vehicleClasses: VehicleClass[];
  loading: boolean;
  vehicleClassesLoading: boolean;
  error: string | null;
  vehicleClassesError: string | null;
  savingRules: { [key: string]: boolean };
  isWebSocketConnected: boolean;
  serverSyncStatus: ServerSyncStatus;
  fetchPricingRules: () => Promise<void>;
  fetchVehicleClasses: () => Promise<void>;
  updatePricingRule: (id: number, data: Partial<rideTypes>) => Promise<void>;
  savePricingRule: (id: number, data: Partial<rideTypes>) => Promise<void>;
  updateVehicleClass: (code: string, data: Partial<VehicleClass>) => Promise<void>;
  deletePricingRule: (id: number) => Promise<void>;
  connectWebSocket: () => void;
  disconnectWebSocket: () => void;
  clearErrors: () => void;
  syncWithServer: () => Promise<void>;
  checkServerConnection: () => Promise<boolean>;
}

class SimplePricingStore implements SimplePricingState {
  pricingRules: rideTypes[] = [];
  vehicleClasses: VehicleClass[] = [];
  loading: boolean = false;
  vehicleClassesLoading: boolean = false;
  error: string | null = null;
  vehicleClassesError: string | null = null;
  savingRules: { [key: string]: boolean } = {};
  isWebSocketConnected: boolean = false;
  serverSyncStatus: ServerSyncStatus = {
    isOnline: false,
    lastSyncTime: null,
    pendingChanges: false,
    error: null
  };

  private listeners: Set<() => void> = new Set();
  private readonly PRICING_RULES_KEY = 'charged_admin_pricing_rules';
  private readonly VEHICLE_CLASSES_KEY = 'charged_admin_vehicle_classes';

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach(listener => listener());
  }

  private saveToLocalStorage() {
    try {
      localStorage.setItem(this.PRICING_RULES_KEY, JSON.stringify(this.pricingRules));
      localStorage.setItem(this.VEHICLE_CLASSES_KEY, JSON.stringify(this.vehicleClasses));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  }

  private loadFromLocalStorage() {
    try {
      const savedPricingRules = localStorage.getItem(this.PRICING_RULES_KEY);
      const savedVehicleClasses = localStorage.getItem(this.VEHICLE_CLASSES_KEY);
      
      if (savedPricingRules) {
        const parsedRules = JSON.parse(savedPricingRules);
        // Ensure custom UI elements are preserved
        const defaultData = this.getDefaultPricingRules();
        this.pricingRules = parsedRules.map((rule: any) => {
          const defaultRule = defaultData.find(d => d.id === rule.id) || defaultData[0];
          return {
            ...rule,
            // Preserve custom UI elements if missing
            icon: rule.icon || defaultRule.icon,
            description: rule.description || defaultRule.description
          };
        });
      }
      
      if (savedVehicleClasses) {
        this.vehicleClasses = JSON.parse(savedVehicleClasses);
      }
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
    }
  }

  private getDefaultPricingRules(): rideTypes[] {
    return [
      {
        id: 1,
        name: "Charged X",
        description: "Standard electric vehicle service",
        icon: "/icons/charged-logo.svg",
        base_price: "5.00",
        price_per_km: "1.80",
        price_per_minute: "0.25",
        min_fare: "5.00",
        cancel_fee: "2.00",
        refund_distance_in_m: 50,
        minimum_billable_distance: "1.0",
        commission_percentage: "12.0",
        govt_tax_percentage: "5.0",
        is_active: true,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z"
      },
      {
        id: 2,
        name: "Charged Black",
        description: "Premium luxury vehicle service",
        icon: "/icons/charged-logo.svg",
        base_price: "6.00",
        price_per_km: "2.00",
        price_per_minute: "0.30",
        min_fare: "6.00",
        cancel_fee: "3.00",
        refund_distance_in_m: 75,
        minimum_billable_distance: "1.5",
        commission_percentage: "15.0",
        govt_tax_percentage: "5.0",
        is_active: true,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z"
      },
      {
        id: 3,
        name: "Charged XL",
        description: "Large vehicle service for groups",
        icon: "/icons/charged-logo.svg",
        base_price: "8.00",
        price_per_km: "2.50",
        price_per_minute: "0.35",
        min_fare: "8.00",
        cancel_fee: "4.00",
        refund_distance_in_m: 100,
        minimum_billable_distance: "2.0",
        commission_percentage: "18.0",
        govt_tax_percentage: "5.0",
        is_active: true,
        created_at: "2024-01-01T00:00:00Z",
        updated_at: "2024-01-01T00:00:00Z"
      }
    ];
  }

  private getDefaultVehicleClasses(): VehicleClass[] {
    return [
      {
        id: "1",
        code: "charged_x",
        display_name: "Charged X",
        is_enabled: true,
        updated_at: "2024-01-01T00:00:00Z"
      },
      {
        id: "2",
        code: "charged_black",
        display_name: "Charged Black",
        is_enabled: true,
        updated_at: "2024-01-01T00:00:00Z"
      },
      {
        id: "3",
        code: "charged_xl",
        display_name: "Charged XL",
        is_enabled: true,
        updated_at: "2024-01-01T00:00:00Z"
      }
    ];
  }

  fetchPricingRules = async (): Promise<void> => {
    this.loading = true;
    this.error = null;
    this.notify();
    
    try {
      // Try to fetch from server first
      try {
        const response = await fetch(`${API_BASE_URL}/ride/ridetype`);
        if (response.ok) {
          const serverData = await response.json();
          if (serverData.data && Array.isArray(serverData.data)) {
            // Get our default data for UI elements (logos, descriptions, etc.)
            const defaultData = this.getDefaultPricingRules();
            
            // Merge server data with our custom UI data
            this.pricingRules = serverData.data.map((serverRule: any) => {
              // Find matching default data by name or id
              const defaultRule = defaultData.find(d => 
                d.name === serverRule.name || 
                d.id === serverRule.id ||
                (serverRule.name && d.name.toLowerCase().includes(serverRule.name.toLowerCase()))
              ) || defaultData[0]; // fallback to first default rule
              
              return {
                ...defaultRule, // Use our custom UI data (logos, descriptions)
                ...serverRule, // Override with server data (prices, etc.)
                // Ensure proper string formatting for prices
                base_price: serverRule.base_price?.toString() || defaultRule.base_price,
                price_per_km: serverRule.price_per_km?.toString() || defaultRule.price_per_km,
                price_per_minute: serverRule.price_per_minute?.toString() || defaultRule.price_per_minute,
                min_fare: serverRule.min_fare?.toString() || defaultRule.min_fare,
                cancel_fee: serverRule.cancel_fee?.toString() || defaultRule.cancel_fee,
                minimum_billable_distance: serverRule.minimum_billable_distance?.toString() || defaultRule.minimum_billable_distance,
                commission_percentage: serverRule.commission_percentage?.toString() || defaultRule.commission_percentage,
                govt_tax_percentage: serverRule.govt_tax_percentage?.toString() || defaultRule.govt_tax_percentage,
                // Keep our custom UI elements
                icon: defaultRule.icon,
                description: defaultRule.description
              };
            });
            this.saveToLocalStorage();
            this.loading = false;
            this.notify();
            return;
          }
        }
      } catch (serverError) {
        console.log('Server not available, using local data');
      }
      
      // Fallback to localStorage or default data
      this.loadFromLocalStorage();
      
      // If no data in localStorage, use default data and save it
      if (this.pricingRules.length === 0) {
        this.pricingRules = this.getDefaultPricingRules();
        this.saveToLocalStorage();
      }
      
      this.loading = false;
      this.notify();
    } catch (error) {
      this.loading = false;
      this.error = 'Failed to fetch pricing rules';
      this.notify();
    }
  }

  fetchVehicleClasses = async (): Promise<void> => {
    this.vehicleClassesLoading = true;
    this.vehicleClassesError = null;
    this.notify();
    
    try {
      // Try to fetch from server first
      try {
        const response = await fetch(`${API_BASE_URL}/admin/vehicle-classes`);
        if (response.ok) {
          const serverData = await response.json();
          if (serverData.data && Array.isArray(serverData.data)) {
            this.vehicleClasses = serverData.data;
            this.saveToLocalStorage();
            this.vehicleClassesLoading = false;
            this.notify();
            return;
          }
        }
      } catch (serverError) {
        console.log('Server not available, using local data');
      }
      
      // Fallback to localStorage or default data
      this.loadFromLocalStorage();
      
      // If no data in localStorage, use default data and save it
      if (this.vehicleClasses.length === 0) {
        this.vehicleClasses = this.getDefaultVehicleClasses();
        this.saveToLocalStorage();
      }
      
      this.vehicleClassesLoading = false;
      this.notify();
    } catch (error) {
      this.vehicleClassesError = 'Failed to fetch vehicle classes';
      this.vehicleClassesLoading = false;
      this.notify();
    }
  }

  updatePricingRule = async (id: number, data: Partial<rideTypes>): Promise<void> => {
    try {
      // Mock update - update the rule in real-time
      const index = this.pricingRules.findIndex(rule => rule.id === id);
      if (index !== -1) {
        // Get default data to preserve UI elements
        const defaultData = this.getDefaultPricingRules();
        const defaultRule = defaultData.find(d => d.id === id) || defaultData[0];
        
        this.pricingRules[index] = { 
          ...this.pricingRules[index], 
          ...data,
          // Preserve custom UI elements
          icon: this.pricingRules[index].icon || defaultRule.icon,
          description: this.pricingRules[index].description || defaultRule.description,
          updated_at: new Date().toISOString()
        };
        // Save to localStorage
        this.saveToLocalStorage();
        this.notify();
      }
    } catch (error) {
      this.error = 'Failed to update pricing rule';
      this.notify();
    }
  }

  savePricingRule = async (id: number, data: Partial<rideTypes>): Promise<void> => {
    this.savingRules[id.toString()] = true;
    this.notify();
    
    try {
      // Try to save to server
      const userString = localStorage.getItem("charged_admin_user");
      const user = userString ? JSON.parse(userString) : null;
      const token = user?.token;
      
      if (token) {
        const response = await fetch(`${API_BASE_URL}/ride/ridetype/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(data)
        });
        
        if (response.ok) {
          // Update timestamp to show it was saved
          const index = this.pricingRules.findIndex(rule => rule.id === id);
          if (index !== -1) {
            this.pricingRules[index] = { 
              ...this.pricingRules[index], 
              updated_at: new Date().toISOString()
            };
            this.saveToLocalStorage();
          }
        } else {
          throw new Error(`Server error: ${response.status}`);
        }
      } else {
        // Fallback to mock save if no token
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const index = this.pricingRules.findIndex(rule => rule.id === id);
        if (index !== -1) {
          this.pricingRules[index] = { 
            ...this.pricingRules[index], 
            updated_at: new Date().toISOString()
          };
          this.saveToLocalStorage();
        }
      }
      
      this.savingRules[id.toString()] = false;
      this.notify();
    } catch (error) {
      this.savingRules[id.toString()] = false;
      this.error = 'Failed to save pricing rule';
      this.notify();
    }
  }

  updateVehicleClass = async (code: string, data: Partial<VehicleClass>): Promise<void> => {
    try {
      // Try to update on server first
      const userString = localStorage.getItem("charged_admin_user");
      const user = userString ? JSON.parse(userString) : null;
      const token = user?.token;
      
      if (token) {
        const response = await fetch(`${API_BASE_URL}/pricing/admin/vehicle-classes/${code}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(data)
        });
        
        if (response.ok) {
          // Update local store
          const index = this.vehicleClasses.findIndex(vc => vc.code === code);
          if (index !== -1) {
            this.vehicleClasses[index] = { 
              ...this.vehicleClasses[index], 
              ...data,
              updated_at: new Date().toISOString()
            };
            this.saveToLocalStorage();
            this.notify();
          }
        } else {
          throw new Error(`Server error: ${response.status}`);
        }
      } else {
        // Fallback to mock update if no token
        const index = this.vehicleClasses.findIndex(vc => vc.code === code);
        if (index !== -1) {
          this.vehicleClasses[index] = { 
            ...this.vehicleClasses[index], 
            ...data,
            updated_at: new Date().toISOString()
          };
          this.saveToLocalStorage();
          this.notify();
        }
      }
    } catch (error) {
      this.vehicleClassesError = 'Failed to update vehicle class';
      this.notify();
    }
  }

  deletePricingRule = async (id: number): Promise<void> => {
    this.savingRules[id.toString()] = true;
    this.notify();
    
    try {
      // Mock delete
      this.pricingRules = this.pricingRules.filter(rule => rule.id !== id);
      this.savingRules[id.toString()] = false;
      this.notify();
    } catch (error) {
      this.savingRules[id.toString()] = false;
      this.error = 'Failed to delete pricing rule';
      this.notify();
    }
  }

  connectWebSocket = (): void => {
    this.isWebSocketConnected = true;
    this.notify();
  }

  disconnectWebSocket = (): void => {
    this.isWebSocketConnected = false;
    this.notify();
  }

  clearErrors = (): void => {
    this.error = null;
    this.vehicleClassesError = null;
    this.notify();
  }

  syncWithServer = async (): Promise<void> => {
    try {
      // Check server connection first
      const isOnline = await this.checkServerConnection();
      if (!isOnline) {
        throw new Error('Server is not reachable');
      }

      // Compare local data with server data
      const comparison = await serverSyncService.compareWithServer(this.pricingRules);
      
      if (comparison.hasChanges) {
        console.log('🔄 Server sync: Found changes, updating local data with server data');
        this.pricingRules = comparison.serverData;
        this.saveToLocalStorage();
        this.notify();
      } else {
        console.log('✅ Server sync: Local data is in sync with server');
      }

      // Update sync status
      this.serverSyncStatus = serverSyncService.getStatus();
      this.notify();
    } catch (error) {
      console.error('❌ Server sync failed:', error);
      this.serverSyncStatus = serverSyncService.getStatus();
      this.notify();
    }
  }

  checkServerConnection = async (): Promise<boolean> => {
    try {
      const isOnline = await serverSyncService.checkServerConnection();
      this.serverSyncStatus = serverSyncService.getStatus();
      this.notify();
      return isOnline;
    } catch (error) {
      console.error('❌ Server connection check failed:', error);
      this.serverSyncStatus = serverSyncService.getStatus();
      this.notify();
      return false;
    }
  }
}

// Create singleton instance
const simplePricingStore = new SimplePricingStore();

// Hook to use the store
export const useSimplePricingStore = () => {
  const [, forceUpdate] = React.useReducer(x => x + 1, 0);
  
  React.useEffect(() => {
    const unsubscribe = simplePricingStore.subscribe(forceUpdate);
    return () => unsubscribe();
  }, []);
  
  return simplePricingStore;
};

// For compatibility
export const usePricingStore = useSimplePricingStore;
