# 🚀 Charged Server Management Guide

## 📋 **Server Overview**
- **Server**: `ubuntu@ec2-3-20-152-91.us-east-2.compute.amazonaws.com`
- **SSH Key**: `charged-api-server.pem`
- **Application**: Node.js/Express API with React admin dashboard
- **Process Manager**: PM2
- **Database**: PostgreSQL
- **Documentation**: Swagger UI at `/api-docs/`

## 🛠️ **Quick Management Commands**

### Check Status
```bash
./scripts/manage-charged-server.sh status
```

### Restart Application
```bash
./scripts/manage-charged-server.sh restart
```

### View Logs
```bash
./scripts/manage-charged-server.sh logs
```

### Fix Firebase Issue
```bash
./scripts/manage-charged-server.sh fix-firebase
```

### Update Application
```bash
./scripts/manage-charged-server.sh update
```

### Create Backup
```bash
./scripts/manage-charged-server.sh backup
```

## 🔧 **Current Issues & Solutions**

### 1. Firebase Notification Error
**Issue**: `admin.messaging(...).sendMulticast is not a function`
**Solution**: Update Firebase Admin SDK
```bash
./scripts/manage-charged-server.sh fix-firebase
```

### 2. Missing Health Endpoints
**Issue**: `/health` and `/api/health` return 404
**Solution**: Add health endpoints to the application

### 3. API Versioning
**Issue**: Some endpoints expect `/v3/` prefix
**Solution**: Ensure consistent API versioning

## 📊 **Application Structure**

### Routes
- `/admin` - Admin operations
- `/catalog` - Vehicle catalog
- `/drivers` - Driver management
- `/payments` - Payment processing
- `/rides` - Ride management
- `/users` - User management

### Controllers
- `AdminController.js` - Admin operations
- `DriversController.js` - Driver management
- `PaymentsController.js` - Payment processing
- `RidesController.js` - Ride management
- `UsersController.js` - User management
- `VehicleClassController.js` - Vehicle classes

### Models
- `UserModel.js` - User data model
- `VehicleClassModel.js` - Vehicle class model

## 🌐 **Access Points**

### Admin Dashboard
- **URL**: https://admin.charged.autos
- **Status**: ✅ Online (serving React app)

### API Documentation
- **URL**: https://api.charged.autos/api-docs/
- **Status**: ✅ Online (Swagger UI)

### API Endpoints
- **Base URL**: https://api.charged.autos
- **Status**: ✅ Online (Node.js/Express)

## 🔍 **Monitoring & Maintenance**

### Check Application Health
```bash
# Check PM2 status
ssh -i charged-api-server.pem ubuntu@ec2-3-20-152-91.us-east-2.compute.amazonaws.com "cd chargedapi && source ~/.nvm/nvm.sh && pm2 status"

# Check application response
curl https://api.charged.autos/
curl https://api.charged.autos/api-docs/
```

### View Logs
```bash
# Real-time logs
./scripts/manage-charged-server.sh logs

# Error logs only
./scripts/manage-charged-server.sh errors
```

### System Resources
```bash
# Monitor resources
./scripts/manage-charged-server.sh monitor
```

## 🚨 **Troubleshooting**

### Application Not Responding
1. Check PM2 status: `./scripts/manage-charged-server.sh status`
2. Restart application: `./scripts/manage-charged-server.sh restart`
3. Check logs: `./scripts/manage-charged-server.sh logs`

### Database Issues
1. Check database: `./scripts/manage-charged-server.sh database`
2. Verify connection in application logs

### Firebase Notifications Failing
1. Fix Firebase: `./scripts/manage-charged-server.sh fix-firebase`
2. Check Firebase configuration
3. Verify service account key

## 📈 **Performance Monitoring**

### Current Metrics
- **Uptime**: 2+ hours
- **Memory Usage**: 113.6MB
- **CPU Usage**: 0%
- **Restarts**: 19 (indicates some instability)

### Recommendations
1. **Monitor Memory Usage**: Watch for memory leaks
2. **Investigate Restarts**: 19 restarts suggest issues
3. **Add Health Endpoints**: Implement proper health checks
4. **Update Dependencies**: Keep packages up to date

## 🔐 **Security Notes**

### Environment Variables
- Database credentials in `.env`
- AWS S3 credentials configured
- Twilio credentials for SMS
- Firebase service account key

### Recommendations
1. **Rotate Credentials**: Regularly update API keys
2. **Secure Environment**: Ensure `.env` files are not exposed
3. **Monitor Access**: Check server access logs
4. **Update Dependencies**: Keep security patches current

## 📞 **Support & Maintenance**

### Regular Tasks
1. **Daily**: Check application status
2. **Weekly**: Review logs for errors
3. **Monthly**: Update dependencies
4. **Quarterly**: Security audit

### Emergency Contacts
- **Server Access**: SSH with provided key
- **Application Logs**: PM2 logs
- **Database**: PostgreSQL on localhost

---

**Last Updated**: 2025-09-15  
**Server Status**: ✅ Online  
**Application Status**: ✅ Running  
**Issues**: Firebase notifications, missing health endpoints
