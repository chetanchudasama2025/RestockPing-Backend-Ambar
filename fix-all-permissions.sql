-- Comprehensive script to fix ALL table permissions for service role
-- Run this in Supabase SQL Editor to prevent permission errors

-- ==============================================
-- GRANT ALL NECESSARY PERMISSIONS TO SERVICE ROLE
-- ==============================================

-- Core tables permissions
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

-- ==============================================
-- DISABLE ROW LEVEL SECURITY (RLS) IF ENABLED
-- ==============================================
-- This prevents RLS from blocking service role access

ALTER TABLE locations DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE labels DISABLE ROW LEVEL SECURITY;
ALTER TABLE requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE team_pins DISABLE ROW LEVEL SECURITY;
ALTER TABLE optins DISABLE ROW LEVEL SECURITY;
ALTER TABLE sends DISABLE ROW LEVEL SECURITY;

-- ==============================================
-- VERIFY PERMISSIONS
-- ==============================================

-- Show current table permissions
SELECT 
    schemaname,
    tablename,
    has_table_privilege('service_role', schemaname||'.'||tablename, 'SELECT') as can_select,
    has_table_privilege('service_role', schemaname||'.'||tablename, 'INSERT') as can_insert,
    has_table_privilege('service_role', schemaname||'.'||tablename, 'UPDATE') as can_update,
    has_table_privilege('service_role', schemaname||'.'||tablename, 'DELETE') as can_delete
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Show RLS status
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- ==============================================
-- SUCCESS MESSAGE
-- ==============================================
SELECT 'All permissions fixed successfully!' as status;
SELECT 'Service role now has full access to all tables' as note;
SELECT 'Row Level Security disabled to prevent access issues' as security_note;
