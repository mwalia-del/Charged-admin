// @ts-ignore
import { create } from 'zustand';
// @ts-ignore
import { devtools } from 'zustand/middleware';
import { rideTypes, VehicleClass } from '../types';
import pricingApi from '../services/pricingApi';
import { websocketService, PricingRuleUpdate, VehicleClassUpdate } from '../services/websocketService';

interface PricingState {
  // State
  pricingRules: rideTypes[];
  vehicleClasses: VehicleClass[];
  loading: boolean;
  vehicleClassesLoading: boolean;
  error: string | null;
  vehicleClassesError: string | null;
  savingRules: Record<string, boolean>;
  updatingVehicleClasses: Record<string, boolean>;
  
  // WebSocket connection
  isWebSocketConnected: boolean;
  
  // Actions
  fetchPricingRules: () => Promise<void>;
  fetchVehicleClasses: () => Promise<void>;
  updatePricingRule: (id: number, data: Partial<rideTypes>) => Promise<void>;
  createPricingRule: (data: Omit<rideTypes, 'id' | 'created_at' | 'updated_at'>) => Promise<void>;
  deletePricingRule: (id: number) => Promise<void>;
  toggleVehicleClass: (code: string, enabled: boolean) => Promise<void>;
  updateVehicleClass: (code: string, data: Partial<VehicleClass>) => Promise<void>;
  
  // WebSocket actions
  connectWebSocket: () => Promise<void>;
  disconnectWebSocket: () => void;
  
  // Utility actions
  setError: (error: string | null) => void;
  setVehicleClassesError: (error: string | null) => void;
  clearErrors: () => void;
}

export const usePricingStore = create<PricingState>()(
  devtools(
    (set: any, get: any) => ({
      // Initial state
      pricingRules: [],
      vehicleClasses: [],
      loading: false,
      vehicleClassesLoading: false,
      error: null,
      vehicleClassesError: null,
      savingRules: {},
      updatingVehicleClasses: {},
      isWebSocketConnected: false,

      // Fetch pricing rules
      fetchPricingRules: async () => {
        set({ loading: true, error: null });
        try {
          const rules = await pricingApi.getPricingRules();
          set({ pricingRules: rules, loading: false });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch pricing rules';
          set({ error: errorMessage, loading: false });
        }
      },

      // Fetch vehicle classes
      fetchVehicleClasses: async () => {
        set({ vehicleClassesLoading: true, vehicleClassesError: null });
        try {
          const response = await pricingApi.getVehicleClasses();
          set({ vehicleClasses: response.vehicle_classes, vehicleClassesLoading: false });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch vehicle classes';
          set({ vehicleClassesError: errorMessage, vehicleClassesLoading: false });
        }
      },

      // Update pricing rule
      updatePricingRule: async (id: number, data: Partial<rideTypes>) => {
        const ruleId = id.toString();
        set((state: PricingState) => ({
          savingRules: { ...state.savingRules, [ruleId]: true }
        }));

        try {
          // Validate data
          const validation = pricingApi.validatePricingRule(data);
          if (!validation.isValid) {
            throw new Error(validation.errors.join(', '));
          }

          const updatedRule = await pricingApi.updatePricingRule(id, data);
          
          set((state: PricingState) => ({
            pricingRules: state.pricingRules.map((rule: rideTypes) => 
              rule.id === id ? updatedRule : rule
            ),
            savingRules: { ...state.savingRules, [ruleId]: false }
          }));

          // Emit WebSocket event
          websocketService.emitPricingRuleChange(id, 'updated');
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update pricing rule';
          set((state: PricingState) => ({
            error: errorMessage,
            savingRules: { ...state.savingRules, [ruleId]: false }
          }));
          throw error;
        }
      },

      // Create pricing rule
      createPricingRule: async (data: Omit<rideTypes, 'id' | 'created_at' | 'updated_at'>) => {
        try {
          // Validate data
          const validation = pricingApi.validatePricingRule(data);
          if (!validation.isValid) {
            throw new Error(validation.errors.join(', '));
          }

          const newRule = await pricingApi.createPricingRule(data);
          
          set((state: PricingState) => ({
            pricingRules: [...state.pricingRules, newRule]
          }));

          // Emit WebSocket event
          websocketService.emitPricingRuleChange(newRule.id, 'created');
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to create pricing rule';
          set({ error: errorMessage });
          throw error;
        }
      },

      // Delete pricing rule
      deletePricingRule: async (id: number) => {
        try {
          await pricingApi.deletePricingRule(id);
          
          set((state: PricingState) => ({
            pricingRules: state.pricingRules.filter((rule: rideTypes) => rule.id !== id)
          }));

          // Emit WebSocket event
          websocketService.emitPricingRuleChange(id, 'deleted');
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to delete pricing rule';
          set({ error: errorMessage });
          throw error;
        }
      },

      // Toggle vehicle class
      toggleVehicleClass: async (code: string, enabled: boolean) => {
        set((state: PricingState) => ({
          updatingVehicleClasses: { ...state.updatingVehicleClasses, [code]: true }
        }));

        try {
          const updatedClass = await pricingApi.updateVehicleClass(code, { is_enabled: enabled });
          
          set((state: PricingState) => ({
            vehicleClasses: state.vehicleClasses.map((vc: VehicleClass) => 
              vc.code === code ? updatedClass : vc
            ),
            updatingVehicleClasses: { ...state.updatingVehicleClasses, [code]: false }
          }));

          // Emit WebSocket event
          websocketService.emitVehicleClassChange(code, 'updated');
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update vehicle class';
          set((state: PricingState) => ({
            vehicleClassesError: errorMessage,
            updatingVehicleClasses: { ...state.updatingVehicleClasses, [code]: false }
          }));
          throw error;
        }
      },

      // Update vehicle class
      updateVehicleClass: async (code: string, data: Partial<VehicleClass>) => {
        set((state: PricingState) => ({
          updatingVehicleClasses: { ...state.updatingVehicleClasses, [code]: true }
        }));

        try {
          const updatedClass = await pricingApi.updateVehicleClass(code, data);
          
          set((state: PricingState) => ({
            vehicleClasses: state.vehicleClasses.map((vc: VehicleClass) => 
              vc.code === code ? updatedClass : vc
            ),
            updatingVehicleClasses: { ...state.updatingVehicleClasses, [code]: false }
          }));

          // Emit WebSocket event
          websocketService.emitVehicleClassChange(code, 'updated');
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to update vehicle class';
          set((state: PricingState) => ({
            vehicleClassesError: errorMessage,
            updatingVehicleClasses: { ...state.updatingVehicleClasses, [code]: false }
          }));
          throw error;
        }
      },

      // Connect WebSocket
      connectWebSocket: async () => {
        try {
          await websocketService.connect();
          
          set({ isWebSocketConnected: true });

          // Set up event listeners
          websocketService.onPricingUpdate((update: PricingRuleUpdate) => {
            const state = get();
            
            if (update.type === 'created') {
              set({ pricingRules: [...state.pricingRules, update.rule] });
            } else if (update.type === 'updated') {
              set({
                pricingRules: state.pricingRules.map((rule: rideTypes) => 
                  rule.id === update.id ? update.rule : rule
                )
              });
            } else if (update.type === 'deleted') {
              set({
                pricingRules: state.pricingRules.filter((rule: rideTypes) => rule.id !== update.id)
              });
            }
          });

          websocketService.onVehicleClassUpdate((update: VehicleClassUpdate) => {
            const state = get();
            
            if (update.type === 'created') {
              set({ vehicleClasses: [...state.vehicleClasses, update as unknown as VehicleClass] });
            } else if (update.type === 'updated') {
              set({
                vehicleClasses: state.vehicleClasses.map((vc: VehicleClass) => 
                  vc.code === update.code ? { ...vc, ...update } : vc
                )
              });
            } else if (update.type === 'deleted') {
              set({
                vehicleClasses: state.vehicleClasses.filter((vc: VehicleClass) => vc.code !== update.code)
              });
            }
          });

        } catch (error) {
          console.error('Failed to connect WebSocket:', error);
          set({ isWebSocketConnected: false });
        }
      },

      // Disconnect WebSocket
      disconnectWebSocket: () => {
        websocketService.disconnect();
        set({ isWebSocketConnected: false });
      },

      // Utility actions
      setError: (error: string | null) => set({ error }),
      setVehicleClassesError: (error: string | null) => set({ vehicleClassesError: error }),
      clearErrors: () => set({ error: null, vehicleClassesError: null }),
    }),
    {
      name: 'pricing-store',
    }
  )
);