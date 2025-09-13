-- Additional seed data for edge cases and comprehensive testing - Electronics Products

-- Add more team members with different roles
INSERT INTO users (email, name, role) VALUES 
    ('isabella.qa@company.com', 'Isabella Rodriguez', 'team'),
    ('james.product@company.com', 'James Thompson', 'owner'),
    ('lisa.support@company.com', 'Lisa Chen', 'team'),
    ('mike.security@company.com', 'Mike Johnson', 'team');

-- Add more locations for comprehensive coverage
INSERT INTO locations (name, slug, timezone) VALUES 
    ('Toronto Office', 'toronto_office', 'America/Toronto'),
    ('Paris Office', 'paris_office', 'Europe/Paris');

-- Add more electronics product labels for new locations
INSERT INTO labels (location_id, code, name, synonyms, active) 
SELECT id, 'SPEAKER', 'Speakers', 'Bluetooth Speaker,Smart Speaker,Home Audio,Sound System', TRUE 
FROM locations WHERE slug='toronto_office';

INSERT INTO labels (location_id, code, name, synonyms, active) 
SELECT id, 'DRONE', 'Drones', 'Quadcopter,FPV Drone,Camera Drone,Professional Drone', TRUE 
FROM locations WHERE slug='paris_office';

-- Add more electronics product requests with different statuses
INSERT INTO requests (location_id, text, image_url, status) 
SELECT id, 'JBL Charge 5 Portable Bluetooth Speaker - Black', '', 'open' 
FROM locations WHERE slug='toronto_office';

INSERT INTO requests (location_id, text, image_url, status) 
SELECT id, 'DJI Mavic 3 Pro Drone with 4K Camera', '', 'mapped' 
FROM locations WHERE slug='paris_office';

INSERT INTO requests (location_id, text, image_url, status) 
SELECT id, 'Nintendo Switch OLED Console - White', '', 'open' 
FROM locations WHERE slug='ny_office';

-- Add more team pins with different states
INSERT INTO team_pins (location_id, pin_hash, active) 
SELECT id, 'toronto_pin_2024', TRUE 
FROM locations WHERE slug='toronto_office';

INSERT INTO team_pins (location_id, pin_hash, active) 
SELECT id, 'paris_pin_2024', FALSE 
FROM locations WHERE slug='paris_office';

-- Add more optins with different statuses for electronics products
INSERT INTO optins (location_id, label_id, phone_e164, status) 
SELECT l.id, lb.id, '+14165501234', 'active' 
FROM locations l 
JOIN labels lb ON l.id = lb.location_id 
WHERE l.slug='toronto_office' AND lb.code='SPEAKER';

INSERT INTO optins (location_id, label_id, phone_e164, status) 
SELECT l.id, lb.id, '+33155505678', 'alerted' 
FROM locations l 
JOIN labels lb ON l.id = lb.location_id 
WHERE l.slug='paris_office' AND lb.code='DRONE';

-- Add more sends with different user combinations for electronics products
INSERT INTO sends (location_id, label_id, count_sent, sender_user_id) 
SELECT l.id, lb.id, 2, u.id 
FROM locations l 
JOIN labels lb ON l.id = lb.location_id 
JOIN users u ON u.email='isabella.qa@company.com' 
WHERE l.slug='toronto_office' AND lb.code='SPEAKER';

INSERT INTO sends (location_id, label_id, count_sent, sender_user_id) 
SELECT l.id, lb.id, 3, u.id 
FROM locations l 
JOIN labels lb ON l.id = lb.location_id 
JOIN users u ON u.email='james.product@company.com' 
WHERE l.slug='paris_office' AND lb.code='DRONE';
