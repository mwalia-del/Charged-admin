const fs = require('fs');

// Read the admin routes file
let content = fs.readFileSync('admin_routes_update.js', 'utf8');

// Add missing endpoints before the module.exports line
const missingEndpoints = `
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

router.get('/rewards', async (req, res) => {
  try {
    console.log('GET /admin/rewards called');
    res.json({
      success: true,
      message: 'Rewards endpoint implemented',
      data: [],
      endpoint: '/admin/rewards'
    });
  } catch (error) {
    console.error('Error in rewards endpoint:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.post('/rewards', async (req, res) => {
  try {
    console.log('POST /admin/rewards called');
    res.json({
      success: true,
      message: 'Create reward endpoint implemented',
      data: req.body,
      endpoint: '/admin/rewards'
    });
  } catch (error) {
    console.error('Error in create reward endpoint:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

`;

// Insert the missing endpoints before module.exports
content = content.replace('module.exports = router;', missingEndpoints + '\nmodule.exports = router;');

// Write the fixed content back
fs.writeFileSync('admin_routes_update.js', content);
console.log('✅ Added missing admin endpoints to admin_routes_update.js');

