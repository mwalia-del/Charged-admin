const express = require('express');
const router = express.Router();
const ReferralController = require('./controllers/ReferralController');

// Authentication middleware for riders
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
    // For now, we'll use a placeholder
    req.rider = { id: 'rider-uuid-123' }; // This should be replaced with actual rider data
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({
      status: false,
      message: "Invalid or expired token"
    });
  }
};

// Rider Referral Routes
router.get('/rider', authenticateRider, ReferralController.getReferralProgram);
router.get('/rider/history', authenticateRider, ReferralController.getReferralHistory);
router.post('/rider/code', authenticateRider, ReferralController.createReferralCode);
router.post('/rider/apply', authenticateRider, ReferralController.applyReferralCode);

// Admin Referral Routes
router.get('/admin', ReferralController.getAllReferrals);

module.exports = router;
