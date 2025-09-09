import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Plus, Users, MapPin, Clock, QrCode, BarChart3, Loader2, Edit, Trash2, Download, Eye, Filter, Search, CalendarDays, Timer, Building2, Award, TrendingUp, FileText, Share2, Settings2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";

const FacultyEvents = () => {
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [filteredUpcomingEvents, setFilteredUpcomingEvents] = useState([]);
  const [filteredPastEvents, setFilteredPastEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [analytics, setAnalytics] = useState({
    totalEvents: 0,
    totalAttendees: 0,
    avgRating: 0,
    attendanceRate: '0%'
  });
  const [loading, setLoading] = useState(true);
  const [createEventData, setCreateEventData] = useState({
    title: '',
    type: '',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    capacity: '',
    credits: '',
    department: '',
    description: '',
    prerequisites: '',
    instructor: '',
    venue: '',
    registrationDeadline: ''
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [isQrDialogOpen, setIsQrDialogOpen] = useState(false);
  const [selectedEventForQr, setSelectedEventForQr] = useState(null);
  const [isRegistrationsDialogOpen, setIsRegistrationsDialogOpen] = useState(false);
  const [selectedEventRegistrations, setSelectedEventRegistrations] = useState(null);
  const [registrations, setRegistrations] = useState([]);
  const [loadingRegistrations, setLoadingRegistrations] = useState(false);
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  const API_BASE_URL = 'http://localhost:5000/api';

  // Export events data
  const exportEventsData = (events, filename) => {
    const csvContent = [
      ['Title', 'Type', 'Date', 'Time', 'Location', 'Capacity', 'Registered', 'Credits', 'Department', 'Status'].join(','),
      ...events.map(event => [
        `"${event.title}"`,
        event.type,
        formatDate(event.date),
        event.startTime || event.time || 'TBD',
        `"${event.location || 'TBD'}"`,
        event.capacity,
        event.registered?.length || 0,
        event.credits,
        `"${event.department || 'All'}"`,
        new Date(event.date) > new Date() ? 'Upcoming' : 'Past'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Events data exported successfully!');
  };

  // Get event status
  const getEventStatus = (event) => {
    const eventDate = new Date(event.date);
    const today = new Date();
    const registrationRate = (event.registered?.length || 0) / event.capacity;
    
    if (eventDate < today) return { status: 'completed', color: 'bg-gray-500', text: 'Completed' };
    if (registrationRate >= 0.9) return { status: 'full', color: 'bg-red-500', text: 'Nearly Full' };
    if (registrationRate >= 0.5) return { status: 'filling', color: 'bg-yellow-500', text: 'Filling Up' };
    return { status: 'open', color: 'bg-green-500', text: 'Open' };
  };

  // Fetch upcoming events
  const fetchUpcomingEvents = async () => {
    try {
      console.log('Fetching upcoming events from:', `${API_BASE_URL}/events?type=upcoming`);
      const response = await fetch(`${API_BASE_URL}/events?type=upcoming`);
      console.log('Response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Upcoming events data:', data);
        setUpcomingEvents(data);
      } else {
        console.error('Failed to fetch upcoming events:', response.status, response.statusText);
        toast.error(`Failed to load upcoming events: ${response.status}`);
      }
    } catch (error) {
      console.error('Error fetching upcoming events:', error);
      toast.error('Failed to load upcoming events - Network error');
    }
  };

  // Fetch past events
  const fetchPastEvents = async () => {
    try {
      console.log('Fetching past events from:', `${API_BASE_URL}/events?type=past`);
      const response = await fetch(`${API_BASE_URL}/events?type=past`);
      console.log('Past events response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Past events data:', data);
        setPastEvents(data);
      } else {
        console.error('Failed to fetch past events:', response.status, response.statusText);
        toast.error(`Failed to load past events: ${response.status}`);
      }
    } catch (error) {
      console.error('Error fetching past events:', error);
      toast.error('Failed to load past events - Network error');
    }
  };

  // Fetch analytics
  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/events/analytics/summary`);
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to load analytics');
    }
  };

  // Generate QR Code using QR Server API
  const generateQRCode = async (event) => {
    try {
      const eventUrl = `${window.location.origin}/student/events/register/${event._id || event.id}`;
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(eventUrl)}`;
      setQrCodeUrl(qrCodeUrl);
      setSelectedEventForQr(event);
      setIsQrDialogOpen(true);
    } catch (error) {
      console.error('Error generating QR code:', error);
      toast.error('Failed to generate QR code');
    }
  };

  // View registrations
  const viewRegistrations = async (event) => {
    setLoadingRegistrations(true);
    setSelectedEventRegistrations(event);
    setIsRegistrationsDialogOpen(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/events/${event._id || event.id}/registrations`);
      if (response.ok) {
        const data = await response.json();
        setRegistrations(data);
      } else {
        toast.error('Failed to load registrations');
      }
    } catch (error) {
      console.error('Error fetching registrations:', error);
      toast.error('Failed to load registrations');
    } finally {
      setLoadingRegistrations(false);
    }
  };

  // Download QR Code
  const downloadQRCode = async () => {
    try {
      const response = await fetch(qrCodeUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `${selectedEventForQr?.title}-QR.png`;
      link.href = url;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading QR code:', error);
      toast.error('Failed to download QR code');
    }
  };

  // Edit event
  const handleEditEvent = (event) => {
    console.log('Editing event:', event); // Debug log
    setEditingEvent({
      ...event,
      _id: event._id || event.id, // Ensure we have the correct ID
      date: new Date(event.date).toISOString().split('T')[0],
      capacity: event.capacity.toString(),
      credits: event.credits.toString()
    });
    setIsEditDialogOpen(true);
  };

  // Update event
  const handleUpdateEvent = async () => {
    if (!editingEvent.title || !editingEvent.type || !editingEvent.date) {
      toast.error('Please fill in all required fields');
      return;
    }

    const eventId = editingEvent._id || editingEvent.id;
    if (!eventId) {
      toast.error('Event ID not found');
      return;
    }

    setIsCreating(true);
    try {
      console.log('Updating event with ID:', eventId); // Debug log
      const updateData = {
        title: editingEvent.title,
        type: editingEvent.type,
        date: editingEvent.date,
        time: editingEvent.time,
        location: editingEvent.location,
        capacity: parseInt(editingEvent.capacity) || 100,
        credits: parseInt(editingEvent.credits) || 0,
        department: editingEvent.department,
        description: editingEvent.description
      };
      
      const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const responseData = await response.json();
      console.log('Update response:', responseData); // Debug log

      if (response.ok) {
        toast.success('Event updated successfully!');
        setIsEditDialogOpen(false);
        setEditingEvent(null);
        fetchUpcomingEvents();
        fetchPastEvents();
        fetchAnalytics();
      } else {
        console.error('Update failed:', responseData);
        toast.error(responseData.error || 'Failed to update event');
      }
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error('Network error: Failed to update event');
    } finally {
      setIsCreating(false);
    }
  };

  // Delete event
  const handleDeleteEvent = async (event) => {
    if (!confirm('Are you sure you want to delete this event?')) return;

    const eventId = event._id || event.id;
    if (!eventId) {
      toast.error('Event ID not found');
      return;
    }

    try {
      console.log('Deleting event with ID:', eventId); // Debug log
      const response = await fetch(`${API_BASE_URL}/events/${eventId}`, {
        method: 'DELETE',
      });

      const responseData = await response.json();
      console.log('Delete response:', responseData); // Debug log

      if (response.ok) {
        toast.success('Event deleted successfully!');
        fetchUpcomingEvents();
        fetchPastEvents();
        fetchAnalytics();
      } else {
        console.error('Delete failed:', responseData);
        toast.error(responseData.error || 'Failed to delete event');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error('Network error: Failed to delete event');
    }
  };

  // Create new event
  const handleCreateEvent = async () => {
    if (!createEventData.title || !createEventData.type || !createEventData.date) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsCreating(true);
    try {
      const response = await fetch(`${API_BASE_URL}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: createEventData.title,
          type: createEventData.type,
          date: createEventData.date,
          time: createEventData.startTime,
          location: createEventData.location,
          capacity: parseInt(createEventData.capacity) || 100,
          credits: parseInt(createEventData.credits) || 0,
          department: createEventData.department || 'all',
          description: createEventData.description
        }),
      });

      if (response.ok) {
        toast.success('Event created successfully!');
        setIsDialogOpen(false);
        setCreateEventData({
          title: '',
          type: '',
          date: '',
          startTime: '',
          endTime: '',
          location: '',
          capacity: '',
          credits: '',
          department: '',
          description: '',
          prerequisites: '',
          instructor: '',
          venue: '',
          registrationDeadline: ''
        });
        fetchUpcomingEvents();
        fetchAnalytics();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to create event');
      }
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Failed to create event');
    } finally {
      setIsCreating(false);
    }
  };

  // Filter and search functionality
  useEffect(() => {
    let filtered = upcomingEvents.filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           event.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || event.type === filterType;
      const matchesDepartment = filterDepartment === 'all' || event.department === filterDepartment;
      return matchesSearch && matchesType && matchesDepartment;
    });
    setFilteredUpcomingEvents(filtered);
  }, [upcomingEvents, searchTerm, filterType, filterDepartment]);

  useEffect(() => {
    let filtered = pastEvents.filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           event.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || event.type === filterType;
      const matchesDepartment = filterDepartment === 'all' || event.department === filterDepartment;
      return matchesSearch && matchesType && matchesDepartment;
    });
    setFilteredPastEvents(filtered);
  }, [pastEvents, searchTerm, filterType, filterDepartment]);

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        fetchUpcomingEvents(),
        fetchPastEvents(),
        fetchAnalytics()
      ]);
      setLoading(false);
    };
    loadData();
  }, []);

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading events...</span>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Event Management</h1>
            <p className="text-muted-foreground">Create and manage campus events</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Event
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Event</DialogTitle>
                <DialogDescription>
                  Fill in the details to create a new campus event
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="eventTitle">Event Title *</Label>
                    <Input 
                      id="eventTitle" 
                      placeholder="Enter event title" 
                      value={createEventData.title}
                      onChange={(e) => setCreateEventData({...createEventData, title: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="eventType">Event Type *</Label>
                    <Select value={createEventData.type} onValueChange={(value) => setCreateEventData({...createEventData, type: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Workshop">Workshop</SelectItem>
                        <SelectItem value="Seminar">Seminar</SelectItem>
                        <SelectItem value="Competition">Competition</SelectItem>
                        <SelectItem value="Hackathon">Hackathon</SelectItem>
                        <SelectItem value="Conference">Conference</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="eventDate">Date *</Label>
                    <Input 
                      id="eventDate" 
                      type="date" 
                      value={createEventData.date}
                      onChange={(e) => setCreateEventData({...createEventData, date: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="eventTime">Time</Label>
                    <Input 
                      id="eventTime" 
                      type="time"
                      value={createEventData.startTime}
                      onChange={(e) => setCreateEventData({...createEventData, startTime: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input 
                      id="location" 
                      placeholder="Venue name" 
                      value={createEventData.location}
                      onChange={(e) => setCreateEventData({...createEventData, location: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="capacity">Capacity</Label>
                    <Input 
                      id="capacity" 
                      type="number" 
                      placeholder="100" 
                      value={createEventData.capacity}
                      onChange={(e) => setCreateEventData({...createEventData, capacity: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="credits">Credits</Label>
                    <Input 
                      id="credits" 
                      type="number" 
                      placeholder="5" 
                      value={createEventData.credits}
                      onChange={(e) => setCreateEventData({...createEventData, credits: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="department">Department</Label>
                    <Select value={createEventData.department} onValueChange={(value) => setCreateEventData({...createEventData, department: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Departments</SelectItem>
                        <SelectItem value="Computer Science and Engineering">Computer Science and Engineering</SelectItem>
                        <SelectItem value="Information Technology">Information Technology</SelectItem>
                        <SelectItem value="Electronics and Communication Engineering">Electronics and Communication Engineering</SelectItem>
                        <SelectItem value="Mechanical Engineering">Mechanical Engineering</SelectItem>
                        <SelectItem value="Civil Engineering">Civil Engineering</SelectItem>
                        <SelectItem value="Electrical Engineering">Electrical Engineering</SelectItem>
                        <SelectItem value="Biotechnology">Biotechnology</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Event description and agenda..." 
                    value={createEventData.description}
                    onChange={(e) => setCreateEventData({...createEventData, description: e.target.value})}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isCreating}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateEvent} disabled={isCreating}>
                    {isCreating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Event'
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Edit Event Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Edit Event</DialogTitle>
                <DialogDescription>
                  Update the event details
                </DialogDescription>
              </DialogHeader>
              {editingEvent && (
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="editEventTitle">Event Title *</Label>
                      <Input 
                        id="editEventTitle" 
                        placeholder="Enter event title" 
                        value={editingEvent.title}
                        onChange={(e) => setEditingEvent({...editingEvent, title: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="editEventType">Event Type *</Label>
                      <Select value={editingEvent.type} onValueChange={(value) => setEditingEvent({...editingEvent, type: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Workshop">Workshop</SelectItem>
                          <SelectItem value="Seminar">Seminar</SelectItem>
                          <SelectItem value="Competition">Competition</SelectItem>
                          <SelectItem value="Hackathon">Hackathon</SelectItem>
                          <SelectItem value="Conference">Conference</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="editEventDate">Date *</Label>
                      <Input 
                        id="editEventDate" 
                        type="date" 
                        value={editingEvent.date}
                        onChange={(e) => setEditingEvent({...editingEvent, date: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="editEventTime">Time</Label>
                      <Input 
                        id="editEventTime" 
                        placeholder="10:00 AM - 4:00 PM" 
                        value={editingEvent.time}
                        onChange={(e) => setEditingEvent({...editingEvent, time: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="editLocation">Location</Label>
                      <Input 
                        id="editLocation" 
                        placeholder="Venue name" 
                        value={editingEvent.location}
                        onChange={(e) => setEditingEvent({...editingEvent, location: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="editCapacity">Capacity</Label>
                      <Input 
                        id="editCapacity" 
                        type="number" 
                        placeholder="100" 
                        value={editingEvent.capacity}
                        onChange={(e) => setEditingEvent({...editingEvent, capacity: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="editCredits">Credits</Label>
                      <Input 
                        id="editCredits" 
                        type="number" 
                        placeholder="5" 
                        value={editingEvent.credits}
                        onChange={(e) => setEditingEvent({...editingEvent, credits: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="editDepartment">Department</Label>
                      <Select value={editingEvent.department} onValueChange={(value) => setEditingEvent({...editingEvent, department: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Departments</SelectItem>
                          <SelectItem value="Computer Science and Engineering">Computer Science and Engineering</SelectItem>
                          <SelectItem value="Information Technology">Information Technology</SelectItem>
                          <SelectItem value="Electronics and Communication Engineering">Electronics and Communication Engineering</SelectItem>
                          <SelectItem value="Mechanical Engineering">Mechanical Engineering</SelectItem>
                          <SelectItem value="Civil Engineering">Civil Engineering</SelectItem>
                          <SelectItem value="Electrical Engineering">Electrical Engineering</SelectItem>
                          <SelectItem value="Biotechnology">Biotechnology</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="editDescription">Description</Label>
                    <Textarea 
                      id="editDescription" 
                      placeholder="Event description and agenda..." 
                      value={editingEvent.description}
                      onChange={(e) => setEditingEvent({...editingEvent, description: e.target.value})}
                    />
                  </div>
                  <div className="flex justify-end space-x-2">
                    <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isCreating}>
                      Cancel
                    </Button>
                    <Button onClick={handleUpdateEvent} disabled={isCreating}>
                      {isCreating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Updating...
                        </>
                      ) : (
                        'Update Event'
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </DialogContent>
          </Dialog>

          {/* QR Code Dialog */}
          <Dialog open={isQrDialogOpen} onOpenChange={setIsQrDialogOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Event QR Code</DialogTitle>
                <DialogDescription>
                  Share this QR code for easy event registration
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {selectedEventForQr && (
                  <div className="text-center space-y-4">
                    <h3 className="font-semibold">{selectedEventForQr.title}</h3>
                    <div className="flex justify-center">
                      <img src={qrCodeUrl} alt="Event QR Code" className="border rounded-lg" />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Students can scan this QR code to register for the event
                    </p>
                    <div className="flex space-x-2">
                      <Button onClick={downloadQRCode} className="flex-1">
                        <Download className="mr-2 h-4 w-4" />
                        Download QR
                      </Button>
                      <Button variant="outline" onClick={() => setIsQrDialogOpen(false)} className="flex-1">
                        Close
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          {/* View Registrations Dialog */}
          <Dialog open={isRegistrationsDialogOpen} onOpenChange={setIsRegistrationsDialogOpen}>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Event Registrations</DialogTitle>
                <DialogDescription>
                  {selectedEventRegistrations?.title} - Registered Students
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {loadingRegistrations ? (
                  <div className="flex items-center justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                    <span className="ml-2">Loading registrations...</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-muted-foreground">
                        Total Registrations: {registrations.length}
                      </p>
                      <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Export CSV
                      </Button>
                    </div>
                    
                    {registrations.length === 0 ? (
                      <div className="text-center p-8">
                        <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No Registrations Yet</h3>
                        <p className="text-muted-foreground">Students haven't registered for this event yet.</p>
                      </div>
                    ) : (
                      <div className="border rounded-lg">
                        <div className="grid grid-cols-4 gap-4 p-4 bg-muted/50 font-semibold text-sm">
                          <div>Student Name</div>
                          <div>Email</div>
                          <div>Department</div>
                          <div>Registration Date</div>
                        </div>
                        <div className="divide-y">
                          {registrations.map((registration, index) => (
                            <div key={index} className="grid grid-cols-4 gap-4 p-4 text-sm">
                              <div className="font-medium">{registration.studentName || 'N/A'}</div>
                              <div>{registration.email || 'N/A'}</div>
                              <div>{registration.department || 'N/A'}</div>
                              <div>{new Date(registration.registeredAt).toLocaleDateString()}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filter Controls */}
        <Card className="bg-gradient-card border-0 shadow-md">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    placeholder="Search events by title or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Event Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="Workshop">Workshop</SelectItem>
                    <SelectItem value="Seminar">Seminar</SelectItem>
                    <SelectItem value="Competition">Competition</SelectItem>
                    <SelectItem value="Hackathon">Hackathon</SelectItem>
                    <SelectItem value="Conference">Conference</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    <SelectItem value="Computer Science and Engineering">CSE</SelectItem>
                    <SelectItem value="Information Technology">IT</SelectItem>
                    <SelectItem value="Electronics and Communication Engineering">ECE</SelectItem>
                    <SelectItem value="Mechanical Engineering">Mechanical</SelectItem>
                    <SelectItem value="Civil Engineering">Civil</SelectItem>
                    <SelectItem value="Electrical Engineering">Electrical</SelectItem>
                    <SelectItem value="Biotechnology">Biotechnology</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" onClick={() => {
                  setSearchTerm('');
                  setFilterType('all');
                  setFilterDepartment('all');
                }}>
                  <Filter className="h-4 w-4 mr-2" />
                  Clear
                </Button>
                <Button variant="outline" onClick={() => exportEventsData([...filteredUpcomingEvents, ...filteredPastEvents], 'faculty-events.csv')}>
                  <Download className="h-4 w-4 mr-2" />
                  Export All
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upcoming">
              Upcoming Events ({filteredUpcomingEvents.length})
            </TabsTrigger>
            <TabsTrigger value="past">
              Past Events ({filteredPastEvents.length})
            </TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Upcoming Events */}
          <TabsContent value="upcoming" className="space-y-6">
            {filteredUpcomingEvents.length === 0 ? (
              <Card className="bg-gradient-card border-0 shadow-md">
                <CardContent className="p-8 text-center">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Upcoming Events</h3>
                  <p className="text-muted-foreground">Create your first event to get started!</p>
                </CardContent>
              </Card>
            ) : (
              filteredUpcomingEvents.map((event) => (
                <Card key={event._id} className="bg-gradient-card border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="flex items-center space-x-3 mb-2">
                          <span className="text-xl font-bold">{event.title}</span>
                          <Badge variant="outline" className="px-3 py-1">{event.type}</Badge>
                          <div className={`w-3 h-3 rounded-full ${getEventStatus(event).color}`} title={getEventStatus(event).text}></div>
                        </CardTitle>
                        <CardDescription className="flex items-center space-x-4 text-base">
                          <span className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(event.date)}</span>
                          </span>
                          {event.time && (
                            <span className="flex items-center space-x-1">
                              <Clock className="h-4 w-4" />
                              <span>{event.time}</span>
                            </span>
                          )}
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-primary/10 text-primary border-primary/20 px-3 py-1 text-sm font-semibold">
                          {event.credits} credits
                        </Badge>
                        <Badge className={`${getEventStatus(event).color} text-white px-3 py-1 text-xs font-medium`}>
                          {getEventStatus(event).text}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Event Details */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <MapPin className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Location</p>
                          <p className="font-medium">{event.location || 'TBD'}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Users className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Registration</p>
                          <p className="font-medium">{event.registered?.length || 0}/{event.capacity} registered</p>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    {event.description && (
                      <div className="p-4 bg-muted/50 rounded-lg">
                        <p className="text-sm">{event.description}</p>
                      </div>
                    )}

                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Registration Progress</span>
                        <span>{Math.round(((event.registered?.length || 0) / event.capacity) * 100)}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300" 
                          style={{ width: `${Math.min(((event.registered?.length || 0) / event.capacity) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex space-x-3">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => generateQRCode(event)}
                          className="flex items-center space-x-2"
                        >
                          <QrCode className="h-4 w-4" />
                          <span>Generate QR</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex items-center space-x-2"
                          onClick={() => viewRegistrations(event)}
                        >
                          <Eye className="h-4 w-4" />
                          <span>View Registrations</span>
                        </Button>
                      </div>
                      <div className="flex space-x-3">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleEditEvent(event)}
                          className="flex items-center space-x-2"
                        >
                          <Edit className="h-4 w-4" />
                          <span>Edit</span>
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          className="flex items-center space-x-2"
                          onClick={() => handleDeleteEvent(event)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Delete</span>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Past Events */}
          <TabsContent value="past" className="space-y-4">
            {filteredPastEvents.length === 0 ? (
              <Card className="bg-gradient-card border-0 shadow-md">
                <CardContent className="p-8 text-center">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Past Events Found</h3>
                  <p className="text-muted-foreground">No events match your current filters.</p>
                </CardContent>
              </Card>
            ) : (
              filteredPastEvents.map((event) => (
              <Card key={event._id || event.id} className="bg-gradient-card border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold">{event.title}</h3>
                      <p className="text-sm text-muted-foreground">{formatDate(event.date)}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm">
                        <span>{event.registered?.length || 0}/{event.capacity} attended</span>
                        <span>{event.credits} credits</span>
                        <span>Rating: {event.feedback?.length > 0 ? (event.feedback.reduce((sum, f) => sum + f.rating, 0) / event.feedback.length).toFixed(1) : 'N/A'}/5</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <BarChart3 className="mr-2 h-4 w-4" />
                        View Report
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => exportEventsData([event], `${event.title}-report.csv`)}>
                        <Download className="mr-2 h-4 w-4" />
                        Export Data
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              ))
            )}
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Event Analytics Dashboard</h2>
              <Button variant="outline" onClick={() => exportEventsData([...upcomingEvents, ...pastEvents], 'analytics-report.csv')}>
                <FileText className="mr-2 h-4 w-4" />
                Export Analytics
              </Button>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card className="bg-gradient-card border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <CalendarDays className="h-8 w-8 text-primary" />
                  </div>
                  <div className="text-3xl font-bold text-primary">{analytics.totalEvents}</div>
                  <div className="text-sm text-muted-foreground">Total Events</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-card border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Users className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="text-3xl font-bold text-green-600">{analytics.totalAttendees}</div>
                  <div className="text-sm text-muted-foreground">Total Attendees</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-card border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <Award className="h-8 w-8 text-yellow-600" />
                  </div>
                  <div className="text-3xl font-bold text-yellow-600">{analytics.avgRating}</div>
                  <div className="text-sm text-muted-foreground">Avg Rating</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-card border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="flex items-center justify-center mb-2">
                    <TrendingUp className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="text-3xl font-bold text-blue-600">{analytics.attendanceRate}</div>
                  <div className="text-sm text-muted-foreground">Attendance Rate</div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gradient-primary text-white border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Event Performance Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-white/10">
                    <h4 className="font-medium mb-2">Most Popular Event Type</h4>
                    <p className="text-sm text-white/80">Workshops have the highest attendance rate (92%)</p>
                  </div>
                  <div className="p-4 rounded-lg bg-white/10">
                    <h4 className="font-medium mb-2">Best Time Slot</h4>
                    <p className="text-sm text-white/80">10:00 AM - 2:00 PM sessions have best engagement</p>
                  </div>
                  <div className="p-4 rounded-lg bg-white/10">
                    <h4 className="font-medium mb-2">Department Participation</h4>
                    <p className="text-sm text-white/80">Computer Science leads with 35% of total registrations</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default FacultyEvents;