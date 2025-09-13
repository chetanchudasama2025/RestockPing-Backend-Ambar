-- Seed data for labels table - Electronics Products
INSERT INTO labels (location_id, code, name, synonyms, active) 
SELECT id, 'SMARTPHONE', 'Smartphones', 'Mobile Phones,Cell Phones,iPhone,Android', TRUE 
FROM locations WHERE slug='ny_office';

INSERT INTO labels (location_id, code, name, synonyms, active) 
SELECT id, 'LAPTOP', 'Laptops', 'Notebooks,MacBook,Windows Laptop,Chromebook', TRUE 
FROM locations WHERE slug='london_office';

INSERT INTO labels (location_id, code, name, synonyms, active) 
SELECT id, 'TABLET', 'Tablets', 'iPad,Android Tablet,Surface,Kindle', TRUE 
FROM locations WHERE slug='sf_office';

INSERT INTO labels (location_id, code, name, synonyms, active) 
SELECT id, 'HEADPHONES', 'Headphones', 'Earbuds,AirPods,Wireless Headphones,Noise Cancelling', TRUE 
FROM locations WHERE slug='tokyo_office';

INSERT INTO labels (location_id, code, name, synonyms, active) 
SELECT id, 'CAMERA', 'Cameras', 'DSLR,Mirrorless,Action Camera,Webcam', TRUE 
FROM locations WHERE slug='berlin_office';

INSERT INTO labels (location_id, code, name, synonyms, active) 
SELECT id, 'GAMING', 'Gaming', 'Gaming Console,PS5,Xbox,Nintendo Switch,Gaming PC', TRUE 
FROM locations WHERE slug='sydney_office';

INSERT INTO labels (location_id, code, name, synonyms, active) 
SELECT id, 'SMARTWATCH', 'Smartwatches', 'Apple Watch,Fitbit,Garmin,Wearable Tech', TRUE 
FROM locations WHERE slug='ny_office';

INSERT INTO labels (location_id, code, name, synonyms, active) 
SELECT id, 'TV', 'Televisions', 'Smart TV,4K TV,OLED,LED,Home Theater', TRUE 
FROM locations WHERE slug='london_office';

-- Paris Office labels
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