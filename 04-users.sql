-- =====================================================
-- USERS TABLE SCRIPT
-- =====================================================
-- Run this fourth to create the team users

INSERT INTO users (id, name, email)
VALUES 
  ('98392a05-d8a5-49ae-ae17-3a2a4a44c7ce', 'Marie Dubois', 'marie.dubois@restockping.com'),
  ('703f2125-cb50-406b-ac9c-eef6cdfcd33c', 'Pierre Martin', 'pierre.martin@restockping.com'),
  ('8d5a4ffc-a94c-490d-b6c2-d40e3ec6dd6d', 'Marie Dubois', 'marie.dubois@restockping.com'),
  ('c3d4e5f6-7h8i-9012-cdef-345678901234', 'Alice Johnson', 'alice.johnson@restockping.com'),
  ('d4e5f6g7-8i9j-0123-defg-456789012345', 'Bob Smith', 'bob.smith@restockping.com'),
  ('e5f6g7h8-9j0k-1234-efgh-567890123456', 'Carol Davis', 'carol.davis@restockping.com')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email;

-- Verify the users were created
SELECT 
    'USERS CREATED' as status,
    id,
    name,
    email
FROM users 
ORDER BY name;

-- Success message
SELECT 'Team users created successfully!' as status;
