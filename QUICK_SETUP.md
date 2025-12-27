# Quick Demo Account Setup Guide

Follow these steps to create demo accounts for testing GearGuard:

## Step-by-Step Instructions

### 1. Open Supabase Dashboard
- Go to https://supabase.com/dashboard
- Select your GearGuard project

### 2. Create Auth Users (3 accounts)

Go to **Authentication** → **Users** → Click **Add user** → Select **Create new user**

Create these three users:

#### Account 1: Admin
- Email: `admin@demo.com`
- Password: `admin123`
- ✅ **Check "Auto Confirm User"**
- Click **Create user**

#### Account 2: Technician
- Email: `technician@demo.com`
- Password: `tech123`
- ✅ **Check "Auto Confirm User"**
- Click **Create user**

#### Account 3: Employee
- Email: `employee@demo.com`
- Password: `employee123`
- ✅ **Check "Auto Confirm User"**
- Click **Create user**

### 3. Set Up Profiles

Go to **SQL Editor** → Click **New query** → Paste and run this:

```sql
-- Update admin profile
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

-- Update technician profile
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

-- Update employee profile
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
```

Click **Run** (or press Ctrl+Enter)

### 4. Test the Accounts

Go to your app at http://localhost:8081 and try logging in with each account:

| Role | Email | Password | What You'll See |
|------|-------|----------|-----------------|
| **Admin** | admin@demo.com | admin123 | Full dashboard with all features |
| **Technician** | technician@demo.com | tech123 | Work assigned to you only |
| **Employee** | employee@demo.com | employee123 | Your requests only |

## Verification

To verify the setup worked, run this query in SQL Editor:

```sql
SELECT 
  p.email,
  p.full_name,
  p.role,
  p.department
FROM profiles p
WHERE p.email IN ('admin@demo.com', 'technician@demo.com', 'employee@demo.com')
ORDER BY 
  CASE p.role 
    WHEN 'admin' THEN 1 
    WHEN 'technician' THEN 2 
    WHEN 'manager' THEN 3 
  END;
```

You should see all three accounts with their correct roles.

## Troubleshooting

**"Invalid login credentials"**
- Make sure you checked "Auto Confirm User" when creating the auth users
- Verify the email/password match exactly

**"Profile not found"**
- Run the SQL script again in SQL Editor
- Check that auth users were created first

**Dashboard shows wrong view**
- Verify the `role` column in the profiles table
- Admin should have role: `admin`
- Technician should have role: `technician`
- Employee should have role: `manager`

---

That's it! Your demo accounts are ready to use. 🎉
