import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Calendar, MapPin, Users, Clock, Star, Search, Filter, Loader2, Award, TrendingUp, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

const StudentEvents = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isRegistrationDialogOpen, setIsRegistrationDialogOpen] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [sortBy, setSortBy] = useState("date");

  // Registration form data
  const [registrationData, setRegistrationData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    department: user?.department || "",
    year: "",
    phone: ""
  });

  // Fetch events from API
  const fetchEvents = async () => {
    try {
      setLoading(true);
      console.log('Student: Fetching events from API...');
      const response = await fetch('http://localhost:5000/api/events');
      console.log('Student: Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const events = await response.json();
      console.log('Student: Events received:', events.length, events);
      
      const now = new Date();
      const upcoming = events.filter(event => new Date(event.date) >= now);
      const past = events.filter(event => new Date(event.date) < now);
      
      console.log('Student: Upcoming events:', upcoming.length);
      console.log('Student: Past events:', past.length);
      
      setUpcomingEvents(upcoming);
      setPastEvents(past);
      
      // Filter registered events for current user (both upcoming and past)
      const userRegistrations = events.filter(event => 
        event.registrations?.some(reg => reg.studentId === user?.id)
      );
      setRegisteredEvents(userRegistrations);
      console.log('Student: User registrations:', userRegistrations.length);
      
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: "Error",
        description: `Failed to load events: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Register for event
  const handleRegister = async (eventId) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to register for events.",
        variant: "destructive"
      });
      return;
    }

    try {
      setRegistering(true);
      const response = await fetch(`http://localhost:5000/api/events/${eventId}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          studentId: user.id,
          name: registrationData.name,
          email: registrationData.email,
          department: registrationData.department,
          year: registrationData.year,
          phone: registrationData.phone
        })
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Registration Successful",
          description: `You have been registered for ${result.event.title}`,
        });
        setIsRegistrationDialogOpen(false);
        fetchEvents(); // Refresh events
      } else {
        toast({
          title: "Registration Failed",
          description: result.error || "Failed to register for event",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error registering for event:', error);
      toast({
        title: "Error",
        description: "Failed to register for event. Please try again.",
        variant: "destructive"
      });
    } finally {
      setRegistering(false);
    }
  };

  // Open registration dialog
  const openRegistrationDialog = (event) => {
    setSelectedEvent(event);
    setIsRegistrationDialogOpen(true);
  };

  // Advanced filtering and sorting function
  const filterAndSortEvents = (events) => {
    let filtered = events.filter(event => {
      const matchesSearch = searchTerm === "" || 
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.type.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = filterType === "all" || event.type === filterType;
      const matchesDepartment = filterDepartment === "all" || 
        event.department === filterDepartment || 
        event.department === "all";
      
      return matchesSearch && matchesType && matchesDepartment;
    });

    // Sort events
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date":
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case "title":
          return a.title.localeCompare(b.title);
        case "credits":
          return (b.credits || 0) - (a.credits || 0);
        case "capacity":
          return (b.capacity - (b.registrations?.length || 0)) - (a.capacity - (a.registrations?.length || 0));
        default:
          return 0;
      }
    });

    return filtered;
  };

  const filteredUpcomingEvents = filterAndSortEvents(upcomingEvents);
  const filteredRegisteredEvents = filterAndSortEvents(registeredEvents);
  const filteredPastEvents = filterAndSortEvents(pastEvents);

  useEffect(() => {
    fetchEvents();
  }, [user]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner": return "bg-success text-success-foreground";
      case "Intermediate": return "bg-warning text-warning-foreground";
      case "Advanced": return "bg-destructive text-destructive-foreground";
      default: return "bg-secondary text-secondary-foreground";
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Campus Events
            </h1>
            <p className="text-muted-foreground">Discover, register, and participate in exciting campus events</p>
          </div>
          
          {/* Search and Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search events..." 
                className="pl-10 w-full sm:w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-40">
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
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="Computer Science and Engineering">CSE</SelectItem>
                <SelectItem value="Information Technology">IT</SelectItem>
                <SelectItem value="Electronics and Communication Engineering">ECE</SelectItem>
                <SelectItem value="Mechanical Engineering">ME</SelectItem>
                <SelectItem value="Civil Engineering">CE</SelectItem>
                <SelectItem value="Electrical Engineering">EEE</SelectItem>
                <SelectItem value="Biotechnology">BT</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="credits">Credits</SelectItem>
                <SelectItem value="capacity">Availability</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upcoming">Upcoming Events</TabsTrigger>
            <TabsTrigger value="registered">My Registrations</TabsTrigger>
            <TabsTrigger value="past">Past Events</TabsTrigger>
          </TabsList>

          {/* Upcoming Events */}
          <TabsContent value="upcoming" className="space-y-4">
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
                <span className="ml-2">Loading events...</span>
              </div>
            ) : filteredUpcomingEvents.length === 0 ? (
              <Card className="bg-gradient-card border-0 shadow-lg">
                <CardContent className="p-8 text-center">
                  <h3 className="text-lg font-semibold mb-2">No events found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm ? "No events match your search criteria." : "No upcoming events available at the moment."}
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredUpcomingEvents.map((event) => {
                const isRegistered = event.registrations?.some(reg => reg.studentId === user?.id);
                const registrationCount = event.registrations?.length || 0;
                
                return (
                  <Card key={event._id} className="bg-gradient-card border-0 shadow-lg hover:shadow-xl transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-xl font-semibold">{event.title}</h3>
                            <Badge variant="outline">{event.type}</Badge>
                            <Badge className="bg-primary text-primary-foreground">
                              {event.status}
                            </Badge>
                          </div>
                          <p className="text-muted-foreground mb-4">{event.description}</p>
                          <div className="grid md:grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4 text-primary" />
                              <span>{new Date(event.date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4 text-primary" />
                              <span>{event.time || "TBD"}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-4 w-4 text-primary" />
                              <span>{event.location || "TBD"}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Users className="h-4 w-4 text-primary" />
                              <span>{registrationCount}/{event.capacity} registered</span>
                            </div>
                          </div>
                          <div className="mt-4">
                            <Badge className="bg-primary-light text-primary">
                              <Star className="w-3 h-3 mr-1" />
                              {event.credits} credits
                            </Badge>
                          </div>
                        </div>
                        <div className="ml-6">
                          {isRegistered ? (
                            <Badge className="bg-success text-success-foreground">
                              Registered
                            </Badge>
                          ) : registrationCount >= event.capacity ? (
                            <Badge className="bg-destructive text-destructive-foreground">
                              Full
                            </Badge>
                          ) : (
                            <Button onClick={() => openRegistrationDialog(event)}>
                              Register Now
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>

          {/* Registered Events */}
          <TabsContent value="registered" className="space-y-4">
            {filteredRegisteredEvents.length === 0 ? (
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-900 border-0 shadow-lg">
                <CardContent className="p-8 text-center">
                  <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-blue-500" />
                  <h3 className="text-lg font-semibold mb-2">No registrations found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm || filterType !== "all" || filterDepartment !== "all" 
                      ? "No registered events match your current filters." 
                      : "You haven't registered for any events yet. Check out the upcoming events to get started!"
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredRegisteredEvents.map((event) => {
                const userRegistration = event.registrations?.find(reg => reg.studentId === user?.id);
                const isUpcoming = new Date(event.date) >= new Date();
                return (
                  <Card key={event._id} className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-l-4 border-l-green-500 shadow-lg hover:shadow-xl transition-all">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-semibold">{event.title}</h3>
                            <Badge variant="outline">{event.type}</Badge>
                            {isUpcoming ? (
                              <Badge className="bg-blue-500 text-white">Upcoming</Badge>
                            ) : (
                              <Badge className="bg-gray-500 text-white">Completed</Badge>
                            )}
                          </div>
                          <p className="text-muted-foreground mb-3">{event.description}</p>
                          <div className="grid md:grid-cols-2 gap-3 text-sm">
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4 text-green-600" />
                              <span>{new Date(event.date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4 text-green-600" />
                              <span>{event.time || "TBD"}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-4 w-4 text-green-600" />
                              <span>{event.location || "TBD"}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Award className="h-4 w-4 text-green-600" />
                              <span>{event.credits} credits</span>
                            </div>
                          </div>
                          {userRegistration && (
                            <p className="text-xs text-green-600 mt-2 font-medium">
                              Registered on {new Date(userRegistration.registeredAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge className="bg-green-500 text-white">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Registered
                          </Badge>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                          {!isUpcoming && (
                            <Button variant="outline" size="sm" className="text-blue-600 border-blue-200">
                              Add Feedback
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>

          {/* Past Events */}
          <TabsContent value="past" className="space-y-4">
            {filteredPastEvents.length === 0 ? (
              <Card className="bg-gradient-to-br from-purple-50 to-pink-100 dark:from-purple-950 dark:to-pink-900 border-0 shadow-lg">
                <CardContent className="p-8 text-center">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 text-purple-500" />
                  <h3 className="text-lg font-semibold mb-2">No past events found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm || filterType !== "all" || filterDepartment !== "all" 
                      ? "No past events match your current filters." 
                      : "Your completed events will appear here after participation."
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              filteredPastEvents.map((event) => {
                const userRegistration = event.registrations?.find(reg => reg.studentId === user?.id);
                const wasAttended = !!userRegistration;
                return (
                  <Card key={event._id} className={`border-0 shadow-lg hover:shadow-xl transition-all ${
                    wasAttended 
                      ? "bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950 dark:to-indigo-950 border-l-4 border-l-purple-500" 
                      : "bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-950 dark:to-slate-950 border-l-4 border-l-gray-400"
                  }`}>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-semibold">{event.title}</h3>
                            <Badge variant="outline">{event.type}</Badge>
                            <Badge className="bg-gray-500 text-white">Completed</Badge>
                            {wasAttended && (
                              <Badge className="bg-purple-500 text-white">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Attended
                              </Badge>
                            )}
                          </div>
                          <p className="text-muted-foreground mb-3">{event.description}</p>
                          <div className="grid md:grid-cols-3 gap-3 text-sm">
                            <div className="flex items-center space-x-2">
                              <Calendar className={`h-4 w-4 ${wasAttended ? 'text-purple-600' : 'text-gray-500'}`} />
                              <span>{new Date(event.date).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <MapPin className={`h-4 w-4 ${wasAttended ? 'text-purple-600' : 'text-gray-500'}`} />
                              <span>{event.location || "TBD"}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Award className={`h-4 w-4 ${wasAttended ? 'text-purple-600' : 'text-gray-500'}`} />
                              <span>{event.credits} credits {wasAttended ? '(Earned)' : ''}</span>
                            </div>
                          </div>
                          {userRegistration && (
                            <p className="text-xs text-purple-600 mt-2 font-medium">
                              Participated on {new Date(event.date).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center space-x-3">
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                          {wasAttended && (
                            <Button variant="outline" size="sm" className="text-purple-600 border-purple-200">
                              Add Feedback
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>
        </Tabs>

        {/* Event Statistics */}
        <Card className="bg-gradient-to-r from-primary via-blue-600 to-purple-600 text-white border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Your Event Journey
            </CardTitle>
            <CardDescription className="text-white/80">
              Track your participation and achievements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-white/10 rounded-lg backdrop-blur-sm">
                <div className="text-3xl font-bold mb-1">
                  {pastEvents.filter(event => event.registrations?.some(reg => reg.studentId === user?.id)).length}
                </div>
                <div className="text-white/90 text-sm">Events Attended</div>
              </div>
              <div className="text-center p-4 bg-white/10 rounded-lg backdrop-blur-sm">
                <div className="text-3xl font-bold mb-1">
                  {registeredEvents.filter(event => new Date(event.date) >= new Date()).length}
                </div>
                <div className="text-white/90 text-sm">Upcoming Events</div>
              </div>
              <div className="text-center p-4 bg-white/10 rounded-lg backdrop-blur-sm">
                <div className="text-3xl font-bold mb-1">
                  {pastEvents
                    .filter(event => event.registrations?.some(reg => reg.studentId === user?.id))
                    .reduce((sum, event) => sum + (event.credits || 0), 0)}
                </div>
                <div className="text-white/90 text-sm">Credits Earned</div>
              </div>
              <div className="text-center p-4 bg-white/10 rounded-lg backdrop-blur-sm">
                <div className="text-3xl font-bold mb-1">
                  {registeredEvents.length > 0 
                    ? Math.round((pastEvents.filter(event => event.registrations?.some(reg => reg.studentId === user?.id)).length / registeredEvents.length) * 100)
                    : 0}%
                </div>
                <div className="text-white/90 text-sm">Completion Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <footer className="mt-12 py-8 border-t bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
          <div className="max-w-7xl mx-auto px-4">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <h3 className="font-semibold text-lg mb-3 text-primary">Quick Links</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><a href="#" className="hover:text-primary transition-colors">Event Guidelines</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Registration Help</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Event Calendar</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Contact Support</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-3 text-primary">Event Categories</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><a href="#" className="hover:text-primary transition-colors">Technical Workshops</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Coding Competitions</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Industry Seminars</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Hackathons</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-3 text-primary">Resources</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li><a href="#" className="hover:text-primary transition-colors">Event Archive</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Certificates</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Feedback Forms</a></li>
                  <li><a href="#" className="hover:text-primary transition-colors">Event Photos</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-3 text-primary">Stay Connected</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Get notified about upcoming events and opportunities
                </p>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" className="text-xs">
                    Email Alerts
                  </Button>
                  <Button size="sm" variant="outline" className="text-xs">
                    SMS Updates
                  </Button>
                </div>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t text-center text-sm text-muted-foreground">
              <p>&copy; 2024 Smart Student Hub. All rights reserved. | 
                <a href="#" className="hover:text-primary ml-1">Privacy Policy</a> | 
                <a href="#" className="hover:text-primary ml-1">Terms of Service</a>
              </p>
            </div>
          </div>
        </footer>

        {/* Registration Dialog */}
        <Dialog open={isRegistrationDialogOpen} onOpenChange={setIsRegistrationDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Register for Event</DialogTitle>
              <DialogDescription>
                {selectedEvent && `Register for "${selectedEvent.title}"`}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={registrationData.name}
                  onChange={(e) => setRegistrationData({...registrationData, name: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={registrationData.email}
                  onChange={(e) => setRegistrationData({...registrationData, email: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="department" className="text-right">
                  Department
                </Label>
                <Input
                  id="department"
                  value={registrationData.department}
                  onChange={(e) => setRegistrationData({...registrationData, department: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="year" className="text-right">
                  Year
                </Label>
                <Input
                  id="year"
                  value={registrationData.year}
                  onChange={(e) => setRegistrationData({...registrationData, year: e.target.value})}
                  className="col-span-3"
                  placeholder="e.g., 2nd Year, Final Year"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="phone" className="text-right">
                  Phone
                </Label>
                <Input
                  id="phone"
                  value={registrationData.phone}
                  onChange={(e) => setRegistrationData({...registrationData, phone: e.target.value})}
                  className="col-span-3"
                  placeholder="Optional"
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                type="submit" 
                onClick={() => selectedEvent && handleRegister(selectedEvent._id)}
                disabled={registering || !registrationData.name || !registrationData.email || !registrationData.department || !registrationData.year}
              >
                {registering ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Registering...
                  </>
                ) : (
                  "Register"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default StudentEvents;