-- Update team pins with user names for Paris Office
-- This seeder runs after all other data is created

-- Update Paris Office team pins with user names
UPDATE team_pins 
SET user_name = 'Marie Dubois'
WHERE location_id IN (SELECT id FROM locations WHERE slug = 'paris_office')
AND pin_hash = '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4';

UPDATE team_pins 
SET user_name = 'Pierre Martin'
WHERE location_id IN (SELECT id FROM locations WHERE slug = 'paris_office')
AND pin_hash = 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';

UPDATE team_pins 
SET user_name = 'Alice Johnson'
WHERE location_id IN (SELECT id FROM locations WHERE slug = 'paris_office')
AND pin_hash = '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08';

-- Add user names for other locations as well
UPDATE team_pins 
SET user_name = 'Alice Johnson'
WHERE location_id IN (SELECT id FROM locations WHERE slug = 'ny_office')
AND pin_hash = 'hashedpin123456789';

UPDATE team_pins 
SET user_name = 'Bob Smith'
WHERE location_id IN (SELECT id FROM locations WHERE slug = 'london_office')
AND pin_hash = 'hashedpin987654321';

UPDATE team_pins 
SET user_name = 'Carol Davis'
WHERE location_id IN (SELECT id FROM locations WHERE slug = 'sf_office')
AND pin_hash = 'hashedpin456789123';

UPDATE team_pins 
SET user_name = 'David Wilson'
WHERE location_id IN (SELECT id FROM locations WHERE slug = 'berlin_office')
AND pin_hash = 'hashedpin321654987';

UPDATE team_pins 
SET user_name = 'Emma Brown'
WHERE location_id IN (SELECT id FROM locations WHERE slug = 'sydney_office')
AND pin_hash = 'hashedpin654987321';
