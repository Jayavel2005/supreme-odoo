import { supabase } from '@/integrations/supabase/client';

export async function createDemoAccounts() {
  const demoAccounts = [
    {
      email: 'admin@demo.com',
      password: 'admin123',
      full_name: 'Admin User',
      role: 'admin',
      department: 'Management',
    },
    {
      email: 'technician@demo.com',
      password: 'tech123',
      full_name: 'John Technician',
      role: 'technician',
      department: 'Maintenance',
    },
    {
      email: 'employee@demo.com',
      password: 'employee123',
      full_name: 'Jane Employee',
      role: 'manager',
      department: 'Operations',
    },
  ];

  const results = [];

  for (const account of demoAccounts) {
    try {
      // Check if user already exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', (await supabase.auth.admin.listUsers()).data.users.find(u => u.email === account.email)?.id || '')
        .maybeSingle();

      if (existingProfile) {
        results.push({ email: account.email, status: 'already exists' });
        continue;
      }

      // Create user (This will only work if you have service role key)
      // For production, you should create these manually in Supabase Dashboard
      results.push({ 
        email: account.email, 
        status: 'Please create manually in Supabase Dashboard',
        credentials: `${account.email} / ${account.password}`,
        role: account.role
      });

    } catch (error) {
      results.push({ email: account.email, status: 'error', error: error.message });
    }
  }

  return results;
}

export const DEMO_ACCOUNTS = {
  admin: {
    email: 'admin@demo.com',
    password: 'admin123',
    role: 'admin',
  },
  technician: {
    email: 'technician@demo.com',
    password: 'tech123',
    role: 'technician',
  },
  employee: {
    email: 'employee@demo.com',
    password: 'employee123',
    role: 'manager',
  },
};
