import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useMaintenanceRequests, useUpdateMaintenanceRequest } from '@/hooks/useMaintenanceRequests';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, MoreVertical, User, Calendar, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  DndContext, 
  DragEndEvent, 
  DragOverlay, 
  DragStartEvent, 
  PointerSensor, 
  useSensor, 
  useSensors,
  closestCorners,
  DragOverEvent,
  useDroppable
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { format } from 'date-fns';
import type { MaintenanceRequest } from '@/hooks/useMaintenanceRequests';

const stages = [
  { id: 'new', name: 'New', color: 'bg-gray-100' },
  { id: 'assigned', name: 'Assigned', color: 'bg-blue-100' },
  { id: 'in_progress', name: 'In Progress', color: 'bg-yellow-100' },
  { id: 'on_hold', name: 'On Hold', color: 'bg-orange-100' },
  { id: 'repaired', name: 'Repaired', color: 'bg-green-100' },
  { id: 'closed', name: 'Closed', color: 'bg-gray-200' },
];

interface RequestCardProps {
  request: MaintenanceRequest;
  isDragging?: boolean;
}

function SortableRequestCard({ request }: RequestCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: request.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <RequestCard request={request} />
    </div>
  );
}

function RequestCard({ request }: RequestCardProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'destructive';
      case 'high': return 'default';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <Card className="mb-2 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow">
      <CardContent className="p-3">
        <div className="flex items-start justify-between mb-1.5 gap-1">
          <Link 
            to={`/requests/${request.id}`}
            className="font-medium text-xs hover:text-primary flex-1 break-words line-clamp-1"
            onClick={(e) => e.stopPropagation()}
          >
            {request.subject}
          </Link>
        </div>

        <p className="text-[10px] text-muted-foreground mb-2 line-clamp-1 break-words">
          {request.equipment?.name || 'No equipment'}
        </p>

        <div className="flex items-center gap-1 mb-2 flex-wrap">
          <Badge variant={getPriorityColor(request.priority)} className="text-[10px] px-1.5 py-0">
            {request.priority}
          </Badge>
          {request.category && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 truncate max-w-[80px]">
              {request.category}
            </Badge>
          )}
        </div>

        <div className="space-y-1">
          {request.assigned_to_profile && (
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <User className="h-2.5 w-2.5 flex-shrink-0" />
              <span className="truncate">{request.assigned_to_profile.full_name}</span>
            </div>
          )}

          {request.scheduled_date && (
            <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Calendar className="h-2.5 w-2.5" />
              <span>{format(new Date(request.scheduled_date), 'MMM d')}</span>
              {new Date(request.scheduled_date) < new Date() && request.stage !== 'closed' && (
                <AlertCircle className="h-2.5 w-2.5 text-destructive" />
              )}
            </div>
          )}
        </div>

        <div className="mt-2 pt-2 border-t">
          <span className="text-[10px] text-muted-foreground font-mono truncate block">
            {request.request_number}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function DroppableStage({ stage, children }: { stage: typeof stages[0]; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
  });

  return (
    <div ref={setNodeRef} className="flex flex-col h-full">
      {/* Stage Header */}
      <div className={`${stage.color} rounded-t-lg p-2.5 border-b-2 ${isOver ? 'border-primary' : 'border-gray-300'}`}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-xs">{stage.name}</h3>
        </div>
      </div>

      {/* Stage Cards */}
      <div className={`flex-1 p-2 bg-gray-50 rounded-b-lg min-h-[400px] max-h-[calc(100vh-280px)] overflow-y-auto ${isOver ? 'bg-blue-50' : ''}`}>
        {children}
      </div>
    </div>
  );
}

export default function Kanban() {
  const { data: requests = [] } = useMaintenanceRequests();
  const updateRequest = useUpdateMaintenanceRequest();
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      return;
    }

    const activeRequest = requests.find(r => r.id === active.id);
    
    // Get the stage ID - could be from a stage container or from another card
    let targetStage = over.id as string;
    
    // If dropped on another card, find its stage
    if (!stages.some(s => s.id === targetStage)) {
      const overRequest = requests.find(r => r.id === over.id);
      if (overRequest) {
        targetStage = overRequest.stage;
      }
    }

    // Check if dropped on a different stage
    if (activeRequest && stages.some(s => s.id === targetStage) && activeRequest.stage !== targetStage) {
      updateRequest.mutate({
        id: activeRequest.id,
        stage: targetStage as MaintenanceRequest['stage'],
      });
    }

    setActiveId(null);
  };

  const activeRequest = activeId ? requests.find(r => r.id === activeId) : null;

  const getRequestsByStage = (stageId: string) => {
    return requests.filter(r => r.stage === stageId);
  };

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Kanban Board</h1>
            <p className="text-muted-foreground mt-1">Drag and drop to update request status</p>
          </div>
          <Button asChild>
            <Link to="/requests/new">
              <Plus className="w-4 h-4 mr-2" />
              New Request
            </Link>
          </Button>
        </div>

        {/* Kanban Board */}
        <DndContext
          sensors={sensors}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          collisionDetection={closestCorners}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {stages.map((stage) => {
              const stageRequests = getRequestsByStage(stage.id);
              
              return (
                <DroppableStage key={stage.id} stage={stage}>
                  <div className="mb-1.5 flex items-center justify-between">
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                      {stageRequests.length}
                    </Badge>
                  </div>
                  
                  <SortableContext
                    id={stage.id}
                    items={stageRequests.map(r => r.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    {stageRequests.length === 0 ? (
                      <div className="text-center py-6 text-xs text-muted-foreground">
                        No requests
                      </div>
                    ) : (
                      stageRequests.map((request) => (
                        <SortableRequestCard key={request.id} request={request} />
                      ))
                    )}
                  </SortableContext>
                </DroppableStage>
              );
            })}
          </div>

          <DragOverlay>
            {activeRequest ? <RequestCard request={activeRequest} /> : null}
          </DragOverlay>
        </DndContext>
      </div>
    </AppLayout>
  );
}
