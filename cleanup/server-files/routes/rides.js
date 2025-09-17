const express = require('express');
const router = express.Router();

// Placeholder rides routes
router.get('/', (req, res) => {
  res.json({ message: 'Rides endpoint' });
});

module.exports = router;

