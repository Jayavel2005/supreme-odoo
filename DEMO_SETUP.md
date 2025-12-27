# Demo Account Setup Instructions

This guide will help you create demo accounts for testing different user roles in GearGuard.

## Demo Account Credentials

The system supports three role types with different dashboard views:

| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| **Admin** | admin@demo.com | admin123 | Full system access, all features |
| **Technician** | technician@demo.com | tech123 | Assigned work view only |
| **Employee** | employee@demo.com | employee123 | Personal requests view only |

## Setup Steps

### Option 1: Manual Setup via Supabase Dashboard (Recommended)

1. **Go to Supabase Dashboard**
   - Navigate to https://supabase.com/dashboard
   - Select your GearGuard project

2. **Create Auth Users**
   - Go to **Authentication** → **Users**
   - Click **Add user** → **Create new user**
   - Create each user with the credentials above:
     * Email: `admin@demo.com`, Password: `admin123`
     * Email: `technician@demo.com`, Password: `tech123`
     * Email: `employee@demo.com`, Password: `employee123`
   - ✅ Check "Auto Confirm User" for all accounts

3. **Update User Profiles**
   - Go to **Table Editor** → **profiles** table
   - Find each user by email and update:

   **Admin Account:**
   ```
   email: admin@demo.com
   role: admin
   full_name: Demo Admin
   department: Administration
   ```

   **Technician Account:**
   ```
   email: technician@demo.com
   role: technician
   full_name: Demo Technician
   department: Maintenance
   ```

   **Employee Account:**
   ```
   email: employee@demo.com
   role: manager
   full_name: Demo Employee
   department: Operations
   ```

### Option 2: SQL Migration (After Auth Users Exist)

If you've already created the auth users manually, you can run the migration:

```bash
supabase db push
```

This will apply the migration in `supabase/migrations/20251227140000_create_demo_accounts.sql` which updates the profiles table with the correct roles.

## Testing the Demo Accounts

1. **Start the dev server** (if not running):
   ```bash
   npm run dev
   ```

2. **Navigate to login page**:
   - Go to http://localhost:8081
   - You'll see the demo accounts displayed on the right side

3. **Test each role**:
   
   **Admin Dashboard:**
   - Login with `admin@demo.com` / `admin123`
   - You should see: Complete system overview, all equipment, all requests, all teams
   - Access to all management features

   **Technician Dashboard:**
   - Login with `technician@demo.com` / `tech123`
   - You should see: Only work assigned to you, active/pending/completed stats
   - Limited to viewing assigned tasks

   **Employee Dashboard:**
   - Login with `employee@demo.com` / `employee123`
   - You should see: Only requests you created, personal stats
   - Can create new requests but not manage others

## What Each Role Can Do

### Admin (role: 'admin')
- ✅ View all equipment and requests
- ✅ Create/edit/delete equipment
- ✅ Assign work to technicians
- ✅ Manage teams
- ✅ View complete Kanban board
- ✅ Access maintenance calendar
- ✅ View all analytics and reports

### Technician (role: 'technician')
- ✅ View work assigned to them
- ✅ Update status of assigned tasks
- ✅ View equipment details
- ❌ Cannot create new requests
- ❌ Cannot assign work to others
- ❌ Limited calendar view

### Employee (role: 'manager')
- ✅ Create maintenance requests
- ✅ View their own requests
- ✅ Track request status
- ❌ Cannot see other users' requests
- ❌ Cannot assign work
- ❌ Cannot manage equipment or teams

## Troubleshooting

### "Invalid login credentials" error
- Ensure you created the auth users in Supabase Dashboard
- Verify email/password match exactly
- Check that "Auto Confirm User" was enabled

### Dashboard shows wrong role
- Check the `profiles` table in Supabase
- Ensure the `role` column matches the expected value
- Run the SQL migration to fix roles

### Profile not found error
- The auth user was created but profile wasn't
- Check if there's a database trigger to create profiles on signup
- Manually insert a profile row matching the auth user's ID

## Notes

- Demo accounts are visible on the login page only (not on signup page)
- Passwords are visible for demo purposes - don't use in production!
- You can create additional test users with any role by signing up and manually updating their profile role
