import { Tip, TipSummary } from '../types';

// Mock tips data for development/testing
export const generateMockTips = (count: number = 50): Tip[] => {
  const tips: Tip[] = [];
  const statuses: Array<'authorized' | 'settled' | 'refunded' | 'void'> = ['settled', 'settled', 'settled', 'authorized', 'refunded'];
  const currencies = ['CAD', 'USD'];
  
  for (let i = 1; i <= count; i++) {
    const createdDate = new Date();
    createdDate.setDate(createdDate.getDate() - Math.floor(Math.random() * 90)); // Random date within last 3 months
    
    tips.push({
      tip_id: `tip_${i.toString().padStart(6, '0')}`,
      ride_id: `ride_${i.toString().padStart(6, '0')}`,
      ride_number: `R${i.toString().padStart(6, '0')}`,
      rider_id: `rider_${Math.floor(Math.random() * 20) + 1}`,
      rider_name: `Rider ${Math.floor(Math.random() * 20) + 1}`,
      driver_id: `driver_${Math.floor(Math.random() * 10) + 1}`,
      driver_name: `Driver ${Math.floor(Math.random() * 10) + 1}`,
      amount_cents: Math.floor(Math.random() * 2000) + 100, // $1.00 to $21.00
      currency: currencies[Math.floor(Math.random() * currencies.length)],
      status: statuses[Math.floor(Math.random() * statuses.length)],
      created_at: createdDate.toISOString()
    });
  }
  
  return tips.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
};

export const generateMockSummary = (tips: Tip[]): TipSummary => {
  const totalAmount = tips.reduce((sum, tip) => sum + tip.amount_cents, 0);
  const count = tips.length;
  
  // Group by driver
  const driverMap = new Map<string, { name: string; total: number; count: number }>();
  tips.forEach(tip => {
    if (!driverMap.has(tip.driver_id)) {
      driverMap.set(tip.driver_id, { name: tip.driver_name, total: 0, count: 0 });
    }
    const driver = driverMap.get(tip.driver_id)!;
    driver.total += tip.amount_cents;
    driver.count += 1;
  });
  
  // Group by rider
  const riderMap = new Map<string, { name: string; total: number; count: number }>();
  tips.forEach(tip => {
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
};
