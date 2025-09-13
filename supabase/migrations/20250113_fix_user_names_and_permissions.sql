-- =====================================================
-- MIGRATION: Fix User Names and Permissions
-- =====================================================
-- This migration will:
-- 1. Fix foreign key constraints
-- 2. Add missing users to the users table
-- 3. Update team_pins with user_name column
-- 4. Add test data for development
-- 5. Fix table permissions
-- 6. Create helpful functions and indexes

-- =====================================================
-- STEP 1: Add missing users that are referenced in sends table
-- =====================================================

INSERT INTO users (id, name, email, created_at, updated_at)
VALUES 
  ('98392a05-d8a5-49ae-ae17-3a2a4a44c7ce', 'Marie Dubois', 'marie.dubois@restockping.com', NOW(), NOW()),
  ('703f2125-cb50-406b-ac9c-eef6cdfcd33c', 'Pierre Martin', 'pierre.martin@restockping.com', NOW(), NOW()),
  ('8d5a4ffc-a94c-490d-b6c2-d40e3ec6dd6d', 'Marie Dubois', 'marie.dubois@restockping.com', NOW(), NOW()),
  ('c3d4e5f6-g7h8-9012-cdef-345678901234', 'Alice Johnson', 'alice.johnson@restockping.com', NOW(), NOW()),
  ('d4e5f6g7-h8i9-0123-defg-456789012345', 'Bob Smith', 'bob.smith@restockping.com', NOW(), NOW()),
  ('e5f6g7h8-i9j0-1234-efgh-567890123456', 'Carol Davis', 'carol.davis@restockping.com', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  updated_at = NOW();

-- =====================================================
-- STEP 2: Ensure team_pins has user_name column
-- =====================================================

-- Add user_name column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'team_pins' AND column_name = 'user_name') THEN
        ALTER TABLE team_pins ADD COLUMN user_name VARCHAR(255);
        RAISE NOTICE 'Added user_name column to team_pins table';
    END IF;
END $$;

-- Update existing team_pins with user names
UPDATE team_pins 
SET user_name = 'Marie Dubois'
WHERE id = '8d5a4ffc-a94c-490d-b6c2-d40e3ec6dd6d';

-- Add more team pins with user names
INSERT INTO team_pins (id, user_name, location_id, active, created_at, updated_at)
VALUES 
  ('98392a05-d8a5-49ae-ae17-3a2a4a44c7ce', 'Marie Dubois', '9e70b28a-5217-4a1e-b9f9-4b0c102c6a78', true, NOW(), NOW()),
  ('703f2125-cb50-406b-ac9c-eef6cdfcd33c', 'Pierre Martin', '9e70b28a-5217-4a1e-b9f9-4b0c102c6a78', true, NOW(), NOW()),
  ('c3d4e5f6-g7h8-9012-cdef-345678901234', 'Alice Johnson', '9e70b28a-5217-4a1e-b9f9-4b0c102c6a78', true, NOW(), NOW()),
  ('d4e5f6g7-h8i9-0123-defg-456789012345', 'Bob Smith', '9e70b28a-5217-4a1e-b9f9-4b0c102c6a78', true, NOW(), NOW()),
  ('e5f6g7h8-i9j0-1234-efgh-567890123456', 'Carol Davis', '9e70b28a-5217-4a1e-b9f9-4b0c102c6a78', true, NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  user_name = EXCLUDED.user_name,
  active = EXCLUDED.active,
  updated_at = NOW();

-- =====================================================
-- STEP 3: Add test subscribers (optins) for development
-- =====================================================

DO $$
DECLARE
    drone_label_id UUID;
    phone_label_id UUID;
    laptop_label_id UUID;
    monitor_label_id UUID;
BEGIN
    -- Get label IDs for Paris Office
    SELECT id INTO drone_label_id FROM labels WHERE code = 'DRONE' AND location_id = '9e70b28a-5217-4a1e-b9f9-4b0c102c6a78' LIMIT 1;
    SELECT id INTO phone_label_id FROM labels WHERE code = 'PHONE' AND location_id = '9e70b28a-5217-4a1e-b9f9-4b0c102c6a78' LIMIT 1;
    SELECT id INTO laptop_label_id FROM labels WHERE code = 'LAPTOP' AND location_id = '9e70b28a-5217-4a1e-b9f9-4b0c102c6a78' LIMIT 1;
    SELECT id INTO monitor_label_id FROM labels WHERE code = 'MONITOR' AND location_id = '9e70b28a-5217-4a1e-b9f9-4b0c102c6a78' LIMIT 1;
    
    -- Add subscribers for Drones
    IF drone_label_id IS NOT NULL THEN
        INSERT INTO optins (id, phone, label_id, location_id, created_at, updated_at)
        VALUES 
          (gen_random_uuid(), '+33123456789', drone_label_id, '9e70b28a-5217-4a1e-b9f9-4b0c102c6a78', NOW(), NOW()),
          (gen_random_uuid(), '+33987654321', drone_label_id, '9e70b28a-5217-4a1e-b9f9-4b0c102c6a78', NOW(), NOW()),
          (gen_random_uuid(), '+33555555555', drone_label_id, '9e70b28a-5217-4a1e-b9f9-4b0c102c6a78', NOW(), NOW()),
          (gen_random_uuid(), '+33111223344', drone_label_id, '9e70b28a-5217-4a1e-b9f9-4b0c102c6a78', NOW(), NOW()),
          (gen_random_uuid(), '+33998877665', drone_label_id, '9e70b28a-5217-4a1e-b9f9-4b0c102c6a78', NOW(), NOW())
        ON CONFLICT (phone, label_id) DO NOTHING;
    END IF;
    
    -- Add subscribers for other labels if they exist
    IF phone_label_id IS NOT NULL THEN
        INSERT INTO optins (id, phone, label_id, location_id, created_at, updated_at)
        VALUES 
          (gen_random_uuid(), '+33123456789', phone_label_id, '9e70b28a-5217-4a1e-b9f9-4b0c102c6a78', NOW(), NOW()),
          (gen_random_uuid(), '+33987654321', phone_label_id, '9e70b28a-5217-4a1e-b9f9-4b0c102c6a78', NOW(), NOW())
        ON CONFLICT (phone, label_id) DO NOTHING;
    END IF;
    
    RAISE NOTICE 'Added test subscribers for available labels';
END $$;

-- =====================================================
-- STEP 4: Add test send records (audit logs) for development
-- =====================================================

DO $$
DECLARE
    drone_label_id UUID;
    phone_label_id UUID;
    laptop_label_id UUID;
    monitor_label_id UUID;
    user_id_1 UUID := '98392a05-d8a5-49ae-ae17-3a2a4a44c7ce'; -- Marie Dubois
    user_id_2 UUID := '703f2125-cb50-406b-ac9c-eef6cdfcd33c'; -- Pierre Martin
    user_id_3 UUID := 'c3d4e5f6-g7h8-9012-cdef-345678901234'; -- Alice Johnson
    user_id_4 UUID := 'd4e5f6g7-h8i9-0123-defg-456789012345'; -- Bob Smith
    user_id_5 UUID := 'e5f6g7h8-i9j0-1234-efgh-567890123456'; -- Carol Davis
BEGIN
    -- Get label IDs
    SELECT id INTO drone_label_id FROM labels WHERE code = 'DRONE' AND location_id = '9e70b28a-5217-4a1e-b9f9-4b0c102c6a78' LIMIT 1;
    SELECT id INTO phone_label_id FROM labels WHERE code = 'PHONE' AND location_id = '9e70b28a-5217-4a1e-b9f9-4b0c102c6a78' LIMIT 1;
    SELECT id INTO laptop_label_id FROM labels WHERE code = 'LAPTOP' AND location_id = '9e70b28a-5217-4a1e-b9f9-4b0c102c6a78' LIMIT 1;
    SELECT id INTO monitor_label_id FROM labels WHERE code = 'MONITOR' AND location_id = '9e70b28a-5217-4a1e-b9f9-4b0c102c6a78' LIMIT 1;
    
    -- Add test send records for different labels and users
    IF drone_label_id IS NOT NULL THEN
        INSERT INTO sends (id, sender_user_id, label_id, sent_count, created_at)
        VALUES 
          (gen_random_uuid(), user_id_1, drone_label_id, 3, NOW() - INTERVAL '1 hour'),
          (gen_random_uuid(), user_id_2, drone_label_id, 2, NOW() - INTERVAL '3 hours'),
          (gen_random_uuid(), user_id_3, drone_label_id, 4, NOW() - INTERVAL '5 hours'),
          (gen_random_uuid(), user_id_1, drone_label_id, 1, NOW() - INTERVAL '1 day'),
          (gen_random_uuid(), user_id_2, drone_label_id, 5, NOW() - INTERVAL '2 days')
        ON CONFLICT (id) DO NOTHING;
    END IF;
    
    IF phone_label_id IS NOT NULL THEN
        INSERT INTO sends (id, sender_user_id, label_id, sent_count, created_at)
        VALUES 
          (gen_random_uuid(), user_id_4, phone_label_id, 5, NOW() - INTERVAL '2 hours'),
          (gen_random_uuid(), user_id_5, phone_label_id, 3, NOW() - INTERVAL '4 hours')
        ON CONFLICT (id) DO NOTHING;
    END IF;
    
    RAISE NOTICE 'Added test send records for available labels';
END $$;

-- =====================================================
-- STEP 5: Fix table permissions
-- =====================================================

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON users TO authenticated;
GRANT SELECT, INSERT, UPDATE ON team_pins TO authenticated;
GRANT SELECT, INSERT, UPDATE ON sends TO authenticated;
GRANT SELECT, INSERT, UPDATE ON optins TO authenticated;
GRANT SELECT, INSERT, UPDATE ON labels TO authenticated;
GRANT SELECT, INSERT, UPDATE ON locations TO authenticated;

-- Grant all permissions to service_role
GRANT ALL ON users TO service_role;
GRANT ALL ON team_pins TO service_role;
GRANT ALL ON sends TO service_role;
GRANT ALL ON optins TO service_role;
GRANT ALL ON labels TO service_role;
GRANT ALL ON locations TO service_role;

-- =====================================================
-- STEP 6: Create helpful function for user name lookup
-- =====================================================

CREATE OR REPLACE FUNCTION get_user_name(sender_id UUID)
RETURNS TEXT AS $$
DECLARE
    user_name TEXT;
BEGIN
    -- First try to get from team_pins
    SELECT tp.user_name INTO user_name
    FROM team_pins tp
    WHERE tp.id = sender_id AND tp.active = true
    LIMIT 1;
    
    -- If not found, try to get from users table
    IF user_name IS NULL THEN
        SELECT u.name INTO user_name
        FROM users u
        WHERE u.id = sender_id
        LIMIT 1;
    END IF;
    
    -- Return the user name or a fallback
    RETURN COALESCE(user_name, 'Team Member (' || SUBSTRING(sender_id::TEXT, 1, 8) || ')');
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION get_user_name(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_name(UUID) TO service_role;

-- =====================================================
-- STEP 7: Create indexes for better performance
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_sends_sender_user_id ON sends(sender_user_id);
CREATE INDEX IF NOT EXISTS idx_sends_label_id ON sends(label_id);
CREATE INDEX IF NOT EXISTS idx_sends_created_at ON sends(created_at);
CREATE INDEX IF NOT EXISTS idx_optins_phone ON optins(phone);
CREATE INDEX IF NOT EXISTS idx_optins_label_id ON optins(label_id);
CREATE INDEX IF NOT EXISTS idx_optins_location_id ON optins(location_id);
CREATE INDEX IF NOT EXISTS idx_team_pins_location_id ON team_pins(location_id);
CREATE INDEX IF NOT EXISTS idx_team_pins_active ON team_pins(active);
CREATE INDEX IF NOT EXISTS idx_labels_location_id ON labels(location_id);
CREATE INDEX IF NOT EXISTS idx_labels_active ON labels(active);

-- =====================================================
-- STEP 8: Ensure foreign key constraints exist
-- =====================================================

-- Ensure the foreign key constraint exists and is properly configured
DO $$
BEGIN
    -- Check if the foreign key constraint exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'sends_sender_user_id_fkey' 
        AND table_name = 'sends'
    ) THEN
        -- Add the foreign key constraint
        ALTER TABLE sends 
        ADD CONSTRAINT sends_sender_user_id_fkey 
        FOREIGN KEY (sender_user_id) REFERENCES users(id) ON DELETE CASCADE;
        
        RAISE NOTICE 'Added foreign key constraint: sends_sender_user_id_fkey';
    ELSE
        RAISE NOTICE 'Foreign key constraint already exists: sends_sender_user_id_fkey';
    END IF;
END $$;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Log the completion
INSERT INTO supabase_migrations.schema_migrations (version, statements, name)
VALUES (
    '20250113_fix_user_names_and_permissions',
    ARRAY['Fixed user names and permissions for team API'],
    'Fix User Names and Permissions'
) ON CONFLICT (version) DO NOTHING;
