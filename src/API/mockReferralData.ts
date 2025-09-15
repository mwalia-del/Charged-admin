import { ReferralIssuance, ReferralSummary, ReferralWallet, ReferralWalletTransaction, ReferralWalletResponse } from '../types';

// Mock referral data for development/testing
export const generateMockReferralIssuances = (count: number = 100): ReferralIssuance[] => {
  const issuances: ReferralIssuance[] = [];
  const referrerTypes: Array<'driver' | 'rider'> = ['driver', 'rider'];
  const statuses: Array<'issued' | 'voided' | 'refunded'> = ['issued', 'issued', 'issued', 'voided', 'refunded'];
  const tiers: Array<1 | 2> = [1, 2];
  const currencies = ['CAD'];
  
  for (let i = 1; i <= count; i++) {
    const createdDate = new Date();
    createdDate.setDate(createdDate.getDate() - Math.floor(Math.random() * 90)); // Random date within last 3 months
    
    const referrerType = referrerTypes[Math.floor(Math.random() * referrerTypes.length)];
    const tier = tiers[Math.floor(Math.random() * tiers.length)];
    const amountCents = tier === 1 ? 25 : 50; // $0.25 for tier 1, $0.50 for tier 2
    
    issuances.push({
      issuance_id: `issuance_${i.toString().padStart(6, '0')}`,
      ride_id: `ride_${i.toString().padStart(6, '0')}`,
      ride_number: `R${i.toString().padStart(6, '0')}`,
      referred_rider_id: `rider_${Math.floor(Math.random() * 50) + 1}`,
      referred_rider_name: `Rider ${Math.floor(Math.random() * 50) + 1}`,
      referrer_type: referrerType,
      referrer_id: `${referrerType}_${Math.floor(Math.random() * 20) + 1}`,
      referrer_name: `${referrerType === 'driver' ? 'Driver' : 'Rider'} ${Math.floor(Math.random() * 20) + 1}`,
      tier: tier,
      amount_cents: amountCents,
      currency: currencies[Math.floor(Math.random() * currencies.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      created_at: createdDate.toISOString()
    });
  }
  
  return issuances.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
};

export const generateMockReferralSummary = (): ReferralSummary => {
  const mockIssuances = generateMockReferralIssuances(100);
  
  const totalAmount = mockIssuances.reduce((sum, issuance) => sum + issuance.amount_cents, 0);
  const count = mockIssuances.length;
  
  // Group by tier
  const tier1Issuances = mockIssuances.filter(issuance => issuance.tier === 1);
  const tier2Issuances = mockIssuances.filter(issuance => issuance.tier === 2);
  
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
  
  // Group by referrer
  const referrerMap = new Map<string, {
    referrer_type: 'driver' | 'rider';
    referrer_id: string;
    referrer_name: string;
    count: number;
    amount_cents: number;
  }>();
  
  mockIssuances.forEach(issuance => {
    const key = `${issuance.referrer_type}_${issuance.referrer_id}`;
    if (!referrerMap.has(key)) {
      referrerMap.set(key, {
        referrer_type: issuance.referrer_type,
        referrer_id: issuance.referrer_id,
        referrer_name: issuance.referrer_name,
        count: 0,
        amount_cents: 0
      });
    }
    
    const referrer = referrerMap.get(key)!;
    referrer.count += 1;
    referrer.amount_cents += issuance.amount_cents;
  });
  
  const byReferrer = Array.from(referrerMap.values())
    .sort((a, b) => b.amount_cents - a.amount_cents)
    .slice(0, 10); // Top 10 referrers
  
  return {
    total_amount_cents: totalAmount,
    count: count,
    by_tier: byTier,
    by_referrer: byReferrer
  };
};

// ===== MOCK WALLET FUNCTIONS =====

export const generateMockReferralWallet = (userId: string, userType: 'driver' | 'rider'): ReferralWalletResponse => {
  const totalEarnings = Math.floor(Math.random() * 50000) + 10000; // $100-$600
  const referralCredits = Math.floor(totalEarnings * 0.3); // 30% from referrals
  const availableBalance = Math.floor(referralCredits * 0.8); // 80% available
  const pendingBalance = referralCredits - availableBalance;

  const wallet: ReferralWallet = {
    user_id: userId,
    user_type: userType,
    total_earnings_cents: totalEarnings,
    total_referral_credits_cents: referralCredits,
    available_balance_cents: availableBalance,
    pending_balance_cents: pendingBalance,
    currency: 'CAD',
    last_updated: new Date().toISOString()
  };

  const recentTransactions = generateMockReferralWalletTransactions(userId, userType, 5);

  return {
    wallet,
    recent_transactions: recentTransactions,
    pagination: {
      page: 1,
      page_size: 5,
      total: recentTransactions.length,
      total_pages: 1
    }
  };
};

export const generateMockReferralWalletTransactions = (
  userId: string, 
  userType: 'driver' | 'rider', 
  count: number = 20
): ReferralWalletTransaction[] => {
  const transactions: ReferralWalletTransaction[] = [];
  const transactionTypes: Array<'REFERRAL_CREDIT' | 'REFERRAL_REVERSAL' | 'PAYOUT' | 'ADJUSTMENT'> = [
    'REFERRAL_CREDIT', 'REFERRAL_CREDIT', 'REFERRAL_CREDIT', 'PAYOUT', 'ADJUSTMENT'
  ];
  const statuses: Array<'pending' | 'completed' | 'failed' | 'cancelled'> = [
    'completed', 'completed', 'completed', 'pending', 'failed'
  ];

  for (let i = 1; i <= count; i++) {
    const createdDate = new Date();
    createdDate.setDate(createdDate.getDate() - Math.floor(Math.random() * 30)); // Last 30 days
    
    const transactionType = transactionTypes[Math.floor(Math.random() * transactionTypes.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const amountCents = transactionType === 'REFERRAL_CREDIT' 
      ? (Math.random() > 0.5 ? 25 : 50) // $0.25 or $0.50
      : Math.floor(Math.random() * 2000) + 500; // $5-$25 for other types

    const descriptions = {
      'REFERRAL_CREDIT': `Referral reward from ride completion`,
      'REFERRAL_REVERSAL': `Referral reward reversal`,
      'PAYOUT': `Payout to ${userType === 'driver' ? 'bank account' : 'ride credits'}`,
      'ADJUSTMENT': `Admin adjustment`
    };

    transactions.push({
      id: `txn_${i.toString().padStart(6, '0')}`,
      user_id: userId,
      user_type: userType,
      transaction_type: transactionType,
      amount_cents: amountCents,
      currency: 'CAD',
      description: descriptions[transactionType],
      reference_id: transactionType === 'REFERRAL_CREDIT' ? `ride_${Math.floor(Math.random() * 1000)}` : undefined,
      status: status,
      created_at: createdDate.toISOString(),
      processed_at: status === 'completed' ? new Date(createdDate.getTime() + Math.random() * 86400000).toISOString() : undefined
    });
  }

  return transactions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
};

export const generateMockReferralWallets = (userType: 'driver' | 'rider', count: number = 10): ReferralWallet[] => {
  const wallets: ReferralWallet[] = [];

  for (let i = 1; i <= count; i++) {
    const userId = `${userType}_${i}`;
    const totalEarnings = Math.floor(Math.random() * 100000) + 5000; // $50-$1050
    const referralCredits = Math.floor(totalEarnings * (0.2 + Math.random() * 0.3)); // 20-50% from referrals
    const availableBalance = Math.floor(referralCredits * (0.7 + Math.random() * 0.2)); // 70-90% available
    const pendingBalance = referralCredits - availableBalance;

    wallets.push({
      user_id: userId,
      user_type: userType,
      total_earnings_cents: totalEarnings,
      total_referral_credits_cents: referralCredits,
      available_balance_cents: availableBalance,
      pending_balance_cents: pendingBalance,
      currency: 'CAD',
      last_updated: new Date(Date.now() - Math.random() * 86400000).toISOString() // Last 24 hours
    });
  }

  return wallets.sort((a, b) => b.total_referral_credits_cents - a.total_referral_credits_cents);
};
