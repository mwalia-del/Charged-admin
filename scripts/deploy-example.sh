#!/usr/bin/env bash
# Example deployment script for Charged Admin Dashboard
# This shows how to use the deployment script with your specific configuration

set -euo pipefail

# Load your deployment configuration
source "$(dirname "$0")/deploy-config.env"

echo "🚀 Charged Admin Dashboard Deployment"
echo "======================================"
echo "Server: $PROD_USER@$PROD_HOST"
echo "Path: $PROD_PATH"
echo "API: $API_BASE"
echo ""

# Check if we want to do a real deployment
if [ "${1:-}" = "deploy" ]; then
    echo "⚠️  REAL DEPLOYMENT MODE - This will update production!"
    read -p "Are you sure? (yes/no): " confirm
    if [ "$confirm" != "yes" ]; then
        echo "Deployment cancelled."
        exit 0
    fi
    export CONFIRM_DEPLOY=1
    echo "✅ Proceeding with deployment..."
else
    echo "🔍 DRY RUN MODE - No changes will be made"
    echo "   Run with 'deploy' argument to actually deploy: $0 deploy"
    export CONFIRM_DEPLOY=0
fi

echo ""
echo "Starting deployment process..."
echo ""

# Run the deployment script
"$(dirname "$0")/deploy-admin.sh"

echo ""
if [ "$CONFIRM_DEPLOY" = "1" ]; then
    echo "🎉 Deployment completed successfully!"
    echo "🌐 Admin Dashboard: https://admin.charged.autos"
    echo "🔌 API Server: https://api.charged.autos"
else
    echo "✅ Dry run completed successfully!"
    echo "   To deploy for real, run: $0 deploy"
fi
