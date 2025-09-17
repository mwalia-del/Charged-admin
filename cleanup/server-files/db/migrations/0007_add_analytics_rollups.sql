-- +migrate Up
BEGIN;

-- Create ride_daily_rollup table for analytics
CREATE TABLE IF NOT EXISTS ride_daily_rollup (
    date DATE NOT NULL,
    org_id UUID REFERENCES businesses(id) ON DELETE CASCADE,
    total_rides INTEGER DEFAULT 0,
    total_amount_cents BIGINT DEFAULT 0,
    total_distance_km DECIMAL(12,2) DEFAULT 0,
    total_duration_minutes INTEGER DEFAULT 0,
    avg_rating DECIMAL(3,2),
    completed_rides INTEGER DEFAULT 0,
    cancelled_rides INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (date, org_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_ride_daily_rollup_date ON ride_daily_rollup(date);
CREATE INDEX IF NOT EXISTS idx_ride_daily_rollup_org_id ON ride_daily_rollup(org_id);
CREATE INDEX IF NOT EXISTS idx_ride_daily_rollup_created_at ON ride_daily_rollup(created_at);

-- Add constraints
ALTER TABLE ride_daily_rollup ADD CONSTRAINT check_ride_daily_rollup_positive_values 
    CHECK (total_rides >= 0 AND total_amount_cents >= 0 AND total_distance_km >= 0 AND total_duration_minutes >= 0);

ALTER TABLE ride_daily_rollup ADD CONSTRAINT check_ride_daily_rollup_rating_range 
    CHECK (avg_rating IS NULL OR (avg_rating >= 0 AND avg_rating <= 5));

ALTER TABLE ride_daily_rollup ADD CONSTRAINT check_ride_daily_rollup_completed_cancelled 
    CHECK (completed_rides >= 0 AND cancelled_rides >= 0 AND (completed_rides + cancelled_rides) <= total_rides);

COMMIT;

-- +migrate Down
BEGIN;

-- Drop constraints
ALTER TABLE ride_daily_rollup DROP CONSTRAINT IF EXISTS check_ride_daily_rollup_completed_cancelled;
ALTER TABLE ride_daily_rollup DROP CONSTRAINT IF EXISTS check_ride_daily_rollup_rating_range;
ALTER TABLE ride_daily_rollup DROP CONSTRAINT IF EXISTS check_ride_daily_rollup_positive_values;

-- Drop indexes
DROP INDEX IF EXISTS idx_ride_daily_rollup_created_at;
DROP INDEX IF EXISTS idx_ride_daily_rollup_org_id;
DROP INDEX IF EXISTS idx_ride_daily_rollup_date;

-- Drop tables
DROP TABLE IF EXISTS ride_daily_rollup;

COMMIT;
