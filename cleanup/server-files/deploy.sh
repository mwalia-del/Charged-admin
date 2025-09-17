#!/bin/bash

# Charged Admin Dashboard Deployment Script
# This script deploys the React admin dashboard to the EC2 server

set -e  # Exit on any error

# Configuration
SERVER_HOST="ec2-3-20-152-91.us-east-2.compute.amazonaws.com"
SERVER_USER="ubuntu"
SSH_KEY="charged-api-server.pem"
REMOTE_APP_DIR="/home/ubuntu/chargedapi"
REMOTE_PUBLIC_DIR="/home/ubuntu/chargedapi/public"
LOCAL_BUILD_DIR="./build"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Charged Admin Dashboard Deployment${NC}"
echo "================================================"

# Check if SSH key exists
if [ ! -f "$SSH_KEY" ]; then
    echo -e "${RED}❌ SSH key not found: $SSH_KEY${NC}"
    exit 1
fi

# Check if build directory exists
if [ ! -d "$LOCAL_BUILD_DIR" ]; then
    echo -e "${RED}❌ Build directory not found: $LOCAL_BUILD_DIR${NC}"
    echo "Please run 'npm run build' first"
    exit 1
fi

# Test SSH connection
echo -e "${YELLOW}🔍 Testing SSH connection...${NC}"
if ! ssh -i "$SSH_KEY" -o ConnectTimeout=10 "$SERVER_USER@$SERVER_HOST" "echo 'SSH connection successful'"; then
    echo -e "${RED}❌ SSH connection failed${NC}"
    exit 1
fi

# Create backup of current public directory
echo -e "${YELLOW}📦 Creating backup of current admin dashboard...${NC}"
ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_HOST" "
    cd $REMOTE_APP_DIR
    if [ -d 'public' ]; then
        sudo cp -r public public.backup.\$(date +%Y%m%d_%H%M%S)
        echo 'Backup created successfully'
    else
        echo 'No existing public directory found'
    fi
"

# Create new public directory
echo -e "${YELLOW}📁 Preparing new public directory...${NC}"
ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_HOST" "
    cd $REMOTE_APP_DIR
    sudo rm -rf public.new
    sudo mkdir -p public.new
    sudo chown ubuntu:ubuntu public.new
"

# Upload build files
echo -e "${YELLOW}📤 Uploading new admin dashboard files...${NC}"
rsync -avz --delete -e "ssh -i $SSH_KEY" "$LOCAL_BUILD_DIR/" "$SERVER_USER@$SERVER_HOST:$REMOTE_APP_DIR/public.new/"

# Set proper permissions
echo -e "${YELLOW}🔐 Setting proper permissions...${NC}"
ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_HOST" "
    cd $REMOTE_APP_DIR
    sudo chown -R www-data:www-data public.new
    sudo chmod -R 755 public.new
"

# Replace old public directory with new one
echo -e "${YELLOW}🔄 Deploying new admin dashboard...${NC}"
ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_HOST" "
    cd $REMOTE_APP_DIR
    sudo rm -rf public.old
    if [ -d 'public' ]; then
        sudo mv public public.old
    fi
    sudo mv public.new public
    echo 'Admin dashboard deployed successfully'
"

# Test the deployment
echo -e "${YELLOW}🧪 Testing deployment...${NC}"
if curl -s -o /dev/null -w "%{http_code}" https://admin.charged.autos | grep -q "200"; then
    echo -e "${GREEN}✅ Admin dashboard is accessible${NC}"
else
    echo -e "${RED}❌ Admin dashboard test failed${NC}"
    echo -e "${YELLOW}🔄 Rolling back to previous version...${NC}"
    ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_HOST" "
        cd $REMOTE_APP_DIR
        if [ -d 'public.old' ]; then
            sudo rm -rf public
            sudo mv public.old public
            echo 'Rollback completed'
        fi
    "
    exit 1
fi

# Clean up old backups (keep last 3)
echo -e "${YELLOW}🧹 Cleaning up old backups...${NC}"
ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_HOST" "
    cd $REMOTE_APP_DIR
    ls -t public.backup.* 2>/dev/null | tail -n +4 | xargs -r sudo rm -rf
    echo 'Old backups cleaned up'
"

echo -e "${GREEN}🎉 Deployment completed successfully!${NC}"
echo "================================================"
echo -e "${BLUE}Admin Dashboard:${NC} https://admin.charged.autos"
echo -e "${BLUE}API Documentation:${NC} https://api.charged.autos/api-docs/"
echo ""
echo -e "${YELLOW}💡 Useful commands:${NC}"
echo "  - Check server status: ssh -i $SSH_KEY $SERVER_USER@$SERVER_HOST 'cd $REMOTE_APP_DIR && source ~/.nvm/nvm.sh && pm2 status'"
echo "  - View logs: ssh -i $SSH_KEY $SERVER_USER@$SERVER_HOST 'cd $REMOTE_APP_DIR && source ~/.nvm/nvm.sh && pm2 logs charged-api'"
echo "  - Restart API: ssh -i $SSH_KEY $SERVER_USER@$SERVER_HOST 'cd $REMOTE_APP_DIR && source ~/.nvm/nvm.sh && pm2 restart charged-api'"
