const express = require('express');
const router = express.Router();
const RiderController = require('./controllers/RiderController');

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
    req.rider = { id: 'rider-uuid-123' };
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({
      status: false,
      message: "Invalid or expired token"
    });
  }
};

// Rider Rewards Routes
router.get('/rider', authenticateRider, RiderController.getRiderRewards);
router.get('/rider/points', authenticateRider, RiderController.getRiderRewardPoints);

module.exports = router;

