-- =====================================================
-- PERMISSIONS SETUP SCRIPT
-- =====================================================
-- Run this second to set up all necessary permissions

-- Grant all necessary permissions to service_role
GRANT SELECT, INSERT, UPDATE, DELETE ON locations TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON users TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON labels TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON requests TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON team_pins TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON optins TO service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON sends TO service_role;

-- Grant permissions on sequences (for auto-incrementing IDs)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Grant permissions on any additional tables that might exist
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO service_role;

-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON users TO authenticated;
GRANT SELECT, INSERT, UPDATE ON team_pins TO authenticated;
GRANT SELECT, INSERT, UPDATE ON sends TO authenticated;
GRANT SELECT, INSERT, UPDATE ON optins TO authenticated;
GRANT SELECT, INSERT, UPDATE ON labels TO authenticated;
GRANT SELECT, INSERT, UPDATE ON locations TO authenticated;

-- Disable Row Level Security to prevent access issues
ALTER TABLE locations DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE labels DISABLE ROW LEVEL SECURITY;
ALTER TABLE requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE team_pins DISABLE ROW LEVEL SECURITY;
ALTER TABLE optins DISABLE ROW LEVEL SECURITY;
ALTER TABLE sends DISABLE ROW LEVEL SECURITY;

-- Success message
SELECT 'Permissions set up successfully!' as status;
