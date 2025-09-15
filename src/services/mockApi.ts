import {
  Ride,
  Rider,
  Driver,
  PricingRule,
  DashboardStats,
  RideType,
  Location,
  DriverDocument,
  DocumentStatus,
  DocumentType,
} from "../types";

// Mock data for ride types
const rideTypes = [
  {
    id: "type-1",
    name: "Electric",
    basePrice: 5.0,
    pricePerKm: 1.5,
    pricePerMinute: 0.3,
    description: "Eco-friendly electric vehicle",
    icon: "electric_car",
  },
  {
    id: "type-2",
    name: "Regular",
    basePrice: 3.5,
    pricePerKm: 1.2,
    pricePerMinute: 0.25,
    description: "Standard vehicle for everyday rides",
    icon: "directions_car",
  },
  {
    id: "type-3",
    name: "SUV",
    basePrice: 7.0,
    pricePerKm: 2.0,
    pricePerMinute: 0.4,
    description: "Spacious SUV for larger groups",
    icon: "airport_shuttle",
  },
];

// Mock data for pricing rules
const pricingRules: PricingRule[] = [
  {
    id: "price-1",
    rideTypeId: "electric",
    basePrice: 5.0,
    pricePerKm: 1.5,
    pricePerMinute: 0.3,
    surgeMultiplier: 1.5,
    cancellationFee: 4.0,
    refundEligibilityDistance: 70, // in meters
    commissionPercentage: 15, // 15% of driver earnings go to the platform
    minimumBillableDistance: 2, // first 2km included in base price
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "price-2",
    rideTypeId: "regular",
    basePrice: 3.5,
    pricePerKm: 1.2,
    pricePerMinute: 0.25,
    surgeMultiplier: 1.3,
    cancellationFee: 3.0,
    refundEligibilityDistance: 70, // in meters
    commissionPercentage: 15, // 15% of driver earnings go to the platform
    minimumBillableDistance: 2, // first 2km included in base price
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "price-3",
    rideTypeId: "suv",
    basePrice: 7.0,
    pricePerKm: 2.0,
    pricePerMinute: 0.4,
    surgeMultiplier: 1.7,
    cancellationFee: 5.0,
    refundEligibilityDistance: 70, // in meters
    commissionPercentage: 15, // 15% of driver earnings go to the platform
    minimumBillableDistance: 2, // first 2km included in base price
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
  },
];

// Generate random riders
const generateRiders = (count: number): Rider[] => {
  const riders: Rider[] = [];

  for (let i = 1; i <= count; i++) {
    const totalRides = Math.floor(Math.random() * 30) + 1;
    const rewardPoints =
      Math.floor(Math.random() * totalRides * 10) + totalRides * 5;
    const signedUpDate = new Date(
      Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000,
    ).toISOString();
    const lastRideDate =
      Math.random() > 0.1
        ? new Date(
            Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000,
          ).toISOString()
        : undefined;

    riders.push({
      id: `${i}`,
      name: `Rider ${i}`,
      email: `rider${i}@example.com`,
      phone: `+1${Math.floor(Math.random() * 900) + 100}${Math.floor(Math.random() * 900) + 100}${Math.floor(Math.random() * 9000) + 1000}`,
      rewardPoints,
      totalRides,
      rating: Math.round((Math.random() * 4 + 1) * 10) / 10, // Random rating between 1.0 and 5.0
      created_at: signedUpDate,
      lastRideDate,
      photo: `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? "men" : "women"}/${i % 70}.jpg`,
      is_active: Math.random() > 0.1, // 90% chance of being active
    });
  }

  return riders;
};

// Generate random drivers
const generateDrivers = (count: number): Driver[] => {
  const drivers: Driver[] = [];
  const vehicleTypes: RideType[] = ["electric", "regular", "suv"];
  const vehicleMakes = [
    "Toyota",
    "Honda",
    "Tesla",
    "Ford",
    "Chevrolet",
    "Nissan",
    "BMW",
  ];
  const vehicleModels = [
    "Corolla",
    "Civic",
    "Model 3",
    "Focus",
    "Cruze",
    "Sentra",
    "X3",
  ];
  const vehicleColors = ["Black", "White", "Silver", "Red", "Blue", "Grey"];
  const documentStatuses: DocumentStatus[] = [
    "pending",
    "verified",
    "rejected",
    "expired",
    "notSubmitted",
  ];

  for (let i = 1; i <= count; i++) {
    const totalRides = Math.floor(Math.random() * 50) + 10;
    const vehicleType =
      vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)];
    const vehicleMake =
      vehicleMakes[Math.floor(Math.random() * vehicleMakes.length)];
    const vehicleModel =
      vehicleModels[Math.floor(Math.random() * vehicleModels.length)];
    const vehicleColor =
      vehicleColors[Math.floor(Math.random() * vehicleColors.length)];
    const vehicleYear = Math.floor(Math.random() * 10) + 2013;

    // Generate random documents with varying statuses
    const generateDocument = (type: DocumentType): DriverDocument => {
      const status =
        documentStatuses[Math.floor(Math.random() * documentStatuses.length)];
      const dateSubmitted =
        status !== "notSubmitted"
          ? new Date(
              Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000,
            ).toISOString()
          : undefined;
      const dateReviewed =
        status === "verified" || status === "rejected"
          ? new Date(
              Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
            ).toISOString()
          : undefined;
      const expiryDate =
        status === "verified" || status === "expired"
          ? new Date(
              Date.now() +
                (status === "expired" ? -1 : 1) *
                  Math.random() *
                  365 *
                  24 *
                  60 *
                  60 *
                  1000,
            ).toISOString()
          : undefined;

      return {
        id: `${type}-${i}`,
        document_type: type,
        status,
        uploaded_at: dateSubmitted,
        user_id: `driver-${i}`,
        updated_at: dateReviewed,
        expiry_date: expiryDate,
        reviewed_by: dateReviewed ? "Admin User" : undefined,
        notes:
          status === "rejected" ? "Document unclear or incomplete" : undefined,
        file_url:
          status !== "notSubmitted"
            ? `https://example.com/documents/${type}-${i}.pdf`
            : undefined,
      };
    };

    const documents: DriverDocument[] = [
      generateDocument("driverLicense"),
      generateDocument("vehicleInsurance"),
      generateDocument("vehiclePermit"),
      generateDocument("backgroundCheck"),
      generateDocument("workEligibility"),
      generateDocument("driverAbstract"),
      generateDocument("vehicleDetails"),
    ];

    drivers.push({
      uuid: `driver-${i}`,
      id: `${i}`,
      name: `Driver ${i}`,
      email: `driver${i}@example.com`,
      phone: `+1${Math.floor(Math.random() * 900) + 100}${Math.floor(Math.random() * 900) + 100}${Math.floor(Math.random() * 9000) + 1000}`,
      car_type: vehicleType,
      license_plate: `${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${Math.floor(Math.random() * 900) + 100}`,
      rating: Math.floor(Math.random() * 15 + 35) / 10,
      total_rides: totalRides,
      is_active: Math.random() > 0.3,
      address: {
        latitude: 37.7749 + (Math.random() - 0.5) * 0.1,
        longitude: -122.4194 + (Math.random() - 0.5) * 0.1,
        address: "San Francisco, CA",
      },
      photo: `https://randomuser.me/api/portraits/men/${(i % 70) + 30}.jpg`,
      documents,
      vehicleDetails: {
        make: vehicleMake,
        model: vehicleModel,
        color: vehicleColor,
        year: vehicleYear,
      },
    });
  }

  return drivers;
};

// Generate mock riders and drivers
const mockRiders = generateRiders(50);
const mockDrivers = generateDrivers(30);

// Generate random rides
const generateRides = (count: number): Ride[] => {
  const rides: Ride[] = [];
  const statuses: Ride["status"][] = [
    "request",
    "accepted",
    "completed",
    "canceled",
  ];
  const rideTypes: RideType[] = ["electric", "regular", "suv"];

  const generateLocation = (): Location => ({
    latitude: 37.7749 + (Math.random() - 0.5) * 0.1,
    longitude: -122.4194 + (Math.random() - 0.5) * 0.1,
    address: [
      ["Market St", "Mission St", "Valencia St", "Castro St", "Divisadero St"][
        Math.floor(Math.random() * 5)
      ],
      ["San Francisco", "CA", "94103"].join(", "),
    ].join(", "),
  });

  for (let i = 1; i <= count; i++) {
    const createdAt = new Date(
      Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000,
    ).toISOString();
    const rideType = rideTypes[Math.floor(Math.random() * rideTypes.length)];
    const riderId =
      mockRiders[Math.floor(Math.random() * mockRiders.length)].id;
    const driverId =
      mockDrivers[Math.floor(Math.random() * mockDrivers.length)].uuid;
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    const distance = Math.random() * 10 + 1; // 1-11 km
    const duration = Math.floor(distance * 3 + Math.random() * 10); // rough time in minutes

    const rule =
      pricingRules.find((r) => r.rideTypeId === rideType) || pricingRules[0];
    let fare =
      rule.basePrice +
      distance * rule.pricePerKm +
      duration * rule.pricePerMinute;

    // Round to 2 decimal places
    fare = Math.round(fare * 100) / 100;

    const startTime =
      status === "request"
        ? undefined
        : new Date(new Date(createdAt).getTime() + 5 * 60 * 1000).toISOString();

    const endTime =
      status === "completed"
        ? new Date(
            new Date(startTime || createdAt).getTime() + duration * 60 * 1000,
          ).toISOString()
        : undefined;

    const cancelTime =
      status === "canceled"
        ? new Date(
            new Date(startTime || createdAt).getTime() +
              Math.random() * 10 * 60 * 1000,
          ).toISOString()
        : undefined;

    const cancelReason =
      status === "canceled"
        ? [
            "Change of plans",
            "Driver taking too long",
            "Emergency",
            "Booked by mistake",
          ][Math.floor(Math.random() * 4)]
        : undefined;

    const driverDistanceAtCancel =
      status === "canceled" ? Math.floor(Math.random() * 200) : undefined;

    const refunded =
      status === "canceled" &&
      driverDistanceAtCancel !== undefined &&
      driverDistanceAtCancel > 70
        ? Math.random() > 0.5
        : false;

    const pointsAwarded = status === "completed" ? Math.floor(fare) : 0;

    rides.push({
      id: `ride-${i}`,
      rider_id: riderId,
      driver_id: driverId,
      ride_type_id: rideType,
      status,
      pickup_address: generateLocation().address,
      dropoff_address: generateLocation().address,
      distance_km: distance,
      duration_minutes: duration,
      base_fare: fare,
      started_at: startTime,
      arrived_at: endTime,
      cancelled_at: cancelTime,
      cancellation_reason: cancelReason,
      cancellation_fee: refunded,
      driverDistanceAtCancel,
      rating: pointsAwarded,
      created_at: createdAt,
    });
  }

  // Sort rides by most recent first
  return rides.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
};

const mockRides = generateRides(200);

// Generate dashboard statistics
const generateDashboardStats = (): DashboardStats => {
  const completedRides = mockRides.filter(
    (ride) => ride.status === "completed",
  );
  // const cancelledRides = mockRides.filter(
  //   (ride) => ride.status === "canceled",
  // );

  const totalRevenue = completedRides.reduce(
    (sum, ride) => sum + ride.base_fare,
    0,
  );

  // Calculate commission based on the average of all pricing rules
  const avgCommissionRate =
    pricingRules.reduce((sum, rule) => sum + rule.commissionPercentage, 0) /
    pricingRules.length;
  const totalCommission = totalRevenue * (avgCommissionRate / 100);

  // const totalRefunds = cancelledRides
  //   .filter((ride) => ride.cancellation_fee)
  //   .reduce((sum, ride) => sum + ride.base_fare, 0);
  // const totalPoints = mockRiders.reduce(
  //   (sum, rider) => sum + rider.rewardPoints,
  //   0,
  // );

  const ridesByType = [
    {
      name: "Electric",
      count: mockRides
        .filter((ride) => ride.ride_type_id === "electric")
        .length.toString(),
    },
    {
      name: "Regular",
      count: mockRides
        .filter((ride) => ride.ride_type_id === "regular")
        .length.toString(),
    },
    {
      name: "SUV",
      count: mockRides
        .filter((ride) => ride.ride_type_id === "suv")
        .length.toString(),
    },
  ];

  return {
    rideCount: mockRides.length.toString(),
    activeDrivers: mockDrivers
      .filter((driver) => driver.is_active)
      .length.toString(),
    totalRevenue: totalRevenue.toString(),
    platformCommission: totalCommission.toString(),
    rideTypeCounts: ridesByType,
  };
};

// Mock API service
export const mockApi = {
  // Dashboard
  getDashboardStats: async (): Promise<DashboardStats> => {
    await new Promise((resolve) => setTimeout(resolve, 800)); // Simulate network delay
    return generateDashboardStats();
  },

  // Ride Types
  getRideTypes: async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return rideTypes;
  },

  getRideType: async (id: string) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const rideType = rideTypes.find((rt) => rt.id === id);
    if (!rideType) throw new Error("Ride type not found");
    return rideType;
  },

  updateRideType: async (id: string, data: any) => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    const index = rideTypes.findIndex((rt) => rt.id === id);
    if (index === -1) throw new Error("Ride type not found");

    rideTypes[index] = {
      ...rideTypes[index],
      ...data,
    };

    return rideTypes[index];
  },

  // Pricing Rules
  getPricingRules: async (): Promise<PricingRule[]> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return pricingRules;
  },

  getPricingRule: async (id: string): Promise<PricingRule> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const rule = pricingRules.find((r) => r.id === id);
    if (!rule) throw new Error("Pricing rule not found");
    return rule;
  },

  updatePricingRule: async (
    id: string,
    data: Partial<PricingRule>,
  ): Promise<PricingRule> => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    const index = pricingRules.findIndex((r) => r.id === id);
    if (index === -1) throw new Error("Pricing rule not found");

    pricingRules[index] = {
      ...pricingRules[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    return pricingRules[index];
  },

  getRider: async (id: string): Promise<Rider> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const rider = mockRiders.find((r) => r.id === id);
    if (!rider) throw new Error("Rider not found");
    return rider;
  },

  getDriver: async (id: string): Promise<Driver> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const driver = mockDrivers.find((d) => d.uuid === id);
    if (!driver) throw new Error("Driver not found");
    return driver;
  },

  updateDriverStatus: async (id: string, active: boolean): Promise<Driver> => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    const index = mockDrivers.findIndex((d) => d.uuid === id);
    if (index === -1) throw new Error("Driver not found");

    mockDrivers[index] = {
      ...mockDrivers[index],
      // active
    };

    return mockDrivers[index];
  },

  updateDriverDocument: async (
    driverId: string,
    documentId: string,
    updates: Partial<DriverDocument>,
  ): Promise<Driver> => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    const driverIndex = mockDrivers.findIndex((d) => d.uuid === driverId);
    if (driverIndex === -1) throw new Error("Driver not found");

    const documentIndex = mockDrivers[driverIndex].documents.findIndex(
      (doc) => doc.id === documentId,
    );
    if (documentIndex === -1) throw new Error("Document not found");

    const updatedDocuments = [...mockDrivers[driverIndex].documents];
    updatedDocuments[documentIndex] = {
      ...updatedDocuments[documentIndex],
      ...updates,
      updated_at: updates.status
        ? new Date().toISOString()
        : updatedDocuments[documentIndex].updated_at,
      reviewed_by: updates.status
        ? "Admin User"
        : updatedDocuments[documentIndex].reviewed_by,
    };

    mockDrivers[driverIndex] = {
      ...mockDrivers[driverIndex],
      documents: updatedDocuments,
    };

    return mockDrivers[driverIndex];
  },

  getDriverRides: async (driverId: string): Promise<Ride[]> => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    return mockRides.filter((r) => r.driver_id === driverId);
  },

  // Rides
  getRides: async (): Promise<Ride[]> => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return mockRides;
  },

  getRide: async (id: string): Promise<Ride> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const ride = mockRides.find((r) => r.id === id);
    if (!ride) throw new Error("Ride not found");
    return ride;
  },

  getRiderRides: async (riderId: string): Promise<Ride[]> => {
    await new Promise((resolve) => setTimeout(resolve, 600));
    return mockRides.filter((r) => r.rider_id === riderId);
  },

  getRiderPoints: async (riderId: string): Promise<number> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const rider = mockRiders.find((r) => r.id === riderId);
    if (!rider) throw new Error("Rider not found");
    return rider.rewardPoints;
  },

  // Refunds
  updateRefundStatus: async (
    rideId: string,
    refunded: boolean,
    reason?: string,
  ): Promise<Ride> => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    const index = mockRides.findIndex((r) => r.id === rideId);
    if (index === -1) throw new Error("Ride not found");

    mockRides[index] = {
      ...mockRides[index],
      cancellation_fee: mockRides[index].cancellation_fee,
      cancellation_reason: reason || mockRides[index].cancellation_reason,
    };

    return mockRides[index];
  },

  // Upload document for driver
  uploadDocumentForDriver: async (
    driverId: string,
    documentType: DocumentType,
    fileData: any,
    notes?: string,
  ) => {
    try {
      // Simulate server delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Find the driver
      const driver = mockDrivers.find((d) => d.uuid === driverId);
      if (!driver) {
        throw new Error("Driver not found");
      }

      // Update the document
      const updatedDocuments = driver.documents.map((doc) => {
        if (doc.document_type === documentType) {
          return {
            ...doc,
            status: "pending" as DocumentStatus,
            dateSubmitted: new Date().toISOString(),
            fileUrl:
              typeof fileData === "string"
                ? fileData
                : URL.createObjectURL(fileData),
            notes: notes || doc.notes,
            uploadedBy: "admin",
          };
        }
        return doc;
      });

      // Update the driver's documents
      driver.documents = updatedDocuments;

      return {
        success: true,
        message: "Document uploaded successfully",
        document: updatedDocuments.find(
          (doc) => doc.document_type === documentType,
        ),
      };
    } catch (error) {
      console.error("Error uploading document:", error);
      throw error;
    }
  },

  // Notify driver about document upload
  notifyDriverAboutDocument: async (
    driverId: string,
    documentType: DocumentType,
  ) => {
    try {
      // Simulate server delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      return {
        success: true,
        message: "Notification sent to driver",
      };
    } catch (error) {
      console.error("Error sending notification:", error);
      throw error;
    }
  },
};
