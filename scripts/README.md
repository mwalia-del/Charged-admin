# Charged Admin Dashboard Deployment

This directory contains production deployment scripts for the Charged Admin Dashboard.

## 🚀 Quick Start

### 1. Set Environment Variables

```bash
# Copy the example config
cp scripts/deploy-config.env scripts/my-deploy.env

# Edit with your values
nano scripts/my-deploy.env

# Or export directly:
export PROD_HOST=ec2-3-20-152-91.us-east-2.compute.amazonaws.com
export PROD_USER=ubuntu
export PROD_PATH=/var/www/charged-admin
export NGINX_ROOT=/var/www/charged-admin/current
export API_BASE=https://api.charged.autos
export SSH_KEY=/Users/walia777/.ssh/charged-api-server.pem
export CONFIRM_DEPLOY=0
```

### 2. Dry Run (Safe - No Changes)

```bash
# Load environment and run dry deployment
source scripts/deploy-config.env
./scripts/deploy-admin.sh
```

### 3. Deploy to Production

```bash
# Load environment and deploy
source scripts/deploy-config.env
export CONFIRM_DEPLOY=1
./scripts/deploy-admin.sh
```

## 🔒 Safety Features

- **Dry-run by default**: Set `CONFIRM_DEPLOY=1` to actually deploy
- **No data loss**: Never deletes existing files (merge-only)
- **API untouched**: PM2 processes and database remain unchanged
- **Atomic deployment**: Symlink switch is instant
- **Rollback ready**: Previous release path is logged

## 📁 Deployment Structure

```
/var/www/charged-admin/
├── releases/
│   ├── 20240917-050000/    # Previous release
│   └── 20240917-050500/    # New release
├── current -> releases/20240917-050500/  # Nginx symlink
└── shared/                 # Shared assets (if needed)
```

## 🔧 Server Setup (One-time)

The deployment script expects this structure on your server:

```bash
# SSH to your server
ssh -i /Users/walia777/.ssh/charged-api-server.pem ubuntu@ec2-3-20-152-91.us-east-2.compute.amazonaws.com

# Create deployment directories
sudo mkdir -p /var/www/charged-admin/{releases,shared}
sudo chown ubuntu:ubuntu /var/www/charged-admin -R

# Configure Nginx (if not already done)
sudo nano /etc/nginx/sites-available/charged-admin
```

## 🐛 Troubleshooting

### Build Issues
```bash
# Check build output
ls -la build/
npm run build
```

### SSH Issues
```bash
# Test SSH connection
ssh -i /Users/walia777/.ssh/charged-api-server.pem ubuntu@ec2-3-20-152-91.us-east-2.compute.amazonaws.com
```

### Nginx Issues
```bash
# Check Nginx status
ssh -i /Users/walia777/.ssh/charged-api-server.pem ubuntu@ec2-3-20-152-91.us-east-2.compute.amazonaws.com "sudo systemctl status nginx"

# Check Nginx config
ssh -i /Users/walia777/.ssh/charged-api-server.pem ubuntu@ec2-3-20-152-91.us-east-2.compute.amazonaws.com "sudo nginx -t"
```

### Rollback
```bash
# If needed, manually rollback to previous release
ssh -i /Users/walia777/.ssh/charged-api-server.pem ubuntu@ec2-3-20-152-91.us-east-2.compute.amazonaws.com "ln -sfn /var/www/charged-admin/releases/PREVIOUS_RELEASE /var/www/charged-admin/current && sudo systemctl reload nginx"
```

## 📊 Monitoring

After deployment, monitor:

- **API Health**: `curl -I https://api.charged.autos`
- **Dashboard**: `curl -I https://admin.charged.autos`
- **PM2 Status**: `ssh user@server "pm2 status"`
- **Nginx Logs**: `ssh user@server "sudo tail -f /var/log/nginx/error.log"`
