import { Promotion, PromotionSummary, PromotionRedemption } from '../types';

export const generateMockPromotions = (): Promotion[] => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000);
  const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const nextMonth = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

  const promotions: Promotion[] = [
    {
      id: 'promo-1',
      title: 'New Rider Welcome',
      description: 'Get $5 off your first ride',
      audience: 'rider',
      reward_type: 'fixed_discount',
      value_cents: 500,
      start_at: lastWeek.toISOString(),
      end_at: nextMonth.toISOString(),
      priority: 10,
      is_active: true,
      max_uses_per_user: 1,
      global_cap: 1000,
      code: 'WELCOME5',
      criteria_json: { region: 'HFX', min_app_version: '1.0.0' },
      created_by: 'admin-1',
      updated_by: 'admin-1',
      created_at: lastWeek.toISOString(),
      updated_at: lastWeek.toISOString(),
      redemptions_count: 234,
      global_redemptions_count: 234
    },
    {
      id: 'promo-2',
      title: 'Driver Bonus Week',
      description: 'Extra $2 per completed ride',
      audience: 'driver',
      reward_type: 'cash_bonus',
      value_cents: 200,
      start_at: today.toISOString(),
      end_at: nextWeek.toISOString(),
      priority: 5,
      is_active: true,
      max_uses_per_user: 50,
      global_cap: 5000,
      criteria_json: { region: 'HFX' },
      created_by: 'admin-1',
      updated_by: 'admin-1',
      created_at: today.toISOString(),
      updated_at: today.toISOString(),
      redemptions_count: 89,
      global_redemptions_count: 89
    },
    {
      id: 'promo-3',
      title: 'Business Credit Boost',
      description: '10% bonus on credit purchases',
      audience: 'business',
      reward_type: 'org_credit',
      percent_off: 10,
      start_at: tomorrow.toISOString(),
      end_at: nextMonth.toISOString(),
      priority: 8,
      is_active: false,
      max_uses_per_user: 3,
      global_cap: 100,
      criteria_json: { region: 'HFX', min_app_version: 'web-1.0' },
      created_by: 'admin-2',
      updated_by: 'admin-2',
      created_at: today.toISOString(),
      updated_at: today.toISOString(),
      redemptions_count: 0,
      global_redemptions_count: 0
    },
    {
      id: 'promo-4',
      title: 'Weekend Special',
      description: '15% off all rides',
      audience: 'rider',
      reward_type: 'percent_discount',
      percent_off: 15,
      start_at: lastWeek.toISOString(),
      end_at: today.toISOString(),
      priority: 7,
      is_active: false,
      max_uses_per_user: 2,
      global_cap: 2000,
      criteria_json: { region: 'HFX' },
      created_by: 'admin-1',
      updated_by: 'admin-1',
      created_at: lastWeek.toISOString(),
      updated_at: lastWeek.toISOString(),
      redemptions_count: 1567,
      global_redemptions_count: 1567
    },
    {
      id: 'promo-5',
      title: 'Ride Credit Bonus',
      description: 'Get $10 ride credit for every $50 spent',
      audience: 'rider',
      reward_type: 'ride_credit',
      value_cents: 1000,
      start_at: today.toISOString(),
      end_at: nextMonth.toISOString(),
      priority: 6,
      is_active: true,
      max_uses_per_user: 5,
      global_cap: 500,
      criteria_json: { region: 'HFX', min_app_version: '1.2.0' },
      created_by: 'admin-2',
      updated_by: 'admin-2',
      created_at: today.toISOString(),
      updated_at: today.toISOString(),
      redemptions_count: 45,
      global_redemptions_count: 45
    },
    {
      id: 'promo-6',
      title: 'Driver Referral Bonus',
      description: 'Extra $50 for each successful driver referral',
      audience: 'driver',
      reward_type: 'cash_bonus',
      value_cents: 5000,
      start_at: today.toISOString(),
      end_at: nextMonth.toISOString(),
      priority: 9,
      is_active: true,
      max_uses_per_user: 10,
      global_cap: 200,
      criteria_json: { region: 'HFX' },
      created_by: 'admin-1',
      updated_by: 'admin-1',
      created_at: today.toISOString(),
      updated_at: today.toISOString(),
      redemptions_count: 12,
      global_redemptions_count: 12
    }
  ];

  return promotions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
};

export const generateMockPromotionSummary = (): PromotionSummary => {
  return {
    total_promotions: 6,
    active_promotions: 4,
    scheduled_promotions: 1,
    ended_promotions: 1,
    total_redemptions: 1947,
    total_value_cents: 125000
  };
};

export const generateMockPromotionRedemptions = (promotionId: string): PromotionRedemption[] => {
  const redemptions: PromotionRedemption[] = [];
  const now = new Date();
  
  for (let i = 0; i < 20; i++) {
    const createdAt = new Date(now.getTime() - Math.random() * 7 * 24 * 60 * 60 * 1000);
    redemptions.push({
      id: `redemption-${i + 1}`,
      promotion_id: promotionId,
      actor_type: Math.random() > 0.5 ? 'rider' : 'driver',
      actor_id: `actor-${i + 1}`,
      ride_id: Math.random() > 0.3 ? `ride-${i + 1}` : undefined,
      amount_cents: Math.floor(Math.random() * 1000) + 100,
      created_at: createdAt.toISOString()
    });
  }

  return redemptions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
};
