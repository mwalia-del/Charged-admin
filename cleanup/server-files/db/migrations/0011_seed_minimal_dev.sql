-- +migrate Up
BEGIN;

-- Only run this migration in development environment
DO $$
BEGIN
    IF current_setting('server_version_num')::int < 100000 THEN
        -- For older PostgreSQL versions, check if we're in development
        IF current_setting('log_statement') = 'all' THEN
            -- This is a simple heuristic - in production, log_statement is usually 'none'
            RAISE NOTICE 'Skipping seed data - not in development environment';
            RETURN;
        END IF;
    END IF;
    
    -- Check if we're in development by looking for a development flag
    -- This is a simple check - in production, this should not be set
    IF NOT EXISTS (SELECT 1 FROM pg_settings WHERE name = 'application_name' AND setting = 'charged-dev') THEN
        RAISE NOTICE 'Skipping seed data - not in development environment';
        RETURN;
    END IF;
    
    -- Insert development users
    INSERT INTO users (id, email, phone, role, password_hash) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'admin@charged.com', '+1234567890', 'ADMIN', '$2b$10$example_hash'),
    ('550e8400-e29b-41d4-a716-446655440002', 'rider@charged.com', '+1234567891', 'RIDER', '$2b$10$example_hash'),
    ('550e8400-e29b-41d4-a716-446655440003', 'driver@charged.com', '+1234567892', 'DRIVER', '$2b$10$example_hash'),
    ('550e8400-e29b-41d4-a716-446655440004', 'manager@charged.com', '+1234567893', 'MANAGER', '$2b$10$example_hash')
    ON CONFLICT (email) DO NOTHING;

    -- Insert riders
    INSERT INTO riders (id, user_id) VALUES
    ('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002')
    ON CONFLICT (user_id) DO NOTHING;

    -- Insert drivers
    INSERT INTO drivers (id, user_id, license_number, vehicle_make, vehicle_model, vehicle_year, vehicle_color, license_plate, is_verified, is_active) VALUES
    ('650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', 'DL123456', 'Toyota', 'Camry', 2020, 'Silver', 'ABC123', TRUE, TRUE)
    ON CONFLICT (user_id) DO NOTHING;

    -- Insert businesses
    INSERT INTO businesses (id, name, email, phone, billing_mode) VALUES
    ('750e8400-e29b-41d4-a716-446655440001', 'Acme Corp', 'billing@acme.com', '+1234567894', 'invoice'),
    ('750e8400-e29b-41d4-a716-446655440002', 'Tech Startup Inc', 'finance@techstartup.com', '+1234567895', 'credit')
    ON CONFLICT (name) DO NOTHING;

    -- Insert wallets for users
    INSERT INTO wallets (id, owner_type, owner_id, balance_cents, currency) VALUES
    ('850e8400-e29b-41d4-a716-446655440001', 'rider', '650e8400-e29b-41d4-a716-446655440001', 5000, 'USD'),
    ('850e8400-e29b-41d4-a716-446655440002', 'driver', '650e8400-e29b-41d4-a716-446655440002', 0, 'USD'),
    ('850e8400-e29b-41d4-a716-446655440003', 'business', '750e8400-e29b-41d4-a716-446655440001', 10000, 'USD'),
    ('850e8400-e29b-41d4-a716-446655440004', 'business', '750e8400-e29b-41d4-a716-446655440002', 5000, 'USD')
    ON CONFLICT (owner_type, owner_id) DO NOTHING;

    -- Insert notification tokens
    INSERT INTO notification_tokens (id, user_id, platform, token) VALUES
    ('950e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'ios', 'ios_token_123'),
    ('950e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', 'android', 'android_token_123')
    ON CONFLICT (token) DO NOTHING;

    -- Insert sample rides
    INSERT INTO rides (id, ride_number, rider_id, driver_id, vehicle_class_code, status, pickup_lat, pickup_lng, pickup_address, dropoff_lat, dropoff_lng, dropoff_address, distance_km, duration_minutes, amount_cents, payment_status) VALUES
    ('a50e8400-e29b-41d4-a716-446655440001', 'RIDE001', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', 'charged_x', 'completed', 40.7128, -74.0060, '123 Main St, New York, NY', 40.7589, -73.9851, '456 Broadway, New York, NY', 5.2, 15, 1200, 'completed'),
    ('a50e8400-e29b-41d4-a716-446655440002', 'RIDE002', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', 'charged_black', 'completed', 40.7128, -74.0060, '789 Park Ave, New York, NY', 40.7505, -73.9934, '321 5th Ave, New York, NY', 3.8, 12, 1500, 'completed')
    ON CONFLICT (ride_number) DO NOTHING;

    -- Insert sample payments
    INSERT INTO payments (id, ride_id, payment_intent_id, amount_cents, currency, status) VALUES
    ('b50e8400-e29b-41d4-a716-446655440001', 'a50e8400-e29b-41d4-a716-446655440001', 'pi_1234567890', 1200, 'USD', 'completed'),
    ('b50e8400-e29b-41d4-a716-446655440002', 'a50e8400-e29b-41d4-a716-446655440002', 'pi_1234567891', 1500, 'USD', 'completed')
    ON CONFLICT (payment_intent_id) DO NOTHING;

    -- Insert sample tips
    INSERT INTO tips (id, ride_id, rider_id, driver_id, amount_cents, currency, status, payment_intent_id) VALUES
    ('c50e8400-e29b-41d4-a716-446655440001', 'a50e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440003', 200, 'USD', 'settled', 'pi_tip_1234567890')
    ON CONFLICT (ride_id, rider_id) DO NOTHING;

    -- Insert sample referrals
    INSERT INTO referrals (id, referred_rider_id, referrer_type, referrer_id) VALUES
    ('d50e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 'driver', '550e8400-e29b-41d4-a716-446655440003')
    ON CONFLICT (referred_rider_id) DO NOTHING;

    -- Insert sample scheduled rides
    INSERT INTO scheduled_rides (id, rider_id, pickup_lat, pickup_lng, pickup_address, dropoff_lat, dropoff_lng, dropoff_address, scheduled_for, window_minutes, notes, est_fare_cents, status, source, created_by) VALUES
    ('e50e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 40.7128, -74.0060, '123 Main St, New York, NY', 40.7589, -73.9851, '456 Broadway, New York, NY', NOW() + INTERVAL '1 day', 15, 'Airport pickup', 2000, 'scheduled', 'rider', '550e8400-e29b-41d4-a716-446655440002')
    ON CONFLICT DO NOTHING;

    -- Insert sample promotions
    INSERT INTO promotions (id, title, description, audience, reward_type, value_cents, start_at, end_at, priority, is_active, max_uses_per_user, global_cap, code, created_by) VALUES
    ('f50e8400-e29b-41d4-a716-446655440001', 'New Rider Bonus', 'Get $5 off your first ride', 'rider', 'ride_credit', 500, NOW(), NOW() + INTERVAL '30 days', 1, TRUE, 1, 1000, 'NEWRIDER5', '550e8400-e29b-41d4-a716-446655440001'),
    ('f50e8400-e29b-41d4-a716-446655440002', 'Driver Signup Bonus', 'Earn $50 for completing your first 10 rides', 'driver', 'cash_bonus', 5000, NOW(), NOW() + INTERVAL '60 days', 1, TRUE, 1, 100, 'DRIVER50', '550e8400-e29b-41d4-a716-446655440001')
    ON CONFLICT (code) DO NOTHING;

    -- Insert business rewards
    INSERT INTO business_rewards (id, org_id, points, lifetime_points) VALUES
    ('g50e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440001', 1000, 1500),
    ('g50e8400-e29b-41d4-a716-446655440002', '750e8400-e29b-41d4-a716-446655440002', 500, 800)
    ON CONFLICT (org_id) DO NOTHING;

    RAISE NOTICE 'Development seed data inserted successfully';
END $$;

COMMIT;

-- +migrate Down
BEGIN;

-- Remove development seed data
DELETE FROM business_rewards WHERE id IN (
    'g50e8400-e29b-41d4-a716-446655440001',
    'g50e8400-e29b-41d4-a716-446655440002'
);

DELETE FROM promotions WHERE id IN (
    'f50e8400-e29b-41d4-a716-446655440001',
    'f50e8400-e29b-41d4-a716-446655440002'
);

DELETE FROM scheduled_rides WHERE id = 'e50e8400-e29b-41d4-a716-446655440001';

DELETE FROM referrals WHERE id = 'd50e8400-e29b-41d4-a716-446655440001';

DELETE FROM tips WHERE id = 'c50e8400-e29b-41d4-a716-446655440001';

DELETE FROM payments WHERE id IN (
    'b50e8400-e29b-41d4-a716-446655440001',
    'b50e8400-e29b-41d4-a716-446655440002'
);

DELETE FROM rides WHERE id IN (
    'a50e8400-e29b-41d4-a716-446655440001',
    'a50e8400-e29b-41d4-a716-446655440002'
);

DELETE FROM notification_tokens WHERE id IN (
    '950e8400-e29b-41d4-a716-446655440001',
    '950e8400-e29b-41d4-a716-446655440002'
);

DELETE FROM wallets WHERE id IN (
    '850e8400-e29b-41d4-a716-446655440001',
    '850e8400-e29b-41d4-a716-446655440002',
    '850e8400-e29b-41d4-a716-446655440003',
    '850e8400-e29b-41d4-a716-446655440004'
);

DELETE FROM businesses WHERE id IN (
    '750e8400-e29b-41d4-a716-446655440001',
    '750e8400-e29b-41d4-a716-446655440002'
);

DELETE FROM drivers WHERE id = '650e8400-e29b-41d4-a716-446655440002';

DELETE FROM riders WHERE id = '650e8400-e29b-41d4-a716-446655440001';

DELETE FROM users WHERE id IN (
    '550e8400-e29b-41d4-a716-446655440001',
    '550e8400-e29b-41d4-a716-446655440002',
    '550e8400-e29b-41d4-a716-446655440003',
    '550e8400-e29b-41d4-a716-446655440004'
);

COMMIT;
