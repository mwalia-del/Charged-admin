# Data Reconciliation Runbook

## 🚀 Quick Start Guide

### Step 1: Environment Setup
```bash
# Copy the example environment file
cp tools/recon/env.example tools/recon/.env

# Edit the environment file with your actual values
nano tools/recon/.env
```

Required environment variables:
- `PG_URL`: PostgreSQL connection string (read-only recommended)
- `BASE_URL`: API base URL (https://api.charged.autos)
- `ADMIN_TOKEN_PROD_TEST`: Admin JWT token for API testing
- `TZ_AUDIT`: Timezone for audit (e.g., America/Halifax)
- `CONFIRM_APPLY`: Set to 0 for dry-run, 1 to apply fixes

### Step 2: Run Complete Audit
```bash
# Run the complete reconciliation audit
npm run recon:all
```

This will generate:
- Database schema snapshot
- API response samples
- Database audit queries
- Discrepancy reports
- Safe fix plans

### Step 3: Review Results
```bash
# Check the summary
cat artifacts/recon/SUMMARY.md

# Review specific discrepancy reports
ls artifacts/recon/diffs/
cat artifacts/recon/diffs/rides.md
cat artifacts/recon/diffs/tips.md
# ... etc
```

### Step 4: Apply Safe Fixes (Optional)
```bash
# Apply view-only fixes (safe)
CONFIRM_APPLY=1 npm run recon:apply
```

## 🔍 Understanding the Output

### Schema Snapshot
- **File**: `artifacts/recon/schema.snapshot.json`
- **Purpose**: Complete database schema for reference
- **Use**: Verify table/column names match expectations

### API Samples
- **File**: `artifacts/recon/api.samples.json`
- **Purpose**: Sample API responses for comparison
- **Use**: Understand API data structure and values

### Database Audit
- **Files**: `artifacts/recon/audit/*.json`
- **Purpose**: Ground truth data from database
- **Use**: Compare against API responses

### Discrepancy Reports
- **Files**: `artifacts/recon/diffs/*.md`
- **Purpose**: Human-readable comparison reports
- **Use**: Identify specific data mismatches

### Fix Plans
- **Files**: `plan/views.fix.sql`, `plan/data_fix_suggestions.sql`
- **Purpose**: Safe fixes and data corrections
- **Use**: Apply to resolve discrepancies

## 🛠️ Troubleshooting

### Common Issues

#### 1. Database Connection Failed
```bash
# Check PostgreSQL connection
psql $PG_URL -c "SELECT version();"

# Verify credentials and network access
```

#### 2. API Authentication Failed
```bash
# Test API with token
curl -H "Authorization: Bearer $ADMIN_TOKEN_PROD_TEST" \
     "$BASE_URL/admin/dashboardstats"
```

#### 3. Missing Dependencies
```bash
# Install missing packages
npm install --legacy-peer-deps
```

#### 4. Permission Denied
```bash
# Check file permissions
ls -la tools/recon/
chmod +x tools/recon/*.ts
```

### Error Codes

- **Exit 1**: Database connection failed
- **Exit 2**: API authentication failed
- **Exit 3**: Missing environment variables
- **Exit 4**: File system errors

## 📊 Data Analysis

### Understanding Discrepancies

#### Timezone Issues
- **Symptom**: Data appears shifted by hours
- **Solution**: Check `TZ_AUDIT` setting
- **Fix**: Update timezone in views

#### Status Filtering
- **Symptom**: Different counts between API and DB
- **Solution**: Check status filters in API
- **Fix**: Add explicit status filters to views

#### Soft Deletes
- **Symptom**: API shows fewer records than DB
- **Solution**: Check for `deleted_at` columns
- **Fix**: Add `WHERE deleted_at IS NULL` to views

#### Join Issues
- **Symptom**: Duplicate rows in results
- **Solution**: Check JOIN logic
- **Fix**: Use INNER JOIN or add DISTINCT

## 🔄 Integration Steps

### After Applying Views

1. **Test in Staging**
   ```bash
   # Deploy to staging environment
   # Test all admin dashboard functions
   # Verify data accuracy
   ```

2. **Update API Layer**
   ```sql
   -- Update API queries to use new views
   SELECT * FROM v_admin_rides_daily;
   SELECT * FROM v_admin_tips_daily;
   -- etc.
   ```

3. **Deploy to Production**
   ```bash
   # Deploy updated API
   # Monitor for issues
   # Verify data consistency
   ```

4. **Monitor and Validate**
   ```bash
   # Run reconciliation again
   npm run recon:all
   # Verify discrepancies are resolved
   ```

## 🚨 Safety Checklist

Before applying any changes:

- [ ] Database backup completed
- [ ] Staging environment tested
- [ ] All team members notified
- [ ] Rollback plan prepared
- [ ] Monitoring in place

## 📞 Support

### Getting Help

1. **Check Logs**: Review console output for errors
2. **Verify Config**: Ensure environment variables are correct
3. **Test Connectivity**: Verify database and API access
4. **Review Reports**: Check generated discrepancy reports

### Common Commands

```bash
# Check environment
env | grep -E "(PG_URL|BASE_URL|ADMIN_TOKEN|TZ_AUDIT)"

# Test database connection
npm run recon:schema

# Test API connection
npm run recon:api

# Run specific audit
npm run recon:db

# Generate reports
npm run recon:compare
```

## 📈 Monitoring

### Key Metrics to Watch

- **Data Accuracy**: API vs DB consistency
- **Performance**: Query execution times
- **Errors**: Failed API calls or DB queries
- **Coverage**: Percentage of data reconciled

### Regular Maintenance

- **Weekly**: Run reconciliation audit
- **Monthly**: Review and update views
- **Quarterly**: Full data validation
- **Annually**: Schema and process review
