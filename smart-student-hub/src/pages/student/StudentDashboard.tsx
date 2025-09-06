import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Trophy, 
  Calendar, 
  FileText, 
  TrendingUp, 
  Award,
  Clock,
  CheckCircle,
  AlertCircle,
  Plus,
  Loader2
} from "lucide-react";

const StudentDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch dashboard data from API
  const fetchDashboardData = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5000/api/dashboard/student/${user.id}`);
      const data = await response.json();
      
      if (response.ok) {
        setDashboardData(data);
      } else {
        throw new Error(data.error || 'Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  // Create stats array from fetched data
  const stats = dashboardData ? [
    { 
      title: "Total Activities", 
      value: dashboardData.stats.totalActivities.toString(), 
      icon: Trophy, 
      color: "text-primary" 
    },
    { 
      title: "Approved", 
      value: dashboardData.stats.approvedActivities.toString(), 
      icon: CheckCircle, 
      color: "text-success" 
    },
    { 
      title: "Pending", 
      value: dashboardData.stats.pendingActivities.toString(), 
      icon: Clock, 
      color: "text-warning" 
    },
    { 
      title: "Credits Earned", 
      value: dashboardData.stats.totalCredits.toString(), 
      icon: Award, 
      color: "text-secondary" 
    },
  ] : [];

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-success text-success-foreground';
      case 'pending':
        return 'bg-warning text-warning-foreground';
      case 'rejected':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

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
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className="bg-gradient-card border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                      <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            stats.map((stat) => (
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
            ))
          )}
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
                {loading ? (
                  <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className="flex items-center justify-between p-4 rounded-lg bg-white/50 border">
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded animate-pulse w-24"></div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="h-6 bg-gray-200 rounded animate-pulse w-16"></div>
                          <div className="h-6 bg-gray-200 rounded animate-pulse w-16"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : dashboardData?.recentActivities?.length > 0 ? (
                  <div className="space-y-4">
                    {dashboardData.recentActivities.map((activity, index) => (
                      <div key={activity.id || index} className="flex items-center justify-between p-4 rounded-lg bg-white/50 border">
                        <div className="flex-1">
                          <h4 className="font-medium">{activity.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            {new Date(activity.date).toLocaleDateString()}
                          </p>
                          {activity.category && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {activity.category}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center space-x-4">
                          <Badge className="bg-primary-light text-primary">
                            {activity.credits || 0} credits
                          </Badge>
                          <Badge className={getStatusBadgeClass(activity.status)}>
                            {activity.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No activities yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start by adding your first activity to track your progress.
                    </p>
                    <Button asChild>
                      <Link to="/student/activities">Add Activity</Link>
                    </Button>
                  </div>
                )}
                {dashboardData?.recentActivities?.length > 0 && (
                  <div className="mt-4">
                    <Button variant="outline" asChild className="w-full">
                      <Link to="/student/activities">View All Activities</Link>
                    </Button>
                  </div>
                )}
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
                {loading ? (
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                      </div>
                      <div className="h-2 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-16"></div>
                      </div>
                      <div className="h-2 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Credits Progress</span>
                        <span>
                          {dashboardData?.progress?.credits?.current || 0}/
                          {dashboardData?.progress?.credits?.target || 100}
                        </span>
                      </div>
                      <Progress 
                        value={dashboardData?.progress?.credits?.percentage || 0} 
                        className="h-2" 
                      />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Events Attended</span>
                        <span>
                          {dashboardData?.progress?.events?.attended || 0}/
                          {dashboardData?.progress?.events?.registered || 0}
                        </span>
                      </div>
                      <Progress 
                        value={dashboardData?.progress?.events?.percentage || 0} 
                        className="h-2" 
                      />
                    </div>
                  </div>
                )}
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
                {loading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 2 }).map((_, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-white/50 border">
                        <div>
                          <div className="h-4 bg-gray-200 rounded animate-pulse mb-1"></div>
                          <div className="h-3 bg-gray-200 rounded animate-pulse w-20"></div>
                        </div>
                        <div className="h-6 bg-gray-200 rounded animate-pulse w-16"></div>
                      </div>
                    ))}
                  </div>
                ) : dashboardData?.upcomingEvents?.length > 0 ? (
                  <div className="space-y-3">
                    {dashboardData.upcomingEvents.map((event, index) => (
                      <div key={event.id || index} className="flex items-center justify-between p-3 rounded-lg bg-white/50 border">
                        <div>
                          <h5 className="font-medium text-sm">{event.title}</h5>
                          <p className="text-xs text-muted-foreground">
                            {new Date(event.date).toLocaleDateString()}
                          </p>
                          {event.time && (
                            <p className="text-xs text-muted-foreground">
                              {event.time}
                            </p>
                          )}
                        </div>
                        <Badge variant="outline">{event.type}</Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      No upcoming events registered
                    </p>
                  </div>
                )}
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