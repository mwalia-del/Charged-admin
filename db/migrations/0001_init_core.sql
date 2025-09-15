-- +migrate Up
BEGIN;

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create core enums
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('ADMIN', 'MANAGER', 'RIDER', 'DRIVER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE billing_mode AS ENUM ('invoice', 'credit');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE notification_platform AS ENUM ('ios', 'android', 'web');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create users table (core identity)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE,
    role user_role NOT NULL,
    password_hash VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ NULL
);

-- Create riders table
CREATE TABLE IF NOT EXISTS riders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create drivers table  
CREATE TABLE IF NOT EXISTS drivers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    stripe_account_id VARCHAR(255),
    license_number VARCHAR(50),
    vehicle_make VARCHAR(100),
    vehicle_model VARCHAR(100),
    vehicle_year INTEGER,
    vehicle_color VARCHAR(50),
    license_plate VARCHAR(20),
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create businesses table
CREATE TABLE IF NOT EXISTS businesses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    billing_mode billing_mode NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create wallets table
CREATE TABLE IF NOT EXISTS wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_type VARCHAR(20) NOT NULL CHECK (owner_type IN ('rider', 'driver', 'business')),
    owner_id UUID NOT NULL,
    balance_cents BIGINT DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'USD',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(owner_type, owner_id)
);

-- Create wallet_ledger table
CREATE TABLE IF NOT EXISTS wallet_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE RESTRICT,
    type VARCHAR(50) NOT NULL CHECK (type IN (
        'RIDE_DEBIT', 'PAYOUT', 'REFERRAL_CREDIT', 'REFERRAL_REVERSAL', 
        'TIP_CREDIT', 'PROMO_CREDIT', 'ORG_CREDIT', 'ADJUSTMENT'
    )),
    amount_cents BIGINT NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    ride_id UUID NULL,
    meta JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create notification_tokens table
CREATE TABLE IF NOT EXISTS notification_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    platform notification_platform NOT NULL,
    token VARCHAR(500) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_riders_user_id ON riders(user_id);
CREATE INDEX IF NOT EXISTS idx_drivers_user_id ON drivers(user_id);
CREATE INDEX IF NOT EXISTS idx_drivers_stripe_account_id ON drivers(stripe_account_id);
CREATE INDEX IF NOT EXISTS idx_drivers_is_active ON drivers(is_active);
CREATE INDEX IF NOT EXISTS idx_businesses_name ON businesses(name);
CREATE INDEX IF NOT EXISTS idx_businesses_billing_mode ON businesses(billing_mode);
CREATE INDEX IF NOT EXISTS idx_wallets_owner ON wallets(owner_type, owner_id);
CREATE INDEX IF NOT EXISTS idx_wallet_ledger_wallet_id ON wallet_ledger(wallet_id);
CREATE INDEX IF NOT EXISTS idx_wallet_ledger_created_at ON wallet_ledger(created_at);
CREATE INDEX IF NOT EXISTS idx_wallet_ledger_ride_id ON wallet_ledger(ride_id);
CREATE INDEX IF NOT EXISTS idx_notification_tokens_user_id ON notification_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_tokens_platform ON notification_tokens(platform);

COMMIT;

-- +migrate Down
BEGIN;

-- Drop indexes
DROP INDEX IF EXISTS idx_notification_tokens_platform;
DROP INDEX IF EXISTS idx_notification_tokens_user_id;
DROP INDEX IF EXISTS idx_wallet_ledger_ride_id;
DROP INDEX IF EXISTS idx_wallet_ledger_created_at;
DROP INDEX IF EXISTS idx_wallet_ledger_wallet_id;
DROP INDEX IF EXISTS idx_wallets_owner;
DROP INDEX IF EXISTS idx_businesses_billing_mode;
DROP INDEX IF EXISTS idx_businesses_name;
DROP INDEX IF EXISTS idx_drivers_is_active;
DROP INDEX IF EXISTS idx_drivers_stripe_account_id;
DROP INDEX IF EXISTS idx_drivers_user_id;
DROP INDEX IF EXISTS idx_riders_user_id;
DROP INDEX IF EXISTS idx_users_role;
DROP INDEX IF EXISTS idx_users_phone;
DROP INDEX IF EXISTS idx_users_email;

-- Drop tables
DROP TABLE IF EXISTS notification_tokens;
DROP TABLE IF EXISTS wallet_ledger;
DROP TABLE IF EXISTS wallets;
DROP TABLE IF EXISTS businesses;
DROP TABLE IF EXISTS drivers;
DROP TABLE IF EXISTS riders;
DROP TABLE IF EXISTS users;

-- Drop types
DROP TYPE IF EXISTS notification_platform;
DROP TYPE IF EXISTS billing_mode;
DROP TYPE IF EXISTS user_role;

COMMIT;
