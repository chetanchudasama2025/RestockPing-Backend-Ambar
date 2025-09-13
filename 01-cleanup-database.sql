-- =====================================================
-- DATABASE CLEANUP SCRIPT
-- =====================================================
-- Run this first to clean up existing data before adding new records

-- Drop foreign key constraints first to avoid dependency issues
ALTER TABLE sends DROP CONSTRAINT IF EXISTS sends_sender_user_id_fkey;
ALTER TABLE team_pins DROP CONSTRAINT IF EXISTS team_pins_location_id_fkey;
ALTER TABLE labels DROP CONSTRAINT IF EXISTS labels_location_id_fkey;
ALTER TABLE optins DROP CONSTRAINT IF EXISTS optins_location_id_fkey;
ALTER TABLE optins DROP CONSTRAINT IF EXISTS optins_label_id_fkey;
ALTER TABLE requests DROP CONSTRAINT IF EXISTS requests_location_id_fkey;

-- Clean up existing data (in reverse dependency order)
DELETE FROM sends;
DELETE FROM optins;
DELETE FROM team_pins;
DELETE FROM labels;
DELETE FROM requests;
DELETE FROM users;
DELETE FROM locations;

-- Reset sequences if they exist
DO $$ 
BEGIN
    -- Reset any auto-increment sequences
    IF EXISTS (SELECT 1 FROM pg_sequences WHERE sequencename LIKE '%_id_seq') THEN
        EXECUTE 'SELECT setval(pg_get_serial_sequence(''users'', ''id''), 1, false)';
    END IF;
END $$;

-- Success message
SELECT 'Database cleaned up successfully!' as status;
SELECT 'You can now run the individual table scripts' as next_step;
