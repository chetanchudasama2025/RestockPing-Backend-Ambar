-- Add sample data for Paris Office Dashboard Testing
-- Run this in Supabase SQL Editor

-- First, let's check what we have for Paris Office
SELECT 'Current Paris Office Data:' as info;
SELECT 'Labels:' as table_name, COUNT(*) as count FROM labels WHERE location_id = '9e70b28a-5217-4a1e-b9f9-4b0c102c6a78'
UNION ALL
SELECT 'Optins:' as table_name, COUNT(*) as count FROM optins WHERE location_id = '9e70b28a-5217-4a1e-b9f9-4b0c102c6a78'
UNION ALL
SELECT 'Sends:' as table_name, COUNT(*) as count FROM sends WHERE location_id = '9e70b28a-5217-4a1e-b9f9-4b0c102c6a78';

-- Add optins for the existing DRONE label (3 active subscribers)
INSERT INTO optins (location_id, label_id, phone_e164, status) 
SELECT '9e70b28a-5217-4a1e-b9f9-4b0c102c6a78', id, '+33123456789', 'active'
FROM labels WHERE code = 'DRONE' AND location_id = '9e70b28a-5217-4a1e-b9f9-4b0c102c6a78'
ON CONFLICT (location_id, label_id, phone_e164) DO NOTHING;

INSERT INTO optins (location_id, label_id, phone_e164, status) 
SELECT '9e70b28a-5217-4a1e-b9f9-4b0c102c6a78', id, '+33987654321', 'active'
FROM labels WHERE code = 'DRONE' AND location_id = '9e70b28a-5217-4a1e-b9f9-4b0c102c6a78'
ON CONFLICT (location_id, label_id, phone_e164) DO NOTHING;

INSERT INTO optins (location_id, label_id, phone_e164, status) 
SELECT '9e70b28a-5217-4a1e-b9f9-4b0c102c6a78', id, '+33555555555', 'active'
FROM labels WHERE code = 'DRONE' AND location_id = '9e70b28a-5217-4a1e-b9f9-4b0c102c6a78'
ON CONFLICT (location_id, label_id, phone_e164) DO NOTHING;

-- Add one alerted subscriber (already received alerts)
INSERT INTO optins (location_id, label_id, phone_e164, status) 
SELECT '9e70b28a-5217-4a1e-b9f9-4b0c102c6a78', id, '+33999999999', 'alerted'
FROM labels WHERE code = 'DRONE' AND location_id = '9e70b28a-5217-4a1e-b9f9-4b0c102c6a78'
ON CONFLICT (location_id, label_id, phone_e164) DO NOTHING;

-- Add one unsubscribed subscriber
INSERT INTO optins (location_id, label_id, phone_e164, status) 
SELECT '9e70b28a-5217-4a1e-b9f9-4b0c102c6a78', id, '+33000000000', 'unsub'
FROM labels WHERE code = 'DRONE' AND location_id = '9e70b28a-5217-4a1e-b9f9-4b0c102c6a78'
ON CONFLICT (location_id, label_id, phone_e164) DO NOTHING;

-- Show final results
SELECT 'Sample data added successfully!' as status;

-- Show current optins for Paris Office
SELECT 'Current optins for Paris Office:' as info;
SELECT 
    l.code as label_code,
    l.name as label_name,
    o.status,
    COUNT(*) as count
FROM optins o
JOIN labels l ON o.label_id = l.id
WHERE o.location_id = '9e70b28a-5217-4a1e-b9f9-4b0c102c6a78'
GROUP BY l.code, l.name, o.status
ORDER BY l.code, o.status;

-- Show expected dashboard results
SELECT 'Expected Dashboard Results:' as info;
SELECT 'Active Visitors: 3 (DRONE label active subscribers)' as active_visitors;
SELECT 'Pending Alerts: 3 (same as active visitors)' as pending_alerts;
SELECT 'Top Labels: DRONE with 3 waiting subscribers' as top_labels;