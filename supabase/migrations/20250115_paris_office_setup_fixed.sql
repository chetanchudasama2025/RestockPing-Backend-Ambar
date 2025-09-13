-- =====================================================
-- MIGRATION: Paris Office Setup with Login Credentials (Fixed)
-- =====================================================
-- This migration sets up Paris Office with team login credentials
-- Run this migration to enable login with Location: paris, PIN: 1234 or paris

-- Function to hash PINs (for seeding)
CREATE OR REPLACE FUNCTION hash_pin(pin text)
RETURNS text AS $$
BEGIN
    RETURN encode(digest(pin, 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql;

-- 1. Create Paris Office location (handle existing location)
INSERT INTO locations (id, name, slug, timezone)
VALUES 
  ('9e70b28a-5217-4a1e-b9f9-4b0c102c6a78', 'Paris Office', 'paris_office', 'Europe/Paris')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  timezone = EXCLUDED.timezone;

-- Handle case where location exists with different ID but same slug
UPDATE locations 
SET name = 'Paris Office', timezone = 'Europe/Paris'
WHERE slug = 'paris_office' AND id != '9e70b28a-5217-4a1e-b9f9-4b0c102c6a78';

-- 2. Create team users with valid UUIDs
INSERT INTO users (id, name, email)
VALUES 
  ('98392a05-d8a5-49ae-ae17-3a2a4a44c7ce', 'Marie Dubois', 'marie.dubois@restockping.com'),
  ('703f2125-cb50-406b-ac9c-eef6cdfcd33c', 'Pierre Martin', 'pierre.martin@restockping.com'),
  ('c3d4e5f6-7h8i-9012-cdef-345678901234', 'Alice Johnson', 'alice.johnson@restockping.com'),
  ('d4e5f6g7-8i9j-0123-defg-456789012345', 'Bob Smith', 'bob.smith@restockping.com'),
  ('e5f6g7h8-9j0k-1234-efgh-567890123456', 'Carol Davis', 'carol.davis@restockping.com')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email;

-- 3. Add user_name column to team_pins if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'team_pins' AND column_name = 'user_name') THEN
        ALTER TABLE team_pins ADD COLUMN user_name VARCHAR(255);
        RAISE NOTICE 'Added user_name column to team_pins table';
    END IF;
END $$;

-- 4. Create team pins with login credentials
INSERT INTO team_pins (id, user_name, location_id, pin_hash, active)
VALUES 
  ('98392a05-d8a5-49ae-ae17-3a2a4a44c7ce', 'Marie Dubois', '9e70b28a-5217-4a1e-b9f9-4b0c102c6a78', hash_pin('1234'), true),
  ('703f2125-cb50-406b-ac9c-eef6cdfcd33c', 'Pierre Martin', '9e70b28a-5217-4a1e-b9f9-4b0c102c6a78', hash_pin('paris'), true),
  ('c3d4e5f6-7h8i-9012-cdef-345678901234', 'Alice Johnson', '9e70b28a-5217-4a1e-b9f9-4b0c102c6a78', hash_pin('1234'), true),
  ('d4e5f6g7-8i9j-0123-defg-456789012345', 'Bob Smith', '9e70b28a-5217-4a1e-b9f9-4b0c102c6a78', hash_pin('paris'), true),
  ('e5f6g7h8-9j0k-1234-efgh-567890123456', 'Carol Davis', '9e70b28a-5217-4a1e-b9f9-4b0c102c6a78', hash_pin('1234'), true)
ON CONFLICT (id) DO UPDATE SET
  user_name = EXCLUDED.user_name,
  pin_hash = EXCLUDED.pin_hash,
  active = EXCLUDED.active;

-- 5. Create product labels
INSERT INTO labels (id, location_id, code, name, synonyms, active)
VALUES 
  (gen_random_uuid(), '9e70b28a-5217-4a1e-b9f9-4b0c102c6a78', 'DRONE', 'Drones', 'Quadcopter,FPV Drone,Camera Drone,Professional Drone', true),
  (gen_random_uuid(), '9e70b28a-5217-4a1e-b9f9-4b0c102c6a78', 'PHONE', 'Smartphones', 'Mobile Phones,Cell Phones,iPhone,Android', true),
  (gen_random_uuid(), '9e70b28a-5217-4a1e-b9f9-4b0c102c6a78', 'LAPTOP', 'Laptops', 'Notebooks,MacBook,Windows Laptop,Chromebook', true),
  (gen_random_uuid(), '9e70b28a-5217-4a1e-b9f9-4b0c102c6a78', 'MONITOR', 'Monitors', 'Computer Monitor,4K Monitor,Gaming Monitor,Ultrawide', true)
ON CONFLICT (location_id, code) DO UPDATE SET
  name = EXCLUDED.name,
  synonyms = EXCLUDED.synonyms,
  active = EXCLUDED.active;

-- 6. Add test subscribers
DO $$
DECLARE
    drone_label_id UUID;
    phone_label_id UUID;
BEGIN
    -- Get label IDs
    SELECT id INTO drone_label_id FROM labels WHERE code = 'DRONE' AND location_id = '9e70b28a-5217-4a1e-b9f9-4b0c102c6a78' LIMIT 1;
    SELECT id INTO phone_label_id FROM labels WHERE code = 'PHONE' AND location_id = '9e70b28a-5217-4a1e-b9f9-4b0c102c6a78' LIMIT 1;
    
    -- Add subscribers for Drones
    IF drone_label_id IS NOT NULL THEN
        INSERT INTO optins (id, phone, label_id, location_id)
        VALUES 
          (gen_random_uuid(), '+33123456789', drone_label_id, '9e70b28a-5217-4a1e-b9f9-4b0c102c6a78'),
          (gen_random_uuid(), '+33987654321', drone_label_id, '9e70b28a-5217-4a1e-b9f9-4b0c102c6a78'),
          (gen_random_uuid(), '+33555555555', drone_label_id, '9e70b28a-5217-4a1e-b9f9-4b0c102c6a78')
        ON CONFLICT (phone, label_id) DO NOTHING;
    END IF;
    
    -- Add subscribers for Phones
    IF phone_label_id IS NOT NULL THEN
        INSERT INTO optins (id, phone, label_id, location_id)
        VALUES 
          (gen_random_uuid(), '+33123456789', phone_label_id, '9e70b28a-5217-4a1e-b9f9-4b0c102c6a78'),
          (gen_random_uuid(), '+33987654321', phone_label_id, '9e70b28a-5217-4a1e-b9f9-4b0c102c6a78')
        ON CONFLICT (phone, label_id) DO NOTHING;
    END IF;
END $$;

-- 7. Add test send records
DO $$
DECLARE
    drone_label_id UUID;
    phone_label_id UUID;
    user_id_1 UUID := '98392a05-d8a5-49ae-ae17-3a2a4a44c7ce';
    user_id_2 UUID := '703f2125-cb50-406b-ac9c-eef6cdfcd33c';
    user_id_3 UUID := 'c3d4e5f6-7h8i-9012-cdef-345678901234';
BEGIN
    -- Get label IDs
    SELECT id INTO drone_label_id FROM labels WHERE code = 'DRONE' AND location_id = '9e70b28a-5217-4a1e-b9f9-4b0c102c6a78' LIMIT 1;
    SELECT id INTO phone_label_id FROM labels WHERE code = 'PHONE' AND location_id = '9e70b28a-5217-4a1e-b9f9-4b0c102c6a78' LIMIT 1;
    
    -- Add test send records
    IF drone_label_id IS NOT NULL THEN
        INSERT INTO sends (id, sender_user_id, label_id, sent_count)
        VALUES 
          (gen_random_uuid(), user_id_1, drone_label_id, 3),
          (gen_random_uuid(), user_id_2, drone_label_id, 2),
          (gen_random_uuid(), user_id_3, drone_label_id, 4)
        ON CONFLICT (id) DO NOTHING;
    END IF;
    
    IF phone_label_id IS NOT NULL THEN
        INSERT INTO sends (id, sender_user_id, label_id, sent_count)
        VALUES 
          (gen_random_uuid(), user_id_1, phone_label_id, 5),
          (gen_random_uuid(), user_id_2, phone_label_id, 3)
        ON CONFLICT (id) DO NOTHING;
    END IF;
END $$;

-- 8. Create helpful function for user name lookup
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

-- 9. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sends_sender_user_id ON sends(sender_user_id);
CREATE INDEX IF NOT EXISTS idx_sends_label_id ON sends(label_id);
CREATE INDEX IF NOT EXISTS idx_optins_phone ON optins(phone);
CREATE INDEX IF NOT EXISTS idx_optins_label_id ON optins(label_id);
CREATE INDEX IF NOT EXISTS idx_optins_location_id ON optins(location_id);
CREATE INDEX IF NOT EXISTS idx_team_pins_location_id ON team_pins(location_id);
CREATE INDEX IF NOT EXISTS idx_team_pins_active ON team_pins(active);
CREATE INDEX IF NOT EXISTS idx_labels_location_id ON labels(location_id);
CREATE INDEX IF NOT EXISTS idx_labels_active ON labels(active);

-- 10. Ensure foreign key constraints exist
DO $$
BEGIN
    -- Add team_pins location_id foreign key constraint
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'team_pins_location_id_fkey' 
        AND table_name = 'team_pins'
    ) THEN
        ALTER TABLE team_pins 
        ADD CONSTRAINT team_pins_location_id_fkey 
        FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE;
        
        RAISE NOTICE 'Added foreign key constraint: team_pins_location_id_fkey';
    END IF;
    
    -- Add sends sender_user_id foreign key constraint
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'sends_sender_user_id_fkey' 
        AND table_name = 'sends'
    ) THEN
        ALTER TABLE sends 
        ADD CONSTRAINT sends_sender_user_id_fkey 
        FOREIGN KEY (sender_user_id) REFERENCES users(id) ON DELETE CASCADE;
        
        RAISE NOTICE 'Added foreign key constraint: sends_sender_user_id_fkey';
    END IF;
    
    -- Add labels location_id foreign key constraint
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'labels_location_id_fkey' 
        AND table_name = 'labels'
    ) THEN
        ALTER TABLE labels 
        ADD CONSTRAINT labels_location_id_fkey 
        FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE;
        
        RAISE NOTICE 'Added foreign key constraint: labels_location_id_fkey';
    END IF;
    
    -- Add optins location_id foreign key constraint
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'optins_location_id_fkey' 
        AND table_name = 'optins'
    ) THEN
        ALTER TABLE optins 
        ADD CONSTRAINT optins_location_id_fkey 
        FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE;
        
        RAISE NOTICE 'Added foreign key constraint: optins_location_id_fkey';
    END IF;
    
    -- Add optins label_id foreign key constraint
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'optins_label_id_fkey' 
        AND table_name = 'optins'
    ) THEN
        ALTER TABLE optins 
        ADD CONSTRAINT optins_label_id_fkey 
        FOREIGN KEY (label_id) REFERENCES labels(id) ON DELETE CASCADE;
        
        RAISE NOTICE 'Added foreign key constraint: optins_label_id_fkey';
    END IF;
    
    -- Add sends label_id foreign key constraint
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'sends_label_id_fkey' 
        AND table_name = 'sends'
    ) THEN
        ALTER TABLE sends 
        ADD CONSTRAINT sends_label_id_fkey 
        FOREIGN KEY (label_id) REFERENCES labels(id) ON DELETE CASCADE;
        
        RAISE NOTICE 'Added foreign key constraint: sends_label_id_fkey';
    END IF;
END $$;

-- Success message
SELECT 'Paris Office migration completed successfully!' as status;
SELECT 'Login with Location: paris and PIN: 1234 or paris' as login_instructions;
