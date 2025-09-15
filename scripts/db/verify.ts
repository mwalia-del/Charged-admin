#!/usr/bin/env ts-node

import { Client } from 'pg';

interface TableInfo {
  table_name: string;
  column_name: string;
  data_type: string;
  is_nullable: string;
  column_default: string;
}

interface IndexInfo {
  indexname: string;
  tablename: string;
  indexdef: string;
}

interface ConstraintInfo {
  constraint_name: string;
  table_name: string;
  constraint_type: string;
}

interface EnumInfo {
  enum_name: string;
  enum_values: string[];
}

class SchemaVerifier {
  private client: Client;

  constructor() {
    this.client = new Client({
      connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/charged',
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
  }

  async connect(): Promise<void> {
    try {
      await this.client.connect();
      console.log('✅ Connected to database');
    } catch (error) {
      console.error('❌ Failed to connect to database:', error);
      process.exit(1);
    }
  }

  async disconnect(): Promise<void> {
    await this.client.end();
  }

  async getTables(): Promise<string[]> {
    const query = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;
    const result = await this.client.query(query);
    return result.rows.map(row => row.table_name);
  }

  async getTableColumns(tableName: string): Promise<TableInfo[]> {
    const query = `
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public' 
      AND table_name = $1
      ORDER BY ordinal_position;
    `;
    const result = await this.client.query(query, [tableName]);
    return result.rows.map(row => ({
      table_name: tableName,
      column_name: row.column_name,
      data_type: row.data_type,
      is_nullable: row.is_nullable,
      column_default: row.column_default
    }));
  }

  async getIndexes(): Promise<IndexInfo[]> {
    const query = `
      SELECT indexname, tablename, indexdef
      FROM pg_indexes
      WHERE schemaname = 'public'
      ORDER BY tablename, indexname;
    `;
    const result = await this.client.query(query);
    return result.rows;
  }

  async getConstraints(): Promise<ConstraintInfo[]> {
    const query = `
      SELECT 
        tc.constraint_name,
        tc.table_name,
        tc.constraint_type
      FROM information_schema.table_constraints tc
      WHERE tc.table_schema = 'public'
      ORDER BY tc.table_name, tc.constraint_name;
    `;
    const result = await this.client.query(query);
    return result.rows;
  }

  async getEnums(): Promise<EnumInfo[]> {
    const query = `
      SELECT 
        t.typname as enum_name,
        array_agg(e.enumlabel ORDER BY e.enumsortorder) as enum_values
      FROM pg_type t
      JOIN pg_enum e ON t.oid = e.enumtypid
      WHERE t.typtype = 'e'
      GROUP BY t.typname
      ORDER BY t.typname;
    `;
    const result = await this.client.query(query);
    return result.rows;
  }

  async verifyRequiredTables(): Promise<{ passed: boolean; missing: string[] }> {
    const requiredTables = [
      'users', 'riders', 'drivers', 'businesses',
      'rides', 'payments', 'invoices', 'invoice_line_items',
      'wallets', 'wallet_ledger', 'tips',
      'referrals', 'referral_issuances',
      'scheduled_rides', 'promotions', 'promotion_redemptions',
      'business_rewards', 'business_rewards_ledger',
      'vehicle_classes', 'feature_flags',
      'notification_tokens', 'ride_daily_rollup',
      'db_migrations'
    ];

    const existingTables = await this.getTables();
    const missing = requiredTables.filter(table => !existingTables.includes(table));

    return {
      passed: missing.length === 0,
      missing
    };
  }

  async verifyRequiredColumns(): Promise<{ passed: boolean; issues: string[] }> {
    const issues: string[] = [];
    
    // Check users table
    const usersColumns = await this.getTableColumns('users');
    const requiredUsersColumns = ['id', 'email', 'phone', 'role', 'created_at', 'updated_at'];
    for (const col of requiredUsersColumns) {
      if (!usersColumns.some(c => c.column_name === col)) {
        issues.push(`users table missing column: ${col}`);
      }
    }

    // Check rides table
    const ridesColumns = await this.getTableColumns('rides');
    const requiredRidesColumns = ['id', 'ride_number', 'rider_id', 'driver_id', 'status', 'amount_cents', 'created_at'];
    for (const col of requiredRidesColumns) {
      if (!ridesColumns.some(c => c.column_name === col)) {
        issues.push(`rides table missing column: ${col}`);
      }
    }

    // Check wallets table
    const walletsColumns = await this.getTableColumns('wallets');
    const requiredWalletsColumns = ['id', 'owner_type', 'owner_id', 'balance_cents', 'currency'];
    for (const col of requiredWalletsColumns) {
      if (!walletsColumns.some(c => c.column_name === col)) {
        issues.push(`wallets table missing column: ${col}`);
      }
    }

    return {
      passed: issues.length === 0,
      issues
    };
  }

  async verifyRequiredEnums(): Promise<{ passed: boolean; missing: string[] }> {
    const requiredEnums = [
      'user_role', 'billing_mode', 'notification_platform',
      'ride_status', 'payment_status', 'invoice_status',
      'tip_status', 'referrer_type', 'referral_status',
      'scheduled_ride_status', 'scheduled_ride_source',
      'promotion_audience', 'promotion_reward_type'
    ];

    const existingEnums = await this.getEnums();
    const existingEnumNames = existingEnums.map(e => e.enum_name);
    const missing = requiredEnums.filter(enumName => !existingEnumNames.includes(enumName));

    return {
      passed: missing.length === 0,
      missing
    };
  }

  async verifyIndexes(): Promise<{ passed: boolean; issues: string[] }> {
    const issues: string[] = [];
    const indexes = await this.getIndexes();
    
    // Check for critical indexes
    const criticalIndexes = [
      'idx_users_email',
      'idx_rides_ride_number',
      'idx_rides_rider_id',
      'idx_rides_driver_id',
      'idx_wallets_owner',
      'idx_wallet_ledger_wallet_id'
    ];

    const existingIndexNames = indexes.map(i => i.indexname);
    for (const indexName of criticalIndexes) {
      if (!existingIndexNames.includes(indexName)) {
        issues.push(`Missing critical index: ${indexName}`);
      }
    }

    return {
      passed: issues.length === 0,
      issues
    };
  }

  async verifyConstraints(): Promise<{ passed: boolean; issues: string[] }> {
    const issues: string[] = [];
    const constraints = await this.getConstraints();
    
    // Check for critical foreign key constraints
    const criticalConstraints = [
      'fk_rides_scheduled_ride_id',
      'check_rides_rider_or_org',
      'check_scheduled_rides_rider_or_org'
    ];

    const existingConstraintNames = constraints.map(c => c.constraint_name);
    for (const constraintName of criticalConstraints) {
      if (!existingConstraintNames.includes(constraintName)) {
        issues.push(`Missing critical constraint: ${constraintName}`);
      }
    }

    return {
      passed: issues.length === 0,
      issues
    };
  }

  async verify(): Promise<void> {
    try {
      await this.connect();

      console.log('🔍 Verifying database schema...\n');

      // Verify tables
      const tablesResult = await this.verifyRequiredTables();
      console.log('📋 Required Tables:');
      if (tablesResult.passed) {
        console.log('  ✅ All required tables exist');
      } else {
        console.log('  ❌ Missing tables:', tablesResult.missing.join(', '));
      }

      // Verify columns
      const columnsResult = await this.verifyRequiredColumns();
      console.log('\n📋 Required Columns:');
      if (columnsResult.passed) {
        console.log('  ✅ All required columns exist');
      } else {
        console.log('  ❌ Column issues:');
        columnsResult.issues.forEach(issue => console.log(`    - ${issue}`));
      }

      // Verify enums
      const enumsResult = await this.verifyRequiredEnums();
      console.log('\n📋 Required Enums:');
      if (enumsResult.passed) {
        console.log('  ✅ All required enums exist');
      } else {
        console.log('  ❌ Missing enums:', enumsResult.missing.join(', '));
      }

      // Verify indexes
      const indexesResult = await this.verifyIndexes();
      console.log('\n📋 Required Indexes:');
      if (indexesResult.passed) {
        console.log('  ✅ All critical indexes exist');
      } else {
        console.log('  ❌ Index issues:');
        indexesResult.issues.forEach(issue => console.log(`    - ${issue}`));
      }

      // Verify constraints
      const constraintsResult = await this.verifyConstraints();
      console.log('\n📋 Required Constraints:');
      if (constraintsResult.passed) {
        console.log('  ✅ All critical constraints exist');
      } else {
        console.log('  ❌ Constraint issues:');
        constraintsResult.issues.forEach(issue => console.log(`    - ${issue}`));
      }

      // Overall result
      const allPassed = tablesResult.passed && columnsResult.passed && 
                       enumsResult.passed && indexesResult.passed && constraintsResult.passed;

      console.log('\n' + '='.repeat(50));
      if (allPassed) {
        console.log('🎉 Schema verification PASSED!');
        console.log('✅ Database is ready for the Charged platform');
      } else {
        console.log('❌ Schema verification FAILED!');
        console.log('🔧 Please run migrations to fix the issues above');
        process.exit(1);
      }

    } catch (error) {
      console.error('💥 Verification failed:', error);
      process.exit(1);
    } finally {
      await this.disconnect();
    }
  }
}

// Run verification if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const verifier = new SchemaVerifier();
  verifier.verify().catch(console.error);
}

export { SchemaVerifier };
