import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, ChevronRight, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  getUpcomingEvents, 
  AcademicEvent, 
  getEventTypeColor, 
  getEventTypeLabel, 
  formatEventDate 
} from '@/services/academicCalendarApi';

interface AcademicCalendarWidgetProps {
  className?: string;
  maxEvents?: number;
  onViewAll?: () => void;
}

const AcademicCalendarWidget: React.FC<AcademicCalendarWidgetProps> = ({ 
  className, 
  maxEvents = 5,
  onViewAll 
}) => {
  const [events, setEvents] = useState<AcademicEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUpcomingEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getUpcomingEvents(maxEvents);
      setEvents(response.data);
    } catch (err) {
      console.error('Error fetching upcoming events:', err);
      setError('Failed to load upcoming events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUpcomingEvents();
  }, [maxEvents]);

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Upcoming Events</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Upcoming Events</span>
          </CardTitle>
          {onViewAll && (
            <Button variant="ghost" size="sm" onClick={onViewAll}>
              View All
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="flex items-center space-x-2 text-red-600 py-4">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        ) : events.length > 0 ? (
          <div className="space-y-3">
            {events.map((event) => {
              const eventDate = new Date(event.startDate);
              const isToday = eventDate.toDateString() === new Date().toDateString();
              const isTomorrow = eventDate.toDateString() === new Date(Date.now() + 86400000).toDateString();
              
              let dateLabel = eventDate.toLocaleDateString();
              if (isToday) dateLabel = 'Today';
              else if (isTomorrow) dateLabel = 'Tomorrow';
              
              return (
                <div key={event._id} className="p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{event.title}</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{dateLabel}</span>
                        </div>
                        {event.location && (
                          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            <span>{event.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <Badge 
                      variant="outline" 
                      className="text-xs"
                      style={{ 
                        borderColor: getEventTypeColor(event.eventType), 
                        color: getEventTypeColor(event.eventType) 
                      }}
                    >
                      {getEventTypeLabel(event.eventType)}
                    </Badge>
                  </div>
                  
                  {event.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {event.description}
                    </p>
                  )}
                  
                  {(isToday || isTomorrow) && (
                    <div className="mt-2">
                      <Badge 
                        variant={isToday ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {isToday ? "Today" : "Tomorrow"}
                      </Badge>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No upcoming events</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AcademicCalendarWidget;
