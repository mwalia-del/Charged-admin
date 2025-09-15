-- Migration: Add vehicle_classes table
-- This migration creates the vehicle_classes table to support the admin dashboard

-- Create vehicle_classes table
CREATE TABLE IF NOT EXISTS vehicle_classes (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    is_enabled BOOLEAN DEFAULT true,
    base_fare_cents INTEGER NOT NULL DEFAULT 0,
    per_km_cents INTEGER NOT NULL DEFAULT 0,
    per_min_cents INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on code for faster lookups
CREATE INDEX IF NOT EXISTS idx_vehicle_classes_code ON vehicle_classes(code);

-- Create index on is_enabled for filtering
CREATE INDEX IF NOT EXISTS idx_vehicle_classes_enabled ON vehicle_classes(is_enabled);

-- Insert default vehicle classes
INSERT INTO vehicle_classes (code, display_name, is_enabled, base_fare_cents, per_km_cents, per_min_cents) VALUES
('charged_x', 'Charged X', true, 500, 180, 25),
('charged_black', 'Charged Black', true, 600, 200, 30),
('charged_xl', 'Charged XL', false, 800, 250, 35)
ON CONFLICT (code) DO NOTHING;

-- Add comment to table
COMMENT ON TABLE vehicle_classes IS 'Vehicle classes for ride pricing and availability';
COMMENT ON COLUMN vehicle_classes.code IS 'Unique identifier for the vehicle class (e.g., charged_x, charged_black)';
COMMENT ON COLUMN vehicle_classes.display_name IS 'Human-readable name for the vehicle class';
COMMENT ON COLUMN vehicle_classes.is_enabled IS 'Whether this vehicle class is currently available for booking';
COMMENT ON COLUMN vehicle_classes.base_fare_cents IS 'Base fare in cents';
COMMENT ON COLUMN vehicle_classes.per_km_cents IS 'Price per kilometer in cents';
COMMENT ON COLUMN vehicle_classes.per_min_cents IS 'Price per minute in cents';
