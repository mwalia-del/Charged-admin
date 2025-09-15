-- +migrate Up
BEGIN;

-- Create business_rewards table
CREATE TABLE IF NOT EXISTS business_rewards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES businesses(id) ON DELETE RESTRICT,
    points BIGINT DEFAULT 0,
    lifetime_points BIGINT DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(org_id)
);

-- Create business_rewards_ledger table
CREATE TABLE IF NOT EXISTS business_rewards_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES businesses(id) ON DELETE RESTRICT,
    ride_id UUID REFERENCES rides(id) ON DELETE SET NULL,
    delta_points BIGINT NOT NULL,
    reason TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_business_rewards_org_id ON business_rewards(org_id);
CREATE INDEX IF NOT EXISTS idx_business_rewards_ledger_org_id ON business_rewards_ledger(org_id);
CREATE INDEX IF NOT EXISTS idx_business_rewards_ledger_ride_id ON business_rewards_ledger(ride_id);
CREATE INDEX IF NOT EXISTS idx_business_rewards_ledger_created_at ON business_rewards_ledger(created_at);
CREATE INDEX IF NOT EXISTS idx_business_rewards_ledger_org_created_at ON business_rewards_ledger(org_id, created_at);

-- Add constraints
ALTER TABLE business_rewards ADD CONSTRAINT check_business_rewards_points_non_negative 
    CHECK (points >= 0);

ALTER TABLE business_rewards ADD CONSTRAINT check_business_rewards_lifetime_points_non_negative 
    CHECK (lifetime_points >= 0);

ALTER TABLE business_rewards ADD CONSTRAINT check_business_rewards_lifetime_gte_current 
    CHECK (lifetime_points >= points);

COMMIT;

-- +migrate Down
BEGIN;

-- Drop constraints
ALTER TABLE business_rewards DROP CONSTRAINT IF EXISTS check_business_rewards_lifetime_gte_current;
ALTER TABLE business_rewards DROP CONSTRAINT IF EXISTS check_business_rewards_lifetime_points_non_negative;
ALTER TABLE business_rewards DROP CONSTRAINT IF EXISTS check_business_rewards_points_non_negative;

-- Drop indexes
DROP INDEX IF EXISTS idx_business_rewards_ledger_org_created_at;
DROP INDEX IF EXISTS idx_business_rewards_ledger_created_at;
DROP INDEX IF EXISTS idx_business_rewards_ledger_ride_id;
DROP INDEX IF EXISTS idx_business_rewards_ledger_org_id;
DROP INDEX IF EXISTS idx_business_rewards_org_id;

-- Drop tables
DROP TABLE IF EXISTS business_rewards_ledger;
DROP TABLE IF EXISTS business_rewards;

COMMIT;
