#!/bin/bash

# Server Preparation Script for Charged Admin Dashboard
# This script prepares the EC2 server for receiving updates

set -e  # Exit on any error

# Configuration
SERVER_HOST="ec2-3-20-152-91.us-east-2.compute.amazonaws.com"
SERVER_USER="ubuntu"
SSH_KEY="charged-api-server.pem"
REMOTE_APP_DIR="/home/ubuntu/chargedapi"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔧 Charged Server Preparation${NC}"
echo "================================================"

# Check if SSH key exists
if [ ! -f "$SSH_KEY" ]; then
    echo -e "${RED}❌ SSH key not found: $SSH_KEY${NC}"
    exit 1
fi

# Test SSH connection
echo -e "${YELLOW}🔍 Testing SSH connection...${NC}"
if ! ssh -i "$SSH_KEY" -o ConnectTimeout=10 "$SERVER_USER@$SERVER_HOST" "echo 'SSH connection successful'"; then
    echo -e "${RED}❌ SSH connection failed${NC}"
    exit 1
fi

# Check server status
echo -e "${YELLOW}📊 Checking server status...${NC}"
ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_HOST" "
    echo '=== SYSTEM STATUS ==='
    uptime
    echo ''
    echo '=== DISK USAGE ==='
    df -h
    echo ''
    echo '=== MEMORY USAGE ==='
    free -h
    echo ''
    echo '=== RUNNING PROCESSES ==='
    ps aux | grep -E '(node|nginx|postgres)' | grep -v grep
"

# Check application status
echo -e "${YELLOW}📱 Checking application status...${NC}"
ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_HOST" "
    cd $REMOTE_APP_DIR
    source ~/.nvm/nvm.sh
    echo '=== PM2 STATUS ==='
    pm2 status
    echo ''
    echo '=== NGINX STATUS ==='
    sudo systemctl status nginx --no-pager -l | head -20
"

# Clean up disk space if needed
echo -e "${YELLOW}🧹 Checking disk space and cleaning up if needed...${NC}"
ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_HOST" "
    # Check disk usage
    DISK_USAGE=\$(df / | awk 'NR==2 {print \$5}' | sed 's/%//')
    echo \"Current disk usage: \${DISK_USAGE}%\"
    
    if [ \$DISK_USAGE -gt 85 ]; then
        echo 'Disk usage is high, cleaning up...'
        
        # Clean up old logs
        echo 'Cleaning up old logs...'
        sudo find /var/log -name '*.log' -type f -mtime +7 -delete 2>/dev/null || true
        sudo find /var/log -name '*.gz' -type f -mtime +7 -delete 2>/dev/null || true
        
        # Clean up old PM2 logs
        cd $REMOTE_APP_DIR
        source ~/.nvm/nvm.sh
        pm2 flush 2>/dev/null || true
        
        # Clean up old backups
        echo 'Cleaning up old backups...'
        find $REMOTE_APP_DIR -name 'public.backup.*' -type d -mtime +7 -exec sudo rm -rf {} \; 2>/dev/null || true
        
        # Clean up npm cache
        echo 'Cleaning up npm cache...'
        npm cache clean --force 2>/dev/null || true
        
        # Clean up old node_modules if they exist
        find $REMOTE_APP_DIR -name 'node_modules' -type d -mtime +30 -exec sudo rm -rf {} \; 2>/dev/null || true
        
        echo 'Cleanup completed'
        
        # Check disk usage again
        DISK_USAGE_AFTER=\$(df / | awk 'NR==2 {print \$5}' | sed 's/%//')
        echo \"Disk usage after cleanup: \${DISK_USAGE_AFTER}%\"
    else
        echo 'Disk usage is acceptable'
    fi
"

# Ensure proper permissions
echo -e "${YELLOW}🔐 Setting up proper permissions...${NC}"
ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_HOST" "
    cd $REMOTE_APP_DIR
    
    # Ensure ubuntu user owns the app directory
    sudo chown -R ubuntu:ubuntu .
    
    # Set proper permissions for public directory
    if [ -d 'public' ]; then
        sudo chown -R www-data:www-data public
        sudo chmod -R 755 public
        echo 'Public directory permissions set'
    fi
    
    # Ensure logs directory is writable
    if [ -d 'logs' ]; then
        sudo chown -R ubuntu:ubuntu logs
        sudo chmod -R 755 logs
        echo 'Logs directory permissions set'
    fi
"

# Test nginx configuration
echo -e "${YELLOW}🔧 Testing nginx configuration...${NC}"
ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_HOST" "
    if sudo nginx -t; then
        echo 'Nginx configuration is valid'
    else
        echo 'Nginx configuration has issues'
        exit 1
    fi
"

# Create deployment directory structure
echo -e "${YELLOW}📁 Preparing deployment directories...${NC}"
ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_HOST" "
    cd $REMOTE_APP_DIR
    
    # Create necessary directories
    sudo mkdir -p public.new
    sudo mkdir -p public.old
    sudo mkdir -p logs
    
    # Set proper ownership
    sudo chown -R ubuntu:ubuntu public.new public.old logs
    
    echo 'Deployment directories prepared'
"

# Check if API is responding
echo -e "${YELLOW}🌐 Testing API endpoints...${NC}"
ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_HOST" "
    echo 'Testing API documentation endpoint...'
    if curl -s -o /dev/null -w '%{http_code}' https://api.charged.autos/api-docs/ | grep -q '200'; then
        echo 'API documentation is accessible'
    else
        echo 'API documentation test failed'
    fi
    
    echo 'Testing admin dashboard endpoint...'
    if curl -s -o /dev/null -w '%{http_code}' https://admin.charged.autos | grep -q '200'; then
        echo 'Admin dashboard is accessible'
    else
        echo 'Admin dashboard test failed'
    fi
"

# Create a simple health check script
echo -e "${YELLOW}🏥 Creating health check script...${NC}"
ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_HOST" "
    cat > $REMOTE_APP_DIR/health-check.sh << 'EOF'
#!/bin/bash
# Health check script for Charged Admin Dashboard

echo \"=== Charged Admin Dashboard Health Check ===\"
echo \"Date: \$(date)\"
echo \"\"

# Check PM2 status
echo \"=== PM2 Status ===\"
cd /home/ubuntu/chargedapi
source ~/.nvm/nvm.sh
pm2 status

echo \"\"
echo \"=== Nginx Status ===\"
sudo systemctl status nginx --no-pager -l | head -10

echo \"\"
echo \"=== Disk Usage ===\"
df -h | grep -E '(Filesystem|/dev/root)'

echo \"\"
echo \"=== Memory Usage ===\"
free -h

echo \"\"
echo \"=== API Health ===\"
if curl -s -o /dev/null -w 'API Status: %{http_code}' https://api.charged.autos/api-docs/; then
    echo \"\"
else
    echo \"API Health Check Failed\"
fi

echo \"\"
echo \"=== Admin Dashboard Health ===\"
if curl -s -o /dev/null -w 'Admin Status: %{http_code}' https://admin.charged.autos; then
    echo \"\"
else
    echo \"Admin Dashboard Health Check Failed\"
fi
EOF

    chmod +x $REMOTE_APP_DIR/health-check.sh
    echo 'Health check script created'
"

echo -e "${GREEN}✅ Server preparation completed successfully!${NC}"
echo "================================================"
echo -e "${BLUE}Server is ready for deployment${NC}"
echo ""
echo -e "${YELLOW}💡 Useful commands:${NC}"
echo "  - Run health check: ssh -i $SSH_KEY $SERVER_USER@$SERVER_HOST '$REMOTE_APP_DIR/health-check.sh'"
echo "  - Deploy admin dashboard: ./deploy.sh"
echo "  - Check logs: ssh -i $SSH_KEY $SERVER_USER@$SERVER_HOST 'cd $REMOTE_APP_DIR && source ~/.nvm/nvm.sh && pm2 logs charged-api'"
echo "  - Restart services: ssh -i $SSH_KEY $SERVER_USER@$SERVER_HOST 'cd $REMOTE_APP_DIR && source ~/.nvm/nvm.sh && pm2 restart charged-api && sudo systemctl restart nginx'"
