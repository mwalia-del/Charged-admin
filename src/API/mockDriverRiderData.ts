import { Driver, Rider } from '../types';

// Mock driver data for development/testing
export const generateMockDrivers = (count: number = 20): Driver[] => {
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
    const createdDate = new Date();
    createdDate.setDate(createdDate.getDate() - Math.floor(Math.random() * 365)); // Random date within last year
    
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const fullName = `${firstName} ${lastName}`;
    
    // Generate consistent referral code based on driver ID (as would be done on client side)
    const driverId = `driver_${i.toString().padStart(6, '0')}`;
    const seed = driverId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let referralCode = '';
    let currentSeed = seed;
    
    for (let j = 0; j < 8; j++) {
      currentSeed = (currentSeed * 9301 + 49297) % 233280;
      referralCode += characters[Math.floor((currentSeed / 233280) * characters.length)];
    }
    
    // Add prefix as would be done on client side during registration
    const fullReferralCode = `DRV${referralCode}`;
    
    // Debug logging
    console.log(`🎭 Generated driver ${i}: ${fullName} - Referral Code: ${fullReferralCode}`);

    drivers.push({
      id: driverId,
      uuid: `uuid_${i}`,
      name: fullName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
      phone: `+1${Math.floor(Math.random() * 900) + 100}${Math.floor(Math.random() * 900) + 100}${Math.floor(Math.random() * 9000) + 1000}`,
      car_type: carTypes[Math.floor(Math.random() * carTypes.length)],
      license_plate: `${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${Math.floor(Math.random() * 9000) + 1000}`,
      rating: Math.round((Math.random() * 2 + 3) * 10) / 10, // 3.0 to 5.0
      total_rides: Math.floor(Math.random() * 500) + 50, // 50 to 550 rides
      is_active: Math.random() > 0.1, // 90% active
      photo: Math.random() > 0.5 ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${fullName}` : undefined,
      referral_code: fullReferralCode, // Full referral code with prefix as stored in database
      documents: [], // Will be populated separately
      vehicleDetails: {
        make: vehicleMakes[Math.floor(Math.random() * vehicleMakes.length)],
        model: vehicleModels[Math.floor(Math.random() * vehicleModels.length)],
        color: colors[Math.floor(Math.random() * colors.length)],
        year: Math.floor(Math.random() * 10) + 2015 // 2015 to 2025
      }
    });
  }
  
  return drivers;
};

// Mock rider data for development/testing
export const generateMockRiders = (count: number = 30): Rider[] => {
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
    const createdDate = new Date();
    createdDate.setDate(createdDate.getDate() - Math.floor(Math.random() * 365)); // Random date within last year
    
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const fullName = `${firstName} ${lastName}`;
    
    // Generate consistent referral code based on rider ID (as would be done on client side)
    const riderId = `rider_${i.toString().padStart(6, '0')}`;
    const seed = riderId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let referralCode = '';
    let currentSeed = seed;
    
    for (let j = 0; j < 8; j++) {
      currentSeed = (currentSeed * 9301 + 49297) % 233280;
      referralCode += characters[Math.floor((currentSeed / 233280) * characters.length)];
    }
    
    // Add prefix as would be done on client side during registration
    const fullReferralCode = `RID${referralCode}`;
    
    // Debug logging
    console.log(`🎭 Generated rider ${i}: ${fullName} - Referral Code: ${fullReferralCode}`);

    const lastRideDate = Math.random() > 0.2 ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() : undefined;

    riders.push({
      id: riderId,
      name: fullName,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
      phone: `+1${Math.floor(Math.random() * 900) + 100}${Math.floor(Math.random() * 900) + 100}${Math.floor(Math.random() * 9000) + 1000}`,
      rewardPoints: Math.floor(Math.random() * 1000) + 100, // 100 to 1100 points
      totalRides: Math.floor(Math.random() * 200) + 10, // 10 to 210 rides
      rating: Math.round((Math.random() * 2 + 3) * 10) / 10, // 3.0 to 5.0
      created_at: createdDate.toISOString(),
      lastRideDate: lastRideDate,
      photo: Math.random() > 0.5 ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${fullName}` : undefined,
      is_active: Math.random() > 0.15, // 85% active
      referral_code: fullReferralCode // Full referral code with prefix as stored in database
    });
  }
  
  return riders;
};
