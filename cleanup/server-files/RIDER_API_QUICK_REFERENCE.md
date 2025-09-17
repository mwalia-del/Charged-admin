# 🚗 Charged Rider API - Quick Reference

**API Base URL:** `https://api.charged.autos`  
**Authentication:** `Authorization: Bearer <firebase_id_token>`

## 🎯 **Core Endpoints (All Tested & Working)**

### Profile Management
- `GET /rider/profile` - Get rider profile ✅
- `PUT /rider/profile` - Update rider profile ✅

### Ride Management
- `GET /rider/rides` - Get ride history ✅
- `GET /rider/rides/{id}` - Get specific ride ✅
- `PUT /rider/rides/{id}/status` - Cancel ride ✅
- `POST /rider/rides/{id}/rating` - Rate ride ✅

### Payment & Wallet
- `GET /rider/payment-methods` - Get payment methods ✅
- `POST /rider/payment-methods` - Add payment method ✅
- `DELETE /rider/payment-methods/{id}` - Delete payment method ✅
- `GET /rider/wallet/balance` - Get wallet balance ✅
- `GET /rider/wallet/transactions` - Get transactions ✅
- `POST /rider/wallet/payout` - Request payout ✅

### Promotions & Rewards
- `GET /rider/promotions` - Get active promotions ✅
- `POST /rider/rides/{id}/promotions` - Apply promotion ✅
- `GET /rider/rewards` - Get available rewards ✅
- `GET /rider/rewards/points` - Get reward points ✅

### Referrals
- `GET /rider/referrals` - Get referral program ✅
- `GET /rider/referrals/history` - Get referral history ✅
- `POST /rider/referrals/code` - Create referral code ✅
- `POST /rider/referrals/apply` - Apply referral code ✅

### Scheduled Rides
- `GET /rider/scheduled-rides` - Get scheduled rides ✅
- `POST /rider/scheduled-rides` - Create scheduled ride ✅
- `PUT /rider/scheduled-rides/{id}` - Update scheduled ride ✅
- `DELETE /rider/scheduled-rides/{id}` - Cancel scheduled ride ✅

### Tips & Communication
- `POST /rider/rides/{id}/tip` - Add tip ✅
- `POST /rider/notifications` - Send notification ✅
- `POST /rider/rides/{id}/chat` - Send chat message ✅

### File Upload
- `POST /rider/upload` - Upload files ✅

## 🔧 **Quick Test Commands**

```bash
# Test rider profile
curl -H "Authorization: Bearer test-token" https://api.charged.autos/rider/profile

# Test wallet balance
curl -H "Authorization: Bearer test-token" https://api.charged.autos/rider/wallet/balance

# Test rides
curl -H "Authorization: Bearer test-token" https://api.charged.autos/rider/rides

# Test rewards
curl -H "Authorization: Bearer test-token" https://api.charged.autos/rider/rewards
```

## 📊 **Response Format**

All endpoints return:
```json
{
  "status": true|false,
  "message": "Success/Error message",
  "data": { ... },
  "error": "Error details (if status: false)"
}
```

## 🗄️ **Database Tables Used**

- `users` - Rider profiles and authentication
- `rides` - Ride history and details
- `wallets` - Wallet balances
- `wallet_ledger` - Transaction history
- `scheduled_rides` - Scheduled ride bookings
- `tips` - Driver tips
- `promotions` - Active promotions
- `promotion_redemptions` - Promotion usage
- `referral_issuances` - Referral tracking

## 🚀 **Ready for Production**

All endpoints are:
- ✅ Implemented and tested
- ✅ Connected to live database
- ✅ Properly authenticated
- ✅ Error handling included
- ✅ Pagination supported
- ✅ Real-time data

**Status**: Production Ready 🎉
