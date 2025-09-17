# 🗄️ Charged Server Database Configuration

**Server**: `ubuntu@ec2-3-20-152-91.us-east-2.compute.amazonaws.com`  
**Database**: PostgreSQL 16.10  
**Status**: ✅ **ACTIVE & RUNNING**

---

## 📊 **Database Details**

### **PostgreSQL Configuration**
- **Version**: PostgreSQL 16.10 (Ubuntu 16.10-0ubuntu0.24.04.1)
- **Host**: localhost (127.0.0.1)
- **Port**: 5432 (default)
- **Database Name**: `charged`
- **Username**: `postgres`
- **Password**: `postgres` (hardcoded in db.js)
- **Service**: `postgresql@16-main` (Active & Running)

### **Connection String**
```javascript
// From db.js file
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'charged',
  password: 'postgres',
  port: 5432
});
```

---

## 🗃️ **Database Tables (27 Total)**

### **Core Tables**
- ✅ `users` - User profiles (riders, drivers, admins)
- ✅ `rides` - Ride records and history
- ✅ `ride_statuses` - Ride status definitions
- ✅ `ride_types` - Available ride types
- ✅ `ride_tracking` - Real-time ride tracking

### **Payment & Wallet**
- ✅ `payment_methods` - User payment methods
- ✅ `wallets` - User wallet balances
- ✅ `wallet_ledger` - Transaction history

### **Business Features**
- ✅ `businesses` - Business accounts
- ✅ `scheduled_rides` - Scheduled ride bookings
- ✅ `vehicle_classes` - Vehicle categories

### **Promotions & Rewards**
- ✅ `promotions` - Active promotions
- ✅ `rewards` - Available rewards
- ✅ `reward_points` - User reward points

### **Referral System**
- ✅ `referral_programs` - Referral program config
- ✅ `referral_registrations` - Referral registrations
- ✅ `referral_payouts` - Referral payouts
- ✅ `referral_tiers` - Referral tier definitions
- ✅ `driver_referral_codes` - Driver referral codes

### **Driver Features**
- ✅ `driver_details` - Driver-specific information
- ✅ `driver_tips` - Driver tip records

### **System Tables**
- ✅ `notifications` - System notifications
- ✅ `notification_tokens` - FCM tokens
- ✅ `documents` - Document storage
- ✅ `document_types` - Document type definitions
- ✅ `tokens` - Authentication tokens
- ✅ `settings` - System settings

---

## 🔧 **Database Management Commands**

### **Connect to Database**
```bash
# Using hardcoded password
PGPASSWORD=postgres psql -h localhost -U postgres -d charged

# Or set environment variable
export PGPASSWORD=postgres
psql -h localhost -U postgres -d charged
```

### **Check Database Status**
```bash
# Check PostgreSQL service
sudo systemctl status postgresql@16-main

# Check database version
PGPASSWORD=postgres psql -h localhost -U postgres -d charged -c "SELECT version();"

# List all tables
PGPASSWORD=postgres psql -h localhost -U postgres -d charged -c "\dt"
```

### **Backup Database**
```bash
# Create backup
PGPASSWORD=postgres pg_dump -h localhost -U postgres -d charged > charged_backup.sql

# Restore from backup
PGPASSWORD=postgres psql -h localhost -U postgres -d charged < charged_backup.sql
```

---

## 🔒 **Security Considerations**

### **Current Security Status**
- ⚠️ **Password is hardcoded** in db.js file
- ⚠️ **Default PostgreSQL credentials** (postgres/postgres)
- ✅ **Database is running locally** (not exposed externally)
- ✅ **Application connects successfully**

### **Recommended Security Improvements**
1. **Use Environment Variables**:
   ```javascript
   const pool = new Pool({
     user: process.env.DB_USER || 'postgres',
     host: process.env.DB_HOST || 'localhost',
     database: process.env.DB_NAME || 'charged',
     password: process.env.DB_PASSWORD,
     port: process.env.DB_PORT || 5432
   });
   ```

2. **Create .env file**:
   ```bash
   DB_USER=charged_user
   DB_PASSWORD=secure_random_password
   DB_HOST=localhost
   DB_NAME=charged
   DB_PORT=5432
   ```

3. **Create dedicated database user**:
   ```sql
   CREATE USER charged_user WITH PASSWORD 'secure_password';
   GRANT ALL PRIVILEGES ON DATABASE charged TO charged_user;
   GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO charged_user;
   ```

---

## 📈 **Database Performance**

### **Current Status**
- **Memory Usage**: 43.9M (peak: 59.3M)
- **CPU Usage**: 1min 38.951s (since startup)
- **Active Connections**: 6 processes
- **Uptime**: 2+ days (since Sep 14, 2025)

### **Monitoring Commands**
```bash
# Check database size
PGPASSWORD=postgres psql -h localhost -U postgres -d charged -c "SELECT pg_size_pretty(pg_database_size('charged'));"

# Check table sizes
PGPASSWORD=postgres psql -h localhost -U postgres -d charged -c "SELECT schemaname,tablename,pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size FROM pg_tables WHERE schemaname='public' ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;"

# Check active connections
PGPASSWORD=postgres psql -h localhost -U postgres -d charged -c "SELECT count(*) as active_connections FROM pg_stat_activity WHERE state='active';"
```

---

## 🚀 **API Integration Status**

### **Working Endpoints**
All rider API endpoints are successfully connected to the PostgreSQL database:

- ✅ **Rider Profile** - Connected to `users` table
- ✅ **Ride History** - Connected to `rides` table
- ✅ **Wallet Balance** - Connected to `wallets` table
- ✅ **Transactions** - Connected to `wallet_ledger` table
- ✅ **Promotions** - Connected to `promotions` table
- ✅ **Referrals** - Connected to referral tables
- ✅ **Scheduled Rides** - Connected to `scheduled_rides` table

### **Database Queries Working**
```javascript
// Example: Get rider profile
const result = await db.query(`
  SELECT uuid, name, email, phone, user_type, rating, photo, 
         is_verified, created_at, updated_at, address, address_coordinates
  FROM users 
  WHERE uuid = $1 AND user_type = 'rider' AND is_deleted = false
`, [riderId]);
```

---

## 📋 **Summary**

### **✅ What's Working**
- PostgreSQL 16.10 is running and stable
- All 27 database tables are present and accessible
- Node.js application connects successfully
- All rider API endpoints are functional
- Database has been running for 2+ days without issues

### **⚠️ Security Recommendations**
- Move database credentials to environment variables
- Create dedicated database user (not postgres superuser)
- Implement proper password management
- Consider database encryption for sensitive data

### **🎯 Current Status**
**Database**: ✅ **FULLY OPERATIONAL**  
**API Integration**: ✅ **COMPLETE**  
**Security**: ⚠️ **NEEDS IMPROVEMENT**  
**Performance**: ✅ **STABLE**

---

**Last Updated**: 2025-09-16T17:45:00.000Z  
**Database Version**: PostgreSQL 16.10  
**Status**: ✅ Production Ready (with security improvements recommended)
