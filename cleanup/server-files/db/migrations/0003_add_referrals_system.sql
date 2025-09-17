-- +migrate Up
BEGIN;

-- Create referrer type enum
DO $$ BEGIN
    CREATE TYPE referrer_type AS ENUM ('driver', 'rider');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create referral status enum
DO $$ BEGIN
    CREATE TYPE referral_status AS ENUM (
        'issued', 'voided', 'refunded'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create referrals table
CREATE TABLE IF NOT EXISTS referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    referred_rider_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    referrer_type referrer_type NOT NULL,
    referrer_id INTEGER NOT NULL, -- Reference to existing users.id (integer)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(referred_rider_id)
);

-- Create referral_issuances table
CREATE TABLE IF NOT EXISTS referral_issuances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ride_id INTEGER NOT NULL REFERENCES rides(id) ON DELETE RESTRICT,
    referred_rider_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    referrer_type referrer_type NOT NULL,
    referrer_id INTEGER NOT NULL, -- Reference to existing users.id (integer)
    amount_cents BIGINT NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    tier INTEGER NOT NULL DEFAULT 1,
    status referral_status NOT NULL DEFAULT 'issued',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(ride_id, referred_rider_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_referrals_referred_rider_id ON referrals(referred_rider_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_type, referrer_id);
CREATE INDEX IF NOT EXISTS idx_referral_issuances_ride_id ON referral_issuances(ride_id);
CREATE INDEX IF NOT EXISTS idx_referral_issuances_referred_rider_id ON referral_issuances(referred_rider_id);
CREATE INDEX IF NOT EXISTS idx_referral_issuances_referrer ON referral_issuances(referrer_type, referrer_id);
CREATE INDEX IF NOT EXISTS idx_referral_issuances_status ON referral_issuances(status);
CREATE INDEX IF NOT EXISTS idx_referral_issuances_created_at ON referral_issuances(created_at);

-- Add constraints
ALTER TABLE referral_issuances ADD CONSTRAINT check_referral_issuances_amount_positive 
    CHECK (amount_cents > 0);

ALTER TABLE referral_issuances ADD CONSTRAINT check_referral_issuances_tier_positive 
    CHECK (tier > 0);

COMMIT;

-- +migrate Down
BEGIN;

-- Drop constraints
ALTER TABLE referral_issuances DROP CONSTRAINT IF EXISTS check_referral_issuances_tier_positive;
ALTER TABLE referral_issuances DROP CONSTRAINT IF EXISTS check_referral_issuances_amount_positive;

-- Drop indexes
DROP INDEX IF EXISTS idx_referral_issuances_created_at;
DROP INDEX IF EXISTS idx_referral_issuances_status;
DROP INDEX IF EXISTS idx_referral_issuances_referrer;
DROP INDEX IF EXISTS idx_referral_issuances_referred_rider_id;
DROP INDEX IF EXISTS idx_referral_issuances_ride_id;
DROP INDEX IF EXISTS idx_referrals_referrer;
DROP INDEX IF EXISTS idx_referrals_referred_rider_id;

-- Drop tables
DROP TABLE IF EXISTS referral_issuances;
DROP TABLE IF EXISTS referrals;

-- Drop types
DROP TYPE IF EXISTS referral_status;
DROP TYPE IF EXISTS referrer_type;

COMMIT;
