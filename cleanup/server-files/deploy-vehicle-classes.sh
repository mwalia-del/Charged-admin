#!/bin/bash

# Configuration
SSH_KEY="charged-api-server.pem"
SSH_USER="ubuntu"
SSH_HOST="ec2-3-20-152-91.us-east-2.compute.amazonaws.com"
REMOTE_APP_DIR="/home/ubuntu/chargedapi"

echo "🚀 Deploying Vehicle Classes Feature"
echo "===================================="

# 1. Test SSH connection
echo "🔍 Testing SSH connection..."
ssh -i "$SSH_KEY" "$SSH_USER@$SSH_HOST" "echo 'SSH connection successful'" || { echo "❌ SSH connection failed. Exiting."; exit 1; }

# 2. Create backup of current files
echo "📦 Creating backup of current files..."
ssh -i "$SSH_KEY" "$SSH_USER@$SSH_HOST" "cd $REMOTE_APP_DIR && cp routes/admin.js routes/admin.js.backup.$(date +%Y%m%d%H%M%S)"

# 3. Upload new files
echo "📤 Uploading new files..."

# Upload migration file
scp -i "$SSH_KEY" migration_vehicle_classes.sql "$SSH_USER@$SSH_HOST:$REMOTE_APP_DIR/"

# Upload model file
scp -i "$SSH_KEY" VehicleClassModel.js "$SSH_USER@$SSH_HOST:$REMOTE_APP_DIR/models/"

# Upload controller file
scp -i "$SSH_KEY" VehicleClassController.js "$SSH_USER@$SSH_HOST:$REMOTE_APP_DIR/controllers/"

# Upload updated routes file
scp -i "$SSH_KEY" admin_routes_update.js "$SSH_USER@$SSH_HOST:$REMOTE_APP_DIR/routes/admin.js"

# Upload catalog routes file
scp -i "$SSH_KEY" catalog_routes.js "$SSH_USER@$SSH_HOST:$REMOTE_APP_DIR/routes/catalog.js"

# Upload updated app.js file
scp -i "$SSH_KEY" app_updated.js "$SSH_USER@$SSH_HOST:$REMOTE_APP_DIR/app.js"

echo "Files uploaded successfully"

# 4. Run database migration
echo "🗄️ Running database migration..."
ssh -i "$SSH_KEY" "$SSH_USER@$SSH_HOST" "cd $REMOTE_APP_DIR && psql -U postgres -d charged -f migration_vehicle_classes.sql"

# 5. Restart the application
echo "🔄 Restarting application..."
ssh -i "$SSH_KEY" "$SSH_USER@$SSH_HOST" "cd $REMOTE_APP_DIR && source ~/.nvm/nvm.sh && pm2 restart charged-api"

# 6. Test the new endpoints
echo "🧪 Testing new endpoints..."
sleep 5  # Wait for app to start

# Test vehicle classes endpoint
echo "Testing GET /admin/vehicle-classes..."
ADMIN_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://api.charged.autos/admin/vehicle-classes)
echo "Admin vehicle classes endpoint status: $ADMIN_STATUS"

# Test catalog endpoint
echo "Testing GET /catalog/vehicle-classes..."
CATALOG_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://api.charged.autos/catalog/vehicle-classes)
echo "Catalog vehicle classes endpoint status: $CATALOG_STATUS"

# 7. Check application logs
echo "📜 Checking application logs..."
ssh -i "$SSH_KEY" "$SSH_USER@$SSH_HOST" "cd $REMOTE_APP_DIR && source ~/.nvm/nvm.sh && pm2 logs charged-api --lines 10"

echo "✅ Vehicle Classes deployment completed!"
echo "========================================="
echo "New endpoints available:"
echo "  - GET /admin/vehicle-classes (admin only)"
echo "  - GET /admin/vehicle-classes/:code (admin only)"
echo "  - PATCH /admin/vehicle-classes/:code (admin only)"
echo "  - POST /admin/vehicle-classes (admin only)"
echo "  - DELETE /admin/vehicle-classes/:code (admin only)"
echo "  - GET /catalog/vehicle-classes (public)"
echo ""
echo "💡 Test the admin dashboard vehicle classes functionality now!"
