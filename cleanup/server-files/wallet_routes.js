const express = require('express');
const router = express.Router();
const WalletController = require('./controllers/WalletController');

// Get wallet balance
router.get('/balance', WalletController.getWalletBalance);

// Get wallet transactions
router.get('/transactions', WalletController.getWalletTransactions);

// Request payout
router.post('/payout', WalletController.requestPayout);

// Get payouts
router.get('/payouts', WalletController.getPayouts);

module.exports = router;
