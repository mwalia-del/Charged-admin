import { ScheduledRide, ScheduledRideSummary } from '../types';

const statuses: ScheduledRide['status'][] = ['scheduled', 'preparing', 'dispatching', 'converted', 'cancelled', 'failed'];
const sources: ScheduledRide['source'][] = ['rider', 'business'];

const pickupAddresses = [
  '123 Main St, Toronto, ON',
  '456 Queen St W, Toronto, ON',
  '789 King St E, Toronto, ON',
  '321 Bay St, Toronto, ON',
  '654 College St, Toronto, ON',
  '987 Bloor St W, Toronto, ON',
  '147 Yonge St, Toronto, ON',
  '258 Spadina Ave, Toronto, ON',
  '369 University Ave, Toronto, ON',
  '741 Dundas St W, Toronto, ON'
];

const dropoffAddresses = [
  'Toronto Pearson International Airport, Mississauga, ON',
  'Union Station, Toronto, ON',
  'CN Tower, Toronto, ON',
  'Rogers Centre, Toronto, ON',
  'Royal Ontario Museum, Toronto, ON',
  'Art Gallery of Ontario, Toronto, ON',
  'Casa Loma, Toronto, ON',
  'Distillery District, Toronto, ON',
  'Harbourfront Centre, Toronto, ON',
  'St. Lawrence Market, Toronto, ON'
];

const riderNames = [
  'John Smith', 'Sarah Johnson', 'Mike Chen', 'Emily Davis', 'David Wilson',
  'Lisa Brown', 'James Miller', 'Anna Garcia', 'Robert Martinez', 'Jennifer Anderson'
];

const orgNames = [
  'Acme Corporation', 'Tech Solutions Inc', 'Global Industries Ltd', 'Innovation Partners',
  'Premier Services Co', 'Elite Business Group', 'Strategic Ventures', 'Advanced Systems'
];

const driverNames = [
  'Alex Thompson', 'Maria Rodriguez', 'Ahmed Hassan', 'Jennifer Lee', 'Michael O\'Connor',
  'Priya Patel', 'Carlos Mendez', 'Sarah Kim', 'David Johnson', 'Lisa Wang'
];

const generateRandomLocation = (addresses: string[]) => {
  const address = addresses[Math.floor(Math.random() * addresses.length)];
  return {
    lat: 43.6532 + (Math.random() - 0.5) * 0.1, // Toronto area
    lng: -79.3832 + (Math.random() - 0.5) * 0.1,
    address
  };
};

const generateScheduledTime = () => {
  const now = new Date();
  const hoursFromNow = Math.floor(Math.random() * 48) + 1; // 1-48 hours from now
  const scheduledTime = new Date(now.getTime() + hoursFromNow * 60 * 60 * 1000);
  return scheduledTime.toISOString();
};

export const generateMockScheduledRides = (count: number): ScheduledRide[] => {
  const rides: ScheduledRide[] = [];
  
  for (let i = 1; i <= count; i++) {
    const source = sources[Math.floor(Math.random() * sources.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const pickup = generateRandomLocation(pickupAddresses);
    const dropoff = generateRandomLocation(dropoffAddresses);
    const scheduledFor = generateScheduledTime();
    const requestedAt = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString();
    
    const ride: ScheduledRide = {
      id: `scheduled-${i}`,
      rider_id: source === 'rider' ? `rider-${i}` : undefined,
      org_id: source === 'business' ? `org-${i}` : undefined,
      driver_id: Math.random() > 0.3 ? `driver-${i}` : undefined,
      pickup_lat: pickup.lat,
      pickup_lng: pickup.lng,
      dropoff_lat: dropoff.lat,
      dropoff_lng: dropoff.lng,
      pickup_address: pickup.address,
      dropoff_address: dropoff.address,
      requested_at: requestedAt,
      scheduled_for: scheduledFor,
      window_minutes: [5, 10, 15, 20][Math.floor(Math.random() * 4)],
      notes: Math.random() > 0.7 ? `Special instructions for ride ${i}` : undefined,
      est_fare_cents: Math.floor(Math.random() * 5000) + 1000, // $10-$60
      payment_intent_id: Math.random() > 0.5 ? `pi_${i}_${Date.now()}` : undefined,
      status,
      source,
      created_by: source === 'rider' ? `rider-${i}` : `admin-${i}`,
      created_at: requestedAt,
      updated_at: new Date().toISOString(),
      ride_id: status === 'converted' ? `ride-${i}` : undefined,
      rider_name: source === 'rider' ? riderNames[i % riderNames.length] : undefined,
      org_name: source === 'business' ? orgNames[i % orgNames.length] : undefined,
      driver_name: Math.random() > 0.3 ? driverNames[i % driverNames.length] : undefined
    };
    
    rides.push(ride);
  }
  
  return rides.sort((a, b) => new Date(a.scheduled_for).getTime() - new Date(b.scheduled_for).getTime());
};

export const generateMockScheduledSummary = (): ScheduledRideSummary => {
  
  return {
    scheduled_count: Math.floor(Math.random() * 50) + 20,
    converted_24h: Math.floor(Math.random() * 15) + 5,
    converted_7d: Math.floor(Math.random() * 100) + 30,
    cancelled_count: Math.floor(Math.random() * 10) + 2,
    failed_count: Math.floor(Math.random() * 5) + 1,
    upcoming_count: Math.floor(Math.random() * 25) + 10
  };
};
