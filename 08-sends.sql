-- =====================================================
-- SENDS TABLE SCRIPT
-- =====================================================
-- Run this eighth to create test send records (audit logs)

DO $$
DECLARE
    drone_label_id UUID;
    phone_label_id UUID;
    laptop_label_id UUID;
    monitor_label_id UUID;
    user_id_1 UUID := '98392a05-d8a5-49ae-ae17-3a2a4a44c7ce'; -- Marie Dubois
    user_id_2 UUID := '703f2125-cb50-406b-ac9c-eef6cdfcd33c'; -- Pierre Martin
    user_id_3 UUID := 'c3d4e5f6-7h8i-9012-cdef-345678901234'; -- Alice Johnson
    user_id_4 UUID := 'd4e5f6g7-8i9j-0123-defg-456789012345'; -- Bob Smith
    user_id_5 UUID := 'e5f6g7h8-9j0k-1234-efgh-567890123456'; -- Carol Davis
BEGIN
    -- Get label IDs
    SELECT id INTO drone_label_id FROM labels WHERE code = 'DRONE' AND location_id = '9e70b28a-5217-4a1e-b9f9-4b0c102c6a78' LIMIT 1;
    SELECT id INTO phone_label_id FROM labels WHERE code = 'PHONE' AND location_id = '9e70b28a-5217-4a1e-b9f9-4b0c102c6a78' LIMIT 1;
    SELECT id INTO laptop_label_id FROM labels WHERE code = 'LAPTOP' AND location_id = '9e70b28a-5217-4a1e-b9f9-4b0c102c6a78' LIMIT 1;
    SELECT id INTO monitor_label_id FROM labels WHERE code = 'MONITOR' AND location_id = '9e70b28a-5217-4a1e-b9f9-4b0c102c6a78' LIMIT 1;
    
    -- Add test send records for different labels and users
    IF drone_label_id IS NOT NULL THEN
        INSERT INTO sends (id, sender_user_id, label_id, sent_count)
        VALUES 
          (gen_random_uuid(), user_id_1, drone_label_id, 3),
          (gen_random_uuid(), user_id_2, drone_label_id, 2),
          (gen_random_uuid(), user_id_3, drone_label_id, 4),
          (gen_random_uuid(), user_id_1, drone_label_id, 1),
          (gen_random_uuid(), user_id_2, drone_label_id, 5)
        ON CONFLICT (id) DO NOTHING;
    END IF;
    
    IF phone_label_id IS NOT NULL THEN
        INSERT INTO sends (id, sender_user_id, label_id, sent_count)
        VALUES 
          (gen_random_uuid(), user_id_4, phone_label_id, 5),
          (gen_random_uuid(), user_id_5, phone_label_id, 3)
        ON CONFLICT (id) DO NOTHING;
    END IF;
    
    RAISE NOTICE 'Added test send records for available labels';
END $$;

-- Verify the sends were created
SELECT 
    'SENDS CREATED' as status,
    u.name as sender_name,
    l.name as location_name,
    lb.code as label_code,
    lb.name as label_name,
    s.sent_count
FROM sends s
JOIN users u ON s.sender_user_id = u.id
JOIN labels lb ON s.label_id = lb.id
JOIN locations l ON lb.location_id = l.id
WHERE l.slug = 'paris_office'
ORDER BY u.name, lb.code;

-- Success message
SELECT 'Test send records created successfully!' as status;
