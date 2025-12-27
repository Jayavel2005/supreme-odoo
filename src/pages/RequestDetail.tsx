import { useParams, Link, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { useMaintenanceRequestById, useUpdateMaintenanceRequest } from '@/hooks/useMaintenanceRequests';
import { useProfiles } from '@/hooks/useProfiles';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Wrench, 
  Clock,
  DollarSign,
  FileText,
  MessageSquare,
  Settings,
  AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';

export default function RequestDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: request, isLoading } = useMaintenanceRequestById(id!);
  const { data: profiles = [] } = useProfiles();
  const updateRequest = useUpdateMaintenanceRequest();

  const [isEditingStage, setIsEditingStage] = useState(false);
  const [isEditingAssignment, setIsEditingAssignment] = useState(false);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="p-6 lg:p-8 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading request...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!request) {
    return (
      <AppLayout>
        <div className="p-6 lg:p-8">
          <div className="text-center py-12">
            <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Request Not Found</h2>
            <p className="text-muted-foreground mb-4">The maintenance request you're looking for doesn't exist.</p>
            <Button onClick={() => navigate('/requests')}>Back to Requests</Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'assigned': return 'bg-purple-100 text-purple-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'on_hold': return 'bg-orange-100 text-orange-800';
      case 'repaired': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStageUpdate = (newStage: string) => {
    updateRequest.mutate({
      id: request.id,
      stage: newStage as any,
    });
    setIsEditingStage(false);
  };

  const handleAssignmentUpdate = (userId: string) => {
    updateRequest.mutate({
      id: request.id,
      assigned_to: userId,
    });
    setIsEditingAssignment(false);
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
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
                  {request.subject}
                </h1>
                <Badge variant={getPriorityColor(request.priority)}>
                  {request.priority}
                </Badge>
              </div>
              <p className="text-muted-foreground font-mono">{request.request_number}</p>
            </div>
            
            <div className="flex items-center gap-2">
              {isEditingStage ? (
                <Select value={request.stage} onValueChange={handleStageUpdate}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="assigned">Assigned</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="on_hold">On Hold</SelectItem>
                    <SelectItem value="repaired">Repaired</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setIsEditingStage(true)}
                  className={getStageColor(request.stage)}
                >
                  {request.stage.replace('_', ' ')}
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Request Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Description</label>
                  <p className="mt-1 text-foreground whitespace-pre-wrap">
                    {request.description || 'No description provided'}
                  </p>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Request Type</label>
                    <p className="mt-1 capitalize">{request.request_type}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Category</label>
                    <p className="mt-1">{request.category || 'Not specified'}</p>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Created Date</label>
                    <p className="mt-1">{format(new Date(request.created_at), 'MMM d, yyyy HH:mm')}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                    <p className="mt-1">{format(new Date(request.updated_at), 'MMM d, yyyy HH:mm')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Equipment Info */}
            {request.equipment && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wrench className="w-5 h-5" />
                    Equipment Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Name</span>
                    <Link to={`/equipment/${request.equipment.id}`} className="text-primary hover:underline">
                      {request.equipment.name}
                    </Link>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Serial Number</span>
                    <span>{request.equipment.serial_number}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-muted-foreground">Category</span>
                    <Badge variant="outline">{request.equipment.category}</Badge>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Schedule & Time Tracking */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Schedule & Time Tracking
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Scheduled Date</label>
                    <p className="mt-1">
                      {request.scheduled_date 
                        ? format(new Date(request.scheduled_date), 'MMM d, yyyy')
                        : 'Not scheduled'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Scheduled Time</label>
                    <p className="mt-1">{request.scheduled_time || 'Not specified'}</p>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Estimated Hours</label>
                    <p className="mt-1">{request.estimated_hours || '-'} hours</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Actual Hours</label>
                    <p className="mt-1">{request.actual_hours || '-'} hours</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notes Tab */}
            <Tabs defaultValue="notes" className="w-full">
              <TabsList>
                <TabsTrigger value="notes">Notes</TabsTrigger>
                <TabsTrigger value="instructions">Instructions</TabsTrigger>
              </TabsList>
              <TabsContent value="notes">
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-muted-foreground">
                      {request.resolution_notes || 'No notes yet'}
                    </p>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="instructions">
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-muted-foreground">No instructions provided</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Assignment */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <User className="w-4 h-4" />
                  Assignment
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Created By</label>
                  <p className="mt-1">{request.created_by_profile?.full_name || 'Unknown'}</p>
                </div>
                
                <Separator />
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Assigned To</label>
                  {isEditingAssignment ? (
                    <Select 
                      value={request.assigned_to || undefined} 
                      onValueChange={handleAssignmentUpdate}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue placeholder="Select technician" />
                      </SelectTrigger>
                      <SelectContent>
                        {profiles.filter(p => p.role === 'technician').map((profile) => (
                          <SelectItem key={profile.id} value={profile.id}>
                            {profile.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="flex items-center justify-between mt-1">
                      <p>{request.assigned_to_profile?.full_name || 'Unassigned'}</p>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setIsEditingAssignment(true)}
                      >
                        Edit
                      </Button>
                    </div>
                  )}
                </div>

                {request.teams && (
                  <>
                    <Separator />
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Team</label>
                      <p className="mt-1">{request.teams.name}</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Cost Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <DollarSign className="w-4 h-4" />
                  Cost Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Estimated Cost</span>
                  <span className="font-semibold">
                    ${request.estimated_cost?.toFixed(2) || '0.00'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">Actual Cost</span>
                  <span className="font-semibold">
                    ${request.actual_cost?.toFixed(2) || '0.00'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start" asChild disabled={!request.equipment_id}>
                  <Link to="/equipment">
                    <Settings className="w-4 h-4 mr-2" />
                    View Equipment
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Add Comment
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
