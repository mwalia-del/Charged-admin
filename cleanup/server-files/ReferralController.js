const { query: db } = require('../db');

// Generate unique referral code for driver
exports.generateReferralCode = async (req, res) => {
  try {
    const driverId = req.driver.id;
    
    // Check if driver already has an active referral code
    const existingCode = await db.query(
      'SELECT * FROM driver_referral_codes WHERE driver_id = $1 AND is_active = true',
      [driverId]
    );
    
    if (existingCode.rows.length > 0) {
      return res.json({
        status: true,
        message: "Referral code already exists",
        data: {
          referral_id: existingCode.rows[0].referral_code,
          expires_at: null
        }
      });
    }
    
    // Generate unique referral code
    const referralCode = `DRV-${generateRandomString(8).toUpperCase()}`;
    
    // Insert new referral code
    await db.query(
      'INSERT INTO driver_referral_codes (driver_id, referral_code) VALUES ($1, $2)',
      [driverId, referralCode]
    );
    
    res.json({
      status: true,
      message: "Referral code generated successfully",
      data: {
        referral_id: referralCode,
        expires_at: null
      }
    });
  } catch (error) {
    console.error('Error generating referral code:', error);
    res.status(500).json({
      status: false,
      message: "Failed to generate referral code",
      error: error.message
    });
  }
};

// Register driver with referral code
exports.registerReferral = async (req, res) => {
  try {
    const { referral_id, referrer_type } = req.body;
    const referredDriverId = req.driver.id;
    
    // Validate referral code
    const referralCode = await db.query(
      'SELECT * FROM driver_referral_codes WHERE referral_code = $1 AND is_active = true',
      [referral_id]
    );
    
    if (referralCode.rows.length === 0) {
      return res.status(400).json({
        status: false,
        message: "Invalid referral code"
      });
    }
    
    const referrerDriverId = referralCode.rows[0].driver_id;
    
    // Check if driver is trying to use their own code
    if (referrerDriverId === referredDriverId) {
      return res.status(400).json({
        status: false,
        message: "Cannot use your own referral code"
      });
    }
    
    // Check if already registered
    const existingRegistration = await db.query(
      'SELECT * FROM referral_registrations WHERE referred_driver_id = $1',
      [referredDriverId]
    );
    
    if (existingRegistration.rows.length > 0) {
      return res.status(400).json({
        status: false,
        message: "Driver already registered with a referral code"
      });
    }
    
    // Calculate reward amount
    const rewardAmount = 25.00; // Base reward amount
    
    // Create referral registration
    await db.query(
      'INSERT INTO referral_registrations (referrer_driver_id, referred_driver_id, referral_code, reward_amount) VALUES ($1, $2, $3, $4)',
      [referrerDriverId, referredDriverId, referral_id, rewardAmount]
    );
    
    // Update referral code stats
    await db.query(
      'UPDATE driver_referral_codes SET total_referrals = total_referrals + 1, total_earnings = total_earnings + $1 WHERE id = $2',
      [rewardAmount, referralCode.rows[0].id]
    );
    
    res.json({
      status: true,
      message: "Successfully registered with referral code",
      data: {
        referral_code: referral_id,
        referrer_driver_id: referrerDriverId,
        reward_amount: rewardAmount
      }
    });
  } catch (error) {
    console.error('Error registering referral:', error);
    res.status(500).json({
      status: false,
      message: "Failed to register referral",
      error: error.message
    });
  }
};

// Get referral statistics for driver
exports.getReferralStats = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    // Get referral code info
    const referralCode = await db.query(
      'SELECT * FROM driver_referral_codes WHERE driver_id = $1',
      [userId]
    );
    
    // Get total referrals
    const totalReferrals = await db.query(
      'SELECT COUNT(*) as count FROM referral_registrations WHERE referrer_driver_id = $1 AND status = $2',
      [userId, 'completed']
    );
    
    // Get this month's referrals
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);
    
    const thisMonthReferrals = await db.query(
      'SELECT COUNT(*) as count FROM referral_registrations WHERE referrer_driver_id = $1 AND status = $2 AND created_at >= $3',
      [userId, 'completed', thisMonth]
    );
    
    // Get earnings
    const earnings = await db.query(
      'SELECT SUM(reward_amount) as total_earnings FROM referral_registrations WHERE referrer_driver_id = $1 AND status = $2',
      [userId, 'completed']
    );
    
    const thisMonthEarnings = await db.query(
      'SELECT SUM(reward_amount) as total_earnings FROM referral_registrations WHERE referrer_driver_id = $1 AND status = $2 AND created_at >= $3',
      [userId, 'completed', thisMonth]
    );
    
    // Get current tier
    const tier = await db.query(
      'SELECT * FROM referral_tiers WHERE min_referrals <= $1 AND (max_referrals IS NULL OR max_referrals >= $1) ORDER BY min_referrals DESC LIMIT 1',
      [totalReferrals.rows[0].count]
    );
    
    // Get next tier
    const nextTier = await db.query(
      'SELECT * FROM referral_tiers WHERE min_referrals > $1 ORDER BY min_referrals ASC LIMIT 1',
      [totalReferrals.rows[0].count]
    );
    
    res.json({
      status: true,
      data: {
        total_referrals: parseInt(totalReferrals.rows[0].count),
        total_earnings: parseFloat(earnings.rows[0].total_earnings || 0),
        this_month_referrals: parseInt(thisMonthReferrals.rows[0].count),
        this_month_earnings: parseFloat(thisMonthEarnings.rows[0].total_earnings || 0),
        referral_code: referralCode.rows[0]?.referral_code || null,
        tier: tier.rows[0]?.name || 'Bronze',
        next_tier_referrals: nextTier.rows[0] ? nextTier.rows[0].min_referrals - parseInt(totalReferrals.rows[0].count) : 0
      }
    });
  } catch (error) {
    console.error('Error fetching referral stats:', error);
    res.status(500).json({
      status: false,
      message: "Failed to fetch referral statistics",
      error: error.message
    });
  }
};

// Get referral tier information
exports.getReferralTier = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    // Get current tier
    const currentTier = await db.query(
      'SELECT * FROM referral_tiers WHERE min_referrals <= (SELECT COUNT(*) FROM referral_registrations WHERE referrer_driver_id = $1 AND status = $2) ORDER BY min_referrals DESC LIMIT 1',
      [userId, 'completed']
    );
    
    // Get next tier
    const nextTier = await db.query(
      'SELECT * FROM referral_tiers WHERE min_referrals > (SELECT COUNT(*) FROM referral_registrations WHERE referrer_driver_id = $1 AND status = $2) ORDER BY min_referrals ASC LIMIT 1',
      [userId, 'completed']
    );
    
    const referralsToNextTier = nextTier.rows[0] ? 
      nextTier.rows[0].min_referrals - (await db.query('SELECT COUNT(*) as count FROM referral_registrations WHERE referrer_driver_id = $1 AND status = $2', [userId, 'completed'])).rows[0].count : 0;
    
    res.json({
      status: true,
      data: {
        current_tier: currentTier.rows[0] || null,
        next_tier: nextTier.rows[0] || null,
        referrals_to_next_tier: referralsToNextTier,
        benefits: currentTier.rows[0] ? [
          "Higher reward per referral",
          `${currentTier.rows[0].bonus_percentage}% bonus on all earnings`,
          "Priority support"
        ] : []
      }
    });
  } catch (error) {
    console.error('Error fetching referral tier:', error);
    res.status(500).json({
      status: false,
      message: "Failed to fetch referral tier",
      error: error.message
    });
  }
};

// Get referral payout history
exports.getReferralPayouts = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    
    // Get payouts
    const payouts = await db.query(
      'SELECT * FROM referral_payouts WHERE driver_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [userId, limit, offset]
    );
    
    // Get total count
    const countResult = await db.query(
      'SELECT COUNT(*) as total FROM referral_payouts WHERE driver_id = $1',
      [userId]
    );
    
    const totalItems = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(totalItems / limit);
    
    res.json({
      status: true,
      data: {
        payouts: payouts.rows,
        pagination: {
          current_page: page,
          total_pages: totalPages,
          total_items: totalItems,
          items_per_page: limit
        }
      }
    });
  } catch (error) {
    console.error('Error fetching referral payouts:', error);
    res.status(500).json({
      status: false,
      message: "Failed to fetch referral payouts",
      error: error.message
    });
  }
};

// Helper function to generate random string
function generateRandomString(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
