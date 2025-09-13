-- =====================================================
-- MIGRATION: Cleanup Existing Data (Fixed UUIDs)
-- =====================================================
-- This migration cleans up existing data to prevent conflicts

-- Remove existing Paris Office data to avoid conflicts
DELETE FROM sends WHERE sender_user_id IN (
    '98392a05-d8a5-49ae-ae17-3a2a4a44c7ce',
    '703f2125-cb50-406b-ac9c-eef6cdfcd33c',
    'c3d4e5f6-7h8i-9012-cdef-345678901234',
    'd4e5f6g7-8i9j-0123-defg-456789012345',
    'e5f6g7h8-9j0k-1234-efgh-567890123456'
);

DELETE FROM optins WHERE location_id = '9e70b28a-5217-4a1e-b9f9-4b0c102c6a78';

DELETE FROM team_pins WHERE id IN (
    '98392a05-d8a5-49ae-ae17-3a2a4a44c7ce',
    '703f2125-cb50-406b-ac9c-eef6cdfcd33c',
    'c3d4e5f6-7h8i-9012-cdef-345678901234',
    'd4e5f6g7-8i9j-0123-defg-456789012345',
    'e5f6g7h8-9j0k-1234-efgh-567890123456'
);

DELETE FROM labels WHERE location_id = '9e70b28a-5217-4a1e-b9f9-4b0c102c6a78';

DELETE FROM users WHERE id IN (
    '98392a05-d8a5-49ae-ae17-3a2a4a44c7ce',
    '703f2125-cb50-406b-ac9c-eef6cdfcd33c',
    'c3d4e5f6-7h8i-9012-cdef-345678901234',
    'd4e5f6g7-8i9j-0123-defg-456789012345',
    'e5f6g7h8-9j0k-1234-efgh-567890123456'
);

-- Remove existing Paris Office location
DELETE FROM locations WHERE id = '9e70b28a-5217-4a1e-b9f9-4b0c102c6a78' OR slug = 'paris_office';

-- Success message
SELECT 'Existing data cleaned up successfully!' as status;
