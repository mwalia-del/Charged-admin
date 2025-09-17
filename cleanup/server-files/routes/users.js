const express = require('express');
const router = express.Router();

// Placeholder user routes
router.get('/', (req, res) => {
  res.json({ message: 'Users endpoint' });
});

module.exports = router;

