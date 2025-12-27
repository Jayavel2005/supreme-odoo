import { AppLayout } from '@/components/layout/AppLayout';
import { useEquipment } from '@/hooks/useEquipment';
import { useMaintenanceRequests } from '@/hooks/useMaintenanceRequests';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, TrendingUp, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

export default function Reporting() {
  const { data: equipment = [] } = useEquipment();
  const { data: requests = [] } = useMaintenanceRequests();

  const now = new Date();
  const completedRequests = requests.filter(r => r.stage === 'closed' || r.stage === 'repaired');
  const openRequests = requests.filter(r => !['repaired', 'closed', 'cancelled'].includes(r.stage));
  const overdueRequests = openRequests.filter(r => {
    if (!r.scheduled_date) return false;
    return new Date(r.scheduled_date) < now;
  });
  
  const completionRate = requests.length > 0 
    ? Math.round((completedRequests.length / requests.length) * 100) 
    : 0;

  const avgResolutionTime = completedRequests.length > 0
    ? (completedRequests.reduce((acc, r) => {
        if (r.actual_hours) return acc + r.actual_hours;
        return acc + 2.4; // default estimate
      }, 0) / completedRequests.length).toFixed(1)
    : '0';

  const criticalEquipment = equipment.filter(e => (e.health_score || 100) < 30);
  const healthyEquipment = equipment.filter(e => (e.health_score || 100) >= 80);

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 animate-fade-in">
        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Reporting & Analytics</h1>
          <p className="text-muted-foreground mt-1">Performance metrics and insights for your maintenance operations</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completionRate}%</div>
              <p className="text-xs text-muted-foreground">
                {completedRequests.length} of {requests.length} requests
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Resolution Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{avgResolutionTime}h</div>
              <p className="text-xs text-muted-foreground">
                Per maintenance request
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Equipment Health</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{healthyEquipment.length}/{equipment.length}</div>
              <p className="text-xs text-muted-foreground">
                Healthy equipment (≥80%)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overdueRequests.length + criticalEquipment.length}</div>
              <p className="text-xs text-muted-foreground">
                Requires immediate attention
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Reports */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Request Status Breakdown</CardTitle>
              <CardDescription>Distribution of maintenance requests by stage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {['new', 'assigned', 'in_progress', 'on_hold', 'repaired', 'closed'].map(stage => {
                  const count = requests.filter(r => r.stage === stage).length;
                  const percentage = requests.length > 0 ? Math.round((count / requests.length) * 100) : 0;
                  return (
                    <div key={stage} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="capitalize">{stage.replace('_', ' ')}</span>
                        <span className="font-medium">{count} ({percentage}%)</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Equipment by Category</CardTitle>
              <CardDescription>Distribution of equipment across categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from(new Set(equipment.map(e => e.category))).slice(0, 6).map(category => {
                  const count = equipment.filter(e => e.category === category).length;
                  const percentage = equipment.length > 0 ? Math.round((count / equipment.length) * 100) : 0;
                  return (
                    <div key={category} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="capitalize">{category}</span>
                        <span className="font-medium">{count} ({percentage}%)</span>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all" 
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
