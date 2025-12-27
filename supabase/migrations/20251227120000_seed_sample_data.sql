-- Insert sample equipment
INSERT INTO public.equipment (name, serial_number, category, department, location, status, health_score, purchase_date) VALUES
('Acer Laptop/LP/203/19281928', 'LP-203-19281928', 'Computers', 'IT', 'Work Center', 'active', 85, '2023-01-15'),
('Dell Desktop PC', 'PC-401-20230915', 'Computers', 'IT', 'Office Floor 2', 'active', 92, '2023-09-15'),
('HP Printer LaserJet', 'PR-150-20220803', 'Printers', 'Admin', 'Print Room', 'active', 65, '2022-08-03'),
('Lenovo ThinkPad', 'LP-305-20231120', 'Computers', 'IT', 'Conference Room', 'active', 25, '2023-11-20'),
('Canon Scanner', 'SC-220-20210512', 'Office Equipment', 'Admin', 'Reception', 'maintenance', 45, '2021-05-12');

-- Insert sample maintenance requests
-- Note: Replace the UUIDs with actual user IDs from your auth.users table
INSERT INTO public.maintenance_requests (
  request_number, 
  subject, 
  description, 
  request_type, 
  priority, 
  equipment_id, 
  category, 
  stage, 
  scheduled_date,
  scheduled_time,
  estimated_hours,
  estimated_cost
) 
SELECT 
  'MR-2025-001',
  'Test activity',
  'Routine maintenance check for laptop. Screen flickering issue reported by user. Need to diagnose and repair.',
  'corrective',
  'medium',
  e.id,
  'computer',
  'new',
  '2025-12-18',
  '14:30:00',
  2.5,
  150.00
FROM public.equipment e WHERE e.serial_number = 'LP-203-19281928'
LIMIT 1;

INSERT INTO public.maintenance_requests (
  request_number, 
  subject, 
  description, 
  request_type, 
  priority, 
  equipment_id, 
  category, 
  stage, 
  scheduled_date,
  scheduled_time,
  estimated_hours
) 
SELECT 
  'MR-2025-002',
  'Printer not responding',
  'HP LaserJet printer not responding to print jobs. Error message on display panel.',
  'corrective',
  'high',
  e.id,
  'printer',
  'assigned',
  '2025-12-19',
  '09:00:00',
  1.5
FROM public.equipment e WHERE e.serial_number = 'PR-150-20220803'
LIMIT 1;

INSERT INTO public.maintenance_requests (
  request_number, 
  subject, 
  description, 
  request_type, 
  priority, 
  equipment_id, 
  category, 
  stage,
  scheduled_date,
  scheduled_time
) 
SELECT 
  'MR-2025-003',
  'Desktop PC preventive maintenance',
  'Quarterly preventive maintenance for Dell desktop PC. Clean dust, update software, check hardware.',
  'preventive',
  'low',
  e.id,
  'computer',
  'in_progress',
  '2025-12-20',
  '10:00:00'
FROM public.equipment e WHERE e.serial_number = 'PC-401-20230915'
LIMIT 1;

INSERT INTO public.maintenance_requests (
  request_number, 
  subject, 
  description, 
  request_type, 
  priority, 
  equipment_id, 
  category, 
  stage,
  scheduled_date,
  scheduled_time,
  estimated_hours,
  estimated_cost
) 
SELECT 
  'MR-2025-004',
  'Critical laptop hardware failure',
  'Lenovo ThinkPad showing critical hardware failure. System not booting. Urgent replacement of components needed.',
  'corrective',
  'critical',
  e.id,
  'computer',
  'new',
  '2025-12-17',
  '08:00:00',
  4.0,
  350.00
FROM public.equipment e WHERE e.serial_number = 'LP-305-20231120'
LIMIT 1;

INSERT INTO public.maintenance_requests (
  request_number, 
  subject, 
  description, 
  request_type, 
  priority, 
  equipment_id, 
  category, 
  stage,
  scheduled_date,
  scheduled_time
) 
SELECT 
  'MR-2025-005',
  'Scanner calibration required',
  'Canon scanner producing blurry scans. Needs calibration and cleaning.',
  'preventive',
  'medium',
  e.id,
  'office-equipment',
  'on_hold',
  '2025-12-21',
  '13:00:00'
FROM public.equipment e WHERE e.serial_number = 'SC-220-20210512'
LIMIT 1;

INSERT INTO public.maintenance_requests (
  request_number, 
  subject, 
  description, 
  request_type, 
  priority, 
  equipment_id, 
  category, 
  stage,
  scheduled_date,
  actual_start,
  actual_end,
  actual_hours,
  actual_cost,
  resolution_notes
) 
SELECT 
  'MR-2025-006',
  'Laptop battery replacement',
  'Battery not holding charge. Replacement required.',
  'corrective',
  'medium',
  e.id,
  'computer',
  'repaired',
  '2025-12-15',
  '2025-12-15 09:00:00',
  '2025-12-15 10:30:00',
  1.5,
  120.00,
  'Replaced battery with new genuine part. Tested and working properly.'
FROM public.equipment e WHERE e.serial_number = 'LP-203-19281928'
LIMIT 1;
