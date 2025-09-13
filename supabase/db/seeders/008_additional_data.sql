-- Additional comprehensive data for Paris Office dashboard
-- This file provides rich dashboard data for testing and demonstration

-- Additional Paris Office users for team management
INSERT INTO users (email, name, role) VALUES 
    ('sophie.bernard@restockping.com', 'Sophie Bernard', 'team'),
    ('jean.moreau@restockping.com', 'Jean Moreau', 'team'),
    ('claire.lefebvre@restockping.com', 'Claire Lefebvre', 'owner')
ON CONFLICT (email) DO NOTHING;

-- Additional Paris Office team pins for different users
INSERT INTO team_pins (location_id, pin_hash, user_name, active) 
SELECT id, encode(digest('sophie', 'sha256'), 'Sophie Bernard', TRUE
FROM locations WHERE slug='paris_office';

INSERT INTO team_pins (location_id, pin_hash, user_name, active) 
SELECT id, encode(digest('jean', 'sha256'), 'Jean Moreau', TRUE
FROM locations WHERE slug='paris_office';

INSERT INTO team_pins (location_id, pin_hash, user_name, active) 
SELECT id, encode(digest('claire', 'sha256'), 'Claire Lefebvre', TRUE
FROM locations WHERE slug='paris_office';

-- Additional Paris Office requests for comprehensive dashboard data
INSERT INTO requests (location_id, text, image_url, status) 
SELECT id, 'DJI Mini 3 Pro Drone with RC Controller', '', 'open' 
FROM locations WHERE slug='paris_office';

INSERT INTO requests (location_id, text, image_url, status) 
SELECT id, 'Samsung Galaxy S24+ 512GB - Cobalt Violet', '', 'mapped' 
FROM locations WHERE slug='paris_office';

INSERT INTO requests (location_id, text, image_url, status) 
SELECT id, 'Dell XPS 15 9530 Laptop - Intel i7, 32GB RAM', '', 'open' 
FROM locations WHERE slug='paris_office';

INSERT INTO requests (location_id, text, image_url, status) 
SELECT id, 'LG UltraWide 34-inch 4K Monitor - Curved', '', 'closed' 
FROM locations WHERE slug='paris_office';

INSERT INTO requests (location_id, text, image_url, status) 
SELECT id, 'Canon EOS R6 Mark II Mirrorless Camera', '', 'mapped' 
FROM locations WHERE slug='paris_office';

INSERT INTO requests (location_id, text, image_url, status) 
SELECT id, 'Apple MacBook Pro 14-inch M3 Pro - Space Black', '', 'open' 
FROM locations WHERE slug='paris_office';

INSERT INTO requests (location_id, text, image_url, status) 
SELECT id, 'Sony WH-1000XM5 Wireless Headphones - Black', '', 'open' 
FROM locations WHERE slug='paris_office';

INSERT INTO requests (location_id, text, image_url, status) 
SELECT id, 'iPad Pro 12.9-inch M2 - Space Gray', '', 'mapped' 
FROM locations WHERE slug='paris_office';

-- Additional Paris Office optins for different phone numbers
INSERT INTO optins (location_id, label_id, phone_e164, status) 
SELECT l.id, lb.id, '+33123456789', 'active' 
FROM locations l 
JOIN labels lb ON l.id = lb.location_id 
WHERE l.slug='paris_office' AND lb.code='DRONE';

INSERT INTO optins (location_id, label_id, phone_e164, status) 
SELECT l.id, lb.id, '+33987654321', 'active' 
FROM locations l 
JOIN labels lb ON l.id = lb.location_id 
WHERE l.slug='paris_office' AND lb.code='PHONE';

INSERT INTO optins (location_id, label_id, phone_e164, status) 
SELECT l.id, lb.id, '+33555555555', 'alerted' 
FROM locations l 
JOIN labels lb ON l.id = lb.location_id 
WHERE l.slug='paris_office' AND lb.code='LAPTOP';

INSERT INTO optins (location_id, label_id, phone_e164, status) 
SELECT l.id, lb.id, '+33111223344', 'unsub' 
FROM locations l 
JOIN labels lb ON l.id = lb.location_id 
WHERE l.slug='paris_office' AND lb.code='MONITOR';

-- Additional Paris Office sends for comprehensive analytics
INSERT INTO sends (location_id, label_id, count_sent, sender_user_id) 
SELECT l.id, lb.id, 5, u.id 
FROM locations l 
JOIN labels lb ON l.id = lb.location_id 
JOIN users u ON u.email='sophie.bernard@restockping.com' 
WHERE l.slug='paris_office' AND lb.code='DRONE';

INSERT INTO sends (location_id, label_id, count_sent, sender_user_id) 
SELECT l.id, lb.id, 3, u.id 
FROM locations l 
JOIN labels lb ON l.id = lb.location_id 
JOIN users u ON u.email='jean.moreau@restockping.com' 
WHERE l.slug='paris_office' AND lb.code='PHONE';

INSERT INTO sends (location_id, label_id, count_sent, sender_user_id) 
SELECT l.id, lb.id, 2, u.id 
FROM locations l 
JOIN labels lb ON l.id = lb.location_id 
JOIN users u ON u.email='claire.lefebvre@restockping.com' 
WHERE l.slug='paris_office' AND lb.code='LAPTOP';

INSERT INTO sends (location_id, label_id, count_sent, sender_user_id) 
SELECT l.id, lb.id, 4, u.id 
FROM locations l 
JOIN labels lb ON l.id = lb.location_id 
JOIN users u ON u.email='sophie.bernard@restockping.com' 
WHERE l.slug='paris_office' AND lb.code='MONITOR';

INSERT INTO sends (location_id, label_id, count_sent, sender_user_id) 
SELECT l.id, lb.id, 1, u.id 
FROM locations l 
JOIN labels lb ON l.id = lb.location_id 
JOIN users u ON u.email='jean.moreau@restockping.com' 
WHERE l.slug='paris_office' AND lb.code='DRONE';

INSERT INTO sends (location_id, label_id, count_sent, sender_user_id) 
SELECT l.id, lb.id, 6, u.id 
FROM locations l 
JOIN labels lb ON l.id = lb.location_id 
JOIN users u ON u.email='claire.lefebvre@restockping.com' 
WHERE l.slug='paris_office' AND lb.code='PHONE';