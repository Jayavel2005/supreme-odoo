import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Team {
  id: string;
  name: string;
  description: string | null;
  department: string | null;
  team_lead_id: string | null;
  created_at: string;
  updated_at: string;
  profiles?: { id: string; full_name: string | null } | null;
  team_members?: Array<{ user: { id: string; full_name: string | null } }>;
}

export function useTeams() {
  return useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .order('name');

      if (error) throw error;
      return data as Team[];
    },
  });
}

export function useTeamById(id: string) {
  return useQuery({
    queryKey: ['teams', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teams')
        .select('*, profiles:team_lead_id(id, full_name)')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data as Team | null;
    },
    enabled: !!id,
  });
}

export function useCreateTeam() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (team: { name: string; description?: string; department?: string }) => {
      const { data, error } = await supabase
        .from('teams')
        .insert(team)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['teams'] });
      toast({ title: 'Team created successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error creating team', description: error.message, variant: 'destructive' });
    },
  });
}
