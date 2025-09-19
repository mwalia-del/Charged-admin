# Data Reconciliation System

This system safely audits and reconciles data between your admin dashboard and PostgreSQL database.

## 🛡️ Safety Features

- **Phase 1**: READ-ONLY audit (default)
- **Phase 2**: Apply only non-destructive fixes (CREATE/REPLACE VIEWs)
- **No data mutations**: Any data changes are generated as suggestions for manual review

## 📋 Prerequisites

1. **Environment Variables** (set in Cursor/CI Secrets):
   ```bash
   PG_URL=postgres://user:pass@host:5432/dbname        # read-only role recommended
   BASE_URL=https://api.charged.autos
   ADMIN_TOKEN_PROD_TEST=<admin JWT for prod test tenant>
   TZ_AUDIT=America/Halifax                            # timezone normalization
   CONFIRM_APPLY=0                                     # set to 1 to apply view-only fixes
   ```

2. **Dependencies**:
   ```bash
   npm install
   ```

## 🚀 Quick Start

### 1. Run Complete Audit (Read-Only)
```bash
npm run recon:all
```

This will:
- Snapshot database schema
- Fetch API samples
- Run database audit queries
- Compare API vs DB data
- Generate discrepancy reports
- Create safe fix plans

### 2. Review Results
Check the generated artifacts:
- `artifacts/recon/SUMMARY.md` - Overview
- `artifacts/recon/diffs/*.md` - Detailed discrepancy reports
- `plan/views.fix.sql` - Safe view definitions
- `plan/data_fix_suggestions.sql` - Data fix suggestions (NOT EXECUTED)

### 3. Apply Safe Fixes (Optional)
```bash
CONFIRM_APPLY=1 npm run recon:apply
```

## 📁 Output Structure

```
artifacts/recon/
├── schema.snapshot.json          # Database schema
├── api.samples.json             # API response samples
├── audit/                       # Database audit results
│   ├── rides.json
│   ├── tips.json
│   ├── wallet.json
│   ├── payouts.json
│   ├── referrals.json
│   ├── invoices.json
│   └── businesses.json
├── diffs/                       # Discrepancy reports
│   ├── rides.md
│   ├── tips.md
│   ├── wallet.md
│   ├── payouts.md
│   ├── referrals.md
│   ├── invoices.md
│   └── businesses.md
└── SUMMARY.md                   # Executive summary

plan/
├── views.fix.sql               # Safe view definitions
└── data_fix_suggestions.sql    # Data fix suggestions (NOT EXECUTED)
```

## 🔧 Individual Commands

```bash
# Schema audit
npm run recon:schema

# API samples
npm run recon:api

# Database audit
npm run recon:db

# Compare and generate reports
npm run recon:compare

# Generate fix plans
npm run recon:plan

# Apply safe fixes (views only)
CONFIRM_APPLY=1 npm run recon:apply
```

## 🔍 Common Issues & Solutions

### 1. Timezone Mismatches
- **Problem**: API and DB use different timezones
- **Solution**: Views normalize to `TZ_AUDIT` timezone

### 2. Status Filters
- **Problem**: API excludes certain statuses (canceled/pending)
- **Solution**: Views explicitly encode status filters

### 3. Soft Deletes
- **Problem**: API ignores soft-deleted records
- **Solution**: Views add `WHERE deleted_at IS NULL`

### 4. Tenant Scoping
- **Problem**: API filters by organization/account
- **Solution**: Views include proper tenant filters

### 5. Join Issues
- **Problem**: Duplicate rows from joins
- **Solution**: Use INNER JOIN where appropriate

## 🚨 Safety Notes

- **Never run data mutations** without manual review
- **Always test views** in a staging environment first
- **Use read-only database user** for audit phase
- **Backup database** before applying any changes

## 📊 Understanding Reports

### Discrepancy Reports
Each report shows:
- **Day/Month**: Time period
- **DB values**: Ground truth from database
- **API note**: What to check in API
- **Δ**: Difference percentage

### Fix Plans
- **views.fix.sql**: Safe view definitions to align API vs DB
- **data_fix_suggestions.sql**: Data corrections (NOT EXECUTED)

## 🔄 Integration with Admin Dashboard

After applying views:
1. Update API layer to use new views
2. Test thoroughly in staging
3. Deploy to production
4. Monitor for any issues

## 📞 Support

If you encounter issues:
1. Check the logs in `artifacts/recon/`
2. Verify environment variables
3. Ensure database connectivity
4. Review the generated reports
