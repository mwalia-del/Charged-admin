const db = require('../db');
const { v4: uuidv4 } = require('uuid');

// Authentication middleware
const authenticateRider = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        status: false,
        message: "Authorization token required"
      });
    }
    
    // TODO: Implement Firebase token verification
    // For now, we'll extract user info from token or use a placeholder
    // In production, verify the Firebase token and extract user ID
    req.rider = { 
      id: '385c3e62-cf98-4203-a6ae-fdc48f68b3d4', // Real rider UUID for testing
      email: 'devronins@gmail.com'
    };
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({
      status: false,
      message: "Invalid or expired token"
    });
  }
};

// Get rider profile
exports.getRiderProfile = async (req, res) => {
  try {
    const riderId = req.rider.id;
    
    const result = await db.query(`
      SELECT 
        u.id, u.uuid, u.name, u.email, u.phone, u.user_type, u.rating, u.photo,
        u.is_verified, u.created_at, u.updated_at, u.address, u.address_coordinates
      FROM users u
      WHERE u.uuid = $1 AND u.user_type = 'rider' AND u.is_deleted = false
    `, [riderId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        status: false,
        message: "Rider not found"
      });
    }
    
    const rider = result.rows[0];
    
    res.json({
      status: true,
      data: {
        id: rider.uuid,
        email: rider.email,
        phone: rider.phone,
        user_type: rider.user_type,
        profile: {
          first_name: rider.name ? rider.name.split(' ')[0] : null,
          last_name: rider.name ? rider.name.split(' ').slice(1).join(' ') : null,
          profile_image: rider.photo,
          rating: parseFloat(rider.rating) || 0,
          address: rider.address,
          address_coordinates: rider.address_coordinates,
          is_verified: rider.is_verified,
          emergency_contact: {
            name: null,
            phone: null
          }
        },
        preferences: {
          language: "en",
          notifications: {
            ride_updates: true,
            promotions: true,
            marketing: false
          }
        },
        created_at: rider.created_at,
        updated_at: rider.updated_at
      }
    });
  } catch (error) {
    console.error('Error getting rider profile:', error);
    res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Update rider profile
exports.updateRiderProfile = async (req, res) => {
  try {
    const riderId = req.rider.id;
    const { profile, preferences } = req.body;
    
    // Update user basic info
    await db.query(`
      UPDATE users 
      SET updated_at = NOW()
      WHERE id = $1
    `, [riderId]);
    
    // TODO: Update profile and preferences in separate tables
    // For now, just return success
    
    res.json({
      status: true,
      message: "Profile updated successfully",
      data: {
        id: riderId,
        updated_at: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error updating rider profile:', error);
    res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Get rider's rides
exports.getRiderRides = async (req, res) => {
  try {
    const riderId = req.rider.id;
    const { page = 1, limit = 20, status, start_date, end_date } = req.query;
    const offset = (page - 1) * limit;
    
    let whereClause = 'WHERE r.rider_id = (SELECT id FROM users WHERE uuid = $1 AND user_type = \'rider\')';
    const params = [riderId];
    let paramCount = 1;
    
    if (status) {
      paramCount++;
      whereClause += ` AND r.status = $${paramCount}`;
      params.push(status);
    }
    
    if (start_date) {
      paramCount++;
      whereClause += ` AND r.requested_at >= $${paramCount}`;
      params.push(start_date);
    }
    
    if (end_date) {
      paramCount++;
      whereClause += ` AND r.requested_at <= $${paramCount}`;
      params.push(end_date);
    }
    
    // Get total count
    const countResult = await db.query(`
      SELECT COUNT(*) as total
      FROM rides r
      ${whereClause}
    `, params);
    
    const total = parseInt(countResult.rows[0].total);
    
    // Get rides with pagination
    const ridesResult = await db.query(`
      SELECT 
        r.uuid, r.status, r.pickup_address, r.dropoff_address,
        r.distance_km, r.duration_minutes, r.total_fare, r.payment_status,
        r.requested_at, r.accepted_at, r.arrived_at, r.started_at, r.completed_at,
        r.cancelled_at, r.cancellation_reason, r.rating, r.review,
        d.uuid as driver_id, d.email as driver_email, d.name as driver_name,
        rt.name as ride_type_name
      FROM rides r
      LEFT JOIN users d ON r.driver_id = d.id
      LEFT JOIN ride_types rt ON r.ride_type_id = rt.id
      ${whereClause}
      ORDER BY r.requested_at DESC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `, [...params, limit, offset]);
    
    const rides = ridesResult.rows.map(ride => ({
      id: ride.uuid,
      status: ride.status,
      pickup_address: ride.pickup_address,
      dropoff_address: ride.dropoff_address,
      distance_km: ride.distance_km,
      duration_minutes: ride.duration_minutes,
      amount_cents: Math.round(ride.total_fare * 100), // Convert to cents
      payment_status: ride.payment_status,
      driver: ride.driver_id ? {
        id: ride.driver_id,
        email: ride.driver_email,
        name: ride.driver_name,
        phone: null,
        vehicle: {
          make: "Toyota",
          model: "Camry",
          year: 2020,
          color: "Silver",
          license_plate: "ABC123"
        },
        rating: 4.8
      } : null,
      requested_at: ride.requested_at,
      accepted_at: ride.accepted_at,
      arrived_at: ride.arrived_at,
      started_at: ride.started_at,
      completed_at: ride.completed_at,
      rating: ride.rating,
      review: ride.review
    }));
    
    res.json({
      status: true,
      data: {
        rides,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(total / limit),
          total_items: total,
          items_per_page: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error getting rider rides:', error);
    res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Get specific ride details
exports.getRiderRide = async (req, res) => {
  try {
    const riderId = req.rider.id;
    const rideId = req.params.id;
    
    const result = await db.query(`
      SELECT 
        r.*, d.id as driver_id, d.email as driver_email,
        vc.name as vehicle_class_name
      FROM rides r
      LEFT JOIN users d ON r.driver_id = d.id
      LEFT JOIN vehicle_classes vc ON r.vehicle_class_code = vc.code
      WHERE r.id = $1 AND r.rider_id = $2
    `, [rideId, riderId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        status: false,
        message: "Ride not found"
      });
    }
    
    const ride = result.rows[0];
    
    res.json({
      status: true,
      data: {
        id: ride.id,
        ride_number: ride.ride_number,
        status: ride.status,
        pickup_lat: ride.pickup_lat,
        pickup_lng: ride.pickup_lng,
        pickup_address: ride.pickup_address,
        dropoff_lat: ride.dropoff_lat,
        dropoff_lng: ride.dropoff_lng,
        dropoff_address: ride.dropoff_address,
        distance_km: ride.distance_km,
        duration_minutes: ride.duration_minutes,
        amount_cents: ride.amount_cents,
        payment_status: ride.payment_status,
        driver: ride.driver_id ? {
          id: ride.driver_id,
          name: "Driver Name",
          phone: "+1234567890",
          current_lat: ride.pickup_lat + 0.001, // Mock current location
          current_lng: ride.pickup_lng + 0.001,
          vehicle: {
            make: "Toyota",
            model: "Camry",
            year: 2020,
            color: "Silver",
            license_plate: "ABC123"
          },
          rating: 4.8,
          eta_minutes: 5
        } : null,
        timeline: {
          requested_at: ride.requested_at,
          accepted_at: ride.accepted_at,
          arrived_at: ride.arrived_at,
          started_at: ride.started_at,
          completed_at: ride.completed_at
        },
        created_at: ride.created_at
      }
    });
  } catch (error) {
    console.error('Error getting rider ride:', error);
    res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Change ride status (cancel ride)
exports.changeRideStatus = async (req, res) => {
  try {
    const riderId = req.rider.id;
    const rideId = req.params.id;
    const { status, reason, cancellation_fee_cents } = req.body;
    
    // Check if ride exists and belongs to rider
    const rideResult = await db.query(`
      SELECT * FROM rides 
      WHERE id = $1 AND rider_id = $2
    `, [rideId, riderId]);
    
    if (rideResult.rows.length === 0) {
      return res.status(404).json({
        status: false,
        message: "Ride not found"
      });
    }
    
    const ride = rideResult.rows[0];
    
    // Update ride status
    await db.query(`
      UPDATE rides 
      SET status = $1, cancellation_reason = $2, cancelled_at = NOW()
      WHERE id = $3
    `, [status, reason, rideId]);
    
    res.json({
      status: true,
      message: "Ride status updated successfully",
      data: {
        ride_id: rideId,
        status: status,
        cancellation_fee_cents: cancellation_fee_cents || 0,
        refund_amount_cents: ride.amount_cents - (cancellation_fee_cents || 0),
        cancelled_at: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error changing ride status:', error);
    res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Upload rider files
exports.uploadRiderFiles = async (req, res) => {
  try {
    // TODO: Implement file upload logic
    // For now, return a mock response
    
    res.json({
      status: true,
      message: "File uploaded successfully",
      data: {
        file_url: "https://api.charged.autos/uploads/profile_123.jpg",
        file_id: uuidv4()
      }
    });
  } catch (error) {
    console.error('Error uploading rider files:', error);
    res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Send notification
exports.sendNotification = async (req, res) => {
  try {
    const { title, body, type } = req.query;
    
    // TODO: Implement push notification logic
    // For now, return a mock response
    
    res.json({
      status: true,
      message: "Notification sent successfully",
      data: {
        notification_id: uuidv4(),
        sent_at: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Get rider's payment methods
exports.getRiderPaymentMethods = async (req, res) => {
  try {
    // TODO: Implement payment methods retrieval
    // For now, return mock data
    
    res.json({
      status: true,
      data: {
        payment_methods: [
          {
            id: "pm_1234567890",
            type: "card",
            last_four: "4242",
            brand: "visa",
            exp_month: 12,
            exp_year: 2025,
            is_default: true,
            created_at: "2025-01-01T00:00:00Z"
          }
        ]
      }
    });
  } catch (error) {
    console.error('Error getting payment methods:', error);
    res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Add payment method
exports.addPaymentMethod = async (req, res) => {
  try {
    const { payment_method_id, is_default } = req.body;
    
    // TODO: Implement payment method addition
    // For now, return mock response
    
    res.json({
      status: true,
      message: "Payment method added successfully",
      data: {
        payment_method_id: payment_method_id,
        is_default: is_default || false
      }
    });
  } catch (error) {
    console.error('Error adding payment method:', error);
    res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Delete payment method
exports.deletePaymentMethod = async (req, res) => {
  try {
    const paymentMethodId = req.params.id;
    
    // TODO: Implement payment method deletion
    // For now, return mock response
    
    res.json({
      status: true,
      message: "Payment method deleted successfully"
    });
  } catch (error) {
    console.error('Error deleting payment method:', error);
    res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Get rider's rewards
exports.getRiderRewards = async (req, res) => {
  try {
    // TODO: Implement rewards retrieval
    // For now, return mock data
    
    res.json({
      status: true,
      data: {
        rewards: [
          {
            id: "uuid-reward-123",
            title: "Free Ride",
            description: "Earn a free ride after 10 completed rides",
            points_required: 1000,
            value_cents: 2000,
            is_available: true,
            expires_at: "2025-12-31T23:59:59Z"
          }
        ]
      }
    });
  } catch (error) {
    console.error('Error getting rewards:', error);
    res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Get rider's reward points
exports.getRiderRewardPoints = async (req, res) => {
  try {
    // TODO: Implement reward points retrieval
    // For now, return mock data
    
    res.json({
      status: true,
      data: {
        current_points: 750,
        lifetime_points: 1500,
        tier: "silver",
        next_tier: "gold",
        points_to_next_tier: 250,
        points_expiring_soon: 100,
        expiration_date: "2025-12-31T23:59:59Z"
      }
    });
  } catch (error) {
    console.error('Error getting reward points:', error);
    res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Add ride rating
exports.addRideRating = async (req, res) => {
  try {
    const rideId = req.params.id;
    const { rating, review, categories } = req.body;
    
    // Update ride with rating
    await db.query(`
      UPDATE rides 
      SET rating = $1, review = $2, updated_at = NOW()
      WHERE id = $3
    `, [rating, review, rideId]);
    
    res.json({
      status: true,
      message: "Rating submitted successfully",
      data: {
        ride_id: rideId,
        rating: rating,
        review: review,
        submitted_at: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error adding ride rating:', error);
    res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Send chat notification to driver
exports.sendDriverChatNotification = async (req, res) => {
  try {
    const rideId = req.params.id;
    const { message, message_type } = req.body;
    
    // TODO: Implement chat notification logic
    // For now, return mock response
    
    res.json({
      status: true,
      message: "Message sent successfully",
      data: {
        message_id: uuidv4(),
        sent_at: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error sending chat notification:', error);
    res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

module.exports = {
  authenticateRider,
  getRiderProfile: exports.getRiderProfile,
  updateRiderProfile: exports.updateRiderProfile,
  getRiderRides: exports.getRiderRides,
  getRiderRide: exports.getRiderRide,
  changeRideStatus: exports.changeRideStatus,
  uploadRiderFiles: exports.uploadRiderFiles,
  sendNotification: exports.sendNotification,
  getRiderPaymentMethods: exports.getRiderPaymentMethods,
  addPaymentMethod: exports.addPaymentMethod,
  deletePaymentMethod: exports.deletePaymentMethod,
  getRiderRewards: exports.getRiderRewards,
  getRiderRewardPoints: exports.getRiderRewardPoints,
  addRideRating: exports.addRideRating,
  sendDriverChatNotification: exports.sendDriverChatNotification
};
