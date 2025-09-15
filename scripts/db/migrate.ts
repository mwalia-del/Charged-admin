#!/usr/bin/env ts-node

import { Client } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

interface MigrationRecord {
  id: number;
  filename: string;
  checksum: string;
  applied_at: string;
}

class MigrationRunner {
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

  async createMigrationsTable(): Promise<void> {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS db_migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL UNIQUE,
        checksum VARCHAR(64) NOT NULL,
        applied_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;
    
    await this.client.query(createTableQuery);
    console.log('✅ Migrations table ready');
  }

  async getAppliedMigrations(): Promise<MigrationRecord[]> {
    const query = 'SELECT * FROM db_migrations ORDER BY id ASC';
    const result = await this.client.query(query);
    return result.rows;
  }

  getMigrationFiles(): string[] {
    if (!fs.existsSync(this.migrationsDir)) {
      console.error(`❌ Migrations directory not found: ${this.migrationsDir}`);
      process.exit(1);
    }

    const files = fs.readdirSync(this.migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();

    return files;
  }

  calculateChecksum(content: string): string {
    return crypto.createHash('sha256').update(content).digest('hex');
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

  async runMigration(filename: string): Promise<void> {
    const filepath = path.join(this.migrationsDir, filename);
    const content = fs.readFileSync(filepath, 'utf8');
    const checksum = this.calculateChecksum(content);
    const { up } = this.parseMigrationFile(filepath);

    if (!up) {
      console.warn(`⚠️  No UP section found in ${filename}, skipping`);
      return;
    }

    console.log(`🔄 Running migration: ${filename}`);
    
    try {
      await this.client.query('BEGIN');
      await this.client.query(up);
      
      // Record the migration
      await this.client.query(
        'INSERT INTO db_migrations (filename, checksum) VALUES ($1, $2)',
        [filename, checksum]
      );
      
      await this.client.query('COMMIT');
      console.log(`✅ Migration completed: ${filename}`);
    } catch (error) {
      await this.client.query('ROLLBACK');
      console.error(`❌ Migration failed: ${filename}`, error);
      throw error;
    }
  }

  async migrate(): Promise<void> {
    try {
      await this.connect();
      await this.createMigrationsTable();

      const appliedMigrations = await this.getAppliedMigrations();
      const migrationFiles = this.getMigrationFiles();
      
      console.log(`📊 Found ${migrationFiles.length} migration files`);
      console.log(`📊 Applied migrations: ${appliedMigrations.length}`);

      const appliedFilenames = new Set(appliedMigrations.map(m => m.filename));
      const pendingMigrations = migrationFiles.filter(file => !appliedFilenames.has(file));

      if (pendingMigrations.length === 0) {
        console.log('✅ No pending migrations');
        return;
      }

      console.log(`🔄 Running ${pendingMigrations.length} pending migrations...`);

      for (const filename of pendingMigrations) {
        await this.runMigration(filename);
      }

      console.log('🎉 All migrations completed successfully!');
    } catch (error) {
      console.error('💥 Migration failed:', error);
      process.exit(1);
    } finally {
      await this.disconnect();
    }
  }
}

// Run migrations if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const runner = new MigrationRunner();
  runner.migrate().catch(console.error);
}

export { MigrationRunner };
