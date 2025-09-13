-- ==============================================
-- DELETE ALL TABLES FROM SUPABASE DATABASE
-- ==============================================
-- This script deletes all tables, types, and related objects
-- WARNING: This will permanently delete all data!
-- Run this in Supabase SQL Editor

-- ==============================================
-- STEP 1: DISABLE ROW LEVEL SECURITY (IF ENABLED)
-- ==============================================

-- Disable RLS on all tables (if they exist)
ALTER TABLE IF EXISTS sends DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS optins DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS requests DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS team_pins DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS labels DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS users DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS locations DISABLE ROW LEVEL SECURITY;

-- ==============================================
-- STEP 2: DROP ALL TABLES IN REVERSE DEPENDENCY ORDER
-- ==============================================

-- Drop tables that reference other tables first
DROP TABLE IF EXISTS sends CASCADE;
DROP TABLE IF EXISTS optins CASCADE;
DROP TABLE IF EXISTS requests CASCADE;
DROP TABLE IF EXISTS team_pins CASCADE;
DROP TABLE IF EXISTS labels CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS locations CASCADE;

-- Drop any other tables that might exist
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS product_alerts CASCADE;
DROP TABLE IF EXISTS user_preferences CASCADE;
DROP TABLE IF EXISTS sessions CASCADE;
DROP TABLE IF EXISTS migrations CASCADE;

-- ==============================================
-- STEP 3: DROP ALL CUSTOM TYPES
-- ==============================================

-- Drop custom enum types
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS request_status CASCADE;
DROP TYPE IF EXISTS optin_status CASCADE;
DROP TYPE IF EXISTS alert_type CASCADE;

-- ==============================================
-- STEP 4: DROP ALL FUNCTIONS AND TRIGGERS
-- ==============================================

-- Drop trigger functions
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- Drop any other custom functions
DROP FUNCTION IF EXISTS exec_sql(text) CASCADE;

-- ==============================================
-- STEP 5: DROP ALL POLICIES (IF ANY REMAIN)
-- ==============================================

-- Note: Policies are automatically dropped when tables are dropped
-- This section is here for completeness

-- ==============================================
-- STEP 6: DROP ALL SEQUENCES (IF ANY)
-- ==============================================

-- Drop any custom sequences
DROP SEQUENCE IF EXISTS locations_id_seq CASCADE;
DROP SEQUENCE IF EXISTS users_id_seq CASCADE;
DROP SEQUENCE IF EXISTS labels_id_seq CASCADE;
DROP SEQUENCE IF EXISTS requests_id_seq CASCADE;
DROP SEQUENCE IF EXISTS optins_id_seq CASCADE;
DROP SEQUENCE IF EXISTS team_pins_id_seq CASCADE;
DROP SEQUENCE IF EXISTS sends_id_seq CASCADE;

-- ==============================================
-- STEP 7: DROP ALL INDEXES (IF ANY REMAIN)
-- ==============================================

-- Note: Indexes are automatically dropped when tables are dropped
-- This section is here for completeness

-- ==============================================
-- STEP 8: DROP ALL VIEWS (IF ANY)
-- ==============================================

-- Drop any custom views
DROP VIEW IF EXISTS active_labels CASCADE;
DROP VIEW IF EXISTS recent_requests CASCADE;
DROP VIEW IF EXISTS user_stats CASCADE;

-- ==============================================
-- STEP 9: DROP ALL EXTENSIONS (IF ANY)
-- ==============================================

-- Note: Be careful with extensions as they might be used by other parts of Supabase
-- Only drop if you're sure they're not needed

-- ==============================================
-- STEP 10: VERIFICATION
-- ==============================================

-- Show completion message
SELECT '✅ All tables and related objects deleted successfully!' as status;

-- Check if any tables remain
SELECT '🔍 Checking for remaining tables:' as info;
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Check if any types remain
SELECT '🔍 Checking for remaining custom types:' as info;
SELECT 
    typname,
    typtype
FROM pg_type 
WHERE typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
AND typtype = 'e'
ORDER BY typname;

-- Check if any functions remain
SELECT '🔍 Checking for remaining custom functions:' as info;
SELECT 
    proname,
    prokind
FROM pg_proc 
WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
AND proname NOT LIKE 'pg_%'
ORDER BY proname;

-- ==============================================
-- CLEANUP COMPLETE!
-- ==============================================

SELECT '🎉 Database cleanup completed successfully!' as final_status;
SELECT 'Your database is now completely clean and ready for fresh setup.' as summary;
SELECT 'You can now run your setup scripts to create new tables.' as next_step;

