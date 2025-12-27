import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useMaintenanceRequests } from '@/hooks/useMaintenanceRequests';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Plus } from 'lucide-react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, parseISO, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns';
import { Link } from 'react-router-dom';

export default function MaintenanceCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const { data: requests = [] } = useMaintenanceRequests();

  // Filter requests that have scheduled dates
  const scheduledRequests = requests.filter(r => r.scheduled_date);

  // Get requests for a specific date
  const getRequestsForDate = (date: Date) => {
    return scheduledRequests.filter(r => {
      if (!r.scheduled_date) return false;
      return isSameDay(parseISO(r.scheduled_date), date);
    });
  };

  // Get requests for selected date
  const selectedDateRequests = selectedDate ? getRequestsForDate(selectedDate) : [];

  // Get week view dates
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Time slots for the day (6 AM to midnight)
  const timeSlots = Array.from({ length: 19 }, (_, i) => i + 6); // 6:00 to 23:00

  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500 border-red-600';
      case 'high': return 'bg-orange-500 border-orange-600';
      case 'medium': return 'bg-blue-500 border-blue-600';
      default: return 'bg-gray-500 border-gray-600';
    }
  };

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl lg:text-3xl font-bold text-foreground">Maintenance Calendar</h1>
          <div className="flex items-center gap-2">
            <Button asChild>
              <Link to="/calendar/add-work">
                <Plus className="h-4 w-4 mr-2" />
                New Request
              </Link>
            </Button>
            <Button variant="outline" size="sm" onClick={handleToday}>
              Today
            </Button>
            <div className="flex items-center border rounded-md">
              <Button variant="ghost" size="sm" onClick={handlePrevMonth} className="rounded-r-none">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="px-4 py-2 text-sm font-medium border-x">
                {format(currentDate, 'MMMM yyyy')}
              </div>
              <Button variant="ghost" size="sm" onClick={handleNextMonth} className="rounded-l-none">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Week Calendar View */}
          <div className="lg:col-span-3">
            <Card>
              <CardContent className="p-0">
                {/* Week Header */}
                <div className="grid grid-cols-8 border-b bg-gray-50">
                  <div className="p-3 text-xs font-medium text-gray-500 border-r">Time</div>
                  {weekDays.map((day, index) => (
                    <div
                      key={index}
                      className={`p-3 text-center border-r last:border-r-0 ${
                        isSameDay(day, new Date()) ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="text-xs font-medium text-gray-500 uppercase">
                        {format(day, 'EEE')}
                      </div>
                      <div className={`text-lg font-bold mt-1 ${
                        isSameDay(day, new Date()) 
                          ? 'bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center mx-auto' 
                          : 'text-gray-900'
                      }`}>
                        {format(day, 'd')}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Time Grid */}
                <div className="overflow-y-auto" style={{ maxHeight: '600px' }}>
                  {timeSlots.map((hour) => (
                    <div key={hour} className="grid grid-cols-8 border-b">
                      <div className="p-2 text-xs text-gray-500 border-r">
                        {`${hour.toString().padStart(2, '0')}:00`}
                      </div>
                      {weekDays.map((day, dayIndex) => {
                        const dayRequests = getRequestsForDate(day).filter(r => {
                          if (!r.scheduled_time) return false;
                          const [schedHour] = r.scheduled_time.split(':').map(Number);
                          return schedHour === hour;
                        });

                        return (
                          <div
                            key={dayIndex}
                            className="p-2 border-r last:border-r-0 min-h-[60px] hover:bg-gray-50 cursor-pointer relative"
                            onClick={() => setSelectedDate(day)}
                          >
                            {dayRequests.map((request) => (
                              <Link
                                key={request.id}
                                to={`/requests/${request.id}`}
                                className={`block text-xs p-1 rounded mb-1 border-l-2 ${getPriorityColor(request.priority)} text-white hover:opacity-80 transition-opacity`}
                              >
                                <div className="font-medium truncate">{request.subject}</div>
                                <div className="text-xs opacity-90 truncate">{request.equipment?.name}</div>
                              </Link>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Mini Calendar & Selected Date Info */}
          <div className="space-y-4">
            {/* Mini Calendar */}
            <Card>
              <CardContent className="p-4">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  month={currentDate}
                  onMonthChange={setCurrentDate}
                  className="rounded-md"
                  modifiers={{
                    scheduled: scheduledRequests.map(r => parseISO(r.scheduled_date!))
                  }}
                  modifiersClassNames={{
                    scheduled: 'bg-blue-100 text-blue-900 font-bold'
                  }}
                />
              </CardContent>
            </Card>

            {/* Selected Date Requests */}
            {selectedDate && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4" />
                    {format(selectedDate, 'MMMM d, yyyy')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {selectedDateRequests.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-sm text-muted-foreground mb-3">No scheduled maintenance</p>
                      <Button asChild size="sm" variant="outline">
                        <Link to="/calendar/add-work">
                          <Plus className="h-3 w-3 mr-2" />
                          Add Work
                        </Link>
                      </Button>
                    </div>
                  ) : (
                    selectedDateRequests.map((request) => (
                      <Link
                        key={request.id}
                        to={`/requests/${request.id}`}
                        className="block p-3 rounded-lg border hover:border-primary hover:shadow-sm transition-all"
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <span className="font-medium text-sm">{request.subject}</span>
                          <Badge
                            variant={
                              request.priority === 'critical' ? 'destructive' :
                              request.priority === 'high' ? 'default' :
                              'secondary'
                            }
                            className="text-xs"
                          >
                            {request.priority}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">{request.equipment?.name}</div>
                        {request.scheduled_time && (
                          <div className="text-xs text-muted-foreground mt-1">
                            🕐 {request.scheduled_time}
                          </div>
                        )}
                        <Badge variant="outline" className="text-xs mt-2">
                          {request.stage.replace('_', ' ')}
                        </Badge>
                      </Link>
                    ))
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
