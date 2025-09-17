const express = require('express');
const router = express.Router();
const LocationController = require('../controllers/LocationController');

// Authentication middleware for riders
const authenticateRider = async (req, res, next) => {
  try {
    // For testing purposes, using a hardcoded rider UUID
    // In production, this should validate Firebase ID token
    req.rider = { id: '385c3e62-cf98-4203-a6ae-fdc48f68b3d4' };
    next();
  } catch (error) {
    console.error('Rider authentication error:', error);
    res.status(401).json({
      status: false,
      message: "Authentication failed"
    });
  }
};

// Authentication middleware for drivers
const authenticateDriver = async (req, res, next) => {
  try {
    // For testing purposes, using a hardcoded driver UUID
    // In production, this should validate Firebase ID token
    req.driver = { id: 'driver-uuid-123' };
    next();
  } catch (error) {
    console.error('Driver authentication error:', error);
    res.status(401).json({
      status: false,
      message: "Authentication failed"
    });
  }
};

// Location update endpoints
router.post('/update', authenticateRider, LocationController.updateLocation);
router.post('/driver/update', authenticateDriver, LocationController.updateLocation);

// Location retrieval endpoints
router.get('/current', authenticateRider, LocationController.getLocation);
router.get('/driver/current', authenticateDriver, LocationController.getLocation);

// Nearby drivers search (for riders)
router.post('/nearby-drivers', authenticateRider, LocationController.findNearbyDrivers);

// Ride route endpoints
router.get('/ride/:rideId/route', authenticateRider, LocationController.getRideRoute);
router.get('/driver/ride/:rideId/route', authenticateDriver, LocationController.getRideRoute);

// Ride location update endpoints
router.put('/ride/:rideId/location', authenticateRider, LocationController.updateRideLocation);
router.put('/driver/ride/:rideId/location', authenticateDriver, LocationController.updateRideLocation);

module.exports = router;
