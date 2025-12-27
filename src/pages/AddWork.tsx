import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useCreateMaintenanceRequest } from '@/hooks/useMaintenanceRequests';
import { useEquipment } from '@/hooks/useEquipment';
import { useTeams } from '@/hooks/useTeams';
import { useProfiles } from '@/hooks/useProfiles';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { ArrowLeft, Check } from 'lucide-react';

export default function AddWork() {
  const navigate = useNavigate();
  const createRequest = useCreateMaintenanceRequest();
  const { data: equipment = [] } = useEquipment();
  const { data: teams = [] } = useTeams();
  const { data: profiles = [] } = useProfiles();

  const [formData, setFormData] = useState({
    subject: '',
    equipment_id: '',
    assigned_to: '',
    team_id: '',
    priority: 'medium',
    category: 'corrective',
    scheduled_date: '',
    scheduled_time: '',
    description: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.subject) {
      alert('Please enter a subject');
      return;
    }

    if (!formData.equipment_id) {
      alert('Please select equipment');
      return;
    }

    setIsSubmitting(true);

    try {
      await createRequest.mutateAsync({
        subject: formData.subject,
        request_type: formData.category as any,
        equipment_id: formData.equipment_id,
        assigned_to: formData.assigned_to || null,
        team_id: formData.team_id || null,
        priority: formData.priority as any,
        category: formData.category,
        scheduled_date: formData.scheduled_date || null,
        scheduled_time: formData.scheduled_time || null,
        description: formData.description || null,
        stage: 'new',
      });

      navigate('/calendar');
    } catch (error) {
      console.error('Error creating work:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 animate-fade-in">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate('/calendar')} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Calendar
          </Button>

          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
            Add Work
          </h1>
          <p className="text-muted-foreground mt-1">Schedule new maintenance work</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Work Details */}
            <Card>
                <CardHeader>
                  <CardTitle>Work Details</CardTitle>
                  <CardDescription>Enter the basic information for this work</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="subject">Work Title *</Label>
                    <Input
                      id="subject"
                      value={formData.subject}
                      onChange={(e) => handleChange('subject', e.target.value)}
                      placeholder="e.g., Replace conveyor belt"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="equipment">Equipment *</Label>
                      <Select
                        value={formData.equipment_id}
                        onValueChange={(value) => handleChange('equipment_id', value)}
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select equipment" />
                        </SelectTrigger>
                        <SelectContent>
                          {equipment.map((item) => (
                            <SelectItem key={item.id} value={item.id}>
                              {item.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="team">Team</Label>
                      <Select
                        value={formData.team_id}
                        onValueChange={(value) => handleChange('team_id', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select team" />
                        </SelectTrigger>
                        <SelectContent>
                          {teams.map((team) => (
                            <SelectItem key={team.id} value={team.id}>
                              {team.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="priority">Priority</Label>
                      <Select
                        value={formData.priority}
                        onValueChange={(value) => handleChange('priority', value)}
                      >
                        <SelectTrigger>
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

                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => handleChange('category', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="corrective">Corrective</SelectItem>
                          <SelectItem value="preventive">Preventive</SelectItem>
                          <SelectItem value="inspection">Inspection</SelectItem>
                          <SelectItem value="calibration">Calibration</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
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

                  <div>
                    <Label htmlFor="assigned_to">Assign To</Label>
                    <Select
                      value={formData.assigned_to}
                      onValueChange={(value) => handleChange('assigned_to', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select technician" />
                      </SelectTrigger>
                      <SelectContent>
                        {profiles.map((profile) => (
                          <SelectItem key={profile.id} value={profile.id}>
                            {profile.full_name || 'Unnamed User'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleChange('description', e.target.value)}
                      placeholder="Additional details about this work..."
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex gap-2">
                <Button type="submit" disabled={isSubmitting}>
                  <Check className="w-4 h-4 mr-2" />
                  {isSubmitting ? 'Creating...' : 'Create Work'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/calendar')}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </form>
        </div>
      </AppLayout>
    );
  }
