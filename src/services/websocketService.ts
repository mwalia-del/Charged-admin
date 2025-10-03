import io from 'socket.io-client';

interface PricingRuleUpdate {
  id: number;
  rule: any;
  type: 'created' | 'updated' | 'deleted';
}

interface VehicleClassUpdate {
  code: string;
  is_enabled: boolean;
  updated_at: string;
  type: 'created' | 'updated' | 'deleted';
}

interface ParcelDeliveryPricingUpdate {
  id: number;
  pricing: any;
  type: 'created' | 'updated' | 'deleted';
}

class WebSocketService {
  private socket: any = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  connect(): Promise<any> {
    return new Promise((resolve, reject) => {
      try {
        const token = this.getAuthToken();
        if (!token) {
          reject(new Error('No authentication token found'));
          return;
        }

        this.socket = io('wss://api.charged.autos', {
          auth: {
            token: token
          },
          transports: ['websocket'],
          timeout: 10000,
        });

        this.socket.on('connect', () => {
          console.log('🔌 WebSocket connected');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          
          // Join pricing update rooms
          this.socket?.emit('join_pricing_updates');
          this.socket?.emit('join_vehicle_class_updates');
          this.socket?.emit('join_parcel_delivery_pricing_updates');
          
          resolve(this.socket!);
        });

        this.socket.on('disconnect', (reason: string) => {
          console.log('🔌 WebSocket disconnected:', reason);
          this.isConnected = false;
          this.handleReconnect();
        });

        this.socket.on('connect_error', (error: Error) => {
          console.error('🔌 WebSocket connection error:', error);
          this.isConnected = false;
          this.handleReconnect();
        });

        this.socket.on('error', (error: Error) => {
          console.error('🔌 WebSocket error:', error);
        });

      } catch (error) {
        console.error('Failed to initialize WebSocket:', error);
        reject(error);
      }
    });
  }

  private getAuthToken(): string | null {
    const userString = localStorage.getItem("charged_admin_user");
    if (userString) {
      const user = JSON.parse(userString);
      return user.token || null;
    }
    return null;
  }

  private handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      
      console.log(`🔄 Attempting to reconnect in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        if (!this.isConnected) {
          this.connect().catch(console.error);
        }
      }, delay);
    } else {
      console.error('❌ Max reconnection attempts reached');
    }
  }

  // Pricing Rules Event Handlers
  onPricingRuleUpdate(callback: (update: PricingRuleUpdate) => void) {
    this.socket?.on('pricing_rule_updated', callback);
  }

  onPricingRuleCreated(callback: (update: PricingRuleUpdate) => void) {
    this.socket?.on('pricing_rule_created', callback);
  }

  onPricingRuleDeleted(callback: (update: PricingRuleUpdate) => void) {
    this.socket?.on('pricing_rule_deleted', callback);
  }

  // Vehicle Class Event Handlers
  onVehicleClassUpdate(callback: (update: VehicleClassUpdate) => void) {
    this.socket?.on('vehicle_class_updated', callback);
  }

  onVehicleClassCreated(callback: (update: VehicleClassUpdate) => void) {
    this.socket?.on('vehicle_class_created', callback);
  }

  onVehicleClassDeleted(callback: (update: VehicleClassUpdate) => void) {
    this.socket?.on('vehicle_class_deleted', callback);
  }

  // Parcel Delivery Pricing Event Handlers
  onParcelDeliveryPricingUpdate(callback: (update: ParcelDeliveryPricingUpdate) => void) {
    this.socket?.on('parcel_delivery_pricing_updated', callback);
  }

  onParcelDeliveryPricingCreated(callback: (update: ParcelDeliveryPricingUpdate) => void) {
    this.socket?.on('parcel_delivery_pricing_created', callback);
  }

  onParcelDeliveryPricingDeleted(callback: (update: ParcelDeliveryPricingUpdate) => void) {
    this.socket?.on('parcel_delivery_pricing_deleted', callback);
  }

  // Generic event handlers
  onPricingUpdate(callback: (update: PricingRuleUpdate) => void) {
    this.onPricingRuleUpdate(callback);
    this.onPricingRuleCreated(callback);
    this.onPricingRuleDeleted(callback);
  }


  // Utility methods
  isSocketConnected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  disconnect() {
    if (this.socket) {
      console.log('🔌 Disconnecting WebSocket');
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Emit events
  emitPricingRuleChange(ruleId: number, changeType: 'created' | 'updated' | 'deleted') {
    this.socket?.emit('pricing_rule_changed', { ruleId, changeType });
  }

  emitVehicleClassChange(code: string, changeType: 'created' | 'updated' | 'deleted') {
    this.socket?.emit('vehicle_class_changed', { code, changeType });
  }

  emitParcelDeliveryPricingChange(id: number, changeType: 'created' | 'updated' | 'deleted') {
    this.socket?.emit('parcel_delivery_pricing_changed', { id, changeType });
  }
}

// Export singleton instance
export const websocketService = new WebSocketService();

// Export types
export type { PricingRuleUpdate, VehicleClassUpdate, ParcelDeliveryPricingUpdate };