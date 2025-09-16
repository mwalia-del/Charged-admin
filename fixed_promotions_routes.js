const express = require('express');
const router = express.Router();
const pool = require('./db');

const checkAuth = (req, res, next) => {
  console.log('Promotion authentication check');
  next();
};

// Get all promotions with optional audience filtering
router.get('/', checkAuth, async (req, res) => {
  try {
    const { audience } = req.query;
    let result;
    
    if (audience) {
      result = await pool.query(
        'SELECT * FROM promotions WHERE audience = $1 ORDER BY created_at DESC', 
        [audience]
      );
    } else {
      result = await pool.query('SELECT * FROM promotions ORDER BY created_at DESC');
    }
    
    res.json({ 
      success: true, 
      data: result.rows, 
      message: 'Promotions fetched successfully' 
    });
  } catch (error) {
    console.error('Error fetching promotions:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching promotions', 
      error: error.message 
    });
  }
});

// Get active promotions with optional audience filtering
router.get('/active', checkAuth, async (req, res) => {
  try {
    const { audience } = req.query;
    let result;
    
    if (audience) {
      result = await pool.query(
        'SELECT * FROM promotions WHERE is_active = true AND (expires_at IS NULL OR expires_at > NOW()) AND audience = $1 ORDER BY created_at DESC', 
        [audience]
      );
    } else {
      result = await pool.query(
        'SELECT * FROM promotions WHERE is_active = true AND (expires_at IS NULL OR expires_at > NOW()) ORDER BY created_at DESC'
      );
    }
    
    res.json({ 
      success: true, 
      data: result.rows, 
      message: 'Active promotions fetched successfully' 
    });
  } catch (error) {
    console.error('Error fetching active promotions:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching active promotions', 
      error: error.message 
    });
  }
});

// Create new promotion
router.post('/', checkAuth, async (req, res) => {
  try {
    const { 
      title, 
      description, 
      discount_type, 
      discount_value, 
      code, 
      expires_at, 
      is_active, 
      audience 
    } = req.body;
    
    const result = await pool.query(
      'INSERT INTO promotions (title, description, discount_type, discount_value, code, expires_at, is_active, audience) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *',
      [title, description, discount_type, discount_value, code, expires_at, is_active, audience]
    );
    
    res.status(201).json({ 
      success: true, 
      data: result.rows[0], 
      message: 'Promotion created successfully' 
    });
  } catch (error) {
    console.error('Error creating promotion:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error creating promotion', 
      error: error.message 
    });
  }
});

// Get promotion by ID
router.get('/:id', checkAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM promotions WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Promotion not found' 
      });
    }
    
    res.json({ 
      success: true, 
      data: result.rows[0], 
      message: 'Promotion fetched successfully' 
    });
  } catch (error) {
    console.error('Error fetching promotion:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching promotion', 
      error: error.message 
    });
  }
});

// Update promotion
router.put('/:id', checkAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      title, 
      description, 
      discount_type, 
      discount_value, 
      code, 
      expires_at, 
      is_active, 
      audience 
    } = req.body;
    
    const result = await pool.query(
      'UPDATE promotions SET title = $1, description = $2, discount_type = $3, discount_value = $4, code = $5, expires_at = $6, is_active = $7, audience = $8, updated_at = NOW() WHERE id = $9 RETURNING *',
      [title, description, discount_type, discount_value, code, expires_at, is_active, audience, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Promotion not found' 
      });
    }
    
    res.json({ 
      success: true, 
      data: result.rows[0], 
      message: 'Promotion updated successfully' 
    });
  } catch (error) {
    console.error('Error updating promotion:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error updating promotion', 
      error: error.message 
    });
  }
});

// Delete promotion
router.delete('/:id', checkAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM promotions WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Promotion not found' 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Promotion deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting promotion:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting promotion', 
      error: error.message 
    });
  }
});

// Get promotions summary/stats
router.get('/stats/summary', checkAuth, async (req, res) => {
  try {
    const { audience } = req.query;
    let result;
    
    if (audience) {
      result = await pool.query(`
        SELECT 
          COUNT(*) as total_promotions,
          COUNT(CASE WHEN is_active = true THEN 1 END) as active_promotions,
          COUNT(CASE WHEN is_active = false THEN 1 END) as inactive_promotions,
          audience
        FROM promotions 
        WHERE audience = $1
        GROUP BY audience
      `, [audience]);
    } else {
      result = await pool.query(`
        SELECT 
          COUNT(*) as total_promotions,
          COUNT(CASE WHEN is_active = true THEN 1 END) as active_promotions,
          COUNT(CASE WHEN is_active = false THEN 1 END) as inactive_promotions
        FROM promotions
      `);
    }
    
    res.json({ 
      success: true, 
      data: result.rows[0] || { total_promotions: 0, active_promotions: 0, inactive_promotions: 0 }, 
      message: 'Promotions summary fetched successfully' 
    });
  } catch (error) {
    console.error('Error fetching promotions summary:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching promotions summary', 
      error: error.message 
    });
  }
});

module.exports = router;

