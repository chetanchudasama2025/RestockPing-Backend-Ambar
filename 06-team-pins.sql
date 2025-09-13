-- =====================================================
-- TEAM PINS TABLE SCRIPT
-- =====================================================
-- Run this sixth to create team pins with PINs for login

-- Function to hash PINs (for seeding)
CREATE OR REPLACE FUNCTION hash_pin(pin text)
RETURNS text AS $$
BEGIN
    -- This will be replaced with bcrypt in the application
    -- For now, we'll use a simple hash for seeding
    RETURN encode(digest(pin, 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Add user_name column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'team_pins' AND column_name = 'user_name') THEN
        ALTER TABLE team_pins ADD COLUMN user_name VARCHAR(255);
        RAISE NOTICE 'Added user_name column to team_pins table';
    END IF;
END $$;

-- Add team pins for Paris Office with PIN "1234" and "paris"
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

-- Verify the team pins were created
SELECT 
    'TEAM PINS CREATED' as status,
    tp.id,
    tp.user_name,
    l.name as location_name,
    tp.active,
    'PIN: 1234 or paris' as login_info
FROM team_pins tp
JOIN locations l ON tp.location_id = l.id
WHERE l.slug = 'paris_office'
ORDER BY tp.user_name;

-- Success message
SELECT 'Team pins created successfully!' as status;
SELECT 'You can now login with Location: paris and PIN: 1234 or paris' as login_instructions;
