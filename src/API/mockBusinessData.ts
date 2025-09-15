import {
  Business,
  BusinessRide,
  BusinessWalletTransaction,
  BusinessInvoice,
  BusinessRewardsLedgerEntry,
} from '../types';

// Mock business data for development/testing
export const generateMockBusinesses = (count: number = 20): Business[] => {
  const businesses: Business[] = [];
  const billingModes: Array<"invoice" | "credit" | null> = ["invoice", "credit", "invoice", "credit", null];
  
  for (let i = 1; i <= count; i++) {
    const createdDate = new Date();
    createdDate.setDate(createdDate.getDate() - Math.floor(Math.random() * 365)); // Random date within last year
    
    businesses.push({
      org_id: `org_${i.toString().padStart(6, '0')}`,
      name: `Business ${i}`,
      email: `business${i}@example.com`,
      phone: `+1${Math.floor(Math.random() * 900) + 100}${Math.floor(Math.random() * 900) + 100}${Math.floor(Math.random() * 9000) + 1000}`,
      billing_mode: billingModes[Math.floor(Math.random() * billingModes.length)],
      wallet_balance_cents: Math.floor(Math.random() * 100000), // $0 to $1000
      rewards_points: Math.floor(Math.random() * 5000), // 0 to 5000 points
      active_rides_count: Math.floor(Math.random() * 50), // 0 to 50 active rides
      month_spend_cents: Math.floor(Math.random() * 50000), // $0 to $500
      created_at: createdDate.toISOString(),
      updated_at: new Date(createdDate.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
    });
  }
  
  return businesses;
};

export const generateMockBusinessRides = (count: number = 50): BusinessRide[] => {
  const rides: BusinessRide[] = [];
  const billingModes: Array<"invoice" | "credit"> = ["invoice", "credit"];
  
  for (let i = 1; i <= count; i++) {
    const startedDate = new Date();
    startedDate.setDate(startedDate.getDate() - Math.floor(Math.random() * 90)); // Random date within last 3 months
    
    const completedDate = new Date(startedDate.getTime() + Math.random() * 2 * 60 * 60 * 1000); // 0-2 hours later
    
    rides.push({
      ride_id: `ride_${i.toString().padStart(6, '0')}`,
      ride_number: `R${i.toString().padStart(6, '0')}`,
      started_at: startedDate.toISOString(),
      completed_at: completedDate.toISOString(),
      rider_id: `rider_${Math.floor(Math.random() * 20) + 1}`,
      driver_id: `driver_${Math.floor(Math.random() * 10) + 1}`,
      billable_amount_cents: Math.floor(Math.random() * 5000) + 1000, // $10 to $60
      billing_mode: billingModes[Math.floor(Math.random() * billingModes.length)]
    });
  }
  
  return rides.sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime());
};

export const generateMockBusinessWalletTransactions = (count: number = 50): BusinessWalletTransaction[] => {
  const transactions: BusinessWalletTransaction[] = [];
  const types: Array<"CREDIT" | "DEBIT" | "REFUND"> = ["CREDIT", "DEBIT", "REFUND"];
  const descriptions = [
    "Credit Purchase",
    "Ride Payment",
    "Refund for Cancelled Ride",
    "Monthly Credit Top-up",
    "Ride Fee Deduction"
  ];
  
  for (let i = 1; i <= count; i++) {
    const createdDate = new Date();
    createdDate.setDate(createdDate.getDate() - Math.floor(Math.random() * 90)); // Random date within last 3 months
    
    const type = types[Math.floor(Math.random() * types.length)];
    const amount = Math.floor(Math.random() * 10000) + 1000; // $10 to $110
    
    transactions.push({
      id: `txn_${i.toString().padStart(6, '0')}`,
      org_id: `org_${Math.floor(Math.random() * 5) + 1}`,
      type: type,
      amount_cents: type === "CREDIT" ? amount : -amount,
      currency: "CAD",
      description: descriptions[Math.floor(Math.random() * descriptions.length)],
      ride_id: Math.random() > 0.5 ? `ride_${Math.floor(Math.random() * 100) + 1}` : undefined,
      created_at: createdDate.toISOString()
    });
  }
  
  return transactions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
};

export const generateMockBusinessInvoices = (count: number = 20): BusinessInvoice[] => {
  const invoices: BusinessInvoice[] = [];
  const statuses: Array<"draft" | "sent" | "paid" | "overdue"> = ["draft", "sent", "paid", "overdue"];
  
  for (let i = 1; i <= count; i++) {
    const createdDate = new Date();
    createdDate.setDate(createdDate.getDate() - Math.floor(Math.random() * 365)); // Random date within last year
    
    const periodStart = new Date(createdDate);
    periodStart.setDate(1); // First day of month
    const periodEnd = new Date(periodStart);
    periodEnd.setMonth(periodEnd.getMonth() + 1);
    periodEnd.setDate(0); // Last day of month
    
    invoices.push({
      invoice_id: `inv_${i.toString().padStart(6, '0')}`,
      org_id: `org_${Math.floor(Math.random() * 5) + 1}`,
      period_start: periodStart.toISOString().split('T')[0],
      period_end: periodEnd.toISOString().split('T')[0],
      total_cents: Math.floor(Math.random() * 100000) + 10000, // $100 to $1100
      line_items_count: Math.floor(Math.random() * 50) + 5, // 5 to 55 line items
      status: statuses[Math.floor(Math.random() * statuses.length)],
      created_at: createdDate.toISOString()
    });
  }
  
  return invoices.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
};

export const generateMockBusinessRewards = (count: number = 50): BusinessRewardsLedgerEntry[] => {
  const entries: BusinessRewardsLedgerEntry[] = [];
  const reasons = [
    "Ride Completion",
    "Monthly Bonus",
    "Admin Adjustment",
    "Promotional Points",
    "Ride Cancellation Refund"
  ];
  
  for (let i = 1; i <= count; i++) {
    const createdDate = new Date();
    createdDate.setDate(createdDate.getDate() - Math.floor(Math.random() * 90)); // Random date within last 3 months
    
    const deltaPoints = Math.floor(Math.random() * 200) - 100; // -100 to +100 points
    const reason = reasons[Math.floor(Math.random() * reasons.length)];
    
    entries.push({
      entry_id: `entry_${i.toString().padStart(6, '0')}`,
      org_id: `org_${Math.floor(Math.random() * 5) + 1}`,
      delta_points: deltaPoints,
      reason: reason,
      ride_id: reason === "Ride Completion" ? `ride_${Math.floor(Math.random() * 100) + 1}` : undefined,
      created_at: createdDate.toISOString()
    });
  }
  
  return entries.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
};
