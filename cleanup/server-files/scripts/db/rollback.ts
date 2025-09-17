#!/usr/bin/env ts-node

import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';

interface MigrationRecord {
  id: number;
  filename: string;
  checksum: string;
  applied_at: string;
}

class RollbackRunner {
  private client: Client;
  private migrationsDir: string;

  constructor() {
    this.client = new Client({
      connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/charged',
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
    });
    this.migrationsDir = path.join(process.cwd(), 'db', 'migrations');
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

  async getAppliedMigrations(): Promise<MigrationRecord[]> {
    const query = 'SELECT * FROM db_migrations ORDER BY id DESC';
    const result = await this.client.query(query);
    return result.rows;
  }

  parseMigrationFile(filepath: string): { up: string; down: string } {
    const content = fs.readFileSync(filepath, 'utf8');
    const lines = content.split('\n');
    
    let upSection = '';
    let downSection = '';
    let currentSection = '';
    let inUpSection = false;
    let inDownSection = false;

    for (const line of lines) {
      if (line.trim() === '-- +migrate Up') {
        inUpSection = true;
        inDownSection = false;
        currentSection = 'up';
        continue;
      }
      
      if (line.trim() === '-- +migrate Down') {
        inUpSection = false;
        inDownSection = true;
        currentSection = 'down';
        continue;
      }

      if (inUpSection && currentSection === 'up') {
        upSection += line + '\n';
      } else if (inDownSection && currentSection === 'down') {
        downSection += line + '\n';
      }
    }

    return { up: upSection.trim(), down: downSection.trim() };
  }

  async rollbackMigration(migration: MigrationRecord): Promise<void> {
    const filepath = path.join(this.migrationsDir, migration.filename);
    
    if (!fs.existsSync(filepath)) {
      console.warn(`⚠️  Migration file not found: ${migration.filename}, skipping rollback`);
      return;
    }

    const { down } = this.parseMigrationFile(filepath);

    if (!down) {
      console.warn(`⚠️  No DOWN section found in ${migration.filename}, skipping rollback`);
      return;
    }

    console.log(`🔄 Rolling back migration: ${migration.filename}`);
    
    try {
      await this.client.query('BEGIN');
      await this.client.query(down);
      
      // Remove the migration record
      await this.client.query(
        'DELETE FROM db_migrations WHERE id = $1',
        [migration.id]
      );
      
      await this.client.query('COMMIT');
      console.log(`✅ Rollback completed: ${migration.filename}`);
    } catch (error) {
      await this.client.query('ROLLBACK');
      console.error(`❌ Rollback failed: ${migration.filename}`, error);
      throw error;
    }
  }

  async rollback(): Promise<void> {
    try {
      await this.connect();

      const appliedMigrations = await this.getAppliedMigrations();
      
      if (appliedMigrations.length === 0) {
        console.log('✅ No migrations to rollback');
        return;
      }

      console.log(`📊 Applied migrations: ${appliedMigrations.length}`);
      console.log(`🔄 Rolling back last migration: ${appliedMigrations[0].filename}`);

      await this.rollbackMigration(appliedMigrations[0]);

      console.log('🎉 Rollback completed successfully!');
    } catch (error) {
      console.error('💥 Rollback failed:', error);
      process.exit(1);
    } finally {
      await this.disconnect();
    }
  }
}

// Run rollback if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const runner = new RollbackRunner();
  runner.rollback().catch(console.error);
}

export { RollbackRunner };
