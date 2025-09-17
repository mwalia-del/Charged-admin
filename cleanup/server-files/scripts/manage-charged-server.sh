#!/bin/bash

# Charged Server Management Script
# Usage: ./scripts/manage-charged-server.sh [command]

SERVER="ubuntu@ec2-3-20-152-91.us-east-2.compute.amazonaws.com"
KEY="charged-api-server.pem"
APP_DIR="/home/ubuntu/chargedapi"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to run commands on server
run_server_cmd() {
    ssh -i "$KEY" "$SERVER" "cd $APP_DIR && source ~/.nvm/nvm.sh && $1"
}

# Function to show status
show_status() {
    echo -e "${BLUE}=== CHARGED SERVER STATUS ===${NC}"
    echo -e "${YELLOW}Server:${NC} $SERVER"
    echo -e "${YELLOW}Application Directory:${NC} $APP_DIR"
    echo ""
    
    echo -e "${BLUE}--- PM2 Process Status ---${NC}"
    run_server_cmd "pm2 status"
    echo ""
    
    echo -e "${BLUE}--- Application Health ---${NC}"
    run_server_cmd "curl -s http://localhost:3000/ | head -5"
    echo ""
    
    echo -e "${BLUE}--- Port Status ---${NC}"
    run_server_cmd "ss -tlnp | grep :3000"
    echo ""
    
    echo -e "${BLUE}--- Recent Logs (last 5 lines) ---${NC}"
    run_server_cmd "pm2 logs charged-api --lines 5"
}

# Function to restart application
restart_app() {
    echo -e "${YELLOW}Restarting Charged API...${NC}"
    run_server_cmd "pm2 restart charged-api"
    echo -e "${GREEN}Application restarted successfully!${NC}"
}

# Function to view logs
view_logs() {
    echo -e "${BLUE}=== CHARGED API LOGS ===${NC}"
    echo -e "${YELLOW}Press Ctrl+C to exit log viewing${NC}"
    run_server_cmd "pm2 logs charged-api --lines 50"
}

# Function to check errors
check_errors() {
    echo -e "${BLUE}=== ERROR LOGS ===${NC}"
    run_server_cmd "pm2 logs charged-api --err --lines 20"
}

# Function to update application
update_app() {
    echo -e "${YELLOW}Updating Charged API...${NC}"
    run_server_cmd "git pull origin main"
    run_server_cmd "npm install"
    run_server_cmd "pm2 restart charged-api"
    echo -e "${GREEN}Application updated successfully!${NC}"
}

# Function to backup application
backup_app() {
    echo -e "${YELLOW}Creating backup...${NC}"
    BACKUP_NAME="chargedapi-backup-$(date +%Y%m%d-%H%M%S)"
    run_server_cmd "cp -r $APP_DIR /home/ubuntu/$BACKUP_NAME"
    echo -e "${GREEN}Backup created: $BACKUP_NAME${NC}"
}

# Function to check database
check_database() {
    echo -e "${BLUE}=== DATABASE STATUS ===${NC}"
    run_server_cmd "psql -h localhost -U postgres -d chargeddb -c 'SELECT version();'"
}

# Function to monitor resources
monitor_resources() {
    echo -e "${BLUE}=== SYSTEM RESOURCES ===${NC}"
    run_server_cmd "free -h && echo '---' && df -h && echo '---' && top -bn1 | head -10"
}

# Function to fix Firebase notification issue
fix_firebase() {
    echo -e "${YELLOW}Fixing Firebase notification issue...${NC}"
    run_server_cmd "npm install firebase-admin@latest"
    run_server_cmd "pm2 restart charged-api"
    echo -e "${GREEN}Firebase updated and application restarted!${NC}"
}

# Function to show help
show_help() {
    echo -e "${BLUE}=== CHARGED SERVER MANAGEMENT ===${NC}"
    echo ""
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  status      - Show application status"
    echo "  restart     - Restart the application"
    echo "  logs        - View application logs"
    echo "  errors      - View error logs only"
    echo "  update      - Update application from git"
    echo "  backup      - Create application backup"
    echo "  database    - Check database status"
    echo "  monitor     - Monitor system resources"
    echo "  fix-firebase- Fix Firebase notification issue"
    echo "  help        - Show this help message"
    echo ""
}

# Main script logic
case "$1" in
    "status")
        show_status
        ;;
    "restart")
        restart_app
        ;;
    "logs")
        view_logs
        ;;
    "errors")
        check_errors
        ;;
    "update")
        update_app
        ;;
    "backup")
        backup_app
        ;;
    "database")
        check_database
        ;;
    "monitor")
        monitor_resources
        ;;
    "fix-firebase")
        fix_firebase
        ;;
    "help"|"")
        show_help
        ;;
    *)
        echo -e "${RED}Unknown command: $1${NC}"
        show_help
        exit 1
        ;;
esac
