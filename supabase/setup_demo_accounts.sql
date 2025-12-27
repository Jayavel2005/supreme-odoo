-- ============================================
-- GearGuard Demo Accounts Setup Script
-- ============================================
-- Run this in Supabase SQL Editor after creating auth users
-- 
-- STEP 1: First create auth users in Supabase Dashboard:
--   Go to Authentication > Users > Add user
--   - admin@demo.com (password: admin123)
--   - technician@demo.com (password: tech123)
--   - employee@demo.com (password: employee123)
--   Remember to check "Auto Confirm User" for each!
--
-- STEP 2: Then run this SQL script to set up their profiles

-- Update or insert admin profile
INSERT INTO profiles (id, email, full_name, role, department, created_at, updated_at)
SELECT 
  au.id,
  'admin@demo.com',
  'Demo Admin',
  'admin',
  'Administration',
  NOW(),
  NOW()
FROM auth.users au
WHERE au.email = 'admin@demo.com'
ON CONFLICT (id) 
DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  department = EXCLUDED.department,
  updated_at = NOW();

-- Update or insert technician profile
INSERT INTO profiles (id, email, full_name, role, department, created_at, updated_at)
SELECT 
  au.id,
  'technician@demo.com',
  'Demo Technician',
  'technician',
  'Maintenance',
  NOW(),
  NOW()
FROM auth.users au
WHERE au.email = 'technician@demo.com'
ON CONFLICT (id) 
DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  department = EXCLUDED.department,
  updated_at = NOW();

-- Update or insert employee profile
INSERT INTO profiles (id, email, full_name, role, department, created_at, updated_at)
SELECT 
  au.id,
  'employee@demo.com',
  'Demo Employee',
  'manager',
  'Operations',
  NOW(),
  NOW()
FROM auth.users au
WHERE au.email = 'employee@demo.com'
ON CONFLICT (id) 
DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role,
  department = EXCLUDED.department,
  updated_at = NOW();

-- Verify the profiles were created
SELECT 
  p.email,
  p.full_name,
  p.role,
  p.department,
  CASE 
    WHEN au.id IS NOT NULL THEN '✓ Auth user exists'
    ELSE '✗ Auth user missing'
  END as auth_status
FROM profiles p
LEFT JOIN auth.users au ON p.id = au.id
WHERE p.email IN ('admin@demo.com', 'technician@demo.com', 'employee@demo.com')
ORDER BY 
  CASE p.role 
    WHEN 'admin' THEN 1 
    WHEN 'technician' THEN 2 
    WHEN 'manager' THEN 3 
  END;
