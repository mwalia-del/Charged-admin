const express = require('express');
const router = express.Router();

// Placeholder driver routes
router.get('/', (req, res) => {
  res.json({ message: 'Drivers endpoint' });
});

module.exports = router;

