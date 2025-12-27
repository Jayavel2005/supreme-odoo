-- ============================================
-- Update Existing Equipment with Team and Technician Assignments
-- ============================================
-- Run this to add team_id and assigned_to to your existing equipment

-- Update Industrial Lathe Machine
UPDATE equipment 
SET 
  team_id = (SELECT id FROM teams WHERE name = 'Mechanical Team'),
  assigned_to = (SELECT id FROM profiles WHERE email = 'technician@demo.com')
WHERE serial_number = 'LAT-2023-001';

-- Update Hydraulic Press
UPDATE equipment 
SET 
  team_id = (SELECT id FROM teams WHERE name = 'Mechanical Team'),
  assigned_to = (SELECT id FROM profiles WHERE email = 'technician@demo.com')
WHERE serial_number = 'HYD-2023-002';

-- Update Air Compressor Unit
UPDATE equipment 
SET 
  team_id = (SELECT id FROM teams WHERE name = 'HVAC Team'),
  assigned_to = (SELECT id FROM profiles WHERE email = 'technician@demo.com')
WHERE serial_number = 'AIR-2023-003';

-- Update Server Rack - Main
UPDATE equipment 
SET 
  team_id = (SELECT id FROM teams WHERE name = 'IT Infrastructure'),
  assigned_to = (SELECT id FROM profiles WHERE email = 'technician@demo.com')
WHERE serial_number = 'SRV-2023-004';

-- Update Cooling Tower
UPDATE equipment 
SET 
  team_id = (SELECT id FROM teams WHERE name = 'HVAC Team'),
  assigned_to = (SELECT id FROM profiles WHERE email = 'technician@demo.com')
WHERE serial_number = 'CTW-2023-005';

-- Update Forklift - Electric
UPDATE equipment 
SET 
  team_id = (SELECT id FROM teams WHERE name = 'Mechanical Team'),
  assigned_to = (SELECT id FROM profiles WHERE email = 'technician@demo.com')
WHERE serial_number = 'FLT-2023-006';

-- Update Emergency Generator
UPDATE equipment 
SET 
  team_id = (SELECT id FROM teams WHERE name = 'Electrical Team'),
  assigned_to = (SELECT id FROM profiles WHERE email = 'technician@demo.com')
WHERE serial_number = 'GEN-2023-007';

-- Update Conveyor System
UPDATE equipment 
SET 
  team_id = (SELECT id FROM teams WHERE name = 'Mechanical Team'),
  assigned_to = (SELECT id FROM profiles WHERE email = 'technician@demo.com')
WHERE serial_number = 'CNV-2023-008';

-- Update Water Pump - Primary
UPDATE equipment 
SET 
  team_id = (SELECT id FROM teams WHERE name = 'HVAC Team'),
  assigned_to = (SELECT id FROM profiles WHERE email = 'technician@demo.com')
WHERE serial_number = 'WPM-2023-009';

-- Update Fire Suppression System
UPDATE equipment 
SET 
  team_id = (SELECT id FROM teams WHERE name = 'Electrical Team'),
  assigned_to = (SELECT id FROM profiles WHERE email = 'technician@demo.com')
WHERE serial_number = 'FIR-2023-010';

-- Verify the updates
SELECT 
  e.name,
  e.serial_number,
  e.category,
  t.name as team_name,
  p.full_name as assigned_technician
FROM equipment e
LEFT JOIN teams t ON e.team_id = t.id
LEFT JOIN profiles p ON e.assigned_to = p.id
ORDER BY e.serial_number;
