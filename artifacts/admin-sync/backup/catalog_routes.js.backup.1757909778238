var express = require('express');
var router = express.Router();
const { getCatalogVehicleClasses } = require('../controllers/VehicleClassController');

// Public catalog routes (no authentication required)
router.get('/vehicle-classes', getCatalogVehicleClasses);

module.exports = router;
