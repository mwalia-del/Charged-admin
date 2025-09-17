-- +migrate Up
BEGIN;

-- Add foreign key constraint for scheduled_ride_id in rides table
ALTER TABLE rides ADD CONSTRAINT fk_rides_scheduled_ride_id 
    FOREIGN KEY (scheduled_ride_id) REFERENCES scheduled_rides(id) ON DELETE SET NULL;

-- Add foreign key constraint for referrer_id in referrals table
-- Note: This is a generic reference that could point to users or businesses
-- We'll use a check constraint instead of a foreign key for flexibility
ALTER TABLE referrals ADD CONSTRAINT check_referrals_referrer_id_not_null 
    CHECK (referrer_id IS NOT NULL);

-- Add foreign key constraint for referrer_id in referral_issuances table
ALTER TABLE referral_issuances ADD CONSTRAINT check_referral_issuances_referrer_id_not_null 
    CHECK (referrer_id IS NOT NULL);

-- Add additional indexes for performance
CREATE INDEX IF NOT EXISTS idx_rides_created_at ON rides(created_at);
CREATE INDEX IF NOT EXISTS idx_rides_updated_at ON rides(updated_at);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON invoices(created_at);
CREATE INDEX IF NOT EXISTS idx_tips_updated_at ON tips(updated_at);
CREATE INDEX IF NOT EXISTS idx_referrals_created_at ON referrals(created_at);
CREATE INDEX IF NOT EXISTS idx_scheduled_rides_updated_at ON scheduled_rides(updated_at);
CREATE INDEX IF NOT EXISTS idx_promotions_created_at ON promotions(created_at);
CREATE INDEX IF NOT EXISTS idx_promotions_updated_at ON promotions(updated_at);
CREATE INDEX IF NOT EXISTS idx_business_rewards_updated_at ON business_rewards(updated_at);

-- Add composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_rides_rider_status ON rides(rider_id, status);
CREATE INDEX IF NOT EXISTS idx_rides_driver_status ON rides(driver_id, status);
CREATE INDEX IF NOT EXISTS idx_rides_org_status ON rides(org_id, status);
CREATE INDEX IF NOT EXISTS idx_rides_status_created_at ON rides(status, created_at);
CREATE INDEX IF NOT EXISTS idx_payments_status_created_at ON payments(status, created_at);
CREATE INDEX IF NOT EXISTS idx_tips_driver_created_at ON tips(driver_id, created_at);
CREATE INDEX IF NOT EXISTS idx_tips_rider_created_at ON tips(rider_id, created_at);
CREATE INDEX IF NOT EXISTS idx_scheduled_rides_status_scheduled_for ON scheduled_rides(status, scheduled_for);
CREATE INDEX IF NOT EXISTS idx_promotions_active_audience ON promotions(is_active, audience, start_at, end_at);

-- Add partial indexes for active records
CREATE INDEX IF NOT EXISTS idx_rides_active ON rides(id) WHERE status NOT IN ('completed', 'cancelled', 'failed');
CREATE INDEX IF NOT EXISTS idx_scheduled_rides_active ON scheduled_rides(id) WHERE status NOT IN ('converted', 'cancelled', 'failed');
CREATE INDEX IF NOT EXISTS idx_promotions_active ON promotions(id) WHERE is_active = TRUE;

-- Add indexes for JSONB columns
CREATE INDEX IF NOT EXISTS idx_wallet_ledger_meta ON wallet_ledger USING GIN (meta);
CREATE INDEX IF NOT EXISTS idx_promotions_criteria ON promotions USING GIN (criteria_json);
CREATE INDEX IF NOT EXISTS idx_feature_flags_value ON feature_flags USING GIN (value_json);

-- Add check constraints for data integrity
ALTER TABLE rides ADD CONSTRAINT check_rides_amount_positive 
    CHECK (amount_cents >= 0);

ALTER TABLE payments ADD CONSTRAINT check_payments_amount_positive 
    CHECK (amount_cents > 0);

ALTER TABLE invoice_line_items ADD CONSTRAINT check_invoice_line_items_amount_positive 
    CHECK (amount_cents > 0);

ALTER TABLE invoices ADD CONSTRAINT check_invoices_total_positive 
    CHECK (total_cents >= 0);

ALTER TABLE scheduled_rides ADD CONSTRAINT check_scheduled_rides_est_fare_positive 
    CHECK (est_fare_cents IS NULL OR est_fare_cents >= 0);

-- Add constraints for rating ranges
ALTER TABLE rides ADD CONSTRAINT check_rides_rating_range 
    CHECK (rating IS NULL OR (rating >= 0 AND rating <= 5));

-- Add constraints for time relationships
ALTER TABLE rides ADD CONSTRAINT check_rides_time_sequence 
    CHECK (
        (requested_at IS NULL OR accepted_at IS NULL OR accepted_at >= requested_at) AND
        (accepted_at IS NULL OR arrived_at IS NULL OR arrived_at >= accepted_at) AND
        (arrived_at IS NULL OR started_at IS NULL OR started_at >= arrived_at) AND
        (started_at IS NULL OR completed_at IS NULL OR completed_at >= started_at)
    );

ALTER TABLE scheduled_rides ADD CONSTRAINT check_scheduled_rides_time_sequence 
    CHECK (scheduled_for > requested_at);

COMMIT;

-- +migrate Down
BEGIN;

-- Drop constraints
ALTER TABLE scheduled_rides DROP CONSTRAINT IF EXISTS check_scheduled_rides_time_sequence;
ALTER TABLE rides DROP CONSTRAINT IF EXISTS check_rides_time_sequence;
ALTER TABLE rides DROP CONSTRAINT IF EXISTS check_rides_rating_range;
ALTER TABLE scheduled_rides DROP CONSTRAINT IF EXISTS check_scheduled_rides_est_fare_positive;
ALTER TABLE invoices DROP CONSTRAINT IF EXISTS check_invoices_total_positive;
ALTER TABLE invoice_line_items DROP CONSTRAINT IF EXISTS check_invoice_line_items_amount_positive;
ALTER TABLE payments DROP CONSTRAINT IF EXISTS check_payments_amount_positive;
ALTER TABLE rides DROP CONSTRAINT IF EXISTS check_rides_amount_positive;

-- Drop indexes
DROP INDEX IF EXISTS idx_feature_flags_value;
DROP INDEX IF EXISTS idx_promotions_criteria;
DROP INDEX IF EXISTS idx_wallet_ledger_meta;
DROP INDEX IF EXISTS idx_promotions_active;
DROP INDEX IF EXISTS idx_scheduled_rides_active;
DROP INDEX IF EXISTS idx_rides_active;
DROP INDEX IF EXISTS idx_promotions_active_audience;
DROP INDEX IF EXISTS idx_scheduled_rides_status_scheduled_for;
DROP INDEX IF EXISTS idx_tips_rider_created_at;
DROP INDEX IF EXISTS idx_tips_driver_created_at;
DROP INDEX IF EXISTS idx_payments_status_created_at;
DROP INDEX IF EXISTS idx_rides_status_created_at;
DROP INDEX IF EXISTS idx_rides_org_status;
DROP INDEX IF EXISTS idx_rides_driver_status;
DROP INDEX IF EXISTS idx_rides_rider_status;
DROP INDEX IF EXISTS idx_business_rewards_updated_at;
DROP INDEX IF EXISTS idx_promotions_updated_at;
DROP INDEX IF EXISTS idx_promotions_created_at;
DROP INDEX IF EXISTS idx_scheduled_rides_updated_at;
DROP INDEX IF EXISTS idx_referrals_created_at;
DROP INDEX IF EXISTS idx_tips_updated_at;
DROP INDEX IF EXISTS idx_invoices_created_at;
DROP INDEX IF EXISTS idx_payments_created_at;
DROP INDEX IF EXISTS idx_rides_updated_at;
DROP INDEX IF EXISTS idx_rides_created_at;

-- Drop foreign key constraints
ALTER TABLE referral_issuances DROP CONSTRAINT IF EXISTS check_referral_issuances_referrer_id_not_null;
ALTER TABLE referrals DROP CONSTRAINT IF EXISTS check_referrals_referrer_id_not_null;
ALTER TABLE rides DROP CONSTRAINT IF EXISTS fk_rides_scheduled_ride_id;

COMMIT;
