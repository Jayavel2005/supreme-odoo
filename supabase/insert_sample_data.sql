-- ============================================
-- Insert Sample Data Only
-- ============================================
-- Run this after the main schema is set up

-- Set up demo account roles (in case not done yet)
INSERT INTO profiles (id, email, full_name, role, department, created_at, updated_at)
SELECT au.id, 'admin@demo.com', 'Demo Admin', 'admin', 'Administration', NOW(), NOW()
FROM auth.users au WHERE au.email = 'admin@demo.com'
ON CONFLICT (id) DO UPDATE SET role = 'admin', full_name = 'Demo Admin', department = 'Administration', email = 'admin@demo.com';

INSERT INTO profiles (id, email, full_name, role, department, created_at, updated_at)
SELECT au.id, 'technician@demo.com', 'Demo Technician', 'technician', 'Maintenance', NOW(), NOW()
FROM auth.users au WHERE au.email = 'technician@demo.com'
ON CONFLICT (id) DO UPDATE SET role = 'technician', full_name = 'Demo Technician', department = 'Maintenance', email = 'technician@demo.com';

INSERT INTO profiles (id, email, full_name, role, department, created_at, updated_at)
SELECT au.id, 'employee@demo.com', 'Demo Employee', 'manager', 'Operations', NOW(), NOW()
FROM auth.users au WHERE au.email = 'employee@demo.com'
ON CONFLICT (id) DO UPDATE SET role = 'manager', full_name = 'Demo Employee', department = 'Operations', email = 'employee@demo.com';

-- Insert sample teams
INSERT INTO public.teams (name, description, department) VALUES
('Electrical Team', 'Handles all electrical equipment and systems', 'Electrical'),
('Mechanical Team', 'Responsible for mechanical equipment maintenance', 'Mechanical'),
('HVAC Team', 'Heating, ventilation, and air conditioning specialists', 'Facilities'),
('IT Infrastructure', 'Manages servers, network equipment, and IT systems', 'IT')
ON CONFLICT (name) DO NOTHING;

-- Insert sample equipment with team and technician assignments
INSERT INTO public.equipment (name, serial_number, category, subcategory, department, location, team_id, assigned_to, status, health_score, last_serviced, next_scheduled) 
SELECT 
  'Industrial Lathe Machine', 
  'LAT-2023-001', 
  'Manufacturing', 
  'CNC Machines', 
  'Production', 
  'Factory Floor A', 
  (SELECT id FROM teams WHERE name = 'Mechanical Team'),
  (SELECT id FROM profiles WHERE email = 'technician@demo.com'),
  'active', 
  85, 
  CURRENT_DATE - INTERVAL '30 days', 
  CURRENT_DATE + INTERVAL '60 days'
WHERE NOT EXISTS (SELECT 1 FROM equipment WHERE serial_number = 'LAT-2023-001');

INSERT INTO public.equipment (name, serial_number, category, subcategory, department, location, team_id, assigned_to, status, health_score, last_serviced, next_scheduled) 
SELECT 
  'Hydraulic Press', 
  'HYD-2023-002', 
  'Manufacturing', 
  'Heavy Equipment', 
  'Production', 
  'Factory Floor B', 
  (SELECT id FROM teams WHERE name = 'Mechanical Team'),
  (SELECT id FROM profiles WHERE email = 'technician@demo.com'),
  'active', 
  92, 
  CURRENT_DATE - INTERVAL '15 days', 
  CURRENT_DATE + INTERVAL '75 days'
WHERE NOT EXISTS (SELECT 1 FROM equipment WHERE serial_number = 'HYD-2023-002');

INSERT INTO public.equipment (name, serial_number, category, subcategory, department, location, team_id, assigned_to, status, health_score, last_serviced, next_scheduled) 
SELECT 
  'Air Compressor Unit', 
  'AIR-2023-003', 
  'HVAC', 
  'Compressors', 
  'Facilities', 
  'Mechanical Room 1', 
  (SELECT id FROM teams WHERE name = 'HVAC Team'),
  (SELECT id FROM profiles WHERE email = 'technician@demo.com'),
  'active', 
  78, 
  CURRENT_DATE - INTERVAL '45 days', 
  CURRENT_DATE + INTERVAL '45 days'
WHERE NOT EXISTS (SELECT 1 FROM equipment WHERE serial_number = 'AIR-2023-003');

INSERT INTO public.equipment (name, serial_number, category, subcategory, department, location, team_id, assigned_to, status, health_score, last_serviced, next_scheduled) 
SELECT 
  'Server Rack - Main', 
  'SRV-2023-004', 
  'IT Equipment', 
  'Servers', 
  'IT', 
  'Data Center 1', 
  (SELECT id FROM teams WHERE name = 'IT Infrastructure'),
  (SELECT id FROM profiles WHERE email = 'technician@demo.com'),
  'active', 
  95, 
  CURRENT_DATE - INTERVAL '10 days', 
  CURRENT_DATE + INTERVAL '80 days'
WHERE NOT EXISTS (SELECT 1 FROM equipment WHERE serial_number = 'SRV-2023-004');

INSERT INTO public.equipment (name, serial_number, category, subcategory, department, location, team_id, assigned_to, status, health_score, last_serviced, next_scheduled) 
SELECT 
  'Cooling Tower', 
  'CTW-2023-005', 
  'HVAC', 
  'Cooling Systems', 
  'Facilities', 
  'Rooftop', 
  (SELECT id FROM teams WHERE name = 'HVAC Team'),
  (SELECT id FROM profiles WHERE email = 'technician@demo.com'),
  'maintenance', 
  65, 
  CURRENT_DATE - INTERVAL '60 days', 
  CURRENT_DATE + INTERVAL '30 days'
WHERE NOT EXISTS (SELECT 1 FROM equipment WHERE serial_number = 'CTW-2023-005');

INSERT INTO public.equipment (name, serial_number, category, subcategory, department, location, team_id, assigned_to, status, health_score, last_serviced, next_scheduled) 
SELECT 
  'Forklift - Electric', 
  'FLT-2023-006', 
  'Material Handling', 
  'Forklifts', 
  'Warehouse', 
  'Warehouse A', 
  (SELECT id FROM teams WHERE name = 'Mechanical Team'),
  (SELECT id FROM profiles WHERE email = 'technician@demo.com'),
  'active', 
  88, 
  CURRENT_DATE - INTERVAL '20 days', 
  CURRENT_DATE + INTERVAL '70 days'
WHERE NOT EXISTS (SELECT 1 FROM equipment WHERE serial_number = 'FLT-2023-006');

INSERT INTO public.equipment (name, serial_number, category, subcategory, department, location, team_id, assigned_to, status, health_score, last_serviced, next_scheduled) 
SELECT 
  'Emergency Generator', 
  'GEN-2023-007', 
  'Power Systems', 
  'Generators', 
  'Electrical', 
  'Generator Room', 
  (SELECT id FROM teams WHERE name = 'Electrical Team'),
  (SELECT id FROM profiles WHERE email = 'technician@demo.com'),
  'active', 
  90, 
  CURRENT_DATE - INTERVAL '25 days', 
  CURRENT_DATE + INTERVAL '65 days'
WHERE NOT EXISTS (SELECT 1 FROM equipment WHERE serial_number = 'GEN-2023-007');

INSERT INTO public.equipment (name, serial_number, category, subcategory, department, location, team_id, assigned_to, status, health_score, last_serviced, next_scheduled) 
SELECT 
  'Conveyor System', 
  'CNV-2023-008', 
  'Material Handling', 
  'Conveyors', 
  'Production', 
  'Assembly Line 1', 
  (SELECT id FROM teams WHERE name = 'Mechanical Team'),
  (SELECT id FROM profiles WHERE email = 'technician@demo.com'),
  'active', 
  82, 
  CURRENT_DATE - INTERVAL '35 days', 
  CURRENT_DATE + INTERVAL '55 days'
WHERE NOT EXISTS (SELECT 1 FROM equipment WHERE serial_number = 'CNV-2023-008');

INSERT INTO public.equipment (name, serial_number, category, subcategory, department, location, team_id, assigned_to, status, health_score, last_serviced, next_scheduled) 
SELECT 
  'Water Pump - Primary', 
  'WPM-2023-009', 
  'Plumbing', 
  'Pumps', 
  'Facilities', 
  'Pump House', 
  (SELECT id FROM teams WHERE name = 'HVAC Team'),
  (SELECT id FROM profiles WHERE email = 'technician@demo.com'),
  'active', 
  75, 
  CURRENT_DATE - INTERVAL '50 days', 
  CURRENT_DATE + INTERVAL '40 days'
WHERE NOT EXISTS (SELECT 1 FROM equipment WHERE serial_number = 'WPM-2023-009');

INSERT INTO public.equipment (name, serial_number, category, subcategory, department, location, team_id, assigned_to, status, health_score, last_serviced, next_scheduled) 
SELECT 
  'Fire Suppression System', 
  'FIR-2023-010', 
  'Safety Equipment', 
  'Fire Safety', 
  'Safety', 
  'Building Wide', 
  (SELECT id FROM teams WHERE name = 'Electrical Team'),
  (SELECT id FROM profiles WHERE email = 'technician@demo.com'),
  'active', 
  98, 
  CURRENT_DATE - INTERVAL '5 days', 
  CURRENT_DATE + INTERVAL '85 days'
WHERE NOT EXISTS (SELECT 1 FROM equipment WHERE serial_number = 'FIR-2023-010');

-- Insert sample maintenance requests with different stages and priorities
INSERT INTO public.maintenance_requests (subject, description, request_type, priority, equipment_id, category, stage, scheduled_date, created_by, assigned_to)
SELECT 
  'Annual Preventive Maintenance',
  'Scheduled annual maintenance check including oil change, filter replacement, and general inspection.',
  'preventive',
  'medium',
  e.id,
  'Routine Maintenance',
  'assigned',
  CURRENT_DATE + INTERVAL '7 days',
  (SELECT id FROM profiles WHERE email = 'employee@demo.com'),
  (SELECT id FROM profiles WHERE email = 'technician@demo.com')
FROM equipment e WHERE e.serial_number = 'LAT-2023-001'
AND NOT EXISTS (SELECT 1 FROM maintenance_requests WHERE equipment_id = e.id AND subject = 'Annual Preventive Maintenance');

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
FROM equipment e WHERE e.serial_number = 'HYD-2023-002'
AND NOT EXISTS (SELECT 1 FROM maintenance_requests WHERE equipment_id = e.id AND subject = 'Unusual Noise from Hydraulic System');

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
FROM equipment e WHERE e.serial_number = 'AIR-2023-003'
AND NOT EXISTS (SELECT 1 FROM maintenance_requests WHERE equipment_id = e.id AND subject = 'Air Compressor Pressure Drop');

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
FROM equipment e WHERE e.serial_number = 'SRV-2023-004'
AND NOT EXISTS (SELECT 1 FROM maintenance_requests WHERE equipment_id = e.id AND subject = 'Server Rack Temperature Monitoring');

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
FROM equipment e WHERE e.serial_number = 'CTW-2023-005'
AND NOT EXISTS (SELECT 1 FROM maintenance_requests WHERE equipment_id = e.id AND subject = 'Cooling Tower Deep Clean');

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
FROM equipment e WHERE e.serial_number = 'FLT-2023-006'
AND NOT EXISTS (SELECT 1 FROM maintenance_requests WHERE equipment_id = e.id AND subject = 'Forklift Battery Replacement');

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
FROM equipment e WHERE e.serial_number = 'GEN-2023-007'
AND NOT EXISTS (SELECT 1 FROM maintenance_requests WHERE equipment_id = e.id AND subject = 'Generator Load Test');

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
FROM equipment e WHERE e.serial_number = 'CNV-2023-008'
AND NOT EXISTS (SELECT 1 FROM maintenance_requests WHERE equipment_id = e.id AND subject = 'Conveyor Belt Alignment Issue');

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
FROM equipment e WHERE e.serial_number = 'WPM-2023-009'
AND NOT EXISTS (SELECT 1 FROM maintenance_requests WHERE equipment_id = e.id AND subject = 'Water Pump Vibration Analysis');

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
FROM equipment e WHERE e.serial_number = 'FIR-2023-010'
AND NOT EXISTS (SELECT 1 FROM maintenance_requests WHERE equipment_id = e.id AND subject = 'Fire System Annual Inspection');
