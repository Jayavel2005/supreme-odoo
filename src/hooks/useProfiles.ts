import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Profile {
  id: string;
  full_name: string | null;
  role: 'admin' | 'manager' | 'technician';
  team_id: string | null;
  department: string | null;
  avatar_url: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
}

export function useProfiles() {
  return useQuery({
    queryKey: ['profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name');

      if (error) throw error;
      return data as Profile[];
    },
  });
}

export function useProfilesByTeam(teamId: string | null) {
  return useQuery({
    queryKey: ['profiles', 'team', teamId],
    queryFn: async () => {
      if (!teamId) return [];
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('team_id', teamId)
        .order('full_name');

      if (error) throw error;
      return data as Profile[];
    },
    enabled: !!teamId,
  });
}
