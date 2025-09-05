import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MapPin, Users, Clock, Star, Search, Filter } from "lucide-react";

const StudentEvents = () => {
  const upcomingEvents = [
    {
      id: 1,
      title: "AI/ML Workshop Series",
      description: "Comprehensive 3-day workshop on machine learning fundamentals and practical applications",
      date: "2024-03-20",
      time: "10:00 AM - 4:00 PM",
      location: "Tech Auditorium",
      type: "Workshop",
      credits: 8,
      registered: 156,
      capacity: 200,
      difficulty: "Intermediate"
    },
    {
      id: 2,
      title: "Career Fair 2024",
      description: "Meet with top tech companies and explore internship and job opportunities",
      date: "2024-03-25",
      time: "9:00 AM - 6:00 PM",
      location: "Main Campus Ground",
      type: "Career Fair",
      credits: 5,
      registered: 300,
      capacity: 500,
      difficulty: "All Levels"
    },
    {
      id: 3,
      title: "Hackathon: Smart City Solutions",
      description: "48-hour hackathon to develop innovative solutions for smart city challenges",
      date: "2024-04-01",
      time: "6:00 PM (Day 1) - 6:00 PM (Day 3)",
      location: "Innovation Lab",
      type: "Competition",
      credits: 15,
      registered: 89,
      capacity: 120,
      difficulty: "Advanced"
    }
  ];

  const registeredEvents = [
    {
      id: 1,
      title: "Blockchain Fundamentals",
      date: "2024-03-18",
      status: "confirmed",
      qrCode: "QR123456"
    },
    {
      id: 2,
      title: "Leadership Summit 2024",
      date: "2024-03-22",
      status: "waitlisted",
      qrCode: null
    }
  ];

  const pastEvents = [
    {
      id: 1,
      title: "Web Development Bootcamp",
      date: "2024-02-15",
      attendance: "present",
      credits: 6,
      certificate: "CERT_WDB_2024_001"
    },
    {
      id: 2,
      title: "Cybersecurity Awareness",
      date: "2024-02-08",
      attendance: "present",
      credits: 4,
      certificate: "CERT_CSA_2024_002"
    }
  ];

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
              <Input placeholder="Search events..." className="pl-10 w-64" />
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
            {upcomingEvents.map((event) => (
              <Card key={event.id} className="bg-gradient-card border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-semibold">{event.title}</h3>
                        <Badge variant="outline">{event.type}</Badge>
                        <Badge className={getDifficultyColor(event.difficulty)}>
                          {event.difficulty}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-4">{event.description}</p>
                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-primary" />
                          <span>{event.date}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-primary" />
                          <span>{event.time}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-primary" />
                          <span>{event.location}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-primary" />
                          <span>{event.registered}/{event.capacity} registered</span>
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
                      <Button>Register Now</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Registered Events */}
          <TabsContent value="registered" className="space-y-4">
            {registeredEvents.map((event) => (
              <Card key={event.id} className="bg-gradient-card border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold">{event.title}</h3>
                      <div className="flex items-center space-x-2 mt-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{event.date}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Badge 
                        className={event.status === "confirmed" ? "bg-success text-success-foreground" : "bg-warning text-warning-foreground"}
                      >
                        {event.status}
                      </Badge>
                      {event.qrCode && (
                        <Button variant="outline" size="sm">
                          Show QR Code
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        Cancel Registration
                      </Button>
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
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold">{event.title}</h3>
                      <div className="flex items-center space-x-4 mt-2 text-sm">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">{event.date}</span>
                        </div>
                        <Badge className="bg-success text-success-foreground">
                          {event.attendance}
                        </Badge>
                        <Badge className="bg-primary-light text-primary">
                          {event.credits} credits earned
                        </Badge>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        View Certificate
                      </Button>
                      <Button variant="outline" size="sm">
                        Download
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
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
                <div className="text-3xl font-bold">12</div>
                <div className="text-white/80">Events Attended</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">3</div>
                <div className="text-white/80">Upcoming</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">48</div>
                <div className="text-white/80">Credits Earned</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">95%</div>
                <div className="text-white/80">Attendance Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default StudentEvents;