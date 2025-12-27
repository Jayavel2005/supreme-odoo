import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Equipment {
  id: string;
  name: string;
  serial_number: string;
  category: string;
  subcategory: string | null;
  department: string;
  location: string | null;
  team_id: string | null;
  assigned_to: string | null;
  purchase_date: string | null;
  warranty_expiry: string | null;
  original_cost: number | null;
  status: 'active' | 'maintenance' | 'inactive' | 'scrap';
  last_serviced: string | null;
  next_scheduled: string | null;
  health_score: number | null;
  created_at: string;
  updated_at: string;
  teams?: { id: string; name: string } | null;
  profiles?: { id: string; full_name: string | null } | null;
}

export function useEquipment() {
  return useQuery({
    queryKey: ['equipment'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('equipment')
        .select('*, teams(id, name), profiles:assigned_to(id, full_name)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Equipment[];
    },
  });
}

export function useEquipmentById(id: string) {
  return useQuery({
    queryKey: ['equipment', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('equipment')
        .select('*, teams(id, name), profiles:assigned_to(id, full_name)')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data as Equipment | null;
    },
    enabled: !!id,
  });
}

export function useCreateEquipment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (equipment: Omit<Equipment, 'id' | 'created_at' | 'updated_at' | 'teams' | 'profiles'>) => {
      const { data, error } = await supabase
        .from('equipment')
        .insert(equipment)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      toast({ title: 'Equipment created successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error creating equipment', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateEquipment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Equipment> & { id: string }) => {
      const { data, error } = await supabase
        .from('equipment')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      queryClient.invalidateQueries({ queryKey: ['equipment', variables.id] });
      toast({ title: 'Equipment updated successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error updating equipment', description: error.message, variant: 'destructive' });
    },
  });
}

export function useDeleteEquipment() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('equipment').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
      toast({ title: 'Equipment deleted successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error deleting equipment', description: error.message, variant: 'destructive' });
    },
  });
}
