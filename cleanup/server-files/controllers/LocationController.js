const db = require('../db');

/**
 * Update user's current location
 */
exports.updateLocation = async (req, res) => {
  try {
    const userId = req.rider?.id || req.driver?.id;
    const { lat, lng, address } = req.body;

    if (!userId) {
      return res.status(401).json({
        status: false,
        message: "User not authenticated"
      });
    }

    if (!lat || !lng) {
      return res.status(400).json({
        status: false,
        message: "Latitude and longitude are required"
      });
    }

    // Get user's internal ID
    const userResult = await db.query(`
      SELECT id FROM users
      WHERE uuid = $1
    `, [userId]);

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        status: false,
        message: "User not found"
      });
    }

    const internalUserId = userResult.rows[0].id;

    // Update user's location
    await db.query(`
      UPDATE users 
      SET 
        current_location = POINT($1, $2),
        location_updated_at = CURRENT_TIMESTAMP,
        address = COALESCE($3, address)
      WHERE id = $4
    `, [lng, lat, address, internalUserId]);

    res.json({
      status: true,
      message: "Location updated successfully",
      data: {
        coordinates: { lat, lng },
        address: address,
        updatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error updating location:', error);
    res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

/**
 * Get user's current location
 */
exports.getLocation = async (req, res) => {
  try {
    const userId = req.rider?.id || req.driver?.id;

    if (!userId) {
      return res.status(401).json({
        status: false,
        message: "User not authenticated"
      });
    }

    // Get user's location
    const result = await db.query(`
      SELECT 
        ST_X(current_location) as lng,
        ST_Y(current_location) as lat,
        address,
        location_updated_at
      FROM users
      WHERE uuid = $1 AND current_location IS NOT NULL
    `, [userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: false,
        message: "Location not found"
      });
    }

    const location = result.rows[0];

    res.json({
      status: true,
      message: "Location retrieved successfully",
      data: {
        coordinates: {
          lat: parseFloat(location.lat),
          lng: parseFloat(location.lng)
        },
        address: location.address,
        updatedAt: location.location_updated_at
      }
    });

  } catch (error) {
    console.error('Error getting location:', error);
    res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

/**
 * Find nearby drivers for a rider
 */
exports.findNearbyDrivers = async (req, res) => {
  try {
    const { lat, lng, radius = 5000 } = req.body; // radius in meters

    if (!lat || !lng) {
      return res.status(400).json({
        status: false,
        message: "Latitude and longitude are required"
      });
    }

    // Find drivers within radius
    const result = await db.query(`
      SELECT 
        u.uuid,
        u.name,
        u.phone,
        u.rating,
        u.photo,
        ST_X(u.current_location) as lng,
        ST_Y(u.current_location) as lat,
        u.location_updated_at,
        ST_Distance(
          u.current_location::geography,
          ST_Point($1, $2)::geography
        ) as distance_meters
      FROM users u
      WHERE u.user_type = 'driver' 
        AND u.is_deleted = false
        AND u.current_location IS NOT NULL
        AND ST_DWithin(
          u.current_location::geography,
          ST_Point($1, $2)::geography,
          $3
        )
        AND u.location_updated_at > NOW() - INTERVAL '10 minutes'
      ORDER BY distance_meters ASC
      LIMIT 20
    `, [lng, lat, radius]);

    const drivers = result.rows.map(driver => ({
      id: driver.uuid,
      name: driver.name,
      phone: driver.phone,
      rating: driver.rating,
      photo: driver.photo,
      coordinates: {
        lat: parseFloat(driver.lat),
        lng: parseFloat(driver.lng)
      },
      distance: {
        meters: Math.round(driver.distance_meters),
        km: Math.round(driver.distance_meters / 1000 * 100) / 100
      },
      lastSeen: driver.location_updated_at
    }));

    res.json({
      status: true,
      message: "Nearby drivers found",
      data: {
        drivers: drivers,
        count: drivers.length,
        searchRadius: radius
      }
    });

  } catch (error) {
    console.error('Error finding nearby drivers:', error);
    res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

/**
 * Get ride route with coordinates
 */
exports.getRideRoute = async (req, res) => {
  try {
    const { rideId } = req.params;
    const userId = req.rider?.id || req.driver?.id;

    if (!userId) {
      return res.status(401).json({
        status: false,
        message: "User not authenticated"
      });
    }

    // Get ride details with coordinates
    const result = await db.query(`
      SELECT 
        r.uuid,
        r.pickup_address,
        r.dropoff_address,
        ST_X(r.pickup_coordinates) as pickup_lng,
        ST_Y(r.pickup_coordinates) as pickup_lat,
        ST_X(r.dropoff_coordinates) as dropoff_lng,
        ST_Y(r.dropoff_coordinates) as dropoff_lat,
        r.pickup_place_id,
        r.dropoff_place_id,
        r.route_polyline,
        r.estimated_distance_km,
        r.estimated_duration_minutes,
        r.status
      FROM rides r
      WHERE r.uuid = $1 
        AND (r.rider_id = (SELECT id FROM users WHERE uuid = $2)
             OR r.driver_id = (SELECT id FROM users WHERE uuid = $2))
    `, [rideId, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        status: false,
        message: "Ride not found"
      });
    }

    const ride = result.rows[0];

    res.json({
      status: true,
      message: "Ride route retrieved successfully",
      data: {
        rideId: ride.uuid,
        pickup: {
          address: ride.pickup_address,
          coordinates: {
            lat: parseFloat(ride.pickup_lat),
            lng: parseFloat(ride.pickup_lng)
          },
          placeId: ride.pickup_place_id
        },
        dropoff: {
          address: ride.dropoff_address,
          coordinates: {
            lat: parseFloat(ride.dropoff_lat),
            lng: parseFloat(ride.dropoff_lng)
          },
          placeId: ride.dropoff_place_id
        },
        route: {
          polyline: ride.route_polyline,
          distance: {
            km: ride.estimated_distance_km
          },
          duration: {
            minutes: ride.estimated_duration_minutes
          }
        },
        status: ride.status
      }
    });

  } catch (error) {
    console.error('Error getting ride route:', error);
    res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

/**
 * Update ride with location data
 */
exports.updateRideLocation = async (req, res) => {
  try {
    const { rideId } = req.params;
    const { 
      pickupCoordinates, 
      dropoffCoordinates, 
      pickupPlaceId, 
      dropoffPlaceId,
      routePolyline,
      estimatedDistance,
      estimatedDuration 
    } = req.body;

    const userId = req.rider?.id || req.driver?.id;

    if (!userId) {
      return res.status(401).json({
        status: false,
        message: "User not authenticated"
      });
    }

    // Verify user has access to this ride
    const rideCheck = await db.query(`
      SELECT id FROM rides 
      WHERE uuid = $1 
        AND (rider_id = (SELECT id FROM users WHERE uuid = $2)
             OR driver_id = (SELECT id FROM users WHERE uuid = $2))
    `, [rideId, userId]);

    if (rideCheck.rows.length === 0) {
      return res.status(404).json({
        status: false,
        message: "Ride not found or access denied"
      });
    }

    // Build update query dynamically
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (pickupCoordinates && pickupCoordinates.lat && pickupCoordinates.lng) {
      updates.push(`pickup_coordinates = POINT($${paramCount}, $${paramCount + 1})`);
      values.push(pickupCoordinates.lng, pickupCoordinates.lat);
      paramCount += 2;
    }

    if (dropoffCoordinates && dropoffCoordinates.lat && dropoffCoordinates.lng) {
      updates.push(`dropoff_coordinates = POINT($${paramCount}, $${paramCount + 1})`);
      values.push(dropoffCoordinates.lng, dropoffCoordinates.lat);
      paramCount += 2;
    }

    if (pickupPlaceId) {
      updates.push(`pickup_place_id = $${paramCount}`);
      values.push(pickupPlaceId);
      paramCount++;
    }

    if (dropoffPlaceId) {
      updates.push(`dropoff_place_id = $${paramCount}`);
      values.push(dropoffPlaceId);
      paramCount++;
    }

    if (routePolyline) {
      updates.push(`route_polyline = $${paramCount}`);
      values.push(routePolyline);
      paramCount++;
    }

    if (estimatedDistance) {
      updates.push(`estimated_distance_km = $${paramCount}`);
      values.push(estimatedDistance);
      paramCount++;
    }

    if (estimatedDuration) {
      updates.push(`estimated_duration_minutes = $${paramCount}`);
      values.push(estimatedDuration);
      paramCount++;
    }

    if (updates.length === 0) {
      return res.status(400).json({
        status: false,
        message: "No location data provided"
      });
    }

    // Add ride ID to values
    values.push(rideId);

    const query = `
      UPDATE rides 
      SET ${updates.join(', ')}
      WHERE uuid = $${paramCount}
    `;

    await db.query(query, values);

    res.json({
      status: true,
      message: "Ride location updated successfully"
    });

  } catch (error) {
    console.error('Error updating ride location:', error);
    res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message
    });
  }
};
