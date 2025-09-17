#!/bin/bash

# Google Maps Integration Deployment Script
# This script uploads all Google Maps related files to the server

echo "🚀 Deploying Google Maps Integration to Charged Server..."

# Server configuration
SERVER="ubuntu@ec2-3-20-152-91.us-east-2.compute.amazonaws.com"
KEY="/Users/walia777/charged-admin/charged-api-server.pem"
REMOTE_DIR="/home/ubuntu/chargedapi"

# Files to upload
FILES=(
    "controllers/GoogleMapsController.js"
    "controllers/LocationController.js"
    "routes/google-maps.js"
    "routes/location.js"
    "migrations/add_location_fields.sql"
    "GOOGLE_MAPS_SETUP.md"
    "test-google-maps.js"
)

# Upload files
echo "📤 Uploading files to server..."
for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "  📁 Uploading $file..."
        scp -i "$KEY" "$file" "$SERVER:$REMOTE_DIR/$file"
        if [ $? -eq 0 ]; then
            echo "    ✅ $file uploaded successfully"
        else
            echo "    ❌ Failed to upload $file"
        fi
    else
        echo "    ⚠️  File $file not found, skipping..."
    fi
done

# Update app_updated.js
echo "📝 Updating app_updated.js on server..."
scp -i "$KEY" "app_updated.js" "$SERVER:$REMOTE_DIR/app_updated.js"

# Run database migration
echo "🗄️  Running database migration..."
ssh -i "$KEY" "$SERVER" << 'EOF'
cd /home/ubuntu/chargedapi
echo "Running location fields migration..."
PGPASSWORD=postgres psql -h localhost -U postgres -d charged -f migrations/add_location_fields.sql
echo "Migration completed!"
EOF

# Install axios if not already installed
echo "📦 Installing axios dependency..."
ssh -i "$KEY" "$SERVER" << 'EOF'
cd /home/ubuntu/chargedapi
npm install axios --save
EOF

# Restart the server
echo "🔄 Restarting server..."
ssh -i "$KEY" "$SERVER" << 'EOF'
cd /home/ubuntu/chargedapi
pm2 restart app_updated
pm2 save
echo "Server restarted successfully!"
EOF

echo ""
echo "🎉 Google Maps Integration Deployment Complete!"
echo ""
echo "📋 Next Steps:"
echo "1. Set up your Google Maps API key:"
echo "   - Go to Google Cloud Console"
echo "   - Enable required APIs (Maps, Geocoding, Directions, Places)"
echo "   - Create API key and add to .env file"
echo ""
echo "2. Test the integration:"
echo "   - Run: node test-google-maps.js"
echo "   - Check server logs: pm2 logs app_updated"
echo ""
echo "3. Verify endpoints:"
echo "   - https://api.charged.autos/maps/geocode"
echo "   - https://api.charged.autos/location/update"
echo ""
echo "📚 Documentation:"
echo "   - See GOOGLE_MAPS_SETUP.md for detailed setup instructions"
echo "   - Check RIDER_API_SCHEMA_CORRECTED.md for updated API documentation"
