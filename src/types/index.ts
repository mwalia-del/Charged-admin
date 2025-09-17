// User types
export interface User {
  token?: string;
  id: string;
  name: string;
  email: string;
  role: "admin" | "support";
  createdAt: any;
  photo?: string;
}

// Auth types
export interface AuthState {
  user: User | null;
  error: string | null;
}

// Ride types
export type RideStatus = "request" | "accepted" | "completed" | "canceled";
export type RideType = "electric" | "regular" | "suv";

export interface Location {
  latitude: number;
  longitude: number;
  address: string;
}

export interface Ride {
  id: string;
  rider_id: string;
  driver_id: string;
  ride_type_id: RideType;
  status: RideStatus;
  pickup_address: String;
  dropoff_address: String;
  distance_km: number; // in kilometers
  duration_minutes: number; // in minutes
  base_fare: number;
  started_at?: string;
  arrived_at?: string;
  cancelled_at?: string;
  cancellation_reason?: string;
  cancellation_fee: boolean;
  driverDistanceAtCancel?: number; // in meters
  rating: number;
  created_at: string;
}

// Rider types
export interface Rider {
  id: string;
  name: string;
  email: string;
  phone: string;
  rewardPoints: number;
  totalRides: number;
  rating: number;
  created_at: string;
  lastRideDate?: string;
  photo?: string;
  is_active: boolean;
  referral_code?: string; // 8-digit alphanumeric referral code
}

// Driver types
export interface Driver {
  id: string;
  uuid: string;
  name: string;
  email: string;
  phone: string;
  car_type: RideType;
  license_plate: string;
  rating: number;
  total_rides: number;
  address?: Location;
  is_active: boolean;
  photo?: string;
  documents: DriverDocument[];
  referral_code?: string; // 8-digit alphanumeric referral code
  vehicleDetails?: {
    make: string;
    model: string;
    color: string;
    year: number;
  };
}

export type DocumentType =
  | "driverLicense"
  | "vehicleInsurance"
  | "vehiclePermit"
  | "backgroundCheck"
  | "workEligibility"
  | "driverAbstract"
  | "vehicleDetails";

export type DocumentStatus =
  | "pending"
  | "verified"
  | "rejected"
  | "expired"
  | "notSubmitted";

export interface DriverDocumentpayload {
  status: string;
  rejection_reason?: string;
  notes?: string;
}

export interface Driverstatuspayload {
  is_active: true | false;
}

export interface DriverDocument {
  id: string;
  document_type: DocumentType;
  status: DocumentStatus;
  uploaded_at?: string;
  updated_at?: string;
  expiry_date?: string;
  reviewed_by?: string;
  notes?: string;
  rejection_reason?: string | null;
  file_url?: string;
  user_id: string;
}

export interface requiredDocuments {
  id: number;
  name: string;
  display_name: string;
  description: string;
  is_required: boolean;
  user_type: string;
  created_at: string;
}

// Pricing types not required anymore replaced with ridetypes
export interface PricingRule {
  id: string;
  rideTypeId: RideType;
  basePrice: number;
  pricePerKm: number;
  pricePerMinute: number;
  surgeMultiplier: number;
  cancellationFee: number;
  refundEligibilityDistance: number; // in meters
  commissionPercentage: number; // percentage of driver earnings that go to the platform
  minimumBillableDistance: number; // kilometers included in base price (e.g., 2km)
  createdAt: string;
  updatedAt: string;
}

//Type of rides
export interface rideTypes {
  id: number;
  name: string;
  description: string;
  base_price: string;
  price_per_km: string;
  price_per_minute: string;
  min_fare: string;
  icon: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  cancel_fee: string;
  refund_distance_in_m: number;
  minimum_billable_distance: string;
  commission_percentage: string;
  keyword?: string;
  govt_tax_percentage: string;
}

// Dashboard statistics
export interface DashboardStats {
  rideCount: string;
  activeDrivers: string;
  totalRevenue: string;
  platformCommission: string;
  rideTypeCounts: {
    name: string;
    count: string;
  }[];
  recentRides?: Ride[];
}

export interface RewardPointDetail {
  id: number;
  description: string;
  reward: string;
  amount: number;
  ride_id: number;
  created_at: string;
  updated_at: string;
  user_id: number;
  redeem_by: number;
}

export interface ChangeRewardPointsBody {
  description?: string;
  amount?: number;
}

export interface Reward {
  id: number;
  title: string;
  description: string;
  point_required: number;
  created_at: string;
  updated_at: string;
}

export interface CreateRewardBody {
  title: string;
  description: string;
  point_required: string | number;
}

// Tip types
export interface Tip {
  tip_id: string;
  ride_id: string;
  ride_number: string;
  rider_id: string;
  rider_name: string;
  driver_id: string;
  driver_name: string;
  amount_cents: number;
  currency: string;
  status: "authorized" | "settled" | "refunded" | "void";
  created_at: string;
}

export interface TipSummary {
  total_amount_cents: number;
  count: number;
  by_driver: Array<{
    driver_id: string;
    driver_name: string;
    total_amount_cents: number;
    count: number;
  }>;
  by_rider: Array<{
    rider_id: string;
    rider_name: string;
    total_amount_cents: number;
    count: number;
  }>;
}

export interface TipsFilters {
  actor_type?: "driver" | "rider" | "ride";
  actor_id?: string;
  range?: "last_ride" | "this_week" | "this_month" | "last_3_months" | "custom";
  start_date?: string;
  end_date?: string;
  page?: number;
  page_size?: number;
}

export interface TipsResponse {
  rows: Tip[];
  pagination: {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
  };
}

// Business types
export interface Business {
  org_id: string;
  name: string;
  email: string;
  phone: string;
  billing_mode: "invoice" | "credit" | null;
  wallet_balance_cents: number;
  rewards_points: number;
  active_rides_count: number;
  month_spend_cents: number;
  created_at: string;
  updated_at: string;
}

export interface BusinessRide {
  ride_id: string;
  ride_number: string;
  started_at: string;
  completed_at: string;
  rider_id: string;
  driver_id: string;
  billable_amount_cents: number;
  billing_mode: "invoice" | "credit";
}

export interface BusinessRideSummary {
  total_rides: number;
  total_billable_cents: number;
  by_driver: Array<{
    driver_id: string;
    driver_name: string;
    total_cents: number;
    count: number;
  }>;
  by_day: Array<{
    date: string;
    total_cents: number;
    count: number;
  }>;
}

export interface BusinessWalletTransaction {
  id: string;
  org_id: string;
  type: "CREDIT" | "DEBIT" | "REFUND";
  amount_cents: number;
  currency: string;
  description: string;
  ride_id?: string;
  created_at: string;
}

export interface BusinessInvoice {
  invoice_id: string;
  org_id: string;
  period_start: string;
  period_end: string;
  total_cents: number;
  line_items_count: number;
  status: "draft" | "sent" | "paid" | "overdue";
  created_at: string;
}

export interface BusinessInvoiceLineItem {
  ride_id: string;
  ride_number: string;
  amount_cents: number;
  completed_at: string;
}

export interface BusinessRewardsSummary {
  points: number;
  lifetime_points: number;
  last_earned_at: string;
}

export interface BusinessRewardsLedgerEntry {
  entry_id: string;
  org_id: string;
  delta_points: number;
  reason: string;
  ride_id?: string;
  created_at: string;
}

export interface BusinessFilters {
  range?: "today" | "this_week" | "this_month" | "last_3_months" | "custom";
  start_date?: string;
  end_date?: string;
  page?: number;
  page_size?: number;
}

export interface BusinessRidesResponse {
  rows: BusinessRide[];
  pagination: {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
  };
}

export interface BusinessWalletResponse {
  transactions: BusinessWalletTransaction[];
  pagination: {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
  };
}

export interface BusinessInvoicesResponse {
  invoices: BusinessInvoice[];
  pagination: {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
  };
}

export interface BusinessRewardsResponse {
  entries: BusinessRewardsLedgerEntry[];
  pagination: {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
  };
}

// Referral types
export interface Referral {
  id: string;
  referred_rider_id: string;
  referrer_type: 'driver' | 'rider';
  referrer_id: string;
  created_at: string;
}

export interface ReferralIssuance {
  issuance_id: string;
  ride_id: string;
  ride_number: string;
  referred_rider_id: string;
  referred_rider_name: string;
  referrer_type: 'driver' | 'rider';
  referrer_id: string;
  referrer_name: string;
  referrer_code: string; // The actual referral code (e.g., DRV12345678)
  tier: 1 | 2;
  amount_cents: number;
  currency: string;
  status: 'issued' | 'voided' | 'refunded';
  created_at: string;
}

export interface ReferralSummary {
  total_amount_cents: number;
  count: number;
  by_tier: Array<{
    tier: 1 | 2;
    count: number;
    amount_cents: number;
  }>;
  by_referrer: Array<{
    referrer_type: 'driver' | 'rider';
    referrer_id: string;
    referrer_name: string;
    count: number;
    amount_cents: number;
  }>;
}

export interface ReferralFilters {
  range?: "last_ride" | "this_week" | "this_month" | "last_3_months" | "custom";
  start_date?: string;
  end_date?: string;
  actor_type?: "referrer" | "referred" | "ride";
  actor_id?: string;
  referral_id?: string; // Easy filtering by referral ID
  page?: number;
  page_size?: number;
}

export interface ReferralIssuancesResponse {
  rows: ReferralIssuance[];
  pagination: {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
  };
}

export interface ReferralClaimRequest {
  code: string;
}

export interface ReferralClaimResponse {
  referred_rider_id: string;
  referrer_type: 'driver' | 'rider';
  referrer_id: string;
  created_at: string;
}

export interface VoidReferralRequest {
  reason: string;
}

export interface VoidReferralResponse {
  status: 'voided';
}

// Wallet types for referrals
export interface ReferralWallet {
  user_id: string;
  user_type: 'driver' | 'rider';
  total_earnings_cents: number;
  total_referral_credits_cents: number;
  available_balance_cents: number;
  pending_balance_cents: number;
  currency: string;
  last_updated: string;
}

export interface ReferralWalletTransaction {
  id: string;
  user_id: string;
  user_type: 'driver' | 'rider';
  transaction_type: 'REFERRAL_CREDIT' | 'REFERRAL_REVERSAL' | 'PAYOUT' | 'ADJUSTMENT';
  amount_cents: number;
  currency: string;
  description: string;
  reference_id?: string; // ride_id, issuance_id, etc.
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  created_at: string;
  processed_at?: string;
}

export interface ReferralWalletResponse {
  wallet: ReferralWallet;
  recent_transactions: ReferralWalletTransaction[];
  pagination: {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
  };
}

// ===== SCHEDULED RIDES =====

export interface ScheduledRide {
  id: string;
  rider_id?: string;
  org_id?: string;
  driver_id?: string;
  pickup_lat: number;
  pickup_lng: number;
  dropoff_lat: number;
  dropoff_lng: number;
  pickup_address: string;
  dropoff_address: string;
  requested_at: string;
  scheduled_for: string;
  window_minutes: number;
  notes?: string;
  est_fare_cents?: number;
  payment_intent_id?: string;
  status: 'scheduled' | 'preparing' | 'dispatching' | 'converted' | 'cancelled' | 'failed';
  source: 'rider' | 'business';
  created_by: string;
  created_at: string;
  updated_at: string;
  ride_id?: string;
  rider_name?: string;
  org_name?: string;
  driver_name?: string;
}

export interface ScheduledRideRequest {
  pickup: {
    lat: number;
    lng: number;
    address: string;
  };
  dropoff: {
    lat: number;
    lng: number;
    address: string;
  };
  scheduled_for: string;
  window_minutes?: number;
  notes?: string;
}

export interface ScheduledRideUpdate {
  scheduled_for?: string;
  window_minutes?: number;
  notes?: string;
  pickup?: {
    lat: number;
    lng: number;
    address: string;
  };
  dropoff?: {
    lat: number;
    lng: number;
    address: string;
  };
}

export interface ScheduledRideFilters {
  status?: 'scheduled' | 'preparing' | 'dispatching' | 'converted' | 'cancelled' | 'failed';
  source?: 'rider' | 'business';
  org_id?: string;
  rider_id?: string;
  from?: string;
  to?: string;
  page?: number;
  page_size?: number;
  search?: string;
  dateRange?: string;
}

export interface ScheduledRideSummary {
  scheduled_count: number;
  converted_24h: number;
  converted_7d: number;
  cancelled_count: number;
  failed_count: number;
  upcoming_count: number;
}

export interface ScheduledRidesResponse {
  data: ScheduledRide[];
  pagination: {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
  };
}

export interface AssignDriverRequest {
  driver_id: string;
}

export interface CancelScheduledRequest {
  reason: string;
}

// Promotions Types
export interface Promotion {
  id: string;
  title: string;
  description?: string;
  audience: 'rider' | 'driver' | 'business';
  reward_type: 'ride_credit' | 'cash_bonus' | 'org_credit' | 'percent_discount' | 'fixed_discount';
  value_cents?: number;
  percent_off?: number;
  start_at: string;
  end_at: string;
  priority: number;
  is_active: boolean;
  max_uses_per_user?: number;
  global_cap?: number;
  code?: string;
  criteria_json?: Record<string, any>;
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
  redemptions_count?: number;
  global_redemptions_count?: number;
}

export interface PromotionRedemption {
  id: string;
  promotion_id: string;
  actor_type: 'rider' | 'driver' | 'business';
  actor_id: string;
  ride_id?: string;
  amount_cents: number;
  created_at: string;
}

export interface PromotionFilters {
  audience?: 'rider' | 'driver' | 'business';
  status?: 'active' | 'scheduled' | 'ended';
  from?: string;
  to?: string;
  search?: string;
  page?: number;
  page_size?: number;
}

export interface PromotionSummary {
  total_promotions: number;
  active_promotions: number;
  scheduled_promotions: number;
  ended_promotions: number;
  total_redemptions: number;
  total_value_cents: number;
}

export interface PromotionsResponse {
  promotions: Promotion[];
  pagination: {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
  };
}

export interface PromotionPreview {
  eligible: boolean;
  promotion_id?: string;
  reward_type?: string;
  value_cents?: number;
  percent_off?: number;
  reason?: string;
}

export interface PromotionPreviewRequest {
  actor_id: string;
  region?: string;
  app_version?: string;
  now?: string;
}

export interface ApplyPromotionRequest {
  code?: string;
}

export interface ApplyPromotionResponse {
  applied: boolean;
  promotion_id?: string;
  reward_type?: string;
  value_cents?: number;
  percent_off?: number;
}

export enum UserType {
  DRIVER = "driver",
  RIDER = "rider",
  BUSINESS = "business",
}

export interface createDocumentType {
  name: string;
  display_name: string;
  description: string;
  is_required: boolean;
  user_type: UserType;
}

export interface updateDocumentType {
  name?: string;
  display_name?: string;
  description?: string;
  is_required?: boolean;
  user_type?: UserType;
}

export enum AdjustmentType {
  INCREMENT = "INCREMENT",
  DECREMENT = "DECREMENT",
}

// Vehicle Class types
export interface VehicleClass {
  id: string;
  code: string;
  display_name: string;
  is_enabled: boolean;
  updated_at: string;
}

export interface VehicleClassUpdate {
  is_enabled?: boolean;
}

export interface VehicleClassesResponse {
  vehicle_classes: VehicleClass[];
  pagination: {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
  };
}

export interface CatalogVehicleClassesResponse {
  vehicle_classes: VehicleClass[];
}

export interface RealtimeVehicleClassUpdate {
  code: string;
  is_enabled: boolean;
  updated_at: string;
}
