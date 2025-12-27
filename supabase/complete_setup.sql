-- ============================================
-- GearGuard Complete Database Setup
-- ============================================
-- Run this entire file in Supabase SQL Editor to set up the database
-- Go to: SQL Editor → New query → Paste this → Run

-- Create enums
CREATE TYPE public.user_role AS ENUM ('admin', 'manager', 'technician');
CREATE TYPE public.equipment_status AS ENUM ('active', 'maintenance', 'inactive', 'scrap');
CREATE TYPE public.request_type AS ENUM ('corrective', 'preventive', 'predictive');
CREATE TYPE public.priority_level AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE public.request_stage AS ENUM ('new', 'assigned', 'in_progress', 'on_hold', 'repaired', 'closed', 'cancelled');
CREATE TYPE public.team_member_role AS ENUM ('lead', 'member', 'specialist');

-- Teams table (created first as it's referenced by profiles)
CREATE TABLE public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  department TEXT,
  team_lead_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  role user_role NOT NULL DEFAULT 'technician',
  team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  department TEXT,
  avatar_url TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add foreign key to teams for team_lead after profiles exists
ALTER TABLE public.teams ADD CONSTRAINT fk_team_lead FOREIGN KEY (team_lead_id) REFERENCES public.profiles(id) ON DELETE SET NULL;

-- Team members junction table
CREATE TABLE public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role team_member_role NOT NULL DEFAULT 'member',
  specialization TEXT,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(team_id, user_id)
);

-- Equipment table
CREATE TABLE public.equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  serial_number TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  department TEXT NOT NULL,
  location TEXT,
  team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  purchase_date DATE,
  warranty_expiry DATE,
  original_cost NUMERIC,
  status equipment_status NOT NULL DEFAULT 'active',
  last_serviced DATE,
  next_scheduled DATE,
  health_score INTEGER DEFAULT 100 CHECK (health_score >= 0 AND health_score <= 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Maintenance requests table
CREATE TABLE public.maintenance_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_number TEXT UNIQUE DEFAULT NULL,
  subject TEXT NOT NULL,
  description TEXT,
  request_type request_type NOT NULL DEFAULT 'corrective',
  priority priority_level NOT NULL DEFAULT 'medium',
  equipment_id UUID NOT NULL REFERENCES public.equipment(id) ON DELETE CASCADE,
  category TEXT,
  team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  stage request_stage NOT NULL DEFAULT 'new',
  scheduled_date DATE,
  scheduled_time TIME,
  actual_start TIMESTAMPTZ,
  actual_end TIMESTAMPTZ,
  estimated_hours NUMERIC,
  actual_hours NUMERIC,
  estimated_cost NUMERIC,
  actual_cost NUMERIC,
  resolution_notes TEXT,
  attachment_urls TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Comments table
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.maintenance_requests(id) ON DELETE CASCADE,
  author_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT true,
  attachment_urls TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Activity logs table
CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action_type TEXT NOT NULL,
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  target_type TEXT NOT NULL,
  target_id UUID NOT NULL,
  description TEXT,
  old_value JSONB,
  new_value JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.maintenance_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Create policies for teams
CREATE POLICY "Authenticated users can view teams" ON public.teams FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create teams" ON public.teams FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update teams" ON public.teams FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete teams" ON public.teams FOR DELETE TO authenticated USING (true);

-- Create policies for team_members
CREATE POLICY "Authenticated users can view team members" ON public.team_members FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage team members" ON public.team_members FOR ALL TO authenticated USING (true);

-- Create policies for equipment
CREATE POLICY "Authenticated users can view equipment" ON public.equipment FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create equipment" ON public.equipment FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update equipment" ON public.equipment FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete equipment" ON public.equipment FOR DELETE TO authenticated USING (true);

-- Create policies for maintenance_requests
CREATE POLICY "Authenticated users can view requests" ON public.maintenance_requests FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create requests" ON public.maintenance_requests FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update requests" ON public.maintenance_requests FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete requests" ON public.maintenance_requests FOR DELETE TO authenticated USING (true);

-- Create policies for comments
CREATE POLICY "Authenticated users can view comments" ON public.comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create comments" ON public.comments FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update own comments" ON public.comments FOR UPDATE TO authenticated USING (auth.uid() = author_id);
CREATE POLICY "Authenticated users can delete own comments" ON public.comments FOR DELETE TO authenticated USING (auth.uid() = author_id);

-- Create policies for activity_logs
CREATE POLICY "Authenticated users can view activity logs" ON public.activity_logs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can create activity logs" ON public.activity_logs FOR INSERT TO authenticated WITH CHECK (true);

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email));
  RETURN NEW;
END;
$$;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON public.teams FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_equipment_updated_at BEFORE UPDATE ON public.equipment FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_maintenance_requests_updated_at BEFORE UPDATE ON public.maintenance_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to generate request number
CREATE OR REPLACE FUNCTION public.generate_request_number()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  year_part TEXT;
  seq_num INTEGER;
BEGIN
  year_part := to_char(now(), 'YYYY');
  SELECT COALESCE(MAX(CAST(SUBSTRING(request_number FROM 9) AS INTEGER)), 0) + 1
  INTO seq_num
  FROM public.maintenance_requests
  WHERE request_number LIKE 'MR-' || year_part || '-%';
  NEW.request_number := 'MR-' || year_part || '-' || LPAD(seq_num::TEXT, 4, '0');
  RETURN NEW;
END;
$$;

CREATE TRIGGER generate_request_number_trigger
  BEFORE INSERT ON public.maintenance_requests
  FOR EACH ROW
  WHEN (NEW.request_number IS NULL)
  EXECUTE FUNCTION public.generate_request_number();

-- ============================================
-- Demo Accounts Setup
-- ============================================
-- Set up admin profile
INSERT INTO profiles (id, email, full_name, role, department, created_at, updated_at)
SELECT au.id, 'admin@demo.com', 'Demo Admin', 'admin', 'Administration', NOW(), NOW()
FROM auth.users au WHERE au.email = 'admin@demo.com'
ON CONFLICT (id) DO UPDATE SET role = 'admin', full_name = 'Demo Admin', department = 'Administration', email = 'admin@demo.com';

-- Set up technician profile
INSERT INTO profiles (id, email, full_name, role, department, created_at, updated_at)
SELECT au.id, 'technician@demo.com', 'Demo Technician', 'technician', 'Maintenance', NOW(), NOW()
FROM auth.users au WHERE au.email = 'technician@demo.com'
ON CONFLICT (id) DO UPDATE SET role = 'technician', full_name = 'Demo Technician', department = 'Maintenance', email = 'technician@demo.com';

-- Set up employee profile
INSERT INTO profiles (id, email, full_name, role, department, created_at, updated_at)
SELECT au.id, 'employee@demo.com', 'Demo Employee', 'manager', 'Operations', NOW(), NOW()
FROM auth.users au WHERE au.email = 'employee@demo.com'
ON CONFLICT (id) DO UPDATE SET role = 'manager', full_name = 'Demo Employee', department = 'Operations', email = 'employee@demo.com';

-- ============================================
-- Sample Data (Teams, Equipment, Requests)
-- ============================================

-- Insert sample teams
INSERT INTO public.teams (name, description, department) VALUES
('Electrical Team', 'Handles all electrical equipment and systems', 'Electrical'),
('Mechanical Team', 'Responsible for mechanical equipment maintenance', 'Mechanical'),
('HVAC Team', 'Heating, ventilation, and air conditioning specialists', 'Facilities'),
('IT Infrastructure', 'Manages servers, network equipment, and IT systems', 'IT');

-- Insert sample equipment
INSERT INTO public.equipment (name, serial_number, category, subcategory, department, location, status, health_score, last_serviced, next_scheduled) VALUES
('Industrial Lathe Machine', 'LAT-2023-001', 'Manufacturing', 'CNC Machines', 'Production', 'Factory Floor A', 'active', 85, CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE + INTERVAL '60 days'),
('Hydraulic Press', 'HYD-2023-002', 'Manufacturing', 'Heavy Equipment', 'Production', 'Factory Floor B', 'active', 92, CURRENT_DATE - INTERVAL '15 days', CURRENT_DATE + INTERVAL '75 days'),
('Air Compressor Unit', 'AIR-2023-003', 'HVAC', 'Compressors', 'Facilities', 'Mechanical Room 1', 'active', 78, CURRENT_DATE - INTERVAL '45 days', CURRENT_DATE + INTERVAL '45 days'),
('Server Rack - Main', 'SRV-2023-004', 'IT Equipment', 'Servers', 'IT', 'Data Center 1', 'active', 95, CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE + INTERVAL '80 days'),
('Cooling Tower', 'CTW-2023-005', 'HVAC', 'Cooling Systems', 'Facilities', 'Rooftop', 'maintenance', 65, CURRENT_DATE - INTERVAL '60 days', CURRENT_DATE + INTERVAL '30 days'),
('Forklift - Electric', 'FLT-2023-006', 'Material Handling', 'Forklifts', 'Warehouse', 'Warehouse A', 'active', 88, CURRENT_DATE - INTERVAL '20 days', CURRENT_DATE + INTERVAL '70 days'),
('Emergency Generator', 'GEN-2023-007', 'Power Systems', 'Generators', 'Electrical', 'Generator Room', 'active', 90, CURRENT_DATE - INTERVAL '25 days', CURRENT_DATE + INTERVAL '65 days'),
('Conveyor System', 'CNV-2023-008', 'Material Handling', 'Conveyors', 'Production', 'Assembly Line 1', 'active', 82, CURRENT_DATE - INTERVAL '35 days', CURRENT_DATE + INTERVAL '55 days'),
('Water Pump - Primary', 'WPM-2023-009', 'Plumbing', 'Pumps', 'Facilities', 'Pump House', 'active', 75, CURRENT_DATE - INTERVAL '50 days', CURRENT_DATE + INTERVAL '40 days'),
('Fire Suppression System', 'FIR-2023-010', 'Safety Equipment', 'Fire Safety', 'Safety', 'Building Wide', 'active', 98, CURRENT_DATE - INTERVAL '5 days', CURRENT_DATE + INTERVAL '85 days');

-- Insert sample maintenance requests with different stages and priorities
INSERT INTO public.maintenance_requests (subject, description, request_type, priority, equipment_id, category, stage, scheduled_date, created_by, assigned_to)
SELECT 
  'Annual Preventive Maintenance',
  'Scheduled annual maintenance check including oil change, filter replacement, and general inspection.',
  'preventive',
  'medium',
  e.id,
  'Routine Maintenance',
  'scheduled',
  CURRENT_DATE + INTERVAL '7 days',
  (SELECT id FROM profiles WHERE email = 'employee@demo.com'),
  (SELECT id FROM profiles WHERE email = 'technician@demo.com')
FROM equipment e WHERE e.serial_number = 'LAT-2023-001';

INSERT INTO public.maintenance_requests (subject, description, request_type, priority, equipment_id, category, stage, scheduled_date, created_by, assigned_to)
SELECT 
  'Unusual Noise from Hydraulic System',
  'Equipment is making grinding noise during operation. Needs immediate inspection.',
  'corrective',
  'high',
  e.id,
  'Mechanical Issue',
  'assigned',
  CURRENT_DATE + INTERVAL '2 days',
  (SELECT id FROM profiles WHERE email = 'employee@demo.com'),
  (SELECT id FROM profiles WHERE email = 'technician@demo.com')
FROM equipment e WHERE e.serial_number = 'HYD-2023-002';

INSERT INTO public.maintenance_requests (subject, description, request_type, priority, equipment_id, category, stage, scheduled_date, created_by)
SELECT 
  'Air Compressor Pressure Drop',
  'System pressure drops below optimal levels. Suspected leak in the system.',
  'corrective',
  'critical',
  e.id,
  'System Failure',
  'new',
  CURRENT_DATE + INTERVAL '1 day',
  (SELECT id FROM profiles WHERE email = 'employee@demo.com')
FROM equipment e WHERE e.serial_number = 'AIR-2023-003';

INSERT INTO public.maintenance_requests (subject, description, request_type, priority, equipment_id, category, stage, scheduled_date, created_by, assigned_to)
SELECT 
  'Server Rack Temperature Monitoring',
  'Monthly temperature and performance check for main server rack.',
  'preventive',
  'low',
  e.id,
  'IT Maintenance',
  'in_progress',
  CURRENT_DATE,
  (SELECT id FROM profiles WHERE email = 'admin@demo.com'),
  (SELECT id FROM profiles WHERE email = 'technician@demo.com')
FROM equipment e WHERE e.serial_number = 'SRV-2023-004';

INSERT INTO public.maintenance_requests (subject, description, request_type, priority, equipment_id, category, stage, scheduled_date, created_by, assigned_to)
SELECT 
  'Cooling Tower Deep Clean',
  'Comprehensive cleaning and maintenance of cooling tower system.',
  'preventive',
  'high',
  e.id,
  'HVAC Maintenance',
  'on_hold',
  CURRENT_DATE + INTERVAL '5 days',
  (SELECT id FROM profiles WHERE email = 'employee@demo.com'),
  (SELECT id FROM profiles WHERE email = 'technician@demo.com')
FROM equipment e WHERE e.serial_number = 'CTW-2023-005';

INSERT INTO public.maintenance_requests (subject, description, request_type, priority, equipment_id, category, stage, actual_start, actual_end, resolution_notes, created_by, assigned_to)
SELECT 
  'Forklift Battery Replacement',
  'Battery showing reduced capacity. Replaced with new unit.',
  'corrective',
  'medium',
  e.id,
  'Electrical',
  'closed',
  CURRENT_DATE - INTERVAL '3 days',
  CURRENT_DATE - INTERVAL '2 days',
  'Battery replaced successfully. Equipment tested and returned to service.',
  (SELECT id FROM profiles WHERE email = 'employee@demo.com'),
  (SELECT id FROM profiles WHERE email = 'technician@demo.com')
FROM equipment e WHERE e.serial_number = 'FLT-2023-006';

INSERT INTO public.maintenance_requests (subject, description, request_type, priority, equipment_id, category, stage, scheduled_date, created_by, assigned_to)
SELECT 
  'Generator Load Test',
  'Quarterly load testing and fuel system inspection.',
  'preventive',
  'medium',
  e.id,
  'Power Systems',
  'assigned',
  CURRENT_DATE + INTERVAL '10 days',
  (SELECT id FROM profiles WHERE email = 'admin@demo.com'),
  (SELECT id FROM profiles WHERE email = 'technician@demo.com')
FROM equipment e WHERE e.serial_number = 'GEN-2023-007';

INSERT INTO public.maintenance_requests (subject, description, request_type, priority, equipment_id, category, stage, scheduled_date, created_by)
SELECT 
  'Conveyor Belt Alignment Issue',
  'Belt is misaligned causing products to fall off. Production affected.',
  'corrective',
  'critical',
  e.id,
  'Production Issue',
  'new',
  CURRENT_DATE,
  (SELECT id FROM profiles WHERE email = 'employee@demo.com')
FROM equipment e WHERE e.serial_number = 'CNV-2023-008';

INSERT INTO public.maintenance_requests (subject, description, request_type, priority, equipment_id, category, stage, scheduled_date, created_by, assigned_to)
SELECT 
  'Water Pump Vibration Analysis',
  'Pump showing increased vibration levels. Predictive maintenance recommended.',
  'predictive',
  'medium',
  e.id,
  'Predictive Maintenance',
  'assigned',
  CURRENT_DATE + INTERVAL '4 days',
  (SELECT id FROM profiles WHERE email = 'employee@demo.com'),
  (SELECT id FROM profiles WHERE email = 'technician@demo.com')
FROM equipment e WHERE e.serial_number = 'WPM-2023-009';

INSERT INTO public.maintenance_requests (subject, description, request_type, priority, equipment_id, category, stage, actual_start, actual_end, resolution_notes, created_by, assigned_to)
SELECT 
  'Fire System Annual Inspection',
  'Annual fire suppression system inspection and testing.',
  'preventive',
  'high',
  e.id,
  'Safety',
  'closed',
  CURRENT_DATE - INTERVAL '5 days',
  CURRENT_DATE - INTERVAL '4 days',
  'All systems tested and functioning properly. Certification updated.',
  (SELECT id FROM profiles WHERE email = 'admin@demo.com'),
  (SELECT id FROM profiles WHERE email = 'technician@demo.com')
FROM equipment e WHERE e.serial_number = 'FIR-2023-010';
