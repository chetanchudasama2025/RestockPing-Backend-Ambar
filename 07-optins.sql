-- =====================================================
-- OPTINS TABLE SCRIPT
-- =====================================================
-- Run this seventh to create test subscribers

DO $$
DECLARE
    drone_label_id UUID;
    phone_label_id UUID;
    laptop_label_id UUID;
    monitor_label_id UUID;
BEGIN
    -- Get label IDs for Paris Office
    SELECT id INTO drone_label_id FROM labels WHERE code = 'DRONE' AND location_id = '9e70b28a-5217-4a1e-b9f9-4b0c102c6a78' LIMIT 1;
    SELECT id INTO phone_label_id FROM labels WHERE code = 'PHONE' AND location_id = '9e70b28a-5217-4a1e-b9f9-4b0c102c6a78' LIMIT 1;
    SELECT id INTO laptop_label_id FROM labels WHERE code = 'LAPTOP' AND location_id = '9e70b28a-5217-4a1e-b9f9-4b0c102c6a78' LIMIT 1;
    SELECT id INTO monitor_label_id FROM labels WHERE code = 'MONITOR' AND location_id = '9e70b28a-5217-4a1e-b9f9-4b0c102c6a78' LIMIT 1;
    
    -- Add subscribers for Drones
    IF drone_label_id IS NOT NULL THEN
        INSERT INTO optins (id, phone, label_id, location_id)
        VALUES 
          (gen_random_uuid(), '+33123456789', drone_label_id, '9e70b28a-5217-4a1e-b9f9-4b0c102c6a78'),
          (gen_random_uuid(), '+33987654321', drone_label_id, '9e70b28a-5217-4a1e-b9f9-4b0c102c6a78'),
          (gen_random_uuid(), '+33555555555', drone_label_id, '9e70b28a-5217-4a1e-b9f9-4b0c102c6a78'),
          (gen_random_uuid(), '+33111223344', drone_label_id, '9e70b28a-5217-4a1e-b9f9-4b0c102c6a78'),
          (gen_random_uuid(), '+33998877665', drone_label_id, '9e70b28a-5217-4a1e-b9f9-4b0c102c6a78')
        ON CONFLICT (phone, label_id) DO NOTHING;
    END IF;
    
    -- Add subscribers for other labels if they exist
    IF phone_label_id IS NOT NULL THEN
        INSERT INTO optins (id, phone, label_id, location_id)
        VALUES 
          (gen_random_uuid(), '+33123456789', phone_label_id, '9e70b28a-5217-4a1e-b9f9-4b0c102c6a78'),
          (gen_random_uuid(), '+33987654321', phone_label_id, '9e70b28a-5217-4a1e-b9f9-4b0c102c6a78')
        ON CONFLICT (phone, label_id) DO NOTHING;
    END IF;
    
    RAISE NOTICE 'Added test subscribers for available labels';
END $$;

-- Verify the optins were created
SELECT 
    'OPTINS CREATED' as status,
    o.phone,
    l.name as location_name,
    lb.code as label_code,
    lb.name as label_name
FROM optins o
JOIN locations l ON o.location_id = l.id
JOIN labels lb ON o.label_id = lb.id
WHERE l.slug = 'paris_office'
ORDER BY lb.code, o.phone;

-- Success message
SELECT 'Test subscribers created successfully!' as status;
