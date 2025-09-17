# 🚀 Driver API Implementation - Complete Guide

This document provides comprehensive information about the newly implemented driver API endpoints for referrals, tips, and wallet management.

## 📋 Table of Contents

1. [Database Schema](#database-schema)
2. [Referral Management Endpoints](#referral-management-endpoints)
3. [Tips Management Endpoints](#tips-management-endpoints)
4. [Wallet Management Endpoints](#wallet-management-endpoints)
5. [Authentication & Authorization](#authentication--authorization)
6. [Error Handling](#error-handling)
7. [Testing Examples](#testing-examples)
8. [Implementation Status](#implementation-status)

---

## 🗄️ Database Schema

### New Tables Created

#### Referral System Tables

```sql
-- Referral Programs Table
CREATE TABLE referral_programs (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Driver Referral Codes Table
CREATE TABLE driver_referral_codes (
    id SERIAL PRIMARY KEY,
    driver_id INTEGER NOT NULL,
    referral_code VARCHAR(20) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    total_referrals INTEGER DEFAULT 0,
    total_earnings DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (driver_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Referral Registrations Table
CREATE TABLE referral_registrations (
    id SERIAL PRIMARY KEY,
    referrer_driver_id INTEGER NOT NULL,
    referred_driver_id INTEGER NOT NULL,
    referral_code VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
    reward_amount DECIMAL(10,2) DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (referrer_driver_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (referred_driver_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE (referrer_driver_id, referred_driver_id)
);

-- Referral Tiers Table
CREATE TABLE referral_tiers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    min_referrals INTEGER NOT NULL,
    max_referrals INTEGER,
    reward_per_referral DECIMAL(10,2) NOT NULL,
    bonus_percentage DECIMAL(5,2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Referral Payouts Table
CREATE TABLE referral_payouts (
    id SERIAL PRIMARY KEY,
    driver_id INTEGER NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
    payment_method VARCHAR(50),
    transaction_id VARCHAR(100),
    paid_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (driver_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### Tips System Tables

```sql
-- Driver Tips Table
CREATE TABLE driver_tips (
    id SERIAL PRIMARY KEY,
    ride_id INTEGER NOT NULL,
    driver_id INTEGER NOT NULL,
    rider_id INTEGER NOT NULL,
    tip_amount DECIMAL(10,2) NOT NULL,
    tip_percentage DECIMAL(5,2),
    payment_method VARCHAR(50),
    status VARCHAR(20) DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'refunded')),
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ride_id) REFERENCES rides(id) ON DELETE CASCADE,
    FOREIGN KEY (driver_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (rider_id) REFERENCES users(id) ON DELETE CASCADE
);
```

#### Existing Wallet System

The wallet system was already implemented with these tables:
- `wallets` - Main wallet table
- `wallet_ledger` - Transaction history

---

## 🎯 Referral Management Endpoints

### 1. POST /referral/driver/referral/generate-id

**Purpose**: Generate a unique referral code for a driver

**Authentication**: Required (Firebase ID Token)

**Request Body**: None

**Response Schema**:
```json
{
  "status": true,
  "message": "Referral code generated successfully",
  "data": {
    "referral_id": "DRV-ABC123XYZ",
    "expires_at": null
  }
}
```

**Example cURL**:
```bash
curl -X POST "https://api.charged.autos/referral/driver/referral/generate-id" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -H "Content-Type: application/json"
```

### 2. POST /referral/driver/referral/register

**Purpose**: Register a driver with a referral code

**Authentication**: Required (Firebase ID Token)

**Request Body**:
```json
{
  "referral_id": "DRV-ABC123XYZ",
  "referrer_type": "driver"
}
```

**Response Schema**:
```json
{
  "status": true,
  "message": "Successfully registered with referral code",
  "data": {
    "referral_code": "DRV-ABC123XYZ",
    "referrer_driver_id": 123,
    "reward_amount": 25.00
  }
}
```

### 3. GET /referral/driver/referral/stats/:userId

**Purpose**: Get referral statistics for a driver

**Authentication**: Required (Firebase ID Token)

**URL Parameters**:
- `userId` (number): Driver ID

**Response Schema**:
```json
{
  "status": true,
  "data": {
    "total_referrals": 15,
    "total_earnings": 375.00,
    "this_month_referrals": 3,
    "this_month_earnings": 75.00,
    "referral_code": "DRV-ABC123XYZ",
    "tier": "Gold",
    "next_tier_referrals": 5
  }
}
```

### 4. GET /referral/driver/referral/tier/:userId

**Purpose**: Get referral tier information for a driver

**Authentication**: Required (Firebase ID Token)

**Response Schema**:
```json
{
  "status": true,
  "data": {
    "current_tier": {
      "id": 2,
      "name": "Gold",
      "min_referrals": 10,
      "max_referrals": 24,
      "reward_per_referral": 30.00,
      "bonus_percentage": 5.00
    },
    "next_tier": {
      "id": 3,
      "name": "Platinum",
      "min_referrals": 25,
      "reward_per_referral": 50.00,
      "bonus_percentage": 10.00
    },
    "referrals_to_next_tier": 15,
    "benefits": [
      "Higher reward per referral",
      "5% bonus on all earnings",
      "Priority support"
    ]
  }
}
```

### 5. GET /referral/driver/referral/payouts/:userId

**Purpose**: Get referral payout history for a driver

**Authentication**: Required (Firebase ID Token)

**Query Parameters**:
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10)

**Response Schema**:
```json
{
  "status": true,
  "data": {
    "payouts": [
      {
        "id": 1,
        "amount": 150.00,
        "status": "completed",
        "payment_method": "bank_transfer",
        "paid_at": "2025-09-15T10:30:00Z",
        "created_at": "2025-09-15T09:00:00Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 3,
      "total_items": 25,
      "items_per_page": 10
    }
  }
}
```

---

## 💰 Tips Management Endpoints

### 1. GET /tips/driver/earnings/tips

**Purpose**: Get driver tips with pagination and filtering

**Authentication**: Required (Firebase ID Token)

**Query Parameters**:
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10)
- `start_date` (string, optional): Start date filter (ISO 8601)
- `end_date` (string, optional): End date filter (ISO 8601)
- `status` (string, optional): Filter by status (pending, completed, refunded)

**Response Schema**:
```json
{
  "status": true,
  "data": {
    "tips": [
      {
        "id": 1,
        "ride_id": 1001,
        "rider_id": 201,
        "rider_name": "John Doe",
        "tip_amount": 5.00,
        "tip_percentage": 10.00,
        "payment_method": "card",
        "status": "completed",
        "ride_date": "2025-09-15T14:30:00Z",
        "added_at": "2025-09-15T14:35:00Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 5,
      "total_items": 45,
      "items_per_page": 10
    }
  }
}
```

### 2. GET /tips/driver/earnings/tips/summary

**Purpose**: Get tips summary statistics for a driver

**Authentication**: Required (Firebase ID Token)

**Query Parameters**:
- `start_date` (string, optional): Start date filter (ISO 8601)
- `end_date` (string, optional): End date filter (ISO 8601)

**Response Schema**:
```json
{
  "status": true,
  "data": {
    "total_tips": 125.50,
    "total_tips_count": 28,
    "this_month_tips": 45.25,
    "this_month_count": 12,
    "last_tip_amount": 5.00,
    "last_tip_date": "2025-09-15T14:35:00Z",
    "average_tip": 4.48,
    "highest_tip": 15.00
  }
}
```

### 3. GET /tips/driver/earnings/tips/:rideId

**Purpose**: Get tip details for a specific ride

**Authentication**: Required (Firebase ID Token)

**Response Schema**:
```json
{
  "status": true,
  "data": {
    "ride_id": 1001,
    "rider_name": "John Doe",
    "tip_amount": 5.00,
    "tip_percentage": 10.00,
    "payment_method": "card",
    "status": "completed",
    "ride_date": "2025-09-15T14:30:00Z",
    "added_at": "2025-09-15T14:35:00Z",
    "ride_details": {
      "pickup_address": "123 Main St, San Francisco, CA",
      "dropoff_address": "456 Oak Ave, San Francisco, CA",
      "fare_amount": 25.00
    }
  }
}
```

### 4. POST /tips/rider/tip/add

**Purpose**: Add tip for a ride (called by rider)

**Authentication**: Required (Firebase ID Token)

**Request Body**:
```json
{
  "ride_id": 1001,
  "tip_amount": 5.00,
  "tip_percentage": 10.00,
  "payment_method": "card"
}
```

**Response Schema**:
```json
{
  "status": true,
  "message": "Tip added successfully",
  "data": {
    "tip_id": 123,
    "ride_id": 1001,
    "tip_amount": 5.00,
    "tip_percentage": 10.00
  }
}
```

---

## 💳 Wallet Management Endpoints

### 1. GET /wallet/driver/wallet/balance

**Purpose**: Get driver wallet balance information

**Authentication**: Required (Firebase ID Token)

**Response Schema**:
```json
{
  "status": true,
  "data": {
    "balance_cents": 125500,
    "available_balance_cents": 100000,
    "pending_balance_cents": 25500,
    "total_earned_cents": 500000,
    "total_withdrawn_cents": 374500,
    "currency": "USD",
    "formatted_balance": "$1,255.00",
    "formatted_available": "$1,000.00",
    "formatted_pending": "$255.00"
  }
}
```

### 2. GET /wallet/driver/wallet/transactions

**Purpose**: Get wallet transaction history

**Authentication**: Required (Firebase ID Token)

**Query Parameters**:
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 20)
- `type` (string, optional): Filter by transaction type (credit, debit)
- `reference_type` (string, optional): Filter by reference type (ride, tip, referral, payout, adjustment)

**Response Schema**:
```json
{
  "status": true,
  "data": {
    "transactions": [
      {
        "id": "uuid-123",
        "transaction_type": "credit",
        "amount_cents": 2500,
        "balance_after_cents": 125500,
        "description": "Ride payment - Ride #1001",
        "reference_type": "ride",
        "reference_id": 1001,
        "status": "completed",
        "created_at": "2025-09-15T14:30:00Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 10,
      "total_items": 200,
      "items_per_page": 20
    }
  }
}
```

### 3. POST /wallet/driver/wallet/payout

**Purpose**: Request a wallet payout

**Authentication**: Required (Firebase ID Token)

**Request Body**:
```json
{
  "amount_cents": 50000,
  "payout_method": "bank_transfer",
  "payout_details": {
    "bank_account": "****1234",
    "routing_number": "123456789"
  }
}
```

**Response Schema**:
```json
{
  "status": true,
  "message": "Payout request submitted successfully",
  "data": {
    "payout_id": "uuid-123",
    "amount_cents": 50000,
    "status": "pending",
    "estimated_processing_time": "2-3 business days",
    "created_at": "2025-09-15T14:30:00Z"
  }
}
```

### 4. GET /wallet/driver/wallet/payouts

**Purpose**: Get payout history for a driver

**Authentication**: Required (Firebase ID Token)

**Query Parameters**:
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10)
- `status` (string, optional): Filter by status (pending, processing, completed, failed, cancelled)

**Response Schema**:
```json
{
  "status": true,
  "data": {
    "payouts": [
      {
        "id": "uuid-123",
        "amount_cents": 50000,
        "payout_method": "bank_transfer",
        "status": "completed",
        "stripe_payout_id": "po_1234567890",
        "processed_at": "2025-09-16T10:30:00Z",
        "created_at": "2025-09-15T14:30:00Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 5,
      "total_items": 50,
      "items_per_page": 10
    }
  }
}
```

---

## 🔐 Authentication & Authorization

### Current Implementation Status

**⚠️ IMPORTANT**: The authentication middleware in the new controllers currently uses placeholder authentication. You need to implement proper Firebase token verification.

### Required Authentication Implementation

```javascript
const admin = require('firebase-admin');

const authenticateDriver = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        status: false,
        message: "Authorization token required"
      });
    }
    
    // Verify Firebase token
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Get driver from database
    const driver = await db.query(
      'SELECT * FROM users WHERE firebase_id = $1 AND user_type = $2 AND is_active = true',
      [decodedToken.uid, 'driver']
    );
    
    if (driver.rows.length === 0) {
      return res.status(401).json({
        status: false,
        message: "Driver not found or inactive"
      });
    }
    
    req.driver = driver.rows[0];
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({
      status: false,
      message: "Invalid or expired token"
    });
  }
};
```

---

## ⚠️ Error Handling

### Standard Error Response Format

```json
{
  "status": false,
  "message": "Human-readable error message",
  "error": "Technical error details",
  "code": "ERROR_CODE"
}
```

### Common Error Codes

- `AUTH_REQUIRED`: Authentication required
- `AUTH_INVALID`: Invalid authentication token
- `AUTH_EXPIRED`: Authentication token expired
- `VALIDATION_ERROR`: Request validation failed
- `INSUFFICIENT_BALANCE`: Insufficient wallet balance
- `REFERRAL_CODE_INVALID`: Invalid referral code
- `REFERRAL_ALREADY_USED`: Referral code already used
- `PAYOUT_AMOUNT_TOO_LOW`: Payout amount below minimum
- `RATE_LIMIT_EXCEEDED`: Too many requests

---

## 🧪 Testing Examples

### Complete cURL Test Commands

```bash
# Generate referral code
curl -X POST "https://api.charged.autos/referral/driver/referral/generate-id" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -H "Content-Type: application/json"

# Register with referral
curl -X POST "https://api.charged.autos/referral/driver/referral/register" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"referral_id": "DRV-ABC123XYZ", "referrer_type": "driver"}'

# Get referral stats
curl -X GET "https://api.charged.autos/referral/driver/referral/stats/123" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"

# Get tips
curl -X GET "https://api.charged.autos/tips/driver/earnings/tips?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"

# Get wallet balance
curl -X GET "https://api.charged.autos/wallet/driver/wallet/balance" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN"

# Request payout
curl -X POST "https://api.charged.autos/wallet/driver/wallet/payout" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"amount_cents": 50000, "payout_method": "bank_transfer", "payout_details": {"bank_account": "****1234"}}'
```

---

## 📝 Implementation Status

### ✅ Completed

1. **Database Schema**: All required tables created
2. **Controller Files**: All controllers implemented
3. **Route Files**: All routes configured
4. **App Integration**: Routes added to main app.js
5. **Application Restart**: Server restarted with new endpoints

### ⚠️ Requires Implementation

1. **Authentication**: Replace placeholder authentication with Firebase token verification
2. **Error Handling**: Implement comprehensive error handling
3. **Validation**: Add request validation middleware
4. **Rate Limiting**: Implement rate limiting for sensitive endpoints
5. **Logging**: Add proper logging for all operations
6. **Testing**: Write comprehensive unit and integration tests

### 🔄 Next Steps

1. **Update Authentication**: Implement proper Firebase authentication in all controllers
2. **Add Validation**: Add request validation using libraries like Joi or express-validator
3. **Implement Error Handling**: Add comprehensive error handling middleware
4. **Add Logging**: Implement structured logging for all operations
5. **Write Tests**: Create unit and integration tests for all endpoints
6. **Documentation**: Update API documentation with new endpoints
7. **Monitoring**: Add monitoring and alerting for the new endpoints

---

## 🚀 Deployment Notes

- All files have been uploaded to the server
- Database tables have been created
- Application has been restarted
- Endpoints are accessible at `https://api.charged.autos/`

The implementation is ready for testing and further development. Make sure to implement proper authentication before using in production.
