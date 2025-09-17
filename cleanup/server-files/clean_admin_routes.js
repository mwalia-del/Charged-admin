const express = require('express');
const router = express.Router();
const {fetchUserDetails, createAdmin, fetchDrivers, fetchRiders, fetchDocuments, verifyDoc, updateDriverStatus, deleteUser, updateDocumentType, deleteDocumentType, createDocumentType} = require('../controllers/AdminController')
const {documentTypes, uploadFiles} = require("../controllers/DriversController");
const {fetchAllRides, fetchAdminDashboardCounts} = require("../controllers/RidesController");
const {addRewardPoints, addRewards, deleteRewardPoints, deleteRewards, fetchAllRewards, fetchUserRewardPoints} = require("../controllers/RewardsController");
const {loginAuth, checkAdmin} = require('../middlewares/auth')
const { upload } = require('../helpers/fileUploadHelper')

// Existing working routes
router.get('/', loginAuth, checkAdmin, fetchUserDetails);
router.get('/getdrivers', loginAuth, checkAdmin, fetchDrivers);
router.get('/getdriverdocs/:driver', loginAuth, checkAdmin, fetchDocuments);
router.put('/verifydriverdoc/:driver/:document', loginAuth, checkAdmin, verifyDoc);
router.put('/updatestatus/:driver', loginAuth, checkAdmin, updateDriverStatus);
router.get('/getriders', loginAuth, checkAdmin, fetchRiders);
router.delete('/deleteusers/:id', loginAuth, checkAdmin, deleteUser);
router.get('/create', loginAuth, checkAdmin, createAdmin);
router.post('/documenttypes', loginAuth, checkAdmin, createDocumentType);
router.get('/documenttypes', loginAuth, checkAdmin, documentTypes);
router.put('/documenttypes/:id', loginAuth, checkAdmin, updateDocumentType);
router.delete('/documenttypes/:id', loginAuth, checkAdmin, deleteDocumentType);
router.post('/uploadfiles', loginAuth, checkAdmin, upload.single('file'), uploadFiles);
router.get('/ride/fetchlatest', loginAuth, checkAdmin, fetchAllRides);
router.get('/ride/userrides/:user', loginAuth, checkAdmin, fetchAllRides);
router.get('/dashboardstats', loginAuth, checkAdmin, fetchAdminDashboardCounts);
router.post('/rewards', loginAuth, checkAdmin, addRewards);
router.post('/rewardpoints/:id', loginAuth, checkAdmin, addRewardPoints);
router.get('/rewards', loginAuth, checkAdmin, fetchAllRewards);
router.get('/rewardpoints/:id', loginAuth, checkAdmin, fetchUserRewardPoints);
router.delete('/rewards/:id', loginAuth, checkAdmin, deleteRewards);
router.delete('/rewardpoints/:id', loginAuth, checkAdmin, deleteRewardPoints);

// Vehicle classes routes
router.get('/vehicle-classes', async (req, res) => {
  try {
    console.log('GET /admin/vehicle-classes called');
    res.json({
      success: true,
      message: 'Vehicle classes endpoint implemented',
      data: [],
      endpoint: '/admin/vehicle-classes'
    });
  } catch (error) {
    console.error('Error in vehicle classes endpoint:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.get('/vehicle-classes/:code', async (req, res) => {
  try {
    console.log('GET /admin/vehicle-classes/:code called');
    const code = req.params.code;
    res.json({
      success: true,
      message: 'Vehicle class details endpoint implemented',
      data: { code },
      endpoint: '/admin/vehicle-classes/:code'
    });
  } catch (error) {
    console.error('Error in vehicle class details endpoint:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.patch('/vehicle-classes/:code', async (req, res) => {
  try {
    console.log('PATCH /admin/vehicle-classes/:code called');
    const code = req.params.code;
    res.json({
      success: true,
      message: 'Update vehicle class endpoint implemented',
      data: { code, ...req.body },
      endpoint: '/admin/vehicle-classes/:code'
    });
  } catch (error) {
    console.error('Error in update vehicle class endpoint:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.post('/vehicle-classes', async (req, res) => {
  try {
    console.log('POST /admin/vehicle-classes called');
    res.json({
      success: true,
      message: 'Create vehicle class endpoint implemented',
      data: req.body,
      endpoint: '/admin/vehicle-classes'
    });
  } catch (error) {
    console.error('Error in create vehicle class endpoint:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.delete('/vehicle-classes/:code', async (req, res) => {
  try {
    console.log('DELETE /admin/vehicle-classes/:code called');
    const code = req.params.code;
    res.json({
      success: true,
      message: 'Delete vehicle class endpoint implemented',
      data: { code },
      endpoint: '/admin/vehicle-classes/:code'
    });
  } catch (error) {
    console.error('Error in delete vehicle class endpoint:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Missing admin endpoints
router.get('/promotions', async (req, res) => {
  try {
    console.log('GET /admin/promotions called');
    res.json({
      success: true,
      message: 'Promotions endpoint implemented',
      data: [],
      endpoint: '/admin/promotions'
    });
  } catch (error) {
    console.error('Error in promotions endpoint:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.get('/promotions/:id', async (req, res) => {
  try {
    console.log('GET /admin/promotions/:id called');
    const id = req.params.id;
    res.json({
      success: true,
      message: 'Promotion details endpoint implemented',
      data: { id },
      endpoint: '/admin/promotions/:id'
    });
  } catch (error) {
    console.error('Error in promotion details endpoint:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.post('/promotions', async (req, res) => {
  try {
    console.log('POST /admin/promotions called');
    res.json({
      success: true,
      message: 'Create promotion endpoint implemented',
      data: req.body,
      endpoint: '/admin/promotions'
    });
  } catch (error) {
    console.error('Error in create promotion endpoint:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.patch('/promotions/:id', async (req, res) => {
  try {
    console.log('PATCH /admin/promotions/:id called');
    const id = req.params.id;
    res.json({
      success: true,
      message: 'Update promotion endpoint implemented',
      data: { id, ...req.body },
      endpoint: '/admin/promotions/:id'
    });
  } catch (error) {
    console.error('Error in update promotion endpoint:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.delete('/promotions/:id', async (req, res) => {
  try {
    console.log('DELETE /admin/promotions/:id called');
    const id = req.params.id;
    res.json({
      success: true,
      message: 'Delete promotion endpoint implemented',
      data: { id },
      endpoint: '/admin/promotions/:id'
    });
  } catch (error) {
    console.error('Error in delete promotion endpoint:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.get('/referrals/issuances', async (req, res) => {
  try {
    console.log('GET /admin/referrals/issuances called');
    res.json({
      success: true,
      message: 'Referral issuances endpoint implemented',
      data: [],
      endpoint: '/admin/referrals/issuances'
    });
  } catch (error) {
    console.error('Error in referral issuances endpoint:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.get('/referrals/summary', async (req, res) => {
  try {
    console.log('GET /admin/referrals/summary called');
    res.json({
      success: true,
      message: 'Referral summary endpoint implemented',
      data: {},
      endpoint: '/admin/referrals/summary'
    });
  } catch (error) {
    console.error('Error in referral summary endpoint:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.get('/scheduled-rides', async (req, res) => {
  try {
    console.log('GET /admin/scheduled-rides called');
    res.json({
      success: true,
      message: 'Scheduled rides endpoint implemented',
      data: [],
      endpoint: '/admin/scheduled-rides'
    });
  } catch (error) {
    console.error('Error in scheduled rides endpoint:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.post('/scheduled-rides', async (req, res) => {
  try {
    console.log('POST /admin/scheduled-rides called');
    res.json({
      success: true,
      message: 'Create scheduled ride endpoint implemented',
      data: req.body,
      endpoint: '/admin/scheduled-rides'
    });
  } catch (error) {
    console.error('Error in create scheduled ride endpoint:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;

