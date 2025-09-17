const db = require('../db');
const { v4: uuidv4 } = require('uuid');

// Get referral program details
exports.getReferralProgram = async (req, res) => {
  try {
    const riderId = req.rider.id;
    
    // Get rider's referral code
    const riderResult = await db.query(`
      SELECT referral_code FROM users 
      WHERE id = $1 AND role = 'RIDER'
    `, [riderId]);
    
    if (riderResult.rows.length === 0) {
      return res.status(404).json({
        status: false,
        message: "Rider not found"
      });
    }
    
    const rider = riderResult.rows[0];
    
    // Get referral statistics
    const statsResult = await db.query(`
      SELECT 
        COUNT(*) as total_referrals,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_referrals,
        COALESCE(SUM(CASE WHEN status = 'completed' THEN reward_amount_cents END), 0) as total_earned_cents
      FROM referral_issuances 
      WHERE referrer_id = $1
    `, [riderId]);
    
    const stats = statsResult.rows[0];
    
    res.json({
      status: true,
      data: {
        referral_code: rider.referral_code,
        program_details: {
          referrer_reward_cents: 1000, // $10.00
          referee_reward_cents: 500,   // $5.00
          minimum_ride_amount_cents: 2000, // $20.00
          reward_conditions: "Complete your first ride"
        },
        statistics: {
          total_referrals: parseInt(stats.total_referrals),
          completed_referrals: parseInt(stats.completed_referrals),
          total_earned_cents: parseInt(stats.total_earned_cents),
          formatted_total_earned: `$${(stats.total_earned_cents / 100).toFixed(2)}`
        }
      }
    });
  } catch (error) {
    console.error('Error getting referral program:', error);
    res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Get referral history
exports.getReferralHistory = async (req, res) => {
  try {
    const riderId = req.rider.id;
    const { page = 1, limit = 20, status } = req.query;
    const offset = (page - 1) * limit;
    
    let whereClause = 'WHERE ri.referrer_id = $1';
    const params = [riderId];
    let paramCount = 1;
    
    if (status) {
      paramCount++;
      whereClause += ` AND ri.status = $${paramCount}`;
      params.push(status);
    }
    
    // Get total count
    const countResult = await db.query(`
      SELECT COUNT(*) as total
      FROM referral_issuances ri
      ${whereClause}
    `, params);
    
    const total = parseInt(countResult.rows[0].total);
    
    // Get referrals
    const referralsResult = await db.query(`
      SELECT 
        ri.id, ri.referee_id, ri.status, ri.reward_amount_cents,
        ri.created_at, ri.completed_at, u.email as referee_email
      FROM referral_issuances ri
      LEFT JOIN users u ON ri.referee_id = u.id
      ${whereClause}
      ORDER BY ri.created_at DESC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `, [...params, limit, offset]);
    
    const referrals = referralsResult.rows.map(ref => ({
      id: ref.id,
      referee_email: ref.referee_email,
      status: ref.status,
      reward_amount_cents: ref.reward_amount_cents,
      created_at: ref.created_at,
      completed_at: ref.completed_at
    }));
    
    res.json({
      status: true,
      data: {
        referrals,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(total / limit),
          total_items: total,
          items_per_page: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error getting referral history:', error);
    res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Create referral code
exports.createReferralCode = async (req, res) => {
  try {
    const riderId = req.rider.id;
    const { custom_code } = req.body;
    
    // Check if rider already has a referral code
    const existingResult = await db.query(`
      SELECT referral_code FROM users 
      WHERE id = $1 AND referral_code IS NOT NULL
    `, [riderId]);
    
    if (existingResult.rows.length > 0) {
      return res.status(400).json({
        status: false,
        message: "Referral code already exists"
      });
    }
    
    // Generate or use custom code
    const referralCode = custom_code || `REF${riderId.substring(0, 8).toUpperCase()}`;
    
    // Check if code is unique
    const codeCheckResult = await db.query(`
      SELECT id FROM users 
      WHERE referral_code = $1
    `, [referralCode]);
    
    if (codeCheckResult.rows.length > 0) {
      return res.status(400).json({
        status: false,
        message: "Referral code already taken"
      });
    }
    
    // Update user with referral code
    await db.query(`
      UPDATE users 
      SET referral_code = $1, updated_at = NOW()
      WHERE id = $2
    `, [referralCode, riderId]);
    
    res.json({
      status: true,
      message: "Referral code created successfully",
      data: {
        referral_code: referralCode,
        created_at: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error creating referral code:', error);
    res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Apply referral code
exports.applyReferralCode = async (req, res) => {
  try {
    const riderId = req.rider.id;
    const { referral_code } = req.body;
    
    // Get referrer by code
    const referrerResult = await db.query(`
      SELECT id FROM users 
      WHERE referral_code = $1 AND role = 'RIDER'
    `, [referral_code]);
    
    if (referrerResult.rows.length === 0) {
      return res.status(404).json({
        status: false,
        message: "Invalid referral code"
      });
    }
    
    const referrerId = referrerResult.rows[0].id;
    
    if (referrerId === riderId) {
      return res.status(400).json({
        status: false,
        message: "Cannot use your own referral code"
      });
    }
    
    // Check if rider already has a referral
    const existingReferralResult = await db.query(`
      SELECT id FROM referral_issuances 
      WHERE referee_id = $1
    `, [riderId]);
    
    if (existingReferralResult.rows.length > 0) {
      return res.status(400).json({
        status: false,
        message: "Referral code already applied"
      });
    }
    
    // Create referral issuance
    const issuanceId = uuidv4();
    await db.query(`
      INSERT INTO referral_issuances (
        id, referrer_id, referee_id, status, reward_amount_cents, created_at
      ) VALUES ($1, $2, $3, 'pending', 1000, NOW())
    `, [issuanceId, referrerId, riderId]);
    
    res.json({
      status: true,
      message: "Referral code applied successfully",
      data: {
        issuance_id: issuanceId,
        referrer_id: referrerId,
        applied_at: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error applying referral code:', error);
    res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Get all referrals (admin)
exports.getAllReferrals = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, referrer_id } = req.query;
    const offset = (page - 1) * limit;
    
    let whereClause = 'WHERE 1=1';
    const params = [];
    let paramCount = 0;
    
    if (status) {
      paramCount++;
      whereClause += ` AND ri.status = $${paramCount}`;
      params.push(status);
    }
    
    if (referrer_id) {
      paramCount++;
      whereClause += ` AND ri.referrer_id = $${paramCount}`;
      params.push(referrer_id);
    }
    
    // Get total count
    const countResult = await db.query(`
      SELECT COUNT(*) as total
      FROM referral_issuances ri
      ${whereClause}
    `, params);
    
    const total = parseInt(countResult.rows[0].total);
    
    // Get referrals
    const referralsResult = await db.query(`
      SELECT 
        ri.id, ri.referrer_id, ri.referee_id, ri.status, ri.reward_amount_cents,
        ri.created_at, ri.completed_at,
        u1.email as referrer_email,
        u2.email as referee_email
      FROM referral_issuances ri
      LEFT JOIN users u1 ON ri.referrer_id = u1.id
      LEFT JOIN users u2 ON ri.referee_id = u2.id
      ${whereClause}
      ORDER BY ri.created_at DESC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `, [...params, limit, offset]);
    
    const referrals = referralsResult.rows.map(ref => ({
      id: ref.id,
      referrer_id: ref.referrer_id,
      referrer_email: ref.referrer_email,
      referee_id: ref.referee_id,
      referee_email: ref.referee_email,
      status: ref.status,
      reward_amount_cents: ref.reward_amount_cents,
      created_at: ref.created_at,
      completed_at: ref.completed_at
    }));
    
    res.json({
      status: true,
      data: {
        referrals,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(total / limit),
          total_items: total,
          items_per_page: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error getting all referrals:', error);
    res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message
    });
  }
};
