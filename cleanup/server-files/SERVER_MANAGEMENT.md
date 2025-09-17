# Charged Platform Server Management

This document provides comprehensive instructions for managing the Charged ride-sharing platform server.

## 🖥️ Server Information

- **Server**: EC2 Instance (Ubuntu)
- **Host**: `ec2-3-20-152-91.us-east-2.compute.amazonaws.com`
- **User**: `ubuntu`
- **SSH Key**: `charged-api-server.pem`
- **Admin Dashboard**: https://admin.charged.autos
- **API Documentation**: https://api.charged.autos/api-docs/

## 🚀 Quick Start

### 1. Connect to Server
```bash
ssh -i charged-api-server.pem ubuntu@ec2-3-20-152-91.us-east-2.compute.amazonaws.com
```

### 2. Check Status
```bash
./manage-server.sh status
```

### 3. Deploy Updates
```bash
./manage-server.sh deploy
```

## 📋 Management Scripts

### `manage-server.sh` - Main Management Tool
```bash
./manage-server.sh [COMMAND]
```

**Available Commands:**
- `status` - Show server and application status
- `logs` - Show application logs
- `restart` - Restart the API application
- `deploy` - Deploy the admin dashboard
- `health` - Run comprehensive health check
- `backup` - Create a backup of current state
- `cleanup` - Clean up disk space
- `connect` - Connect to server via SSH
- `help` - Show help message

### `deploy.sh` - Admin Dashboard Deployment
```bash
./deploy.sh
```
- Builds the React application
- Creates backup of current dashboard
- Uploads new files to server
- Tests deployment
- Rolls back if deployment fails

### `prepare-server.sh` - Server Preparation
```bash
./prepare-server.sh
```
- Checks server health
- Cleans up disk space
- Sets proper permissions
- Prepares deployment directories
- Creates health check script

## 🔧 Manual Server Commands

### Application Management
```bash
# Check PM2 status
cd /home/ubuntu/chargedapi
source ~/.nvm/nvm.sh
pm2 status

# View logs
pm2 logs charged-api --lines 50

# Restart application
pm2 restart charged-api

# Stop application
pm2 stop charged-api

# Start application
pm2 start charged-api
```

### Nginx Management
```bash
# Check nginx status
sudo systemctl status nginx

# Restart nginx
sudo systemctl restart nginx

# Test nginx configuration
sudo nginx -t

# Reload nginx configuration
sudo systemctl reload nginx
```

### Database Management
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Connect to database
sudo -u postgres psql

# Check database size
sudo -u postgres psql -c "SELECT pg_size_pretty(pg_database_size('charged_db'));"
```

## 📊 Monitoring & Health Checks

### System Resources
```bash
# Check disk usage
df -h

# Check memory usage
free -h

# Check CPU usage
top

# Check running processes
ps aux | grep -E '(node|nginx|postgres)'
```

### Application Health
```bash
# Run health check script
/home/ubuntu/chargedapi/health-check.sh

# Check API endpoint
curl -I https://api.charged.autos/api-docs/

# Check admin dashboard
curl -I https://admin.charged.autos
```

## 🚨 Troubleshooting

### Common Issues

#### 1. High Disk Usage (91%+)
```bash
# Clean up logs
sudo find /var/log -name '*.log' -type f -mtime +7 -delete
sudo find /var/log -name '*.gz' -type f -mtime +7 -delete

# Clean PM2 logs
pm2 flush

# Clean old backups
find /home/ubuntu/chargedapi -name 'public.backup.*' -type d -mtime +7 -exec sudo rm -rf {} \;
```

#### 2. Application Not Responding
```bash
# Check PM2 status
pm2 status

# Restart application
pm2 restart charged-api

# Check logs for errors
pm2 logs charged-api --err
```

#### 3. Nginx Issues
```bash
# Test configuration
sudo nginx -t

# Check nginx logs
sudo tail -f /var/log/nginx/error.log

# Restart nginx
sudo systemctl restart nginx
```

#### 4. Database Connection Issues
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check database logs
sudo tail -f /var/log/postgresql/postgresql-16-main.log

# Restart PostgreSQL
sudo systemctl restart postgresql
```

## 🔄 Deployment Process

### 1. Prepare Server
```bash
./prepare-server.sh
```

### 2. Build Application
```bash
npm run build
```

### 3. Deploy Dashboard
```bash
./deploy.sh
```

### 4. Verify Deployment
```bash
./manage-server.sh health
```

## 📁 Directory Structure

```
/home/ubuntu/chargedapi/
├── bin/                    # Application entry point
├── controllers/            # API controllers
├── middlewares/           # Express middlewares
├── models/                # Database models
├── routes/                # API routes
├── public/                # Admin dashboard (served by nginx)
├── logs/                  # Application logs
├── node_modules/          # Dependencies
├── package.json           # Node.js configuration
├── app.js                 # Main application file
├── ecosystem.config.js    # PM2 configuration
└── health-check.sh        # Health check script
```

## 🔐 Security Notes

- SSH key is required for server access
- Application runs as `ubuntu` user
- Nginx serves static files as `www-data` user
- Database runs as `postgres` user
- All sensitive data is in environment variables

## 📞 Support

For issues or questions:
1. Check the health check output
2. Review application logs
3. Check system resources
4. Verify network connectivity
5. Contact system administrator

## 🔄 Backup Strategy

- **Application Backups**: Created automatically before each deployment
- **Database Backups**: Should be configured separately
- **Configuration Backups**: Stored in version control
- **Log Rotation**: Handled by PM2 logrotate module

## 📈 Performance Monitoring

- **Uptime**: Monitor with PM2 status
- **Memory**: Check with `free -h`
- **Disk**: Monitor with `df -h`
- **CPU**: Check with `top` or `htop`
- **Network**: Monitor with `netstat` or `ss`

---

**Last Updated**: September 15, 2025
**Server Status**: ✅ Online and Ready
