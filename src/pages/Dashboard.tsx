import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useEquipment } from '@/hooks/useEquipment';
import { useMaintenanceRequests } from '@/hooks/useMaintenanceRequests';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { seedSampleData } from '@/lib/seedData';
import { useToast } from '@/hooks/use-toast';
import EmployeeDashboard from './EmployeeDashboard';
import TechnicianDashboard from './TechnicianDashboard';
import {
  Plus,
  AlertTriangle,
  Users,
  Search,
  MessageSquare,
  Database,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function Dashboard() {
  const { profile } = useAuth();

  // Route to role-based dashboard
  if (profile?.role === 'technician') {
    return <TechnicianDashboard />;
  }

  if (profile?.role === 'manager') {
    return <EmployeeDashboard />;
  }

  // Admin dashboard (default)
  const { data: equipment = [], refetch: refetchEquipment } = useEquipment();
  const { data: requests = [], refetch: refetchRequests } = useMaintenanceRequests();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSeeding, setIsSeeding] = useState(false);
  const { toast } = useToast();

  const now = new Date();
  
  // Calculate critical equipment (health < 30%)
  const criticalEquipment = equipment.filter(e => (e.health_score || 100) < 30);
  
  // Calculate open requests stats
  const openRequests = requests.filter(r => !['repaired', 'closed', 'cancelled'].includes(r.stage));
  const pendingRequests = openRequests.filter(r => r.stage === 'new' || r.stage === 'assigned');
  const overdueRequests = openRequests.filter(r => {
    if (!r.scheduled_date) return false;
    return new Date(r.scheduled_date) < now;
  });

  // Calculate technician load (mock calculation based on assigned requests)
  const assignedRequests = requests.filter(r => r.assigned_to && !['closed', 'cancelled'].includes(r.stage));
  const utilizationRate = Math.min(Math.round((assignedRequests.length / Math.max(requests.length * 0.3, 1)) * 100), 100);

  // Filter requests based on search
  const filteredRequests = requests.filter(r => 
    searchQuery === '' || 
    r.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.request_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSeedData = async () => {
    setIsSeeding(true);
    const result = await seedSampleData();
    if (result.success) {
      toast({ title: 'Success!', description: result.message });
      refetchEquipment();
      refetchRequests();
    } else {
      toast({ 
        title: 'Error', 
        description: result.message, 
        variant: 'destructive' 
      });
    }
    setIsSeeding(false);
  };

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 animate-fade-in">
        {/* Header with Search and New Button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
          <Button 
            className="bg-gray-700 hover:bg-gray-600 text-white border border-gray-600"
            asChild
          >
            <Link to="/requests/new">
              New
            </Link>
          </Button>
          
          <div className="relative flex-1 max-w-2xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white"
            />
          </div>
        </div>

        {/* Stats Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Critical Equipment Card */}
          <Link to="/equipment?filter=critical">
            <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer shadow-lg border border-red-500">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-white text-sm font-medium mb-2">Critical Equipment</h3>
                  <p className="text-2xl font-bold text-white mb-1">{criticalEquipment.length} Units</p>
                  <p className="text-xs text-white">(Health &lt; 30%)</p>
                </div>
                <AlertTriangle className="w-8 h-8 text-white" />
              </div>
            </div>
          </Link>

          {/* Technician Load Card - Blue Background */}
          <div className="bg-gradient-to-br from-blue-900 to-blue-950 rounded-lg p-6 shadow-lg border border-blue-800">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-blue-200 text-sm font-medium mb-2">Technician Load</h3>
                <p className="text-2xl font-bold text-white mb-1">{utilizationRate}% Utilized</p>
                <p className="text-xs text-blue-300">(Assign Carefully!)</p>
              </div>
              <Users className="w-8 h-8 text-blue-300" />
            </div>
          </div>

          {/* Open Requests Card */}
          <Link to="/requests?filter=open">
            <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer shadow-lg border border-green-500">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-white text-sm font-medium mb-2">Open Requests</h3>
                  <p className="text-2xl font-bold text-white mb-1">{pendingRequests.length} Pending</p>
                  <p className="text-xs text-white">{overdueRequests.length} Overdue</p>
                </div>
                <div className="bg-white/20 rounded-full p-2">
                  <div className="w-5 h-5 bg-white rounded-full" />
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Maintenance Reports Table */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50 border-b">
                  <TableHead className="font-semibold text-gray-700">Subjects</TableHead>
                  <TableHead className="font-semibold text-gray-700">Employee</TableHead>
                  <TableHead className="font-semibold text-gray-700">Technician</TableHead>
                  <TableHead className="font-semibold text-gray-700">Category</TableHead>
                  <TableHead className="font-semibold text-gray-700">Stage</TableHead>
                  <TableHead className="font-semibold text-gray-700">Company</TableHead>
                  <TableHead className="w-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No maintenance requests found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRequests.slice(0, 10).map((request) => (
                    <TableRow 
                      key={request.id}
                      className="hover:bg-gray-50 cursor-pointer border-b"
                      onClick={() => window.location.href = `/requests/${request.id}`}
                    >
                      <TableCell className="font-medium">
                        <Link to={`/requests/${request.id}`} className="hover:text-primary">
                          {request.subject}
                        </Link>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {request.created_by_profile?.full_name || 'Mitchell Admin'}
                      </TableCell>
                      <TableCell className="text-gray-600">
                        {request.assigned_to_profile?.full_name || 'Alex Foster'}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {request.category || 'computer'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          request.stage === 'new' ? 'bg-blue-100 text-blue-800' :
                          request.stage === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                          request.stage === 'closed' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {request.stage === 'new' ? 'New Request' : request.stage.replace('_', ' ')}
                        </span>
                      </TableCell>
                      <TableCell className="text-gray-600">
                        My company
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MessageSquare className="h-4 w-4 text-gray-400" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Show more link if there are more requests */}
        {filteredRequests.length > 10 && (
          <div className="mt-4 text-center">
            <Link to="/requests" className="text-primary hover:underline text-sm">
              View all {filteredRequests.length} requests →
            </Link>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
