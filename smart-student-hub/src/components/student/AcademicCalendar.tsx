import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Clock, MapPin, Users, Tag, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  getMonthlyEvents, 
  getUpcomingEvents,
  AcademicEvent, 
  getEventTypeColor, 
  getEventTypeLabel, 
  getPriorityColor,
  formatEventDate 
} from '@/services/academicCalendarApi';

interface AcademicCalendarProps {
  className?: string;
}

const AcademicCalendar: React.FC<AcademicCalendarProps> = ({ className }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<AcademicEvent[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<AcademicEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('all');
  const [view, setView] = useState<'month' | 'upcoming'>('month');

  // Get calendar data
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const currentDateObj = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDateObj));
      currentDateObj.setDate(currentDateObj.getDate() + 1);
    }

    return days;
  }, [year, month]);

  // Filter events by type
  const filteredEvents = useMemo(() => {
    if (eventTypeFilter === 'all') return events;
    return events.filter(event => event.eventType === eventTypeFilter);
  }, [events, eventTypeFilter]);

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    return filteredEvents.filter(event => {
      const eventStart = new Date(event.startDate);
      const eventEnd = new Date(event.endDate);
      const checkDate = new Date(date);
      
      return checkDate >= new Date(eventStart.toDateString()) && 
             checkDate <= new Date(eventEnd.toDateString());
    });
  };

  // Fetch monthly events
  const fetchMonthlyEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getMonthlyEvents(year, month + 1);
      setEvents(response.data);
    } catch (err) {
      console.error('Error fetching monthly events:', err);
      setError('Failed to load calendar events');
    } finally {
      setLoading(false);
    }
  };

  // Fetch upcoming events
  const fetchUpcomingEvents = async () => {
    try {
      const response = await getUpcomingEvents(10);
      setUpcomingEvents(response.data);
    } catch (err) {
      console.error('Error fetching upcoming events:', err);
    }
  };

  // Navigation functions
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDate(null);
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDate(null);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(null);
  };

  // Check if date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Check if date is in current month
  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === month && date.getFullYear() === year;
  };

  // Get selected date events
  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  useEffect(() => {
    fetchMonthlyEvents();
    fetchUpcomingEvents();
  }, [year, month]);

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Academic Calendar</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Select value={view} onValueChange={(value: 'month' | 'upcoming') => setView(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Month View</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                </SelectContent>
              </Select>
              <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Events</SelectItem>
                  <SelectItem value="exam">Exams</SelectItem>
                  <SelectItem value="assignment">Assignments</SelectItem>
                  <SelectItem value="holiday">Holidays</SelectItem>
                  <SelectItem value="workshop">Workshops</SelectItem>
                  <SelectItem value="seminar">Seminars</SelectItem>
                  <SelectItem value="cultural">Cultural</SelectItem>
                  <SelectItem value="sports">Sports</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {view === 'month' ? (
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Calendar */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{monthName}</h3>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={goToPreviousMonth}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={goToToday}>
                    Today
                  </Button>
                  <Button variant="outline" size="sm" onClick={goToNextMonth}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((date, index) => {
                  const dayEvents = getEventsForDate(date);
                  const isSelected = selectedDate?.toDateString() === date.toDateString();
                  
                  return (
                    <div
                      key={index}
                      className={`
                        min-h-[80px] p-1 border rounded cursor-pointer transition-colors
                        ${isCurrentMonth(date) ? 'bg-background' : 'bg-muted/30'}
                        ${isToday(date) ? 'bg-primary/10 border-primary' : 'border-border'}
                        ${isSelected ? 'bg-primary/20 border-primary' : ''}
                        hover:bg-muted/50
                      `}
                      onClick={() => setSelectedDate(date)}
                    >
                      <div className={`text-sm ${isCurrentMonth(date) ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {date.getDate()}
                      </div>
                      <div className="space-y-1">
                        {dayEvents.slice(0, 2).map((event, eventIndex) => (
                          <div
                            key={eventIndex}
                            className="text-xs p-1 rounded truncate"
                            style={{ backgroundColor: `${getEventTypeColor(event.eventType)}20`, color: getEventTypeColor(event.eventType) }}
                          >
                            {event.title}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-xs text-muted-foreground">
                            +{dayEvents.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Selected Date Events */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">
                {selectedDate ? selectedDate.toLocaleDateString() : 'Select a date'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDate ? (
                selectedDateEvents.length > 0 ? (
                  <div className="space-y-3">
                    {selectedDateEvents.map((event) => (
                      <div key={event._id} className="p-3 border rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="font-medium">{event.title}</h4>
                          <Badge 
                            variant="outline" 
                            style={{ borderColor: getEventTypeColor(event.eventType), color: getEventTypeColor(event.eventType) }}
                          >
                            {getEventTypeLabel(event.eventType)}
                          </Badge>
                        </div>
                        {event.description && (
                          <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                        )}
                        <div className="space-y-1 text-xs text-muted-foreground">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatEventDate(event.startDate, event.endDate, event.isAllDay)}</span>
                          </div>
                          {event.location && (
                            <div className="flex items-center space-x-1">
                              <MapPin className="h-3 w-3" />
                              <span>{event.location}</span>
                            </div>
                          )}
                          {event.department && (
                            <div className="flex items-center space-x-1">
                              <Users className="h-3 w-3" />
                              <span>{event.department}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No events on this date</p>
                )
              ) : (
                <p className="text-muted-foreground text-center py-8">Click on a date to view events</p>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Upcoming Events View */
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingEvents.length > 0 ? (
              <div className="space-y-4">
                {upcomingEvents.map((event) => (
                  <div key={event._id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium">{event.title}</h4>
                        <p className="text-sm text-muted-foreground">{formatEventDate(event.startDate, event.endDate, event.isAllDay)}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant="outline"
                          style={{ borderColor: getPriorityColor(event.priority), color: getPriorityColor(event.priority) }}
                        >
                          {event.priority}
                        </Badge>
                        <Badge 
                          variant="outline"
                          style={{ borderColor: getEventTypeColor(event.eventType), color: getEventTypeColor(event.eventType) }}
                        >
                          {getEventTypeLabel(event.eventType)}
                        </Badge>
                      </div>
                    </div>
                    {event.description && (
                      <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                    )}
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      {event.location && (
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3" />
                          <span>{event.location}</span>
                        </div>
                      )}
                      {event.department && (
                        <div className="flex items-center space-x-1">
                          <Users className="h-3 w-3" />
                          <span>{event.department}</span>
                        </div>
                      )}
                      {event.tags && event.tags.length > 0 && (
                        <div className="flex items-center space-x-1">
                          <Tag className="h-3 w-3" />
                          <span>{event.tags.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">No upcoming events</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AcademicCalendar;
