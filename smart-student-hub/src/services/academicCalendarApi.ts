// Academic Calendar API Service

export interface AcademicEvent {
  _id: string;
  title: string;
  description?: string;
  eventType: 'exam' | 'assignment' | 'holiday' | 'semester_start' | 'semester_end' | 'registration' | 'fee_payment' | 'workshop' | 'seminar' | 'cultural' | 'sports' | 'other';
  startDate: string;
  endDate: string;
  isAllDay: boolean;
  location?: string;
  department?: string;
  semester?: number;
  year: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  color: string;
  isActive: boolean;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  attendees?: string[];
  tags?: string[];
  reminderSettings: {
    enabled: boolean;
    reminderTime: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CalendarFilters {
  eventType?: string;
  department?: string;
  semester?: number;
  year?: number;
  startDate?: string;
  endDate?: string;
  limit?: number;
}

export interface CalendarStats {
  totalEvents: number;
  upcomingEvents: number;
  monthlyEvents: number;
  eventsByType: Array<{
    _id: string;
    count: number;
  }>;
  currentMonth: {
    year: number;
    month: number;
    name: string;
  };
}

const API_BASE_URL = 'http://localhost:5000/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

// Get all academic events with optional filters
export const getAcademicEvents = async (filters: CalendarFilters = {}): Promise<{
  success: boolean;
  data: AcademicEvent[];
  count: number;
}> => {
  const queryParams = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value.toString());
    }
  });

  const response = await fetch(`${API_BASE_URL}/academic-calendar?${queryParams}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch academic events: ${response.statusText}`);
  }

  return response.json();
};

// Get upcoming events
export const getUpcomingEvents = async (limit: number = 10, filters: Omit<CalendarFilters, 'limit'> = {}): Promise<{
  success: boolean;
  data: AcademicEvent[];
  count: number;
}> => {
  const queryParams = new URLSearchParams({ limit: limit.toString() });
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value.toString());
    }
  });

  const response = await fetch(`${API_BASE_URL}/academic-calendar/upcoming?${queryParams}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch upcoming events: ${response.statusText}`);
  }

  return response.json();
};

// Get events for a specific month
export const getMonthlyEvents = async (year: number, month: number, filters: Omit<CalendarFilters, 'year' | 'startDate' | 'endDate'> = {}): Promise<{
  success: boolean;
  data: AcademicEvent[];
  count: number;
  month: {
    year: number;
    month: number;
    startDate: string;
    endDate: string;
  };
}> => {
  const queryParams = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value.toString());
    }
  });

  const response = await fetch(`${API_BASE_URL}/academic-calendar/month/${year}/${month}?${queryParams}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch monthly events: ${response.statusText}`);
  }

  return response.json();
};

// Get specific event by ID
export const getEventById = async (eventId: string): Promise<{
  success: boolean;
  data: AcademicEvent;
}> => {
  const response = await fetch(`${API_BASE_URL}/academic-calendar/${eventId}`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch event: ${response.statusText}`);
  }

  return response.json();
};

// Get calendar statistics
export const getCalendarStats = async (): Promise<{
  success: boolean;
  data: CalendarStats;
}> => {
  const response = await fetch(`${API_BASE_URL}/academic-calendar/stats/summary`, {
    method: 'GET',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch calendar stats: ${response.statusText}`);
  }

  return response.json();
};

// Create new academic event (Admin only)
export const createAcademicEvent = async (eventData: Omit<AcademicEvent, '_id' | 'createdBy' | 'createdAt' | 'updatedAt' | 'isActive'>): Promise<{
  success: boolean;
  message: string;
  data: AcademicEvent;
}> => {
  const response = await fetch(`${API_BASE_URL}/academic-calendar`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(eventData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `Failed to create event: ${response.statusText}`);
  }

  return response.json();
};

// Update academic event (Admin only)
export const updateAcademicEvent = async (eventId: string, eventData: Partial<AcademicEvent>): Promise<{
  success: boolean;
  message: string;
  data: AcademicEvent;
}> => {
  const response = await fetch(`${API_BASE_URL}/academic-calendar/${eventId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(eventData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `Failed to update event: ${response.statusText}`);
  }

  return response.json();
};

// Delete academic event (Admin only)
export const deleteAcademicEvent = async (eventId: string): Promise<{
  success: boolean;
  message: string;
}> => {
  const response = await fetch(`${API_BASE_URL}/academic-calendar/${eventId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || `Failed to delete event: ${response.statusText}`);
  }

  return response.json();
};

// Utility functions
export const getEventTypeColor = (eventType: AcademicEvent['eventType']): string => {
  const colors: Record<AcademicEvent['eventType'], string> = {
    exam: '#EF4444',
    assignment: '#F59E0B',
    holiday: '#10B981',
    semester_start: '#3B82F6',
    semester_end: '#6366F1',
    registration: '#8B5CF6',
    fee_payment: '#EC4899',
    workshop: '#06B6D4',
    seminar: '#84CC16',
    cultural: '#F97316',
    sports: '#14B8A6',
    other: '#6B7280'
  };
  return colors[eventType] || '#6B7280';
};

export const getEventTypeLabel = (eventType: AcademicEvent['eventType']): string => {
  const labels: Record<AcademicEvent['eventType'], string> = {
    exam: 'Exam',
    assignment: 'Assignment',
    holiday: 'Holiday',
    semester_start: 'Semester Start',
    semester_end: 'Semester End',
    registration: 'Registration',
    fee_payment: 'Fee Payment',
    workshop: 'Workshop',
    seminar: 'Seminar',
    cultural: 'Cultural Event',
    sports: 'Sports Event',
    other: 'Other'
  };
  return labels[eventType] || 'Other';
};

export const getPriorityColor = (priority: AcademicEvent['priority']): string => {
  const colors: Record<AcademicEvent['priority'], string> = {
    low: '#6B7280',
    medium: '#F59E0B',
    high: '#EF4444',
    urgent: '#DC2626'
  };
  return colors[priority] || '#6B7280';
};

export const formatEventDate = (startDate: string, endDate: string, isAllDay: boolean): string => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const isSameDay = start.toDateString() === end.toDateString();
  
  if (isAllDay) {
    if (isSameDay) {
      return start.toLocaleDateString();
    } else {
      return `${start.toLocaleDateString()} - ${end.toLocaleDateString()}`;
    }
  } else {
    if (isSameDay) {
      return `${start.toLocaleDateString()} ${start.toLocaleTimeString()} - ${end.toLocaleTimeString()}`;
    } else {
      return `${start.toLocaleString()} - ${end.toLocaleString()}`;
    }
  }
};
