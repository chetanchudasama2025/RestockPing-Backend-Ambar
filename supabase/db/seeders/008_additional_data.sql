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

-- Add Paris Office team users
INSERT INTO users (email, name, role) VALUES 
    ('marie.dubois@restockping.com', 'Marie Dubois', 'owner'),
    ('pierre.martin@restockping.com', 'Pierre Martin', 'team'),
    ('alice.johnson@restockping.com', 'Alice Johnson', 'owner'),
    ('bob.smith@restockping.com', 'Bob Smith', 'team'),
    ('carol.davis@restockping.com', 'Carol Davis', 'team');

-- Add more electronics product labels for new locations
INSERT INTO labels (location_id, code, name, synonyms, active) 
SELECT id, 'SPEAKER', 'Speakers', 'Bluetooth Speaker,Smart Speaker,Home Audio,Sound System', TRUE 
FROM locations WHERE slug='toronto_office';

-- Add comprehensive labels for Paris Office
INSERT INTO labels (location_id, code, name, synonyms, active) 
SELECT id, 'DRONE', 'Drones', 'Quadcopter,FPV Drone,Camera Drone,Professional Drone', TRUE 
FROM locations WHERE slug='paris_office';

INSERT INTO labels (location_id, code, name, synonyms, active) 
SELECT id, 'PHONE', 'Smartphones', 'Mobile Phones,Cell Phones,iPhone,Android', TRUE 
FROM locations WHERE slug='paris_office';

INSERT INTO labels (location_id, code, name, synonyms, active) 
SELECT id, 'LAPTOP', 'Laptops', 'Notebooks,MacBook,Windows Laptop,Chromebook', TRUE 
FROM locations WHERE slug='paris_office';

INSERT INTO labels (location_id, code, name, synonyms, active) 
SELECT id, 'MONITOR', 'Monitors', 'Computer Monitor,4K Monitor,Gaming Monitor,Ultrawide', TRUE 
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

-- Paris Office team pins are now handled in 005_team_pins.sql

-- Add more optins with different statuses for electronics products
INSERT INTO optins (location_id, label_id, phone_e164, status) 
SELECT l.id, lb.id, '+14165501234', 'active' 
FROM locations l 
JOIN labels lb ON l.id = lb.location_id 
WHERE l.slug='toronto_office' AND lb.code='SPEAKER';

-- Add comprehensive optins for Paris Office
INSERT INTO optins (location_id, label_id, phone_e164, status) 
SELECT l.id, lb.id, '+33123456789', 'active' 
FROM locations l 
JOIN labels lb ON l.id = lb.location_id 
WHERE l.slug='paris_office' AND lb.code='DRONE';

INSERT INTO optins (location_id, label_id, phone_e164, status) 
SELECT l.id, lb.id, '+33987654321', 'active' 
FROM locations l 
JOIN labels lb ON l.id = lb.location_id 
WHERE l.slug='paris_office' AND lb.code='DRONE';

INSERT INTO optins (location_id, label_id, phone_e164, status) 
SELECT l.id, lb.id, '+33555555555', 'active' 
FROM locations l 
JOIN labels lb ON l.id = lb.location_id 
WHERE l.slug='paris_office' AND lb.code='DRONE';

INSERT INTO optins (location_id, label_id, phone_e164, status) 
SELECT l.id, lb.id, '+33111223344', 'alerted' 
FROM locations l 
JOIN labels lb ON l.id = lb.location_id 
WHERE l.slug='paris_office' AND lb.code='DRONE';

INSERT INTO optins (location_id, label_id, phone_e164, status) 
SELECT l.id, lb.id, '+33998877665', 'unsub' 
FROM locations l 
JOIN labels lb ON l.id = lb.location_id 
WHERE l.slug='paris_office' AND lb.code='DRONE';

INSERT INTO optins (location_id, label_id, phone_e164, status) 
SELECT l.id, lb.id, '+33123456789', 'active' 
FROM locations l 
JOIN labels lb ON l.id = lb.location_id 
WHERE l.slug='paris_office' AND lb.code='PHONE';

INSERT INTO optins (location_id, label_id, phone_e164, status) 
SELECT l.id, lb.id, '+33987654321', 'active' 
FROM locations l 
JOIN labels lb ON l.id = lb.location_id 
WHERE l.slug='paris_office' AND lb.code='LAPTOP';

-- Add more sends with different user combinations for electronics products
INSERT INTO sends (location_id, label_id, count_sent, sender_user_id) 
SELECT l.id, lb.id, 2, u.id 
FROM locations l 
JOIN labels lb ON l.id = lb.location_id 
JOIN users u ON u.email='isabella.qa@company.com' 
WHERE l.slug='toronto_office' AND lb.code='SPEAKER';

-- Add comprehensive sends for Paris Office
INSERT INTO sends (location_id, label_id, count_sent, sender_user_id) 
SELECT l.id, lb.id, 3, u.id 
FROM locations l 
JOIN labels lb ON l.id = lb.location_id 
JOIN users u ON u.email='marie.dubois@restockping.com' 
WHERE l.slug='paris_office' AND lb.code='DRONE';

INSERT INTO sends (location_id, label_id, count_sent, sender_user_id) 
SELECT l.id, lb.id, 2, u.id 
FROM locations l 
JOIN labels lb ON l.id = lb.location_id 
JOIN users u ON u.email='pierre.martin@restockping.com' 
WHERE l.slug='paris_office' AND lb.code='DRONE';

INSERT INTO sends (location_id, label_id, count_sent, sender_user_id) 
SELECT l.id, lb.id, 4, u.id 
FROM locations l 
JOIN labels lb ON l.id = lb.location_id 
JOIN users u ON u.email='alice.johnson@restockping.com' 
WHERE l.slug='paris_office' AND lb.code='DRONE';

INSERT INTO sends (location_id, label_id, count_sent, sender_user_id) 
SELECT l.id, lb.id, 2, u.id 
FROM locations l 
JOIN labels lb ON l.id = lb.location_id 
JOIN users u ON u.email='bob.smith@restockping.com' 
WHERE l.slug='paris_office' AND lb.code='PHONE';

INSERT INTO sends (location_id, label_id, count_sent, sender_user_id) 
SELECT l.id, lb.id, 1, u.id 
FROM locations l 
JOIN labels lb ON l.id = lb.location_id 
JOIN users u ON u.email='carol.davis@restockping.com' 
WHERE l.slug='paris_office' AND lb.code='LAPTOP';
