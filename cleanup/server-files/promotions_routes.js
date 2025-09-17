const express = require('express');
const router = express.Router();
const PromotionsController = require('./controllers/PromotionsController');

// Get active promotions for rider
router.get('/rider', PromotionsController.getRiderActivePromotions);

// Apply promotion to ride
router.post('/rider/rides/:rideId', PromotionsController.applyPromotionToRide);

// Get all promotions (admin)
router.get('/admin', PromotionsController.getAllPromotions);

// Create promotion (admin)
router.post('/admin', PromotionsController.createPromotion);

// Update promotion (admin)
router.put('/admin/:id', PromotionsController.updatePromotion);

// Delete promotion (admin)
router.delete('/admin/:id', PromotionsController.deletePromotion);

module.exports = router;

