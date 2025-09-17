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

-- Create businesses table (new)
CREATE TABLE IF NOT EXISTS businesses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(20),
    billing_mode billing_mode NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create wallets table (new)
CREATE TABLE IF NOT EXISTS wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_type VARCHAR(20) NOT NULL CHECK (owner_type IN ('rider', 'driver', 'business')),
    owner_id INTEGER NOT NULL, -- Reference to existing users.id (integer)
    balance_cents BIGINT DEFAULT 0,
    currency VARCHAR(3) DEFAULT 'USD',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(owner_type, owner_id)
);

-- Create wallet_ledger table (new)
CREATE TABLE IF NOT EXISTS wallet_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE RESTRICT,
    type VARCHAR(50) NOT NULL CHECK (type IN (
        'RIDE_DEBIT', 'PAYOUT', 'REFERRAL_CREDIT', 'REFERRAL_REVERSAL', 
        'TIP_CREDIT', 'PROMO_CREDIT', 'ORG_CREDIT', 'ADJUSTMENT'
    )),
    amount_cents BIGINT NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    ride_id INTEGER NULL REFERENCES rides(id) ON DELETE SET NULL,
    meta JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create notification_tokens table (new)
CREATE TABLE IF NOT EXISTS notification_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    platform notification_platform NOT NULL,
    token VARCHAR(500) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
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

-- Drop tables
DROP TABLE IF EXISTS notification_tokens;
DROP TABLE IF EXISTS wallet_ledger;
DROP TABLE IF EXISTS wallets;
DROP TABLE IF EXISTS businesses;

-- Drop types
DROP TYPE IF EXISTS notification_platform;
DROP TYPE IF EXISTS billing_mode;
DROP TYPE IF EXISTS user_role;

COMMIT;
