-- Add location-related fields to rides table
ALTER TABLE rides 
ADD COLUMN IF NOT EXISTS pickup_coordinates POINT,
ADD COLUMN IF NOT EXISTS dropoff_coordinates POINT,
ADD COLUMN IF NOT EXISTS pickup_place_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS dropoff_place_id VARCHAR(255),
ADD COLUMN IF NOT EXISTS route_polyline TEXT,
ADD COLUMN IF NOT EXISTS estimated_distance_km DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS estimated_duration_minutes INTEGER;

-- Add location fields to users table for current location tracking
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS current_location POINT,
ADD COLUMN IF NOT EXISTS location_updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Create index for location-based queries
CREATE INDEX IF NOT EXISTS idx_rides_pickup_coordinates ON rides USING GIST (pickup_coordinates);
CREATE INDEX IF NOT EXISTS idx_rides_dropoff_coordinates ON rides USING GIST (dropoff_coordinates);
CREATE INDEX IF NOT EXISTS idx_users_current_location ON users USING GIST (current_location);

-- Add comments for documentation
COMMENT ON COLUMN rides.pickup_coordinates IS 'GPS coordinates of pickup location (lat, lng)';
COMMENT ON COLUMN rides.dropoff_coordinates IS 'GPS coordinates of dropoff location (lat, lng)';
COMMENT ON COLUMN rides.pickup_place_id IS 'Google Places API place ID for pickup location';
COMMENT ON COLUMN rides.dropoff_place_id IS 'Google Places API place ID for dropoff location';
COMMENT ON COLUMN rides.route_polyline IS 'Encoded polyline string for the route';
COMMENT ON COLUMN rides.estimated_distance_km IS 'Estimated distance in kilometers';
COMMENT ON COLUMN rides.estimated_duration_minutes IS 'Estimated duration in minutes';
COMMENT ON COLUMN users.current_location IS 'Current GPS location of user (lat, lng)';
COMMENT ON COLUMN users.location_updated_at IS 'Timestamp when location was last updated';
