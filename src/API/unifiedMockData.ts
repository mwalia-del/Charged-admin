import { Driver, Rider, ReferralIssuance, ReferralWallet, ReferralWalletTransaction, Tip, TipSummary, ReferralSummary } from '../types/index';

// Central mock data store to ensure consistency across all components
class UnifiedMockDataStore {
  private drivers: Driver[] = [];
  private riders: Rider[] = [];
  private referralIssuances: ReferralIssuance[] = [];
  private referralWallets: Map<string, ReferralWallet> = new Map();
  private referralTransactions: Map<string, ReferralWalletTransaction[]> = new Map();
  private tips: Tip[] = [];

  // Initialize all mock data with consistent relationships
  initialize(count: { drivers?: number; riders?: number; issuances?: number; tips?: number } = {}) {
    const driverCount = count.drivers || 10;
    const riderCount = count.riders || 30;
    const issuanceCount = count.issuances || 100;
    const tipCount = count.tips || 50;

    // Generate drivers first
    this.drivers = this.generateDrivers(driverCount);
    
    // Generate riders
    this.riders = this.generateRiders(riderCount);
    
    // Generate referral issuances that reference actual drivers/riders
    this.referralIssuances = this.generateReferralIssuances(issuanceCount);
    
    // Generate referral wallets for all drivers and riders
    this.generateReferralWallets();
    
    // Generate referral transactions
    this.generateReferralTransactions();
    
    // Generate tips that reference actual drivers/riders
    this.tips = this.generateTips(tipCount);
  }

  private generateDrivers(count: number): Driver[] {
    const drivers: Driver[] = [];
    const carTypes: Array<"electric" | "regular" | "suv"> = ["electric", "regular", "suv"];
    const firstNames = [
      'John', 'Sarah', 'Mike', 'Emily', 'David', 'Lisa', 'James', 'Anna', 'Robert', 'Jennifer',
      'Alex', 'Maria', 'Ahmed', 'Priya', 'Carlos', 'Sarah', 'Michael', 'Lisa', 'Daniel', 'Jessica'
    ];
    const lastNames = [
      'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
      'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'
    ];
    const vehicleMakes = ['Toyota', 'Honda', 'Ford', 'Chevrolet', 'Nissan', 'BMW', 'Mercedes', 'Audi', 'Hyundai', 'Kia'];
    const vehicleModels = ['Camry', 'Civic', 'Focus', 'Malibu', 'Altima', '3 Series', 'C-Class', 'A4', 'Elantra', 'Optima'];
    const colors = ['White', 'Black', 'Silver', 'Red', 'Blue', 'Gray', 'Green', 'Gold'];

    for (let i = 1; i <= count; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const fullName = `${firstName} ${lastName}`;
      
      // Generate consistent referral code based on driver ID
      const driverId = `driver_${i.toString().padStart(6, '0')}`;
      const referralCode = this.generateReferralCode(driverId, 'DRV');
      
      const createdDate = new Date();
      createdDate.setDate(createdDate.getDate() - Math.floor(Math.random() * 365));

      drivers.push({
        id: driverId,
        uuid: `uuid_${i}`,
        name: fullName,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
        phone: `+1${Math.floor(Math.random() * 900) + 100}${Math.floor(Math.random() * 900) + 100}${Math.floor(Math.random() * 9000) + 1000}`,
        car_type: carTypes[Math.floor(Math.random() * carTypes.length)],
        license_plate: `${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${Math.floor(Math.random() * 9000) + 1000}`,
        rating: Math.round((Math.random() * 2 + 3) * 10) / 10,
        total_rides: Math.floor(Math.random() * 500) + 50,
        is_active: Math.random() > 0.1,
        photo: Math.random() > 0.5 ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${fullName}` : undefined,
        referral_code: referralCode,
        documents: [],
        vehicleDetails: {
          make: vehicleMakes[Math.floor(Math.random() * vehicleMakes.length)],
          model: vehicleModels[Math.floor(Math.random() * vehicleModels.length)],
          color: colors[Math.floor(Math.random() * colors.length)],
          year: Math.floor(Math.random() * 10) + 2015
        }
      });
    }
    
    return drivers;
  }

  private generateRiders(count: number): Rider[] {
    const riders: Rider[] = [];
    const firstNames = [
      'John', 'Sarah', 'Mike', 'Emily', 'David', 'Lisa', 'James', 'Anna', 'Robert', 'Jennifer',
      'Alex', 'Maria', 'Ahmed', 'Priya', 'Carlos', 'Sarah', 'Michael', 'Lisa', 'Daniel', 'Jessica',
      'Chris', 'Amanda', 'Ryan', 'Michelle', 'Kevin', 'Ashley', 'Brian', 'Stephanie', 'Mark', 'Nicole'
    ];
    const lastNames = [
      'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez',
      'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin',
      'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson'
    ];

    for (let i = 1; i <= count; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const fullName = `${firstName} ${lastName}`;
      
      // Generate consistent referral code based on rider ID
      const riderId = `rider_${i.toString().padStart(6, '0')}`;
      const referralCode = this.generateReferralCode(riderId, 'RID');
      
      const createdDate = new Date();
      createdDate.setDate(createdDate.getDate() - Math.floor(Math.random() * 365));
      
      const lastRideDate = Math.random() > 0.2 ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() : undefined;

      riders.push({
        id: riderId,
        name: fullName,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
        phone: `+1${Math.floor(Math.random() * 900) + 100}${Math.floor(Math.random() * 900) + 100}${Math.floor(Math.random() * 9000) + 1000}`,
        rewardPoints: Math.floor(Math.random() * 1000) + 100,
        totalRides: Math.floor(Math.random() * 200) + 10,
        rating: Math.round((Math.random() * 2 + 3) * 10) / 10,
        created_at: createdDate.toISOString(),
        lastRideDate: lastRideDate,
        photo: Math.random() > 0.5 ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${fullName}` : undefined,
        is_active: Math.random() > 0.15,
        referral_code: referralCode
      });
    }
    
    return riders;
  }

  private generateReferralCode(id: string, prefix: string): string {
    const seed = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let referralCode = '';
    let currentSeed = seed;
    
    for (let j = 0; j < 8; j++) {
      currentSeed = (currentSeed * 9301 + 49297) % 233280;
      referralCode += characters[Math.floor((currentSeed / 233280) * characters.length)];
    }
    
    return `${prefix}${referralCode}`;
  }

  private generateReferralIssuances(count: number): ReferralIssuance[] {
    const issuances: ReferralIssuance[] = [];
    const referrerTypes: Array<'driver' | 'rider'> = ['driver', 'rider'];
    const statuses: Array<'issued' | 'voided' | 'refunded'> = ['issued', 'issued', 'issued', 'voided', 'refunded'];
    const tiers: Array<1 | 2> = [1, 2];
    
    for (let i = 1; i <= count; i++) {
      const createdDate = new Date();
      createdDate.setDate(createdDate.getDate() - Math.floor(Math.random() * 90));
      
      const referrerType = referrerTypes[Math.floor(Math.random() * referrerTypes.length)];
      const tier = tiers[Math.floor(Math.random() * tiers.length)];
      const amountCents = tier === 1 ? 25 : 50; // $0.25 for tier 1, $0.50 for tier 2
      
      // Reference actual drivers/riders from our store
      const referrer = referrerType === 'driver' 
        ? this.drivers[Math.floor(Math.random() * this.drivers.length)]
        : this.riders[Math.floor(Math.random() * this.riders.length)];
      
      const referredRider = this.riders[Math.floor(Math.random() * this.riders.length)];
      
      issuances.push({
        issuance_id: `issuance_${i.toString().padStart(6, '0')}`,
        ride_id: `ride_${i.toString().padStart(6, '0')}`,
        ride_number: `R${i.toString().padStart(6, '0')}`,
        referred_rider_id: referredRider.id,
        referred_rider_name: referredRider.name,
        referrer_type: referrerType,
        referrer_id: referrer.id,
        referrer_name: referrer.name,
        tier: tier,
        amount_cents: amountCents,
        currency: 'CAD',
        status: statuses[Math.floor(Math.random() * statuses.length)],
        created_at: createdDate.toISOString()
      });
    }
    
    return issuances.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  private generateReferralWallets(): void {
    // Generate wallets for all drivers
    this.drivers.forEach(driver => {
      const totalEarnings = Math.floor(Math.random() * 100000) + 5000; // $50-$1050
      const referralCredits = Math.floor(totalEarnings * (0.2 + Math.random() * 0.3)); // 20-50% from referrals
      const availableBalance = Math.floor(referralCredits * (0.7 + Math.random() * 0.2)); // 70-90% available
      const pendingBalance = referralCredits - availableBalance;

      this.referralWallets.set(driver.id, {
        user_id: driver.id,
        user_type: 'driver',
        total_earnings_cents: totalEarnings,
        total_referral_credits_cents: referralCredits,
        available_balance_cents: availableBalance,
        pending_balance_cents: pendingBalance,
        currency: 'CAD',
        last_updated: new Date(Date.now() - Math.random() * 86400000).toISOString()
      });
    });

    // Generate wallets for all riders
    this.riders.forEach(rider => {
      const totalEarnings = Math.floor(Math.random() * 50000) + 1000; // $10-$510
      const referralCredits = Math.floor(totalEarnings * (0.3 + Math.random() * 0.4)); // 30-70% from referrals
      const availableBalance = Math.floor(referralCredits * (0.8 + Math.random() * 0.15)); // 80-95% available
      const pendingBalance = referralCredits - availableBalance;

      this.referralWallets.set(rider.id, {
        user_id: rider.id,
        user_type: 'rider',
        total_earnings_cents: totalEarnings,
        total_referral_credits_cents: referralCredits,
        available_balance_cents: availableBalance,
        pending_balance_cents: pendingBalance,
        currency: 'CAD',
        last_updated: new Date(Date.now() - Math.random() * 86400000).toISOString()
      });
    });
  }

  private generateReferralTransactions(): void {
    // Generate transactions for each wallet
    this.referralWallets.forEach((wallet, userId) => {
      const transactions: ReferralWalletTransaction[] = [];
      const transactionTypes: Array<'REFERRAL_CREDIT' | 'PAYOUT' | 'REFERRAL_REVERSAL' | 'ADJUSTMENT'> = 
        ['REFERRAL_CREDIT', 'REFERRAL_CREDIT', 'REFERRAL_CREDIT', 'PAYOUT', 'REFERRAL_REVERSAL', 'ADJUSTMENT'];
      
      const transactionCount = Math.floor(Math.random() * 20) + 5; // 5-25 transactions
      
      for (let i = 0; i < transactionCount; i++) {
        const createdDate = new Date();
        createdDate.setDate(createdDate.getDate() - Math.floor(Math.random() * 90));
        
        const transactionType = transactionTypes[Math.floor(Math.random() * transactionTypes.length)];
        let amountCents = 0;
        
        switch (transactionType) {
          case 'REFERRAL_CREDIT':
            amountCents = Math.floor(Math.random() * 200) + 25; // $0.25-$2.25
            break;
          case 'PAYOUT':
            amountCents = -(Math.floor(Math.random() * 5000) + 1000); // -$10-$60
            break;
          case 'REFERRAL_REVERSAL':
            amountCents = -(Math.floor(Math.random() * 100) + 25); // -$0.25-$1.25
            break;
          case 'ADJUSTMENT':
            amountCents = Math.floor(Math.random() * 400) - 200; // -$2 to $2
            break;
        }
        
        transactions.push({
          id: `txn_${userId}_${i.toString().padStart(3, '0')}`,
          user_id: userId,
          user_type: wallet.user_type,
          transaction_type: transactionType,
          amount_cents: amountCents,
          currency: 'CAD',
          description: this.getTransactionDescription(transactionType),
          status: 'completed',
          created_at: createdDate.toISOString()
        });
      }
      
      this.referralTransactions.set(userId, transactions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    });
  }

  private getTransactionDescription(type: string): string {
    switch (type) {
      case 'REFERRAL_CREDIT': return 'Referral reward earned';
      case 'PAYOUT': return 'Payout processed';
      case 'REFERRAL_REVERSAL': return 'Refund processed';
      case 'ADJUSTMENT': return 'Manual adjustment';
      default: return 'Transaction';
    }
  }

  private generateTips(count: number): Tip[] {
    const tips: Tip[] = [];
    const statuses: Array<'authorized' | 'settled' | 'refunded' | 'void'> = ['settled', 'settled', 'settled', 'authorized', 'refunded'];
    
    for (let i = 1; i <= count; i++) {
      const createdDate = new Date();
      createdDate.setDate(createdDate.getDate() - Math.floor(Math.random() * 90));
      
      // Reference actual drivers and riders from our store
      const driver = this.drivers[Math.floor(Math.random() * this.drivers.length)];
      const rider = this.riders[Math.floor(Math.random() * this.riders.length)];
      
      tips.push({
        tip_id: `tip_${i.toString().padStart(6, '0')}`,
        ride_id: `ride_${i.toString().padStart(6, '0')}`,
        ride_number: `R${i.toString().padStart(6, '0')}`,
        rider_id: rider.id,
        rider_name: rider.name,
        driver_id: driver.id,
        driver_name: driver.name,
        amount_cents: Math.floor(Math.random() * 2000) + 100, // $1.00 to $21.00
        currency: 'CAD',
        status: statuses[Math.floor(Math.random() * statuses.length)],
        created_at: createdDate.toISOString()
      });
    }
    
    return tips.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  // Getters for accessing the data
  getDrivers(): Driver[] {
    return this.drivers;
  }

  getRiders(): Rider[] {
    return this.riders;
  }

  getReferralIssuances(): ReferralIssuance[] {
    return this.referralIssuances;
  }

  getReferralWallet(userId: string): ReferralWallet | undefined {
    return this.referralWallets.get(userId);
  }

  getReferralWalletTransactions(userId: string): ReferralWalletTransaction[] {
    return this.referralTransactions.get(userId) || [];
  }

  getTips(): Tip[] {
    return this.tips;
  }

  getReferralSummary(): ReferralSummary {
    const totalAmount = this.referralIssuances.reduce((sum, issuance) => sum + issuance.amount_cents, 0);
    const count = this.referralIssuances.length;
    
    const tier1Issuances = this.referralIssuances.filter(issuance => issuance.tier === 1);
    const tier2Issuances = this.referralIssuances.filter(issuance => issuance.tier === 2);
    
    const byTier = [
      {
        tier: 1 as const,
        count: tier1Issuances.length,
        amount_cents: tier1Issuances.reduce((sum, issuance) => sum + issuance.amount_cents, 0)
      },
      {
        tier: 2 as const,
        count: tier2Issuances.length,
        amount_cents: tier2Issuances.reduce((sum, issuance) => sum + issuance.amount_cents, 0)
      }
    ];
    
    const driverIssuances = this.referralIssuances.filter(issuance => issuance.referrer_type === 'driver');
    const riderIssuances = this.referralIssuances.filter(issuance => issuance.referrer_type === 'rider');
    
    const byReferrerType = [
      {
        referrer_type: 'driver' as const,
        referrer_id: 'driver_summary',
        referrer_name: 'Drivers',
        count: driverIssuances.length,
        amount_cents: driverIssuances.reduce((sum, issuance) => sum + issuance.amount_cents, 0)
      },
      {
        referrer_type: 'rider' as const,
        referrer_id: 'rider_summary',
        referrer_name: 'Riders',
        count: riderIssuances.length,
        amount_cents: riderIssuances.reduce((sum, issuance) => sum + issuance.amount_cents, 0)
      }
    ];
    
    return {
      total_amount_cents: totalAmount,
      count: count,
      by_tier: byTier,
      by_referrer: byReferrerType
    };
  }

  getTipSummary(): TipSummary {
    const totalAmount = this.tips.reduce((sum, tip) => sum + tip.amount_cents, 0);
    const count = this.tips.length;
    
    // Group by driver
    const driverMap = new Map<string, { name: string; total: number; count: number }>();
    this.tips.forEach(tip => {
      if (!driverMap.has(tip.driver_id)) {
        driverMap.set(tip.driver_id, { name: tip.driver_name, total: 0, count: 0 });
      }
      const driver = driverMap.get(tip.driver_id)!;
      driver.total += tip.amount_cents;
      driver.count += 1;
    });
    
    // Group by rider
    const riderMap = new Map<string, { name: string; total: number; count: number }>();
    this.tips.forEach(tip => {
      if (!riderMap.has(tip.rider_id)) {
        riderMap.set(tip.rider_id, { name: tip.rider_name, total: 0, count: 0 });
      }
      const rider = riderMap.get(tip.rider_id)!;
      rider.total += tip.amount_cents;
      rider.count += 1;
    });
    
    return {
      total_amount_cents: totalAmount,
      count: count,
      by_driver: Array.from(driverMap.entries()).map(([id, data]) => ({
        driver_id: id,
        driver_name: data.name,
        total_amount_cents: data.total,
        count: data.count
      })),
      by_rider: Array.from(riderMap.entries()).map(([id, data]) => ({
        rider_id: id,
        rider_name: data.name,
        total_amount_cents: data.total,
        count: data.count
      }))
    };
  }
}

// Create a singleton instance
const mockDataStore = new UnifiedMockDataStore();

// Initialize with default counts
mockDataStore.initialize({
  drivers: 10,
  riders: 30,
  issuances: 100,
  tips: 50
});

// Export functions that use the unified store
export const getUnifiedDrivers = (): Driver[] => mockDataStore.getDrivers();
export const getUnifiedRiders = (): Rider[] => mockDataStore.getRiders();
export const getUnifiedReferralIssuances = (): ReferralIssuance[] => mockDataStore.getReferralIssuances();
export const getUnifiedReferralWallet = (userId: string): ReferralWallet | undefined => mockDataStore.getReferralWallet(userId);
export const getUnifiedReferralWalletTransactions = (userId: string): ReferralWalletTransaction[] => mockDataStore.getReferralWalletTransactions(userId);
export const getUnifiedTips = (): Tip[] => mockDataStore.getTips();
export const getUnifiedReferralSummary = (): ReferralSummary => mockDataStore.getReferralSummary();
export const getUnifiedTipSummary = (): TipSummary => mockDataStore.getTipSummary();

// Export the store for advanced usage
export { mockDataStore };
