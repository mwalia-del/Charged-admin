# 🚀 Quick Start Guide

## 1. Setup Environment
```bash
# Copy environment template
cp tools/recon/env.example tools/recon/.env

# Edit with your values
nano tools/recon/.env
```

## 2. Run Complete Audit
```bash
npm run recon:all
```

## 3. Review Results
```bash
# Check summary
cat artifacts/recon/SUMMARY.md

# Review discrepancies
ls artifacts/recon/diffs/
```

## 4. Apply Safe Fixes (Optional)
```bash
CONFIRM_APPLY=1 npm run recon:apply
```

## 📋 Required Environment Variables

```bash
# Database (read-only recommended)
PG_URL=postgres://user:pass@host:5432/dbname

# API Configuration  
BASE_URL=https://api.charged.autos
ADMIN_TOKEN_PROD_TEST=your_jwt_token

# Timezone
TZ_AUDIT=America/Halifax

# Safety
CONFIRM_APPLY=0
```

## 🔍 What Gets Generated

- **Schema**: Complete database structure
- **API Samples**: Response data from your API
- **DB Audit**: Ground truth from database
- **Reports**: Human-readable discrepancy analysis
- **Plans**: Safe fixes and suggestions

## 🛡️ Safety Features

- ✅ Read-only by default
- ✅ No data mutations
- ✅ View-only fixes
- ✅ Manual review required
- ✅ Rollback support

## 📞 Need Help?

- Check `tools/recon/README.md` for detailed docs
- Check `tools/recon/RUNBOOK.md` for troubleshooting
- Run `npx ts-node tools/recon/test-setup.ts` to verify setup
