# 🗺️ Google Maps API Setup Guide

## 📋 **Required Google APIs**

To enable full location services for your Charged ride-sharing platform, you need to enable these Google APIs:

### **1. Core APIs**
- **Maps JavaScript API** - For displaying maps in web/mobile apps
- **Geocoding API** - Convert addresses to coordinates and vice versa
- **Directions API** - Get driving/walking/cycling directions
- **Distance Matrix API** - Calculate distances between multiple points
- **Places API** - Search for places and get place details

### **2. Optional APIs**
- **Roads API** - Snap GPS coordinates to roads
- **Time Zone API** - Get timezone information
- **Elevation API** - Get elevation data

## 🔧 **Setup Instructions**

### **Step 1: Create Google Cloud Project**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable billing (required for Maps APIs)

### **Step 2: Enable APIs**
```bash
# Enable required APIs
gcloud services enable maps-backend.googleapis.com
gcloud services enable geocoding-backend.googleapis.com
gcloud services enable directions-backend.googleapis.com
gcloud services enable distance-matrix-backend.googleapis.com
gcloud services enable places-backend.googleapis.com
```

### **Step 3: Create API Key**
1. Go to "Credentials" in Google Cloud Console
2. Click "Create Credentials" → "API Key"
3. Copy the API key
4. Restrict the key to your APIs and domains

### **Step 4: Configure Environment**
Add to your `.env` file:
```bash
GOOGLE_MAPS_API_KEY=your_actual_api_key_here
```

### **Step 5: Run Database Migration**
```bash
# Connect to your PostgreSQL database
psql -h localhost -U postgres -d charged

# Run the migration
\i migrations/add_location_fields.sql
```

## 🚀 **API Endpoints**

### **Public Google Maps Endpoints**
```
POST /maps/geocode
POST /maps/reverse-geocode
POST /maps/directions
POST /maps/places/search
GET  /maps/places/:placeId
POST /maps/distance
```

### **Rider Location Endpoints**
```
POST /location/update
GET  /location/current
POST /location/nearby-drivers
GET  /location/ride/:rideId/route
PUT  /location/ride/:rideId/location
```

### **Driver Location Endpoints**
```
POST /location/driver/update
GET  /location/driver/current
GET  /location/driver/ride/:rideId/route
PUT  /location/driver/ride/:rideId/location
```

## 📝 **Usage Examples**

### **Geocode an Address**
```bash
curl -X POST https://api.charged.autos/maps/geocode \
  -H "Content-Type: application/json" \
  -d '{"address": "123 Main St, New York, NY"}'
```

### **Get Directions**
```bash
curl -X POST https://api.charged.autos/maps/directions \
  -H "Content-Type: application/json" \
  -d '{
    "origin": "Times Square, New York",
    "destination": "Central Park, New York",
    "mode": "driving"
  }'
```

### **Update User Location**
```bash
curl -X POST https://api.charged.autos/location/update \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -d '{
    "lat": 40.7589,
    "lng": -73.9851,
    "address": "Times Square, New York, NY"
  }'
```

### **Find Nearby Drivers**
```bash
curl -X POST https://api.charged.autos/location/nearby-drivers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_FIREBASE_TOKEN" \
  -d '{
    "lat": 40.7589,
    "lng": -73.9851,
    "radius": 5000
  }'
```

## 💰 **Pricing Information**

### **Free Tier Limits (per month)**
- **Maps Loads**: 28,000
- **Geocoding**: 40,000 requests
- **Directions**: 2,500 requests
- **Distance Matrix**: 100 elements
- **Places**: 1,000 requests

### **Paid Pricing (after free tier)**
- **Maps Loads**: $7 per 1,000 loads
- **Geocoding**: $5 per 1,000 requests
- **Directions**: $5 per 1,000 requests
- **Distance Matrix**: $5 per 1,000 elements
- **Places**: $17 per 1,000 requests

## 🔒 **Security Best Practices**

1. **Restrict API Key**:
   - Limit to specific APIs
   - Restrict to your domains
   - Set usage quotas

2. **Server-Side Usage**:
   - Never expose API key in client-side code
   - Use server-side proxy for all requests
   - Implement rate limiting

3. **Monitor Usage**:
   - Set up billing alerts
   - Monitor API usage in Google Cloud Console
   - Implement request logging

## 🧪 **Testing**

### **Test API Key**
```bash
# Test geocoding
curl "https://maps.googleapis.com/maps/api/geocode/json?address=1600+Amphitheatre+Parkway,+Mountain+View,+CA&key=YOUR_API_KEY"
```

### **Test Server Integration**
```bash
# Test your server endpoint
curl -X POST https://api.charged.autos/maps/geocode \
  -H "Content-Type: application/json" \
  -d '{"address": "1600 Amphitheatre Parkway, Mountain View, CA"}'
```

## 🚨 **Troubleshooting**

### **Common Issues**

1. **"API key not valid"**
   - Check if API key is correct
   - Verify APIs are enabled
   - Check API key restrictions

2. **"Quota exceeded"**
   - Check usage in Google Cloud Console
   - Implement rate limiting
   - Consider upgrading billing plan

3. **"Request denied"**
   - Check API key restrictions
   - Verify domain restrictions
   - Check IP restrictions

### **Debug Mode**
Enable debug logging by setting:
```bash
DEBUG=google-maps:*
```

## 📚 **Additional Resources**

- [Google Maps Platform Documentation](https://developers.google.com/maps/documentation)
- [Google Cloud Console](https://console.cloud.google.com/)
- [API Pricing Calculator](https://cloud.google.com/maps-platform/pricing)
- [Best Practices Guide](https://developers.google.com/maps/documentation/best-practices)
