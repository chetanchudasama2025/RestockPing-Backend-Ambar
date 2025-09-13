-- =====================================================
-- FUNCTIONS AND INDEXES SCRIPT
-- =====================================================
-- Run this ninth to create helper functions and performance indexes

-- Create helpful function for user name lookup
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

-- Create indexes for better performance
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

-- Ensure foreign key constraints exist
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

-- Success message
SELECT 'Functions and indexes created successfully!' as status;
