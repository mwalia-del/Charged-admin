const express = require('express');
const router = express.Router();
const RiderController = require('../controllers/RiderController');
const WalletController = require('../controllers/WalletController');
const TipsController = require('../controllers/TipsController');
const PromotionsController = require('../controllers/PromotionsController');
const ReferralController = require('../controllers/ReferralController');
const ScheduledRidesController = require('../controllers/ScheduledRidesController');

// Rider Profile Management
router.get('/profile', RiderController.authenticateRider, RiderController.getRiderProfile);
router.put('/profile', RiderController.authenticateRider, RiderController.updateRiderProfile);

// Ride Management
router.get('/rides', RiderController.authenticateRider, RiderController.getRiderRides);
router.get('/rides/:id', RiderController.authenticateRider, RiderController.getRiderRide);
router.put('/rides/:id/status', RiderController.authenticateRider, RiderController.changeRideStatus);

// Payment Methods
router.get('/payment-methods', RiderController.authenticateRider, RiderController.getRiderPaymentMethods);
router.post('/payment-methods', RiderController.authenticateRider, RiderController.addPaymentMethod);
router.delete('/payment-methods/:id', RiderController.authenticateRider, RiderController.deletePaymentMethod);

// Wallet Management
router.get('/wallet/balance', RiderController.authenticateRider, WalletController.getWalletBalance);
router.get('/wallet/transactions', RiderController.authenticateRider, WalletController.getWalletTransactions);
router.post('/wallet/payout', RiderController.authenticateRider, WalletController.requestPayout);
router.get('/wallet/payouts', RiderController.authenticateRider, WalletController.getPayouts);

// Rewards
router.get('/rewards', RiderController.authenticateRider, RiderController.getRiderRewards);
router.get('/rewards/points', RiderController.authenticateRider, RiderController.getRiderRewardPoints);

// Tips
router.post('/rides/:id/tip', RiderController.authenticateRider, TipsController.addTip);

// Promotions
router.get('/promotions', RiderController.authenticateRider, PromotionsController.getRiderActivePromotions);
router.post('/rides/:rideId/promotions', RiderController.authenticateRider, PromotionsController.applyPromotionToRide);

// Referrals
router.get('/referrals', RiderController.authenticateRider, ReferralController.getReferralProgram);
router.get('/referrals/history', RiderController.authenticateRider, ReferralController.getReferralHistory);
router.post('/referrals/code', RiderController.authenticateRider, ReferralController.createReferralCode);
router.post('/referrals/apply', RiderController.authenticateRider, ReferralController.applyReferralCode);

// Scheduled Rides
router.get('/scheduled-rides', RiderController.authenticateRider, ScheduledRidesController.getRiderScheduledRides);
router.post('/scheduled-rides', RiderController.authenticateRider, ScheduledRidesController.createScheduledRide);
router.get('/scheduled-rides/:id', RiderController.authenticateRider, ScheduledRidesController.getScheduledRide);
router.put('/scheduled-rides/:id', RiderController.authenticateRider, ScheduledRidesController.updateScheduledRide);
router.delete('/scheduled-rides/:id', RiderController.authenticateRider, ScheduledRidesController.cancelScheduledRide);

// Ratings
router.post('/rides/:id/rating', RiderController.authenticateRider, RiderController.addRideRating);

// Notifications
router.post('/notifications', RiderController.authenticateRider, RiderController.sendNotification);
router.post('/rides/:id/chat', RiderController.authenticateRider, RiderController.sendDriverChatNotification);

// File Upload
router.post('/upload', RiderController.authenticateRider, RiderController.uploadRiderFiles);

module.exports = router;
