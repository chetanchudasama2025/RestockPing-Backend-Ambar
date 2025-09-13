-- Seed data for requests table - Electronics Product Requests
INSERT INTO requests (location_id, text, image_url, status) 
SELECT id, 'iPhone 15 Pro Max 256GB - Space Black', '', 'open' 
FROM locations WHERE slug='ny_office';

INSERT INTO requests (location_id, text, image_url, status) 
SELECT id, 'MacBook Pro 16-inch M3 Max - Space Gray', '', 'open' 
FROM locations WHERE slug='london_office';

INSERT INTO requests (location_id, text, image_url, status) 
SELECT id, 'iPad Pro 12.9-inch M2 - Silver', '', 'mapped' 
FROM locations WHERE slug='sf_office';

INSERT INTO requests (location_id, text, image_url, status) 
SELECT id, 'Sony WH-1000XM5 Wireless Noise Cancelling Headphones', '', 'open' 
FROM locations WHERE slug='tokyo_office';

INSERT INTO requests (location_id, text, image_url, status) 
SELECT id, 'Canon EOS R5 Mirrorless Camera with 24-70mm Lens', '', 'closed' 
FROM locations WHERE slug='berlin_office';

INSERT INTO requests (location_id, text, image_url, status) 
SELECT id, 'PlayStation 5 Console - Digital Edition', '', 'open' 
FROM locations WHERE slug='sydney_office';

INSERT INTO requests (location_id, text, image_url, status) 
SELECT id, 'Apple Watch Series 9 GPS + Cellular 45mm - Midnight', '', 'mapped' 
FROM locations WHERE slug='ny_office';

INSERT INTO requests (location_id, text, image_url, status) 
SELECT id, 'Samsung 65-inch QLED 4K Smart TV', '', 'open' 
FROM locations WHERE slug='london_office';

INSERT INTO requests (location_id, text, image_url, status) 
SELECT id, 'Samsung Galaxy S24 Ultra 512GB - Titanium Black', '', 'open' 
FROM locations WHERE slug='sf_office';

INSERT INTO requests (location_id, text, image_url, status) 
SELECT id, 'AirPods Pro 2nd Generation with MagSafe Case', '', 'mapped' 
FROM locations WHERE slug='tokyo_office';

-- Paris Office requests for dashboard data
INSERT INTO requests (location_id, text, image_url, status) 
SELECT id, 'DJI Mavic 3 Pro Drone with 4K Camera', '', 'open' 
FROM locations WHERE slug='paris_office';

INSERT INTO requests (location_id, text, image_url, status) 
SELECT id, 'iPhone 15 Pro 256GB - Natural Titanium', '', 'mapped' 
FROM locations WHERE slug='paris_office';

INSERT INTO requests (location_id, text, image_url, status) 
SELECT id, 'MacBook Air M2 13-inch - Midnight', '', 'open' 
FROM locations WHERE slug='paris_office';

INSERT INTO requests (location_id, text, image_url, status) 
SELECT id, 'Samsung 27-inch 4K Monitor - Space Gray', '', 'closed' 
FROM locations WHERE slug='paris_office';

INSERT INTO requests (location_id, text, image_url, status) 
SELECT id, 'Sony A7R V Mirrorless Camera with 24-70mm Lens', '', 'open' 
FROM locations WHERE slug='paris_office';

INSERT INTO requests (location_id, text, image_url, status) 
SELECT id, 'Apple Watch Ultra 2 GPS + Cellular 49mm - Titanium', '', 'mapped' 
FROM locations WHERE slug='paris_office';