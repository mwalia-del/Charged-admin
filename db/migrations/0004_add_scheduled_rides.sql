-- +migrate Up
BEGIN;

-- Create scheduled ride status enum
DO $$ BEGIN
    CREATE TYPE scheduled_ride_status AS ENUM (
        'scheduled', 'preparing', 'dispatching', 'converted', 'cancelled', 'failed'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create scheduled ride source enum
DO $$ BEGIN
    CREATE TYPE scheduled_ride_source AS ENUM ('rider', 'business');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create scheduled_rides table
CREATE TABLE IF NOT EXISTS scheduled_rides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rider_id INTEGER NULL REFERENCES users(id) ON DELETE RESTRICT,
    org_id UUID NULL REFERENCES businesses(id) ON DELETE RESTRICT,
    driver_id INTEGER NULL REFERENCES users(id) ON DELETE SET NULL,
    pickup_lat DECIMAL(10,7) NOT NULL,
    pickup_lng DECIMAL(10,7) NOT NULL,
    pickup_address TEXT NOT NULL,
    dropoff_lat DECIMAL(10,7) NOT NULL,
    dropoff_lng DECIMAL(10,7) NOT NULL,
    dropoff_address TEXT NOT NULL,
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    scheduled_for TIMESTAMPTZ NOT NULL,
    window_minutes INTEGER DEFAULT 10,
    notes TEXT,
    est_fare_cents BIGINT,
    payment_intent_id VARCHAR(255),
    status scheduled_ride_status NOT NULL DEFAULT 'scheduled',
    source scheduled_ride_source NOT NULL,
    created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_scheduled_rides_rider_id ON scheduled_rides(rider_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_rides_org_id ON scheduled_rides(org_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_rides_driver_id ON scheduled_rides(driver_id);
CREATE INDEX IF NOT EXISTS idx_scheduled_rides_status ON scheduled_rides(status);
CREATE INDEX IF NOT EXISTS idx_scheduled_rides_scheduled_for ON scheduled_rides(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_scheduled_rides_source ON scheduled_rides(source);
CREATE INDEX IF NOT EXISTS idx_scheduled_rides_created_by ON scheduled_rides(created_by);
CREATE INDEX IF NOT EXISTS idx_scheduled_rides_created_at ON scheduled_rides(created_at);
CREATE INDEX IF NOT EXISTS idx_scheduled_rides_status_scheduled_for ON scheduled_rides(status, scheduled_for);

-- Add constraint to ensure exactly one of rider_id or org_id is non-null
ALTER TABLE scheduled_rides ADD CONSTRAINT check_scheduled_rides_rider_or_org 
    CHECK ((rider_id IS NOT NULL AND org_id IS NULL) OR (rider_id IS NULL AND org_id IS NOT NULL));

-- Add constraint to ensure positive window minutes
ALTER TABLE scheduled_rides ADD CONSTRAINT check_scheduled_rides_window_positive 
    CHECK (window_minutes > 0);

-- Add constraint to ensure scheduled_for is in the future
ALTER TABLE scheduled_rides ADD CONSTRAINT check_scheduled_rides_future_schedule 
    CHECK (scheduled_for > NOW());

COMMIT;

-- +migrate Down
BEGIN;

-- Drop constraints
ALTER TABLE scheduled_rides DROP CONSTRAINT IF EXISTS check_scheduled_rides_future_schedule;
ALTER TABLE scheduled_rides DROP CONSTRAINT IF EXISTS check_scheduled_rides_window_positive;
ALTER TABLE scheduled_rides DROP CONSTRAINT IF EXISTS check_scheduled_rides_rider_or_org;

-- Drop indexes
DROP INDEX IF EXISTS idx_scheduled_rides_status_scheduled_for;
DROP INDEX IF EXISTS idx_scheduled_rides_created_at;
DROP INDEX IF EXISTS idx_scheduled_rides_created_by;
DROP INDEX IF EXISTS idx_scheduled_rides_source;
DROP INDEX IF EXISTS idx_scheduled_rides_scheduled_for;
DROP INDEX IF EXISTS idx_scheduled_rides_status;
DROP INDEX IF EXISTS idx_scheduled_rides_driver_id;
DROP INDEX IF EXISTS idx_scheduled_rides_org_id;
DROP INDEX IF EXISTS idx_scheduled_rides_rider_id;

-- Drop tables
DROP TABLE IF EXISTS scheduled_rides;

-- Drop types
DROP TYPE IF EXISTS scheduled_ride_source;
DROP TYPE IF EXISTS scheduled_ride_status;

COMMIT;
