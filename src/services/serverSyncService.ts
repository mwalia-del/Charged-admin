// Server synchronization service for pricing data
import { getRidetypesdata, updateRidetypedata } from '../API/axios';
import { rideTypes } from '../types';

export interface ServerSyncStatus {
  isOnline: boolean;
  lastSyncTime: string | null;
  pendingChanges: boolean;
  error: string | null;
}

class ServerSyncService {
  private status: ServerSyncStatus = {
    isOnline: false,
    lastSyncTime: null,
    pendingChanges: false,
    error: null
  };

  private listeners: Set<(status: ServerSyncStatus) => void> = new Set();

  subscribe(listener: (status: ServerSyncStatus) => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach(listener => listener(this.status));
  }

  private updateStatus(updates: Partial<ServerSyncStatus>) {
    this.status = { ...this.status, ...updates };
    this.notify();
  }

  // Check if server is reachable
  async checkServerConnection(): Promise<boolean> {
    try {
      await getRidetypesdata();
      this.updateStatus({ 
        isOnline: true, 
        error: null,
        lastSyncTime: new Date().toISOString()
      });
      return true;
    } catch (error) {
      this.updateStatus({ 
        isOnline: false, 
        error: 'Server connection failed',
        lastSyncTime: null
      });
      return false;
    }
  }

  // Fetch pricing rules from server
  async fetchPricingRulesFromServer(): Promise<rideTypes[]> {
    try {
      const response = await getRidetypesdata();
      const serverData = response.data;
      
      this.updateStatus({ 
        isOnline: true, 
        error: null,
        lastSyncTime: new Date().toISOString()
      });
      
      return serverData;
    } catch (error) {
      this.updateStatus({ 
        isOnline: false, 
        error: 'Failed to fetch pricing rules from server',
        lastSyncTime: null
      });
      throw error;
    }
  }

  // Sync local changes to server
  async syncPricingRuleToServer(id: number, data: Partial<rideTypes>): Promise<void> {
    try {
      await updateRidetypedata(id, data);
      
      this.updateStatus({ 
        isOnline: true, 
        error: null,
        lastSyncTime: new Date().toISOString(),
        pendingChanges: false
      });
    } catch (error) {
      this.updateStatus({ 
        isOnline: false, 
        error: 'Failed to sync pricing rule to server',
        pendingChanges: true
      });
      throw error;
    }
  }

  // Compare local data with server data
  async compareWithServer(localData: rideTypes[]): Promise<{
    hasChanges: boolean;
    serverData: rideTypes[];
    conflicts: Array<{
      id: number;
      local: rideTypes;
      server: rideTypes;
      field: string;
      localValue: any;
      serverValue: any;
    }>;
  }> {
    try {
      const serverData = await this.fetchPricingRulesFromServer();
      
      const conflicts: Array<{
        id: number;
        local: rideTypes;
        server: rideTypes;
        field: string;
        localValue: any;
        serverValue: any;
      }> = [];

      let hasChanges = false;

      // Compare each local rule with server data
      localData.forEach(localRule => {
        const serverRule = serverData.find(rule => rule.id === localRule.id);
        if (serverRule) {
          // Compare key fields
          const fieldsToCompare: (keyof rideTypes)[] = [
            'base_price', 'price_per_km', 'price_per_minute', 'min_fare',
            'cancel_fee', 'refund_distance_in_m', 'minimum_billable_distance',
            'commission_percentage', 'govt_tax_percentage', 'is_active'
          ];

          fieldsToCompare.forEach(field => {
            if (localRule[field] !== serverRule[field]) {
              hasChanges = true;
              conflicts.push({
                id: localRule.id,
                local: localRule,
                server: serverRule,
                field,
                localValue: localRule[field],
                serverValue: serverRule[field]
              });
            }
          });
        }
      });

      return {
        hasChanges,
        serverData,
        conflicts
      };
    } catch (error) {
      this.updateStatus({ 
        isOnline: false, 
        error: 'Failed to compare with server data'
      });
      throw error;
    }
  }

  // Get current sync status
  getStatus(): ServerSyncStatus {
    return { ...this.status };
  }

  // Reset status
  reset() {
    this.updateStatus({
      isOnline: false,
      lastSyncTime: null,
      pendingChanges: false,
      error: null
    });
  }
}

// Create singleton instance
export const serverSyncService = new ServerSyncService();
