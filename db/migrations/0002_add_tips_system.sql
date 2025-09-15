-- +migrate Up
BEGIN;

-- Create tip status enum
DO $$ BEGIN
    CREATE TYPE tip_status AS ENUM (
        'authorized', 'settled', 'refunded', 'void'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create tips table
CREATE TABLE IF NOT EXISTS tips (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ride_id INTEGER NOT NULL REFERENCES rides(id) ON DELETE RESTRICT,
    rider_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    driver_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    amount_cents BIGINT NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status tip_status NOT NULL DEFAULT 'authorized',
    payment_intent_id VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(ride_id, rider_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_tips_ride_id ON tips(ride_id);
CREATE INDEX IF NOT EXISTS idx_tips_rider_id ON tips(rider_id);
CREATE INDEX IF NOT EXISTS idx_tips_driver_id ON tips(driver_id);
CREATE INDEX IF NOT EXISTS idx_tips_status ON tips(status);
CREATE INDEX IF NOT EXISTS idx_tips_payment_intent_id ON tips(payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_tips_created_at ON tips(created_at);

-- Add constraint to ensure positive tip amount
ALTER TABLE tips ADD CONSTRAINT check_tips_amount_positive 
    CHECK (amount_cents > 0);

COMMIT;

-- +migrate Down
BEGIN;

-- Drop constraints
ALTER TABLE tips DROP CONSTRAINT IF EXISTS check_tips_amount_positive;

-- Drop indexes
DROP INDEX IF EXISTS idx_tips_created_at;
DROP INDEX IF EXISTS idx_tips_payment_intent_id;
DROP INDEX IF EXISTS idx_tips_status;
DROP INDEX IF EXISTS idx_tips_driver_id;
DROP INDEX IF EXISTS idx_tips_rider_id;
DROP INDEX IF EXISTS idx_tips_ride_id;

-- Drop tables
DROP TABLE IF EXISTS tips;

-- Drop types
DROP TYPE IF EXISTS tip_status;

COMMIT;
