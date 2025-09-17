-- +migrate Up
BEGIN;

-- Create promotion audience enum
DO $$ BEGIN
    CREATE TYPE promotion_audience AS ENUM ('rider', 'driver', 'business');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create promotion reward type enum
DO $$ BEGIN
    CREATE TYPE promotion_reward_type AS ENUM (
        'ride_credit', 'cash_bonus', 'org_credit', 'percent_discount', 'fixed_discount'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create promotions table
CREATE TABLE IF NOT EXISTS promotions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    audience promotion_audience NOT NULL,
    reward_type promotion_reward_type NOT NULL,
    value_cents BIGINT,
    percent_off INTEGER,
    start_at TIMESTAMPTZ NOT NULL,
    end_at TIMESTAMPTZ NOT NULL,
    priority INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT FALSE,
    max_uses_per_user INTEGER,
    global_cap INTEGER,
    code VARCHAR(50) UNIQUE,
    criteria_json JSONB,
    created_by INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    updated_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create promotion_redemptions table
CREATE TABLE IF NOT EXISTS promotion_redemptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    promotion_id UUID NOT NULL REFERENCES promotions(id) ON DELETE RESTRICT,
    actor_type promotion_audience NOT NULL,
    actor_id INTEGER NOT NULL, -- Reference to existing users.id (integer)
    ride_id INTEGER REFERENCES rides(id) ON DELETE SET NULL,
    amount_cents BIGINT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_promotions_audience ON promotions(audience);
CREATE INDEX IF NOT EXISTS idx_promotions_reward_type ON promotions(reward_type);
CREATE INDEX IF NOT EXISTS idx_promotions_is_active ON promotions(is_active);
CREATE INDEX IF NOT EXISTS idx_promotions_start_at ON promotions(start_at);
CREATE INDEX IF NOT EXISTS idx_promotions_end_at ON promotions(end_at);
CREATE INDEX IF NOT EXISTS idx_promotions_priority ON promotions(priority);
CREATE INDEX IF NOT EXISTS idx_promotions_code ON promotions(code);
CREATE INDEX IF NOT EXISTS idx_promotions_created_by ON promotions(created_by);
CREATE INDEX IF NOT EXISTS idx_promotions_updated_by ON promotions(updated_by);
CREATE INDEX IF NOT EXISTS idx_promotions_active_period ON promotions(is_active, start_at, end_at, audience, priority);
CREATE INDEX IF NOT EXISTS idx_promotions_criteria_json ON promotions USING GIN (criteria_json);

CREATE INDEX IF NOT EXISTS idx_promotion_redemptions_promotion_id ON promotion_redemptions(promotion_id);
CREATE INDEX IF NOT EXISTS idx_promotion_redemptions_actor ON promotion_redemptions(actor_type, actor_id);
CREATE INDEX IF NOT EXISTS idx_promotion_redemptions_ride_id ON promotion_redemptions(ride_id);
CREATE INDEX IF NOT EXISTS idx_promotion_redemptions_created_at ON promotion_redemptions(created_at);
CREATE INDEX IF NOT EXISTS idx_promotion_redemptions_promotion_actor ON promotion_redemptions(promotion_id, actor_id);
CREATE INDEX IF NOT EXISTS idx_promotion_redemptions_promotion_created_at ON promotion_redemptions(promotion_id, created_at);

-- Add constraints
ALTER TABLE promotions ADD CONSTRAINT check_promotions_value_or_percent 
    CHECK ((value_cents IS NOT NULL AND percent_off IS NULL) OR (value_cents IS NULL AND percent_off IS NOT NULL));

ALTER TABLE promotions ADD CONSTRAINT check_promotions_percent_range 
    CHECK (percent_off IS NULL OR (percent_off >= 0 AND percent_off <= 100));

ALTER TABLE promotions ADD CONSTRAINT check_promotions_positive_values 
    CHECK (value_cents IS NULL OR value_cents > 0);

ALTER TABLE promotions ADD CONSTRAINT check_promotions_positive_caps 
    CHECK (max_uses_per_user IS NULL OR max_uses_per_user > 0);

ALTER TABLE promotions ADD CONSTRAINT check_promotions_positive_global_cap 
    CHECK (global_cap IS NULL OR global_cap > 0);

ALTER TABLE promotions ADD CONSTRAINT check_promotions_valid_period 
    CHECK (end_at > start_at);

ALTER TABLE promotion_redemptions ADD CONSTRAINT check_promotion_redemptions_amount_positive 
    CHECK (amount_cents > 0);

COMMIT;

-- +migrate Down
BEGIN;

-- Drop constraints
ALTER TABLE promotion_redemptions DROP CONSTRAINT IF EXISTS check_promotion_redemptions_amount_positive;
ALTER TABLE promotions DROP CONSTRAINT IF EXISTS check_promotions_valid_period;
ALTER TABLE promotions DROP CONSTRAINT IF EXISTS check_promotions_positive_global_cap;
ALTER TABLE promotions DROP CONSTRAINT IF EXISTS check_promotions_positive_caps;
ALTER TABLE promotions DROP CONSTRAINT IF EXISTS check_promotions_positive_values;
ALTER TABLE promotions DROP CONSTRAINT IF EXISTS check_promotions_percent_range;
ALTER TABLE promotions DROP CONSTRAINT IF EXISTS check_promotions_value_or_percent;

-- Drop indexes
DROP INDEX IF EXISTS idx_promotion_redemptions_promotion_created_at;
DROP INDEX IF EXISTS idx_promotion_redemptions_promotion_actor;
DROP INDEX IF EXISTS idx_promotion_redemptions_created_at;
DROP INDEX IF EXISTS idx_promotion_redemptions_ride_id;
DROP INDEX IF EXISTS idx_promotion_redemptions_actor;
DROP INDEX IF EXISTS idx_promotion_redemptions_promotion_id;
DROP INDEX IF EXISTS idx_promotions_criteria_json;
DROP INDEX IF EXISTS idx_promotions_active_period;
DROP INDEX IF EXISTS idx_promotions_updated_by;
DROP INDEX IF EXISTS idx_promotions_created_by;
DROP INDEX IF EXISTS idx_promotions_code;
DROP INDEX IF EXISTS idx_promotions_priority;
DROP INDEX IF EXISTS idx_promotions_end_at;
DROP INDEX IF EXISTS idx_promotions_start_at;
DROP INDEX IF EXISTS idx_promotions_is_active;
DROP INDEX IF EXISTS idx_promotions_reward_type;
DROP INDEX IF EXISTS idx_promotions_audience;

-- Drop tables
DROP TABLE IF EXISTS promotion_redemptions;
DROP TABLE IF EXISTS promotions;

-- Drop types
DROP TYPE IF EXISTS promotion_reward_type;
DROP TYPE IF EXISTS promotion_audience;

COMMIT;
