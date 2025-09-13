-- Seed data for optins table - Electronics Product Subscriptions
INSERT INTO optins (location_id, label_id, phone_e164, status) 
SELECT l.id, lb.id, '+15550001111', 'active' 
FROM locations l 
JOIN labels lb ON l.id = lb.location_id 
WHERE l.slug='ny_office' AND lb.code='SMARTPHONE';

INSERT INTO optins (location_id, label_id, phone_e164, status) 
SELECT l.id, lb.id, '+44770002222', 'active' 
FROM locations l 
JOIN labels lb ON l.id = lb.location_id 
WHERE l.slug='london_office' AND lb.code='LAPTOP';

INSERT INTO optins (location_id, label_id, phone_e164, status) 
SELECT l.id, lb.id, '+14155503333', 'active' 
FROM locations l 
JOIN labels lb ON l.id = lb.location_id 
WHERE l.slug='sf_office' AND lb.code='TABLET';

INSERT INTO optins (location_id, label_id, phone_e164, status) 
SELECT l.id, lb.id, '+81555504444', 'alerted' 
FROM locations l 
JOIN labels lb ON l.id = lb.location_id 
WHERE l.slug='tokyo_office' AND lb.code='HEADPHONES';

INSERT INTO optins (location_id, label_id, phone_e164, status) 
SELECT l.id, lb.id, '+49555505555', 'active' 
FROM locations l 
JOIN labels lb ON l.id = lb.location_id 
WHERE l.slug='berlin_office' AND lb.code='CAMERA';

INSERT INTO optins (location_id, label_id, phone_e164, status) 
SELECT l.id, lb.id, '+61555506666', 'active' 
FROM locations l 
JOIN labels lb ON l.id = lb.location_id 
WHERE l.slug='sydney_office' AND lb.code='GAMING';

INSERT INTO optins (location_id, label_id, phone_e164, status) 
SELECT l.id, lb.id, '+15550007777', 'unsub' 
FROM locations l 
JOIN labels lb ON l.id = lb.location_id 
WHERE l.slug='ny_office' AND lb.code='SMARTWATCH';

INSERT INTO optins (location_id, label_id, phone_e164, status) 
SELECT l.id, lb.id, '+44770008888', 'active' 
FROM locations l 
JOIN labels lb ON l.id = lb.location_id 
WHERE l.slug='london_office' AND lb.code='TV';

-- Additional optins for different electronics products
INSERT INTO optins (location_id, label_id, phone_e164, status) 
SELECT l.id, lb.id, '+15550009999', 'active' 
FROM locations l 
JOIN labels lb ON l.id = lb.location_id 
WHERE l.slug='ny_office' AND lb.code='LAPTOP';

INSERT INTO optins (location_id, label_id, phone_e164, status) 
SELECT l.id, lb.id, '+44770001000', 'alerted' 
FROM locations l 
JOIN labels lb ON l.id = lb.location_id 
WHERE l.slug='london_office' AND lb.code='SMARTPHONE';

-- Paris Office optins
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
WHERE l.slug='paris_office' AND lb.code='PHONE';

INSERT INTO optins (location_id, label_id, phone_e164, status) 
SELECT l.id, lb.id, '+33111223344', 'alerted' 
FROM locations l 
JOIN labels lb ON l.id = lb.location_id 
WHERE l.slug='paris_office' AND lb.code='LAPTOP';

INSERT INTO optins (location_id, label_id, phone_e164, status) 
SELECT l.id, lb.id, '+33999888777', 'active' 
FROM locations l 
JOIN labels lb ON l.id = lb.location_id 
WHERE l.slug='paris_office' AND lb.code='MONITOR';

INSERT INTO optins (location_id, label_id, phone_e164, status) 
SELECT l.id, lb.id, '+33666777888', 'active' 
FROM locations l 
JOIN labels lb ON l.id = lb.location_id 
WHERE l.slug='paris_office' AND lb.code='PHONE';

INSERT INTO optins (location_id, label_id, phone_e164, status) 
SELECT l.id, lb.id, '+33444555666', 'unsub' 
FROM locations l 
JOIN labels lb ON l.id = lb.location_id 
WHERE l.slug='paris_office' AND lb.code='DRONE';