-- Check current permissions status for all tables
-- Run this BEFORE and AFTER running fix-all-permissions.sql

-- ==============================================
-- CHECK TABLE PERMISSIONS
-- ==============================================
SELECT 'Current Table Permissions:' as info;
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

-- ==============================================
-- CHECK ROW LEVEL SECURITY STATUS
-- ==============================================
SELECT 'Row Level Security Status:' as info;
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    CASE 
        WHEN rowsecurity THEN 'ENABLED (may block access)'
        ELSE 'DISABLED (allows access)'
    END as status
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- ==============================================
-- CHECK SPECIFIC TABLES FOR DASHBOARD API
-- ==============================================
SELECT 'Dashboard API Required Tables:' as info;
SELECT 
    'locations' as table_name,
    has_table_privilege('service_role', 'public.locations', 'SELECT') as can_read,
    (SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'locations') as rls_enabled
UNION ALL
SELECT 
    'labels' as table_name,
    has_table_privilege('service_role', 'public.labels', 'SELECT') as can_read,
    (SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'labels') as rls_enabled
UNION ALL
SELECT 
    'optins' as table_name,
    has_table_privilege('service_role', 'public.optins', 'SELECT') as can_read,
    (SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'optins') as rls_enabled
UNION ALL
SELECT 
    'sends' as table_name,
    has_table_privilege('service_role', 'public.sends', 'SELECT') as can_read,
    (SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'sends') as rls_enabled
UNION ALL
SELECT 
    'team_pins' as table_name,
    has_table_privilege('service_role', 'public.team_pins', 'SELECT') as can_read,
    (SELECT rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename = 'team_pins') as rls_enabled;

-- ==============================================
-- SUMMARY
-- ==============================================
SELECT 'Summary:' as info;
SELECT 
    COUNT(*) as total_tables,
    COUNT(CASE WHEN has_table_privilege('service_role', 'public.'||tablename, 'SELECT') THEN 1 END) as readable_tables,
    COUNT(CASE WHEN rowsecurity = false THEN 1 END) as tables_without_rls
FROM pg_tables 
WHERE schemaname = 'public';
