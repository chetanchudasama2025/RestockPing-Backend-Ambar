-- Seed data for sends table - Electronics Product SMS History
INSERT INTO sends (location_id, label_id, count_sent, sender_user_id) 
SELECT l.id, lb.id, 1, u.id 
FROM locations l 
JOIN labels lb ON l.id = lb.location_id 
JOIN users u ON u.role='owner' 
WHERE l.slug='ny_office' AND lb.code='SMARTPHONE';

INSERT INTO sends (location_id, label_id, count_sent, sender_user_id) 
SELECT l.id, lb.id, 2, u.id 
FROM locations l 
JOIN labels lb ON l.id = lb.location_id 
JOIN users u ON u.role='team' 
WHERE l.slug='london_office' AND lb.code='LAPTOP';

INSERT INTO sends (location_id, label_id, count_sent, sender_user_id) 
SELECT l.id, lb.id, 3, u.id 
FROM locations l 
JOIN labels lb ON l.id = lb.location_id 
JOIN users u ON u.role='owner' 
WHERE l.slug='sf_office' AND lb.code='TABLET';

INSERT INTO sends (location_id, label_id, count_sent, sender_user_id) 
SELECT l.id, lb.id, 1, u.id 
FROM locations l 
JOIN labels lb ON l.id = lb.location_id 
JOIN users u ON u.role='team' 
WHERE l.slug='tokyo_office' AND lb.code='HEADPHONES';

INSERT INTO sends (location_id, label_id, count_sent, sender_user_id) 
SELECT l.id, lb.id, 4, u.id 
FROM locations l 
JOIN labels lb ON l.id = lb.location_id 
JOIN users u ON u.role='owner' 
WHERE l.slug='berlin_office' AND lb.code='CAMERA';

INSERT INTO sends (location_id, label_id, count_sent, sender_user_id) 
SELECT l.id, lb.id, 2, u.id 
FROM locations l 
JOIN labels lb ON l.id = lb.location_id 
JOIN users u ON u.role='team' 
WHERE l.slug='sydney_office' AND lb.code='GAMING';

INSERT INTO sends (location_id, label_id, count_sent, sender_user_id) 
SELECT l.id, lb.id, 1, u.id 
FROM locations l 
JOIN labels lb ON l.id = lb.location_id 
JOIN users u ON u.role='owner' 
WHERE l.slug='ny_office' AND lb.code='SMARTWATCH';

INSERT INTO sends (location_id, label_id, count_sent, sender_user_id) 
SELECT l.id, lb.id, 3, u.id 
FROM locations l 
JOIN labels lb ON l.id = lb.location_id 
JOIN users u ON u.role='team' 
WHERE l.slug='london_office' AND lb.code='TV';

-- Additional sends for different users and electronics products
INSERT INTO sends (location_id, label_id, count_sent, sender_user_id) 
SELECT l.id, lb.id, 2, u.id 
FROM locations l 
JOIN labels lb ON l.id = lb.location_id 
JOIN users u ON u.email='david.engineer@company.com' 
WHERE l.slug='london_office' AND lb.code='LAPTOP';

INSERT INTO sends (location_id, label_id, count_sent, sender_user_id) 
SELECT l.id, lb.id, 1, u.id 
FROM locations l 
JOIN labels lb ON l.id = lb.location_id 
JOIN users u ON u.email='emma.designer@company.com' 
WHERE l.slug='sf_office' AND lb.code='TABLET';

INSERT INTO sends (location_id, label_id, count_sent, sender_user_id) 
SELECT l.id, lb.id, 5, u.id 
FROM locations l 
JOIN labels lb ON l.id = lb.location_id 
JOIN users u ON u.email='frank.analyst@company.com' 
WHERE l.slug='berlin_office' AND lb.code='CAMERA';

-- Paris Office sends
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
JOIN users u ON u.email='marie.dubois@restockping.com' 
WHERE l.slug='paris_office' AND lb.code='PHONE';

INSERT INTO sends (location_id, label_id, count_sent, sender_user_id) 
SELECT l.id, lb.id, 1, u.id 
FROM locations l 
JOIN labels lb ON l.id = lb.location_id 
JOIN users u ON u.email='pierre.martin@restockping.com' 
WHERE l.slug='paris_office' AND lb.code='LAPTOP';