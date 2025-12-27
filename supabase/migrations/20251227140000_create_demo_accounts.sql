-- Create demo accounts migration
-- This creates three demo accounts with different roles

-- Note: You'll need to manually create these users in Supabase Auth first, then run this migration
-- OR you can use Supabase SQL Editor to create the auth users and update profiles

-- Demo accounts to create in Supabase Auth:
-- 1. admin@demo.com / password: admin123
-- 2. technician@demo.com / password: tech123
-- 3. employee@demo.com / password: employee123

-- After creating the auth users, update their profiles with this SQL:

-- Update profile for admin user
UPDATE public.profiles 
SET 
  role = 'admin',
  full_name = 'Admin User',
  department = 'Management'
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'admin@demo.com'
);

-- Update profile for technician user
UPDATE public.profiles 
SET 
  role = 'technician',
  full_name = 'John Technician',
  department = 'Maintenance'
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'technician@demo.com'
);

-- Update profile for employee user
UPDATE public.profiles 
SET 
  role = 'manager',
  full_name = 'Jane Employee',
  department = 'Operations'
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'employee@demo.com'
);
