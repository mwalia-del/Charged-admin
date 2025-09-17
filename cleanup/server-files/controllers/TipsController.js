const db = require('../db');
const { v4: uuidv4 } = require('uuid');

// Get driver tips
exports.getDriverTips = async (req, res) => {
  try {
    const driverId = req.driver.id;
    const { page = 1, limit = 20, start_date, end_date } = req.query;
    const offset = (page - 1) * limit;
    
    let whereClause = 'WHERE t.driver_id = $1';
    const params = [driverId];
    let paramCount = 1;
    
    if (start_date) {
      paramCount++;
      whereClause += ` AND t.created_at >= $${paramCount}`;
      params.push(start_date);
    }
    
    if (end_date) {
      paramCount++;
      whereClause += ` AND t.created_at <= $${paramCount}`;
      params.push(end_date);
    }
    
    // Get total count
    const countResult = await db.query(`
      SELECT COUNT(*) as total
      FROM tips t
      ${whereClause}
    `, params);
    
    const total = parseInt(countResult.rows[0].total);
    
    // Get tips
    const tipsResult = await db.query(`
      SELECT 
        t.id, t.ride_id, t.amount_cents, t.percentage, t.payment_method,
        t.created_at, r.ride_number, r.pickup_address, r.dropoff_address,
        u.email as rider_email
      FROM tips t
      LEFT JOIN rides r ON t.ride_id = r.id
      LEFT JOIN users u ON r.rider_id = u.id
      ${whereClause}
      ORDER BY t.created_at DESC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `, [...params, limit, offset]);
    
    const tips = tipsResult.rows.map(tip => ({
      id: tip.id,
      ride_id: tip.ride_id,
      ride_number: tip.ride_number,
      amount_cents: tip.amount_cents,
      percentage: tip.percentage,
      payment_method: tip.payment_method,
      rider_email: tip.rider_email,
      pickup_address: tip.pickup_address,
      dropoff_address: tip.dropoff_address,
      created_at: tip.created_at
    }));
    
    res.json({
      status: true,
      data: {
        tips,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(total / limit),
          total_items: total,
          items_per_page: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error getting driver tips:', error);
    res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Get tips summary
exports.getTipsSummary = async (req, res) => {
  try {
    const driverId = req.driver.id;
    const { start_date, end_date } = req.query;
    
    let whereClause = 'WHERE t.driver_id = $1';
    const params = [driverId];
    let paramCount = 1;
    
    if (start_date) {
      paramCount++;
      whereClause += ` AND t.created_at >= $${paramCount}`;
      params.push(start_date);
    }
    
    if (end_date) {
      paramCount++;
      whereClause += ` AND t.created_at <= $${paramCount}`;
      params.push(end_date);
    }
    
    const summaryResult = await db.query(`
      SELECT 
        COUNT(*) as total_tips,
        COALESCE(SUM(t.amount_cents), 0) as total_amount_cents,
        COALESCE(AVG(t.amount_cents), 0) as average_tip_cents,
        COALESCE(AVG(t.percentage), 0) as average_percentage
      FROM tips t
      ${whereClause}
    `, params);
    
    const summary = summaryResult.rows[0];
    
    res.json({
      status: true,
      data: {
        total_tips: parseInt(summary.total_tips),
        total_amount_cents: parseInt(summary.total_amount_cents),
        average_tip_cents: parseFloat(summary.average_tip_cents),
        average_percentage: parseFloat(summary.average_percentage),
        formatted_total: `$${(summary.total_amount_cents / 100).toFixed(2)}`,
        formatted_average: `$${(summary.average_tip_cents / 100).toFixed(2)}`
      }
    });
  } catch (error) {
    console.error('Error getting tips summary:', error);
    res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Get tip by ride ID
exports.getTipByRideId = async (req, res) => {
  try {
    const driverId = req.driver.id;
    const rideId = req.params.rideId;
    
    const result = await db.query(`
      SELECT 
        t.id, t.ride_id, t.amount_cents, t.percentage, t.payment_method,
        t.created_at, r.ride_number, r.pickup_address, r.dropoff_address,
        u.email as rider_email
      FROM tips t
      LEFT JOIN rides r ON t.ride_id = r.id
      LEFT JOIN users u ON r.rider_id = u.id
      WHERE t.ride_id = $1 AND t.driver_id = $2
    `, [rideId, driverId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        status: false,
        message: "Tip not found"
      });
    }
    
    const tip = result.rows[0];
    
    res.json({
      status: true,
      data: {
        id: tip.id,
        ride_id: tip.ride_id,
        ride_number: tip.ride_number,
        amount_cents: tip.amount_cents,
        percentage: tip.percentage,
        payment_method: tip.payment_method,
        rider_email: tip.rider_email,
        pickup_address: tip.pickup_address,
        dropoff_address: tip.dropoff_address,
        created_at: tip.created_at
      }
    });
  } catch (error) {
    console.error('Error getting tip by ride ID:', error);
    res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Add tip (rider)
exports.addTip = async (req, res) => {
  try {
    const riderId = req.rider.id;
    const { ride_id, tip_amount_cents, tip_percentage, payment_method_id } = req.body;
    
    // Verify ride belongs to rider
    const rideResult = await db.query(`
      SELECT * FROM rides 
      WHERE id = $1 AND rider_id = $2
    `, [ride_id, riderId]);
    
    if (rideResult.rows.length === 0) {
      return res.status(404).json({
        status: false,
        message: "Ride not found"
      });
    }
    
    const ride = rideResult.rows[0];
    
    if (!ride.driver_id) {
      return res.status(400).json({
        status: false,
        message: "No driver assigned to this ride"
      });
    }
    
    // Create tip
    const tipId = uuidv4();
    await db.query(`
      INSERT INTO tips (id, ride_id, driver_id, rider_id, amount_cents, percentage, payment_method, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
    `, [tipId, ride_id, ride.driver_id, riderId, tip_amount_cents, tip_percentage, payment_method_id]);
    
    res.json({
      status: true,
      message: "Tip added successfully",
      data: {
        tip_id: tipId,
        ride_id: ride_id,
        amount_cents: tip_amount_cents,
        percentage: tip_percentage,
        added_at: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error adding tip:', error);
    res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message
    });
  }
};
