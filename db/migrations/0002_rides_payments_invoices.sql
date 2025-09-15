-- +migrate Up
BEGIN;

-- Create ride status enum
DO $$ BEGIN
    CREATE TYPE ride_status AS ENUM (
        'requested', 'accepted', 'arrived', 'started', 
        'completed', 'cancelled', 'failed'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create payment status enum
DO $$ BEGIN
    CREATE TYPE payment_status AS ENUM (
        'pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create invoice status enum
DO $$ BEGIN
    CREATE TYPE invoice_status AS ENUM (
        'draft', 'sent', 'paid', 'void'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create rides table
CREATE TABLE IF NOT EXISTS rides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ride_number VARCHAR(50) UNIQUE NOT NULL,
    rider_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    driver_id UUID NULL REFERENCES users(id) ON DELETE SET NULL,
    org_id UUID NULL REFERENCES businesses(id) ON DELETE SET NULL,
    vehicle_class_code VARCHAR(50) NOT NULL,
    status ride_status NOT NULL DEFAULT 'requested',
    pickup_lat DECIMAL(10,7) NOT NULL,
    pickup_lng DECIMAL(10,7) NOT NULL,
    pickup_address TEXT NOT NULL,
    dropoff_lat DECIMAL(10,7) NOT NULL,
    dropoff_lng DECIMAL(10,7) NOT NULL,
    dropoff_address TEXT NOT NULL,
    distance_km DECIMAL(10,2),
    duration_minutes INTEGER,
    amount_cents BIGINT NOT NULL DEFAULT 0,
    payment_status payment_status NOT NULL DEFAULT 'pending',
    scheduled_ride_id UUID NULL,
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    accepted_at TIMESTAMPTZ NULL,
    arrived_at TIMESTAMPTZ NULL,
    started_at TIMESTAMPTZ NULL,
    completed_at TIMESTAMPTZ NULL,
    cancelled_at TIMESTAMPTZ NULL,
    cancellation_reason TEXT,
    rating DECIMAL(3,2),
    review TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ride_id UUID NOT NULL REFERENCES rides(id) ON DELETE RESTRICT,
    payment_intent_id VARCHAR(255) UNIQUE NOT NULL,
    amount_cents BIGINT NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    status payment_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create invoices table
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    org_id UUID NOT NULL REFERENCES businesses(id) ON DELETE RESTRICT,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    period_start TIMESTAMPTZ NOT NULL,
    period_end TIMESTAMPTZ NOT NULL,
    total_cents BIGINT NOT NULL DEFAULT 0,
    status invoice_status NOT NULL DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create invoice_line_items table
CREATE TABLE IF NOT EXISTS invoice_line_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    ride_id UUID NOT NULL REFERENCES rides(id) ON DELETE RESTRICT,
    amount_cents BIGINT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_rides_ride_number ON rides(ride_number);
CREATE INDEX IF NOT EXISTS idx_rides_rider_id ON rides(rider_id);
CREATE INDEX IF NOT EXISTS idx_rides_driver_id ON rides(driver_id);
CREATE INDEX IF NOT EXISTS idx_rides_org_id ON rides(org_id);
CREATE INDEX IF NOT EXISTS idx_rides_status ON rides(status);
CREATE INDEX IF NOT EXISTS idx_rides_payment_status ON rides(payment_status);
CREATE INDEX IF NOT EXISTS idx_rides_requested_at ON rides(requested_at);
CREATE INDEX IF NOT EXISTS idx_rides_scheduled_ride_id ON rides(scheduled_ride_id);
CREATE INDEX IF NOT EXISTS idx_payments_ride_id ON payments(ride_id);
CREATE INDEX IF NOT EXISTS idx_payments_payment_intent_id ON payments(payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_invoices_org_id ON invoices(org_id);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_period ON invoices(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_invoice_line_items_invoice_id ON invoice_line_items(invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoice_line_items_ride_id ON invoice_line_items(ride_id);

-- Add constraint to ensure exactly one of rider_id or org_id is non-null
ALTER TABLE rides ADD CONSTRAINT check_rides_rider_or_org 
    CHECK ((rider_id IS NOT NULL AND org_id IS NULL) OR (rider_id IS NULL AND org_id IS NOT NULL));

COMMIT;

-- +migrate Down
BEGIN;

-- Drop constraints
ALTER TABLE rides DROP CONSTRAINT IF EXISTS check_rides_rider_or_org;

-- Drop indexes
DROP INDEX IF EXISTS idx_invoice_line_items_ride_id;
DROP INDEX IF EXISTS idx_invoice_line_items_invoice_id;
DROP INDEX IF EXISTS idx_invoices_period;
DROP INDEX IF EXISTS idx_invoices_status;
DROP INDEX IF EXISTS idx_invoices_invoice_number;
DROP INDEX IF EXISTS idx_invoices_org_id;
DROP INDEX IF EXISTS idx_payments_status;
DROP INDEX IF EXISTS idx_payments_payment_intent_id;
DROP INDEX IF EXISTS idx_payments_ride_id;
DROP INDEX IF EXISTS idx_rides_scheduled_ride_id;
DROP INDEX IF EXISTS idx_rides_requested_at;
DROP INDEX IF EXISTS idx_rides_payment_status;
DROP INDEX IF EXISTS idx_rides_status;
DROP INDEX IF EXISTS idx_rides_org_id;
DROP INDEX IF EXISTS idx_rides_driver_id;
DROP INDEX IF EXISTS idx_rides_rider_id;
DROP INDEX IF EXISTS idx_rides_ride_number;

-- Drop tables
DROP TABLE IF EXISTS invoice_line_items;
DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS rides;

-- Drop types
DROP TYPE IF EXISTS invoice_status;
DROP TYPE IF EXISTS payment_status;
DROP TYPE IF EXISTS ride_status;

COMMIT;
