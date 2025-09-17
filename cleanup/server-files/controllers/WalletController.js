const db = require('../db');
const { v4: uuidv4 } = require('uuid');

// Get wallet balance
exports.getWalletBalance = async (req, res) => {
  try {
    const ownerId = req.driver?.id || req.rider?.id;
    const ownerType = req.driver ? 'driver' : 'rider';
    
    if (!ownerId) {
      return res.status(401).json({
        status: false,
        message: "User not authenticated"
      });
    }
    
    // Get user's internal ID
    const userResult = await db.query(`
      SELECT id FROM users 
      WHERE uuid = $1 AND user_type = $2
    `, [ownerId, ownerType]);
    
    if (userResult.rows.length === 0) {
      return res.status(404).json({
        status: false,
        message: "User not found"
      });
    }
    
    const userId = userResult.rows[0].id;
    
    // Get or create wallet
    let walletResult = await db.query(`
      SELECT * FROM wallets 
      WHERE owner_type = $1 AND owner_id = $2
    `, [ownerType, userId]);
    
    if (walletResult.rows.length === 0) {
      // Create wallet if it doesn't exist
      await db.query(`
        INSERT INTO wallets (owner_type, owner_id, balance_cents, currency)
        VALUES ($1, $2, 0, 'USD')
      `, [ownerType, userId]);
      
      walletResult = await db.query(`
        SELECT * FROM wallets 
        WHERE owner_type = $1 AND owner_id = $2
      `, [ownerType, userId]);
    }
    
    const wallet = walletResult.rows[0];
    
    res.json({
      status: true,
      data: {
        balance_cents: wallet.balance_cents,
        available_balance_cents: wallet.balance_cents,
        pending_balance_cents: 0,
        currency: wallet.currency,
        formatted_balance: `$${(wallet.balance_cents / 100).toFixed(2)}`
      }
    });
  } catch (error) {
    console.error('Error getting wallet balance:', error);
    res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Get wallet transactions
exports.getWalletTransactions = async (req, res) => {
  try {
    const ownerId = req.driver?.id || req.rider?.id;
    const ownerType = req.driver ? 'driver' : 'rider';
    const { page = 1, limit = 20, type, reference_type } = req.query;
    const offset = (page - 1) * limit;
    
    if (!ownerId) {
      return res.status(401).json({
        status: false,
        message: "User not authenticated"
      });
    }
    
    // Get wallet ID
    const walletResult = await db.query(`
      SELECT id FROM wallets 
      WHERE owner_type = $1 AND owner_id = $2
    `, [ownerType, ownerId]);
    
    if (walletResult.rows.length === 0) {
      return res.json({
        status: true,
        data: {
          transactions: [],
          pagination: {
            current_page: 1,
            total_pages: 0,
            total_items: 0,
            items_per_page: parseInt(limit)
          }
        }
      });
    }
    
    const walletId = walletResult.rows[0].id;
    
    let whereClause = 'WHERE wallet_id = $1';
    const params = [walletId];
    let paramCount = 1;
    
    if (type) {
      paramCount++;
      whereClause += ` AND type = $${paramCount}`;
      params.push(type);
    }
    
    if (reference_type) {
      paramCount++;
      whereClause += ` AND meta->>'reference_type' = $${paramCount}`;
      params.push(reference_type);
    }
    
    // Get total count
    const countResult = await db.query(`
      SELECT COUNT(*) as total
      FROM wallet_ledger
      ${whereClause}
    `, params);
    
    const total = parseInt(countResult.rows[0].total);
    
    // Get transactions
    const transactionsResult = await db.query(`
      SELECT 
        id, type, amount_cents, currency, ride_id, meta, created_at
      FROM wallet_ledger
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `, [...params, limit, offset]);
    
    const transactions = transactionsResult.rows.map(tx => ({
      id: tx.id,
      transaction_type: tx.amount_cents > 0 ? 'credit' : 'debit',
      amount_cents: Math.abs(tx.amount_cents),
      balance_after_cents: 0, // TODO: Calculate running balance
      description: tx.meta?.description || `${tx.type} transaction`,
      reference_type: tx.meta?.reference_type || 'adjustment',
      reference_id: tx.ride_id || tx.meta?.reference_id,
      status: 'completed',
      created_at: tx.created_at
    }));
    
    res.json({
      status: true,
      data: {
        transactions,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(total / limit),
          total_items: total,
          items_per_page: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error getting wallet transactions:', error);
    res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Request payout
exports.requestPayout = async (req, res) => {
  try {
    const ownerId = req.driver?.id || req.rider?.id;
    const ownerType = req.driver ? 'driver' : 'rider';
    const { amount_cents, payout_method, payout_details } = req.body;
    
    if (!ownerId) {
      return res.status(401).json({
        status: false,
        message: "User not authenticated"
      });
    }
    
    // Get wallet
    const walletResult = await db.query(`
      SELECT * FROM wallets 
      WHERE owner_type = $1 AND owner_id = $2
    `, [ownerType, ownerId]);
    
    if (walletResult.rows.length === 0) {
      return res.status(404).json({
        status: false,
        message: "Wallet not found"
      });
    }
    
    const wallet = walletResult.rows[0];
    
    if (wallet.balance_cents < amount_cents) {
      return res.status(400).json({
        status: false,
        message: "Insufficient balance"
      });
    }
    
    // TODO: Implement actual payout logic
    // For now, just return success
    
    res.json({
      status: true,
      message: "Payout request submitted successfully",
      data: {
        payout_id: uuidv4(),
        amount_cents: amount_cents,
        status: "pending",
        estimated_processing_time: "2-3 business days",
        created_at: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error requesting payout:', error);
    res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message
    });
  }
};

// Get payouts
exports.getPayouts = async (req, res) => {
  try {
    const ownerId = req.driver?.id || req.rider?.id;
    const { page = 1, limit = 10, status } = req.query;
    const offset = (page - 1) * limit;
    
    if (!ownerId) {
      return res.status(401).json({
        status: false,
        message: "User not authenticated"
      });
    }
    
    // TODO: Implement payout history retrieval
    // For now, return mock data
    
    res.json({
      status: true,
      data: {
        payouts: [
          {
            id: uuidv4(),
            amount_cents: 50000,
            status: "completed",
            payout_method: "bank_transfer",
            created_at: "2025-09-15T14:30:00Z",
            processed_at: "2025-09-16T10:00:00Z"
          }
        ],
        pagination: {
          current_page: parseInt(page),
          total_pages: 1,
          total_items: 1,
          items_per_page: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Error getting payouts:', error);
    res.status(500).json({
      status: false,
      message: "Internal server error",
      error: error.message
    });
  }
};
