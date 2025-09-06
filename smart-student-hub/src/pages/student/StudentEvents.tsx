import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Calendar, MapPin, Users, Clock, Star, Search, Filter, Loader2 } from "lucide-react";
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
      const response = await fetch('http://localhost:5000/api/events');
      const events = await response.json();
      
      const now = new Date();
      const upcoming = events.filter(event => new Date(event.date) >= now);
      const past = events.filter(event => new Date(event.date) < now);
      
      setUpcomingEvents(upcoming);
      setPastEvents(past);
      
      // Filter registered events for current user
      const userRegistrations = events.filter(event => 
        event.registrations?.some(reg => reg.studentId === user?.id)
      );
      setRegisteredEvents(userRegistrations);
      
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: "Error",
        description: "Failed to load events. Please try again.",
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

  // Filter events based on search term
  const filteredUpcomingEvents = upcomingEvents.filter(event =>
    event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    event.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Events</h1>
            <p className="text-muted-foreground">Discover and participate in campus events</p>
          </div>
          <div className="flex space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search events..." 
                className="pl-10 w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4" />
            </Button>
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
            {registeredEvents.length === 0 ? (
              <Card className="bg-gradient-card border-0 shadow-lg">
                <CardContent className="p-8 text-center">
                  <h3 className="text-lg font-semibold mb-2">No registrations yet</h3>
                  <p className="text-muted-foreground">
                    You haven't registered for any events. Check out the upcoming events to get started!
                  </p>
                </CardContent>
              </Card>
            ) : (
              registeredEvents.map((event) => {
                const userRegistration = event.registrations?.find(reg => reg.studentId === user?.id);
                return (
                  <Card key={event._id} className="bg-gradient-card border-0 shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-lg font-semibold">{event.title}</h3>
                          <div className="flex items-center space-x-4 mt-2">
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">
                                {new Date(event.date).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">{event.time || "TBD"}</span>
                            </div>
                          </div>
                          {userRegistration && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Registered on {new Date(userRegistration.registeredAt).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center space-x-4">
                          <Badge className="bg-success text-success-foreground">
                            Registered
                          </Badge>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
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
            {pastEvents.length === 0 ? (
              <Card className="bg-gradient-card border-0 shadow-lg">
                <CardContent className="p-8 text-center">
                  <h3 className="text-lg font-semibold mb-2">No past events</h3>
                  <p className="text-muted-foreground">
                    Your attended events will appear here after completion.
                  </p>
                </CardContent>
              </Card>
            ) : (
              pastEvents.map((event) => {
                const userRegistration = event.registrations?.find(reg => reg.studentId === user?.id);
                return (
                  <Card key={event._id} className="bg-gradient-card border-0 shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-lg font-semibold">{event.title}</h3>
                          <div className="flex items-center space-x-4 mt-2 text-sm">
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <span className="text-muted-foreground">
                                {new Date(event.date).toLocaleDateString()}
                              </span>
                            </div>
                            {userRegistration && (
                              <Badge className="bg-success text-success-foreground">
                                Attended
                              </Badge>
                            )}
                            <Badge className="bg-primary-light text-primary">
                              {event.credits} credits
                            </Badge>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                          <Button variant="outline" size="sm">
                            Feedback
                          </Button>
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
        <Card className="bg-gradient-primary text-white border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Your Event Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold">{pastEvents.length}</div>
                <div className="text-white/80">Events Attended</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">{registeredEvents.length}</div>
                <div className="text-white/80">Upcoming</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">
                  {pastEvents.reduce((sum, event) => sum + (event.credits || 0), 0)}
                </div>
                <div className="text-white/80">Credits Earned</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">
                  {pastEvents.length > 0 ? Math.round((pastEvents.length / (pastEvents.length + registeredEvents.length)) * 100) : 0}%
                </div>
                <div className="text-white/80">Attendance Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>

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