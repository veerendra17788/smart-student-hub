import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";
import { 
  Trophy, 
  Calendar, 
  FileText, 
  TrendingUp, 
  Award,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus
} from "lucide-react";

const StudentDashboard = () => {
  const stats = [
    { title: "Total Activities", value: "24", icon: Trophy, color: "text-primary" },
    { title: "Approved", value: "18", icon: CheckCircle, color: "text-success" },
    { title: "Pending", value: "4", icon: Clock, color: "text-warning" },
    { title: "Credits Earned", value: "156", icon: Award, color: "text-secondary" },
  ];

  const recentActivities = [
    {
      title: "Hackathon Winner - TechFest 2024",
      status: "approved",
      date: "2024-03-15",
      credits: 15
    },
    {
      title: "AWS Cloud Practitioner Certification",
      status: "pending",
      date: "2024-03-10",
      credits: 10
    },
    {
      title: "Internship at Microsoft",
      status: "approved",
      date: "2024-02-28",
      credits: 25
    }
  ];

  const upcomingEvents = [
    {
      title: "AI/ML Workshop",
      date: "2024-03-20",
      type: "Workshop"
    },
    {
      title: "Career Fair 2024",
      date: "2024-03-25",
      type: "Event"
    }
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back! Here's your activity overview.</p>
          </div>
          <Button asChild>
            <Link to="/student/activities">
              <Plus className="mr-2 h-4 w-4" />
              Add Activity
            </Link>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <Card key={stat.title} className="bg-gradient-card border-0 shadow-md">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Activities */}
          <div className="lg:col-span-2">
            <Card className="bg-gradient-card border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Trophy className="mr-2 h-5 w-5" />
                  Recent Activities
                </CardTitle>
                <CardDescription>Your latest submitted activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-white/50 border">
                      <div className="flex-1">
                        <h4 className="font-medium">{activity.title}</h4>
                        <p className="text-sm text-muted-foreground">{activity.date}</p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <Badge className="bg-primary-light text-primary">
                          {activity.credits} credits
                        </Badge>
                        <Badge 
                          variant={activity.status === "approved" ? "default" : "secondary"}
                          className={activity.status === "approved" ? "bg-success text-success-foreground" : ""}
                        >
                          {activity.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <Button variant="outline" asChild className="w-full">
                    <Link to="/student/activities">View All Activities</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Cards */}
          <div className="space-y-6">
            {/* Progress Card */}
            <Card className="bg-gradient-card border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  This Semester
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Credits Progress</span>
                      <span>78/100</span>
                    </div>
                    <Progress value={78} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Events Attended</span>
                      <span>12/15</span>
                    </div>
                    <Progress value={80} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card className="bg-gradient-card border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="mr-2 h-5 w-5" />
                  Upcoming Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {upcomingEvents.map((event, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-white/50 border">
                      <div>
                        <h5 className="font-medium text-sm">{event.title}</h5>
                        <p className="text-xs text-muted-foreground">{event.date}</p>
                      </div>
                      <Badge variant="outline">{event.type}</Badge>
                    </div>
                  ))}
                </div>
                <Button variant="outline" asChild className="w-full mt-4">
                  <Link to="/student/events">View All Events</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-gradient-primary text-white border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="secondary" asChild className="w-full">
                  <Link to="/student/portfolio">
                    <FileText className="mr-2 h-4 w-4" />
                    Generate Portfolio
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full border-white/30 text-white hover:bg-white/10">
                  <Link to="/student/recommendations">
                    <AlertCircle className="mr-2 h-4 w-4" />
                    View Recommendations
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default StudentDashboard;