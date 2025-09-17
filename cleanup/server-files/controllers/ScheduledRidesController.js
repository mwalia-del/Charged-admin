const db = require('../db');
const { v4: uuidv4 } = require('uuid');

// Get rider's scheduled rides
exports.getRiderScheduledRides = async (req, res) => {
  try {
    const riderId = req.rider.id;
    const { page = 1, limit = 20, status } = req.query;
    const offset = (page - 1) * limit;
    
    let whereClause = 'WHERE sr.rider_id = $1';
    const params = [riderId];
    let paramCount = 1;
    
    if (status) {
      paramCount++;
      whereClause += ` AND sr.status = $${paramCount}`;
      params.push(status);
    }
    
    // Get total count
    const countResult = await db.query(`
      SELECT COUNT(*) as total
      FROM scheduled_rides sr
      ${whereClause}
    `, params);
    
    const total = parseInt(countResult.rows[0].total);
    
    // Get scheduled rides
    const ridesResult = await db.query(`
      SELECT 
        sr.id, sr.ride_id, sr.status, sr.scheduled_for, sr.pickup_address,
        sr.dropoff_address, sr.amount_cents, sr.notes, sr.created_at,
        sr.updated_at, r.ride_number
      FROM scheduled_rides sr
      LEFT JOIN rides r ON sr.ride_id = r.id
      ${whereClause}
      ORDER BY sr.scheduled_for ASC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `, [...params, limit, offset]);
    
    const scheduledRides = ridesResult.rows.map(ride => ({
      id: ride.id,
      ride_id: ride.ride_id,
      ride_number: ride.ride_number,
      status: ride.status,
      scheduled_for: ride.scheduled_for,
      pickup_address: ride.pickup_address,
      dropoff_address: ride.dropoff_address,
      amount_cents: ride.amount_cents,
      notes: ride.notes,
      created_at: ride.created_at,
      updated_at: ride.updated_at
    }));
    
    res.json({
      status: true,
      data: {
        scheduled_rides: scheduledRides,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(total / limit),
          total_items: total,
          items_per_page: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error getting rider scheduled rides:', error);
    res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Create scheduled ride
exports.createScheduledRide = async (req, res) => {
  try {
    const riderId = req.rider.id;
    const {
      scheduled_for, pickup_address, dropoff_address, pickup_lat, pickup_lng,
      dropoff_lat, dropoff_lng, amount_cents, notes, vehicle_class_code
    } = req.body;
    
    // Validate scheduled time (must be at least 30 minutes in the future)
    const scheduledTime = new Date(scheduled_for);
    const now = new Date();
    const minScheduledTime = new Date(now.getTime() + 30 * 60 * 1000); // 30 minutes
    
    if (scheduledTime < minScheduledTime) {
      return res.status(400).json({
        status: false,
        message: "Scheduled time must be at least 30 minutes in the future"
      });
    }
    
    const scheduledRideId = uuidv4();
    
    await db.query(`
      INSERT INTO scheduled_rides (
        id, rider_id, scheduled_for, pickup_address, dropoff_address,
        pickup_lat, pickup_lng, dropoff_lat, dropoff_lng,
        amount_cents, notes, vehicle_class_code, status, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, 'scheduled', NOW(), NOW())
    `, [
      scheduledRideId, riderId, scheduled_for, pickup_address, dropoff_address,
      pickup_lat, pickup_lng, dropoff_lat, dropoff_lng,
      amount_cents, notes, vehicle_class_code
    ]);
    
    res.status(201).json({
      status: true,
      message: "Scheduled ride created successfully",
      data: {
        id: scheduledRideId,
        scheduled_for: scheduled_for,
        status: 'scheduled',
        created_at: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error creating scheduled ride:', error);
    res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Update scheduled ride
exports.updateScheduledRide = async (req, res) => {
  try {
    const riderId = req.rider.id;
    const scheduledRideId = req.params.id;
    const updates = req.body;
    
    // Check if scheduled ride exists and belongs to rider
    const existingResult = await db.query(`
      SELECT * FROM scheduled_rides 
      WHERE id = $1 AND rider_id = $2
    `, [scheduledRideId, riderId]);
    
    if (existingResult.rows.length === 0) {
      return res.status(404).json({
        status: false,
        message: "Scheduled ride not found"
      });
    }
    
    const existingRide = existingResult.rows[0];
    
    // Don't allow updates if ride is already in progress or completed
    if (['in_progress', 'completed', 'cancelled'].includes(existingRide.status)) {
      return res.status(400).json({
        status: false,
        message: "Cannot update scheduled ride in current status"
      });
    }
    
    // Build dynamic update query
    const setClause = [];
    const values = [];
    let paramCount = 0;
    
    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined && key !== 'id') {
        paramCount++;
        setClause.push(`${key} = $${paramCount}`);
        values.push(updates[key]);
      }
    });
    
    if (setClause.length === 0) {
      return res.status(400).json({
        status: false,
        message: "No valid fields to update"
      });
    }
    
    setClause.push(`updated_at = NOW()`);
    values.push(scheduledRideId);
    
    await db.query(`
      UPDATE scheduled_rides 
      SET ${setClause.join(', ')}
      WHERE id = $${paramCount + 1}
    `, values);
    
    res.json({
      status: true,
      message: "Scheduled ride updated successfully",
      data: {
        id: scheduledRideId,
        updated_at: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error updating scheduled ride:', error);
    res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Cancel scheduled ride
exports.cancelScheduledRide = async (req, res) => {
  try {
    const riderId = req.rider.id;
    const scheduledRideId = req.params.id;
    const { cancellation_reason } = req.body;
    
    // Check if scheduled ride exists and belongs to rider
    const existingResult = await db.query(`
      SELECT * FROM scheduled_rides 
      WHERE id = $1 AND rider_id = $2
    `, [scheduledRideId, riderId]);
    
    if (existingResult.rows.length === 0) {
      return res.status(404).json({
        status: false,
        message: "Scheduled ride not found"
      });
    }
    
    const existingRide = existingResult.rows[0];
    
    // Don't allow cancellation if ride is already in progress or completed
    if (['in_progress', 'completed'].includes(existingRide.status)) {
      return res.status(400).json({
        status: false,
        message: "Cannot cancel scheduled ride in current status"
      });
    }
    
    // Update status to cancelled
    await db.query(`
      UPDATE scheduled_rides 
      SET status = 'cancelled', cancellation_reason = $1, updated_at = NOW()
      WHERE id = $2
    `, [cancellation_reason, scheduledRideId]);
    
    res.json({
      status: true,
      message: "Scheduled ride cancelled successfully",
      data: {
        id: scheduledRideId,
        status: 'cancelled',
        cancelled_at: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error cancelling scheduled ride:', error);
    res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Get scheduled ride details
exports.getScheduledRide = async (req, res) => {
  try {
    const riderId = req.rider.id;
    const scheduledRideId = req.params.id;
    
    const result = await db.query(`
      SELECT 
        sr.*, r.ride_number, vc.name as vehicle_class_name
      FROM scheduled_rides sr
      LEFT JOIN rides r ON sr.ride_id = r.id
      LEFT JOIN vehicle_classes vc ON sr.vehicle_class_code = vc.code
      WHERE sr.id = $1 AND sr.rider_id = $2
    `, [scheduledRideId, riderId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        status: false,
        message: "Scheduled ride not found"
      });
    }
    
    const ride = result.rows[0];
    
    res.json({
      status: true,
      data: {
        id: ride.id,
        ride_id: ride.ride_id,
        ride_number: ride.ride_number,
        status: ride.status,
        scheduled_for: ride.scheduled_for,
        pickup_address: ride.pickup_address,
        pickup_lat: ride.pickup_lat,
        pickup_lng: ride.pickup_lng,
        dropoff_address: ride.dropoff_address,
        dropoff_lat: ride.dropoff_lat,
        dropoff_lng: ride.dropoff_lng,
        amount_cents: ride.amount_cents,
        notes: ride.notes,
        vehicle_class_code: ride.vehicle_class_code,
        vehicle_class_name: ride.vehicle_class_name,
        cancellation_reason: ride.cancellation_reason,
        created_at: ride.created_at,
        updated_at: ride.updated_at
      }
    });
  } catch (error) {
    console.error('Error getting scheduled ride:', error);
    res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Get all scheduled rides (admin)
exports.getAllScheduledRides = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, rider_id } = req.query;
    const offset = (page - 1) * limit;
    
    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramCount = 0;
    
    if (status) {
      paramCount++;
      whereClause += ` AND sr.status = $${paramCount}`;
      params.push(status);
    }
    
    if (rider_id) {
      paramCount++;
      whereClause += ` AND sr.rider_id = $${paramCount}`;
      params.push(rider_id);
    }
    
    // Get total count
    const countResult = await db.query(`
      SELECT COUNT(*) as total
      FROM scheduled_rides sr
      ${whereClause}
    `, params);
    
    const total = parseInt(countResult.rows[0].total);
    
    // Get scheduled rides
    const ridesResult = await db.query(`
      SELECT 
        sr.id, sr.rider_id, sr.ride_id, sr.status, sr.scheduled_for,
        sr.pickup_address, sr.dropoff_address, sr.amount_cents,
        sr.created_at, sr.updated_at, r.ride_number, u.email as rider_email
      FROM scheduled_rides sr
      LEFT JOIN rides r ON sr.ride_id = r.id
      LEFT JOIN users u ON sr.rider_id = u.id
      ${whereClause}
      ORDER BY sr.scheduled_for ASC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `, [...params, limit, offset]);
    
    const scheduledRides = ridesResult.rows.map(ride => ({
      id: ride.id,
      rider_id: ride.rider_id,
      rider_email: ride.rider_email,
      ride_id: ride.ride_id,
      ride_number: ride.ride_number,
      status: ride.status,
      scheduled_for: ride.scheduled_for,
      pickup_address: ride.pickup_address,
      dropoff_address: ride.dropoff_address,
      amount_cents: ride.amount_cents,
      created_at: ride.created_at,
      updated_at: ride.updated_at
    }));
    
    res.json({
      status: true,
      data: {
        scheduled_rides,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(total / limit),
          total_items: total,
          items_per_page: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error getting all scheduled rides:', error);
    res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message
    });
  }
};
