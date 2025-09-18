# 🚗 Charged Autos - Admin Dashboard API Documentation

## 📋 Table of Contents
1. [Overview](#overview)
2. [Base Configuration](#base-configuration)
3. [Authentication](#authentication)
4. [Core Admin Endpoints](#core-admin-endpoints)
5. [User Management](#user-management)
6. [Ride Management](#ride-management)
7. [Analytics & Reporting](#analytics--reporting)
8. [Tips & Ratings](#tips--ratings)
9. [Referrals](#referrals)
10. [Promotions](#promotions)
11. [Scheduled Rides](#scheduled-rides)
12. [Rewards System](#rewards-system)
13. [Wallet Management](#wallet-management)
14. [Document Management](#document-management)
15. [Vehicle Classes](#vehicle-classes)
16. [Database Schema](#database-schema)
17. [Environment Configuration](#environment-configuration)

---

## 🌐 Overview

**Base URL:** `https://api.charged.autos`  
**API Version:** v1  
**Authentication:** Firebase JWT + Admin Role Verification  
**Content-Type:** `application/json`

---

## ⚙️ Base Configuration

### Server Details
- **Domain:** `https://api.charged.autos`
- **Admin Dashboard Domain:** `https://admin.charged.autos`
- **Database:** PostgreSQL
- **Authentication:** Firebase Admin SDK
- **File Storage:** Local filesystem

### CORS Configuration
```javascript
app.use(cors()) // All origins allowed
```

---

## 🔐 Authentication

### Required Headers
```http
Authorization: Bearer <firebase_jwt_token>
Content-Type: application/json
```

### Admin Role Verification
All admin endpoints require:
1. Valid Firebase JWT token
2. User with `user_type = 'admin'`
3. `checkAdmin` middleware validation

### Authentication Middleware
```javascript
const { loginAuth, checkAdmin } = require('../middlewares/auth')
```

---

## 👑 Core Admin Endpoints

### Admin Profile
```http
GET /admin/
```
**Description:** Get admin user details  
**Auth:** `loginAuth + checkAdmin`  
**Response:**
```json
{
  "status": true,
  "data": {
    "id": 1,
    "name": "Admin User",
    "email": "admin@charged.autos",
    "user_type": "admin"
  }
}
```

### Dashboard Statistics
```http
GET /admin/dashboardstats
```
**Description:** Get comprehensive dashboard statistics  
**Auth:** `loginAuth + checkAdmin`  
**Response:**
```json
{
  "status": true,
  "data": {
    "total_drivers": 150,
    "total_riders": 500,
    "total_rides": 2500,
    "active_rides": 25,
    "completed_rides": 2400,
    "cancelled_rides": 75,
    "total_earnings": 125000.50,
    "driver_earnings": 100000.40,
    "platform_fees": 25000.10
  }
}
```

---

## 👥 User Management

### Get All Drivers
```http
GET /admin/getdrivers
```
**Description:** Retrieve all drivers with pagination and filters  
**Auth:** `loginAuth + checkAdmin`  
**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)
- `status` (optional): Filter by status
- `search` (optional): Search by name/email

**Response:**
```json
{
  "status": true,
  "data": {
    "drivers": [
      {
        "id": 171,
        "name": "John Driver",
        "email": "driver@example.com",
        "phone": "+1234567890",
        "rating": 4.8,
        "is_verified": true,
        "is_online": false,
        "created_at": "2025-01-01T00:00:00Z",
        "driver_details": {
          "license_number": "DL123456",
          "vehicle_model": "Toyota Camry",
          "license_plate": "ABC123"
        }
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 8,
      "total_items": 150,
      "items_per_page": 20
    }
  }
}
```

### Get All Riders
```http
GET /admin/getriders
```
**Description:** Retrieve all riders with pagination and filters  
**Auth:** `loginAuth + checkAdmin`  
**Query Parameters:** Same as drivers  
**Response:** Similar structure to drivers

### Update Driver Status
```http
PUT /admin/updatestatus/:driverId
```
**Description:** Update driver verification/approval status  
**Auth:** `loginAuth + checkAdmin`  
**Request Body:**
```json
{
  "is_verified": true,
  "status": "approved"
}
```

### Delete User
```http
DELETE /admin/deleteusers/:userId
```
**Description:** Soft delete a user (driver/rider)  
**Auth:** `loginAuth + checkAdmin`  
**Response:**
```json
{
  "status": true,
  "message": "User deleted successfully"
}
```

---

## 🚗 Ride Management

### Get All Rides
```http
GET /admin/ride/fetchlatest
```
**Description:** Get all rides with filters and pagination  
**Auth:** `loginAuth + checkAdmin`  
**Query Parameters:**
- `page`, `limit`: Pagination
- `status`: Filter by ride status
- `date_from`, `date_to`: Date range
- `driver_id`, `rider_id`: Filter by user

**Response:**
```json
{
  "status": true,
  "data": {
    "rides": [
      {
        "id": 588,
        "rider_id": 175,
        "driver_id": 171,
        "pickup_address": "1800 Ellis St, San Francisco, CA",
        "dropoff_address": "518 Grant Ave, San Francisco, CA",
        "total_fare": 25.50,
        "driver_earnings": 20.40,
        "platform_fee": 5.10,
        "status": "completed",
        "created_at": "2025-09-18T05:33:37Z",
        "completed_at": "2025-09-18T05:45:00Z",
        "rating": 5.0,
        "review": "Excellent driver!"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 125,
      "total_items": 2500,
      "items_per_page": 20
    }
  }
}
```

### Get User Rides
```http
GET /admin/ride/userrides/:userId
```
**Description:** Get all rides for a specific user  
**Auth:** `loginAuth + checkAdmin`

### Get Specific Ride
```http
GET /admin/ride/fetchride/:rideId
```
**Description:** Get detailed information about a specific ride  
**Auth:** `loginAuth + checkAdmin`

### Fetch Driver Details
```http
GET /ride/fetchdriver/:driverId
```
**Description:** Get driver information by ID  
**Auth:** `loginAuth`

### Fetch Rider Details
```http
GET /ride/fetchrider/:riderId
```
**Description:** Get rider information by ID  
**Auth:** `loginAuth`

---

## 📊 Analytics & Reporting

### Tips Analytics
```http
GET /analytics/tips
```
**Description:** Get comprehensive tips analytics  
**Query Parameters:**
- `start_date`, `end_date`: Date range
- `driver_id`: Filter by driver
- `export`: Set to 'true' for CSV export

### Tips Summary
```http
GET /analytics/tips/summary
```
**Description:** Get tips summary statistics  
**Response:**
```json
{
  "status": true,
  "data": {
    "total_tips": 1250,
    "total_amount": 12500.50,
    "average_tip": 10.00,
    "top_drivers": [
      {
        "driver_id": 171,
        "driver_name": "John Driver",
        "total_tips": 500.00,
        "tip_count": 50
      }
    ]
  }
}
```

### Tips Export
```http
GET /analytics/tips/export
```
**Description:** Export tips data to CSV  
**Response:** CSV file download

---

## 💰 Tips & Ratings

### Get All Tips (Admin)
```http
GET /tips/driver
```
**Description:** Get all driver tips with admin access  
**Auth:** `loginAuth + checkAdmin`  
**Query Parameters:**
- `page`, `limit`: Pagination
- `start_date`, `end_date`: Date filters
- `driver_id`: Filter by driver

**Response:**
```json
{
  "status": true,
  "data": {
    "driver_tips": [
      {
        "id": 5,
        "ride_id": 588,
        "driver_id": 171,
        "rider_id": 175,
        "tip_amount": "500.00",
        "tip_percentage": "15.00",
        "payment_method": "card",
        "rider_email": "rider@example.com",
        "pickup_address": "1800 Ellis St, San Francisco, CA",
        "dropoff_address": "518 Grant Ave, San Francisco, CA",
        "added_at": "2025-09-18T05:45:21.787Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 5,
      "total_items": 100,
      "items_per_page": 20
    }
  }
}
```

### Tips Summary (Admin)
```http
GET /tips/driver/summary
```
**Description:** Get comprehensive tips summary for admin  
**Auth:** `loginAuth + checkAdmin`

### Get Tip by Ride ID
```http
GET /tips/driver/ride/:rideId
```
**Description:** Get tip details for specific ride  
**Auth:** `loginAuth + checkAdmin`

---

## 🎯 Referrals

### Get All Referrals (Admin)
```http
GET /referral/admin
```
**Description:** Get all referral data for admin dashboard  
**Auth:** `loginAuth + checkAdmin`  
**Response:**
```json
{
  "status": true,
  "data": {
    "driver_referrals": [
      {
        "referrer_id": 171,
        "referred_id": 172,
        "referral_code": "DRV10R239XH",
        "status": "completed",
        "earnings": 25.00,
        "created_at": "2025-09-18T00:00:00Z"
      }
    ],
    "rider_referrals": [
      {
        "referrer_id": 175,
        "referred_id": 176,
        "referral_code": "RID5K8M2N9P",
        "status": "completed",
        "earnings": 10.00,
        "created_at": "2025-09-18T00:00:00Z"
      }
    ],
    "summary": {
      "total_driver_referrals": 50,
      "total_rider_referrals": 100,
      "total_referral_earnings": 1500.00
    }
  }
}
```

### Driver Referral Management
```http
GET /admin/referral/user/:userId
```
**Description:** Get driver referral details by user ID  
**Auth:** `loginAuth + checkAdmin`

```http
GET /admin/referral/stats/:userId
```
**Description:** Get driver referral statistics  
**Auth:** `loginAuth + checkAdmin`

```http
GET /admin/referral/tier/:userId
```
**Description:** Get driver referral tier information  
**Auth:** `loginAuth + checkAdmin`

---

## 🎁 Promotions

### Get All Promotions (Admin)
```http
GET /promotions/admin
```
**Description:** Get all promotions for admin management  
**Auth:** `loginAuth + checkAdmin`  
**Response:**
```json
{
  "status": true,
  "data": {
    "promotions": [
      {
        "id": 1,
        "name": "New User Discount",
        "code": "NEWUSER20",
        "discount_type": "percentage",
        "discount_value": 20,
        "min_fare": 10.00,
        "max_discount": 5.00,
        "is_active": true,
        "valid_from": "2025-01-01T00:00:00Z",
        "valid_until": "2025-12-31T23:59:59Z",
        "usage_count": 150,
        "usage_limit": 1000
      }
    ]
  }
}
```

### Create Promotion
```http
POST /promotions/admin
```
**Description:** Create new promotion  
**Auth:** `loginAuth + checkAdmin`  
**Request Body:**
```json
{
  "name": "Holiday Special",
  "code": "HOLIDAY2025",
  "discount_type": "fixed",
  "discount_value": 5.00,
  "min_fare": 15.00,
  "max_discount": 5.00,
  "valid_from": "2025-12-01T00:00:00Z",
  "valid_until": "2025-12-31T23:59:59Z",
  "usage_limit": 500
}
```

### Update Promotion
```http
PUT /promotions/admin/:promotionId
```
**Description:** Update existing promotion  
**Auth:** `loginAuth + checkAdmin`

### Delete Promotion
```http
DELETE /promotions/admin/:promotionId
```
**Description:** Delete promotion  
**Auth:** `loginAuth + checkAdmin`

---

## 📅 Scheduled Rides

### Get All Scheduled Rides (Admin)
```http
GET /scheduled/admin
```
**Description:** Get all scheduled rides for admin management  
**Auth:** `loginAuth + checkAdmin`  
**Response:**
```json
{
  "status": true,
  "data": {
    "scheduled_rides": [
      {
        "id": 1,
        "rider_id": 175,
        "driver_id": 171,
        "pickup_address": "1800 Ellis St, San Francisco, CA",
        "dropoff_address": "518 Grant Ave, San Francisco, CA",
        "scheduled_time": "2025-09-19T08:00:00Z",
        "estimated_fare": 25.50,
        "status": "scheduled",
        "created_at": "2025-09-18T05:00:00Z"
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

---

## 🏆 Rewards System

### Get All Rewards (Admin)
```http
GET /admin/rewards
```
**Description:** Get all reward programs  
**Auth:** `loginAuth + checkAdmin`  
**Response:**
```json
{
  "status": true,
  "data": {
    "rewards": [
      {
        "id": 1,
        "name": "Ride Completion Bonus",
        "description": "Earn points for completing rides",
        "points_per_ride": 10,
        "is_active": true,
        "created_at": "2025-01-01T00:00:00Z"
      }
    ]
  }
}
```

### Create Reward
```http
POST /admin/rewards
```
**Description:** Create new reward program  
**Auth:** `loginAuth + checkAdmin`

### Add Reward Points to User
```http
POST /admin/rewardpoints/:userId
```
**Description:** Manually add reward points to user  
**Auth:** `loginAuth + checkAdmin`  
**Request Body:**
```json
{
  "points": 100,
  "reason": "Manual bonus"
}
```

### Get User Reward Points
```http
GET /admin/rewardpoints/:userId
```
**Description:** Get user's reward points history  
**Auth:** `loginAuth + checkAdmin`

### Delete Reward
```http
DELETE /admin/rewards/:rewardId
```
**Description:** Delete reward program  
**Auth:** `loginAuth + checkAdmin`

### Delete Reward Points
```http
DELETE /admin/rewardpoints/:pointId
```
**Description:** Delete specific reward points entry  
**Auth:** `loginAuth + checkAdmin`

---

## 💳 Wallet Management

### Get Wallet Balance
```http
GET /wallet/balance
```
**Description:** Get wallet balance (admin access)  
**Auth:** `loginAuth + checkAdmin`

### Get Wallet Transactions
```http
GET /wallet/transactions
```
**Description:** Get all wallet transactions  
**Auth:** `loginAuth + checkAdmin`  
**Query Parameters:**
- `user_id`: Filter by user
- `type`: Transaction type (credit/debit)
- `start_date`, `end_date`: Date range

### Request Payout
```http
POST /wallet/payout
```
**Description:** Process payout request  
**Auth:** `loginAuth + checkAdmin`

### Get Payouts
```http
GET /wallet/payouts
```
**Description:** Get all payout requests  
**Auth:** `loginAuth + checkAdmin`

---

## 📄 Document Management

### Get Document Types
```http
GET /admin/documenttypes
```
**Description:** Get all document types  
**Auth:** `loginAuth + checkAdmin`  
**Response:**
```json
{
  "status": true,
  "data": {
    "document_types": [
      {
        "id": 1,
        "name": "Driver License",
        "description": "Valid driver's license",
        "is_required": true,
        "created_at": "2025-01-01T00:00:00Z"
      }
    ]
  }
}
```

### Create Document Type
```http
POST /admin/documenttypes
```
**Description:** Create new document type  
**Auth:** `loginAuth + checkAdmin`

### Update Document Type
```http
PUT /admin/documenttypes/:typeId
```
**Description:** Update document type  
**Auth:** `loginAuth + checkAdmin`

### Delete Document Type
```http
DELETE /admin/documenttypes/:typeId
```
**Description:** Delete document type  
**Auth:** `loginAuth + checkAdmin`

### Get Driver Documents
```http
GET /admin/getdriverdocs/:driverId
```
**Description:** Get all documents for specific driver  
**Auth:** `loginAuth + checkAdmin`

### Verify Driver Document
```http
PUT /admin/verifydriverdoc/:driverId/:documentId
```
**Description:** Verify/approve driver document  
**Auth:** `loginAuth + checkAdmin`  
**Request Body:**
```json
{
  "status": "approved",
  "notes": "Document verified successfully"
}
```

### Upload Files
```http
POST /admin/uploadfiles
```
**Description:** Upload files (documents, images)  
**Auth:** `loginAuth + checkAdmin`  
**Content-Type:** `multipart/form-data`

---

## 🚙 Vehicle Classes

### Get All Vehicle Classes
```http
GET /admin/vehicle-classes
```
**Description:** Get all vehicle classes  
**Auth:** `loginAuth + checkAdmin`  
**Response:**
```json
{
  "status": true,
  "data": {
    "vehicle_classes": [
      {
        "code": "ECONOMY",
        "name": "Economy",
        "description": "Basic vehicle class",
        "base_fare": 2.50,
        "per_km_rate": 1.20,
        "per_minute_rate": 0.15,
        "is_active": true
      }
    ]
  }
}
```

### Get Vehicle Class by Code
```http
GET /admin/vehicle-classes/:code
```
**Description:** Get specific vehicle class  
**Auth:** `loginAuth + checkAdmin`

### Create Vehicle Class
```http
POST /admin/vehicle-classes
```
**Description:** Create new vehicle class  
**Auth:** `loginAuth + checkAdmin`  
**Request Body:**
```json
{
  "code": "PREMIUM",
  "name": "Premium",
  "description": "Premium vehicle class",
  "base_fare": 5.00,
  "per_km_rate": 2.00,
  "per_minute_rate": 0.25
}
```

### Update Vehicle Class
```http
PATCH /admin/vehicle-classes/:code
```
**Description:** Update vehicle class  
**Auth:** `loginAuth + checkAdmin`

### Delete Vehicle Class
```http
DELETE /admin/vehicle-classes/:code
```
**Description:** Delete vehicle class  
**Auth:** `loginAuth + checkAdmin`

---

## 🗄️ Database Schema

### Core Tables

#### Users Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    password VARCHAR(100) NOT NULL,
    photo VARCHAR(255),
    user_type VARCHAR(10) NOT NULL CHECK (user_type IN ('driver', 'rider', 'admin')),
    rating NUMERIC(3,2) DEFAULT 5.0,
    is_online BOOLEAN DEFAULT false,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    firebase_id VARCHAR(50),
    timezone VARCHAR(100),
    address VARCHAR(500),
    address_coordinates VARCHAR(150),
    android_fcm_token VARCHAR(250),
    ios_fcm_token VARCHAR(256),
    work_address_coordinates VARCHAR(100),
    work_address VARCHAR(500),
    is_paymentverified BOOLEAN DEFAULT false,
    is_riderbusiness BOOLEAN NOT NULL DEFAULT false,
    is_deleted BOOLEAN DEFAULT false,
    current_location POINT,
    location_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Rides Table
```sql
CREATE TABLE rides (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4(),
    rider_id INTEGER REFERENCES users(id),
    driver_id INTEGER REFERENCES users(id),
    ride_type_id INTEGER REFERENCES ride_types(id),
    status_id INTEGER REFERENCES ride_statuses(id),
    pickup_address TEXT NOT NULL,
    pickup_lat NUMERIC(10,7) NOT NULL,
    pickup_lng NUMERIC(10,7) NOT NULL,
    dropoff_address TEXT NOT NULL,
    dropoff_lat NUMERIC(10,7) NOT NULL,
    dropoff_lng NUMERIC(10,7) NOT NULL,
    distance_km NUMERIC(10,2),
    duration_minutes INTEGER,
    base_fare NUMERIC(10,2),
    distance_fare NUMERIC(10,2),
    time_fare NUMERIC(10,2),
    surge_multiplier NUMERIC(3,1) DEFAULT 1.0,
    total_fare NUMERIC(10,2),
    driver_earnings NUMERIC(10,2),
    platform_fee NUMERIC(10,2),
    payment_method_id INTEGER REFERENCES payment_methods(id),
    payment_status VARCHAR(20) DEFAULT 'pending',
    cancellation_reason TEXT,
    cancellation_fee NUMERIC(10,2),
    rating NUMERIC(3,2),
    review TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    accepted_at TIMESTAMP,
    arrived_at TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    cancelled_at TIMESTAMP,
    status ride_status,
    govt_tax_percentage NUMERIC,
    car_model VARCHAR(256),
    license_plate VARCHAR(256),
    rider_rating NUMERIC(3,2),
    rider_review TEXT,
    payment_intent VARCHAR(255),
    customer_name VARCHAR,
    customer_phone VARCHAR,
    pickup_coordinates POINT,
    dropoff_coordinates POINT,
    pickup_place_id VARCHAR(255),
    dropoff_place_id VARCHAR(255),
    route_polyline TEXT,
    estimated_distance_km NUMERIC(10,2),
    estimated_duration_minutes INTEGER
);
```

#### Driver Tips Table
```sql
CREATE TABLE driver_tips (
    id SERIAL PRIMARY KEY,
    ride_id INTEGER NOT NULL REFERENCES rides(id),
    driver_id INTEGER NOT NULL REFERENCES users(id),
    rider_id INTEGER NOT NULL REFERENCES users(id),
    tip_amount NUMERIC(10,2) NOT NULL,
    tip_percentage NUMERIC(5,2),
    payment_method VARCHAR(50),
    status VARCHAR(20) DEFAULT 'completed',
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Driver Referral Codes Table
```sql
CREATE TABLE driver_referral_codes (
    id SERIAL PRIMARY KEY,
    driver_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    referral_code VARCHAR(20) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT true,
    total_referrals INTEGER DEFAULT 0,
    total_earnings NUMERIC(10,2) DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Rider Referral Codes Table
```sql
CREATE TABLE rider_referral_codes (
    id SERIAL PRIMARY KEY,
    rider_id INTEGER NOT NULL REFERENCES users(id),
    referral_code VARCHAR(20) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT true,
    total_referrals INTEGER DEFAULT 0,
    total_earnings NUMERIC(10,2) DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Scheduled Rides Table
```sql
CREATE TABLE scheduled_rides (
    id SERIAL PRIMARY KEY,
    rider_id INTEGER REFERENCES users(id),
    org_id UUID REFERENCES businesses(id),
    driver_id INTEGER REFERENCES users(id),
    pickup_lat DECIMAL(10,7) NOT NULL,
    pickup_lng DECIMAL(10,7) NOT NULL,
    pickup_address TEXT NOT NULL,
    dropoff_lat DECIMAL(10,7) NOT NULL,
    dropoff_lng DECIMAL(10,7) NOT NULL,
    dropoff_address TEXT NOT NULL,
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    scheduled_time TIMESTAMPTZ NOT NULL,
    window_minutes INTEGER DEFAULT 10,
    notes TEXT,
    estimated_fare NUMERIC(10,2),
    payment_intent_id VARCHAR(255),
    status scheduled_ride_status NOT NULL DEFAULT 'scheduled',
    source scheduled_ride_source NOT NULL,
    created_by INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Promotions Table
```sql
CREATE TABLE promotions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    discount_type VARCHAR(20) NOT NULL,
    discount_value NUMERIC(10,2) NOT NULL,
    min_fare NUMERIC(10,2),
    max_discount NUMERIC(10,2),
    is_active BOOLEAN DEFAULT true,
    valid_from TIMESTAMP,
    valid_until TIMESTAMP,
    usage_count INTEGER DEFAULT 0,
    usage_limit INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Rewards Table
```sql
CREATE TABLE rewards (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    points_required INTEGER NOT NULL,
    reward_type VARCHAR(50) NOT NULL,
    reward_value NUMERIC(10,2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Reward Points Table
```sql
CREATE TABLE reward_points (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    points INTEGER NOT NULL,
    reason VARCHAR(255),
    reward_id INTEGER REFERENCES rewards(id),
    redeem_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Vehicle Classes Table
```sql
CREATE TABLE vehicle_classes (
    code VARCHAR(20) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    base_fare NUMERIC(10,2) NOT NULL,
    per_km_rate NUMERIC(10,2) NOT NULL,
    per_minute_rate NUMERIC(10,2) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Documents Table
```sql
CREATE TABLE documents (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    document_type_id INTEGER NOT NULL REFERENCES document_types(id),
    file_path VARCHAR(500) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size INTEGER,
    mime_type VARCHAR(100),
    status VARCHAR(20) DEFAULT 'pending',
    reviewed_by INTEGER REFERENCES users(id),
    reviewed_at TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Document Types Table
```sql
CREATE TABLE document_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_required BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Wallets Table
```sql
CREATE TABLE wallets (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    balance NUMERIC(10,2) DEFAULT 0.0,
    currency VARCHAR(3) DEFAULT 'USD',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### Wallet Ledger Table
```sql
CREATE TABLE wallet_ledger (
    id SERIAL PRIMARY KEY,
    wallet_id INTEGER NOT NULL REFERENCES wallets(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    transaction_type VARCHAR(20) NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    balance_after NUMERIC(10,2) NOT NULL,
    description TEXT,
    reference_id INTEGER,
    reference_type VARCHAR(50),
    ride_id INTEGER REFERENCES rides(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## ⚙️ Environment Configuration

### Required Environment Variables
```bash
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=charged
DB_USER=postgres
DB_PASSWORD=postgres

# Firebase Configuration
SERVICE_KEY_FILE=./charged-app.json
FIREBASE_PROJECT_ID=charged-app-5510e

# Server Configuration
PORT=3000
NODE_ENV=production

# Google Maps API
GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Stripe Configuration (if using)
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# JWT Configuration
JWT_SECRET=your_jwt_secret

# File Upload Configuration
MAX_FILE_SIZE=10485760  # 10MB
UPLOAD_PATH=./uploads
```

### Firebase Service Account Configuration
The Firebase service account file (`charged-app.json`) should contain:
```json
{
  "type": "service_account",
  "project_id": "charged-app-5510e",
  "private_key_id": "...",
  "private_key": "...",
  "client_email": "...",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "..."
}
```

---

## 🔧 Admin Dashboard Integration

### Frontend Configuration
```javascript
// API Configuration
const API_BASE_URL = 'https://api.charged.autos';
const ADMIN_BASE_URL = 'https://admin.charged.autos';

// Authentication
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "charged-app-5510e.firebaseapp.com",
  projectId: "charged-app-5510e",
  storageBucket: "charged-app-5510e.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

### Required Admin Permissions
- Firebase user with `user_type = 'admin'`
- Access to all admin endpoints
- File upload permissions
- Database read/write access

### Error Handling
All endpoints return consistent error format:
```json
{
  "status": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

### Rate Limiting
- No specific rate limiting implemented
- Consider implementing for production use

### CORS Policy
- Currently allows all origins
- Consider restricting for production

---

## 📝 Notes for Dashboard Team

1. **Authentication**: All admin endpoints require Firebase JWT token with admin role
2. **Pagination**: Most list endpoints support pagination with `page` and `limit` parameters
3. **Filtering**: Many endpoints support date range and status filtering
4. **File Uploads**: Use `multipart/form-data` for file uploads
5. **Real-time Updates**: Consider implementing WebSocket connections for real-time dashboard updates
6. **Caching**: Implement client-side caching for frequently accessed data
7. **Error Handling**: Implement proper error handling for all API calls
8. **Loading States**: Show loading indicators for all async operations
9. **Data Export**: Use the export endpoints for generating reports
10. **Responsive Design**: Ensure dashboard works on all device sizes

---

## 🚀 Getting Started

1. **Setup Firebase Authentication** in your dashboard
2. **Configure API base URL** to `https://api.charged.autos`
3. **Implement authentication flow** with Firebase
4. **Start with dashboard statistics** endpoint to get overview data
5. **Implement user management** features first
6. **Add ride management** functionality
7. **Integrate analytics** and reporting features
8. **Add document management** for driver verification
9. **Implement real-time updates** for active data
10. **Add export functionality** for reports

This comprehensive API documentation should provide everything needed to build a fully functional admin dashboard for the Charged Autos platform.
