const db = require('../db');
const { v4: uuidv4 } = require('uuid');

// Get active promotions for rider
exports.getRiderActivePromotions = async (req, res) => {
  try {
    const riderId = req.rider.id;
    const now = new Date().toISOString();
    
    const result = await db.query(`
      SELECT 
        p.id, p.title, p.description, p.reward_type, p.value_cents, p.percent_off,
        p.start_at, p.end_at, p.max_uses_per_user, p.global_cap, p.code,
        p.criteria_json, p.priority, p.is_active
      FROM promotions p
      WHERE p.audience = 'rider' 
        AND p.is_active = true
        AND p.start_at <= $1
        AND p.end_at >= $1
      ORDER BY p.priority DESC, p.created_at DESC
    `, [now]);
    
    const promotions = result.rows.map(promo => ({
      id: promo.id,
      title: promo.title,
      description: promo.description,
      reward_type: promo.reward_type,
      value_cents: promo.value_cents,
      percent_off: promo.percent_off,
      start_at: promo.start_at,
      end_at: promo.end_at,
      max_uses_per_user: promo.max_uses_per_user,
      global_cap: promo.global_cap,
      code: promo.code,
      criteria_json: promo.criteria_json,
      priority: promo.priority,
      is_active: promo.is_active,
      is_eligible: true, // TODO: Check eligibility based on criteria
      remaining_uses: promo.max_uses_per_user || null
    }));
    
    res.json({
      status: true,
      data: {
        promotions
      }
    });
  } catch (error) {
    console.error('Error getting rider active promotions:', error);
    res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Apply promotion to ride
exports.applyPromotionToRide = async (req, res) => {
  try {
    const riderId = req.rider.id;
    const rideId = req.params.rideId;
    const { promotion_code } = req.body;
    
    // Get promotion
    const promoResult = await db.query(`
      SELECT * FROM promotions 
      WHERE code = $1 AND audience = 'rider' AND is_active = true
        AND start_at <= NOW() AND end_at >= NOW()
    `, [promotion_code]);
    
    if (promoResult.rows.length === 0) {
      return res.status(404).json({
        status: false,
        message: "Promotion not found or expired"
      });
    }
    
    const promotion = promoResult.rows[0];
    
    // Get ride
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
    
    // Check if promotion already applied
    const existingRedemption = await db.query(`
      SELECT * FROM promotion_redemptions 
      WHERE promotion_id = $1 AND actor_id = $2 AND ride_id = $3
    `, [promotion.id, riderId, rideId]);
    
    if (existingRedemption.rows.length > 0) {
      return res.status(400).json({
        status: false,
        message: "Promotion already applied to this ride"
      });
    }
    
    // Calculate discount
    let discountCents = 0;
    if (promotion.reward_type === 'fixed_discount') {
      discountCents = promotion.value_cents;
    } else if (promotion.reward_type === 'percent_discount') {
      discountCents = Math.round(ride.amount_cents * (promotion.percent_off / 100));
    } else if (promotion.reward_type === 'ride_credit') {
      discountCents = Math.min(promotion.value_cents, ride.amount_cents);
    }
    
    const finalFareCents = Math.max(0, ride.amount_cents - discountCents);
    
    // Create redemption
    const redemptionId = uuidv4();
    await db.query(`
      INSERT INTO promotion_redemptions (id, promotion_id, actor_type, actor_id, ride_id, amount_cents, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW())
    `, [redemptionId, promotion.id, 'rider', riderId, rideId, discountCents]);
    
    // Update ride amount
    await db.query(`
      UPDATE rides 
      SET amount_cents = $1, updated_at = NOW()
      WHERE id = $2
    `, [finalFareCents, rideId]);
    
    res.json({
      status: true,
      message: "Promotion applied successfully",
      data: {
        promotion_id: promotion.id,
        discount_cents: discountCents,
        original_fare_cents: ride.amount_cents,
        final_fare_cents: finalFareCents
      }
    });
  } catch (error) {
    console.error('Error applying promotion to ride:', error);
    res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Get all promotions (admin)
exports.getAllPromotions = async (req, res) => {
  try {
    const { page = 1, limit = 20, audience, is_active } = req.query;
    const offset = (page - 1) * limit;
    
    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramCount = 0;
    
    if (audience) {
      paramCount++;
      whereClause += ` AND audience = $${paramCount}`;
      params.push(audience);
    }
    
    if (is_active !== undefined) {
      paramCount++;
      whereClause += ` AND is_active = $${paramCount}`;
      params.push(is_active === 'true');
    }
    
    // Get total count
    const countResult = await db.query(`
      SELECT COUNT(*) as total
      FROM promotions
      ${whereClause}
    `, params);
    
    const total = parseInt(countResult.rows[0].total);
    
    // Get promotions
    const promotionsResult = await db.query(`
      SELECT 
        p.*, 
        COUNT(pr.id) as redemptions_count
      FROM promotions p
      LEFT JOIN promotion_redemptions pr ON p.id = pr.promotion_id
      ${whereClause}
      GROUP BY p.id
      ORDER BY p.created_at DESC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `, [...params, limit, offset]);
    
    const promotions = promotionsResult.rows.map(promo => ({
      id: promo.id,
      title: promo.title,
      description: promo.description,
      audience: promo.audience,
      reward_type: promo.reward_type,
      value_cents: promo.value_cents,
      percent_off: promo.percent_off,
      start_at: promo.start_at,
      end_at: promo.end_at,
      priority: promo.priority,
      is_active: promo.is_active,
      max_uses_per_user: promo.max_uses_per_user,
      global_cap: promo.global_cap,
      code: promo.code,
      criteria_json: promo.criteria_json,
      created_at: promo.created_at,
      updated_at: promo.updated_at,
      redemptions_count: parseInt(promo.redemptions_count)
    }));
    
    res.json({
      status: true,
      data: {
        promotions,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(total / limit),
          total_items: total,
          items_per_page: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error getting all promotions:', error);
    res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Create promotion (admin)
exports.createPromotion = async (req, res) => {
  try {
    const {
      title, description, audience, reward_type, value_cents, percent_off,
      start_at, end_at, priority, is_active, max_uses_per_user, global_cap,
      code, criteria_json
    } = req.body;
    
    const promotionId = uuidv4();
    const createdBy = req.admin?.id || 'admin-user-id'; // TODO: Get from auth
    
    await db.query(`
      INSERT INTO promotions (
        id, title, description, audience, reward_type, value_cents, percent_off,
        start_at, end_at, priority, is_active, max_uses_per_user, global_cap,
        code, criteria_json, created_by, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, NOW(), NOW())
    `, [
      promotionId, title, description, audience, reward_type, value_cents, percent_off,
      start_at, end_at, priority, is_active, max_uses_per_user, global_cap,
      code, criteria_json, createdBy
    ]);
    
    res.status(201).json({
      status: true,
      message: "Promotion created successfully",
      data: {
        id: promotionId,
        created_at: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error creating promotion:', error);
    res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Update promotion (admin)
exports.updatePromotion = async (req, res) => {
  try {
    const promotionId = req.params.id;
    const updates = req.body;
    
    // Build dynamic update query
    const setClause = [];
    const values = [];
    let paramCount = 0;
    
    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
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
    values.push(promotionId);
    
    await db.query(`
      UPDATE promotions 
      SET ${setClause.join(', ')}
      WHERE id = $${paramCount + 1}
    `, values);
    
    res.json({
      status: true,
      message: "Promotion updated successfully",
      data: {
        id: promotionId,
        updated_at: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error updating promotion:', error);
    res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Delete promotion (admin)
exports.deletePromotion = async (req, res) => {
  try {
    const promotionId = req.params.id;
    
    await db.query(`
      DELETE FROM promotions 
      WHERE id = $1
    `, [promotionId]);
    
    res.json({
      status: true,
      message: "Promotion deleted successfully"
    });
  } catch (error) {
    console.error('Error deleting promotion:', error);
    res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message
    });
  }
};
