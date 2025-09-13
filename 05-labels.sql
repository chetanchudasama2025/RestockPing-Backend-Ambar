-- =====================================================
-- LABELS TABLE SCRIPT
-- =====================================================
-- Run this fifth to create the product labels for Paris Office

INSERT INTO labels (id, location_id, code, name, synonyms, active)
VALUES 
  (gen_random_uuid(), '9e70b28a-5217-4a1e-b9f9-4b0c102c6a78', 'DRONE', 'Drones', 'Quadcopter,FPV Drone,Camera Drone,Professional Drone', true),
  (gen_random_uuid(), '9e70b28a-5217-4a1e-b9f9-4b0c102c6a78', 'PHONE', 'Smartphones', 'Mobile Phones,Cell Phones,iPhone,Android', true),
  (gen_random_uuid(), '9e70b28a-5217-4a1e-b9f9-4b0c102c6a78', 'LAPTOP', 'Laptops', 'Notebooks,MacBook,Windows Laptop,Chromebook', true),
  (gen_random_uuid(), '9e70b28a-5217-4a1e-b9f9-4b0c102c6a78', 'MONITOR', 'Monitors', 'Computer Monitor,4K Monitor,Gaming Monitor,Ultrawide', true)
ON CONFLICT (location_id, code) DO UPDATE SET
  name = EXCLUDED.name,
  synonyms = EXCLUDED.synonyms,
  active = EXCLUDED.active;

-- Verify the labels were created
SELECT 
    'LABELS CREATED' as status,
    l.name as location_name,
    lb.code,
    lb.name,
    lb.synonyms,
    lb.active
FROM labels lb
JOIN locations l ON lb.location_id = l.id
WHERE l.slug = 'paris_office'
ORDER BY lb.code;

-- Success message
SELECT 'Product labels created successfully!' as status;
