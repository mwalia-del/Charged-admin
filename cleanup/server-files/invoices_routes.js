const express = require('express');
const router = express.Router();

// Placeholder invoices routes
router.get('/', (req, res) => {
  res.json({ message: 'Invoices endpoint' });
});

module.exports = router;

