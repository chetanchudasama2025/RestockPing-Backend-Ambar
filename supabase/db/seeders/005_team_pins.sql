-- Seed data for team_pins table
INSERT INTO team_pins (location_id, pin_hash, active) 
SELECT id, 'hashedpin123456789', TRUE 
FROM locations WHERE slug='ny_office';

INSERT INTO team_pins (location_id, pin_hash, active) 
SELECT id, 'hashedpin987654321', TRUE 
FROM locations WHERE slug='london_office';

INSERT INTO team_pins (location_id, pin_hash, active) 
SELECT id, 'hashedpin456789123', TRUE 
FROM locations WHERE slug='sf_office';

INSERT INTO team_pins (location_id, pin_hash, active) 
SELECT id, 'hashedpin789123456', FALSE 
FROM locations WHERE slug='tokyo_office';

INSERT INTO team_pins (location_id, pin_hash, active) 
SELECT id, 'hashedpin321654987', TRUE 
FROM locations WHERE slug='berlin_office';

INSERT INTO team_pins (location_id, pin_hash, active) 
SELECT id, 'hashedpin654987321', TRUE 
FROM locations WHERE slug='sydney_office';

-- Additional backup pins for main offices
INSERT INTO team_pins (location_id, pin_hash, active) 
SELECT id, 'backup_pin_ny_2024', TRUE 
FROM locations WHERE slug='ny_office';

INSERT INTO team_pins (location_id, pin_hash, active) 
SELECT id, 'backup_pin_london_2024', FALSE 
FROM locations WHERE slug='london_office';

-- Paris Office team pins with proper PIN "1234" for login
INSERT INTO team_pins (location_id, pin_hash, active) 
SELECT id, '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4', TRUE 
FROM locations WHERE slug='paris_office';

INSERT INTO team_pins (location_id, pin_hash, active) 
SELECT id, 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', TRUE 
FROM locations WHERE slug='paris_office';

INSERT INTO team_pins (location_id, pin_hash, active) 
SELECT id, '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08', TRUE 
FROM locations WHERE slug='paris_office';