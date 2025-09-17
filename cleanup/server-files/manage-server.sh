#!/bin/bash

# Charged Server Management Script
# This script provides easy management commands for the Charged platform

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

# Function to run SSH commands
run_ssh() {
    ssh -i "$SSH_KEY" "$SERVER_USER@$SERVER_HOST" "$@"
}

# Function to show usage
show_usage() {
    echo -e "${BLUE}Charged Server Management${NC}"
    echo "=========================="
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  status      - Show server and application status"
    echo "  logs        - Show application logs"
    echo "  restart     - Restart the API application"
    echo "  deploy      - Deploy the admin dashboard"
    echo "  health      - Run health check"
    echo "  backup      - Create a backup of current state"
    echo "  cleanup     - Clean up disk space"
    echo "  connect     - Connect to server via SSH"
    echo "  help        - Show this help message"
    echo ""
}

# Function to show status
show_status() {
    echo -e "${BLUE}📊 Server Status${NC}"
    echo "=================="
    run_ssh "
        echo '=== SYSTEM STATUS ==='
        uptime
        echo ''
        echo '=== DISK USAGE ==='
        df -h | grep -E '(Filesystem|/dev/root)'
        echo ''
        echo '=== MEMORY USAGE ==='
        free -h
        echo ''
        echo '=== PM2 STATUS ==='
        cd $REMOTE_APP_DIR
        source ~/.nvm/nvm.sh
        pm2 status
        echo ''
        echo '=== NGINX STATUS ==='
        sudo systemctl status nginx --no-pager -l | head -10
    "
}

# Function to show logs
show_logs() {
    echo -e "${BLUE}📋 Application Logs${NC}"
    echo "====================="
    run_ssh "
        cd $REMOTE_APP_DIR
        source ~/.nvm/nvm.sh
        pm2 logs charged-api --lines 50
    "
}

# Function to restart application
restart_app() {
    echo -e "${YELLOW}🔄 Restarting application...${NC}"
    run_ssh "
        cd $REMOTE_APP_DIR
        source ~/.nvm/nvm.sh
        pm2 restart charged-api
        echo 'Application restarted successfully'
    "
}

# Function to deploy admin dashboard
deploy_dashboard() {
    echo -e "${YELLOW}🚀 Deploying admin dashboard...${NC}"
    ./deploy.sh
}

# Function to run health check
run_health_check() {
    echo -e "${BLUE}🏥 Running Health Check${NC}"
    echo "======================="
    run_ssh "$REMOTE_APP_DIR/health-check.sh"
}

# Function to create backup
create_backup() {
    echo -e "${YELLOW}💾 Creating backup...${NC}"
    run_ssh "
        cd $REMOTE_APP_DIR
        BACKUP_NAME=\"backup_\$(date +%Y%m%d_%H%M%S)\"
        sudo cp -r public \"public.\$BACKUP_NAME\"
        echo \"Backup created: public.\$BACKUP_NAME\"
    "
}

# Function to cleanup disk space
cleanup_disk() {
    echo -e "${YELLOW}🧹 Cleaning up disk space...${NC}"
    run_ssh "
        echo 'Cleaning up old logs...'
        sudo find /var/log -name '*.log' -type f -mtime +7 -delete 2>/dev/null || true
        sudo find /var/log -name '*.gz' -type f -mtime +7 -delete 2>/dev/null || true
        
        echo 'Cleaning up PM2 logs...'
        cd $REMOTE_APP_DIR
        source ~/.nvm/nvm.sh
        pm2 flush 2>/dev/null || true
        
        echo 'Cleaning up old backups...'
        find $REMOTE_APP_DIR -name 'public.backup.*' -type d -mtime +7 -exec sudo rm -rf {} \; 2>/dev/null || true
        
        echo 'Cleanup completed'
        df -h | grep -E '(Filesystem|/dev/root)'
    "
}

# Function to connect to server
connect_server() {
    echo -e "${BLUE}🔗 Connecting to server...${NC}"
    echo "Use 'exit' to disconnect"
    run_ssh "cd $REMOTE_APP_DIR && bash"
}

# Main script logic
case "${1:-help}" in
    "status")
        show_status
        ;;
    "logs")
        show_logs
        ;;
    "restart")
        restart_app
        ;;
    "deploy")
        deploy_dashboard
        ;;
    "health")
        run_health_check
        ;;
    "backup")
        create_backup
        ;;
    "cleanup")
        cleanup_disk
        ;;
    "connect")
        connect_server
        ;;
    "help"|*)
        show_usage
        ;;
esac
