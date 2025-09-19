# 📅 Scheduled Rides Implementation Plan

## 🔍 **CURRENT STATUS ANALYSIS**

### ✅ **Frontend Implementation - COMPLETE**
- **Page**: `src/pages/scheduled/ScheduledRidesPage.tsx` ✅
- **Components**: Summary, Filters, Table components ✅
- **API Layer**: `src/API/scheduled.ts` ✅
- **Types**: All TypeScript interfaces defined ✅
- **Features**: Filtering, pagination, export, driver assignment, cancellation ✅

### ❌ **Backend Implementation - MISSING ADMIN ENDPOINTS**
- **Rider Endpoints**: ✅ Available (`/rider/scheduled-rides`)
- **Admin Endpoints**: ❌ **MISSING** - This is the critical gap

## 🚨 **CRITICAL ISSUE IDENTIFIED**

The frontend is trying to call admin endpoints that **don't exist** on the backend:

```typescript
// These endpoints are MISSING on backend:
GET /scheduled/admin                    // ❌ Missing
GET /admin/scheduled-rides/summary     // ❌ Missing  
POST /admin/scheduled-rides/:id/assign-driver  // ❌ Missing
POST /admin/scheduled-rides/:id/cancel         // ❌ Missing
GET /admin/scheduled-rides/export              // ❌ Missing
```

## 🛠️ **REQUIRED BACKEND IMPLEMENTATION**

### **1. Admin Endpoints Needed**
```javascript
// Base URL: https://api.charged.autos/admin
GET    /scheduled-rides              // Get all scheduled rides (admin view)
GET    /scheduled-rides/summary      // Get summary statistics
GET    /scheduled-rides/:id          // Get specific scheduled ride
POST   /scheduled-rides/:id/assign-driver  // Assign driver to ride
POST   /scheduled-rides/:id/cancel   // Cancel scheduled ride
GET    /scheduled-rides/export       // Export CSV
PUT    /scheduled-rides/:id          // Update scheduled ride (admin)
DELETE /scheduled-rides/:id          // Delete scheduled ride (admin)
```

### **2. Database Schema Requirements**
```sql
-- Ensure these tables exist:
scheduled_rides
├── id (primary key)
├── rider_id (foreign key)
├── business_id (foreign key, nullable)
├── pickup_address
├── dropoff_address
├── scheduled_time
├── status (scheduled, assigned, completed, cancelled)
├── driver_id (foreign key, nullable)
├── created_at
├── updated_at
└── cancellation_reason (nullable)

-- Indexes needed:
CREATE INDEX idx_scheduled_rides_status ON scheduled_rides(status);
CREATE INDEX idx_scheduled_rides_scheduled_time ON scheduled_rides(scheduled_time);
CREATE INDEX idx_scheduled_rides_rider_id ON scheduled_rides(rider_id);
CREATE INDEX idx_scheduled_rides_business_id ON scheduled_rides(business_id);
```

### **3. Controller Implementation**
```javascript
// ScheduledRidesAdminController.js
class ScheduledRidesAdminController {
  // GET /admin/scheduled-rides
  async getAllScheduledRides(req, res) {
    // Query with filters: status, source, org_id, rider_id, from, to
    // Pagination: page, page_size
    // Return: { data: [], pagination: {} }
  }

  // GET /admin/scheduled-rides/summary
  async getScheduledRidesSummary(req, res) {
    // Return: { scheduled_count, converted_24h, converted_7d, cancelled_count, failed_count, upcoming_count }
  }

  // POST /admin/scheduled-rides/:id/assign-driver
  async assignDriver(req, res) {
    // Assign driver to scheduled ride
    // Update status to 'assigned'
  }

  // POST /admin/scheduled-rides/:id/cancel
  async cancelScheduledRide(req, res) {
    // Cancel scheduled ride with reason
    // Update status to 'cancelled'
  }

  // GET /admin/scheduled-rides/export
  async exportScheduledRides(req, res) {
    // Export filtered data as CSV
  }
}
```

## 🔧 **FRONTEND CONFIGURATION UPDATES**

### **1. Update API Configuration**
```typescript
// src/config/api.ts - Add scheduled rides endpoints
export const API_ENDPOINTS = {
  // ... existing endpoints
  SCHEDULED_RIDES: {
    LIST: '/admin/scheduled-rides',
    SUMMARY: '/admin/scheduled-rides/summary',
    DETAIL: (id: string) => `/admin/scheduled-rides/${id}`,
    ASSIGN_DRIVER: (id: string) => `/admin/scheduled-rides/${id}/assign-driver`,
    CANCEL: (id: string) => `/admin/scheduled-rides/${id}/cancel`,
    EXPORT: '/admin/scheduled-rides/export',
  },
};
```

### **2. Update Scheduled API**
```typescript
// src/API/scheduled.ts - Update to use centralized config
import { API_ENDPOINTS, buildApiUrl } from '../config/api';

export const getScheduledRides = async (filters: ScheduledRideFilters = {}): Promise<ScheduledRidesResponse> => {
  try {
    const params = new URLSearchParams();
    // ... existing filter logic
    
    const response = await instance.get(buildApiUrl(API_ENDPOINTS.SCHEDULED_RIDES.LIST) + `?${params.toString()}`);
    return response.data;
  } catch (error) {
    // Proper error handling instead of returning empty data
    throw new Error(`Failed to fetch scheduled rides: ${error.message}`);
  }
};
```

## 📋 **IMPLEMENTATION STEPS**

### **Phase 1: Backend Implementation (CRITICAL)**
1. **Create Admin Routes**
   ```javascript
   // routes/admin.js
   router.get('/scheduled-rides', authMiddleware, scheduledRidesController.getAllScheduledRides);
   router.get('/scheduled-rides/summary', authMiddleware, scheduledRidesController.getSummary);
   router.post('/scheduled-rides/:id/assign-driver', authMiddleware, scheduledRidesController.assignDriver);
   router.post('/scheduled-rides/:id/cancel', authMiddleware, scheduledRidesController.cancelRide);
   router.get('/scheduled-rides/export', authMiddleware, scheduledRidesController.exportCSV);
   ```

2. **Implement Controller Methods**
   - Query with proper filtering and pagination
   - Handle authentication and authorization
   - Return consistent JSON responses

3. **Add Database Queries**
   - Complex queries with joins for rider/business data
   - Proper indexing for performance
   - Pagination support

### **Phase 2: Frontend Updates (MEDIUM)**
1. **Update API Configuration**
   - Use centralized endpoint configuration
   - Remove hard-coded URLs

2. **Improve Error Handling**
   - Surface API errors to UI
   - Add proper loading states
   - Implement retry mechanisms

3. **Add Real API Integration**
   - Connect driver assignment functionality
   - Connect cancellation functionality
   - Connect CSV export functionality

### **Phase 3: Testing & Validation (LOW)**
1. **API Testing**
   - Test all admin endpoints
   - Verify authentication works
   - Test error scenarios

2. **Frontend Testing**
   - Test all user interactions
   - Verify data display
   - Test filtering and pagination

## 🚨 **IMMEDIATE ACTION REQUIRED**

### **Backend Team Tasks:**
1. **Create Admin Endpoints** - This is blocking the frontend functionality
2. **Implement Database Queries** - Complex joins for rider/business data
3. **Add Authentication** - Ensure admin-only access
4. **Test Endpoints** - Verify they work with the frontend

### **Frontend Team Tasks:**
1. **Update API Configuration** - Use centralized endpoints
2. **Improve Error Handling** - Better user feedback
3. **Test Integration** - Once backend is ready

## 📊 **CURRENT FUNCTIONALITY STATUS**

| Feature | Frontend | Backend | Status |
|---------|----------|---------|--------|
| View All Rides | ✅ Ready | ❌ Missing | 🔴 Blocked |
| Filter Rides | ✅ Ready | ❌ Missing | 🔴 Blocked |
| Pagination | ✅ Ready | ❌ Missing | 🔴 Blocked |
| Assign Driver | ✅ Ready | ❌ Missing | 🔴 Blocked |
| Cancel Ride | ✅ Ready | ❌ Missing | 🔴 Blocked |
| Export CSV | ✅ Ready | ❌ Missing | 🔴 Blocked |
| Summary Stats | ✅ Ready | ❌ Missing | 🔴 Blocked |

## 🎯 **SUCCESS CRITERIA**

1. **Admin can view all scheduled rides** across all riders and businesses
2. **Admin can filter rides** by status, date range, rider, business
3. **Admin can assign drivers** to scheduled rides
4. **Admin can cancel rides** with reason
5. **Admin can export data** as CSV
6. **Real-time updates** when changes are made
7. **Proper error handling** and user feedback

## ⚠️ **CRITICAL DEPENDENCIES**

- **Backend admin endpoints** must be implemented first
- **Database schema** must support complex queries
- **Authentication** must be properly configured
- **API response format** must match frontend expectations

The frontend is **100% ready** and waiting for the backend implementation. Once the admin endpoints are available, the scheduled rides functionality will work immediately.
