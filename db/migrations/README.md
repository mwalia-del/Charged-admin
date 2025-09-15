# Database Migrations

This directory contains PostgreSQL migrations for the Charged ride-sharing platform.

## Migration Files

The migrations are numbered sequentially and should be run in order:

1. **0001_init_core.sql** - Core identity tables (users, riders, drivers, businesses, wallets, notification_tokens)
2. **0002_rides_payments_invoices.sql** - Rides, payments, and invoice system
3. **0003_tips.sql** - Tips system
4. **0004_referrals.sql** - Referral system
5. **0005_scheduled_rides.sql** - Scheduled rides functionality
6. **0006_promotions.sql** - Promotions and rewards system
7. **0007_business_rewards.sql** - Business rewards and points system
8. **0008_vehicle_classes_or_flags.sql** - Vehicle classes and feature flags
9. **0009_analytics_rollups.sql** - Analytics and reporting tables
10. **0010_constraints_indexes.sql** - Additional constraints and performance indexes
11. **0011_seed_minimal_dev.sql** - Development seed data (only runs in dev environment)

## Running Migrations

### Prerequisites

- Node.js 16+
- PostgreSQL 12+
- TypeScript (`npm install -g typescript ts-node`)

### Environment Setup

Set the `DATABASE_URL` environment variable:

```bash
export DATABASE_URL="postgresql://username:password@localhost:5432/charged"
```

### Commands

```bash
# Run all pending migrations
npm run db:migrate

# Rollback the last migration
npm run db:rollback

# Verify schema integrity
npm run db:verify
```

## Migration Format

Each migration file follows this format:

```sql
-- +migrate Up
BEGIN;
  -- SQL statements to apply the migration
COMMIT;

-- +migrate Down
BEGIN;
  -- SQL statements to rollback the migration
COMMIT;
```

## Schema Overview

### Core Tables

- **users** - Central user identity table with UUID primary keys
- **riders** - Rider-specific data linked to users
- **drivers** - Driver-specific data linked to users  
- **businesses** - Business/organization accounts

### Financial System

- **wallets** - User/business wallet accounts
- **wallet_ledger** - All financial transactions and adjustments
- **payments** - Payment processing records
- **invoices** - Business billing invoices
- **invoice_line_items** - Individual ride charges on invoices

### Ride Management

- **rides** - All ride records with comprehensive tracking
- **scheduled_rides** - Future ride bookings
- **tips** - Driver tip transactions
- **vehicle_classes** - Ride type definitions and pricing

### Rewards & Promotions

- **referrals** - User referral relationships
- **referral_issuances** - Referral reward transactions
- **promotions** - Marketing campaigns and discounts
- **promotion_redemptions** - Promotion usage tracking
- **business_rewards** - Business loyalty points
- **business_rewards_ledger** - Business reward transactions

### Analytics

- **ride_daily_rollup** - Daily aggregated ride statistics
- **notification_tokens** - Push notification device tokens
- **feature_flags** - Dynamic configuration settings

## Key Features

### UUID Primary Keys
All tables use UUID primary keys for better distributed system support.

### Soft Deletes
The `users` table supports soft deletes with `deleted_at` timestamp.

### Comprehensive Indexing
- Performance indexes on frequently queried columns
- Composite indexes for common query patterns
- Partial indexes for active records
- GIN indexes for JSONB columns

### Data Integrity
- Foreign key constraints with appropriate CASCADE/SET NULL behavior
- Check constraints for data validation
- Unique constraints where appropriate
- Enum types for controlled vocabularies

### Audit Trail
- `created_at` and `updated_at` timestamps on all tables
- Comprehensive ledger system for financial tracking

## Development vs Production

- Development seed data is only inserted when `NODE_ENV=development`
- Production deployments should skip the seed migration
- All migrations are idempotent and can be run multiple times safely

## Troubleshooting

### Migration Fails
1. Check database connection and permissions
2. Verify PostgreSQL version compatibility
3. Check for conflicting data or constraints
4. Review migration logs for specific error messages

### Schema Verification Fails
1. Run `npm run db:verify` to see specific issues
2. Check if all required tables and columns exist
3. Verify indexes and constraints are properly created
4. Ensure enum types are defined correctly

### Rollback Issues
1. Ensure migration files haven't been modified
2. Check that DOWN sections are properly defined
3. Verify no data dependencies prevent rollback
4. Consider manual cleanup if automated rollback fails

## Best Practices

1. **Always backup** before running migrations in production
2. **Test migrations** in development environment first
3. **Review changes** before applying to production
4. **Monitor performance** after adding indexes
5. **Keep migrations small** and focused on single concerns
6. **Use transactions** to ensure atomicity
7. **Document breaking changes** in migration comments
