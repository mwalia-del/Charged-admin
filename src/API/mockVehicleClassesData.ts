import { VehicleClass, VehicleClassesResponse } from '../types';

export const generateMockVehicleClasses = (): VehicleClass[] => {
  return [
    {
      id: 'vc-1',
      code: 'charged_x',
      display_name: 'Charged X',
      is_enabled: true,
      base_fare_cents: 500,
      per_km_cents: 180,
      per_min_cents: 25,
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 'vc-2',
      code: 'charged_black',
      display_name: 'Charged Black',
      is_enabled: true,
      base_fare_cents: 600,
      per_km_cents: 200,
      per_min_cents: 30,
      updated_at: '2024-01-01T00:00:00Z',
    },
    {
      id: 'vc-3',
      code: 'charged_xl',
      display_name: 'Charged XL',
      is_enabled: true,
      base_fare_cents: 800,
      per_km_cents: 250,
      per_min_cents: 35,
      updated_at: '2024-01-01T00:00:00Z',
    },
  ];
};

export const generateMockVehicleClassesResponse = (): VehicleClassesResponse => {
  const vehicleClasses = generateMockVehicleClasses();
  
  return {
    vehicle_classes: vehicleClasses,
    pagination: {
      page: 1,
      page_size: 20,
      total: vehicleClasses.length,
      total_pages: 1,
    },
  };
};
