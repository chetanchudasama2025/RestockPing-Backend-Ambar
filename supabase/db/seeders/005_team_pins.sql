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

-- Paris Office team pins with proper crypto hashes
INSERT INTO team_pins (location_id, pin_hash, active) 
SELECT id, encode(digest('1234', 'sha256'), 'hex'), TRUE
FROM locations WHERE slug='paris_office';

INSERT INTO team_pins (location_id, pin_hash, active) 
SELECT id, encode(digest('paris', 'sha256'), 'hex'), TRUE
FROM locations WHERE slug='paris_office';