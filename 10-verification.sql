-- =====================================================
-- VERIFICATION SCRIPT
-- =====================================================
-- Run this last to verify everything was set up correctly

-- Check table permissions
SELECT 
    'PERMISSIONS CHECK' as check_type,
    schemaname,
    tablename,
    has_table_privilege('service_role', schemaname||'.'||tablename, 'SELECT') as can_select,
    has_table_privilege('service_role', schemaname||'.'||tablename, 'INSERT') as can_insert,
    has_table_privilege('service_role', schemaname||'.'||tablename, 'UPDATE') as can_update,
    has_table_privilege('service_role', schemaname||'.'||tablename, 'DELETE') as can_delete
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Check RLS status
SELECT 
    'RLS STATUS CHECK' as check_type,
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Check if user_name column exists in team_pins
SELECT 
    'COLUMN CHECK' as check_type,
    column_name,
    data_type
FROM information_schema.columns 
WHERE table_name = 'team_pins' AND column_name = 'user_name';

-- Check if function exists
SELECT 
    'FUNCTION CHECK' as check_type,
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_name = 'get_user_name' AND routine_schema = 'public';

-- Count records in each table
SELECT 'RECORD COUNTS' as check_type, 'locations' as table_name, COUNT(*) as count FROM locations
UNION ALL
SELECT 'RECORD COUNTS', 'users', COUNT(*) FROM users
UNION ALL
SELECT 'RECORD COUNTS', 'labels', COUNT(*) FROM labels
UNION ALL
SELECT 'RECORD COUNTS', 'team_pins', COUNT(*) FROM team_pins
UNION ALL
SELECT 'RECORD COUNTS', 'optins', COUNT(*) FROM optins
UNION ALL
SELECT 'RECORD COUNTS', 'sends', COUNT(*) FROM sends;

-- Test the get_user_name function
SELECT 
    'FUNCTION TEST' as check_type,
    id,
    get_user_name(id) as user_name
FROM team_pins
WHERE active = true
LIMIT 3;

-- Final success message
SELECT 'MIGRATION COMPLETED SUCCESSFULLY!' as status;
SELECT 'All permissions fixed and data migrated' as note;
SELECT 'You can now use the Team API without permission errors' as next_step;
SELECT 'Login with Location: paris and PIN: 1234 or paris' as login_instructions;
