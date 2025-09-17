const express = require('express');
const router = express.Router();
const ScheduledRidesController = require('./controllers/ScheduledRidesController');

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

// Rider Scheduled Rides Routes
router.get('/rider', authenticateRider, ScheduledRidesController.getRiderScheduledRides);
router.post('/rider', authenticateRider, ScheduledRidesController.createScheduledRide);
router.get('/rider/:id', authenticateRider, ScheduledRidesController.getScheduledRide);
router.put('/rider/:id', authenticateRider, ScheduledRidesController.updateScheduledRide);
router.delete('/rider/:id', authenticateRider, ScheduledRidesController.cancelScheduledRide);

// Admin Scheduled Rides Routes
router.get('/admin', ScheduledRidesController.getAllScheduledRides);

module.exports = router;

