const express = require('express');
const router = express.Router();
const TipsController = require('./controllers/TipsController');

// Get driver tips
router.get('/driver', TipsController.getDriverTips);

// Get tips summary
router.get('/driver/summary', TipsController.getTipsSummary);

// Get tip by ride ID
router.get('/driver/ride/:rideId', TipsController.getTipByRideId);

// Add tip (rider)
router.post('/add', TipsController.addTip);

module.exports = router;
