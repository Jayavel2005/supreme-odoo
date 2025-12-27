import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type RequestInsert = Database['public']['Tables']['maintenance_requests']['Insert'];

export interface MaintenanceRequest {
  id: string;
  request_number: string;
  subject: string;
  description: string | null;
  request_type: 'corrective' | 'preventive' | 'predictive';
  priority: 'low' | 'medium' | 'high' | 'critical';
  equipment_id: string;
  category: string | null;
  team_id: string | null;
  created_by: string | null;
  assigned_to: string | null;
  stage: 'new' | 'assigned' | 'in_progress' | 'on_hold' | 'repaired' | 'closed' | 'cancelled';
  scheduled_date: string | null;
  scheduled_time: string | null;
  actual_start: string | null;
  actual_end: string | null;
  estimated_hours: number | null;
  actual_hours: number | null;
  estimated_cost: number | null;
  actual_cost: number | null;
  resolution_notes: string | null;
  attachment_urls: string[] | null;
  created_at: string;
  updated_at: string;
  equipment?: { id: string; name: string; serial_number: string; category: string; team_id: string | null; assigned_to: string | null } | null;
  teams?: { id: string; name: string } | null;
  created_by_profile?: { id: string; full_name: string | null } | null;
  assigned_to_profile?: { id: string; full_name: string | null } | null;
}

export function useMaintenanceRequests() {
  return useQuery({
    queryKey: ['maintenance_requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('maintenance_requests')
        .select(`
          *,
          equipment:equipment_id(id, name, serial_number, category, team_id, assigned_to),
          teams:team_id(id, name),
          created_by_profile:created_by(id, full_name),
          assigned_to_profile:assigned_to(id, full_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as MaintenanceRequest[];
    },
  });
}

export function useMaintenanceRequestById(id: string) {
  return useQuery({
    queryKey: ['maintenance_requests', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('maintenance_requests')
        .select(`
          *,
          equipment:equipment_id(id, name, serial_number, category, team_id, assigned_to),
          teams:team_id(id, name),
          created_by_profile:created_by(id, full_name),
          assigned_to_profile:assigned_to(id, full_name)
        `)
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      return data as MaintenanceRequest | null;
    },
    enabled: !!id,
  });
}

export function useCreateMaintenanceRequest() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (request: {
      subject: string;
      description?: string | null;
      request_type: 'corrective' | 'preventive' | 'predictive';
      priority: 'low' | 'medium' | 'high' | 'critical';
      equipment_id: string;
      category?: string | null;
      team_id?: string | null;
      created_by?: string | null;
      assigned_to?: string | null;
      scheduled_date?: string | null;
      scheduled_time?: string | null;
      stage?: 'new' | 'assigned' | 'in_progress' | 'on_hold' | 'repaired' | 'closed' | 'cancelled';
    }) => {
      // Don't send request_number - let the database trigger generate it
      const insertData: RequestInsert = {
        subject: request.subject,
        description: request.description ?? null,
        request_type: request.request_type,
        priority: request.priority,
        equipment_id: request.equipment_id,
        category: request.category ?? null,
        team_id: request.team_id ?? null,
        created_by: request.created_by ?? null,
        assigned_to: request.assigned_to ?? null,
        scheduled_date: request.scheduled_date ?? null,
        scheduled_time: request.scheduled_time ?? null,
        stage: request.stage ?? 'new',
      };

      const { data, error } = await supabase
        .from('maintenance_requests')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['maintenance_requests'] });
      toast({ title: `Request ${data.request_number} created successfully` });
    },
    onError: (error: Error) => {
      toast({ title: 'Error creating request', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateRequestStage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, stage }: { id: string; stage: MaintenanceRequest['stage'] }) => {
      const { data, error } = await supabase
        .from('maintenance_requests')
        .update({ stage })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['maintenance_requests'] });
      toast({ title: `Moved to ${data.stage.replace('_', ' ')}` });
    },
    onError: (error: Error) => {
      toast({ title: 'Error updating stage', description: error.message, variant: 'destructive' });
    },
  });
}

export function useUpdateMaintenanceRequest() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: { id: string; stage?: MaintenanceRequest['stage']; [key: string]: any }) => {
      const { data, error } = await supabase
        .from('maintenance_requests')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['maintenance_requests'] });
      queryClient.invalidateQueries({ queryKey: ['maintenance_requests', data.id] });
      toast({ title: 'Request updated successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error updating request', description: error.message, variant: 'destructive' });
    },
  });
}
