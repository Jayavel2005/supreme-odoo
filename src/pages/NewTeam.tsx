import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useCreateTeam } from '@/hooks/useTeams';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ArrowLeft, Save } from 'lucide-react';

export default function NewTeam() {
  const navigate = useNavigate();
  const createTeam = useCreateTeam();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    department: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      alert('Please enter a team name');
      return;
    }

    setIsSubmitting(true);

    try {
      await createTeam.mutateAsync({
        name: formData.name,
        description: formData.description || null,
        department: formData.department || null,
      });

      navigate('/teams');
    } catch (error) {
      console.error('Error creating team:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 animate-fade-in">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate('/teams')} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Teams
          </Button>
          
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
            New Team
          </h1>
          <p className="text-muted-foreground mt-1">Create a new maintenance team</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="max-w-2xl space-y-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Team Information</CardTitle>
                <CardDescription>Enter the details for the new team</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Team Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="e.g., Internal Maintenance"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="department">Department</Label>
                  <Input
                    id="department"
                    value={formData.department}
                    onChange={(e) => handleChange('department', e.target.value)}
                    placeholder="e.g., Maintenance, Quality"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Brief description of the team's responsibilities..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-2">
              <Button type="submit" disabled={isSubmitting}>
                <Save className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Creating...' : 'Create Team'}
              </Button>
              <Button 
                type="button" 
                variant="outline"
                onClick={() => navigate('/teams')}
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
