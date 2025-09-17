const express = require('express');
const router = express.Router();

// Placeholder catalog routes
router.get('/', (req, res) => {
  res.json({ message: 'Catalog endpoint' });
});

module.exports = router;

