import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useMaintenanceRequests } from '@/hooks/useMaintenanceRequests';
import { AppLayout } from '@/components/layout/AppLayout';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Wrench,
  Clock,
  CheckCircle,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';

export default function TechnicianDashboard() {
  const { profile } = useAuth();
  const { data: requests = [] } = useMaintenanceRequests();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter requests assigned to this technician
  const myAssignments = requests.filter(r => r.assigned_to === profile?.id);
  const activeWork = myAssignments.filter(r => r.stage === 'in_progress');
  const pendingWork = myAssignments.filter(r => r.stage === 'assigned');
  const completedToday = myAssignments.filter(r => {
    if (r.stage !== 'closed') return false;
    const today = new Date().toDateString();
    return new Date(r.updated_at).toDateString() === today;
  });

  // Filter requests based on search
  const filteredRequests = myAssignments.filter(r => 
    searchQuery === '' || 
    r.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.equipment?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.request_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStageColor = (stage: string) => {
    switch (stage) {
      case 'assigned': return 'bg-purple-100 text-purple-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'on_hold': return 'bg-orange-100 text-orange-800';
      case 'repaired': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">My Work</h1>
            <p className="text-muted-foreground mt-1">Welcome back, {profile?.full_name}</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-100">Active Work</p>
                <p className="text-3xl font-bold mt-1">{activeWork.length}</p>
              </div>
              <Wrench className="w-10 h-10 text-yellow-100" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-100">Pending</p>
                <p className="text-3xl font-bold mt-1">{pendingWork.length}</p>
              </div>
              <Clock className="w-10 h-10 text-purple-100" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-100">Completed Today</p>
                <p className="text-3xl font-bold mt-1">{completedToday.length}</p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-100" />
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search my assignments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Work Table */}
        <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="font-semibold">Request #</TableHead>
                  <TableHead className="font-semibold">Subject</TableHead>
                  <TableHead className="font-semibold">Equipment</TableHead>
                  <TableHead className="font-semibold">Priority</TableHead>
                  <TableHead className="font-semibold">Stage</TableHead>
                  <TableHead className="font-semibold">Scheduled</TableHead>
                  <TableHead className="font-semibold">Requester</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No work assigned to you yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRequests.map((request) => (
                    <TableRow key={request.id} className="hover:bg-gray-50 cursor-pointer">
                      <TableCell>
                        <Link to={`/requests/${request.id}`} className="text-primary hover:underline font-mono text-sm">
                          {request.request_number}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <Link to={`/requests/${request.id}`} className="hover:underline font-medium">
                          {request.subject}
                        </Link>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {request.equipment?.name || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getPriorityColor(request.priority)}>
                          {request.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-md text-xs font-medium ${getStageColor(request.stage)}`}>
                          {request.stage.replace('_', ' ')}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {request.scheduled_date 
                          ? format(new Date(request.scheduled_date), 'MMM d, yyyy')
                          : '-'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {request.created_by_profile?.full_name || '-'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
