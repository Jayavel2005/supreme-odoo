import { supabase } from '@/integrations/supabase/client';

export async function seedSampleData() {
  try {
    console.log('Starting to seed sample data...');

    // First, check if we already have equipment
    const { data: existingEquipment } = await supabase
      .from('equipment')
      .select('id')
      .limit(1);

    if (existingEquipment && existingEquipment.length > 0) {
      console.log('Sample data already exists');
      return { success: true, message: 'Data already exists' };
    }

    // Insert sample equipment
    const { data: equipment, error: equipmentError } = await supabase
      .from('equipment')
      .insert([
        {
          name: 'Acer Laptop/LP/203/19281928',
          serial_number: 'LP-203-19281928',
          category: 'Computers',
          department: 'IT',
          location: 'Work Center',
          status: 'active',
          health_score: 85,
          purchase_date: '2023-01-15',
        },
        {
          name: 'Dell Desktop PC',
          serial_number: 'PC-401-20230915',
          category: 'Computers',
          department: 'IT',
          location: 'Office Floor 2',
          status: 'active',
          health_score: 92,
          purchase_date: '2023-09-15',
        },
        {
          name: 'HP Printer LaserJet',
          serial_number: 'PR-150-20220803',
          category: 'Printers',
          department: 'Admin',
          location: 'Print Room',
          status: 'active',
          health_score: 65,
          purchase_date: '2022-08-03',
        },
        {
          name: 'Lenovo ThinkPad',
          serial_number: 'LP-305-20231120',
          category: 'Computers',
          department: 'IT',
          location: 'Conference Room',
          status: 'active',
          health_score: 25,
          purchase_date: '2023-11-20',
        },
        {
          name: 'Canon Scanner',
          serial_number: 'SC-220-20210512',
          category: 'Office Equipment',
          department: 'Admin',
          location: 'Reception',
          status: 'maintenance',
          health_score: 45,
          purchase_date: '2021-05-12',
        },
      ])
      .select();

    if (equipmentError) {
      console.error('Error inserting equipment:', equipmentError);
      throw equipmentError;
    }

    console.log('Equipment inserted:', equipment);

    // Get current user for assignment
    const { data: { user } } = await supabase.auth.getUser();

    // Insert sample teams
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .insert([
        {
          name: 'Internal Maintenance',
          description: 'Internal maintenance team handling routine equipment maintenance',
          department: 'Maintenance',
        },
        {
          name: 'Metrology',
          description: 'Precision measurement and calibration team',
          department: 'Quality',
        },
        {
          name: 'Subcontractor',
          description: 'External maintenance contractors',
          department: 'External',
        },
      ])
      .select();

    if (teamsError) {
      console.error('Error inserting teams:', teamsError);
    } else {
      console.log('Teams inserted:', teams);

      // Add team members if we have teams and user
      if (teams && user) {
        const { error: membersError } = await supabase
          .from('team_members')
          .insert([
            {
              team_id: teams[0].id,
              user_id: user.id,
              role: 'lead',
              specialization: 'General Maintenance',
            },
            {
              team_id: teams[1].id,
              user_id: user.id,
              role: 'member',
              specialization: 'Calibration',
            },
            {
              team_id: teams[2].id,
              user_id: user.id,
              role: 'member',
              specialization: 'External Support',
            },
          ]);

        if (membersError) {
          console.error('Error inserting team members:', membersError);
        }
      }
    }

    // Insert sample maintenance requests
    const { data: requests, error: requestsError } = await supabase
      .from('maintenance_requests')
      .insert([
        {
          request_number: 'MR-2025-001',
          subject: 'Test activity',
          description: 'Routine maintenance check for laptop. Screen flickering issue reported by user. Need to diagnose and repair.',
          request_type: 'corrective',
          priority: 'medium',
          equipment_id: equipment![0].id,
          category: 'computer',
          stage: 'new',
          scheduled_date: '2025-12-18',
          scheduled_time: '14:30:00',
          estimated_hours: 2.5,
          estimated_cost: 150.00,
          created_by: user?.id,
        },
        {
          request_number: 'MR-2025-002',
          subject: 'Printer not responding',
          description: 'HP LaserJet printer not responding to print jobs. Error message on display panel.',
          request_type: 'corrective',
          priority: 'high',
          equipment_id: equipment![2].id,
          category: 'printer',
          stage: 'assigned',
          scheduled_date: '2025-12-19',
          scheduled_time: '09:00:00',
          estimated_hours: 1.5,
          created_by: user?.id,
        },
        {
          request_number: 'MR-2025-003',
          subject: 'Desktop PC preventive maintenance',
          description: 'Quarterly preventive maintenance for Dell desktop PC. Clean dust, update software, check hardware.',
          request_type: 'preventive',
          priority: 'low',
          equipment_id: equipment![1].id,
          category: 'computer',
          stage: 'in_progress',
          scheduled_date: '2025-12-20',
          scheduled_time: '10:00:00',
          created_by: user?.id,
        },
        {
          request_number: 'MR-2025-004',
          subject: 'Critical laptop hardware failure',
          description: 'Lenovo ThinkPad showing critical hardware failure. System not booting. Urgent replacement of components needed.',
          request_type: 'corrective',
          priority: 'critical',
          equipment_id: equipment![3].id,
          category: 'computer',
          stage: 'new',
          scheduled_date: '2025-12-17',
          scheduled_time: '08:00:00',
          estimated_hours: 4.0,
          estimated_cost: 350.00,
          created_by: user?.id,
        },
        {
          request_number: 'MR-2025-005',
          subject: 'Scanner calibration required',
          description: 'Canon scanner producing blurry scans. Needs calibration and cleaning.',
          request_type: 'preventive',
          priority: 'medium',
          equipment_id: equipment![4].id,
          category: 'office-equipment',
          stage: 'on_hold',
          scheduled_date: '2025-12-21',
          scheduled_time: '13:00:00',
          created_by: user?.id,
        },
        {
          request_number: 'MR-2025-006',
          subject: 'Laptop battery replacement',
          description: 'Battery not holding charge. Replacement required.',
          request_type: 'corrective',
          priority: 'medium',
          equipment_id: equipment![0].id,
          category: 'computer',
          stage: 'repaired',
          scheduled_date: '2025-12-15',
          actual_start: '2025-12-15T09:00:00',
          actual_end: '2025-12-15T10:30:00',
          actual_hours: 1.5,
          actual_cost: 120.00,
          resolution_notes: 'Replaced battery with new genuine part. Tested and working properly.',
          created_by: user?.id,
        },
      ])
      .select();

    if (requestsError) {
      console.error('Error inserting requests:', requestsError);
      throw requestsError;
    }

    console.log('Maintenance requests inserted:', requests);

    return { success: true, message: 'Sample data seeded successfully!', data: { equipment, requests } };
  } catch (error) {
    console.error('Error seeding data:', error);
    return { success: false, message: 'Error seeding data', error };
  }
}
