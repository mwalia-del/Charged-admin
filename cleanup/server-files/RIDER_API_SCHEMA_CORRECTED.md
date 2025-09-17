# 🚗 Charged Rider API Schema - COMPLETE & VERIFIED Documentation

**Generated:** 2025-09-16T17:30:00.000Z  
**API Base URL:** `https://api.charged.autos`  
**Authentication:** Bearer Token (Firebase ID Token)  
**Version:** 1.0  
**Status:** ✅ **FULLY IMPLEMENTED & TESTED**

---

## ✅ **IMPLEMENTATION COMPLETE - ALL ENDPOINTS WORKING**

After implementing and testing all rider endpoints, here are the **FULLY FUNCTIONAL** endpoints:

---

## 📋 Table of Contents

1. [Authentication & Base Configuration](#authentication--base-configuration)
2. [Rider Profile Management](#rider-profile-management)
3. [Ride Management & Flow](#ride-management--flow)
4. [Payment Methods & Wallet](#payment-methods--wallet)
5. [Promotions & Rewards](#promotions--rewards)
6. [Referral System](#referral-system)
7. [Scheduled Rides](#scheduled-rides)
8. [Tips & Ratings](#tips--ratings)
9. [Database Schema](#database-schema)
10. [Error Handling](#error-handling)
11. [Rate Limits & Security](#rate-limits--security)

---

## 🔐 Authentication & Base Configuration

### Base Configuration
```typescript
const API_CONFIG = {
  baseURL: 'https://api.charged.autos',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer <firebase_id_token>'
  }
};
```

### Authentication Flow
```typescript
// 1. Get Firebase ID Token
const idToken = await firebase.auth().currentUser.getIdToken();

// 2. Include in all requests
const response = await fetch('https://api.charged.autos/rider/profile', {
  headers: {
    'Authorization': `Bearer ${idToken}`,
    'Content-Type': 'application/json'
  }
});
```

---

## 👤 Rider Profile Management

### Get Rider Profile
```http
GET /rider/profile
Authorization: Bearer <token>
```

**Response:**
```json
{
  "status": true,
  "data": {
    "id": "385c3e62-cf98-4203-a6ae-fdc48f68b3d4",
    "email": "devronins@gmail.com",
    "phone": "+1234567890",
    "user_type": "rider",
    "profile": {
      "first_name": "John",
      "last_name": "Doe",
      "profile_image": "https://example.com/photo.jpg",
      "rating": 5.0,
      "address": "123 Main St, City",
      "address_coordinates": "40.7128,-74.0060",
      "is_verified": true,
      "emergency_contact": {
        "name": "Jane Doe",
        "phone": "+1234567891"
      }
    },
    "preferences": {
      "language": "en",
      "notifications": {
        "ride_updates": true,
        "promotions": true,
        "marketing": false
      }
    },
    "created_at": "2025-04-11T16:26:22.218Z",
    "updated_at": "2025-04-11T16:26:22.218Z"
  }
}
```

### Update Rider Profile
```http
PUT /rider/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "profile": {
    "first_name": "John",
    "last_name": "Doe",
    "phone": "+1234567890",
    "address": "123 Main St, City",
    "emergency_contact": {
      "name": "Jane Doe",
      "phone": "+1234567891"
    }
  },
  "preferences": {
    "language": "en",
    "notifications": {
      "ride_updates": true,
      "promotions": true,
      "marketing": false
    }
  }
}
```

---

## 🚗 Ride Management & Flow

### Get Rider's Rides
```http
GET /rider/rides?page=1&limit=20&status=completed&start_date=2025-01-01&end_date=2025-12-31
Authorization: Bearer <token>
```

**Response:**
```json
{
  "status": true,
  "data": {
    "rides": [
      {
        "id": "ride-uuid-123",
        "status": "completed",
        "pickup_address": "123 Main St, City",
        "dropoff_address": "456 Oak Ave, City",
        "distance_km": 5.2,
        "duration_minutes": 15,
        "amount_cents": 1200,
        "payment_status": "paid",
        "driver": {
          "id": "driver-uuid-456",
          "email": "driver@example.com",
          "name": "Driver Name",
          "phone": "+1234567890",
          "vehicle": {
            "make": "Toyota",
            "model": "Camry",
            "year": 2020,
            "color": "Silver",
            "license_plate": "ABC123"
          },
          "rating": 4.8
        },
        "requested_at": "2025-09-16T10:00:00Z",
        "accepted_at": "2025-09-16T10:02:00Z",
        "arrived_at": "2025-09-16T10:05:00Z",
        "started_at": "2025-09-16T10:06:00Z",
        "completed_at": "2025-09-16T10:21:00Z",
        "rating": 5,
        "review": "Great driver!"
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

### Get Specific Ride Details
```http
GET /rider/rides/{ride_id}
Authorization: Bearer <token>
```

### Cancel Ride
```http
PUT /rider/rides/{ride_id}/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "cancelled",
  "reason": "Changed plans",
  "cancellation_fee_cents": 500
}
```

### Add Ride Rating
```http
POST /rider/rides/{ride_id}/rating
Authorization: Bearer <token>
Content-Type: application/json

{
  "rating": 5,
  "review": "Excellent service!",
  "categories": {
    "cleanliness": 5,
    "punctuality": 5,
    "friendliness": 5
  }
}
```

---

## 💳 Payment Methods & Wallet

### Get Payment Methods
```http
GET /rider/payment-methods
Authorization: Bearer <token>
```

**Response:**
```json
{
  "status": true,
  "data": {
    "payment_methods": [
      {
        "id": "pm_1234567890",
        "type": "card",
        "last_four": "4242",
        "brand": "visa",
        "exp_month": 12,
        "exp_year": 2025,
        "is_default": true,
        "created_at": "2025-01-01T00:00:00Z"
      }
    ]
  }
}
```

### Add Payment Method
```http
POST /rider/payment-methods
Authorization: Bearer <token>
Content-Type: application/json

{
  "payment_method_id": "pm_new_card_123",
  "is_default": false
}
```

### Delete Payment Method
```http
DELETE /rider/payment-methods/{payment_method_id}
Authorization: Bearer <token>
```

### Get Wallet Balance
```http
GET /rider/wallet/balance
Authorization: Bearer <token>
```

**Response:**
```json
{
  "status": true,
  "data": {
    "balance_cents": 5000,
    "available_balance_cents": 5000,
    "pending_balance_cents": 0,
    "currency": "USD",
    "formatted_balance": "$50.00"
  }
}
```

### Get Wallet Transactions
```http
GET /rider/wallet/transactions?page=1&limit=20&type=credit&reference_type=ride
Authorization: Bearer <token>
```

**Response:**
```json
{
  "status": true,
  "data": {
    "transactions": [
      {
        "id": "tx_1234567890",
        "transaction_type": "credit",
        "amount_cents": 1000,
        "balance_after_cents": 5000,
        "description": "Ride payment",
        "reference_type": "ride",
        "reference_id": "ride-uuid-123",
        "status": "completed",
        "created_at": "2025-09-16T10:00:00Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 3,
      "total_items": 50,
      "items_per_page": 20
    }
  }
}
```

### Request Payout
```http
POST /rider/wallet/payout
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount_cents": 10000,
  "payout_method": "bank_transfer",
  "payout_details": {
    "account_number": "1234567890",
    "routing_number": "987654321"
  }
}
```

---

## 🎁 Promotions & Rewards

### Get Active Promotions
```http
GET /rider/promotions
Authorization: Bearer <token>
```

**Response:**
```json
{
  "status": true,
  "data": {
    "promotions": [
      {
        "id": "promo-uuid-123",
        "title": "20% Off Your Next Ride",
        "description": "Get 20% off your next ride",
        "reward_type": "percent_discount",
        "value_cents": null,
        "percent_off": 20,
        "start_at": "2025-09-01T00:00:00Z",
        "end_at": "2025-09-30T23:59:59Z",
        "max_uses_per_user": 1,
        "global_cap": 1000,
        "code": "SAVE20",
        "is_eligible": true,
        "remaining_uses": 1
      }
    ]
  }
}
```

### Apply Promotion to Ride
```http
POST /rider/rides/{ride_id}/promotions
Authorization: Bearer <token>
Content-Type: application/json

{
  "promotion_code": "SAVE20"
}
```

**Response:**
```json
{
  "status": true,
  "message": "Promotion applied successfully",
  "data": {
    "promotion_id": "promo-uuid-123",
    "discount_cents": 240,
    "original_fare_cents": 1200,
    "final_fare_cents": 960
  }
}
```

### Get Available Rewards
```http
GET /rider/rewards
Authorization: Bearer <token>
```

**Response:**
```json
{
  "status": true,
  "data": {
    "rewards": [
      {
        "id": "reward-uuid-123",
        "title": "Free Ride",
        "description": "Earn a free ride after 10 completed rides",
        "points_required": 1000,
        "value_cents": 2000,
        "is_available": true,
        "expires_at": "2025-12-31T23:59:59Z"
      }
    ]
  }
}
```

### Get Reward Points
```http
GET /rider/rewards/points
Authorization: Bearer <token>
```

**Response:**
```json
{
  "status": true,
  "data": {
    "current_points": 750,
    "lifetime_points": 1500,
    "tier": "silver",
    "next_tier": "gold",
    "points_to_next_tier": 250,
    "points_expiring_soon": 100,
    "expiration_date": "2025-12-31T23:59:59Z"
  }
}
```

---

## 🔗 Referral System

### Get Referral Program
```http
GET /rider/referrals
Authorization: Bearer <token>
```

**Response:**
```json
{
  "status": true,
  "data": {
    "referral_code": "REF123456",
    "program_details": {
      "referrer_reward_cents": 1000,
      "referee_reward_cents": 500,
      "minimum_ride_amount_cents": 2000,
      "reward_conditions": "Complete your first ride"
    },
    "statistics": {
      "total_referrals": 5,
      "completed_referrals": 3,
      "total_earned_cents": 3000,
      "formatted_total_earned": "$30.00"
    }
  }
}
```

### Get Referral History
```http
GET /rider/referrals/history?page=1&limit=20&status=completed
Authorization: Bearer <token>
```

### Create Referral Code
```http
POST /rider/referrals/code
Authorization: Bearer <token>
Content-Type: application/json

{
  "custom_code": "MYREF123"
}
```

### Apply Referral Code
```http
POST /rider/referrals/apply
Authorization: Bearer <token>
Content-Type: application/json

{
  "referral_code": "REF123456"
}
```

---

## 📅 Scheduled Rides

### Get Scheduled Rides
```http
GET /rider/scheduled-rides?page=1&limit=20&status=scheduled
Authorization: Bearer <token>
```

**Response:**
```json
{
  "status": true,
  "data": {
    "scheduled_rides": [
      {
        "id": "scheduled-uuid-123",
        "ride_id": null,
        "status": "scheduled",
        "scheduled_for": "2025-09-17T08:00:00Z",
        "pickup_address": "123 Main St, City",
        "dropoff_address": "456 Oak Ave, City",
        "amount_cents": 1500,
        "notes": "Please call when you arrive",
        "created_at": "2025-09-16T20:00:00Z",
        "updated_at": "2025-09-16T20:00:00Z"
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 1,
      "total_items": 1,
      "items_per_page": 20
    }
  }
}
```

### Create Scheduled Ride
```http
POST /rider/scheduled-rides
Authorization: Bearer <token>
Content-Type: application/json

{
  "scheduled_for": "2025-09-17T08:00:00Z",
  "pickup_address": "123 Main St, City",
  "dropoff_address": "456 Oak Ave, City",
  "pickup_lat": 40.7128,
  "pickup_lng": -74.0060,
  "dropoff_lat": 40.7589,
  "dropoff_lng": -73.9851,
  "amount_cents": 1500,
  "notes": "Please call when you arrive",
  "vehicle_class_code": "standard"
}
```

### Update Scheduled Ride
```http
PUT /rider/scheduled-rides/{scheduled_ride_id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "scheduled_for": "2025-09-17T09:00:00Z",
  "notes": "Updated notes"
}
```

### Cancel Scheduled Ride
```http
DELETE /rider/scheduled-rides/{scheduled_ride_id}
Authorization: Bearer <token>
Content-Type: application/json

{
  "cancellation_reason": "Changed plans"
}
```

---

## 💰 Tips & Ratings

### Add Tip to Ride
```http
POST /rider/rides/{ride_id}/tip
Authorization: Bearer <token>
Content-Type: application/json

{
  "tip_amount_cents": 500,
  "tip_percentage": 10,
  "payment_method_id": "pm_1234567890"
}
```

---

## 📱 Notifications & Communication

### Send Notification
```http
POST /rider/notifications?title=Test&body=Test message&type=info
Authorization: Bearer <token>
```

### Send Chat Message to Driver
```http
POST /rider/rides/{ride_id}/chat
Authorization: Bearer <token>
Content-Type: application/json

{
  "message": "I'm at the pickup location",
  "message_type": "text"
}
```

---

## 📁 File Upload

### Upload Rider Files
```http
POST /rider/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <file_data>
```

**Response:**
```json
{
  "status": true,
  "message": "File uploaded successfully",
  "data": {
    "file_url": "https://api.charged.autos/uploads/profile_123.jpg",
    "file_id": "file-uuid-123"
  }
}
```

---

## 🗄️ Database Schema

### Core Tables

#### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  uuid UUID UNIQUE NOT NULL,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  password VARCHAR(255),
  photo VARCHAR(500),
  user_type VARCHAR(20) NOT NULL, -- 'rider', 'driver', 'admin'
  rating DECIMAL(3,2) DEFAULT 0,
  is_online BOOLEAN DEFAULT false,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  firebase_id VARCHAR(255),
  timezone VARCHAR(50),
  address TEXT,
  address_coordinates VARCHAR(100),
  android_fcm_token VARCHAR(500),
  ios_fcm_token VARCHAR(500),
  work_address_coordinates VARCHAR(100),
  work_address TEXT,
  is_paymentverified BOOLEAN DEFAULT false,
  is_riderbusiness BOOLEAN DEFAULT false,
  is_deleted BOOLEAN DEFAULT false
);
```

#### Rides Table
```sql
CREATE TABLE rides (
  id SERIAL PRIMARY KEY,
  uuid UUID UNIQUE NOT NULL,
  rider_id INTEGER REFERENCES users(id),
  driver_id INTEGER REFERENCES users(id),
  ride_type_id INTEGER REFERENCES ride_types(id),
  status_id INTEGER REFERENCES ride_statuses(id),
  pickup_address TEXT,
  pickup_lat DECIMAL(10,8),
  pickup_lng DECIMAL(11,8),
  dropoff_address TEXT,
  dropoff_lat DECIMAL(10,8),
  dropoff_lng DECIMAL(11,8),
  distance_km DECIMAL(8,2),
  duration_minutes INTEGER,
  base_fare DECIMAL(10,2),
  distance_fare DECIMAL(10,2),
  time_fare DECIMAL(10,2),
  surge_multiplier DECIMAL(3,2) DEFAULT 1.0,
  total_fare DECIMAL(10,2),
  driver_earnings DECIMAL(10,2),
  platform_fee DECIMAL(10,2),
  payment_method_id INTEGER,
  payment_status VARCHAR(50),
  cancellation_reason TEXT,
  cancellation_fee DECIMAL(10,2),
  rating DECIMAL(3,2),
  review TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  requested_at TIMESTAMP,
  accepted_at TIMESTAMP,
  arrived_at TIMESTAMP,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  cancelled_at TIMESTAMP,
  status VARCHAR(50),
  govt_tax_percentage DECIMAL(5,2),
  car_model VARCHAR(100),
  license_plate VARCHAR(20),
  rider_rating DECIMAL(3,2),
  rider_review TEXT,
  payment_intent VARCHAR(255),
  customer_name VARCHAR(255),
  customer_phone VARCHAR(20)
);
```

#### Wallets Table
```sql
CREATE TABLE wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_type VARCHAR(20) NOT NULL, -- 'rider', 'driver'
  owner_id INTEGER NOT NULL,
  balance_cents BIGINT DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'USD',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### Wallet Ledger Table
```sql
CREATE TABLE wallet_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID REFERENCES wallets(id),
  type VARCHAR(50) NOT NULL, -- 'credit', 'debit'
  amount_cents BIGINT NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  ride_id INTEGER REFERENCES rides(id),
  meta JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## ⚠️ Error Handling

### Standard Error Response
```json
{
  "status": false,
  "message": "Error description",
  "error": "Detailed error information",
  "code": "ERROR_CODE"
}
```

### Common Error Codes
- `UNAUTHORIZED` - Invalid or missing authentication token
- `FORBIDDEN` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `VALIDATION_ERROR` - Invalid request data
- `PAYMENT_ERROR` - Payment processing error
- `RIDE_NOT_AVAILABLE` - No drivers available
- `INSUFFICIENT_BALANCE` - Not enough wallet balance

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `500` - Internal Server Error

---

## 🔒 Rate Limits & Security

### Rate Limits
- **Authentication endpoints**: 5 requests per minute
- **Ride requests**: 10 requests per minute
- **General API**: 100 requests per minute per user

### Security Headers
```http
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

### Data Validation
- All input data is validated and sanitized
- SQL injection protection via parameterized queries
- XSS protection on all text inputs
- File upload restrictions (size, type, content)

---

## 🚀 Getting Started

### 1. Authentication Setup
```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  // Your Firebase config
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Get ID token for API calls
const getIdToken = async () => {
  const user = auth.currentUser;
  if (user) {
    return await user.getIdToken();
  }
  throw new Error('User not authenticated');
};
```

### 2. API Client Setup
```typescript
class ChargedAPI {
  private baseURL = 'https://api.charged.autos';
  
  private async getHeaders() {
    const token = await getIdToken();
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }
  
  async getRiderProfile() {
    const response = await fetch(`${this.baseURL}/rider/profile`, {
      headers: await this.getHeaders()
    });
    return response.json();
  }
  
  async getRides(page = 1, limit = 20) {
    const response = await fetch(`${this.baseURL}/rider/rides?page=${page}&limit=${limit}`, {
      headers: await this.getHeaders()
    });
    return response.json();
  }
  
  // Add more methods...
}
```

### 3. Error Handling
```typescript
const handleAPIError = (error: any) => {
  if (error.status === 401) {
    // Redirect to login
    router.push('/login');
  } else if (error.status === 403) {
    // Show permission error
    showError('You do not have permission to perform this action');
  } else {
    // Show generic error
    showError(error.message || 'An error occurred');
  }
};
```

---

## 🗺️ **Location & Maps Services**

### **Google Maps Integration**
All location services are powered by Google Maps API with the following endpoints:

#### **📍 Geocoding Services**
```javascript
// Convert address to coordinates
POST /maps/geocode
{
  "address": "123 Main St, New York, NY"
}

// Convert coordinates to address
POST /maps/reverse-geocode
{
  "lat": 40.7589,
  "lng": -73.9851
}
```

#### **🧭 Directions & Navigation**
```javascript
// Get driving directions
POST /maps/directions
{
  "origin": "Times Square, New York",
  "destination": "Central Park, New York",
  "mode": "driving",
  "avoid": ["tolls"],
  "waypoints": ["Brooklyn Bridge"]
}

// Calculate distance between points
POST /maps/distance
{
  "origin": { "lat": 40.7589, "lng": -73.9851 },
  "destination": { "lat": 40.7829, "lng": -73.9654 }
}
```

#### **🏪 Places & Search**
```javascript
// Search for nearby places
POST /maps/places/search
{
  "query": "restaurants",
  "lat": 40.7589,
  "lng": -73.9851,
  "radius": 1000
}

// Get place details
GET /maps/places/{placeId}
```

### **📍 Location Management**

#### **Update Current Location**
```javascript
POST /location/update
Authorization: Bearer {firebase_token}
{
  "lat": 40.7589,
  "lng": -73.9851,
  "address": "Times Square, New York, NY"
}
```

#### **Get Current Location**
```javascript
GET /location/current
Authorization: Bearer {firebase_token}

// Response
{
  "status": true,
  "data": {
    "coordinates": { "lat": 40.7589, "lng": -73.9851 },
    "address": "Times Square, New York, NY",
    "updatedAt": "2025-09-16T18:00:00.000Z"
  }
}
```

#### **Find Nearby Drivers**
```javascript
POST /location/nearby-drivers
Authorization: Bearer {firebase_token}
{
  "lat": 40.7589,
  "lng": -73.9851,
  "radius": 5000
}

// Response
{
  "status": true,
  "data": {
    "drivers": [
      {
        "id": "driver-uuid-123",
        "name": "John Driver",
        "rating": 4.8,
        "coordinates": { "lat": 40.7590, "lng": -73.9852 },
        "distance": { "meters": 150, "km": 0.15 },
        "lastSeen": "2025-09-16T18:00:00.000Z"
      }
    ],
    "count": 1,
    "searchRadius": 5000
  }
}
```

#### **Ride Route Information**
```javascript
GET /location/ride/{rideId}/route
Authorization: Bearer {firebase_token}

// Response
{
  "status": true,
  "data": {
    "rideId": "ride-uuid-123",
    "pickup": {
      "address": "123 Main St, New York, NY",
      "coordinates": { "lat": 40.7589, "lng": -73.9851 },
      "placeId": "ChIJd8BlQ2BZwokRAFQEc品"
    },
    "dropoff": {
      "address": "456 Park Ave, New York, NY",
      "coordinates": { "lat": 40.7829, "lng": -73.9654 },
      "placeId": "ChIJd8BlQ2BZwokRAFQEc品"
    },
    "route": {
      "polyline": "encoded_polyline_string",
      "distance": { "km": 2.5 },
      "duration": { "minutes": 8 }
    },
    "status": "in_progress"
  }
}
```

### **🗄️ Database Schema Updates**

The following location-related fields have been added to support Google Maps integration:

#### **Rides Table**
```sql
-- Location coordinates
pickup_coordinates POINT,
dropoff_coordinates POINT,

-- Google Places integration
pickup_place_id VARCHAR(255),
dropoff_place_id VARCHAR(255),

-- Route information
route_polyline TEXT,
estimated_distance_km DECIMAL(10,2),
estimated_duration_minutes INTEGER
```

#### **Users Table**
```sql
-- Current location tracking
current_location POINT,
location_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

### **🔧 Setup Requirements**

1. **Google Maps API Key**: Required for all location services
2. **Enabled APIs**: Maps, Geocoding, Directions, Places, Distance Matrix
3. **Database Migration**: Run `migrations/add_location_fields.sql`
4. **Environment Variable**: `GOOGLE_MAPS_API_KEY=your_api_key_here`

---

## 📞 Support & Documentation

- **API Documentation**: https://api.charged.autos/api-docs/
- **Admin Dashboard**: https://admin.charged.autos
- **Support Email**: support@charged.autos
- **Status Page**: https://status.charged.autos

---

**Last Updated**: 2025-09-16T17:30:00.000Z  
**API Version**: 1.0  
**Status**: ✅ Production Ready
