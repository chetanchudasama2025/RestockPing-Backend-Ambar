-- =====================================================
-- LOCATIONS TABLE SCRIPT
-- =====================================================
-- Run this third to create the Paris Office location

-- Create Paris Office
INSERT INTO locations (id, name, slug, timezone)
VALUES 
  ('9e70b28a-5217-4a1e-b9f9-4b0c102c6a78', 'Paris Office', 'paris_office', 'Europe/Paris')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  slug = EXCLUDED.slug,
  timezone = EXCLUDED.timezone;

-- Verify the location was created
SELECT 
    'LOCATION CREATED' as status,
    id,
    name,
    slug,
    timezone
FROM locations 
WHERE slug = 'paris_office';

-- Success message
SELECT 'Paris Office location created successfully!' as status;
