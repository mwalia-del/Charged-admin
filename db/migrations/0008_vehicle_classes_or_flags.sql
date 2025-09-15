-- +migrate Up
BEGIN;

-- Create vehicle_classes table (enhanced version of existing)
CREATE TABLE IF NOT EXISTS vehicle_classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    is_enabled BOOLEAN DEFAULT TRUE,
    base_fare_cents INTEGER NOT NULL DEFAULT 0,
    per_km_cents INTEGER NOT NULL DEFAULT 0,
    per_min_cents INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create feature_flags table for dynamic configuration
CREATE TABLE IF NOT EXISTS feature_flags (
    key VARCHAR(100) PRIMARY KEY,
    value_json JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_vehicle_classes_code ON vehicle_classes(code);
CREATE INDEX IF NOT EXISTS idx_vehicle_classes_is_enabled ON vehicle_classes(is_enabled);
CREATE INDEX IF NOT EXISTS idx_vehicle_classes_updated_at ON vehicle_classes(updated_at);
CREATE INDEX IF NOT EXISTS idx_feature_flags_updated_at ON feature_flags(updated_at);

-- Add constraints
ALTER TABLE vehicle_classes ADD CONSTRAINT check_vehicle_classes_positive_fares 
    CHECK (base_fare_cents >= 0 AND per_km_cents >= 0 AND per_min_cents >= 0);

-- Insert default vehicle classes if they don't exist
INSERT INTO vehicle_classes (code, display_name, is_enabled, base_fare_cents, per_km_cents, per_min_cents) VALUES
('charged_x', 'Charged X', TRUE, 500, 180, 25),
('charged_black', 'Charged Black', TRUE, 600, 200, 30),
('charged_xl', 'Charged XL', FALSE, 800, 250, 35)
ON CONFLICT (code) DO NOTHING;

-- Insert default feature flags
INSERT INTO feature_flags (key, value_json) VALUES
('vehicle_class_overrides', '{"charged_xl": {"is_enabled": false}}'),
('referral_system', '{"enabled": true, "tier_1_amount_cents": 500, "tier_2_amount_cents": 1000}'),
('tip_system', '{"enabled": true, "max_tip_percent": 50}'),
('promotion_system', '{"enabled": true, "max_global_cap": 10000}')
ON CONFLICT (key) DO NOTHING;

COMMIT;

-- +migrate Down
BEGIN;

-- Drop constraints
ALTER TABLE vehicle_classes DROP CONSTRAINT IF EXISTS check_vehicle_classes_positive_fares;

-- Drop indexes
DROP INDEX IF EXISTS idx_feature_flags_updated_at;
DROP INDEX IF EXISTS idx_vehicle_classes_updated_at;
DROP INDEX IF EXISTS idx_vehicle_classes_is_enabled;
DROP INDEX IF EXISTS idx_vehicle_classes_code;

-- Drop tables
DROP TABLE IF EXISTS feature_flags;
DROP TABLE IF EXISTS vehicle_classes;

COMMIT;
