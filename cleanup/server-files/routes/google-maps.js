const express = require('express');
const router = express.Router();
const GoogleMapsController = require('../controllers/GoogleMapsController');

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

// Public Google Maps API endpoints (no authentication required)
router.post('/geocode', GoogleMapsController.geocodeAddress);
router.post('/reverse-geocode', GoogleMapsController.reverseGeocode);
router.post('/directions', GoogleMapsController.getDirections);
router.post('/places/search', GoogleMapsController.searchPlaces);
router.get('/places/:placeId', GoogleMapsController.getPlaceDetails);
router.post('/distance', GoogleMapsController.calculateDistance);

// Rider-specific location endpoints
router.post('/rider/geocode', authenticateRider, GoogleMapsController.geocodeAddress);
router.post('/rider/reverse-geocode', authenticateRider, GoogleMapsController.reverseGeocode);
router.post('/rider/directions', authenticateRider, GoogleMapsController.getDirections);
router.post('/rider/places/search', authenticateRider, GoogleMapsController.searchPlaces);
router.get('/rider/places/:placeId', authenticateRider, GoogleMapsController.getPlaceDetails);
router.post('/rider/distance', authenticateRider, GoogleMapsController.calculateDistance);

// Driver-specific location endpoints
router.post('/driver/geocode', authenticateDriver, GoogleMapsController.geocodeAddress);
router.post('/driver/reverse-geocode', authenticateDriver, GoogleMapsController.reverseGeocode);
router.post('/driver/directions', authenticateDriver, GoogleMapsController.getDirections);
router.post('/driver/places/search', authenticateDriver, GoogleMapsController.searchPlaces);
router.get('/driver/places/:placeId', authenticateDriver, GoogleMapsController.getPlaceDetails);
router.post('/driver/distance', authenticateDriver, GoogleMapsController.calculateDistance);

module.exports = router;
