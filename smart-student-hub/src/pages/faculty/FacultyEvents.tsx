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
import { Calendar, Plus, Users, MapPin, Clock, QrCode, BarChart3 } from "lucide-react";

const FacultyEvents = () => {
  const upcomingEvents = [
    {
      id: 1,
      title: "AI/ML Workshop Series",
      date: "2024-03-20",
      time: "10:00 AM - 4:00 PM",
      location: "Tech Auditorium",
      type: "Workshop",
      capacity: 200,
      registered: 156,
      credits: 8,
      status: "active"
    },
    {
      id: 2,
      title: "Cybersecurity Seminar",
      date: "2024-03-28",
      time: "2:00 PM - 5:00 PM",
      location: "Conference Hall A",
      type: "Seminar",
      capacity: 150,
      registered: 89,
      credits: 5,
      status: "active"
    }
  ];

  const pastEvents = [
    {
      id: 3,
      title: "Web Development Bootcamp",
      date: "2024-02-15",
      attendees: 78,
      capacity: 100,
      credits: 6,
      feedback: 4.8
    }
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Event Management</h1>
            <p className="text-muted-foreground">Create and manage campus events</p>
          </div>
          <Dialog>
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
                    <Label htmlFor="eventTitle">Event Title</Label>
                    <Input id="eventTitle" placeholder="Enter event title" />
                  </div>
                  <div>
                    <Label htmlFor="eventType">Event Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="workshop">Workshop</SelectItem>
                        <SelectItem value="seminar">Seminar</SelectItem>
                        <SelectItem value="competition">Competition</SelectItem>
                        <SelectItem value="hackathon">Hackathon</SelectItem>
                        <SelectItem value="conference">Conference</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="eventDate">Date</Label>
                    <Input id="eventDate" type="date" />
                  </div>
                  <div>
                    <Label htmlFor="eventTime">Time</Label>
                    <Input id="eventTime" placeholder="10:00 AM - 4:00 PM" />
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" placeholder="Venue name" />
                  </div>
                  <div>
                    <Label htmlFor="capacity">Capacity</Label>
                    <Input id="capacity" type="number" placeholder="100" />
                  </div>
                  <div>
                    <Label htmlFor="credits">Credits</Label>
                    <Input id="credits" type="number" placeholder="5" />
                  </div>
                  <div>
                    <Label htmlFor="department">Department</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Departments</SelectItem>
                        <SelectItem value="cse">Computer Science</SelectItem>
                        <SelectItem value="ece">Electronics</SelectItem>
                        <SelectItem value="mech">Mechanical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" placeholder="Event description and agenda..." />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline">Cancel</Button>
                  <Button>Create Event</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Tabs defaultValue="upcoming" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upcoming">Upcoming Events</TabsTrigger>
            <TabsTrigger value="past">Past Events</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          {/* Upcoming Events */}
          <TabsContent value="upcoming" className="space-y-4">
            {upcomingEvents.map((event) => (
              <Card key={event.id} className="bg-gradient-card border-0 shadow-lg">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center space-x-3">
                        <span>{event.title}</span>
                        <Badge variant="outline">{event.type}</Badge>
                      </CardTitle>
                      <CardDescription>{event.date} • {event.time}</CardDescription>
                    </div>
                    <Badge className="bg-primary-light text-primary">
                      {event.credits} credits
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center space-x-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{event.location}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{event.registered}/{event.capacity} registered</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <QrCode className="mr-2 h-4 w-4" />
                        Generate QR
                      </Button>
                      <Button variant="outline" size="sm">
                        <Users className="mr-2 h-4 w-4" />
                        View Registrations
                      </Button>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">Edit</Button>
                      <Button size="sm">Manage</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Past Events */}
          <TabsContent value="past" className="space-y-4">
            {pastEvents.map((event) => (
              <Card key={event.id} className="bg-gradient-card border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold">{event.title}</h3>
                      <p className="text-sm text-muted-foreground">{event.date}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm">
                        <span>{event.attendees}/{event.capacity} attended</span>
                        <span>{event.credits} credits</span>
                        <span>Rating: {event.feedback}/5</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <BarChart3 className="mr-2 h-4 w-4" />
                        View Report
                      </Button>
                      <Button variant="outline" size="sm">
                        Export Data
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card className="bg-gradient-card border-0 shadow-md">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold">24</div>
                  <div className="text-sm text-muted-foreground">Total Events</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-card border-0 shadow-md">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold">1,250</div>
                  <div className="text-sm text-muted-foreground">Total Attendees</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-card border-0 shadow-md">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold">4.6</div>
                  <div className="text-sm text-muted-foreground">Avg Rating</div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-card border-0 shadow-md">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold">87%</div>
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