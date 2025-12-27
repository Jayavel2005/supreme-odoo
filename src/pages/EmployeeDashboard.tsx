import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useMaintenanceRequests } from '@/hooks/useMaintenanceRequests';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus,
  Search,
  Clock,
  CheckCircle,
  AlertCircle,
  Activity,
  MapPin,
  User,
  Calendar,
  Wrench,
  CircleDot,
  ChevronDown,
  ChevronUp,
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

export default function EmployeeDashboard() {
  const { profile } = useAuth();
  const { data: requests = [] } = useMaintenanceRequests();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('list');
  const [expandedRequestId, setExpandedRequestId] = useState<string | null>(null);

  // Filter requests created by this employee
  const myRequests = requests.filter(r => r.created_by === profile?.id);
  const openRequests = myRequests.filter(r => !['closed', 'cancelled'].includes(r.stage));
  const completedRequests = myRequests.filter(r => r.stage === 'closed');
  const pendingRequests = myRequests.filter(r => r.stage === 'new' || r.stage === 'assigned');

  // Filter requests based on search
  const filteredRequests = myRequests.filter(r =>
    searchQuery === '' ||
    r.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.request_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleRequest = (requestId: string) => {
    // If clicking the already expanded request, collapse it. Otherwise, expand the new one
    setExpandedRequestId(prev => prev === requestId ? null : requestId);
  };

  const expandAll = () => {
    // Expand the first request (since only one can be open at a time)
    if (filteredRequests.length > 0) {
      setExpandedRequestId(filteredRequests[0].id);
    }
  };

  const collapseAll = () => {
    setExpandedRequestId(null);
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  const getStageProgress = (stage: string) => {
    const stages = ['new', 'assigned', 'in_progress', 'repaired', 'closed'];
    return stages.indexOf(stage) + 1;
  };

  const getStageLabel = (stage: string) => {
    const labels: Record<string, string> = {
      new: 'Submitted',
      assigned: 'Assigned',
      in_progress: 'In Progress',
      on_hold: 'On Hold',
      repaired: 'Repaired',
      closed: 'Completed',
      cancelled: 'Cancelled',
    };
    return labels[stage] || stage;
  };

  const getStageIcon = (stage: string, isCompleted: boolean, isCurrent: boolean) => {
    if (isCompleted) {
      return <CheckCircle className="w-5 h-5" />;
    }
    if (isCurrent) {
      return <CircleDot className="w-5 h-5" />;
    }
    return <div className="w-2.5 h-2.5 bg-gray-300 rounded-full" />;
  };

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">My Requests</h1>
            <p className="text-muted-foreground mt-1">Welcome back, {profile?.full_name}</p>
          </div>
          <Button className="ml-auto" asChild>
            <Link to="/requests/new">
              <Plus className="w-4 h-4 mr-2" />
              New Request
            </Link>
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Open Requests</p>
                <p className="text-2xl font-bold mt-1">{openRequests.length}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold mt-1">{pendingRequests.length}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-orange-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold mt-1">{completedRequests.length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search my requests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Tabs for List and Tracking Views */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="list">
              <Search className="w-4 h-4 mr-2" />
              All Requests
            </TabsTrigger>
            <TabsTrigger value="tracking">
              <Activity className="w-4 h-4 mr-2" />
              Track Progress
            </TabsTrigger>
          </TabsList>

          {/* List View */}
          <TabsContent value="list">
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
                      <TableHead className="font-semibold">Technician</TableHead>
                      <TableHead className="font-semibold">Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRequests.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No requests found. Click "New Request" to create one.
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
                            <Link to={`/requests/${request.id}`} className="hover:underline">
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
                          <TableCell className="text-sm">
                            {request.assigned_to_profile?.full_name || 'Unassigned'}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {format(new Date(request.created_at), 'MMM d, yyyy')}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </TabsContent>

          {/* Accordion-style Tracking View */}
          <TabsContent value="tracking">
            {/* Collapse All Control */}
            {filteredRequests.length > 0 && (
              <div className="flex justify-end gap-2 mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={collapseAll}
                  disabled={!expandedRequestId}
                  className="text-xs"
                >
                  <ChevronUp className="w-3.5 h-3.5 mr-1.5" />
                  Collapse All
                </Button>
              </div>
            )}

            <div className="space-y-4">
              {filteredRequests.length === 0 ? (
                <div className="bg-white rounded-lg border p-8 text-center text-muted-foreground">
                  No requests found to track.
                </div>
              ) : (
                filteredRequests.map((request) => {
                  const stages = ['new', 'assigned', 'in_progress', 'repaired', 'closed'];
                  const currentIndex = stages.indexOf(request.stage);
                  const progressPercentage = ((currentIndex + 1) / stages.length) * 100;
                  const isExpanded = expandedRequestId === request.id;

                  const stageData = [
                    {
                      key: 'new',
                      label: 'Request Submitted',
                      icon: Clock,
                      date: request.created_at,
                      description: 'Your maintenance request has been received',
                    },
                    {
                      key: 'assigned',
                      label: 'Technician Assigned',
                      icon: User,
                      date: currentIndex >= 1 ? request.updated_at : null,
                      description: `Assigned to ${request.assigned_to_profile?.full_name || 'technician'}`,
                    },
                    {
                      key: 'in_progress',
                      label: 'Work in Progress',
                      icon: Wrench,
                      date: currentIndex >= 2 ? request.actual_start : null,
                      description: 'Repair work is currently underway',
                    },
                    {
                      key: 'repaired',
                      label: 'Repair Complete',
                      icon: CheckCircle,
                      date: currentIndex >= 3 ? request.actual_end : null,
                      description: 'Work has been completed successfully',
                    },
                    {
                      key: 'closed',
                      label: 'Request Closed',
                      icon: CheckCircle,
                      date: currentIndex >= 4 ? request.updated_at : null,
                      description: 'Request has been finalized and closed',
                    },
                  ];

                  return (
                    <div 
                      key={request.id} 
                      className={`bg-white rounded-xl border shadow-sm overflow-hidden transition-all duration-300 ${
                        isExpanded ? 'shadow-lg ring-2 ring-blue-200' : 'hover:shadow-md'
                      }`}
                    >
                      {/* Collapsible Header Section */}
                      <div 
                        className={`bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b cursor-pointer transition-colors ${
                          isExpanded ? 'from-blue-100 to-indigo-100' : 'hover:from-blue-100 hover:to-indigo-100'
                        }`}
                        onClick={() => toggleRequest(request.id)}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 flex-wrap mb-2">
                              <h3 className="text-xl font-bold text-foreground truncate">
                                {request.subject}
                              </h3>
                              <Badge variant={getPriorityColor(request.priority)} className="text-xs font-semibold flex-shrink-0">
                                {request.priority}
                              </Badge>
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${getStageColor(request.stage)}`}>
                                {getStageLabel(request.stage)}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                              <span className="font-mono font-medium">{request.request_number}</span>
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                                <span className="truncate">{request.equipment?.name}</span>
                              </span>
                              <span className="flex items-center gap-1">
                                <User className="w-3.5 h-3.5 flex-shrink-0" />
                                <span className="truncate">{request.assigned_to_profile?.full_name || 'Unassigned'}</span>
                              </span>
                            </div>
                          </div>

                          {/* Chevron Icon */}
                          <div className="flex-shrink-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-10 w-10 p-0 hover:bg-white/50"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleRequest(request.id);
                              }}
                            >
                              {isExpanded ? (
                                <ChevronUp className="w-5 h-5 text-primary" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-primary" />
                              )}
                            </Button>
                          </div>
                        </div>

                        {/* Mini Progress Bar (Always Visible) */}
                        <div className="mt-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium text-muted-foreground">Progress</span>
                            <span className="text-xs font-bold text-primary">{Math.round(progressPercentage)}%</span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-700 ease-out rounded-full"
                              style={{ width: `${progressPercentage}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Collapsible Timeline Section */}
                      <div 
                        className={`transition-all duration-500 ease-in-out overflow-hidden ${
                          isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
                        }`}
                      >
                        <div className="p-8">
                          {/* Metadata Cards */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div className="p-4 bg-gray-50 rounded-lg border">
                              <div className="flex items-center gap-2 mb-1">
                                <Calendar className="w-4 h-4 text-muted-foreground" />
                                <p className="text-xs font-semibold text-muted-foreground">CREATED</p>
                              </div>
                              <p className="text-sm font-semibold text-foreground">
                                {format(new Date(request.created_at), 'MMMM d, yyyy • hh:mm a')}
                              </p>
                            </div>
                            {request.scheduled_date && (
                              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <div className="flex items-center gap-2 mb-1">
                                  <Calendar className="w-4 h-4 text-blue-600" />
                                  <p className="text-xs font-semibold text-blue-900">SCHEDULED</p>
                                </div>
                                <p className="text-sm font-semibold text-blue-900">
                                  {format(new Date(request.scheduled_date), 'MMMM d, yyyy • hh:mm a')}
                                </p>
                              </div>
                            )}
                          </div>

                          {/* Timeline */}
                          <div className="relative">
                            {stageData.map((stage, index) => {
                              const isCompleted = index < currentIndex;
                              const isCurrent = index === currentIndex;
                              const isUpcoming = index > currentIndex;
                              const StageIcon = stage.icon;

                              return (
                                <div key={stage.key} className="relative flex gap-6 pb-10 last:pb-0">
                                  {/* Vertical Line */}
                                  {index < stageData.length - 1 && (
                                    <div className="absolute left-[22px] top-[45px] w-0.5 h-full">
                                      <div className={`h-full transition-all duration-500 ${
                                        isCompleted ? 'bg-gradient-to-b from-green-500 to-green-400' : 'bg-gray-200'
                                      }`} />
                                    </div>
                                  )}

                                  {/* Icon Circle */}
                                  <div className="relative z-10 flex-shrink-0">
                                    <div className={`
                                      w-12 h-12 rounded-full flex items-center justify-center border-4 transition-all duration-500
                                      ${isCompleted
                                        ? 'bg-green-500 border-green-500 text-white scale-100'
                                        : isCurrent
                                          ? 'bg-white border-blue-500 text-blue-500 scale-110 shadow-lg shadow-blue-200'
                                          : 'bg-white border-gray-300 text-gray-400 scale-95'
                                      }
                                    `}>
                                      {/* Pulse animation for current step */}
                                      {isCurrent && (
                                        <>
                                          <span className="absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75 animate-ping" />
                                          <span className="absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-50 animate-pulse" />
                                        </>
                                      )}
                                      <StageIcon className={`w-5 h-5 relative z-10 ${isCurrent ? 'animate-bounce' : ''}`} />
                                    </div>
                                  </div>

                                  {/* Content */}
                                  <div className={`flex-1 transition-all duration-500 ${
                                    isUpcoming ? 'opacity-50' : 'opacity-100'
                                  }`}>
                                    <div className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                                      isCompleted
                                        ? 'bg-green-50 border-green-200'
                                        : isCurrent
                                          ? 'bg-blue-50 border-blue-300 shadow-md'
                                          : 'bg-gray-50 border-gray-200'
                                    }`}>
                                      <div className="flex items-start justify-between gap-4">
                                        <div>
                                          <h3 className={`font-semibold text-base mb-1 ${
                                            isCompleted ? 'text-green-900' : isCurrent ? 'text-blue-900' : 'text-gray-600'
                                          }`}>
                                            {stage.label}
                                          </h3>
                                          <p className={`text-sm ${
                                            isCompleted ? 'text-green-700' : isCurrent ? 'text-blue-700' : 'text-gray-500'
                                          }`}>
                                            {stage.description}
                                          </p>
                                        </div>
                                        {stage.date && (isCompleted || isCurrent) && (
                                          <div className="text-right flex-shrink-0">
                                            <p className={`text-xs font-medium ${
                                              isCompleted ? 'text-green-700' : 'text-blue-700'
                                            }`}>
                                              {format(new Date(stage.date), 'MMM d')}
                                            </p>
                                            <p className={`text-xs ${
                                              isCompleted ? 'text-green-600' : 'text-blue-600'
                                            }`}>
                                              {format(new Date(stage.date), 'hh:mm a')}
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Footer Section */}
                        {(request.description || request.resolution_notes) && (
                          <div className="px-8 pb-6 space-y-3">
                            {request.description && (
                              <div className="p-4 bg-gray-50 rounded-lg border">
                                <p className="text-xs font-semibold text-muted-foreground mb-1.5">DESCRIPTION</p>
                                <p className="text-sm text-foreground">{request.description}</p>
                              </div>
                            )}
                            {request.resolution_notes && request.stage === 'closed' && (
                              <div className="p-4 bg-green-50 border-2 border-green-200 rounded-lg">
                                <div className="flex items-start gap-2">
                                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                  <div>
                                    <p className="text-xs font-semibold text-green-900 mb-1.5">RESOLUTION NOTES</p>
                                    <p className="text-sm text-green-800">{request.resolution_notes}</p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
