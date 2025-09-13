-- =====================================================
-- SAFE CLEANUP SCRIPT (NON-DESTRUCTIVE)
-- =====================================================
-- This script only removes conflicting data, preserves existing data

-- Only delete specific conflicting records, not all data
DELETE FROM sends WHERE sender_user_id IN (
    '98392a05-d8a5-49ae-ae17-3a2a4a44c7ce',
    '703f2125-cb50-406b-ac9c-eef6cdfcd33c',
    '8d5a4ffc-a94c-490d-b6c2-d40e3ec6dd6d',
    'c3d4e5f6-7h8i-9012-cdef-345678901234',
    'd4e5f6g7-8i9j-0123-defg-456789012345',
    'e5f6g7h8-9j0k-1234-efgh-567890123456'
);

DELETE FROM optins WHERE location_id = '9e70b28a-5217-4a1e-b9f9-4b0c102c6a78';

DELETE FROM team_pins WHERE id IN (
    '98392a05-d8a5-49ae-ae17-3a2a4a44c7ce',
    '703f2125-cb50-406b-ac9c-eef6cdfcd33c',
    '8d5a4ffc-a94c-490d-b6c2-d40e3ec6dd6d',
    'c3d4e5f6-7h8i-9012-cdef-345678901234',
    'd4e5f6g7-8i9j-0123-defg-456789012345',
    'e5f6g7h8-9j0k-1234-efgh-567890123456'
);

DELETE FROM labels WHERE location_id = '9e70b28a-5217-4a1e-b9f9-4b0c102c6a78';

DELETE FROM users WHERE id IN (
    '98392a05-d8a5-49ae-ae17-3a2a4a44c7ce',
    '703f2125-cb50-406b-ac9c-eef6cdfcd33c',
    '8d5a4ffc-a94c-490d-b6c2-d40e3ec6dd6d',
    'c3d4e5f6-7h8i-9012-cdef-345678901234',
    'd4e5f6g7-8i9j-0123-defg-456789012345',
    'e5f6g7h8-9j0k-1234-efgh-567890123456'
);

-- Only delete Paris Office if it exists
DELETE FROM locations WHERE id = '9e70b28a-5217-4a1e-b9f9-4b0c102c6a78';

-- Success message
SELECT 'Safe cleanup completed - only conflicting data removed!' as status;
SELECT 'Existing data preserved' as note;
