import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useCreateMaintenanceRequest } from '@/hooks/useMaintenanceRequests';
import { useEquipment } from '@/hooks/useEquipment';
import { useTeams } from '@/hooks/useTeams';
import { useProfiles } from '@/hooks/useProfiles';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ArrowLeft, Save } from 'lucide-react';

export default function NewRequest() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: equipment = [] } = useEquipment();
  const { data: teams = [] } = useTeams();
  const { data: profiles = [] } = useProfiles();
  const createRequest = useCreateMaintenanceRequest();

  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    request_type: 'corrective' as 'corrective' | 'preventive' | 'predictive',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    maintenance_for: 'equipment' as 'equipment' | 'work_center',
    equipment_id: '',
    work_center: '',
    category: '',
    team_id: '',
    assigned_to: '',
    scheduled_date: '',
    scheduled_time: '',
    estimated_hours: '',
    estimated_cost: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.subject) {
      alert('Please fill in required field: Subject');
      return;
    }

    if (formData.maintenance_for === 'equipment' && !formData.equipment_id) {
      alert('Please select an equipment');
      return;
    }

    if (formData.maintenance_for === 'work_center' && !formData.work_center) {
      alert('Please enter a work center');
      return;
    }

    // For work center requests, we'll use the first equipment as placeholder
    // In production, you'd want a separate work_center table
    const equipmentId = formData.maintenance_for === 'equipment' 
      ? formData.equipment_id 
      : equipment[0]?.id || formData.equipment_id;

    if (!equipmentId) {
      alert('Please add at least one equipment or select an equipment');
      return;
    }

    setIsSubmitting(true);

    try {
      await createRequest.mutateAsync({
        subject: formData.subject,
        description: formData.description || null,
        request_type: formData.request_type,
        priority: formData.priority,
        equipment_id: equipmentId,
        category: formData.maintenance_for === 'work_center' 
          ? `Work Center: ${formData.work_center}` 
          : formData.category || null,
        team_id: formData.team_id || null,
        assigned_to: formData.assigned_to || null,
        scheduled_date: formData.scheduled_date || null,
        scheduled_time: formData.scheduled_time || null,
        created_by: user?.id || null,
      });

      navigate('/requests');
    } catch (error) {
      console.error('Error creating request:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    // Auto-fill team and assigned_to when equipment is selected
    if (field === 'equipment_id' && value) {
      const selectedEquipment = equipment.find(eq => eq.id === value);
      if (selectedEquipment) {
        // Update all fields including auto-filled ones
        setFormData(prev => ({
          ...prev,
          equipment_id: value,
          team_id: selectedEquipment.team_id || '',
          assigned_to: selectedEquipment.assigned_to || '',
          category: selectedEquipment.category || '',
        }));
        return; // Exit early since we've already set all fields
      }
    }
    
    // For all other fields, normal update
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 animate-fade-in">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate('/requests')} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Requests
          </Button>
          
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
            New Maintenance Request
          </h1>
          <p className="text-muted-foreground mt-1">Create a new maintenance request</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Basic Information</CardTitle>
                  <CardDescription>Enter the main details of the maintenance request</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="subject">Subject *</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => handleChange('subject', e.target.value)}
                      placeholder="Brief description of the issue"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleChange('description', e.target.value)}
                      placeholder="Detailed description of the maintenance request..."
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label>Maintenance For *</Label>
                    <RadioGroup
                      value={formData.maintenance_for}
                      onValueChange={(value) => handleChange('maintenance_for', value)}
                      className="flex flex-row space-x-4 mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="equipment" id="maintenance_equipment" />
                        <Label htmlFor="maintenance_equipment" className="font-normal cursor-pointer">
                          Equipment
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="work_center" id="maintenance_work_center" />
                        <Label htmlFor="maintenance_work_center" className="font-normal cursor-pointer">
                          Work Center
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {formData.maintenance_for === 'equipment' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="equipment">Equipment *</Label>
                        <Select value={formData.equipment_id} onValueChange={(value) => handleChange('equipment_id', value)}>
                          <SelectTrigger id="equipment">
                            <SelectValue placeholder="Select equipment" />
                          </SelectTrigger>
                          <SelectContent>
                            {equipment.map((item) => (
                              <SelectItem key={item.id} value={item.id}>
                                {item.name} ({item.serial_number})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="category">Category</Label>
                        <Input
                          id="category"
                          value={formData.category}
                          onChange={(e) => handleChange('category', e.target.value)}
                          placeholder="e.g., Manufacturing, HVAC"
                          className={formData.category ? 'border-primary' : ''}
                        />
                        {formData.category && (
                          <p className="text-xs text-primary mt-1">✓ Auto-filled from equipment</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <Label htmlFor="work_center">Work Center *</Label>
                      <Select value={formData.work_center} onValueChange={(value) => handleChange('work_center', value)}>
                        <SelectTrigger id="work_center">
                          <SelectValue placeholder="Select work center" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Work Center">Work Center</SelectItem>
                          <SelectItem value="Machine & Tools">Machine & Tools</SelectItem>
                          <SelectItem value="Production Line A">Production Line A</SelectItem>
                          <SelectItem value="Production Line B">Production Line B</SelectItem>
                          <SelectItem value="Assembly Station 1">Assembly Station 1</SelectItem>
                          <SelectItem value="Assembly Station 2">Assembly Station 2</SelectItem>
                          <SelectItem value="Packaging Department">Packaging Department</SelectItem>
                          <SelectItem value="Quality Control Lab">Quality Control Lab</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Request Type & Priority */}
              <Card>
                <CardHeader>
                  <CardTitle>Request Type & Priority</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label>Request Type</Label>
                    <RadioGroup
                      value={formData.request_type}
                      onValueChange={(value) => handleChange('request_type', value)}
                      className="flex flex-col space-y-2 mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="corrective" id="corrective" />
                        <Label htmlFor="corrective" className="font-normal cursor-pointer">
                          Corrective - Fix broken equipment
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="preventive" id="preventive" />
                        <Label htmlFor="preventive" className="font-normal cursor-pointer">
                          Preventive - Regular maintenance
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="predictive" id="predictive" />
                        <Label htmlFor="predictive" className="font-normal cursor-pointer">
                          Predictive - Based on monitoring
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={formData.priority} onValueChange={(value) => handleChange('priority', value)}>
                      <SelectTrigger id="priority">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Schedule */}
              <Card>
                <CardHeader>
                  <CardTitle>Schedule</CardTitle>
                  <CardDescription>When should this maintenance be performed?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="scheduled_date">Scheduled Date</Label>
                      <Input
                        id="scheduled_date"
                        type="date"
                        value={formData.scheduled_date}
                        onChange={(e) => handleChange('scheduled_date', e.target.value)}
                      />
                    </div>

                    <div>
                      <Label htmlFor="scheduled_time">Scheduled Time</Label>
                      <Input
                        id="scheduled_time"
                        type="time"
                        value={formData.scheduled_time}
                        onChange={(e) => handleChange('scheduled_time', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="estimated_hours">Estimated Hours</Label>
                      <Input
                        id="estimated_hours"
                        type="number"
                        step="0.5"
                        value={formData.estimated_hours}
                        onChange={(e) => handleChange('estimated_hours', e.target.value)}
                        placeholder="e.g., 2.5"
                      />
                    </div>

                    <div>
                      <Label htmlFor="estimated_cost">Estimated Cost ($)</Label>
                      <Input
                        id="estimated_cost"
                        type="number"
                        step="0.01"
                        value={formData.estimated_cost}
                        onChange={(e) => handleChange('estimated_cost', e.target.value)}
                        placeholder="e.g., 150.00"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Assignment */}
              <Card>
                <CardHeader>
                  <CardTitle>Assignment</CardTitle>
                  <CardDescription>Auto-filled based on equipment selection</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="team">Team</Label>
                    <Select value={formData.team_id} onValueChange={(value) => handleChange('team_id', value)}>
                      <SelectTrigger id="team" className={formData.team_id ? 'border-primary' : ''}>
                        <SelectValue placeholder="Select team (auto-fills)" />
                      </SelectTrigger>
                      <SelectContent>
                        {teams.map((team) => (
                          <SelectItem key={team.id} value={team.id}>
                            {team.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formData.team_id && (
                      <p className="text-xs text-primary mt-1">✓ Auto-filled from equipment</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="assigned_to">Assign To</Label>
                    <Select value={formData.assigned_to} onValueChange={(value) => handleChange('assigned_to', value)}>
                      <SelectTrigger id="assigned_to" className={formData.assigned_to ? 'border-primary' : ''}>
                        <SelectValue placeholder="Select technician (auto-fills)" />
                      </SelectTrigger>
                      <SelectContent>
                        {profiles.filter(p => p.role === 'technician' || p.role === 'manager').map((profile) => (
                          <SelectItem key={profile.id} value={profile.id}>
                            {profile.full_name || 'Unnamed User'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formData.assigned_to && (
                      <p className="text-xs text-primary mt-1">✓ Auto-filled from equipment</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <Card>
                <CardContent className="pt-6 space-y-2">
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    <Save className="w-4 h-4 mr-2" />
                    {isSubmitting ? 'Creating...' : 'Create Request'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate('/requests')}
                  >
                    Cancel
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
