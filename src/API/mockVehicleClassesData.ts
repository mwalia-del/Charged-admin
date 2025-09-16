import { VehicleClass, VehicleClassesResponse } from '../types';

export const generateMockVehicleClasses = (): VehicleClass[] => {
  return [
    {
      id: 'vc-3',
      code: 'charged_xl',
      display_name: 'Charged XL',
      is_enabled: true,
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
